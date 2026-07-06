const bcrypt = require("bcryptjs");
const supabase = require("../config/database");
const emailService = require("../services/emailService");
const nombaService = require("../services/nombaService");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { generateOtpCode } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

const OTP_TTL_MS = 5 * 60 * 1000;

async function sendEmailOtp(worker) {
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);

  const { error } = await supabase.from("otp_codes").insert({
    email: worker.email,
    code: codeHash,
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });
  if (error) throw error;

  await emailService.sendOtpEmail(worker.email, code);
}

// POST /auth/signup — { full_name, email, password }
async function signup(req, res, next) {
  try {
    const { full_name: fullName, email, password } = req.body;

    const { data: existing } = await supabase.from("workers").select("*").eq("email", email).maybeSingle();
    if (existing?.email_verified) {
      throw new ApiError(409, "email_already_registered", "That email is already registered. Try logging in instead.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let worker = existing;

    if (worker) {
      // Abandoned signup (never verified) — let them retry with fresh details.
      const { data: updated, error } = await supabase
        .from("workers")
        .update({ full_name: fullName, password_hash: passwordHash })
        .eq("id", worker.id)
        .select()
        .single();
      if (error) throw error;
      worker = updated;
    } else {
      const { data: created, error } = await supabase
        .from("workers")
        .insert({ full_name: fullName, email, password_hash: passwordHash })
        .select()
        .single();
      if (error) throw error;
      worker = created;
    }

    await sendEmailOtp(worker);
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

// POST /auth/verify-email — { email, otp_code }
// Confirms the signup email-OTP and logs the worker in — this is the only
// place a session gets issued for a brand-new account.
async function verifyEmail(req, res, next) {
  try {
    const { email, otp_code: otpCode } = req.body;

    const { data: candidates, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
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
      .update({ email_verified: true, last_login: new Date().toISOString() })
      .eq("email", email)
      .select()
      .single();
    if (workerError) throw workerError;

    const { token, refreshToken } = await issueSession(worker.id);
    res.json({ token, refresh_token: refreshToken, worker_id: worker.id });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login — { email, password }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { data: worker } = await supabase.from("workers").select("*").eq("email", email).maybeSingle();
    const matches = worker?.password_hash && (await bcrypt.compare(password, worker.password_hash));
    if (!matches) {
      throw new ApiError(401, "invalid_credentials", "Incorrect email or password.");
    }
    if (!worker.email_verified) {
      throw new ApiError(403, "email_not_verified", "Verify your email before signing in.");
    }
    if (!worker.is_active) {
      throw new ApiError(403, "account_inactive", "This account is no longer active.");
    }

    await supabase.from("workers").update({ last_login: new Date().toISOString() }).eq("id", worker.id);

    const { token, refreshToken } = await issueSession(worker.id);
    res.json({ token, refresh_token: refreshToken, worker_id: worker.id });
  } catch (err) {
    next(err);
  }
}

// Applies one onboarding-wizard step to a worker row. Shared by both
// POST /auth/verify-phone-update (step-by-step) and
// POST /auth/complete-signup (everything at once).
async function applyOnboardingStep(worker, step, data) {
  const updates = { onboarding_step: Math.max(worker.onboarding_step, step) };

  if (step === 1) {
    Object.assign(updates, {
      date_of_birth: data.date_of_birth,
      state: data.state,
      platform: data.platform,
      phone_number: data.phone_number,
    });
  }

  if (step === 2) {
    Object.assign(updates, {
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_holder_name: data.account_holder_name,
      bank_verified: true,
    });

    if (!worker.nomba_virtual_account_id) {
      const va = await nombaService.createVirtualAccount({ ...worker, full_name: worker.full_name });
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

  if (step === 3) {
    if (data.pin) updates.pin_hash = await bcrypt.hash(data.pin, 10);
    if (typeof data.two_factor_enabled === "boolean") updates.two_factor_enabled = data.two_factor_enabled;
  }

  if (step === 4) {
    Object.assign(updates, {
      data_sharing_consent: Boolean(data.data_sharing_consent),
      terms_accepted: Boolean(data.terms_accepted),
      onboarding_completed_at: new Date().toISOString(),
    });
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

// POST /auth/verify-phone-update — named per BackendPrompt.md, but this
// endpoint now handles every onboarding-wizard step (1-4). The name is a
// holdover; phone verification itself no longer happens here (or anywhere
// — auth is email+password, phone is just contact info collected at step 1).
async function submitOnboardingStep(req, res, next) {
  try {
    const { step, data } = req.body;
    const updatedWorker = await applyOnboardingStep(req.worker, step, data || {});
    res.json({ success: true, next_step: Math.min(4, step + 1), worker: sanitizeWorker(updatedWorker) });
  } catch (err) {
    next(err);
  }
}

// POST /auth/complete-signup — one-shot alternative to stepping through
// verify-phone-update 1-4 individually. Despite the name, this is the
// onboarding wizard's "do it all at once" path, not account creation
// (that's POST /auth/signup + /auth/verify-email now).
async function completeSignup(req, res, next) {
  try {
    let worker = req.worker;
    for (const step of [1, 2, 3, 4]) {
      worker = await applyOnboardingStep(worker, step, req.body);
    }
    res.json({ worker_id: worker.id, onboarding_complete: true });
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
// bank details, financial_score, onboarding progress, ...), which the
// frontend needs to render the sidebar, settings page, dashboard nudge
// banner, and onboarding wizard at all.
async function getMe(req, res, next) {
  try {
    res.json({ worker: sanitizeWorker(req.worker) });
  } catch (err) {
    next(err);
  }
}

function sanitizeWorker(worker) {
  // eslint-disable-next-line no-unused-vars
  const { pin_hash, password_hash, platform_access_token, ...safe } = worker;
  return safe;
}

module.exports = {
  signup,
  verifyEmail,
  login,
  submitOnboardingStep,
  completeSignup,
  refreshToken,
  logout,
  getMe,
  sanitizeWorker,
};
