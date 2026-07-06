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
