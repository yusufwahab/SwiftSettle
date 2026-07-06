const bcrypt = require("bcryptjs");
const supabase = require("../config/database");
const twilioService = require("../services/twilioService");
const nombaService = require("../services/nombaService");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { generateOtpCode } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

const OTP_TTL_MS = 5 * 60 * 1000;

async function findOrCreateWorkerByPhone(phoneNumber) {
  const { data: existing } = await supabase
    .from("workers")
    .select("*")
    .eq("phone_number", phoneNumber)
    .maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("workers")
    .insert({ phone_number: phoneNumber })
    .select()
    .single();
  if (error) throw error;
  return created;
}

// POST /auth/signup
async function signup(req, res, next) {
  try {
    const { phone_number: phoneNumber } = req.body;
    await findOrCreateWorkerByPhone(phoneNumber);

    const code = generateOtpCode();
    const codeHash = await bcrypt.hash(code, 10);

    const { error } = await supabase.from("otp_codes").insert({
      phone_number: phoneNumber,
      code: codeHash,
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    if (error) throw error;

    await twilioService.sendOtpSms(phoneNumber, code);

    res.json({ otp_sent: true, retry_in: 60 });
  } catch (err) {
    next(err);
  }
}

async function issueSession(workerId) {
  const token = signAccessToken(workerId);
  const refreshToken = signRefreshToken(workerId);

  const { error } = await supabase.from("refresh_tokens").insert({
    worker_id: workerId,
    token: refreshToken,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) throw error;

  return { token, refreshToken };
}

// POST /auth/verify-otp
async function verifyOtp(req, res, next) {
  try {
    const { phone_number: phoneNumber, otp_code: otpCode } = req.body;

    const { data: candidates, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone_number", phoneNumber)
      .is("consumed_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    const record = candidates?.[0];
    const matches = record && (await bcrypt.compare(otpCode, record.code));
    if (!matches) {
      throw new ApiError(401, "invalid_otp", "That code is incorrect or has expired.");
    }

    await supabase.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", record.id);

    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .update({ phone_verified: true, last_login: new Date().toISOString() })
      .eq("phone_number", phoneNumber)
      .select()
      .single();
    if (workerError) throw workerError;

    const { token, refreshToken } = await issueSession(worker.id);

    res.json({ token, refresh_token: refreshToken, worker_id: worker.id });
  } catch (err) {
    next(err);
  }
}

// Applies one onboarding step's data to a worker row. Shared by both
// POST /auth/verify-phone-update (step-by-step) and
// POST /auth/complete-signup (everything at once).
async function applyOnboardingStep(worker, step, data) {
  const updates = { onboarding_step: Math.max(worker.onboarding_step, step) };

  if (step === 3) {
    Object.assign(updates, {
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      state: data.state,
      platform: data.platform,
    });
  }

  if (step === 4) {
    Object.assign(updates, {
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_holder_name: data.account_holder_name,
      bank_verified: true,
    });

    if (!worker.nomba_virtual_account_id) {
      const va = await nombaService.createVirtualAccount({ ...worker, full_name: data.full_name || worker.full_name });
      updates.nomba_virtual_account_id = va.accountRef;
      await supabase.from("virtual_accounts").insert({
        worker_id: worker.id,
        nomba_account_id: va.accountRef,
        account_name: va.accountName,
        bank_code: va.bankName,
        bank_account_number: va.bankAccountNumber,
      });
    }
  }

  if (step === 5) {
    Object.assign(updates, {
      platform_connected: true,
      platform_access_token: data.platform_access_token || null,
    });
  }

  if (step === 6) {
    if (data.pin) updates.pin_hash = await bcrypt.hash(data.pin, 10);
    if (typeof data.two_factor_enabled === "boolean") updates.two_factor_enabled = data.two_factor_enabled;
  }

  if (step === 7) {
    Object.assign(updates, {
      data_sharing_consent: Boolean(data.data_sharing_consent),
      terms_accepted: Boolean(data.terms_accepted),
    });
  }

  if (step === 8) {
    updates.onboarding_completed_at = new Date().toISOString();
  }

  const { data: updatedWorker, error } = await supabase
    .from("workers")
    .update(updates)
    .eq("id", worker.id)
    .select()
    .single();
  if (error) throw error;
  return updatedWorker;
}

// POST /auth/verify-phone-update  (onboarding step submission)
// Named per BackendPrompt.md; despite the name, this handles every step
// (2-8) of the onboarding wizard, not just phone verification (step 2 is
// covered separately by verify-otp).
async function submitOnboardingStep(req, res, next) {
  try {
    const { step, data } = req.body;
    const updatedWorker = await applyOnboardingStep(req.worker, step, data || {});
    res.json({ success: true, next_step: Math.min(8, step + 1), worker: sanitizeWorker(updatedWorker) });
  } catch (err) {
    next(err);
  }
}

// POST /auth/complete-signup — one-shot alternative to stepping through
// verify-phone-update 3-8 individually.
async function completeSignup(req, res, next) {
  try {
    let worker = req.worker;
    for (const step of [3, 4, 5, 6, 7, 8]) {
      worker = await applyOnboardingStep(worker, step, req.body);
    }
    res.json({ token: signAccessToken(worker.id), worker_id: worker.id, onboarding_complete: true });
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh-token
async function refreshToken(req, res, next) {
  try {
    const { refresh_token: token } = req.body;
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
    }

    const { data: record } = await supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token", token)
      .is("revoked_at", null)
      .maybeSingle();
    if (!record) {
      throw new ApiError(401, "invalid_refresh_token", "Refresh token has been revoked.");
    }

    res.json({ token: signAccessToken(payload.sub) });
  } catch (err) {
    next(err);
  }
}

// POST /auth/logout
async function logout(req, res, next) {
  try {
    const { refresh_token: token } = req.body;
    await supabase.from("refresh_tokens").update({ revoked_at: new Date().toISOString() }).eq("token", token);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /auth/me — not in BackendPrompt.md's endpoint list, added because
// nothing else returns the logged-in worker's own profile (name, email,
// bank details, financial_score, ...), which the frontend needs to render
// the sidebar, settings page, and dashboard header at all.
async function getMe(req, res, next) {
  try {
    res.json({ worker: sanitizeWorker(req.worker) });
  } catch (err) {
    next(err);
  }
}

function sanitizeWorker(worker) {
  // eslint-disable-next-line no-unused-vars
  const { pin_hash, platform_access_token, ...safe } = worker;
  return safe;
}

module.exports = {
  signup,
  verifyOtp,
  submitOnboardingStep,
  completeSignup,
  refreshToken,
  logout,
  getMe,
  sanitizeWorker,
};
