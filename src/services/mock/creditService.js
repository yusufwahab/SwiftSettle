import { simulate } from "../core/simulate";

export const creditService = {
  async getEligibility() {
    return simulate(
      {
        eligible: true,
        score: 712,
        available_credit: 50000,
        interest_rate: 2,
        terms: { repayment_period_days: 25, tier: "standard" },
      },
      { delay: 500 }
    );
  },

  async requestCredit(amount) {
    const interestAmount = amount * 0.02;
    const dailyRepayment = Math.ceil((amount + interestAmount) / 25);
    return simulate(
      {
        request_id: `demo-${Date.now()}`,
        status: "approved",
        amount,
        interest_rate: 2,
        repayment_period: 25,
        daily_repayment: dailyRepayment,
      },
      { delay: 900 }
    );
  },

  async getActiveLoans() {
    return simulate({ loans: [], active_count: 0 }, { delay: 400 });
  },

  async getRepaymentSchedule() {
    return simulate({ schedule: [], total_remaining: 0 }, { delay: 400 });
  },
};
