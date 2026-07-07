-- 20260707000002_payout_requests_and_notifications.sql
--
-- Adds the worker-initiated payout request flow and an admin role to
-- process it. A worker bundles their currently-pending earnings into one
-- payout_request; an admin (a worker account flagged is_admin, no separate
-- login system) processes it with an amount that can deliberately differ
-- from what was requested — the same matched/underpaid/overpaid/unmatched
-- vocabulary as direct VA reconciliation, just triggered by an admin action
-- instead of an organic deposit. Also adds a real in-app notifications
-- table (previously 100% mocked even in live mode).

alter table workers
  add column if not exists is_admin boolean not null default false;

create table if not exists payout_requests (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id) not null,
  requested_total decimal not null,
  status varchar not null default 'requested', -- requested | matched | underpaid | overpaid
  received_amount decimal,
  nomba_transaction_id varchar unique,
  processed_by uuid references workers(id),
  requested_at timestamp default now(),
  processed_at timestamp
);

create index if not exists idx_payout_requests_worker on payout_requests(worker_id);
create index if not exists idx_payout_requests_status on payout_requests(status);

-- Earnings bundled into a payout_request move to status='requested' (still
-- not counted as real balance) until the request resolves, at which point
-- each bundled earning's received_amount/status is set pro-rata against the
-- request's actual received_amount — keeps getBalance/income-baseline/
-- behavioral-data reading earnings exactly as before, no separate code path.
alter table earnings
  add column if not exists payout_request_id uuid references payout_requests(id);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references workers(id) not null,
  type varchar not null,
  title varchar not null,
  body text not null,
  tone varchar not null default 'info', -- success | warning | danger | info
  read_at timestamp,
  created_at timestamp default now()
);

create index if not exists idx_notifications_worker on notifications(worker_id, created_at desc);

-- Same default-deny defense-in-depth as 20260706000002_rls_lockdown.sql —
-- the Express backend is the only client and always uses the service-role
-- key, which bypasses RLS entirely; this just means a leaked anon key gets
-- nothing from these two new tables either.
alter table payout_requests enable row level security;
alter table notifications enable row level security;

comment on column workers.is_admin is 'Flags a worker account as staff — same login, no separate admin auth system. Gates /api/payouts admin endpoints and the sidebar Admin nav item.';
comment on table payout_requests is 'A worker-initiated request to be paid for bundled pending earnings. Reconciled unit is the request itself (one requested_total, one received_amount) — not each underlying earning individually, to avoid proportional-split complexity at the matching layer.';
comment on column earnings.payout_request_id is 'Set when a pending earning is bundled into a payout request. Earnings keep their own received_amount/status too (set pro-rata once the request resolves) so balance/scoring queries need no special-casing.';
comment on table notifications is 'Real in-app notifications — previously this was mocked even in live mode.';
