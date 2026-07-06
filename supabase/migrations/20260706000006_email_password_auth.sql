-- 20260706000006_email_password_auth.sql
--
-- Auth model change: signup is now Name + Email + Password (+ email OTP
-- verification), not phone + OTP. Phone number moves to the post-signup
-- onboarding wizard (for Nomba bank details), so it's no longer collectible
-- at account-creation time and can't stay NOT NULL. otp_codes now also
-- needs to key on email, since that's the only OTP channel left.

alter table workers
  add column password_hash varchar,
  add column email_verified boolean default false;

alter table workers alter column phone_number drop not null;

alter table otp_codes
  add column email varchar;

alter table otp_codes alter column phone_number drop not null;

create index idx_otp_codes_email on otp_codes(email, expires_at desc);

comment on column workers.password_hash is 'bcrypt hash. Auth is email+password now — phone+OTP was replaced entirely, not kept as an alternative.';
comment on column workers.email_verified is 'Set true after the signup email-OTP is confirmed. Distinct from identity_verification_status, which tracks the 30-day financial-identity flow.';
