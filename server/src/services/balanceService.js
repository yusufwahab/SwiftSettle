const supabase = require("../config/database");
const { RECONCILED_EARNING_STATUSES } = require("../utils/helpers");

// Any settlement that's at least been initiated commits that money — not
// just ones Nomba has fully confirmed. Without "processing"/"pending" here,
// a worker who just transferred money out would see their dashboard
// balance stay unchanged until Nomba's own payout_success webhook
// eventually arrives (which, without a public webhook URL registered,
// might never happen in local/sandbox testing).
const COMMITTED_SETTLEMENT_STATUSES = ["pending", "processing", "completed"];

// Same idea as settlements — a bill payment that's at least been
// initiated commits that money, whether or not Nomba's webhook has
// confirmed it yet.
const COMMITTED_BILL_PAYMENT_STATUSES = ["pending", "processing", "completed"];

// Single source of truth for "available balance" — used by
// GET /earnings/balance (what the dashboard shows),
// settlementsController.createSettlement, and billPaymentsController.create.
// Previously settlements alone had two different, inconsistent
// computations (one only subtracted "completed" settlements, the other
// summed *unreconciled* earnings.amount instead of received_amount) — that
// mismatch was the actual bug behind the dashboard balance looking
// "stagnant" after a transfer. Bill payments draw from the exact same
// balance pool as settlements, so they have to be subtracted here too, or
// a worker could double-spend the same money through both at once.
async function getAvailableBalance(workerId) {
  const [
    { data: earnings, error: earningsError },
    { data: settlements, error: settlementsError },
    { data: billPayments, error: billPaymentsError },
  ] = await Promise.all([
    supabase
      .from("earnings")
      .select("received_amount")
      .eq("worker_id", workerId)
      .in("status", RECONCILED_EARNING_STATUSES),
    supabase.from("settlements").select("amount").eq("worker_id", workerId).in("status", COMMITTED_SETTLEMENT_STATUSES),
    supabase
      .from("bill_payments")
      .select("amount")
      .eq("worker_id", workerId)
      .in("status", COMMITTED_BILL_PAYMENT_STATUSES),
  ]);
  if (earningsError) throw earningsError;
  if (settlementsError) throw settlementsError;
  if (billPaymentsError) throw billPaymentsError;

  const totalEarned = (earnings || []).reduce((sum, e) => sum + Number(e.received_amount), 0);
  const totalCommitted =
    (settlements || []).reduce((sum, s) => sum + Number(s.amount), 0) +
    (billPayments || []).reduce((sum, b) => sum + Number(b.amount), 0);
  return totalEarned - totalCommitted;
}

module.exports = { getAvailableBalance, COMMITTED_SETTLEMENT_STATUSES, COMMITTED_BILL_PAYMENT_STATUSES };
