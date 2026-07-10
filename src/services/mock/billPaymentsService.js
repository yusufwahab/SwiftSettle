import { simulate } from "../core/simulate";
import { balanceSummary, notifications } from "../../data/mockData";

// Mirrors the live backend's shape exactly (snake_case field names) so the
// frontend needs no API_MODE branching.
const billPayments = [];
let paymentSeq = 1;

// Deterministic per (account number, bank code) so the same recipient
// always "resolves" to the same name across repeated payments — needed for
// the recurring-recipient credit-score signal to make sense in mock mode.
const DEMO_NAMES = ["Adebayo Okonkwo", "Fatima Mohammed", "Emeka Nwosu", "Blessing Eze", "Tunde Bakare"];
function demoAccountName(accountNumber) {
  const seed = String(accountNumber)
    .split("")
    .reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return DEMO_NAMES[seed % DEMO_NAMES.length];
}

export const billPaymentsService = {
  async verifyRecipient(accountNumber, bankCode) {
    if (!/^\d{10}$/.test(accountNumber)) {
      return Promise.reject(new Error("Enter a valid 10-digit account number."));
    }
    if (!bankCode) {
      return Promise.reject(new Error("Select a bank."));
    }
    return simulate({ account_number: accountNumber, account_name: demoAccountName(accountNumber) }, { delay: 700 });
  },

  async create({ category, accountNumber, bankCode, bankName, accountName, amount }) {
    const requested = Number(amount) || 0;
    if (requested <= 0) {
      return Promise.reject(new Error("Enter an amount greater than zero."));
    }
    if (requested > balanceSummary.available) {
      return Promise.reject(new Error(`Available balance is only ₦${balanceSummary.available.toLocaleString()}.`));
    }

    const willFail = Math.random() < 0.1;
    const billPayment = {
      id: `mock-bill-${paymentSeq++}`,
      category,
      recipient_account_number: accountNumber,
      recipient_bank_code: bankCode,
      recipient_bank_name: bankName,
      recipient_account_name: accountName,
      amount: requested,
      status: willFail ? "failed" : "completed",
      reference_number: `BILL-${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
    };
    billPayments.unshift(billPayment);

    if (!willFail) {
      balanceSummary.available = Math.round((balanceSummary.available - requested) * 100) / 100;
      balanceSummary.updatedAt = "just now";
      notifications.unshift({
        id: `n-bill-${billPayment.id}`,
        type: "success",
        text: `₦${requested.toLocaleString()} sent to ${accountName} (${category.replace("_", " ")}).`,
        time: "Just now",
      });
    }

    return simulate(
      { bill_payment_id: billPayment.id, status: billPayment.status, reference: billPayment.reference_number },
      { delay: 1200, failRate: willFail ? 1 : 0 }
    );
  },

  async list() {
    return simulate([...billPayments], { delay: 400 });
  },
};
