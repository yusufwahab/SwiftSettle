const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../utils/validators");
const creditController = require("../controllers/creditController");

const router = express.Router();

router.use(requireAuth);
router.get("/eligibility", creditController.getEligibility);
router.post("/request", validate("creditRequest"), creditController.requestCredit);
router.get("/active-loans", creditController.getActiveLoans);
router.get("/repayment-schedule", creditController.getRepaymentSchedule);

module.exports = router;
