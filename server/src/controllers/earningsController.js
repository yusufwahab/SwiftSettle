const crypto = require("crypto");
const supabase = require("../config/database");
const platformService = require("../services/platformService");
const { computeNombaSignature } = require("../middleware/validateWebhook");
const { generateReference, RECONCILED_EARNING_STATUSES } = require("../utils/helpers");
const env = require("../config/env");
const { ApiError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

async function getBalance(req, res, next) {
  try {
    const workerId = req.worker.id;

    // Only earnings actually reconciled against a real VA deposit count as
    // spendable balance — a pending platform-reported order isn't money yet.
    const [{ data: earnings, error: earningsError }, { data: settlements, error: settlementsError }] =
      await Promise.all([
        supabase
          .from("earnings")
          .select("received_amount, reconciled_at")
          .eq("worker_id", workerId)
          .in("status", RECONCILED_EARNING_STATUSES),
        supabase.from("settlements").select("amount").eq("worker_id", workerId).eq("status", "completed"),
      ]);
    if (earningsError) throw earningsError;
    if (settlementsError) throw settlementsError;

    const totalEarned = (earnings || []).reduce((sum, e) => sum + Number(e.received_amount), 0);
    const totalSettled = (settlements || []).reduce((sum, s) => sum + Number(s.amount), 0);
    const balance = totalEarned - totalSettled;

    const today = new Date().toISOString().slice(0, 10);
    const dailyTotal = (earnings || [])
      .filter((e) => e.reconciled_at.slice(0, 10) === today)
      .reduce((sum, e) => sum + Number(e.received_amount), 0);

    const { data: behavioral } = await supabase
      .from("worker_behavioral_data")
      .select("daily_earnings")
      .eq("worker_id", workerId)
      .order("last_calculated", { ascending: false })
      .limit(1)
      .maybeSingle();

    res.json({
      balance,
      updated_at: new Date().toISOString(),
      daily_total: dailyTotal,
      earnings_trend: behavioral?.daily_earnings || [],
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const workerId = req.worker.id;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    let query = supabase
      .from("earnings")
      .select("*", { count: "exact" })
      .eq("worker_id", workerId)
      .order("recorded_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.start_date) query = query.gte("recorded_at", req.query.start_date);
    if (req.query.end_date) query = query.lte("recorded_at", req.query.end_date);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ earnings: data, total: count, page: Math.floor(offset / limit) + 1 });
  } catch (err) {
    next(err);
  }
}

async function getDaily(req, res, next) {
  try {
    const workerId = req.worker.id;
    const { data, error } = await supabase
      .from("earnings")
      .select("received_amount, reconciled_at")
      .eq("worker_id", workerId)
      .in("status", RECONCILED_EARNING_STATUSES)
      .order("reconciled_at", { ascending: true });
    if (error) throw error;

    const breakdown = {};
    for (const row of data || []) {
      const day = row.reconciled_at.slice(0, 10);
      breakdown[day] = (breakdown[day] || 0) + Number(row.received_amount);
    }

    res.json({ daily_breakdown: breakdown });
  } catch (err) {
    next(err);
  }
}

// POST /api/earnings/simulate
// There's no real gig-platform partner wired up yet — nothing calls
// POST /webhooks/platform for real orders. Rather than requiring a
// developer to hand-insert `earnings` rows in Supabase for every worker who
// wants to see the settlement flow work, any logged-in worker can trigger
// this themselves to record one simulated completed delivery on their own
// account. Goes through the exact same platformService.recordEarning() path
// a real platform webhook would, so balance/behavioral-data updates stay
// consistent with the real flow — this is a different entry point into the
// same logic, not a shortcut around it.
async function simulateEarning(req, res, next) {
  try {
    const worker = req.worker;
    const amount = Number(req.body?.amount) || Math.round((800 + Math.random() * 2200) / 50) * 50;

    await platformService.recordEarning({
      workerId: worker.id,
      platform: worker.platform || "Demo Platform",
      orderId: generateReference("DEMO"),
      amount,
      description: "Simulated delivery (demo)",
    });

    res.json({ simulated: true, amount });
  } catch (err) {
    next(err);
  }
}

// POST /api/earnings/simulate-payment
// The other half of the demo flow: simulateEarning() (above) reports a
// pending order, same as a real platform webhook would. This simulates the
// *payment* — the step that would normally be a real customer/platform bank
// transfer landing in the worker's Nomba virtual account. Nomba's sandbox
// has no API or dashboard tool to trigger that deposit on demand (VAs only
// accept real interbank transfers), so this builds the exact payment_success
// event Nomba would send, signs it with our real NOMBA_WEBHOOK_SECRET using
// the same scheme validateNombaWebhook checks, and POSTs it to our own
// /webhooks/nomba endpoint — the entire reconciliation pipeline (signature
// verification, worker lookup, matching, over/underpayment handling) runs
// for real; only the deposit's origin is synthetic. Passing an `amount` that
// differs from the pending order's is intentional — that's how this proves
// under/overpayment handling instead of only the happy path.
async function simulateCustomerPayment(req, res, next) {
  try {
    const worker = req.worker;
    const { amount, earning_id: earningId } = req.body || {};

    let target = null;
    if (earningId) {
      const { data, error } = await supabase
        .from("earnings")
        .select("*")
        .eq("id", earningId)
        .eq("worker_id", worker.id)
        .eq("status", "pending")
        .maybeSingle();
      if (error) throw error;
      target = data;
    } else {
      const { data, error } = await supabase
        .from("earnings")
        .select("*")
        .eq("worker_id", worker.id)
        .eq("status", "pending")
        .order("recorded_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      target = data;
    }

    const payAmount = Number(amount) || (target ? Number(target.amount) : null);
    if (!payAmount) {
      throw new ApiError(422, "amount_required", "No pending order to pay — specify an amount.");
    }

    const { data: virtualAccount, error: vaError } = await supabase
      .from("virtual_accounts")
      .select("bank_account_number")
      .eq("worker_id", worker.id)
      .maybeSingle();
    if (vaError) throw vaError;
    if (!virtualAccount) {
      throw new ApiError(422, "no_virtual_account", "Complete bank details in onboarding first.");
    }

    const transactionId = generateReference("SIMPAY");
    const timestamp = new Date().toISOString();
    const payload = {
      event_type: "payment_success",
      requestId: crypto.randomUUID(),
      data: {
        merchant: {
          walletId: env.NOMBA_SUB_ACCOUNT_ID || "demo-wallet",
          walletBalance: 0,
          userId: env.NOMBA_MAIN_ACCOUNT_ID || "demo-user",
        },
        transaction: {
          aliasAccountNumber: virtualAccount.bank_account_number,
          aliasAccountReference: `WORKER-${worker.id}`,
          transactionId,
          type: "vact_transfer",
          transactionAmount: payAmount,
          fee: 0,
          time: timestamp,
          responseCode: "00",
        },
        customer: {
          senderName: "Demo Payer",
          bankName: "Demo Bank",
          accountNumber: "0000000000",
          bankCode: "000",
        },
      },
    };

    const signature = computeNombaSignature(payload, timestamp, env.NOMBA_WEBHOOK_SECRET);

    const response = await fetch(`${env.API_URL}/api/webhooks/nomba`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "nomba-signature": signature,
        "nomba-timestamp": timestamp,
        "nomba-signature-algorithm": "HmacSHA256",
        "nomba-signature-version": "1.0.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      logger.error("Simulated payment webhook call failed", { status: response.status, body });
      throw new ApiError(502, "webhook_call_failed", "Simulated payment could not be processed.");
    }

    const { data: reconciled } = await supabase
      .from("earnings")
      .select("*")
      .eq("nomba_transaction_id", transactionId)
      .maybeSingle();

    res.json({
      simulated: true,
      amount: payAmount,
      expected_amount: target ? Number(target.amount) : null,
      status: reconciled?.status || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, getHistory, getDaily, simulateEarning, simulateCustomerPayment };
