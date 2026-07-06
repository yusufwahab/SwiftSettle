const express = require("express");
const { requireAuth } = require("../middleware/auth");
const earningsController = require("../controllers/earningsController");

const router = express.Router();

router.use(requireAuth);
router.get("/balance", earningsController.getBalance);
router.get("/history", earningsController.getHistory);
router.get("/daily", earningsController.getDaily);

module.exports = router;
