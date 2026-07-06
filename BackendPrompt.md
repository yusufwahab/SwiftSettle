# INSTRUCTION TO AI CODING ASSISTANT

## Build Complete Backend with Supabase + Node.js + Frontend Integration

---

## **YOUR TASK**

Build the **complete SwiftSettle backend** following the refactor prompt in `updatedPrompt.md`, using:

- **Database**: Supabase (PostgreSQL)
- **Runtime**: Node.js + Express.js
- **Frontend Integration**: All API endpoints connected and ready

**Result**: I paste my `.env` keys and everything works immediately.

---

## **STACK SPECIFICATIONS**

### **Backend**

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase client (supabase-js)
- **Authentication**: JWT + OTP (Twilio for SMS)
- **Webhooks**: Express middleware for Nomba + platform events
- **Error Handling**: Custom error handler + logging

### **Integrations**

- **Nomba APIs**:
  - Virtual Account API
  - Transfers API
  - Webhooks (receiver)
- **Platform Webhooks**: Order completion events
- **Twilio**: OTP delivery

### **Environment**

- **Package Manager**: npm
- **Version Control**: Ready for GitHub
- **Deployment**: Ready for Render/Railway
- **Development**: Hot reload with nodemon

---

## **WHAT TO BUILD**

### **Phase 1: Complete Backend Setup**

#### **1.1 Project Structure**

```
swiftsettle-backend/
├── src/
│   ├── config/
│   │   ├── database.js (Supabase connection)
│   │   ├── env.js (environment variables)
│   │   └── nomba.js (Nomba API client)
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   ├── errorHandler.js
│   │   ├── validateWebhook.js
│   │   └── corsHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── earnings.routes.js
│   │   ├── settlements.routes.js
│   │   ├── financial.routes.js
│   │   ├── credit.routes.js
│   │   ├── webhooks.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── earningsController.js
│   │   ├── settlementsController.js
│   │   ├── financialController.js
│   │   ├── creditController.js
│   │   └── webhookController.js
│   ├── services/
│   │   ├── nombaService.js (all Nomba API calls)
│   │   ├── twilioService.js (OTP sending)
│   │   ├── scoringService.js (credit scoring algorithm)
│   │   ├── platformService.js (platform webhook handling)
│   │   └── emailService.js (notifications)
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── validators.js
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── db/
│   │   ├── migrations/ (Supabase migrations)
│   │   ├── seeds/ (optional test data)
│   │   └── schema.sql (complete schema)
│   └── app.js (Express app setup)
├── .env.example (template)
├── package.json
├── server.js (entry point)
└── README.md
```

#### **1.2 package.json**

Must include all dependencies:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.0",
    "jsonwebtoken": "^9.1.0",
    "twilio": "^3.85.0",
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "node-schedule": "^2.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### **Phase 2: Database Setup (Supabase)**

#### **2.1 SQL Schema**

Create complete schema with all tables from the prompt:

```sql
-- Workers table (extended)
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  full_name VARCHAR NOT NULL,
  date_of_birth DATE,
  state VARCHAR,
  platform VARCHAR NOT NULL,

  -- Bank details
  bank_name VARCHAR,
  account_number VARCHAR,
  account_holder_name VARCHAR,
  bank_verified BOOLEAN DEFAULT false,

  -- Nomba integration
  nomba_virtual_account_id VARCHAR UNIQUE,

  -- Financial data
  identity_verification_status VARCHAR DEFAULT 'pending',
  financial_score INT DEFAULT 0,
  credit_tier VARCHAR DEFAULT 'none',
  platform_earnings_verified BOOLEAN DEFAULT false,
  income_baseline DECIMAL,
  settlement_reliability_rate DECIMAL DEFAULT 0,

  -- Metadata
  account_creation_date TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  -- Consent
  data_sharing_consent BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Virtual accounts (link Nomba VA to worker)
CREATE TABLE virtual_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  nomba_account_id VARCHAR UNIQUE NOT NULL,
  account_name VARCHAR,
  bank_code VARCHAR,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Earnings (track daily/transaction earnings)
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  amount DECIMAL NOT NULL,
  platform_reference VARCHAR,
  order_id VARCHAR,
  description TEXT,
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settlements (track all payouts)
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, processing, completed, failed
  nomba_transfer_id VARCHAR,
  reference_number VARCHAR UNIQUE,
  destination_bank VARCHAR,
  destination_account VARCHAR,
  error_message TEXT,
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial identity scores
CREATE TABLE financial_identity_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  score_value INT NOT NULL,
  components JSONB NOT NULL, -- breakdown of score
  calculated_at TIMESTAMP DEFAULT NOW(),
  next_recalculation TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verified income certificates
CREATE TABLE verified_income_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  certificate_id VARCHAR UNIQUE NOT NULL,
  monthly_income DECIMAL NOT NULL,
  verification_method VARCHAR, -- platform_api, manual
  verification_date TIMESTAMP,
  expires_at TIMESTAMP,
  status VARCHAR DEFAULT 'active',
  issued_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Credit requests
CREATE TABLE credit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  amount_requested DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, approved, rejected
  auto_approval_decision VARCHAR, -- approved, need_review
  repayment_plan JSONB,
  requested_at TIMESTAMP DEFAULT NOW(),
  decided_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Behavioral data (track patterns)
CREATE TABLE worker_behavioral_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  daily_earnings JSONB, -- time series: [{date, amount}]
  settlement_frequency INT, -- times settled per week
  settlement_consistency DECIMAL, -- percentage consistency
  time_to_settlement INT, -- hours until they settle
  earnings_trend VARCHAR, -- growing, stable, declining
  last_calculated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workers_phone ON workers(phone_number);
CREATE INDEX idx_workers_financial_score ON workers(financial_score);
CREATE INDEX idx_earnings_worker_date ON earnings(worker_id, recorded_at);
CREATE INDEX idx_settlements_worker_status ON settlements(worker_id, status);
```

#### **2.2 Supabase Setup Instructions**

Provide clear instructions:

```
1. Go to supabase.com, create account
2. Create new project (choose region closest to Nigeria)
3. Get your PROJECT_URL and ANON_KEY from Settings → API
4. Get your SERVICE_ROLE_KEY from Settings → API
5. Run the SQL schema (paste everything above in SQL editor)
6. Enable Row Level Security (RLS) on tables
7. Copy credentials to .env file
```

### **Phase 3: Authentication System**

#### **3.1 JWT + OTP Implementation**

```javascript
// auth service
- generateOTP() → 6-digit code
- sendOTP(phone) → Twilio SMS
- verifyOTP(phone, code) → validate
- generateJWT(workerId) → token + refresh token
- verifyJWT(token) → decode and validate
- refreshToken(refreshToken) → new JWT
```

#### **3.2 Auth Endpoints**

```
POST /api/auth/signup
  Request: { phone_number }
  Response: { otp_sent: true, retry_in: 60 }

POST /api/auth/verify-otp
  Request: { phone_number, otp_code }
  Response: { token, refresh_token, worker_id }

POST /api/auth/verify-phone-update
  Request: { step: 1-8, data: {...} }
  Response: { success: true, next_step: 2 }

POST /api/auth/complete-signup
  Request: { all_onboarding_data }
  Response: { token, worker_id, onboarding_complete }

POST /api/auth/refresh-token
  Request: { refresh_token }
  Response: { token }

POST /api/auth/logout
  Request: { refresh_token }
  Response: { success: true }
```

### **Phase 4: Core API Endpoints**

#### **4.1 Earnings Endpoints**

```
GET /api/earnings/balance
  Response: {
    balance: 4500,
    updated_at: timestamp,
    daily_total: 1200,
    earnings_trend: [...]
  }

GET /api/earnings/history
  Query: { limit, offset, start_date, end_date }
  Response: { earnings: [...], total: count, page: current }

GET /api/earnings/daily
  Response: { daily_breakdown: { "2026-07-03": 1200, ... } }
```

#### **4.2 Settlements Endpoints**

```
POST /api/settlements/create
  Request: { amount }
  Response: { settlement_id, status, reference }

GET /api/settlements/status/:settlement_id
  Response: {
    status,
    amount,
    reference,
    settled_at,
    bank,
    account
  }

GET /api/settlements/history
  Query: { limit, offset, status }
  Response: { settlements: [...], total: count }
```

#### **4.3 Financial Identity Endpoints**

```
GET /api/financial/score
  Response: {
    score: 720,
    tier: 'A',
    components: { phone_verified: 50, ... },
    days_until_certificate: 5,
    certificate_eligible: true
  }

GET /api/financial/identity-status
  Response: {
    verification_status: 'in_progress',
    progress: 75, -- percentage
    days_remaining: 5,
    milestones: [...]
  }

GET /api/financial/certificate
  Response: {
    certificate_id,
    monthly_income,
    verification_date,
    expires_at,
    download_url
  }
```

#### **4.4 Credit Endpoints**

```
GET /api/credit/eligibility
  Response: {
    eligible: true,
    score: 720,
    available_credit: 50000,
    interest_rate: 2,
    terms: {...}
  }

POST /api/credit/request
  Request: { amount }
  Response: {
    request_id,
    status: 'approved', -- auto-approved if score > 600
    amount,
    interest_rate,
    repayment_period,
    daily_repayment
  }

GET /api/credit/active-loans
  Response: { loans: [...], active_count }

GET /api/credit/repayment-schedule
  Response: { schedule: [...], total_remaining }
```

#### **4.5 Webhook Endpoints**

```
POST /api/webhooks/nomba
  Headers: { 'nomba-signature': '...' }
  Body: { event, data }
  - Validates signature
  - Updates settlement status
  - Triggers score recalculation

POST /api/webhooks/platform
  Headers: { 'x-platform-signature': '...' }
  Body: { order_id, worker_id, amount, platform }
  - Records earning
  - Updates balance
  - Triggers real-time sync
```

### **Phase 5: Services (Core Logic)**

#### **5.1 Nomba Service**

```javascript
nombaService.createVirtualAccount(workerId)
  → Creates unique VA
  → Stores in database
  → Returns VA ID

nombaService.transferFunds(workerId, amount)
  → Calls Nomba Transfers API
  → Creates settlement record
  → Returns transfer_id

nombaService.verifyWebhook(signature, body)
  → Validates signature with Nomw2026 key
  → Ensures webhook is authentic
```

#### **5.2 Scoring Service**

```javascript
scoringService.calculateScore(workerId)
  → Gets worker data
  → Calculates each component
  → Returns score breakdown
  → Stores in database

scoringService.autoTriggerAt30Days()
  → Runs daily at 12:00 AM
  → Finds workers at day 30
  → Calculates score
  → Generates certificate if > 600
  → Creates credit request
```

#### **5.3 Credit Service**

```javascript
creditService.checkEligibility(workerId)
  → Gets financial score
  → If score > 600: eligible
  → Returns available credit (score-based formula)

creditService.autoApproveCredit(workerId, amount)
  → Validates amount vs available credit
  → Auto-approves (no human review)
  → Releases funds via Nomba
  → Sets up repayment schedule
```

### **Phase 6: Frontend Integration**

#### **6.1 API Client Setup**

Create `src/services/api.js` in frontend:

```javascript
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Token expired, refresh it
      return refreshToken().then(() => {
        return api.request(error.config);
      });
    }
    return Promise.reject(error);
  },
);

export default api;
```

#### **6.2 API Hooks (React)**

Create hooks for each feature:

```javascript
// src/hooks/useAuth.js
useAuth() → {signup, login, logout, currentUser}

// src/hooks/useEarnings.js
useEarnings() → {balance, history, dailyTotal}

// src/hooks/useSettlements.js
useSettlements() → {settle, history, status}

// src/hooks/useFinancial.js
useFinancial() → {score, status, certificate}

// src/hooks/useCredit.js
useCredit() → {eligibility, requestCredit, loans}
```

#### **6.3 .env Example**

```
# Backend
REACT_APP_API_URL=http://localhost:5000/api

# Or for production
REACT_APP_API_URL=https://api.swiftsettle.app/api
```

### **Phase 7: Environment Variables**

#### **7.1 Backend .env.example**

```
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database (Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRE=30d

# Nomba APIs
NOMBA_API_KEY=your_nomba_api_key
NOMBA_API_SECRET=your_nomba_api_secret
NOMBA_BASE_URL=https://api.nomba.com/v1
NOMBA_WEBHOOK_SECRET=Nomw2026

# Twilio (OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+234xxxxxxxxx

# Platform Webhooks (DoorDash, Jumia, Uber)
PLATFORM_WEBHOOK_SECRET=your_platform_secret

# Email
SENDGRID_API_KEY=your_sendgrid_key

# Logging
LOG_LEVEL=info
SENTRY_DSN=optional_sentry_url

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://swiftsettle.app
```

---

## **WHAT YOU PROVIDE (ONLY)**

You paste these into `.env`:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NOMBA_API_KEY=
NOMBA_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Everything else is pre-configured and ready.

---

## **DEPLOYMENT READINESS**

Backend must be ready for:

- **Development**: `npm run dev` (nodemon)
- **Production**: `npm start` (node server.js)
- **Deployment**: Ready for Render/Railway
- **Database**: Supabase (no local setup needed)
- **API**: Complete, documented, tested

---

## **CRITICAL REQUIREMENTS**

✅ **Supabase**: All tables, migrations, RLS policies
✅ **Nomba Integration**: All API calls in nombaService.js
✅ **Credit Scoring**: Exact algorithm from prompt
✅ **Auto-Approval**: If score > 600, no human review
✅ **Webhook Handlers**: Nomba + Platform webhooks
✅ **Frontend Ready**: All endpoints callable from React
✅ **Error Handling**: Comprehensive error messages
✅ **Logging**: Request/response logging
✅ **Security**: JWT validation, Nomba signature verification, CORS

---

## **DELIVERABLES**

I need:

1. **Complete Backend Codebase**
   - [ ] All source files (.js)
   - [ ] package.json with all dependencies
   - [ ] .env.example (with all variables)
   - [ ] server.js (entry point)
   - [ ] Supabase SQL schema (complete)

2. **Database Migrations**
   - [ ] SQL file for Supabase
   - [ ] Instructions to set up Supabase
   - [ ] RLS policies (if needed)

3. **API Documentation**
   - [ ] All endpoints listed
   - [ ] Request/response examples
   - [ ] Authentication flow
   - [ ] Error codes

4. **Frontend Integration**
   - [ ] API client setup code
   - [ ] React hooks for all features
   - [ ] .env.example for frontend
   - [ ] Example API calls

5. **Deployment Guide**
   - [ ] Deploy to Render/Railway steps
   - [ ] Environment variable setup
   - [ ] Database initialization
   - [ ] Testing checklist

6. **Testing Guide**
   - [ ] How to test each endpoint
   - [ ] Example requests (Postman/cURL)
   - [ ] Test data seeds

---

## **IMPLEMENTATION ORDER**

1. **Backend Structure** (30 min)
   - File structure
   - package.json
   - Express app setup

2. **Database** (1 hour)
   - SQL schema
   - Supabase setup instructions

3. **Auth System** (2 hours)
   - JWT service
   - OTP service
   - Auth endpoints
   - Auth middleware

4. **Core APIs** (3 hours)
   - Earnings endpoints
   - Settlement endpoints
   - Financial endpoints
   - Credit endpoints

5. **Services** (2 hours)
   - Nomba service
   - Scoring service
   - Credit service
   - Platform service

6. **Webhooks** (1 hour)
   - Nomba webhook handler
   - Platform webhook handler
   - Signature verification

7. **Frontend Integration** (2 hours)
   - API client
   - React hooks
   - Example usage

8. **Documentation** (1 hour)
   - API docs
   - Deployment guide
   - Testing guide

---

## **FINAL INSTRUCTION**

**Build everything listed above. Make it production-ready. Make it so simple that all I do is:**

1. Create Supabase account
2. Get credentials
3. Paste into .env
4. Run `npm start`
5. Backend works immediately
6. Frontend connects automatically

**Zero additional setup. Zero manual configuration. Just paste keys and go.**

---

**Let's build this. 🚀**
