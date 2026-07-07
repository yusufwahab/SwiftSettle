import { apiRequest } from "../../lib/apiClient";

export const financialService = {
  async getScore() {
    return apiRequest("/financial/score", { method: "GET" });
  },
  async getIdentityStatus() {
    return apiRequest("/financial/identity-status", { method: "GET" });
  },
  async getCertificate() {
    return apiRequest("/financial/certificate", { method: "GET" });
  },
};
