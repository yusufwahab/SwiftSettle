# SwiftSettle Backend — API Reference

Base URL: `http://localhost:5000/api` (or your deployed `API_URL` + `/api`).

All request/response bodies are JSON. All authenticated endpoints require
`Authorization: Bearer <token>`.

## Authentication flow

```
POST /auth/signup          { phone_number }              -> sends OTP
POST /auth/verify-otp      { phone_number, otp_code }     -> { token, refresh_token, worker_id }
GET  /auth/me               (authenticated)                -> current worker profile
POST /auth/verify-phone-update  (authenticated)  { step, data }  -> apply one onboarding step
POST /auth/complete-signup      (authenticated)  { ...all fields }  -> apply steps 3-8 at once
POST /auth/refresh-token    { refresh_token }              -> { token }
POST /auth/logout          { refresh_token }               -> { success: true }
```

No passwords anywhere — phone + OTP to get a session, then a PIN (set at
onboarding step 6) is the only other credential, and it's never used for
login in this implementation (only stored, for future PIN-gated actions
like settlement confirmation).

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
| 401 | `invalid_refresh_token` | Refresh token invalid, expired, or revoked |
| 401 | `invalid_signature` | Webhook signature check failed |
| 404 | `not_found` | Resource doesn't exist or doesn't belong to this worker |
| 422 | `insufficient_balance` | Settlement amount exceeds available balance |
| 422 | `no_bank_account` | No verified bank account on file |
| 422 | `credit_not_available` | Not eligible, or amount exceeds available credit |
| 500 | `internal_error` | Unhandled server error (message is generic on purpose) |

---

## Onboarding steps (`POST /auth/verify-phone-update`)

`{ "step": 1-8, "data": { ... } }`. Step 2 (phone+OTP) is handled by
`verify-otp` directly, not through this endpoint.

| Step | `data` fields |
|---|---|
| 3 — Personal info | `full_name`, `date_of_birth`, `state`, `platform` |
| 4 — Bank account | `bank_name`, `account_number`, `account_holder_name` (triggers Nomba virtual account creation) |
| 5 — Platform connection | `platform_access_token` |
| 6 — Security | `pin`, `two_factor_enabled` |
| 7 — Consent | `data_sharing_consent`, `terms_accepted` |
| 8 — Done | (no fields — just marks onboarding complete) |

Response: `{ success: true, next_step: <n+1>, worker: { ...sanitized } }`

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
