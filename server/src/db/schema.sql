-- Consolidated schema for one-shot paste into the Supabase SQL editor.
-- Generated from supabase/migrations/*.sql (that folder is the source of
-- truth — if the two ever diverge, trust the migrations). Also runnable
-- via the Supabase CLI (`supabase db push`) from the migrations folder
-- directly instead of pasting this file.

-- 20260706000001_schema.sql
--
-- Full schema per BackendPrompt.md. This replaces the earlier
-- Supabase-Auth-based migration set: that version assumed Supabase Auth
-- (phone/OTP) with RLS keyed on auth.uid(). BackendPrompt.md instead wants
-- a custom Express + JWT + Twilio-OTP auth system, where the Express
-- backend is the only client that ever talks to Postgres, always through
-- the service role key. So there's no auth.users link here, and RLS below
-- is a simple default-deny lockdown rather than per-row auth.uid() policies.

create extension if not exists "uuid-ossp";

-- Workers table (extended)
create table workers (
  id uuid primary key default uuid_generate_v4(),
  phone_number varchar unique not null,
  phone_verified boolean default false,
  full_name varchar not null,
  date_of_birth date,
  state varchar,
  platform varchar not null,

  -- Bank details
  bank_name varchar,
  account_number varchar,
  account_holder_name varchar,
  bank_verified boolean default false,

  -- Nomba integration
  nomba_virtual_account_id varchar unique,

  -- Financial data
  identity_verification_status varchar default 'pending',
  financial_score int default 0,
  credit_tier varchar default 'none',
  platform_earnings_verified boolean default false,
  income_baseline decimal,
  settlement_reliability_rate decimal default 0,

  -- Metadata
  account_creation_date timestamp default now(),
  last_login timestamp,
  is_active boolean default true,

  -- Consent
  data_sharing_consent boolean default false,
  terms_accepted boolean default false,

  -- Auth (custom JWT, not Supabase Auth)
  pin_hash varchar,

  -- Onboarding progress (8-step wizard)
  onboarding_step smallint not null default 1 check (onboarding_step between 1 and 8),
  onboarding_completed_at timestamp,

  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Virtual accounts (link Nomba VA to worker)
create table virtual_accounts (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  nomba_account_id varchar unique not null,
  account_name varchar,
  bank_code varchar,
  status varchar default 'active',
  created_at timestamp default now()
);

-- Earnings (track daily/transaction earnings)
create table earnings (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  amount decimal not null,
  platform_reference varchar,
  order_id varchar,
  description text,
  recorded_at timestamp default now(),
  created_at timestamp default now(),
  unique (platform_reference, order_id)
);

-- Settlements (track all payouts)
create table settlements (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  amount decimal not null,
  status varchar default 'pending', -- pending, processing, completed, failed
  nomba_transfer_id varchar,
  reference_number varchar unique,
  destination_bank varchar,
  destination_account varchar,
  error_message text,
  settled_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Financial identity scores
create table financial_identity_scores (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  score_value int not null,
  components jsonb not null, -- breakdown of score
  calculated_at timestamp default now(),
  next_recalculation timestamp,
  created_at timestamp default now()
);

-- Verified income certificates
create table verified_income_certificates (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  certificate_id varchar unique not null,
  monthly_income decimal not null,
  verification_method varchar, -- platform_api, manual
  verification_date timestamp,
  expires_at timestamp,
  status varchar default 'active',
  issued_at timestamp default now(),
  created_at timestamp default now()
);

-- Credit requests
create table credit_requests (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  amount_requested decimal not null,
  status varchar default 'pending', -- pending, approved, rejected
  auto_approval_decision varchar, -- approved, need_review
  repayment_plan jsonb,
  requested_at timestamp default now(),
  decided_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Behavioral data (track patterns)
create table worker_behavioral_data (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id),
  daily_earnings jsonb, -- time series: [{date, amount}]
  settlement_frequency int, -- times settled per week
  settlement_consistency decimal, -- percentage consistency
  time_to_settlement int, -- hours until they settle
  earnings_trend varchar, -- growing, stable, declining
  last_calculated timestamp default now(),
  created_at timestamp default now()
);

-- Refresh tokens (custom JWT auth needs somewhere to store/revoke these)
create table refresh_tokens (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id) on delete cascade,
  token varchar unique not null,
  expires_at timestamp not null,
  revoked_at timestamp,
  created_at timestamp default now()
);

-- OTP codes (short-lived, used by the custom Twilio OTP flow)
create table otp_codes (
  id uuid primary key default uuid_generate_v4(),
  phone_number varchar not null,
  code varchar not null,
  expires_at timestamp not null,
  consumed_at timestamp,
  created_at timestamp default now()
);

-- Indexes for performance
create index idx_workers_phone on workers(phone_number);
create index idx_workers_financial_score on workers(financial_score);
create index idx_earnings_worker_date on earnings(worker_id, recorded_at);
create index idx_settlements_worker_status on settlements(worker_id, status);
create index idx_credit_requests_worker_status on credit_requests(worker_id, status);
create index idx_financial_scores_worker_calculated on financial_identity_scores(worker_id, calculated_at desc);
create unique index idx_one_active_certificate_per_worker on verified_income_certificates(worker_id) where status = 'active';
create index idx_refresh_tokens_worker on refresh_tokens(worker_id);
create index idx_otp_codes_phone on otp_codes(phone_number, expires_at desc);
-- 20260706000002_rls_lockdown.sql
--
-- Nothing in this app talks to Postgres directly from the browser — the
-- Express backend is the sole client, always using the Supabase service
-- role key, which bypasses RLS entirely. Enabling RLS here with zero
-- permissive policies means: if the anon/authenticated keys ever leak or
-- get used by mistake, they get nothing. This is a deliberate
-- defense-in-depth default-deny, not a placeholder to fill in later.

alter table workers enable row level security;
alter table virtual_accounts enable row level security;
alter table earnings enable row level security;
alter table settlements enable row level security;
alter table financial_identity_scores enable row level security;
alter table verified_income_certificates enable row level security;
alter table credit_requests enable row level security;
alter table worker_behavioral_data enable row level security;
alter table refresh_tokens enable row level security;
alter table otp_codes enable row level security;
-- 20260706000003_virtual_accounts_bank_number.sql
--
-- BackendPrompt.md's virtual_accounts table has no column to store the
-- actual collection account number Nomba returns (bankAccountNumber) when
-- POST /v1/accounts/virtual succeeds — without it, there's nowhere to
-- persist the number a worker would need to see. Adding it here rather
-- than silently overloading an existing column.

alter table virtual_accounts
  add column bank_account_number varchar;

comment on column virtual_accounts.bank_account_number is 'Nomba''s data.bankAccountNumber from the create-virtual-account response — the actual collection account number.';
comment on column virtual_accounts.bank_code is 'Nomba''s create-VA response returns data.bankName (e.g. "Nombank MFB"), not a numeric bank code — this column holds that name despite its name.';
-- 20260706000004_relax_required_onboarding_fields.sql
--
-- BackendPrompt.md's schema.sql marks full_name and platform NOT NULL, but
-- its own auth flow creates the worker row at OTP-verification time
-- (POST /auth/verify-otp returns a worker_id + token) — before step 3 of
-- onboarding ever collects full_name/platform. Enforcing NOT NULL as
-- literally written would make signup impossible. Relaxing both to
-- nullable so a worker row can exist mid-onboarding, filled in
-- progressively as steps complete.

alter table workers alter column full_name drop not null;
alter table workers alter column platform drop not null;
-- 20260706000005_add_platform_connection_and_2fa_fields.sql
--
-- Onboarding step 5 ("Platform connection: API auth, income verification")
-- and step 6 ("Security setup: PIN + optional 2FA") both need columns that
-- BackendPrompt.md's literal schema.sql doesn't include — it only has
-- platform_earnings_verified, which scoringService derives from actual
-- verified earnings history (>= 5 recorded transactions), not from "has
-- the worker authorized their platform account yet." Adding what's needed
-- to make those two onboarding steps actually persist something.

alter table workers
  add column platform_connected boolean default false,
  add column platform_access_token text, -- should move to Supabase Vault / encrypted storage before handling real platform credentials
  add column two_factor_enabled boolean default false;

comment on column workers.platform_connected is 'True once the worker has authorized platform API access at onboarding step 5 — distinct from platform_earnings_verified, which requires actual verified earnings history.';
