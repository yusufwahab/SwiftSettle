const express = require("express");
const { validateNombaWebhook, validatePlatformWebhook } = require("../middleware/validateWebhook");
const { validate } = require("../utils/validators");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

// No requireAuth here — these are server-to-server calls authenticated by
// signature verification (validateNombaWebhook / validatePlatformWebhook),
// not a worker's JWT.
router.post("/nomba", validateNombaWebhook, validate("nombaWebhook"), webhookController.handleNombaWebhook);
router.post("/platform", validatePlatformWebhook, validate("platformWebhook"), webhookController.handlePlatformWebhook);

module.exports = router;
