import { apiRequest } from "../../lib/apiClient";

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
