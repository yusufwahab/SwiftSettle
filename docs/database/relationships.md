# SwiftSettle — Table Relationships & Design Notes

Covers `supabase/migrations/20260706000001_schema.sql` and
`20260706000002_rls_lockdown.sql` (per `BackendPrompt.md`). See
`schema-diagram.md` for the visual ERD.

## Why there's no `auth.users` link this time

`updatedPrompt.md`'s original schema assumed Supabase Auth handling phone
+ OTP, with RLS keyed on `auth.uid()`. `BackendPrompt.md` asks for a custom
Express + JWT + Twilio-OTP system instead — the backend generates its own
OTP codes (`otp_codes` table), issues its own JWTs, and tracks its own
refresh tokens (`refresh_tokens` table) rather than delegating any of that
to Supabase. So `workers` has no `auth_user_id` column, and Postgres never
sees a request from anyone except the Express backend, authenticated with
the Supabase **service role key**.

## Why RLS is enabled with zero policies

Enabling RLS on every table with no permissive policies means: the `anon`
and `authenticated` Supabase keys can read/write nothing. The `service_role`
key (used exclusively by the Express backend) bypasses RLS by design, so
this doesn't get in the backend's way — it just means if the anon/public
key were ever exposed to the frontend by mistake, it couldn't touch any
data directly. All authorization logic (a worker can only see their own
earnings, etc.) lives in the Express route/controller layer instead of in
Postgres policies, since the Express layer is the only thing Postgres ever
talks to.

## Cardinality

| Relationship | Cardinality | Notes |
|---|---|---|
| `workers` → `virtual_accounts` | 1:many (practically 1:1) | A worker could have more than one VA record over time if a Nomba account is replaced |
| `workers` → `earnings` | 1:many | One row per platform order-completion webhook |
| `workers` → `settlements` | 1:many | One row per payout attempt |
| `workers` → `financial_identity_scores` | 1:many (history) | Latest value mirrored onto `workers.financial_score` |
| `workers` → `verified_income_certificates` | 1:many (at most 1 `active`) | Enforced by `idx_one_active_certificate_per_worker` |
| `workers` → `credit_requests` | 1:many | |
| `workers` → `worker_behavioral_data` | 1:many in this schema | `BackendPrompt.md`'s SQL gives this table its own `id` PK rather than `worker_id` as PK, so technically nothing stops multiple rows per worker; the scoring service should always upsert-by-`worker_id` (query the latest row) rather than assume exactly one row exists. Flagging this rather than silently changing their given SQL. |
| `workers` → `refresh_tokens` | 1:many | One per active login session; revoke on logout by setting `revoked_at` |

## Idempotency: `earnings(platform_reference, order_id)`

Platform webhooks (order-completion events) get retried/redelivered. The
unique constraint on `(platform_reference, order_id)` makes the webhook
handler's insert naturally idempotent — `ON CONFLICT DO NOTHING` — so the
same event landing twice doesn't double-count earnings and corrupt
`income_baseline`.

## Why `otp_codes` and `refresh_tokens` exist (not in BackendPrompt.md's SQL block, added here)

`BackendPrompt.md`'s auth section requires `generateOTP`, `sendOTP`,
`verifyOTP`, JWT + refresh-token issuance and refresh — none of that works
without somewhere to store a short-lived OTP code to check against, and
somewhere to store/revoke issued refresh tokens. The literal `schema.sql`
block in the prompt doesn't include these two tables, so they're an
addition needed to make the auth system the same prompt describes actually
function — flagging that explicitly rather than quietly inventing scope.

## Gaps deliberately left open

- **`worker_behavioral_data` shape.** As above — this table can accumulate
  multiple rows per worker under the given schema. If you want strict
  one-row-per-worker, that's a one-line change (`worker_id` as a unique
  constraint or primary key) — not made here since it would deviate from
  the literal SQL provided.
- **Repayment ledger.** `credit_requests.repayment_plan` is a JSON blob
  describing the plan, not a per-day repayment transaction ledger. If you
  want auditable daily-deduction records, that's a real follow-up table.
