require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

function optional(name, fallback = "") {
  return process.env[name] || fallback;
}

const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: Number(optional("PORT", "5000")),
  API_URL: optional("API_URL", "http://localhost:5000"),

  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_ANON_KEY: required("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRE: optional("JWT_EXPIRE", "7d"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRE: optional("REFRESH_TOKEN_EXPIRE", "30d"),

  // Nomba and Twilio are validated as "present or not" rather than required
  // at boot — nombaService/twilioService throw a clear config error only
  // when a call is actually attempted without them, and twilioService falls
  // back to console-logging OTP codes. This keeps `npm run dev` usable
  // before you've created Nomba/Twilio accounts.
  NOMBA_API_KEY: optional("NOMBA_API_KEY"),
  NOMBA_API_SECRET: optional("NOMBA_API_SECRET"),
  NOMBA_BASE_URL: optional("NOMBA_BASE_URL", "https://api.nomba.com"),
  NOMBA_WEBHOOK_SECRET: optional("NOMBA_WEBHOOK_SECRET"),
  // The `accountId` header on every Nomba call — always the PARENT/main
  // account, never the sub-account, even when a call is scoped to a
  // sub-account via a path parameter (see nombaService.js).
  NOMBA_PARENT_ACCOUNT_ID: optional("NOMBA_PARENT_ACCOUNT_ID"),
  // SwiftSettle's own sub-account under that parent — one fixed value for
  // the whole business, not one per worker. Used as a path parameter on
  // virtual-account-creation and transfer calls.
  NOMBA_SUB_ACCOUNT_ID: optional("NOMBA_SUB_ACCOUNT_ID"),

  PLATFORM_WEBHOOK_SECRET: optional("PLATFORM_WEBHOOK_SECRET"),

  // Brevo handles both signup email-OTP delivery and every other
  // notification email. No Twilio/SendGrid anywhere anymore — auth moved
  // from phone+OTP to email+password, so there's no SMS to send at all.
  BREVO_API_KEY: optional("BREVO_API_KEY"),
  BREVO_SENDER_EMAIL: optional("BREVO_SENDER_EMAIL", "notifications@swiftsettle.app"),
  BREVO_SENDER_NAME: optional("BREVO_SENDER_NAME", "SwiftSettle"),

  // Not in BackendPrompt.md's env list — added because GET
  // /behavioral-analytics is explicitly "internal" (updatedPrompt.md) and
  // has no worker to authenticate as; something has to gate it.
  ADMIN_API_KEY: optional("ADMIN_API_KEY"),

  LOG_LEVEL: optional("LOG_LEVEL", "info"),
  SENTRY_DSN: optional("SENTRY_DSN"),

  ALLOWED_ORIGINS: optional("ALLOWED_ORIGINS", "http://localhost:5173").split(",").map((s) => s.trim()),
};

module.exports = env;
