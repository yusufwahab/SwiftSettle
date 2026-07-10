-- 20260712000001_bill_payments.sql
--
-- Lets a worker send part of their available balance to a third-party bank
-- account under a category (rent/school fees/gym/other) rather than only
-- ever settling to their own registered bank. Same underlying Nomba
-- transfer as settlements, just to an arbitrary recipient — verified via
-- Nomba's real bank-account-lookup endpoint before the transfer is sent,
-- not a raw unverified account number.
--
-- Recurring payments to the same recipient feed a new credit-score
-- component (see scoringService.js) — a one-off transfer doesn't move the
-- score; the same recipient paid across multiple distinct months does,
-- since that's an actual signal of a standing financial obligation being
-- met reliably, not just "made a transfer."

create table if not exists bill_payments (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id) not null,
  category varchar not null, -- rent | school_fees | gym | other
  recipient_account_number varchar not null,
  recipient_bank_code varchar not null,
  recipient_bank_name varchar,
  recipient_account_name varchar not null, -- resolved via Nomba's lookup endpoint, never free-typed
  amount decimal not null,
  status varchar not null default 'pending', -- pending | processing | completed | failed
  reference_number varchar unique not null,
  nomba_transfer_id varchar unique,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create index if not exists idx_bill_payments_worker on bill_payments(worker_id, created_at desc);
create index if not exists idx_bill_payments_recipient on bill_payments(worker_id, recipient_account_number, recipient_bank_code);

alter table bill_payments enable row level security;

comment on table bill_payments is 'Outbound transfers to a third-party recipient (rent/school fees/gym/other), distinct from settlements (which always pay the worker''s own registered bank). Committed amounts here count against available balance the same way settlements do.';
comment on column bill_payments.recipient_account_name is 'Resolved via POST /v1/transfers/bank/lookup before the transfer is created — never trusts a free-typed name.';
