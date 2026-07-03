import { simulate } from "../core/simulate";
import { balanceSummary, todayActivity, currentWorker } from "../../data/mockData";

export const walletService = {
  async getBalance() {
    return simulate({ ...balanceSummary }, { delay: 500 });
  },

  async getTodayActivity() {
    return simulate([...todayActivity], { delay: 500 });
  },

  async getPaymentMethod() {
    return simulate({ ...currentWorker.bank }, { delay: 400 });
  },

  async settle() {
    // A visible failure path is part of the spec (Settlement Failed state),
    // so a slice of attempts intentionally reject.
    return simulate(
      {
        amount: balanceSummary.available,
        reference: `SW-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        bank: currentWorker.bank.name,
      },
      { delay: 2200, failRate: 0.2 }
    );
  },
};
