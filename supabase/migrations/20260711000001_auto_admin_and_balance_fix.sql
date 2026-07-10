-- 20260711000001_auto_admin_and_balance_fix.sql
--
-- 1. Admin access is no longer a self-service opt-in — every worker account
--    (new and existing) is an admin automatically, no "Enable Admin Access"
--    step in Settings. Per direct follow-up instruction, to remove that
--    friction entirely. Note this is a deliberate simplification for this
--    build (single-tenant demo/hackathon use) — in a real multi-tenant
--    product, every worker being able to see and process every other
--    worker's payout requests would be a real access-control problem, not
--    just a convenience.

alter table workers alter column is_admin set default true;
update workers set is_admin = true where is_admin = false;

comment on column workers.is_admin is 'Every worker is an admin automatically (default true) — no self-service toggle exists anymore. Gates /api/payouts admin endpoints and the sidebar Admin nav item.';
