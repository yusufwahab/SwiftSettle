I have already built a basic version of SwiftSettle (React Vite + Node.js + TailwindCSS) focused on:

Worker authentication (phone + OTP)
Real-time earnings display
Instant settlement to bank accounts
Earnings analytics
Basic dashboard

Now I need to pivot this to a Financial Identity Infrastructure Platform that builds credit and unlocks financial services.

YOUR TASK

Analyze the existing codebase and provide:

What to keep (reusable components/logic)
What to refactor (existing code that needs restructuring)
What to add (new features for identity/credit infrastructure)
Implementation order (fastest path to the new vision)

NEW VISION (THE SHIFT)

Old Goal

Help workers settle earnings faster (basic payment app)

New Goal

Build verified financial identity that enables credit access and financial services

Core Changes

Data Collection → Every onboarding field and behavioral data feeds into credit scoring
Onboarding → 8-step process (not quick signup) that builds identity layer
Dashboard → Shows financial identity progress, not just earnings
New Features → Credit score, verified income certificate, micro-loans, insurance eligibility

SPECIFIC REFACTORING NEEDED

1. DATABASE SCHEMA CHANGES

Existing Tables (Keep but Extend):

workers table

ADD: identity_verification_status (pending/verified)
ADD: financial_score (0-850)
ADD: credit_tier (none/basic/standard/premium)
ADD: platform_earnings_verified (true/false)
ADD: income_baseline (monthly average)
ADD: settlement_reliability_rate (percentage)
ADD: account_creation_date (for tenure calculation)

transactions table (keep as-is, will use for analysis)
settlements table (keep as-is, will use for reliability tracking)

New Tables:

financial_identity_scores

worker_id
score_value (0-850)
components (JSON: phone_verified: 10, bank_verified: 15, platform_connected: 20, etc.)
calculated_at
next_recalculation

verified_income_certificates

worker_id
certificate_id (unique)
monthly_income (verified amount)
verification_method (platform_api/manual)
verification_date
expires_at
issued_at
status (active/expired)

credit_requests

worker_id
amount_requested
status (pending/approved/rejected)
auto_approval_decision (approved/need_review)
requested_at
decided_at
repayment_plan (JSON)

worker_behavioral_data

worker_id
daily_earnings (time series)
settlement_frequency (when do they settle)
settlement_consistency (are they predictable)
time_to_settlement (how long before they settle)
earnings_trend (growing/stable/declining)

2. ONBOARDING FLOW REFACTOR

Current Implementation (probably):

Single signup form with basic fields
Fast path to dashboard

New Implementation Needed:

Step 1: Welcome screen (explain credit building)
↓
Step 2: Phone + OTP (identity verification)
↓
Step 3: Personal info (name, DOB, state, platform)
↓
Step 4: Bank account (with Nomba VA creation)
↓
Step 5: Platform connection (API auth, income verification)
↓
Step 6: Security setup (PIN + optional 2FA)
↓
Step 7: Terms & consent (data sharing for credit building)
↓
Step 8: Welcome screen (show financial status)

Each step needs its own screen component + backend API endpoint.

3. NOMBA API INTEGRATION CHANGES

What You Probably Have:

Virtual Account creation at signup
Transfers API for settlement

What You Need to Add:

Webhook listener for settlement confirmations

Listen for: transfer.completed, transfer.failed
Update: Settlement reliability score, worker's credit components

Platform webhook receiver (for order completion)

Listen for: Order completion events from DoorDash/Jumia/Uber
Trigger: Earnings update to VA, real-time dashboard update, reliability tracking

Automated settlement flow (new)

Worker earnings arrive → Auto-track in database
Nomba updates VA → Dashboard reflects real-time
No manual settlement API calls needed (it's automated on backend)

4. BACKEND API ENDPOINTS REFACTOR

Existing Endpoints (Keep but Extend):

POST /auth/signup → Now multi-step, collects identity data
POST /auth/verify-otp → Same
GET /dashboard → Now includes financial score, identity status
POST /settlements → Now tracked for reliability
GET /settlements → Same

New Endpoints Needed:

GET /financial-score → Returns current credit score + breakdown
POST /verify-income → Connects to platform API, pulls earnings
GET /verified-income-certificate → Returns certificate after 30 days
POST /credit-request → Request micro-loan
GET /credit-eligibility → Check if eligible for credit
GET /financial-identity-status → Show progress (days until certificate)
POST /webhooks/nomba → Receive settlement confirmations
POST /webhooks/platform → Receive order completions
GET /behavioral-analytics → Internal endpoint for credit calculation

5. FRONTEND COMPONENTS REFACTOR

Existing Components (Likely Keep):

Dashboard layout (sidebar, main content)
Settlement modal
Charts/analytics

Components to Refactor:

Dashboard → Now shows financial score, not just earnings
Earnings page → Now shows income baseline and trend

New Components Needed:

OnboardingFlow (8-step wizard)
FinancialScoreCard (shows credit score, breakdown)
IdentityProgressTracker (shows days until certificate)
VerifiedIncomeCertificate (displays certificate after 30 days)
CreditRequestModal (request micro-loan)
CreditEligibility (shows if eligible, rates, terms)
SettlementReliabilityChart (shows their consistency)
CreditGuide (educational content)

6. DATA CALCULATION CHANGES

New Calculation Needed: Financial Score

Score Components (out of 850 total):

Phone Verification: +50 (is phone verified)
Bank Account: +75 (are they banked)
Platform Connected: +100 (income source verified)
Account Tenure: +50 (days since signup)

- Formula: min(50, days_since_signup / 10)

Income Baseline: +150 (consistent earnings)

- If earnings > ₦100K/month: +150
- If earnings > ₦50K/month: +100
- If earnings > ₦20K/month: +50

Settlement Reliability: +200 (how reliable are they)

- Formula: (successful_settlements / total_settlements) \* 200
- Example: 30/30 settlements = 200 points

Settlement Consistency: +100 (how predictable)

- Do they settle same time every day? +100
- Random times? +50
- Rarely settle? +0

Earnings Trend: +75 (growing or stable)

- Growing 10%+ month-on-month: +75
- Stable (within 10%): +50
- Declining: +0

Time to Settlement: +50 (how soon do they settle)

- Same day: +50
- Next day: +25
- Later: +0

Total Possible: 850 points

After 30 days, this auto-calculates. If score > 600, eligible for credit.

7. CREDIT ACCESS FLOW (New)

After 30 days + score > 600:

Worker taps "Request Credit"
↓
System shows:

- Your available credit: ₦50,000
- Interest rate: 2%
- Repayment period: 25 days
- Daily repayment: ₦2,000
  ↓
  Worker enters amount (max: available credit)
  ↓
  System auto-approves (no human review, score-based)
  ↓
  Nomba releases funds to worker's account
  ↓
  System starts auto-deducting daily repayment from settlements

No application form. No waiting. Auto-approval based on score.

8. NOTIFICATIONS & BEHAVIORAL TRACKING

New Notifications Needed:

"You're 5 days away from financial identity certificate"
"Your financial score just improved by 15 points"
"You're eligible for credit access now (₦30K available)"
"Your credit was approved: ₦50K at 2% interest"
"Daily credit repayment: ₦2,000 deducted from today's settlement"

Behavioral Tracking Needed:

Track when user opens app (frequency)
Track which screens they visit (engagement)
Track settlement timing (consistency)
Track if they request credit (financial confidence)
Track if they enable security features (responsibility)

All feeds into reliability scoring.

IMPLEMENTATION ROADMAP

Phase 1: Database & Backend (8-12 hours)

Add new fields to workers table
Create new tables (financial_identity_scores, verified_income_certificates, etc.)
Create new API endpoints (financial-score, credit-request, webhooks)
Implement credit scoring algorithm
Add Nomba webhook listener
Add platform webhook receiver

Phase 2: Frontend Refactor (6-8 hours)

Refactor onboarding to 8-step flow
Create financial score display component
Create identity progress tracker
Create verified income certificate view
Create credit request modal
Update dashboard to show score instead of just earnings

Phase 3: Integration & Testing (4-6 hours)

Connect frontend to new backend endpoints
Test complete flow (signup → 30 days → credit access)
Test credit auto-approval
Test Nomba webhooks
Test platform webhooks

Phase 4: Polish & Documentation (2-3 hours)

Refine UI/UX
Add loading states
Add error handling
Document new API endpoints
Create demo script

SPECIFIC CODE QUESTIONS TO ASK

When working with your AI on the refactor:

For Database:

"Help me design the migration scripts for adding financial_score and related tables"
"Create the database schema for credit requests and behavioral tracking"

For Backend:

"Implement the financial score calculation algorithm based on these components"
"Create the webhook listeners for Nomba (transfer confirmations) and platform events"
"Build the auto-credit-approval logic (if score > 600, auto-approve)"

For Frontend:

"Convert the signup form into an 8-step onboarding wizard"
"Create a financial score card component showing breakdown"
"Build identity progress tracker (X days until certificate)"

For Integration:

"Connect the credit request button to backend, handle approval response"
"Wire up the verified income certificate display after 30 days"
"Implement real-time score updates from backend"

KEY PRINCIPLES FOR THE REFACTOR

✅ Keep earnings/settlement logic (it works, don't break it)
✅ Add identity layer on top (new tables, new calculations)
✅ Make score automatic (no manual steps, no verification delays)
✅ Make credit auto-approval (code the algorithm, no humans needed)
✅ Keep UI simple (don't overwhelm with credit features on day 1)
✅ Educate progressively (explain credit building in onboarding, not dashboard)

SUCCESS CRITERIA

After refactor is complete:

✅ Worker signs up in 8 steps (15 minutes)
✅ All identity data collected
✅ Virtual account created
✅ Earnings flow tracked
✅ After 30 days: Financial score auto-calculates
✅ After 30 days: Verified income certificate available
✅ After 30 days: Credit access becomes available
✅ Worker can request loans with no paperwork (auto-approved)
✅ Dashboard shows identity progress, not just earnings

FINAL INSTRUCTION

Use this prompt to ask your AI:

"I have a SwiftSettle codebase that currently does instant payments. I'm refactoring it to financial identity infrastructure. [Paste the above]. Based on this, please:

Review my existing code (I'll share it)
Identify what to keep, refactor, and add
Provide step-by-step implementation plan
Help me build the refactored version

Start with the database schema changes, then move to backend API, then frontend."
