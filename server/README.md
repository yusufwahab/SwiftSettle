# SwiftSettle Backend

Express + Supabase (Postgres) + Nomba + Brevo backend for SwiftSettle — a
financial identity platform for gig workers: real-time earnings tracking,
instant settlement to a bank account via Nomba, a behavior-driven credit
score, and a worker-initiated payout request flow with a lightweight admin
role to process it. Built from `BackendPrompt.md` / `updatedPrompt.md`, with
several later deviations made by direct follow-up instruction — see
"Where this deviates from the prompts" below.

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
7. **Make your own account an admin** once you've signed up through the frontend: `POST /api/auth/become-admin` (bearer token, no body) — or just click "Enable Admin Access" in the frontend's Settings page. No separate admin login exists; it's a flag on your own worker row (see "Payout requests & the admin role" below).

## Running without every credential

You don't need a Nomba or Brevo account to start developing:

- **No Brevo configured** → OTP codes (and every other notification email) are logged to the server console instead of sent. Signup/login still work end-to-end locally — search the log for `"logging email instead of sending"` to find your OTP code.
- **No Nomba configured** → any call that needs it (`createVirtualAccount`, `transferToBank`) throws a clear `"Nomba is not configured"` error rather than crashing the server. Onboarding step 2, settlements, and payout processing will fail until you add real Nomba keys.
  - Nomba gave you **two account IDs**: a "Main (parent) Account ID" and your own "sub-account ID". These are not interchangeable — see `NOMBA_MAIN_ACCOUNT_ID` / `NOMBA_SUB_ACCOUNT_ID` in `.env.example` and the comment at the top of `src/config/nomba.js`.
  - `.env` variable names match Nomba's own onboarding email exactly (`NOMBA_TEST_CLIENT_ID`, `NOMBA_LIVE_CLIENT_ID`, etc.) — both TEST and LIVE pairs live in `.env` at the same time, and `NOMBA_MODE=test|live` picks which one is actually used. Use `test` while developing; switch to `live` only when you're actually ready to move real money.
  - **Never commit real credentials.** They go in your local `.env` (already gitignored) or your hosting platform's environment settings — not in this repo, not in chat with an AI assistant, nowhere they'd be logged or shared.

Everything else (auth, earnings tracking, financial scoring) works against Supabase alone.

## Project structure

```
server/
├── src/
│   ├── config/       env.js, database.js (Supabase client), nomba.js (Nomba OAuth2 client)
│   ├── middleware/   auth.js (JWT + requireAdmin), errorHandler.js, validateWebhook.js, corsHandler.js
│   ├── routes/       one file per resource, mounted under /api in routes/index.js
│   ├── controllers/  request handling + response shaping
│   ├── services/     nombaService, scoringService, platformService, reconciliationService,
│   │                 payoutRequestService, notificationService, emailService (Brevo)
│   ├── utils/        jwt.js, validators.js (Joi schemas), logger.js, helpers.js
│   ├── jobs/         scoreScheduler.js — daily 30-day auto-trigger (node-schedule)
│   └── db/schema.sql consolidated copy of ../../supabase/migrations/*.sql
├── server.js         entry point
└── .env.example
```

## API reference

All routes are mounted under `/api`. Everything except `/webhooks/*` requires
`Authorization: Bearer <token>`; routes marked **(admin)** additionally
require the calling worker's `is_admin` flag to be `true`.

**Auth** (`/api/auth`)
| Method | Path | Purpose |
|---|---|---|
| POST | `/signup` | Create account, sends email OTP |
| POST | `/verify-email` | Confirms OTP, issues session (the only place a session is created) |
| POST | `/login` | Email + password |
| POST | `/verify-phone-update` | One onboarding-wizard step (1–4) |
| POST | `/complete-signup` | All 4 onboarding steps at once |
| POST | `/refresh-token` | Rotate access token |
| POST | `/logout` | Revoke refresh token |
| GET | `/me` | Current worker profile |
| POST | `/become-admin` | Self-service — flips `is_admin` on your own account |

**Earnings** (`/api/earnings`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/balance` | Available balance, today's total, trend (reconciled earnings only) |
| GET | `/history` | Paginated earnings list (`status`, `amount` vs `received_amount`) |
| GET | `/daily` | Day-bucketed totals for charts |
| POST | `/simulate` | Records a completed order (pending, not yet paid) — route name is a holdover from before the frontend called this "Log a Completed Order" |
| POST | `/simulate-payment` | Settles the payment for a logged order directly (see "Reconciliation" below) |

**Settlements** (`/api/settlements`) — outbound VA-balance → bank transfer, worker-initiated, unrelated to payout requests
| Method | Path | Purpose |
|---|---|---|
| POST | `/create` | Real Nomba transfer of the full available balance to the worker's bank |
| GET | `/status/:settlement_id` | One settlement's status |
| GET | `/history` | List, filterable by `?status=` |

**Payout requests** (`/api/payouts`) — the inbound "get paid for completed work" flow
| Method | Path | Purpose |
|---|---|---|
| POST | `/request` | Worker bundles every pending earning into one request; sends a confirmation code by email + notification |
| GET | `/mine` | Worker's own requests, with bundled earnings |
| POST | `/:id/confirm` | Worker submits the code — required before an admin can process the request |
| POST | `/:id/resend-code` | Issues and sends a fresh code if the first expired |
| GET | `/all` **(admin)** | Every worker's requests |
| POST | `/:id/process` **(admin)** | Pay a request — blocked until `confirmed_at` is set; amount can deliberately differ from what was requested |

**Financial identity** (`/api/financial`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/score` | Current score (0–850) + component breakdown |
| GET | `/identity-status` | Progress toward the 30-day certificate, milestone checklist |
| GET | `/certificate` | Verified income certificate (404 until issued) |

**Credit** (`/api/credit`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/eligibility` | Eligible? available credit, rate, terms |
| POST | `/request` | Auto-approved micro-loan request, real Nomba disbursement |
| GET | `/active-loans` | Loans with a remaining balance |
| GET | `/repayment-schedule` | Combined schedule across active loans |

**Notifications** (`/api/notifications`) — real, not mocked
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Recent notifications |
| POST | `/read-all` | Mark everything read |
| POST | `/:id/read` | Mark one read |

**Banks** — `GET /api/banks` → `[{ code, name }]`, Nomba's real bank directory.

**Webhooks** (no auth — signature-verified instead)
| Method | Path | Purpose |
|---|---|---|
| POST | `/webhooks/nomba` | `payment_success` (VA deposit → reconciliation), `payout_success`/`payout_failed` (settlement outcome) |
| POST | `/webhooks/platform` | A gig platform reports a completed order (creates a pending earning) |

**Internal** — `GET /api/admin/behavioral-analytics` (a *different* admin concept — shared-secret `x-admin-key` header, not a worker session; see "Two separate admin mechanisms" below).

## Reconciliation: how money actually gets tracked

`earnings` isn't a simple ledger — it models the real two-step gap between
"a platform says you completed an order" and "the money actually arrived":

1. **Pending.** A platform webhook (or a bundled-into-a-request action) reports
   an order worth some claimed `amount`. This does **not** count toward balance yet.
2. **Reconciled.** Nomba's `payment_success` webhook confirms a deposit into
   the worker's dedicated virtual account. `reconciliationService` matches it
   against the oldest still-pending order (FIFO — real payers rarely echo
   back an internal reference) and sets `received_amount` + a status:
   `matched` (exact), `underpaid`, `overpaid`, or `unmatched` (a deposit with
   no corresponding pending order at all — still credited, just flagged).

Only reconciled rows count toward `getBalance`, `income_baseline`, and the
behavioral-data feeding the credit score — an unreconciled claim is never
treated as real money.

**Why there's a "simulate payment" endpoint at all:** Nomba's sandbox has no
API or dashboard tool to trigger a deposit into a virtual account on demand —
VAs only accept genuine external bank transfers over the real interbank
network. `POST /earnings/simulate-payment` and the payout-request admin flow
both work around this the same way: they build the exact `payment_success`
event Nomba would send, sign it with the real `NOMBA_WEBHOOK_SECRET` using
the same scheme `validateNombaWebhook` checks, and POST it to the app's own
`/webhooks/nomba` endpoint. The entire pipeline — signature verification,
worker lookup, matching, over/underpayment handling — runs for real; only
the deposit's origin is synthetic.

## Payout requests & the admin role

The worker-facing loop: log some completed orders → **Request Payout**
bundles every currently-pending order into one `payout_requests` row with a
single `requested_total`. This also generates a 6-digit confirmation code
(bcrypt-hashed on the row, 15-minute expiry) and delivers it two ways —
email and a real in-app notification — since no SMS provider is configured
for this build. The worker must enter that code back via
`POST /payouts/:id/confirm` before an admin can act on the request at all;
`processPayoutRequest` checks `confirmed_at is not null` before doing
anything else, and `POST /payouts/:id/resend-code` issues a fresh one if the
first expires. This is a 2FA-style check that the account owner actually
meant to submit the request — not proof the underlying work happened, which
still requires a real platform integration (see the deviations list).

Once confirmed, an admin — any worker account with `is_admin = true` — sees
it in the queue and **processes** it with an amount that can deliberately
differ from what was requested, producing the same
`matched`/`underpaid`/`overpaid` vocabulary. Reconciling at the request
level (not per-order) avoids proportional-split complexity in the matching
logic itself; the actual amount received is then distributed back across
the bundled `earnings` rows pro-rata (last row absorbs the rounding
remainder) so `getBalance` and the scoring queries need no special-casing.

Processing a request:
- Pre-assigns a `nomba_transaction_id` onto the `payout_requests` row *before*
  firing the synthetic webhook, so `reconciliationService` can match it
  deterministically — no FIFO guessing needed, since the admin explicitly
  chose this request.
- Notifies the worker two ways: a real row in `notifications` (in-app,
  `GET /api/notifications`), and an email via `emailService.notifications.payoutProcessed`.

**Two separate admin mechanisms exist, deliberately:**
- `workers.is_admin` + `requireAdmin` middleware — gates the payout-request
  admin endpoints and the frontend's Admin page. Same login as any worker;
  self-service via `POST /auth/become-admin`. No separate admin auth system.
- `ADMIN_API_KEY` + `x-admin-key` header — gates only `GET /api/admin/behavioral-analytics`,
  an internal/API-only endpoint from `updatedPrompt.md` with no UI. Predates
  the payout-request admin role and serves a different purpose (an
  internal tool, not a worker-facing role) — not consolidated into one
  mechanism on purpose.

## Where this deviates from the prompts (and why)

Both `updatedPrompt.md` and `BackendPrompt.md` describe the system at a level that leaves some real gaps — implementing them literally would leave features that can't actually function. Each deviation is also commented at the point in the code where it happens:

- **Base tables didn't exist.** Neither prompt's target codebase had a real database — SwiftSettle was a frontend-only mock-data app. `workers`/`earnings`/`settlements`/`virtual_accounts` are created fresh here.
- **`otp_codes` and `refresh_tokens` tables added.** Required for the custom JWT+OTP auth flow to have somewhere to check codes/tokens against.
- **`workers.full_name` / `workers.platform` relaxed to nullable.** The worker row is created at OTP-verification time (step 2), before those fields are ever collected (step 3).
- **`workers.platform_connected`, `platform_access_token`, `two_factor_enabled` added.** Onboarding steps 5 and 6 need somewhere to persist their data.
- **`virtual_accounts.bank_account_number` added.** Nomba's real create-virtual-account response returns an account number; the literal schema had no column for it.
- **`workers.bank_code` added, and every settlement/transfer call uses it instead of `bank_name`.** Nomba's Transfer API requires a numeric CBN bank code (3 or 6 digits); the original onboarding flow only ever collected a bank *name* from a static list, which is not a valid `bankCode` and produced a real `422` in testing. `GET /api/banks` (Nomba's own directory) now backs the onboarding bank dropdown so both are captured together.
- **`earnings.status`, `received_amount`, `nomba_transaction_id`, `reconciled_at`, `payout_request_id` added** — see "Reconciliation" above. The literal schema treats an earning as instantly-real money; that doesn't reflect how a dedicated virtual account actually gets funded.
- **`payout_requests` and `notifications` tables added**, plus `workers.is_admin` — none of this exists in either prompt. Added per direct follow-up instruction to give workers a way to actively request payment for completed work and give a lightweight admin role a way to act on it, with real (not mocked) notifications of the outcome.
- **`payout_requests` confirmation-code columns added** (`confirmation_code_hash`, `confirmation_code_expires_at`, `confirmed_at`) — per direct follow-up instruction, gates admin processing behind a code the worker enters back into the app. No SMS provider (Termii or similar) is configured for this build, so the code is delivered over email + in-app notification instead of a dedicated SMS channel.
- **`GET /auth/me` added.** Nothing else returns the logged-in worker's own profile — needed for the frontend sidebar/settings page to render at all.
- **Nomba webhook signature verification uses Nomba's real scheme** (a specific field concatenation, HMAC-SHA256, Base64), verified against `developer.nomba.com` — not the generic raw-body-HMAC pattern either prompt's phrasing might suggest. The Joi schema for it originally required a field named `event`; Nomba's real payload field is `event_type` — fixed, since the mismatch would have 400'd every real webhook before it reached the handler.
- **Available-credit formula, interest rate application, and credit-tier score bands are inferred**, not given as exact formulas anywhere — see comments in `creditController.js` and `scoringService.js`.
- **The 30-day auto-trigger does not auto-create a `credit_requests` row.** `BackendPrompt.md`'s service outline lists that as a side effect, but the actual credit flow it describes elsewhere is worker-initiated ("Worker taps 'Request Credit'"). Treated as a real contradiction between two parts of the same prompt rather than silently picking one.
- **A worker-facing admin UI now exists** (Admin: Payouts page, gated by `workers.is_admin`) — this is separate from, and doesn't contradict, the original "don't create admin UI" instruction, which referred specifically to `GET /api/admin/behavioral-analytics` (still API-only, still gated by `ADMIN_API_KEY`). The payout-request admin role was added later, per direct follow-up instruction, to give the worker-initiated payout flow somewhere to be acted on.
- **Auth changed from phone+OTP to email+password, per direct follow-up instruction.** `POST /auth/signup` now takes `full_name`/`email`/`password`; `POST /auth/verify-email` confirms an email OTP (sent via Brevo) and is what actually issues the first session; `POST /auth/login` is plain email+password. Twilio is gone entirely. `workers.password_hash` and `workers.email_verified` were added; `workers.phone_number` was relaxed to nullable since it's no longer collected at signup.
- **Onboarding wizard shrank from 8 steps to 4** (personal/contact, bank, security, consent) and moved entirely to *after* signup, and every step is skippable — the frontend shows a persistent "complete your profile" nudge on the dashboard and settings page instead of blocking anything. `POST /auth/verify-phone-update`'s name is a holdover from the old design; it no longer verifies a phone number — it just records one as contact info at step 1.
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
