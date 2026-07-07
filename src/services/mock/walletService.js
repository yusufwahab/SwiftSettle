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
