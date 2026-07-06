# SwiftSettle Backend — Testing Guide

No automated test suite exists yet — this is a manual curl-based checklist
for exercising the full flow against a real Supabase project. Run
`npm run dev` in `server/` first, and have real Supabase keys in `.env`
(Nomba/Brevo can stay unconfigured — see the backend README).

Set a shell variable for convenience:
```bash
API=http://localhost:5000/api
```

## 1. Health check

```bash
curl $API/../health
# { "status": "ok", "time": "..." }
```

## 2. Signup + email OTP

```bash
curl -X POST $API/auth/signup -H "Content-Type: application/json" \
  -d '{"full_name":"Chioma Adeyemi","email":"chioma@example.com","password":"correct-horse-battery"}'
# { "otp_sent": true, "retry_in": 60 }
```

Without Brevo configured, the actual code is in the server console log
(search for `"logging email instead of sending"`), not in the response —
copy it from there.

```bash
curl -X POST $API/auth/verify-email -H "Content-Type: application/json" \
  -d '{"email":"chioma@example.com","otp_code":"123456"}'
# { "token": "...", "refresh_token": "...", "worker_id": "..." }
```

Save the token:
```bash
TOKEN="paste the token here"
```

Confirm login now works too (and fails before verification would have):
```bash
curl -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"chioma@example.com","password":"correct-horse-battery"}'
```

## 3. Fetch your own profile

```bash
curl $API/auth/me -H "Authorization: Bearer $TOKEN"
```

## 4. Complete onboarding (one shot)

```bash
curl -X POST $API/auth/complete-signup -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{
    "date_of_birth": "1998-03-15",
    "state": "Lagos",
    "platform": "Uber",
    "phone_number": "+2348011112222",
    "bank_name": "Guaranty Trust Bank",
    "account_number": "0123456789",
    "account_holder_name": "Chioma Adeyemi",
    "pin": "1234",
    "data_sharing_consent": true,
    "terms_accepted": true
  }'
```

Without Nomba configured, this fails at the virtual-account-creation step
with a clear `"Nomba is not configured"` error — expected until you add
real Nomba keys. With Nomba configured, check `virtual_accounts` in
Supabase for the new row.

Or step through it one at a time via `/auth/verify-phone-update` (see
`docs/api/reference.md` for what each of steps 1-4 expects).

## 5. Get an earning onto the account

Two ways, depending on what you're testing:

**a) Quick/self-service (any logged-in worker, no signature needed):**
```bash
curl -X POST $API/earnings/simulate -H "Authorization: Bearer $TOKEN"
# { "simulated": true, "amount": 1850 }
```
This is what the Dashboard's "+ Simulate Delivery (Demo)" button calls. Use
this for everyday testing/demo — it's the only realistic way to get a
non-zero balance until a real gig-platform partner is integrated.

**b) Testing the real platform-webhook path itself** (signature
verification, idempotency) — this is what you'd actually be testing if a
platform partner's integration were misbehaving:
```bash
BODY='{"order_id":"ORDER-001","worker_id":"<paste worker_id>","amount":1500,"platform":"Uber"}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$PLATFORM_WEBHOOK_SECRET" | sed 's/^.* //')
curl -X POST $API/webhooks/platform -H "Content-Type: application/json" \
  -H "x-platform-signature: $SIG" -d "$BODY"
```
Redeliver the exact same body/signature a second time and confirm the
response comes back `{ "received": true, "duplicate": true }` — that's the
idempotency guarantee working.

## 6. Check balance and history

```bash
curl $API/earnings/balance -H "Authorization: Bearer $TOKEN"
curl $API/earnings/daily -H "Authorization: Bearer $TOKEN"
curl "$API/earnings/history?limit=10" -H "Authorization: Bearer $TOKEN"
```

## 7. Settle

```bash
curl -X POST $API/settlements/create -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"amount":1500}'
```

Expect `insufficient_balance` if you request more than step 6 showed, and
`no_bank_account` if step 4 hasn't run yet.

## 8. Financial score

```bash
curl $API/financial/score -H "Authorization: Bearer $TOKEN"
curl $API/financial/identity-status -H "Authorization: Bearer $TOKEN"
```

Score won't cross 600 with only one test earning/settlement — that's
expected; the algorithm needs real history (see `scoringService.js`'s
component breakdown) to climb.

## 9. Credit (only reachable once score > 600)

```bash
curl $API/credit/eligibility -H "Authorization: Bearer $TOKEN"
curl -X POST $API/credit/request -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"amount":5000}'
```

## 10. Refresh + logout

```bash
curl -X POST $API/auth/refresh-token -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}"

curl -X POST $API/auth/logout -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}"
```

After logout, the same refresh token should fail with `invalid_refresh_token`.

## Checklist

- [ ] Signup sends an email OTP (or logs it) without erroring
- [ ] Wrong OTP is rejected with `invalid_otp`
- [ ] Correct OTP returns a working token + refresh_token, and marks email_verified
- [ ] Login fails with `email_not_verified` before the OTP step, succeeds after
- [ ] Login fails with `invalid_credentials` on a wrong password
- [ ] `/auth/me` returns the profile right after verify-email
- [ ] Onboarding step 2 creates a `virtual_accounts` row (with real Nomba keys)
- [ ] A platform webhook creates an `earnings` row; redelivering it doesn't duplicate
- [ ] Balance reflects recorded earnings minus settled amounts
- [ ] Settlement request fails cleanly over-balance and without a bank account
- [ ] Financial score components add up and change as earnings/settlements accumulate
- [ ] Credit request is rejected below the 600 threshold, auto-approved above it
- [ ] Nomba webhook signature verification actually rejects a tampered payload
- [ ] Expired/invalid refresh token is rejected
- [ ] Logout revokes the refresh token
