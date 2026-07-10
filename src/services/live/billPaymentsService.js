import { apiRequest } from "../../lib/apiClient";

export const billPaymentsService = {
  // Resolves the real account holder's name via Nomba before any money
  // moves — the worker confirms who they're paying, not a raw account
  // number they might have mistyped.
  async verifyRecipient(accountNumber, bankCode) {
    return apiRequest("/bill-payments/verify-recipient", {
      method: "POST",
      body: { account_number: accountNumber, bank_code: bankCode },
    });
  },

  async create({ category, accountNumber, bankCode, bankName, accountName, amount }) {
    return apiRequest("/bill-payments/create", {
      method: "POST",
      body: {
        category,
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName,
        account_name: accountName,
        amount,
      },
    });
  },

  async list() {
    const { bill_payments: billPayments } = await apiRequest("/bill-payments", { method: "GET" });
    return billPayments || [];
  },
};
