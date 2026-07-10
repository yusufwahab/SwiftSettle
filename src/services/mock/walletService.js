import { simulate } from "../core/simulate";
import { balanceSummary, todayActivity, currentWorker } from "../../data/mockData";
import { earningsService } from "./earningsService";

export const walletService = {
  async getBalance() {
    return simulate({ ...balanceSummary }, { delay: 500 });
  },

  async getTodayActivity() {
    // Static demo rows are treated as already-settled history; anything
    // created via Simulate Delivery/Payment on top of them carries real
    // pending/matched/underpaid/overpaid status so the reconciliation UI
    // has something to show in mock mode too.
    const staticRows = todayActivity.map((row) => ({ ...row, receivedAmount: row.amount, status: "matched" }));
    const demoRows = earningsService.getMockOrders().map((o) => ({
      id: o.id,
      label: o.label,
      time: new Date(o.recordedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      amount: o.amount,
      receivedAmount: o.receivedAmount ?? null,
      status: o.status,
    }));
    return simulate([...demoRows, ...staticRows], { delay: 500 });
  },

  async getPaymentMethod() {
    return simulate({ ...currentWorker.bank }, { delay: 400 });
  },

  // Worker chooses how much to transfer, not necessarily the full balance.
  // Deducted from the shared balanceSummary immediately (on the success
  // path only) so getBalance() reflects it on the very next call, same as
  // the live backend now does — not a stagnant number until some later
  // webhook confirms it.
  async settle(amount) {
    const requested = Number(amount) || 0;
    if (requested <= 0) {
      return Promise.reject(new Error("Enter an amount greater than zero."));
    }
    if (requested > balanceSummary.available) {
      return Promise.reject(new Error(`Available balance is only ₦${balanceSummary.available.toLocaleString()}.`));
    }

    // A visible failure path is part of the spec (Settlement Failed state),
    // so a slice of attempts intentionally reject — decided up front so a
    // failed transfer never deducts the balance.
    const willFail = Math.random() < 0.2;
    if (!willFail) {
      balanceSummary.available = Math.round((balanceSummary.available - requested) * 100) / 100;
      balanceSummary.updatedAt = "just now";
    }

    return simulate(
      {
        amount: requested,
        reference: `SW-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        bank: currentWorker.bank.name,
      },
      { delay: 2200, failRate: willFail ? 1 : 0 }
    );
  },
};
