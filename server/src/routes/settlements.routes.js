const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../utils/validators");
const settlementsController = require("../controllers/settlementsController");

const router = express.Router();

router.use(requireAuth);
router.post("/create", validate("createSettlement"), settlementsController.createSettlement);
router.get("/status/:settlement_id", settlementsController.getStatus);
router.get("/history", settlementsController.getHistory);

module.exports = router;
