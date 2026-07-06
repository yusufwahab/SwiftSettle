import { simulate } from "../core/simulate";
import { currentWorker } from "../../data/mockData";

// Auth is email + password now (phone+OTP was fully replaced): signup
// collects name/email/password and sends an email OTP; verifying that OTP
// is what actually logs the new account in. Login is plain email+password,
// no OTP step.

// Mock-only stand-in for what the backend persists between "signup" and
// "verify-email" — a real worker row created but not yet verified.
let pendingSignup = null;

export const authService = {
  async signup({ fullName, email, password }) {
    if (!fullName || !email || !password) {
      throw new Error("Fill in your name, email, and password.");
    }
    pendingSignup = { fullName, email };
    return simulate({ otpSent: true }, { delay: 700 });
  },

  async verifySignupOtp(email, otp) {
    if (!otp) {
      throw new Error("Enter the code we emailed you.");
    }
    const fullName = pendingSignup?.email === email ? pendingSignup.fullName : email.split("@")[0];
    // A brand-new account starts with none of the demo worker's onboarding
    // already done — otherwise the dashboard nudge/wizard would never have
    // anything to demonstrate in mock mode.
    return simulate(
      {
        worker: {
          id: "wkr_new",
          fullName,
          shortName: fullName.split(" ")[0],
          email,
          emailVerified: true,
          phone: "",
          dateOfBirth: "",
          state: "",
          platform: "",
          bank: { name: "", accountNumber: "", accountNumberMasked: "", accountHolder: "", isPrimary: false },
          bankVerified: false,
          financialScore: 0,
          creditTier: "none",
          identityVerificationStatus: "pending",
          twoFactorEnabled: false,
          onboardingStep: 1,
          onboardingCompletedAt: null,
        },
        token: "mock_session_token",
      },
      { delay: 700 }
    );
  },

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Enter your email and password.");
    }
    return simulate(
      { worker: { ...currentWorker, email }, token: "mock_session_token" },
      { delay: 700 }
    );
  },

  async logout() {
    return simulate({ ok: true }, { delay: 200 });
  },
};
