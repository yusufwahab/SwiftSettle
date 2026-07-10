const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../utils/validators");
const billPaymentsController = require("../controllers/billPaymentsController");

const router = express.Router();

router.use(requireAuth);

router.post("/verify-recipient", validate("verifyRecipient"), billPaymentsController.verifyRecipient);
router.post("/create", validate("createBillPayment"), billPaymentsController.createBillPayment);
router.get("/", billPaymentsController.listBillPayments);

module.exports = router;
