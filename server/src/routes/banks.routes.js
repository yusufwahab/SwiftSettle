const express = require("express");
const { requireAuth } = require("../middleware/auth");
const nombaService = require("../services/nombaService");

const router = express.Router();

// GET /api/banks -> [{ code, name }]
// Real bank name+code pairs from Nomba's own directory (GET
// /v1/transfers/banks), not the static name-only list the onboarding
// wizard used before — that list had no bank codes at all, which is what
// caused every settlement to fail with "bankCode must be exactly 3 or 6
// digits". Authenticated (not public) purely because every other endpoint
// in this app is; the data itself isn't worker-specific.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const banks = await nombaService.getBankList();
    res.json({ banks });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
