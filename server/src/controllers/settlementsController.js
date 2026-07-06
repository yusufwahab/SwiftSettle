const supabase = require("../config/database");
const nombaService = require("../services/nombaService");
const { generateReference } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

async function getAvailableBalance(workerId) {
  const [{ data: earnings }, { data: settlements }] = await Promise.all([
    supabase.from("earnings").select("amount").eq("worker_id", workerId),
    supabase.from("settlements").select("amount").eq("worker_id", workerId).in("status", ["completed", "processing", "pending"]),
  ]);
  const totalEarned = (earnings || []).reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCommitted = (settlements || []).reduce((sum, s) => sum + Number(s.amount), 0);
  return totalEarned - totalCommitted;
}

// POST /api/settlements/create
async function createSettlement(req, res, next) {
  try {
    const worker = req.worker;
    const { amount } = req.body;

    const available = await getAvailableBalance(worker.id);
    if (amount > available) {
      throw new ApiError(422, "insufficient_balance", `Available balance is only ₦${available.toLocaleString()}.`);
    }
    if (!worker.bank_verified || !worker.account_number || !worker.bank_code) {
      throw new ApiError(422, "no_bank_account", "Add a verified bank account before settling.");
    }

    const reference = generateReference("SETTLE");
    const { data: settlement, error } = await supabase
      .from("settlements")
      .insert({
        worker_id: worker.id,
        amount,
        status: "pending",
        reference_number: reference,
        destination_bank: worker.bank_name,
        destination_account: worker.account_number,
      })
      .select()
      .single();
    if (error) throw error;

    try {
      const transfer = await nombaService.transferToBank({
        amount,
        accountNumber: worker.account_number,
        accountName: worker.account_holder_name,
        bankCode: worker.bank_code,
        reference,
        narration: "SwiftSettle earnings settlement",
      });

      const { data: updated, error: updateError } = await supabase
        .from("settlements")
        .update({
          status: "processing",
          nomba_transfer_id: transfer.nombaTransferId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settlement.id)
        .select()
        .single();
      if (updateError) throw updateError;

      return res.json({ settlement_id: updated.id, status: updated.status, reference: updated.reference_number });
    } catch (transferError) {
      await supabase
        .from("settlements")
        .update({ status: "failed", error_message: transferError.message, updated_at: new Date().toISOString() })
        .eq("id", settlement.id);
      throw transferError;
    }
  } catch (err) {
    next(err);
  }
}

// GET /api/settlements/status/:settlement_id
async function getStatus(req, res, next) {
  try {
    const { data: settlement, error } = await supabase
      .from("settlements")
      .select("*")
      .eq("id", req.params.settlement_id)
      .eq("worker_id", req.worker.id)
      .maybeSingle();
    if (error) throw error;
    if (!settlement) throw new ApiError(404, "not_found", "Settlement not found.");

    res.json({
      status: settlement.status,
      amount: settlement.amount,
      reference: settlement.reference_number,
      settled_at: settlement.settled_at,
      bank: settlement.destination_bank,
      account: settlement.destination_account,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/settlements/history
async function getHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    let query = supabase
      .from("settlements")
      .select("*", { count: "exact" })
      .eq("worker_id", req.worker.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.status) query = query.eq("status", req.query.status);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ settlements: data, total: count });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSettlement, getStatus, getHistory, getAvailableBalance };
