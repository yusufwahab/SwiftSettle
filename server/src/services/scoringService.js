const supabase = require("../config/database");
const logger = require("../utils/logger");
const { daysBetween, generateCertificateId, addDays } = require("../utils/helpers");

// Exact component weights from updatedPrompt.md / BackendPrompt.md.
// 50 + 75 + 100 + 50 + 150 + 200 + 100 + 75 + 50 = 850.
const WEIGHTS = {
  PHONE: 50,
  BANK: 75,
  PLATFORM: 100,
  TENURE_MAX: 50,
  INCOME_MAX: 150,
  RELIABILITY_MAX: 200,
  CONSISTENCY_MAX: 100,
  TREND_MAX: 75,
  TIME_TO_SETTLE_MAX: 50,
};

const CREDIT_ELIGIBLE_THRESHOLD = 600;

// Credit-tier bands: the prompt only specifies the four tier names and the
// >600 credit-eligibility threshold, not the exact score cutoffs between
// tiers. This mapping is an inferred business rule, not given literally —
// change freely.
function creditTierFor(score) {
  if (score >= 750) return "premium";
  if (score >= 600) return "standard";
  if (score >= 300) return "basic";
  return "none";
}

function scoreTenure(worker) {
  const days = daysBetween(worker.account_creation_date);
  return Math.min(WEIGHTS.TENURE_MAX, Math.floor(days / 10));
}

function scoreIncomeBaseline(monthlyIncome) {
  if (monthlyIncome > 100_000) return 150;
  if (monthlyIncome > 50_000) return 100;
  if (monthlyIncome > 20_000) return 50;
  return 0;
}

function scoreSettlementReliability(settlements) {
  if (settlements.length === 0) return 0;
  const successful = settlements.filter((s) => s.status === "completed").length;
  return Math.round((successful / settlements.length) * WEIGHTS.RELIABILITY_MAX);
}

// "Same time every day" / "random times" / "rarely settle" isn't a formula
// the prompt defines numerically — approximated here as: settled on most
// days since signup = high consistency, settled irregularly = medium,
// hardly ever = low. worker_behavioral_data.settlement_consistency (a
// 'high'|'medium'|'low' text set by the behavioral job) drives this when
// present; falls back to a settlement-count heuristic otherwise.
function scoreSettlementConsistency(behavioral, settlements, tenureDays) {
  if (behavioral?.settlement_consistency) {
    const map = { high: 100, medium: 50, low: 0 };
    return map[behavioral.settlement_consistency] ?? 50;
  }
  if (tenureDays <= 0) return 0;
  const expectedSettlements = tenureDays; // "settles every day" baseline
  const ratio = settlements.length / expectedSettlements;
  if (ratio >= 0.8) return 100;
  if (ratio >= 0.3) return 50;
  return 0;
}

function scoreEarningsTrend(behavioral) {
  const trend = behavioral?.earnings_trend;
  if (trend === "growing") return 75;
  if (trend === "stable") return 50;
  return 0; // declining, or unknown
}

function scoreTimeToSettlement(behavioral) {
  const hours = behavioral?.time_to_settlement;
  if (hours == null) return 0;
  if (hours <= 24) return 50; // same day
  if (hours <= 48) return 25; // next day
  return 0;
}

async function getWorkerScoreInputs(workerId) {
  const [{ data: worker }, { data: settlements }, { data: behavioral }] = await Promise.all([
    supabase.from("workers").select("*").eq("id", workerId).single(),
    supabase.from("settlements").select("status").eq("worker_id", workerId),
    supabase.from("worker_behavioral_data").select("*").eq("worker_id", workerId).maybeSingle(),
  ]);

  return { worker, settlements: settlements || [], behavioral };
}

// The full component breakdown + total, without writing anything — used by
// GET /financial-score to show a live preview as well as by the persisted
// calculateScore() below.
async function computeScore(workerId) {
  const { worker, settlements, behavioral } = await getWorkerScoreInputs(workerId);
  if (!worker) throw new Error("Worker not found.");

  const tenureDays = daysBetween(worker.account_creation_date);

  const components = {
    phone_verified: worker.phone_verified ? WEIGHTS.PHONE : 0,
    bank_verified: worker.bank_verified ? WEIGHTS.BANK : 0,
    platform_connected: worker.platform_earnings_verified ? WEIGHTS.PLATFORM : 0,
    account_tenure: scoreTenure(worker),
    income_baseline: scoreIncomeBaseline(Number(worker.income_baseline || 0)),
    settlement_reliability: scoreSettlementReliability(settlements),
    settlement_consistency: scoreSettlementConsistency(behavioral, settlements, tenureDays),
    earnings_trend: scoreEarningsTrend(behavioral),
    time_to_settlement: scoreTimeToSettlement(behavioral),
  };

  const scoreValue = Object.values(components).reduce((sum, v) => sum + v, 0);
  return { scoreValue, components, tenureDays };
}

// Persists a new financial_identity_scores row and mirrors the latest
// value onto workers.financial_score / credit_tier / settlement_reliability_rate.
async function calculateScore(workerId) {
  const { scoreValue, components } = await computeScore(workerId);
  const tier = creditTierFor(scoreValue);
  const reliabilityRate = components.settlement_reliability > 0
    ? (components.settlement_reliability / WEIGHTS.RELIABILITY_MAX) * 100
    : 0;

  const { error: insertError } = await supabase.from("financial_identity_scores").insert({
    worker_id: workerId,
    score_value: scoreValue,
    components,
    next_recalculation: addDays(new Date(), 30).toISOString(),
  });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("workers")
    .update({
      financial_score: scoreValue,
      credit_tier: tier,
      settlement_reliability_rate: reliabilityRate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workerId);
  if (updateError) throw updateError;

  logger.info("Financial score calculated", { workerId, scoreValue, tier });
  return { scoreValue, components, tier };
}

async function issueCertificateIfEligible(workerId, worker) {
  if (!worker.platform_earnings_verified) return null;

  const { data: existing } = await supabase
    .from("verified_income_certificates")
    .select("id")
    .eq("worker_id", workerId)
    .eq("status", "active")
    .maybeSingle();
  if (existing) return null; // one active certificate at a time

  const certificate = {
    worker_id: workerId,
    certificate_id: generateCertificateId(),
    monthly_income: worker.income_baseline,
    verification_method: "platform_api",
    verification_date: new Date().toISOString(),
    issued_at: new Date().toISOString(),
    expires_at: addDays(new Date(), 90).toISOString(),
    status: "active",
  };

  const { error } = await supabase.from("verified_income_certificates").insert(certificate);
  if (error) throw error;
  logger.info("Verified income certificate issued", { workerId, certificateId: certificate.certificate_id });
  return certificate;
}

// Runs daily (see src/jobs/scoreScheduler.js). Finds every worker who has
// just crossed the 30-day mark and hasn't been scored yet, scores them,
// and issues a certificate if they qualify.
//
// Note: this deliberately does NOT auto-create a credit_requests row.
// BackendPrompt.md's service outline lists "Creates credit request" as a
// side effect of the 30-day job, but section 7's actual credit flow
// ("Worker taps 'Request Credit' -> enters amount -> auto-approved")
// describes the worker initiating the request. Crossing 600 here just
// means GET /credit-eligibility starts returning eligible: true — treating
// the two prompt sections as contradictory rather than silently picking
// one and hiding the conflict.
async function autoTriggerAt30Days() {
  const cutoff = addDays(new Date(), -30).toISOString();

  const { data: candidates, error } = await supabase
    .from("workers")
    .select("*")
    .lte("account_creation_date", cutoff)
    .eq("identity_verification_status", "pending")
    .eq("is_active", true);

  if (error) throw error;

  for (const worker of candidates || []) {
    try {
      const { scoreValue } = await calculateScore(worker.id);
      await issueCertificateIfEligible(worker.id, worker);
      await supabase
        .from("workers")
        .update({ identity_verification_status: "verified" })
        .eq("id", worker.id);
      logger.info("30-day auto-trigger complete", { workerId: worker.id, scoreValue });
    } catch (err) {
      logger.error("30-day auto-trigger failed for worker", { workerId: worker.id, error: err.message });
    }
  }

  return { processed: (candidates || []).length };
}

module.exports = {
  WEIGHTS,
  CREDIT_ELIGIBLE_THRESHOLD,
  creditTierFor,
  computeScore,
  calculateScore,
  issueCertificateIfEligible,
  autoTriggerAt30Days,
};
