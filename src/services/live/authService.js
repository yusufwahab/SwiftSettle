import { apiRequest, tokenStorage } from "../../lib/apiClient";
import { normalizeWorker } from "./normalizeWorker";

// Mirrors the mock authService's method names/signatures so
// services/index.js can swap between them with no other code changes.
// Auth is email + password (phone+OTP was fully replaced): signup sends an
// email OTP, verifying it is what actually issues a session; login is
// plain email+password with no OTP step.

export const authService = {
  async signup({ fullName, email, password }) {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: { full_name: fullName, email, password },
      skipAuth: true,
    });
  },

  async verifySignupOtp(email, otp) {
    const data = await apiRequest("/auth/verify-email", {
      method: "POST",
      body: { email, otp_code: otp },
      skipAuth: true,
    });
    tokenStorage.set(data.token, data.refresh_token);
    const me = await apiRequest("/auth/me", { method: "GET" });
    return { worker: normalizeWorker(me.worker), token: data.token };
  },

  async login(email, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
      skipAuth: true,
    });
    tokenStorage.set(data.token, data.refresh_token);
    const me = await apiRequest("/auth/me", { method: "GET" });
    return { worker: normalizeWorker(me.worker), token: data.token };
  },

  // Self-service demo toggle — see server/src/controllers/authController.js's
  // becomeAdmin for why this has no separate admin signup flow.
  async becomeAdmin() {
    await apiRequest("/auth/become-admin", { method: "POST" });
    return { isAdmin: true };
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
