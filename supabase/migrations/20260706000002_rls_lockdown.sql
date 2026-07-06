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
