const crypto = require("crypto");
const env = require("../config/env");

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a || "", "utf8");
  const bufB = Buffer.from(b || "", "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Verified against developer.nomba.com/docs/api-basics/webhook (2026-07-06).
// Nomba does NOT sign the raw request body. It signs a colon-joined string
// of specific fields plus the nomba-timestamp header, HMAC-SHA256'd with
// your webhook secret and Base64-encoded (not hex):
//
//   event_type:requestId:userId:walletId:transactionId:type:time:responseCode:timestamp
//
// headers: nomba-signature, nomba-signature-algorithm (HmacSHA256),
// nomba-signature-version (1.0.0), nomba-timestamp (RFC-3339).
// Shared by both the inbound signature check below and
// earningsController.simulateCustomerPayment (which builds a synthetic
// event using this exact same scheme + our own NOMBA_WEBHOOK_SECRET, then
// sends it through the real /webhooks/nomba endpoint — a legitimate
// self-test pattern, not a bypass, since that secret is the one Nomba
// itself signs with).
function computeNombaSignature(body, timestamp, secret) {
  const merchant = body.data?.merchant || {};
  const transaction = body.data?.transaction || {};

  const signedString = [
    body.event_type,
    body.requestId,
    merchant.userId,
    merchant.walletId,
    transaction.transactionId,
    transaction.type,
    transaction.time,
    transaction.responseCode,
    timestamp,
  ]
    .map((v) => v ?? "")
    .join(":");

  return crypto.createHmac("sha256", secret).update(signedString).digest("base64");
}

function validateNombaWebhook(req, res, next) {
  const signature = req.headers["nomba-signature"];
  const timestamp = req.headers["nomba-timestamp"];

  if (!signature || !timestamp) {
    return res.status(401).json({ error: "invalid_signature", message: "Missing Nomba signature headers." });
  }
  if (!env.NOMBA_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "webhook_not_configured", message: "NOMBA_WEBHOOK_SECRET is not set." });
  }

  const expected = computeNombaSignature(req.body || {}, timestamp, env.NOMBA_WEBHOOK_SECRET);

  if (!timingSafeEqual(expected, signature)) {
    return res.status(401).json({ error: "invalid_signature", message: "Nomba webhook signature check failed." });
  }
  next();
}

// The platform-webhook signature scheme (DoorDash/Jumia/Uber style) isn't
// specified anywhere — every gig platform does this differently, and none
// of them is a real integration yet. This implements the generic,
// widely-used pattern (HMAC-SHA256 over the raw JSON body) as a placeholder
// that will need to be swapped for whatever each real platform partner
// actually documents.
function validatePlatformWebhook(req, res, next) {
  const signature = req.headers["x-platform-signature"];
  if (!env.PLATFORM_WEBHOOK_SECRET || !signature) {
    return res.status(401).json({ error: "invalid_signature", message: "Missing platform webhook signature." });
  }

  const expected = crypto
    .createHmac("sha256", env.PLATFORM_WEBHOOK_SECRET)
    .update(req.rawBody || Buffer.alloc(0))
    .digest("hex");

  if (!timingSafeEqual(expected, signature)) {
    return res.status(401).json({ error: "invalid_signature", message: "Platform webhook signature check failed." });
  }
  next();
}

module.exports = { validateNombaWebhook, validatePlatformWebhook, computeNombaSignature };
