import { apiRequest } from "../../lib/apiClient";
import { normalizeWorker } from "./normalizeWorker";

// Backs the post-signup onboarding wizard (Personal/Contact -> Bank ->
// Security -> Terms). Every step is optional/skippable from the UI's
// perspective — the backend just records whatever's been submitted so far.
export const onboardingService = {
  async submitStep(step, data) {
    const result = await apiRequest("/auth/verify-phone-update", {
      method: "POST",
      body: { step, data },
    });
    return { nextStep: result.next_step, worker: normalizeWorker(result.worker) };
  },
};
