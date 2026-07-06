import { apiRequest } from "../../lib/apiClient";

// No mock equivalent exists yet — none of updatedPrompt.md's Phase 2
// frontend components (FinancialScoreCard, IdentityProgressTracker,
// VerifiedIncomeCertificate) have been built. This is forward plumbing:
// wired to the real backend now so those components have something to
// call once they exist, rather than needing service-layer work redone
// later. Not registered under a shared mock/live pair in services/index.js
// for that reason — imported directly wherever it's eventually used.
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
