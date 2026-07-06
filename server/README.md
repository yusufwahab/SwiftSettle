# SwiftSettle Backend

Express + Supabase (Postgres) + Nomba + Brevo backend for SwiftSettle's
financial identity platform. Built from `BackendPrompt.md` / `updatedPrompt.md`,
with one significant later change: auth moved from passwordless phone+OTP to
email+password with an email-OTP verification step (Brevo), per direct
follow-up instruction — see the deviations list below.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (pick a region close to Nigeria).
2. **Run the schema.** Either:
   - Paste `src/db/schema.sql` into the Supabase SQL editor and run it, or
   - Use the Supabase CLI against `supabase/migrations/` (project root, one level up) with `supabase link` + `supabase db push`.
3. **Get your keys**: Settings → API for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. **Copy `.env.example` to `.env`** and fill in what you have. Only `SUPABASE_*` and the two JWT secrets are strictly required to boot — Nomba/Brevo are optional at boot time (see "Running without every credential" below).
5. **Install and run:**
   ```
   npm install
   npm run dev      # nodemon, auto-reload
   npm start        # production
   ```
6. Confirm it's up: `curl http://localhost:5000/health`

## Running without every credential

You don't need a Nomba or Brevo account to start developing:

- **No Brevo configured** → OTP codes (and every other notification email) are logged to the server console instead of sent. Signup/login still work end-to-end locally — search the log for `"logging email instead of sending"` to find your OTP code.
- **No Nomba configured** → any call that needs it (`createVirtualAccount`, `transferToBank`) throws a clear `"Nomba is not configured"` error rather than crashing the server. Onboarding step 2 and settlements will fail until you add real Nomba keys.
  - Nomba gave you **two account IDs**: a "Main (parent) Account ID" and your own "sub-account ID". These are not interchangeable — see `NOMBA_MAIN_ACCOUNT_ID` / `NOMBA_SUB_ACCOUNT_ID` in `.env.example` and the comment at the top of `src/config/nomba.js`.
  - `.env` variable names match Nomba's own onboarding email exactly (`NOMBA_TEST_CLIENT_ID`, `NOMBA_LIVE_CLIENT_ID`, etc.) — both TEST and LIVE pairs live in `.env` at the same time, and `NOMBA_MODE=test|live` picks which one is actually used. Use `test` while developing; switch to `live` only when you're actually ready to move real money.
  - **Never commit real credentials.** They go in your local `.env` (already gitignored) or your hosting platform's environment settings — not in this repo, not in chat with an AI assistant, nowhere they'd be logged or shared.

Everything else (auth, earnings tracking, financial scoring) works against Supabase alone.

## Project structure

```
server/
├── src/
│   ├── config/       env.js, database.js (Supabase client), nomba.js (Nomba OAuth2 client)
│   ├── middleware/   auth.js (JWT), errorHandler.js, validateWebhook.js, corsHandler.js
│   ├── routes/       one file per resource, mounted under /api in routes/index.js
│   ├── controllers/  request handling + response shaping
│   ├── services/     nombaService, scoringService, platformService, emailService (Brevo)
│   ├── utils/        jwt.js, validators.js (Joi schemas), logger.js, helpers.js
│   ├── jobs/         scoreScheduler.js — daily 30-day auto-trigger (node-schedule)
│   └── db/schema.sql consolidated copy of ../../supabase/migrations/*.sql
├── server.js         entry point
└── .env.example
```

## Where this deviates from the prompts (and why)

Both `updatedPrompt.md` and `BackendPrompt.md` describe the system at a level that leaves some real gaps — implementing them literally would leave features that can't actually function. Each deviation is also commented at the point in the code where it happens:

- **Base tables didn't exist.** Neither prompt's target codebase had a real database — SwiftSettle was a frontend-only mock-data app. `workers`/`earnings`/`settlements`/`virtual_accounts` are created fresh here.
- **`otp_codes` and `refresh_tokens` tables added.** Required for the custom JWT+OTP auth flow to have somewhere to check codes/tokens against — not in `BackendPrompt.md`'s literal `schema.sql` block, but the auth endpoints it specifies can't work without them.
- **`workers.full_name` / `workers.platform` relaxed to nullable.** The literal schema marks them `NOT NULL`, but the worker row is created at OTP-verification time (step 2), before those fields are ever collected (step 3).
- **`workers.platform_connected`, `platform_access_token`, `two_factor_enabled` added.** Onboarding steps 5 and 6 need somewhere to persist their data; the literal schema only has `platform_earnings_verified` (a different, later-derived thing).
- **`virtual_accounts.bank_account_number` added.** Nomba's real create-virtual-account response returns an account number; the literal schema had no column for it.
- **`GET /auth/me` added.** Nothing else returns the logged-in worker's own profile — needed for the frontend sidebar/settings page to render at all.
- **Nomba webhook signature verification uses Nomba's real scheme** (a specific field concatenation, HMAC-SHA256, Base64), verified against `developer.nomba.com` — not the generic raw-body-HMAC pattern either prompt's phrasing might suggest.
- **Available-credit formula, interest rate application, and credit-tier score bands are inferred**, not given as exact formulas anywhere — see comments in `creditController.js` and `scoringService.js`.
- **The 30-day auto-trigger does not auto-create a `credit_requests` row.** `BackendPrompt.md`'s service outline lists that as a side effect, but the actual credit flow it describes elsewhere is worker-initiated ("Worker taps 'Request Credit'"). Treated as a real contradiction between two parts of the same prompt rather than silently picking one.
- **No admin UI** — per the explicit "don't create admin UI" instruction, `GET /api/admin/behavioral-analytics` is a bare API endpoint gated by an `ADMIN_API_KEY` header, nothing else.
- **Auth changed from phone+OTP to email+password, per direct follow-up instruction (not part of either original prompt).** `POST /auth/signup` now takes `full_name`/`email`/`password`; `POST /auth/verify-email` confirms an email OTP (sent via Brevo) and is what actually issues the first session; `POST /auth/login` is plain email+password. Twilio is gone entirely — there's no SMS anywhere in this backend anymore. `workers.password_hash` and `workers.email_verified` were added; `workers.phone_number` was relaxed to nullable since it's no longer collected at signup.
- **Onboarding wizard shrank from 8 steps to 4** (personal/contact, bank, security, consent) and moved entirely to *after* signup, and every step is skippable — the frontend shows a persistent "complete your profile" nudge on the dashboard and settings page instead of blocking anything. `POST /auth/verify-phone-update`'s name is a holdover from the old design; it no longer verifies a phone number (that endpoint doesn't exist anymore) — it just records one as contact info at step 1.
- **Brevo replaces both Twilio (OTP) and SendGrid (notifications)** — verified against `developers.brevo.com`: `POST https://api.brevo.com/v3/smtp/email` with an `api-key` header, not a bearer token.

See `docs/database/relationships.md` (project root) for the full schema-level writeup.

## Registering your webhook URL with Nomba

Nomba does a live reachability check on the URL you give them — it must be
a **public HTTPS URL that's already running** at the moment you submit it,
not `localhost`. Two ways to get one:

- **Deploy first (recommended for anything beyond a quick test).** Follow
  the deployment steps below, then use `https://<your-deploy-url>/api/webhooks/nomba`.
- **Tunnel your local server for now.** Run `npm run dev`, then in another
  terminal `ngrok http 5000` (or any similar tool) and use the `https://...ngrok...`
  URL it gives you + `/api/webhooks/nomba`. Fine for testing the integration
  before you've deployed anywhere; you'll need to re-submit a new URL to
  Nomba once you deploy for real, since tunnel URLs aren't permanent.

For the form itself: the **sub-account ID** field is exactly the
`NOMBA_SUB_ACCOUNT_ID` value from your credentials — submit it as given.

**Signature key / `NOMBA_WEBHOOK_SECRET`:** this depends on how you're
integrated with Nomba. For a standalone merchant integration, you choose
this value yourself and enter it as the "signature key" in Nomba's
dashboard. **If you're on the NombaHackathon2026 program specifically,
Nomba assigns this to you as a fixed value** — it's shown directly on
their webhook-submission form (e.g. `NombaHackathon2026`). Use exactly
what they show you in that case, don't invent your own.

## Deployment (Render/Railway)

1. Push this repo (or just the `server/` directory as its own repo) to GitHub.
2. Create a new Web Service, pointing at `server/` as the root if deploying from the monorepo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add every variable from `.env.example` in the platform's environment settings — **do not** commit a real `.env` file.
5. Once deployed, update the frontend's `VITE_API_URL` to the deployed URL + `/api`, and register that same URL with Nomba/your platform partners as the webhook destination (`/api/webhooks/nomba`, `/api/webhooks/platform`).
6. Confirm with `curl https://<your-deploy-url>/health`.

Supabase needs no separate deployment step — it's already hosted.
