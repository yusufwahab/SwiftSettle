const supabase = require("../config/database");
const scoringService = require("../services/scoringService");
const { daysBetween } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

// GET /api/financial/score
async function getScore(req, res, next) {
  try {
    const worker = req.worker;
    const { scoreValue, components } = await scoringService.computeScore(worker.id);
    const tenureDays = daysBetween(worker.account_creation_date);
    const daysUntilCertificate = Math.max(0, 30 - tenureDays);

    res.json({
      score: scoreValue,
      max_score: scoringService.MAX_POSSIBLE_SCORE,
      tier: scoringService.creditTierFor(scoreValue),
      components,
      days_until_certificate: daysUntilCertificate,
      certificate_eligible: tenureDays >= 30 && scoreValue > scoringService.CREDIT_ELIGIBLE_THRESHOLD,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/financial/identity-status
async function getIdentityStatus(req, res, next) {
  try {
    const worker = req.worker;
    const tenureDays = daysBetween(worker.account_creation_date);
    const progress = Math.min(100, Math.round((tenureDays / 30) * 100));

    res.json({
      verification_status: worker.identity_verification_status,
      progress,
      days_remaining: Math.max(0, 30 - tenureDays),
      milestones: [
        { label: "Phone verified", complete: worker.phone_verified },
        { label: "Bank account added", complete: worker.bank_verified },
        { label: "Platform connected", complete: worker.platform_connected },
        { label: "Earnings verified", complete: worker.platform_earnings_verified },
        { label: "30-day tenure reached", complete: tenureDays >= 30 },
      ],
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/financial/certificate
async function getCertificate(req, res, next) {
  try {
    const { data: certificate, error } = await supabase
      .from("verified_income_certificates")
      .select("*")
      .eq("worker_id", req.worker.id)
      .eq("status", "active")
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!certificate) {
      throw new ApiError(404, "no_certificate", "No active income certificate yet.");
    }

    res.json({
      certificate_id: certificate.certificate_id,
      monthly_income: certificate.monthly_income,
      verification_date: certificate.verification_date,
      expires_at: certificate.expires_at,
      // No PDF/rendering service is specified anywhere in the prompt, so
      // there's nothing to generate a real download from yet — returning
      // null rather than a fabricated URL.
      download_url: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getScore, getIdentityStatus, getCertificate };
