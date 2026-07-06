import { apiRequest } from "../../lib/apiClient";

// Real bank name+code pairs from Nomba's own directory (GET
// /v1/transfers/banks) — the onboarding wizard used to show a static
// name-only list with no codes at all, which is exactly what caused every
// settlement to fail ("bankCode must be exactly 3 or 6 digits").
export const banksService = {
  async list() {
    const { banks } = await apiRequest("/banks", { method: "GET" });
    return banks || [];
  },
};
