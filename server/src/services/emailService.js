const axios = require("axios");
const env = require("../config/env");
const logger = require("../utils/logger");

// Sends via SendGrid's HTTP API directly (no @sendgrid/mail dependency,
// since it wasn't in BackendPrompt.md's package.json list). Falls back to
// logging the notification instead of sending when unconfigured, same
// pattern as twilioService — lets the rest of the app function without a
// SendGrid account yet.
async function send(to, subject, body) {
  if (!env.SENDGRID_API_KEY) {
    logger.warn("SENDGRID_API_KEY not configured — logging notification instead of emailing", {
      to,
      subject,
      body,
    });
    return { delivered: false, mode: "console" };
  }

  await axios.post(
    "https://api.sendgrid.com/v3/mail/send",
    {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "notifications@swiftsettle.app", name: "SwiftSettle" },
      subject,
      content: [{ type: "text/plain", value: body }],
    },
    { headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}` } }
  );

  return { delivered: true, mode: "email" };
}

// The 5 notification copies specified in updatedPrompt.md section 8.
const notifications = {
  daysUntilCertificate: (email, days) =>
    send(email, "You're getting close!", `You're ${days} days away from your financial identity certificate.`),

  scoreImproved: (email, points) =>
    send(email, "Your score just went up", `Your financial score just improved by ${points} points.`),

  creditEligible: (email, amount) =>
    send(email, "You're eligible for credit", `You're eligible for credit access now (₦${amount.toLocaleString()} available).`),

  creditApproved: (email, amount, rate) =>
    send(email, "Credit approved", `Your credit was approved: ₦${amount.toLocaleString()} at ${rate}% interest.`),

  dailyRepayment: (email, amount) =>
    send(email, "Daily repayment deducted", `Daily credit repayment: ₦${amount.toLocaleString()} deducted from today's settlement.`),
};

module.exports = { send, notifications };
