import { simulate } from "../core/simulate";
import { currentWorker } from "../../data/mockData";

export const authService = {
  async requestOtp(phone) {
    if (!phone) {
      throw new Error("Enter a phone number.");
    }
    return simulate({ sent: true, phone }, { delay: 700 });
  },

  async verifyOtp(phone, otp) {
    if (!otp) {
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
