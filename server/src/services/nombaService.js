const { nombaRequest, subAccountId } = require("../config/nomba");
const { generateReference } = require("../utils/helpers");

// All endpoint paths/fields verified against developer.nomba.com (2026-07-06).
// SwiftSettle is a sub-account of a parent Nomba account, so every call
// here uses the sub-account variant of the endpoint — {subAccountId} in the
// URL path — not the parent-account version. The accountId header (always
// the parent) is attached automatically by nombaRequest.

// POST /v1/accounts/virtual/{subAccountId}
// Creates a dedicated collection account for a worker. accountRef must be
// 16-64 chars and unique; accountName 8-64 chars.
async function createVirtualAccount(worker) {
  const accountRef = `WORKER-${worker.id}`.slice(0, 64);
  const accountName = worker.full_name.slice(0, 64).padEnd(8, " ").trim() || "SwiftSettle Worker";

  const response = await nombaRequest({
    method: "POST",
    url: `/v1/accounts/virtual/${subAccountId()}`,
    data: { accountRef, accountName },
  });

  const data = response.data;
  return {
    accountRef: data.accountRef,
    accountName: data.bankAccountName,
    bankName: data.bankName, // no numeric bank code is returned for virtual accounts
    bankAccountNumber: data.bankAccountNumber,
  };
}

// POST /v2/transfers/bank/{subAccountId}
// Settles a worker's balance to their real bank account. merchantTxRef is
// the idempotency key — reusing a settlement's own reference means a
// retried request against the same settlement can't double-pay.
async function transferToBank({ amount, accountNumber, accountName, bankCode, reference, narration }) {
  const merchantTxRef = reference || generateReference("SETTLE");

  const response = await nombaRequest({
    method: "POST",
    url: `/v2/transfers/bank/${subAccountId()}`,
    data: {
      amount,
      accountNumber,
      accountName,
      bankCode,
      merchantTxRef,
      senderName: "SwiftSettle",
      narration: narration || "SwiftSettle earnings settlement",
    },
  });

  // Nomba can respond 200 (SUCCESS/PENDING_BILLING/PROCESSING/FAILED, in
  // the body) or 201 (transfer queued, no final status yet — "don't retry
  // with a new reference" per their docs). Either way the webhook is what
  // actually confirms the outcome; this return value is provisional.
  const data = response.data;
  return {
    nombaTransferId: data.id,
    status: data.status || "PROCESSING",
    fee: data.fee,
    merchantTxRef,
  };
}

// POST /v1/transfers/bank/lookup — verified against developer.nomba.com
// (2026-07-12). No sub-account ID in the path (unlike transferToBank) —
// the accountId header nombaRequest already attaches is enough. Resolves
// the real account holder's name for a recipient before any money moves,
// so a worker sending a bill payment sees who they're actually paying
// instead of trusting a raw account number.
async function lookupBankAccount({ accountNumber, bankCode }) {
  const response = await nombaRequest({
    method: "POST",
    url: "/v1/transfers/bank/lookup",
    data: { accountNumber, bankCode },
  });

  return { accountNumber: response.data.accountNumber, accountName: response.data.accountName };
}

// GET /v1/transfers/banks
// Returns a plain array of [{ name, code }] (not wrapped in a `results`
// field — confirmed against the real sandbox response). Nomba's docs note
// bank codes rarely change, so this is cached in memory for the life of the
// process rather than hitting Nomba on every request.
let cachedBankList = null;

async function getBankList() {
  if (cachedBankList) return cachedBankList;

  const response = await nombaRequest({ method: "GET", url: "/v1/transfers/banks" });
  cachedBankList = response.data;
  return cachedBankList;
}

module.exports = { createVirtualAccount, transferToBank, getBankList, lookupBankAccount };
