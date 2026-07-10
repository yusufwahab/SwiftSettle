import { simulate } from "../core/simulate";
import { earningsService } from "./earningsService";
import { currentWorker, notifications } from "../../data/mockData";

// Mirrors the live backend's shape exactly (snake_case, same field names)
// so the frontend payout components need no API_MODE branching. Bundles
// whatever's currently "pending" in mock/earningsService's shared order
// list — same underlying demo state "Log Completed Order" writes to.
const payoutRequests = [];
let requestSeq = 1;
const CONFIRMATION_CODE_TTL_MS = 15 * 60 * 1000;

// Mirrors the live backend exactly: the code is never returned in the
// request/resend response — it only ever shows up via a notification, so
// the mock experience of "go check your notifications" is real here too,
// not faked away for convenience.
function issueConfirmationCode(payoutRequest) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  payoutRequest._code = code;
  payoutRequest.confirmation_code_expires_at = new Date(Date.now() + CONFIRMATION_CODE_TTL_MS).toISOString();
  payoutRequest.confirmed_at = null;

  notifications.unshift({
    id: `n-payout-code-${payoutRequest.id}-${Date.now()}`,
    type: "primary",
    text: `Your confirmation code is ${code}. Enter it on the Request Payout page to confirm — it expires in 15 minutes.`,
    time: "Just now",
  });
}

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
    issueConfirmationCode(payoutRequest);
    payoutRequests.push(payoutRequest);

    return simulate({ payout_request: payoutRequest }, { delay: 600 });
  },

  async confirm(id, code) {
    const payoutRequest = payoutRequests.find((r) => r.id === id);
    if (!payoutRequest) return Promise.reject(new Error("Payout request not found."));
    if (payoutRequest.confirmed_at) return Promise.reject(new Error("This payout request is already confirmed."));
    if (!payoutRequest._code || new Date(payoutRequest.confirmation_code_expires_at) < new Date()) {
      return Promise.reject(new Error("That code has expired — request a new one."));
    }
    if (code !== payoutRequest._code) {
      return Promise.reject(new Error("That code is incorrect."));
    }

    payoutRequest.confirmed_at = new Date().toISOString();
    payoutRequest._code = null;
    return simulate({ payout_request: payoutRequest }, { delay: 400 });
  },

  async resendCode(id) {
    const payoutRequest = payoutRequests.find((r) => r.id === id);
    if (!payoutRequest || payoutRequest.status !== "requested") {
      return Promise.reject(new Error("This payout request has already been processed."));
    }
    issueConfirmationCode(payoutRequest);
    return simulate({ confirmation_code_expires_at: payoutRequest.confirmation_code_expires_at }, { delay: 400 });
  },

  async mine() {
    return simulate(
      // eslint-disable-next-line no-unused-vars
      [...payoutRequests].reverse().map(({ _code, ...safe }) => safe),
      { delay: 400 }
    );
  },

  async all() {
    // eslint-disable-next-line no-unused-vars
    const withWorker = payoutRequests.map(({ _code, ...safe }) => ({
      ...safe,
      worker: { full_name: currentWorker.fullName, email: currentWorker.email },
    }));
    return simulate([...withWorker].reverse(), { delay: 400 });
  },

  async process(id, amount) {
    const payoutRequest = payoutRequests.find((r) => r.id === id);
    if (!payoutRequest || payoutRequest.status !== "requested") {
      return Promise.reject(new Error("This payout request was already processed or does not exist."));
    }
    if (!payoutRequest.confirmed_at) {
      return Promise.reject(new Error("The worker hasn't confirmed this payout request yet."));
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
