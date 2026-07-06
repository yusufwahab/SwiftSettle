import { apiRequest, tokenStorage } from "../../lib/apiClient";

// Mirrors the mock authService's method names/signatures so
// services/index.js can swap between them with no other code changes.
// The real backend's actual sequencing is stricter than the mock's
// (phone+OTP verification must happen and issue a JWT *before* the rest of
// onboarding can be submitted, since those endpoints require auth) — that
// sequencing is handled inside signup() below.

export const authService = {
  async requestOtp(phone) {
    return apiRequest("/auth/signup", { method: "POST", body: { phone_number: phone }, skipAuth: true });
  },

  async verifyOtp(phone, otp) {
    const data = await apiRequest("/auth/verify-otp", {
      method: "POST",
      body: { phone_number: phone, otp_code: otp },
      skipAuth: true,
    });
    tokenStorage.set(data.token, data.refresh_token);
    const me = await apiRequest("/auth/me", { method: "GET" });
    return { worker: me.worker, token: data.token };
  },

  // payload: { phone, otp, fullName, email, dateOfBirth, state, platform,
  // bank: { name, accountNumber, accountHolder }, pin, dataSharingConsent,
  // termsAccepted } — see the onboarding-field note in SignupPage.jsx for
  // which of these the current (pre-8-step-wizard) form actually collects.
  async signup(payload) {
    // verify-otp first: nothing else can be submitted without the JWT it issues.
    const verifyResult = await apiRequest("/auth/verify-otp", {
      method: "POST",
      body: { phone_number: payload.phone, otp_code: payload.otp },
      skipAuth: true,
    });
    tokenStorage.set(verifyResult.token, verifyResult.refresh_token);

    const completed = await apiRequest("/auth/complete-signup", {
      method: "POST",
      body: {
        full_name: payload.fullName,
        date_of_birth: payload.dateOfBirth,
        state: payload.state,
        platform: payload.platform,
        bank_name: payload.bank?.name,
        account_number: payload.bank?.accountNumber,
        account_holder_name: payload.bank?.accountHolder,
        pin: payload.pin,
        data_sharing_consent: Boolean(payload.dataSharingConsent),
        terms_accepted: Boolean(payload.termsAccepted),
      },
    });

    const me = await apiRequest("/auth/me", { method: "GET" });
    return { worker: me.worker, token: completed.token };
  },

  async logout() {
    const refreshToken = tokenStorage.getRefresh();
    tokenStorage.clear();
    if (refreshToken) {
      await apiRequest("/auth/logout", { method: "POST", body: { refresh_token: refreshToken }, skipAuth: true }).catch(
        () => {} // logging out locally must succeed even if the network call fails
      );
    }
    return { ok: true };
  },
};
