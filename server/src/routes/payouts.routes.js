const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { validate } = require("../utils/validators");
const payoutsController = require("../controllers/payoutsController");

const router = express.Router();

router.use(requireAuth);

router.post("/request", payoutsController.createPayoutRequest);
router.get("/mine", payoutsController.listMine);

router.get("/all", requireAdmin, payoutsController.listAll);
router.post("/:id/process", requireAdmin, validate("processPayout"), payoutsController.process);

module.exports = router;
