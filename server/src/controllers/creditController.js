const supabase = require("../config/database");
const nombaService = require("../services/nombaService");
const scoringService = require("../services/scoringService");
const emailService = require("../services/emailService");
const { ApiError } = require("../middleware/errorHandler");

// Interest rate, repayment period, and the available-credit formula below
// are inferred business rules — the prompt only gives the >600 eligibility
// threshold and one illustrative example (₦50,000 at 2% over 25 days =
// ₦2,000/day). None of this is specified as an exact formula anywhere;
// change freely.
const INTEREST_RATE_PERCENT = 2;
const REPAYMENT_PERIOD_DAYS = 25;

function availableCreditFor(worker) {
  const income = Number(worker.income_baseline || 0);
  if (worker.credit_tier === "premium") return Math.min(income * 0.75, 150_000);
  if (worker.credit_tier === "standard") return Math.min(income * 0.5, 50_000);
  return 0;
}

function buildRepaymentPlan(amount) {
  const interestAmount = amount * (INTEREST_RATE_PERCENT / 100);
  const totalRepayable = amount + interestAmount;
  const dailyRepayment = Math.ceil(totalRepayable / REPAYMENT_PERIOD_DAYS);
  return {
    interest_rate: INTEREST_RATE_PERCENT,
    repayment_period_days: REPAYMENT_PERIOD_DAYS,
    total_repayable: totalRepayable,
    daily_repayment: dailyRepayment,
    remaining_balance: totalRepayable,
    schedule: Array.from({ length: REPAYMENT_PERIOD_DAYS }, (_, i) => ({
      day: i + 1,
      amount: dailyRepayment,
      status: "scheduled",
    })),
  };
}

// GET /api/credit/eligibility
async function getEligibility(req, res, next) {
  try {
    const worker = req.worker;
    const eligible = worker.financial_score > scoringService.CREDIT_ELIGIBLE_THRESHOLD;

    res.json({
      eligible,
      score: worker.financial_score,
      available_credit: eligible ? availableCreditFor(worker) : 0,
      interest_rate: INTEREST_RATE_PERCENT,
      terms: eligible
        ? { repayment_period_days: REPAYMENT_PERIOD_DAYS, tier: worker.credit_tier }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/credit/request
// Auto-approval only, per prompt: "If financial_score > 600, auto-approve
// without human review" — no manual review path exists in this codebase.
async function requestCredit(req, res, next) {
  try {
    const worker = req.worker;
    const { amount } = req.body;

    const eligible = worker.financial_score > scoringService.CREDIT_ELIGIBLE_THRESHOLD;
    const availableCredit = eligible ? availableCreditFor(worker) : 0;

    const { data: creditRequest, error } = await supabase
      .from("credit_requests")
      .insert({ worker_id: worker.id, amount_requested: amount, status: "pending" })
      .select()
      .single();
    if (error) throw error;

    if (!eligible || amount > availableCredit) {
      await supabase
        .from("credit_requests")
        .update({
          status: "rejected",
          auto_approval_decision: "need_review",
          decided_at: new Date().toISOString(),
        })
        .eq("id", creditRequest.id);

      throw new ApiError(
        422,
        "credit_not_available",
        !eligible
          ? "Financial score isn't high enough for credit access yet."
          : `Requested amount exceeds your available credit of ₦${availableCredit.toLocaleString()}.`
      );
    }

    const repaymentPlan = buildRepaymentPlan(amount);

    const disbursement = await nombaService.transferToBank({
      amount,
      accountNumber: worker.account_number,
      accountName: worker.account_holder_name,
      bankCode: worker.bank_name,
      narration: "SwiftSettle credit disbursement",
    });
    repaymentPlan.disbursement_transfer_id = disbursement.nombaTransferId;
    repaymentPlan.disbursed_at = new Date().toISOString();

    const { data: approved, error: approveError } = await supabase
      .from("credit_requests")
      .update({
        status: "approved",
        auto_approval_decision: "approved",
        repayment_plan: repaymentPlan,
        decided_at: new Date().toISOString(),
      })
      .eq("id", creditRequest.id)
      .select()
      .single();
    if (approveError) throw approveError;

    if (worker.email) {
      emailService.notifications
        .creditApproved(worker.email, amount, INTEREST_RATE_PERCENT)
        .catch(() => {}); // best-effort notification, never block the response on it
    }

    res.json({
      request_id: approved.id,
      status: approved.status,
      amount,
      interest_rate: INTEREST_RATE_PERCENT,
      repayment_period: REPAYMENT_PERIOD_DAYS,
      daily_repayment: repaymentPlan.daily_repayment,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/credit/active-loans
async function getActiveLoans(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("credit_requests")
      .select("*")
      .eq("worker_id", req.worker.id)
      .eq("status", "approved")
      .order("requested_at", { ascending: false });
    if (error) throw error;

    const activeLoans = (data || []).filter(
      (loan) => (loan.repayment_plan?.remaining_balance || 0) > 0
    );

    res.json({ loans: activeLoans, active_count: activeLoans.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/credit/repayment-schedule
async function getRepaymentSchedule(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("credit_requests")
      .select("*")
      .eq("worker_id", req.worker.id)
      .eq("status", "approved")
      .order("requested_at", { ascending: false });
    if (error) throw error;

    const schedule = (data || []).flatMap((loan) => loan.repayment_plan?.schedule || []);
    const totalRemaining = (data || []).reduce(
      (sum, loan) => sum + (loan.repayment_plan?.remaining_balance || 0),
      0
    );

    res.json({ schedule, total_remaining: totalRemaining });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEligibility, requestCredit, getActiveLoans, getRepaymentSchedule, availableCreditFor };
