const supabase = require("../config/database");
const logger = require("../utils/logger");
const { RECONCILED_EARNING_STATUSES } = require("../utils/helpers");

// Called by the platform webhook handler when a gig platform reports a
// completed order. Insert is idempotent via the unique
// (platform_reference, order_id) constraint on `earnings` — a redelivered
// webhook for the same order is a no-op, not a double-count.
async function recordEarning({ workerId, platform, orderId, amount, description }) {
  const { error } = await supabase.from("earnings").insert({
    worker_id: workerId,
    platform_reference: platform,
    order_id: orderId,
    amount,
    description: description || null,
    recorded_at: new Date().toISOString(),
  });

  // Postgres unique_violation code — treat as success, not an error, since
  // webhook redelivery is expected and must not fail loudly.
  if (error && error.code !== "23505") {
    throw error;
  }
  if (error?.code === "23505") {
    logger.info("Duplicate earning webhook ignored", { workerId, platform, orderId });
    return { duplicate: true };
  }

  await recalculateIncomeBaseline(workerId);
  return { duplicate: false };
}

// income_baseline = verified monthly average from earnings actually
// reconciled against a real VA deposit (received_amount), never an
// unreconciled platform claim (amount) — the rolling sum of the trailing
// 30 days of reconciled `earnings` rows.
async function recalculateIncomeBaseline(workerId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: earnings, error } = await supabase
    .from("earnings")
    .select("received_amount, reconciled_at")
    .eq("worker_id", workerId)
    .in("status", RECONCILED_EARNING_STATUSES)
    .gte("reconciled_at", thirtyDaysAgo);
  if (error) throw error;

  const total = (earnings || []).reduce((sum, e) => sum + Number(e.received_amount), 0);
  const hasEnoughHistory = (earnings || []).length >= 5; // arbitrary minimum sample before calling income "verified"

  const { error: updateError } = await supabase
    .from("workers")
    .update({
      income_baseline: total,
      platform_earnings_verified: hasEnoughHistory,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workerId);
  if (updateError) throw updateError;

  return { total, hasEnoughHistory };
}

// Recomputes the behavioral summary row used by the scoring service.
// Called after settlement status changes (see webhookController) so
// settlement_frequency/consistency/time_to_settlement stay current.
async function updateBehavioralData(workerId) {
  const [{ data: earnings }, { data: settlements }] = await Promise.all([
    supabase
      .from("earnings")
      .select("received_amount, reconciled_at")
      .eq("worker_id", workerId)
      .in("status", RECONCILED_EARNING_STATUSES)
      .order("reconciled_at", { ascending: true }),
    supabase
      .from("settlements")
      .select("amount, status, requested_at, settled_at")
      .eq("worker_id", workerId)
      .order("requested_at", { ascending: true }),
  ]);

  const dailyTotals = {};
  for (const e of earnings || []) {
    const day = e.reconciled_at.slice(0, 10);
    dailyTotals[day] = (dailyTotals[day] || 0) + Number(e.received_amount);
  }
  const dailyEarnings = Object.entries(dailyTotals).map(([date, amount]) => ({ date, amount }));

  const completedSettlements = (settlements || []).filter((s) => s.status === "completed" && s.settled_at);
  const settlementFrequency = completedSettlements.length; // total settle events, per BackendPrompt.md's int type

  const avgHoursToSettle = averageHoursToSettlement(earnings || [], completedSettlements);
  const trend = computeTrend(dailyEarnings);
  const consistency = computeConsistency(completedSettlements);

  const { error } = await supabase.from("worker_behavioral_data").insert({
    worker_id: workerId,
    daily_earnings: dailyEarnings,
    settlement_frequency: settlementFrequency,
    settlement_consistency: consistency,
    time_to_settlement: avgHoursToSettle,
    earnings_trend: trend,
    last_calculated: new Date().toISOString(),
  });
  if (error) throw error;
}

function averageHoursToSettlement(earnings, completedSettlements) {
  if (earnings.length === 0 || completedSettlements.length === 0) return null;
  const firstEarning = new Date(earnings[0].reconciled_at).getTime();
  const lastSettlement = new Date(completedSettlements[completedSettlements.length - 1].settled_at).getTime();
  const hours = (lastSettlement - firstEarning) / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours));
}

// growing/stable/declining by comparing this 30-day window's total to the
// prior 30-day window.
function computeTrend(dailyEarnings) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let recent = 0;
  let prior = 0;
  for (const { date, amount } of dailyEarnings) {
    const age = now - new Date(date).getTime();
    if (age <= 30 * day) recent += amount;
    else if (age <= 60 * day) prior += amount;
  }
  if (prior === 0) return recent > 0 ? "growing" : "stable";
  const change = (recent - prior) / prior;
  if (change >= 0.1) return "growing";
  if (change <= -0.1) return "declining";
  return "stable";
}

// This is a numeric percentage on worker_behavioral_data (per
// BackendPrompt.md's `settlement_consistency DECIMAL`), distinct from
// scoringService's high/medium/low bucket — % of days-with-earnings that
// also have a same-day settlement.
function computeConsistency(completedSettlements) {
  if (completedSettlements.length < 2) return 0;
  const gaps = [];
  for (let i = 1; i < completedSettlements.length; i += 1) {
    const prev = new Date(completedSettlements[i - 1].requested_at).getTime();
    const curr = new Date(completedSettlements[i].requested_at).getTime();
    gaps.push(curr - prev);
  }
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, g) => sum + (g - avgGap) ** 2, 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = avgGap === 0 ? 1 : stdDev / avgGap;
  // Lower variation relative to the average gap = more consistent timing.
  const consistencyPct = Math.max(0, Math.min(100, 100 * (1 - coefficientOfVariation)));
  return Math.round(consistencyPct * 100) / 100;
}

module.exports = { recordEarning, recalculateIncomeBaseline, updateBehavioralData };
