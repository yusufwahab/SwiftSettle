import { apiRequest } from "../../lib/apiClient";

export const payoutsService = {
  async request() {
    return apiRequest("/payouts/request", { method: "POST" });
  },

  async mine() {
    const { payout_requests: payoutRequests } = await apiRequest("/payouts/mine", { method: "GET" });
    return payoutRequests || [];
  },

  // Admin-only — backend 403s a non-admin worker.
  async all() {
    const { payout_requests: payoutRequests } = await apiRequest("/payouts/all", { method: "GET" });
    return payoutRequests || [];
  },

  async process(id, amount) {
    return apiRequest(`/payouts/${id}/process`, { method: "POST", body: { amount } });
  },

  async confirm(id, code) {
    return apiRequest(`/payouts/${id}/confirm`, { method: "POST", body: { code } });
  },

  async resendCode(id) {
    return apiRequest(`/payouts/${id}/resend-code`, { method: "POST" });
  },
};
