const env = require("../config/env");
const logger = require("../utils/logger");

let client = null;
function getClient() {
  if (client) return client;
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) return null;
  // Lazy-required so a missing/invalid Twilio config never crashes boot.
  const twilio = require("twilio");
  client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
}

// Sends the OTP over SMS. If Twilio isn't configured yet, logs the code to
// the server console instead of throwing — lets you develop and test the
// whole auth flow locally before you've created a Twilio account.
async function sendOtpSms(phoneNumber, code) {
  const twilioClient = getClient();

  if (!twilioClient) {
    logger.warn("TWILIO not configured — logging OTP instead of sending SMS", {
      phoneNumber,
      code,
    });
    return { delivered: false, mode: "console" };
  }

  await twilioClient.messages.create({
    to: phoneNumber,
    from: env.TWILIO_PHONE_NUMBER,
    body: `Your SwiftSettle verification code is ${code}. It expires in 5 minutes.`,
  });

  return { delivered: true, mode: "sms" };
}

module.exports = { sendOtpSms };
