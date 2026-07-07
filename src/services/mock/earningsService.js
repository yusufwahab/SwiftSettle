import { simulate } from "../core/simulate";
import { weeklyEarnings, monthlyEarnings, earningsStats, performanceMetrics } from "../../data/mockData";

// Mirrors the live backend's two-step reconciliation model (pending order ->
// matched/underpaid/overpaid once "paid") closely enough that the mock
// layer's Simulate Delivery / Simulate Payment buttons behave the same way
// the real Nomba-backed flow does, without needing a server. Module-level
// state so walletService.getTodayActivity() (mock) can read the same list.
const mockOrders = [];
let orderSeq = 1;

export const earningsService = {
  async getWeekly() {
    return simulate([...weeklyEarnings], { delay: 600 });
  },

  async getMonthly() {
    return simulate([...monthlyEarnings], { delay: 600 });
  },

  async getStats() {
    return simulate({ ...earningsStats }, { delay: 500 });
  },

  async getPerformance() {
    return simulate({ ...performanceMetrics }, { delay: 500 });
  },

  // Step 1 of the demo flow: reports a new pending order, same as a real
  // platform webhook would — doesn't credit balance yet.
  async simulate() {
    const amount = Math.round((800 + Math.random() * 2200) / 50) * 50;
    mockOrders.push({
      id: `mock-order-${orderSeq++}`,
      label: "Delivery completed",
      amount,
      status: "pending",
      recordedAt: new Date().toISOString(),
    });
    return simulate({ simulated: true, amount }, { delay: 500 });
  },

  // Step 2: simulates the customer/platform payment actually landing —
  // matches against the target order and can deliberately over/underpay.
  async simulatePayment({ amount, earningId } = {}) {
    const target = earningId
      ? mockOrders.find((o) => o.id === earningId && o.status === "pending")
      : mockOrders.find((o) => o.status === "pending");

    const payAmount = Number(amount) || target?.amount;
    if (!payAmount) {
      return Promise.reject(new Error("No pending order to pay — specify an amount."));
    }

    let status = "unmatched";
    if (target) {
      status = payAmount === target.amount ? "matched" : payAmount < target.amount ? "underpaid" : "overpaid";
      target.status = status;
      target.receivedAmount = payAmount;
      target.reconciledAt = new Date().toISOString();
    }

    return simulate(
      { simulated: true, amount: payAmount, expected_amount: target?.amount ?? null, status },
      { delay: 900 }
    );
  },

  // Internal — read by mock/walletService.getTodayActivity() to merge
  // demo-created orders into the activity feed.
  getMockOrders() {
    return mockOrders;
  },
};
