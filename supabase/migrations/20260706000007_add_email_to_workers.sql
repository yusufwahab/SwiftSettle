-- 20260706000007_add_email_to_workers.sql
--
-- Bug fix: migration 20260706000006 added password_hash/email_verified to
-- workers and email to otp_codes, but never actually added an `email`
-- column to `workers` itself — the original BackendPrompt.md schema only
-- ever had `phone_number` there (from the phone+OTP design this replaced).
-- Every signup/login query in authController.js does `.eq("email", ...)`
-- against workers, which has been failing with PGRST204 ("column not
-- found") since email genuinely never existed on that table.

alter table workers
  add column if not exists email varchar unique;

comment on column workers.email is 'The account identifier for email+password auth. Missing from the original migration — added here.';
