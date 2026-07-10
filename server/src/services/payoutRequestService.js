const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const supabase = require("../config/database");
const { computeNombaSignature } = require("../middleware/validateWebhook");
const { generateReference, generateOtpCode } = require("../utils/helpers");
const env = require("../config/env");
const { ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const emailService = require("./emailService");
const notificationService = require("./notificationService");

const CONFIRMATION_CODE_TTL_MS = 15 * 60 * 1000;

// Generates a fresh 6-digit confirmation code, stores its hash on the
// request, and delivers it over the two channels this build actually has —
// email + an in-app notification. No SMS provider (Termii or similar) is
// configured, so unlike a customer-facing delivery-confirmation code, this
// can't rely on a third party; it's a 2FA-style check that the account
// owner really intended to submit this payout request, not proof the
// underlying work happened.
async function issueConfirmationCode(payoutRequest, worker) {
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CONFIRMATION_CODE_TTL_MS).toISOString();

  const { error } = await supabase
    .from("payout_requests")
    .update({ confirmation_code_hash: codeHash, confirmation_code_expires_at: expiresAt, confirmed_at: null })
    .eq("id", payoutRequest.id);
  if (error) throw error;

  await Promise.all([
    emailService.notifications.payoutConfirmationCode(worker.email, code),
    notificationService.create({
      workerId: worker.id,
      type: "payout_confirmation",
      title: "Confirm your payout request",
      body: `Your confirmation code is ${code}. Enter it on the Request Payout page to confirm — it expires in 15 minutes.`,
      tone: "primary",
    }),
  ]);

  return expiresAt;
}

// POST /api/payouts/request — bundles every currently-pending earning into
// one payout_request. Batched rather than one-request-per-order, matching
// how real gig platforms pay out (a weekly/batch total), and giving the
// admin one clear thing to act on per worker instead of a noisy queue.
async function createPayoutRequest(worker) {
  const workerId = worker.id;
  const { data: pending, error: pendingError } = await supabase
    .from("earnings")
    .select("*")
    .eq("worker_id", workerId)
    .eq("status", "pending");
  if (pendingError) throw pendingError;

  if (!pending || pending.length === 0) {
    throw new ApiError(422, "no_pending_earnings", "No completed orders awaiting payout.");
  }

  const requestedTotal = pending.reduce((sum, e) => sum + Number(e.amount), 0);

  const { data: payoutRequest, error } = await supabase
    .from("payout_requests")
    .insert({ worker_id: workerId, requested_total: requestedTotal, status: "requested" })
    .select()
    .single();
  if (error) throw error;

  const { error: updateError } = await supabase
    .from("earnings")
    .update({ payout_request_id: payoutRequest.id, status: "requested" })
    .in(
      "id",
      pending.map((e) => e.id)
    );
  if (updateError) throw updateError;

  const confirmationCodeExpiresAt = await issueConfirmationCode(payoutRequest, worker);

  return {
    ...payoutRequest,
    order_count: pending.length,
    confirmation_code_expires_at: confirmationCodeExpiresAt,
  };
}

// POST /api/payouts/:id/resend-code — worker didn't get the email in time,
// or the 15-minute window lapsed. Issues a fresh code, invalidating the
// previous one (confirmed_at is reset to null by issueConfirmationCode).
async function resendConfirmationCode({ payoutRequestId, worker }) {
  const { data: request, error } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("id", payoutRequestId)
    .eq("worker_id", worker.id)
    .maybeSingle();
  if (error) throw error;
  if (!request) throw new ApiError(404, "not_found", "Payout request not found.");
  if (request.status !== "requested") {
    throw new ApiError(409, "already_processed", "This payout request has already been processed.");
  }

  const confirmationCodeExpiresAt = await issueConfirmationCode(request, worker);
  return { confirmation_code_expires_at: confirmationCodeExpiresAt };
}

// POST /api/payouts/:id/confirm — worker enters the code back into the app.
// Admin can't act on this request (see processPayoutRequest) until this
// succeeds.
async function confirmPayoutRequest({ payoutRequestId, workerId, code }) {
  const { data: request, error } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("id", payoutRequestId)
    .eq("worker_id", workerId)
    .maybeSingle();
  if (error) throw error;
  if (!request) throw new ApiError(404, "not_found", "Payout request not found.");

  if (request.confirmed_at) {
    throw new ApiError(409, "already_confirmed", "This payout request is already confirmed.");
  }
  if (!request.confirmation_code_hash || new Date(request.confirmation_code_expires_at) < new Date()) {
    throw new ApiError(401, "code_expired", "That code has expired — request a new one.");
  }

  const matches = await bcrypt.compare(code, request.confirmation_code_hash);
  if (!matches) {
    throw new ApiError(401, "invalid_code", "That code is incorrect.");
  }

  const { data: confirmed, error: confirmError } = await supabase
    .from("payout_requests")
    .update({ confirmed_at: new Date().toISOString(), confirmation_code_hash: null })
    .eq("id", payoutRequestId)
    .select()
    .single();
  if (confirmError) throw confirmError;

  return confirmed;
}

async function listForWorker(workerId) {
  const { data: requests, error } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("worker_id", workerId)
    .order("requested_at", { ascending: false });
  if (error) throw error;

  return attachBundledEarnings(requests || []);
}

// Admin queue — every worker's requests, most recent first, with the
// requesting worker's name/email attached (fetched separately rather than
// via a PostgREST embed, since payout_requests has two FKs into workers —
// worker_id and processed_by — and this keeps the query unambiguous).
async function listAll() {
  const { data: requests, error } = await supabase
    .from("payout_requests")
    .select("*")
    .order("requested_at", { ascending: false });
  if (error) throw error;

  const withEarnings = await attachBundledEarnings(requests || []);
  const workerIds = [...new Set(withEarnings.map((r) => r.worker_id))];
  if (workerIds.length === 0) return withEarnings;

  const { data: workers, error: workersError } = await supabase
    .from("workers")
    .select("id, full_name, email")
    .in("id", workerIds);
  if (workersError) throw workersError;

  const workerById = new Map((workers || []).map((w) => [w.id, w]));
  return withEarnings.map((r) => ({ ...r, worker: workerById.get(r.worker_id) || null }));
}

async function attachBundledEarnings(requests) {
  if (requests.length === 0) return requests;

  const { data: earnings, error } = await supabase
    .from("earnings")
    .select("*")
    .in(
      "payout_request_id",
      requests.map((r) => r.id)
    );
  if (error) throw error;

  const earningsByRequest = new Map();
  for (const e of earnings || []) {
    const list = earningsByRequest.get(e.payout_request_id) || [];
    list.push(e);
    earningsByRequest.set(e.payout_request_id, list);
  }

  return requests.map((r) => {
    // eslint-disable-next-line no-unused-vars
    const { confirmation_code_hash, ...safe } = r;
    return { ...safe, earnings: earningsByRequest.get(r.id) || [] };
  });
}

// Terminal — once a request reaches either of these, no further payment
// can be logged against it. "requested" (not yet paid) and "underpaid" (paid
// less than requested_total) both still accept a payment.
const PAYABLE_STATUSES = ["requested", "underpaid"];

// POST /api/payouts/:id/process — the admin action. Fires the same
// real-signed synthetic payment_success webhook the direct demo path uses
// (see earningsController.simulateCustomerPayment for why Nomba's sandbox
// can't be made to deposit into a VA on its own), except this time the
// transactionId is pre-assigned onto the payout_request *before* the
// webhook fires, so reconciliationService can match it deterministically —
// no FIFO guessing needed, since the admin explicitly chose this request.
//
// Callable a second time on the same request if the first payment left it
// `underpaid` — this pays the *remaining* balance (or whatever amount the
// admin enters), which reconciliationService.reconcilePayoutRequest adds to
// what was already received rather than replacing it. A fresh
// nomba_transaction_id is generated each call since each represents its own
// real transfer event; confirmed_at from the worker's original confirmation
// still applies — completing an underpayment doesn't require a new code.
async function processPayoutRequest({ payoutRequestId, adminWorkerId, paidAmount }) {
  const { data: existing, error: existingError } = await supabase
    .from("payout_requests")
    .select("status, confirmed_at")
    .eq("id", payoutRequestId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (!existing) throw new ApiError(404, "not_found", "Payout request not found.");
  if (!PAYABLE_STATUSES.includes(existing.status)) {
    throw new ApiError(409, "already_processed", "This payout request was already fully processed.");
  }
  if (!existing.confirmed_at) {
    throw new ApiError(422, "not_confirmed", "The worker hasn't confirmed this payout request yet.");
  }

  const transactionId = generateReference("PAYOUT");

  const { data: claimed, error: claimError } = await supabase
    .from("payout_requests")
    .update({ nomba_transaction_id: transactionId, processed_by: adminWorkerId })
    .eq("id", payoutRequestId)
    .in("status", PAYABLE_STATUSES)
    .select()
    .single();
  if (claimError || !claimed) {
    throw new ApiError(409, "already_processed", "This payout request was already fully processed.");
  }

  const { data: virtualAccount, error: vaError } = await supabase
    .from("virtual_accounts")
    .select("bank_account_number")
    .eq("worker_id", claimed.worker_id)
    .maybeSingle();
  if (vaError) throw vaError;
  if (!virtualAccount) {
    throw new ApiError(422, "no_virtual_account", "Worker has no virtual account on file.");
  }

  const timestamp = new Date().toISOString();
  const payload = {
    event_type: "payment_success",
    requestId: crypto.randomUUID(),
    data: {
      merchant: {
        walletId: env.NOMBA_SUB_ACCOUNT_ID || "demo-wallet",
        walletBalance: 0,
        userId: env.NOMBA_MAIN_ACCOUNT_ID || "demo-user",
      },
      transaction: {
        aliasAccountNumber: virtualAccount.bank_account_number,
        aliasAccountReference: `WORKER-${claimed.worker_id}`,
        transactionId,
        type: "vact_transfer",
        transactionAmount: paidAmount,
        fee: 0,
        time: timestamp,
        responseCode: "00",
      },
      customer: {
        senderName: "SwiftSettle Admin",
        bankName: "Partner Bank",
        accountNumber: "0000000000",
        bankCode: "000",
      },
    },
  };

  const signature = computeNombaSignature(payload, timestamp, env.NOMBA_WEBHOOK_SECRET);

  const response = await fetch(`${env.API_URL}/api/webhooks/nomba`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "nomba-signature": signature,
      "nomba-timestamp": timestamp,
      "nomba-signature-algorithm": "HmacSHA256",
      "nomba-signature-version": "1.0.0",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    logger.error("Payout-processing webhook call failed", { status: response.status, body });
    throw new ApiError(502, "webhook_call_failed", "Payout could not be processed.");
  }

  const { data: resolved, error } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("id", payoutRequestId)
    .single();
  if (error) throw error;

  return resolved;
}

module.exports = {
  createPayoutRequest,
  listForWorker,
  listAll,
  processPayoutRequest,
  confirmPayoutRequest,
  resendConfirmationCode,
};
