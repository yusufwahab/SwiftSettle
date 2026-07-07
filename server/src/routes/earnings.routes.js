const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../utils/validators");
const earningsController = require("../controllers/earningsController");

const router = express.Router();

router.use(requireAuth);
router.get("/balance", earningsController.getBalance);
router.get("/history", earningsController.getHistory);
router.get("/daily", earningsController.getDaily);
router.post("/simulate", earningsController.simulateEarning);
router.post("/simulate-payment", validate("simulatePayment"), earningsController.simulateCustomerPayment);

module.exports = router;
