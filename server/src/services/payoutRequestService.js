const crypto = require("crypto");
const supabase = require("../config/database");
const { computeNombaSignature } = require("../middleware/validateWebhook");
const { generateReference } = require("../utils/helpers");
const env = require("../config/env");
const { ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// POST /api/payouts/request — bundles every currently-pending earning into
// one payout_request. Batched rather than one-request-per-order, matching
// how real gig platforms pay out (a weekly/batch total), and giving the
// admin one clear thing to act on per worker instead of a noisy queue.
async function createPayoutRequest(workerId) {
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

  return { ...payoutRequest, order_count: pending.length };
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

  return requests.map((r) => ({ ...r, earnings: earningsByRequest.get(r.id) || [] }));
}

// POST /api/payouts/:id/process — the admin action. Fires the same
// real-signed synthetic payment_success webhook the direct demo path uses
// (see earningsController.simulateCustomerPayment for why Nomba's sandbox
// can't be made to deposit into a VA on its own), except this time the
// transactionId is pre-assigned onto the payout_request *before* the
// webhook fires, so reconciliationService can match it deterministically —
// no FIFO guessing needed, since the admin explicitly chose this request.
async function processPayoutRequest({ payoutRequestId, adminWorkerId, paidAmount }) {
  const transactionId = generateReference("PAYOUT");

  const { data: claimed, error: claimError } = await supabase
    .from("payout_requests")
    .update({ nomba_transaction_id: transactionId, processed_by: adminWorkerId })
    .eq("id", payoutRequestId)
    .eq("status", "requested")
    .select()
    .single();
  if (claimError || !claimed) {
    throw new ApiError(409, "already_processed", "This payout request was already processed or does not exist.");
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
        bankName: "Demo Bank",
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

module.exports = { createPayoutRequest, listForWorker, listAll, processPayoutRequest };
