# SwiftSettle Backend — API Reference

Base URL: `http://localhost:5000/api` (or your deployed `API_URL` + `/api`).

All request/response bodies are JSON. All authenticated endpoints require
`Authorization: Bearer <token>`.

## Authentication flow

Email + password, with an email OTP as the one-time signup verification
step (not phone+OTP — that was fully replaced, not kept as an alternative).

```
POST /auth/signup          { full_name, email, password }  -> sends an email OTP, no session yet
POST /auth/verify-email    { email, otp_code }              -> { token, refresh_token, worker_id }
POST /auth/login           { email, password }              -> { token, refresh_token, worker_id }
GET  /auth/me               (authenticated)                 -> current worker profile
POST /auth/verify-phone-update  (authenticated)  { step, data }  -> apply one onboarding-wizard step
POST /auth/complete-signup      (authenticated)  { ...all fields }  -> apply steps 1-4 at once
POST /auth/refresh-token    { refresh_token }               -> { token }
POST /auth/logout          { refresh_token }                -> { success: true }
```

A brand-new account only exists (with `email_verified: false`) after
`/auth/signup` — `/auth/verify-email` is what actually activates it and
issues the first session. `/auth/login` only succeeds once `email_verified`
is true. A PIN (set at onboarding step 3) is a separate credential, stored
for future PIN-gated actions — it's never used to log in.

### Error shape

Every error response looks like:
```json
{ "error": "some_error_code", "message": "Human-readable explanation." }
```

| Status | error code | Meaning |
|---|---|---|
| 400 | `validation_error` | Request body failed Joi validation |
| 401 | `unauthorized` | Missing/invalid/expired access token |
| 401 | `invalid_otp` | Wrong or expired OTP code |
| 401 | `invalid_credentials` | Wrong email/password on login |
| 401 | `invalid_refresh_token` | Refresh token invalid, expired, or revoked |
| 401 | `invalid_signature` | Webhook signature check failed |
| 403 | `email_not_verified` | Login attempted before completing signup's email-OTP step |
| 403 | `account_inactive` | Account has been deactivated |
| 404 | `not_found` | Resource doesn't exist or doesn't belong to this worker |
| 409 | `email_already_registered` | Signup attempted with an email that's already verified |
| 422 | `insufficient_balance` | Settlement amount exceeds available balance |
| 422 | `no_bank_account` | No verified bank account on file |
| 422 | `credit_not_available` | Not eligible, or amount exceeds available credit |
| 500 | `internal_error` | Unhandled server error (message is generic on purpose) |

---

## Onboarding wizard (`POST /auth/verify-phone-update`)

Post-signup, entirely optional — a worker can use the app (view earnings,
browse the dashboard) with none of this done, but can't settle or request
credit until steps 1-2 are complete. Every step is independently skippable
from the frontend; the dashboard/settings pages nudge whoever hasn't
finished.

`{ "step": 1-4, "data": { ... } }`

| Step | `data` fields |
|---|---|
| 1 — Personal & contact | `date_of_birth`, `state`, `platform`, `phone_number` |
| 2 — Bank details | `bank_name`, `account_number`, `account_holder_name` (triggers Nomba virtual account creation) |
| 3 — Security | `pin`, `two_factor_enabled` |
| 4 — Consent | `data_sharing_consent`, `terms_accepted` — marks onboarding complete |

Response: `{ success: true, next_step: <n+1>, worker: { ...sanitized } }`

(Endpoint name is a holdover from when phone verification lived here —
that's handled by `/auth/verify-email` now, and this endpoint never
verifies a phone number, just records it as contact info at step 1.)

---

## Earnings

```
GET /earnings/balance
  -> { balance, updated_at, daily_total, earnings_trend: [{date, amount}] }

GET /earnings/history?limit=20&offset=0&start_date=2026-06-01&end_date=2026-07-01
  -> { earnings: [...], total, page }

GET /earnings/daily
  -> { daily_breakdown: { "2026-07-04": 4500, "2026-07-05": 3800, ... } }
```

## Settlements

```
POST /settlements/create   { amount }
  -> { settlement_id, status, reference }
  Errors: insufficient_balance, no_bank_account

GET /settlements/status/:settlement_id
  -> { status, amount, reference, settled_at, bank, account }

GET /settlements/history?limit=20&offset=0&status=completed
  -> { settlements: [...], total }
```

`status` starts `pending`, moves to `processing` once Nomba accepts the
transfer request, and only becomes `completed`/`failed` when the
`/webhooks/nomba` handler receives the matching `payout_success`/
`payout_failed` event — the initial API response from Nomba is provisional.

## Financial identity

```
GET /financial/score
  -> { score, tier, components: {...}, days_until_certificate, certificate_eligible }

GET /financial/identity-status
  -> { verification_status, progress, days_remaining, milestones: [...] }

GET /financial/certificate
  -> { certificate_id, monthly_income, verification_date, expires_at, download_url }
  404 (no_certificate) until one has been issued.
```

## Credit

```
GET /credit/eligibility
  -> { eligible, score, available_credit, interest_rate, terms }

POST /credit/request   { amount }
  -> { request_id, status, amount, interest_rate, repayment_period, daily_repayment }
  Auto-approved if score > 600 and amount <= available_credit — no manual
  review path exists. Rejected requests still get a persisted
  credit_requests row (status: rejected, auto_approval_decision: need_review).

GET /credit/active-loans
  -> { loans: [...], active_count }

GET /credit/repayment-schedule
  -> { schedule: [...], total_remaining }
```

## Webhooks (server-to-server, not worker-authenticated)

```
POST /webhooks/nomba
  Headers: nomba-signature, nomba-signature-algorithm, nomba-signature-version, nomba-timestamp
  Body: { event_type, requestId, data: { merchant, transaction, customer } }
  Handled: payout_success, payout_failed (settlement outcome)
  Acknowledged but not acted on: payment_success, payment_reversal, payout_refund

POST /webhooks/platform
  Headers: x-platform-signature
  Body: { order_id, worker_id, amount, platform }
  Records an earning (idempotent per (platform, order_id))
```

## Admin (internal, `x-admin-key` header required)

```
GET /admin/behavioral-analytics?worker_id=...
  -> { behavioral_data: [...] }
```
