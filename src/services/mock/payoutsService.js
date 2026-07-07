import { simulate } from "../core/simulate";
import { earningsService } from "./earningsService";
import { currentWorker } from "../../data/mockData";

// Mirrors the live backend's shape exactly (snake_case, same field names)
// so the frontend payout components need no API_MODE branching. Bundles
// whatever's currently "pending" in mock/earningsService's shared order
// list — same underlying demo state Simulate Delivery writes to.
const payoutRequests = [];
let requestSeq = 1;

export const payoutsService = {
  async request() {
    const orders = earningsService.getMockOrders();
    const pending = orders.filter((o) => o.status === "pending");
    if (pending.length === 0) {
      return Promise.reject(new Error("No completed orders awaiting payout."));
    }

    const requestedTotal = pending.reduce((sum, o) => sum + o.amount, 0);
    const payoutRequest = {
      id: `mock-payout-${requestSeq++}`,
      worker_id: currentWorker.id,
      requested_total: requestedTotal,
      status: "requested",
      received_amount: null,
      requested_at: new Date().toISOString(),
      processed_at: null,
      earnings: pending,
    };

    pending.forEach((o) => {
      o.status = "requested";
    });
    payoutRequests.push(payoutRequest);

    return simulate({ payout_request: payoutRequest }, { delay: 600 });
  },

  async mine() {
    return simulate([...payoutRequests].reverse(), { delay: 400 });
  },

  async all() {
    const withWorker = payoutRequests.map((r) => ({
      ...r,
      worker: { full_name: currentWorker.fullName, email: currentWorker.email },
    }));
    return simulate([...withWorker].reverse(), { delay: 400 });
  },

  async process(id, amount) {
    const payoutRequest = payoutRequests.find((r) => r.id === id);
    if (!payoutRequest || payoutRequest.status !== "requested") {
      return Promise.reject(new Error("This payout request was already processed or does not exist."));
    }

    const expected = payoutRequest.requested_total;
    const status = amount === expected ? "matched" : amount < expected ? "underpaid" : "overpaid";

    let allocated = 0;
    payoutRequest.earnings.forEach((order, index) => {
      const isLast = index === payoutRequest.earnings.length - 1;
      const share = isLast
        ? Math.round((amount - allocated) * 100) / 100
        : Math.round(((order.amount / expected) * amount) * 100) / 100;
      allocated += share;
      order.status = status;
      order.receivedAmount = share;
    });

    payoutRequest.status = status;
    payoutRequest.received_amount = amount;
    payoutRequest.processed_at = new Date().toISOString();

    return simulate({ payout_request: payoutRequest }, { delay: 900 });
  },
};
