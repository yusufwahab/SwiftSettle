-- 20260707000001_earnings_reconciliation.sql
--
-- Turns `earnings` from "instantly-credited claims" into a real two-step
-- reconciliation ledger, matching how a dedicated virtual account actually
-- works: a platform reports an order (pending, amount = expected), then
-- Nomba's payment_success webhook confirms what actually landed in the
-- worker's VA (received_amount, which may differ from the expected amount).
-- Balance/behavioral/income calculations move from `amount` to
-- `received_amount` on reconciled rows only — unreconciled claims no longer
-- count as real money.

alter table earnings
  add column if not exists status varchar not null default 'pending', -- pending | matched | underpaid | overpaid | unmatched
  add column if not exists received_amount decimal,
  add column if not exists nomba_transaction_id varchar unique,
  add column if not exists reconciled_at timestamp;

-- Every row that existed before this migration was credited under the old
-- "claim = money" model (either a real platform webhook or the demo
-- Simulate Delivery button) — grandfather them in as already-reconciled so
-- existing balances don't change retroactively.
update earnings
  set status = 'matched', received_amount = amount, reconciled_at = recorded_at
  where status = 'pending';

create index if not exists idx_earnings_worker_status on earnings(worker_id, status);

comment on column earnings.status is 'pending (awaiting VA deposit) | matched | underpaid | overpaid | unmatched (deposit with no matching pending order)';
comment on column earnings.received_amount is 'Actual amount confirmed via Nomba''s payment_success webhook — distinct from amount (what the platform claimed the order was worth).';
comment on column earnings.nomba_transaction_id is 'Nomba transaction ID from the payment_success webhook — unique, makes reconciliation idempotent against webhook retries.';
