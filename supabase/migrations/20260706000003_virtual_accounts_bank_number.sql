-- 20260706000003_virtual_accounts_bank_number.sql
--
-- BackendPrompt.md's virtual_accounts table has no column to store the
-- actual collection account number Nomba returns (bankAccountNumber) when
-- POST /v1/accounts/virtual succeeds — without it, there's nowhere to
-- persist the number a worker would need to see. Adding it here rather
-- than silently overloading an existing column.

alter table virtual_accounts
  add column bank_account_number varchar;

comment on column virtual_accounts.bank_account_number is 'Nomba''s data.bankAccountNumber from the create-virtual-account response — the actual collection account number.';
comment on column virtual_accounts.bank_code is 'Nomba''s create-VA response returns data.bankName (e.g. "Nombank MFB"), not a numeric bank code — this column holds that name despite its name.';
