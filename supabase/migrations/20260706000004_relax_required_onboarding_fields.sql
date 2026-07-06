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
