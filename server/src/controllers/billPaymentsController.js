const supabase = require("../config/database");
const nombaService = require("../services/nombaService");
const balanceService = require("../services/balanceService");
const { generateReference } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

// POST /api/bill-payments/verify-recipient — { account_number, bank_code }.
// Resolves the real account holder's name via Nomba before any money
// moves, so the worker confirms who they're actually paying rather than
// trusting a raw account number they might have mistyped.
async function verifyRecipient(req, res, next) {
  try {
    const { account_number: accountNumber, bank_code: bankCode } = req.body;
    const result = await nombaService.lookupBankAccount({ accountNumber, bankCode });
    res.json({ account_number: result.accountNumber, account_name: result.accountName });
  } catch (err) {
    next(err);
  }
}

// POST /api/bill-payments/create — { category, account_number, bank_code,
// bank_name, account_name, amount }. account_name must be exactly what
// verify-recipient returned — this endpoint doesn't re-verify it, but it's
// stored as given, not blindly trusted for the transfer itself (the
// transfer goes to account_number + bank_code either way; account_name is
// only ever narration/record-keeping on Nomba's side, same as settlements).
async function createBillPayment(req, res, next) {
  try {
    const worker = req.worker;
    const { category, account_number: accountNumber, bank_code: bankCode, bank_name: bankName, account_name: accountName, amount } =
      req.body;

    const available = await balanceService.getAvailableBalance(worker.id);
    if (amount > available) {
      throw new ApiError(422, "insufficient_balance", `Available balance is only ₦${available.toLocaleString()}.`);
    }

    const reference = generateReference("BILL");
    const { data: billPayment, error } = await supabase
      .from("bill_payments")
      .insert({
        worker_id: worker.id,
        category,
        recipient_account_number: accountNumber,
        recipient_bank_code: bankCode,
        recipient_bank_name: bankName || null,
        recipient_account_name: accountName,
        amount,
        status: "pending",
        reference_number: reference,
      })
      .select()
      .single();
    if (error) throw error;

    try {
      const transfer = await nombaService.transferToBank({
        amount,
        accountNumber,
        accountName,
        bankCode,
        reference,
        narration: `SwiftSettle ${category} payment`,
      });

      const { data: updated, error: updateError } = await supabase
        .from("bill_payments")
        .update({
          status: "processing",
          nomba_transfer_id: transfer.nombaTransferId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", billPayment.id)
        .select()
        .single();
      if (updateError) throw updateError;

      return res.json({
        bill_payment_id: updated.id,
        status: updated.status,
        reference: updated.reference_number,
      });
    } catch (transferError) {
      await supabase
        .from("bill_payments")
        .update({ status: "failed", error_message: transferError.message, updated_at: new Date().toISOString() })
        .eq("id", billPayment.id);
      throw transferError;
    }
  } catch (err) {
    next(err);
  }
}

// GET /api/bill-payments
async function listBillPayments(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const { data, error } = await supabase
      .from("bill_payments")
      .select("*")
      .eq("worker_id", req.worker.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    res.json({ bill_payments: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyRecipient, createBillPayment, listBillPayments };
