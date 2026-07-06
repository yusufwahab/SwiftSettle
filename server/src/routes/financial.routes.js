const express = require("express");
const { requireAuth } = require("../middleware/auth");
const financialController = require("../controllers/financialController");

const router = express.Router();

router.use(requireAuth);
router.get("/score", financialController.getScore);
router.get("/identity-status", financialController.getIdentityStatus);
router.get("/certificate", financialController.getCertificate);

module.exports = router;
