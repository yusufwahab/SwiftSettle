import { apiRequest } from "../../lib/apiClient";

// Same situation as financialService — no CreditRequestModal/
// CreditEligibility component exists yet (Phase 2 frontend), so this has
// no mock counterpart and isn't switched via services/index.js. Ready for
// whenever that UI gets built.
export const creditService = {
  async getEligibility() {
    return apiRequest("/credit/eligibility", { method: "GET" });
  },
  async requestCredit(amount) {
    return apiRequest("/credit/request", { method: "POST", body: { amount } });
  },
  async getActiveLoans() {
    return apiRequest("/credit/active-loans", { method: "GET" });
  },
  async getRepaymentSchedule() {
    return apiRequest("/credit/repayment-schedule", { method: "GET" });
  },
};
