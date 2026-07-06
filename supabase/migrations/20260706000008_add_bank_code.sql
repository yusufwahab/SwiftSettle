-- 20260706000008_add_bank_code.sql
--
-- Bug fix: onboarding step 2 only ever collected a bank NAME (from a static
-- dropdown), never the numeric CBN bank code Nomba's Transfer API actually
-- requires (bankCode must be exactly 3 or 6 digits — confirmed from a real
-- 422 response: "bankCode must be exactly 3 or 6 digits"). bank_name alone
-- was being passed as bankCode, which can never work. The bank list (name +
-- code together) now comes from Nomba's own GET /v1/transfers/banks.

alter table workers
  add column if not exists bank_code varchar;

comment on column workers.bank_code is 'Numeric CBN bank code (3 or 6 digits) from Nomba''s GET /v1/transfers/banks — required by the Transfer API. Distinct from bank_name, which is just the display name.';
