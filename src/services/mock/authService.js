import { simulate } from "../core/simulate";
import { currentWorker } from "../../data/mockData";

export const authService = {
  async requestOtp(phone) {
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      throw new Error("Enter a valid phone number.");
    }
    return simulate({ sent: true, phone }, { delay: 700 });
  },

  async verifyOtp(phone, otp) {
    if (!otp || otp.length < 4) {
      throw new Error("Enter the code we sent you.");
    }
    return simulate({ worker: currentWorker, token: "mock_session_token" }, { delay: 700 });
  },

  async signup(payload) {
    return simulate(
      { worker: { ...currentWorker, ...payload }, token: "mock_session_token" },
      { delay: 900 }
    );
  },

  async logout() {
    return simulate({ ok: true }, { delay: 200 });
  },
};
