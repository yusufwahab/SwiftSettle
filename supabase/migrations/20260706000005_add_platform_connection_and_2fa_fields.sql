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
