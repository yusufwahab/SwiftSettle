const express = require("express");
const env = require("../config/env");
const supabase = require("../config/database");

const router = express.Router();

// Simple shared-secret gate — there's no worker JWT to check here, this is
// an internal endpoint (updatedPrompt.md: "Internal endpoint for credit
// calculation"). No admin UI exists or is planned (per the prompt's
// explicit "don't create admin UI" instruction) — this is API-only.
router.use((req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (!env.ADMIN_API_KEY || key !== env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "unauthorized", message: "Missing or invalid admin key." });
  }
  next();
});

// GET /api/admin/behavioral-analytics?worker_id=...
router.get("/behavioral-analytics", async (req, res, next) => {
  try {
    const { worker_id: workerId } = req.query;
    let query = supabase.from("worker_behavioral_data").select("*").order("last_calculated", { ascending: false });
    if (workerId) query = query.eq("worker_id", workerId);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ behavioral_data: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
