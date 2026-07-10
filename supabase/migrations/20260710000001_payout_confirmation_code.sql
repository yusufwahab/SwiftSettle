-- 20260710000001_payout_confirmation_code.sql
--
-- Gates admin processing of a payout request behind a confirmation code the
-- worker must enter back into the app. No SMS provider is set up for this
-- build, so the code is delivered over the two channels already available
-- (email + in-app notifications) rather than a "connect Termii" dependency.
-- This is a 2FA-style confirmation on the money-movement action itself
-- (did the account owner really mean to submit this request) — not proof
-- the underlying gig work happened; that still requires a real platform
-- integration down the line (see server/README.md's deviations list).

alter table payout_requests
  add column if not exists confirmation_code_hash varchar,
  add column if not exists confirmation_code_expires_at timestamp,
  add column if not exists confirmed_at timestamp;

comment on column payout_requests.confirmation_code_hash is 'bcrypt hash of the 6-digit code sent via email + in-app notification when the request was created (or last resent). Never stored or returned in plaintext.';
comment on column payout_requests.confirmed_at is 'Set once the worker enters the correct code. Admin processing is blocked until this is non-null.';
