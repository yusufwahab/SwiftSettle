import { simulate } from "../core/simulate";

const score = {
  score: 712,
  max_score: 900,
  tier: "standard",
  components: {
    phone_verified: 50,
    bank_verified: 75,
    platform_connected: 100,
    account_tenure: 50,
    income_baseline: 100,
    settlement_reliability: 187,
    settlement_consistency: 100,
    earnings_trend: 50,
    time_to_settlement: 0,
    responsible_bill_payments: 0,
  },
  days_until_certificate: 0,
  certificate_eligible: true,
};

const identityStatus = {
  verification_status: "verified",
  progress: 100,
  days_remaining: 0,
  milestones: [
    { label: "Phone verified", complete: true },
    { label: "Bank account added", complete: true },
    { label: "Platform connected", complete: true },
    { label: "Earnings verified", complete: true },
    { label: "30-day tenure reached", complete: true },
  ],
};

const certificate = {
  certificate_id: "CERT-DEMO-0001",
  monthly_income: 145000,
  verification_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  expires_at: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
  download_url: null,
};

export const financialService = {
  async getScore() {
    return simulate({ ...score }, { delay: 500 });
  },
  async getIdentityStatus() {
    return simulate({ ...identityStatus }, { delay: 400 });
  },
  async getCertificate() {
    return simulate({ ...certificate }, { delay: 400 });
  },
};
