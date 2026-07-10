-- 20260710000002_fix_confirmation_code_expiry_tz.sql
--
-- payout_requests.confirmation_code_expires_at was created as `timestamp`
-- (no timezone) in 20260710000001. Values are always written as UTC, but a
-- plain `timestamp` column round-trips through PostgREST with no
-- timezone marker — new Date(value) in payoutRequestService.confirmPayoutRequest
-- then parses that string as *local server time*, not UTC. On any server
-- whose system timezone is ahead of UTC, the 15-minute-TTL code reads as
-- already expired the instant it's issued. `timestamptz` always round-trips
-- with an explicit offset, so JS parses it correctly regardless of the
-- server's local timezone.

alter table payout_requests
  alter column confirmation_code_expires_at type timestamptz
  using confirmation_code_expires_at at time zone 'utc';
