const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/earnings", require("./earnings.routes"));
router.use("/settlements", require("./settlements.routes"));
router.use("/financial", require("./financial.routes"));
router.use("/credit", require("./credit.routes"));
router.use("/webhooks", require("./webhooks.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/banks", require("./banks.routes"));
router.use("/payouts", require("./payouts.routes"));
router.use("/notifications", require("./notifications.routes"));

module.exports = router;
