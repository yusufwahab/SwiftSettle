import { maskAccountNumber } from "../../lib/format";

// The backend returns the worker row as-is (snake_case, flat bank fields —
// see server/src/controllers/authController.js's sanitizeWorker). Every
// page that reads `worker.*` (Sidebar, Dashboard, Settings, ...) was built
// against the mock layer's shape: camelCase, with a nested `bank` object.
// This is the one place that gap gets closed, so every live/*.js caller
// that returns a worker goes through it — never pass a raw backend worker
// object straight to AuthContext.
export function normalizeWorker(raw) {
  if (!raw) return null;

  const [first, ...rest] = (raw.full_name || "").trim().split(/\s+/);
  const shortName = raw.full_name
    ? `${first || ""}${rest.length ? ` ${rest[rest.length - 1].charAt(0)}.` : ""}`.trim()
    : "";

  return {
    id: raw.id,
    fullName: raw.full_name || "",
    shortName,
    email: raw.email,
    emailVerified: Boolean(raw.email_verified),
    phone: raw.phone_number || "",
    dateOfBirth: raw.date_of_birth
      ? new Date(raw.date_of_birth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "",
    state: raw.state || "",
    platform: raw.platform || "",
    bank: {
      name: raw.bank_name || "",
      accountNumber: raw.account_number || "",
      accountNumberMasked: maskAccountNumber(raw.account_number),
      accountHolder: raw.account_holder_name || "",
      isPrimary: true,
    },
    bankVerified: Boolean(raw.bank_verified),
    financialScore: raw.financial_score ?? 0,
    creditTier: raw.credit_tier || "none",
    identityVerificationStatus: raw.identity_verification_status || "pending",
    twoFactorEnabled: Boolean(raw.two_factor_enabled),
    onboardingStep: raw.onboarding_step ?? 1,
    onboardingCompletedAt: raw.onboarding_completed_at || null,
    isAdmin: Boolean(raw.is_admin),
  };
}
