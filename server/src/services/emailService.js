const axios = require("axios");
const env = require("../config/env");
const logger = require("../utils/logger");

// Verified against developers.brevo.com (2026-07-06):
//   POST https://api.brevo.com/v3/smtp/email
//   headers: api-key, Content-Type: application/json
//   body: { sender: {email, name}, to: [{email, name}], subject, htmlContent }
// Falls back to logging instead of sending when unconfigured, same pattern
// as the rest of this backend's third-party integrations — lets the app
// run locally before you've created a Brevo account.
async function send(to, subject, htmlContent, { name } = {}) {
  if (!env.BREVO_API_KEY) {
    logger.warn("BREVO_API_KEY not configured — logging email instead of sending", { to, subject, htmlContent });
    return { delivered: false, mode: "console" };
  }

  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
      to: [{ email: to, name: name || to }],
      subject,
      htmlContent,
    },
    { headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json" } }
  );

  return { delivered: true, mode: "email" };
}

// Signup / login email-OTP delivery — this is now the *only* OTP channel
// in the app (auth moved from phone+OTP to email+password with an
// email-verification code at signup).
async function sendOtpEmail(email, code) {
  return send(
    email,
    "Your SwiftSettle verification code",
    `<p>Your SwiftSettle verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`
  );
}

// The 5 notification copies specified in updatedPrompt.md section 8.
const notifications = {
  daysUntilCertificate: (email, days) =>
    send(email, "You're getting close!", `<p>You're ${days} days away from your financial identity certificate.</p>`),

  scoreImproved: (email, points) =>
    send(email, "Your score just went up", `<p>Your financial score just improved by ${points} points.</p>`),

  creditEligible: (email, amount) =>
    send(
      email,
      "You're eligible for credit",
      `<p>You're eligible for credit access now (₦${amount.toLocaleString()} available).</p>`
    ),

  creditApproved: (email, amount, rate) =>
    send(email, "Credit approved", `<p>Your credit was approved: ₦${amount.toLocaleString()} at ${rate}% interest.</p>`),

  dailyRepayment: (email, amount) =>
    send(
      email,
      "Daily repayment deducted",
      `<p>Daily credit repayment: ₦${amount.toLocaleString()} deducted from today's settlement.</p>`
    ),

  // Confirmation code for a payout request — delivered by email + an in-app
  // notification (notificationService), not SMS. No SMS provider (Termii or
  // similar) is configured for this build; both channels the worker already
  // has are used instead of adding that dependency.
  payoutConfirmationCode: (email, code) =>
    send(
      email,
      "Confirm your payout request",
      `<p>Your payout confirmation code is <strong>${code}</strong>.</p><p>Enter it on the Request Payout page to confirm. It expires in 15 minutes.</p>`
    ),

  payoutProcessed: (email, { status, expected, received }) => {
    const statusCopy = {
      matched: "in full",
      underpaid: `partially — ₦${received.toLocaleString()} of the ₦${expected.toLocaleString()} requested`,
      overpaid: `in excess — ₦${received.toLocaleString()} against the ₦${expected.toLocaleString()} requested`,
    };
    return send(
      email,
      "Your payout has been processed",
      `<p>Your payout request has been processed ${statusCopy[status] || ""}.</p><p>Amount received: ₦${received.toLocaleString()}.</p>`
    );
  },
};

module.exports = { send, sendOtpEmail, notifications };
