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

  // ---- Nomba ----
  // Variable names below mirror exactly what Nomba's own onboarding email
  // calls each value, so there's no translation step when copying them in:
  //   "Main (parent) Account ID"      -> NOMBA_MAIN_ACCOUNT_ID
  //   "Your sub-account ID"           -> NOMBA_SUB_ACCOUNT_ID
  //   "LIVE credentials: Client ID"   -> NOMBA_LIVE_CLIENT_ID
  //   "LIVE credentials: Private key" -> NOMBA_LIVE_PRIVATE_KEY
  //   "TEST credentials: Client ID"   -> NOMBA_TEST_CLIENT_ID
  //   "TEST credentials: Private key" -> NOMBA_TEST_PRIVATE_KEY
  // Both TEST and LIVE pairs are kept in .env at the same time (never
  // overwriting one to "switch" to the other) — NOMBA_MODE picks which
  // pair the app actually uses at runtime.
  NOMBA_MODE: optional("NOMBA_MODE", "test"), // 'test' | 'live'
  NOMBA_TEST_CLIENT_ID: optional("NOMBA_TEST_CLIENT_ID"),
  NOMBA_TEST_PRIVATE_KEY: optional("NOMBA_TEST_PRIVATE_KEY"),
  NOMBA_LIVE_CLIENT_ID: optional("NOMBA_LIVE_CLIENT_ID"),
  NOMBA_LIVE_PRIVATE_KEY: optional("NOMBA_LIVE_PRIVATE_KEY"),
  // A TEST token is only valid against Nomba's sandbox host — using it
  // against api.nomba.com gets a 403 ("your token is a sandbox token").
  // Confirmed from Nomba's actual API error response, not their docs page
  // (which doesn't mention this at all). Default follows NOMBA_MODE;
  // NOMBA_BASE_URL only needs to be set explicitly to override that.
  NOMBA_BASE_URL: optional(
    "NOMBA_BASE_URL",
    optional("NOMBA_MODE", "test") === "live" ? "https://api.nomba.com" : "https://sandbox.nomba.com"
  ),
  NOMBA_WEBHOOK_SECRET: optional("NOMBA_WEBHOOK_SECRET"),
  // Goes in the `accountId` header on every call — always the main/parent
  // account, never the sub-account, even when a call is scoped to the
  // sub-account via a path parameter (see nombaService.js).
  NOMBA_MAIN_ACCOUNT_ID: optional("NOMBA_MAIN_ACCOUNT_ID"),
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

// The single active credential pair, derived from NOMBA_MODE. Everything
// else in the app (config/nomba.js) reads env.NOMBA_CLIENT_ID /
// env.NOMBA_PRIVATE_KEY rather than branching on NOMBA_MODE itself.
env.NOMBA_CLIENT_ID = env.NOMBA_MODE === "live" ? env.NOMBA_LIVE_CLIENT_ID : env.NOMBA_TEST_CLIENT_ID;
env.NOMBA_PRIVATE_KEY = env.NOMBA_MODE === "live" ? env.NOMBA_LIVE_PRIVATE_KEY : env.NOMBA_TEST_PRIVATE_KEY;

module.exports = env;
