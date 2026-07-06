const supabase = require("../config/database");
const platformService = require("../services/platformService");
const { generateReference } = require("../utils/helpers");

async function getBalance(req, res, next) {
  try {
    const workerId = req.worker.id;

    const [{ data: earnings, error: earningsError }, { data: settlements, error: settlementsError }] =
      await Promise.all([
        supabase.from("earnings").select("amount, recorded_at").eq("worker_id", workerId),
        supabase.from("settlements").select("amount").eq("worker_id", workerId).eq("status", "completed"),
      ]);
    if (earningsError) throw earningsError;
    if (settlementsError) throw settlementsError;

    const totalEarned = (earnings || []).reduce((sum, e) => sum + Number(e.amount), 0);
    const totalSettled = (settlements || []).reduce((sum, s) => sum + Number(s.amount), 0);
    const balance = totalEarned - totalSettled;

    const today = new Date().toISOString().slice(0, 10);
    const dailyTotal = (earnings || [])
      .filter((e) => e.recorded_at.slice(0, 10) === today)
      .reduce((sum, e) => sum + Number(e.amount), 0);

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
      .select("amount, recorded_at")
      .eq("worker_id", workerId)
      .order("recorded_at", { ascending: true });
    if (error) throw error;

    const breakdown = {};
    for (const row of data || []) {
      const day = row.recorded_at.slice(0, 10);
      breakdown[day] = (breakdown[day] || 0) + Number(row.amount);
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

module.exports = { getBalance, getHistory, getDaily, simulateEarning };
