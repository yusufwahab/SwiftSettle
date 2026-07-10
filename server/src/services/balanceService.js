const supabase = require("../config/database");
const { RECONCILED_EARNING_STATUSES } = require("../utils/helpers");

// Any settlement that's at least been initiated commits that money — not
// just ones Nomba has fully confirmed. Without "processing"/"pending" here,
// a worker who just transferred money out would see their dashboard
// balance stay unchanged until Nomba's own payout_success webhook
// eventually arrives (which, without a public webhook URL registered,
// might never happen in local/sandbox testing).
const COMMITTED_SETTLEMENT_STATUSES = ["pending", "processing", "completed"];

// Single source of truth for "available balance" — used by both
// GET /earnings/balance (what the dashboard shows) and
// settlementsController.createSettlement (what validates a transfer
// request). Previously these two computed it differently (one only
// subtracted "completed" settlements, the other summed *unreconciled*
// earnings.amount instead of received_amount) — that mismatch was the
// actual bug behind the dashboard balance looking "stagnant" after a
// transfer.
async function getAvailableBalance(workerId) {
  const [{ data: earnings, error: earningsError }, { data: settlements, error: settlementsError }] =
    await Promise.all([
      supabase
        .from("earnings")
        .select("received_amount")
        .eq("worker_id", workerId)
        .in("status", RECONCILED_EARNING_STATUSES),
      supabase.from("settlements").select("amount").eq("worker_id", workerId).in("status", COMMITTED_SETTLEMENT_STATUSES),
    ]);
  if (earningsError) throw earningsError;
  if (settlementsError) throw settlementsError;

  const totalEarned = (earnings || []).reduce((sum, e) => sum + Number(e.received_amount), 0);
  const totalCommitted = (settlements || []).reduce((sum, s) => sum + Number(s.amount), 0);
  return totalEarned - totalCommitted;
}

module.exports = { getAvailableBalance, COMMITTED_SETTLEMENT_STATUSES };
