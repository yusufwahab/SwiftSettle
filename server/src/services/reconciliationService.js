const supabase = require("../config/database");
const platformService = require("./platformService");
const notificationService = require("./notificationService");
const emailService = require("./emailService");
const logger = require("../utils/logger");

// nombaService.createVirtualAccount() sets accountRef = `WORKER-${worker.id}`
// at VA creation time, and Nomba's payment_success webhook echoes it back
// unchanged as aliasAccountReference — so the worker who owns a deposit can
// be read directly off the webhook, no account-number lookup table needed.
function workerIdFromAccountRef(accountRef) {
  if (!accountRef || !accountRef.startsWith("WORKER-")) return null;
  return accountRef.slice("WORKER-".length);
}

// payoutRequestService.processPayoutRequest() pre-assigns nomba_transaction_id
// onto the payout_request *before* firing the webhook — so if this deposit's
// transactionId matches one, an admin explicitly chose this request and no
// FIFO guessing is needed. Anything else falls through to the organic-
// deposit path below (real, unreferenced VA credits).
async function reconcileDeposit({ workerId, receivedAmount, nombaTransactionId }) {
  const { data: payoutRequest } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("nomba_transaction_id", nombaTransactionId)
    .maybeSingle();
  if (payoutRequest) {
    return reconcilePayoutRequest(payoutRequest, receivedAmount);
  }

  const { data: existing } = await supabase
    .from("earnings")
    .select("id")
    .eq("nomba_transaction_id", nombaTransactionId)
    .maybeSingle();
  if (existing) {
    logger.info("Duplicate payment_success webhook ignored", { nombaTransactionId });
    return { duplicate: true };
  }

  const { data: pending, error: pendingError } = await supabase
    .from("earnings")
    .select("*")
    .eq("worker_id", workerId)
    .eq("status", "pending")
    .order("recorded_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (pendingError) throw pendingError;

  let result;
  if (!pending) {
    // Money arrived with no matching reported order — still the worker's
    // money (it landed in their VA), just flagged for review rather than
    // silently dropped or silently trusted.
    const { data: inserted, error } = await supabase
      .from("earnings")
      .insert({
        worker_id: workerId,
        platform_reference: "unmatched_deposit",
        order_id: nombaTransactionId,
        amount: receivedAmount,
        received_amount: receivedAmount,
        status: "unmatched",
        nomba_transaction_id: nombaTransactionId,
        reconciled_at: new Date().toISOString(),
        description: "Deposit received with no matching pending order",
      })
      .select()
      .single();
    if (error) throw error;
    result = inserted;
    logger.warn("Unmatched VA deposit reconciled", { workerId, receivedAmount, nombaTransactionId });
  } else {
    const expected = Number(pending.amount);
    const status = receivedAmount === expected ? "matched" : receivedAmount < expected ? "underpaid" : "overpaid";

    const { data: updated, error } = await supabase
      .from("earnings")
      .update({
        received_amount: receivedAmount,
        status,
        nomba_transaction_id: nombaTransactionId,
        reconciled_at: new Date().toISOString(),
      })
      .eq("id", pending.id)
      .select()
      .single();
    if (error) throw error;
    result = updated;
    logger.info("VA deposit reconciled", { workerId, expected, receivedAmount, status });
  }

  await platformService.recalculateIncomeBaseline(workerId);
  await platformService.updateBehavioralData(workerId);

  return { duplicate: false, earning: result };
}

// Reconciles at the payout_request level (one requested_total, one
// received_amount) rather than re-deriving from individual earnings — then
// distributes the actual amount received back across the bundled earnings
// pro-rata, so getBalance/income-baseline/behavioral-data (which all read
// earnings.received_amount) keep working unmodified. The last earning in
// the bundle absorbs any rounding remainder so the shares always sum to
// exactly what was received.
async function reconcilePayoutRequest(payoutRequest, receivedAmount) {
  if (payoutRequest.status !== "requested") {
    logger.info("Duplicate payout-request webhook ignored", { payoutRequestId: payoutRequest.id });
    return { duplicate: true };
  }

  const expected = Number(payoutRequest.requested_total);
  const status = receivedAmount === expected ? "matched" : receivedAmount < expected ? "underpaid" : "overpaid";

  const { data: bundledEarnings, error: earningsError } = await supabase
    .from("earnings")
    .select("*")
    .eq("payout_request_id", payoutRequest.id);
  if (earningsError) throw earningsError;

  let allocated = 0;
  for (let i = 0; i < bundledEarnings.length; i += 1) {
    const earning = bundledEarnings[i];
    const isLast = i === bundledEarnings.length - 1;
    const share = isLast
      ? Math.round((receivedAmount - allocated) * 100) / 100
      : Math.round(((Number(earning.amount) / expected) * receivedAmount) * 100) / 100;
    allocated += share;

    const { error } = await supabase
      .from("earnings")
      .update({ received_amount: share, status, reconciled_at: new Date().toISOString() })
      .eq("id", earning.id);
    if (error) throw error;
  }

  const { data: updated, error } = await supabase
    .from("payout_requests")
    .update({ received_amount: receivedAmount, status, processed_at: new Date().toISOString() })
    .eq("id", payoutRequest.id)
    .select()
    .single();
  if (error) throw error;

  await platformService.recalculateIncomeBaseline(payoutRequest.worker_id);
  await platformService.updateBehavioralData(payoutRequest.worker_id);

  await notifyPayoutOutcome(payoutRequest.worker_id, { status, expected, received: receivedAmount });

  logger.info("Payout request reconciled", { payoutRequestId: payoutRequest.id, expected, receivedAmount, status });
  return { duplicate: false, payoutRequest: updated };
}

const STATUS_TONE = { matched: "success", underpaid: "warning", overpaid: "warning" };
const STATUS_TITLE = {
  matched: "Payout processed in full",
  underpaid: "Payout processed — underpaid",
  overpaid: "Payout processed — overpaid",
};

async function notifyPayoutOutcome(workerId, { status, expected, received }) {
  const { data: worker } = await supabase.from("workers").select("email").eq("id", workerId).maybeSingle();

  await notificationService.create({
    workerId,
    type: "payout_processed",
    title: STATUS_TITLE[status] || "Payout processed",
    body: `Expected ₦${expected.toLocaleString()}, received ₦${received.toLocaleString()}.`,
    tone: STATUS_TONE[status] || "info",
  });

  if (worker?.email) {
    emailService.notifications
      .payoutProcessed(worker.email, { status, expected, received })
      .catch((err) => logger.error("Payout-processed email failed", { workerId, error: err.message }));
  }
}

module.exports = { workerIdFromAccountRef, reconcileDeposit };
