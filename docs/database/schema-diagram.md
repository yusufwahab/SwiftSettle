# SwiftSettle — Backend Schema Diagram

Matches `supabase/migrations/20260706000001_schema.sql` (per `BackendPrompt.md`).
This replaces the earlier Supabase-Auth-based schema — auth here is custom
JWT + Twilio OTP handled entirely by the Express backend, not Supabase Auth,
so there's no `auth.users` link; instead `refresh_tokens` and `otp_codes`
exist to support that custom flow.

```mermaid
erDiagram
    WORKERS ||--o{ VIRTUAL_ACCOUNTS : "has"
    WORKERS ||--o{ EARNINGS : "earns"
    WORKERS ||--o{ SETTLEMENTS : "settles"
    WORKERS ||--o{ FINANCIAL_IDENTITY_SCORES : "scored over time"
    WORKERS ||--o{ VERIFIED_INCOME_CERTIFICATES : "certified"
    WORKERS ||--o{ CREDIT_REQUESTS : "requests credit"
    WORKERS ||--o{ WORKER_BEHAVIORAL_DATA : "summarized by"
    WORKERS ||--o{ REFRESH_TOKENS : "sessions"

    WORKERS {
        uuid id PK
        varchar phone_number UK
        boolean phone_verified
        varchar full_name
        date date_of_birth
        varchar state
        varchar platform
        varchar bank_name
        varchar account_number
        varchar account_holder_name
        boolean bank_verified
        varchar nomba_virtual_account_id UK
        varchar identity_verification_status "pending|verified"
        int financial_score "0-850"
        varchar credit_tier "none|basic|standard|premium"
        boolean platform_earnings_verified
        decimal income_baseline
        decimal settlement_reliability_rate
        timestamp account_creation_date
        timestamp last_login
        boolean is_active
        boolean data_sharing_consent
        boolean terms_accepted
        varchar pin_hash
        smallint onboarding_step "1-8"
        timestamp onboarding_completed_at
        timestamp created_at
        timestamp updated_at
    }

    VIRTUAL_ACCOUNTS {
        uuid id PK
        uuid worker_id FK
        varchar nomba_account_id UK
        varchar account_name
        varchar bank_code
        varchar status
        timestamp created_at
    }

    EARNINGS {
        uuid id PK
        uuid worker_id FK
        decimal amount
        varchar platform_reference "unique with order_id"
        varchar order_id "unique with platform_reference"
        text description
        timestamp recorded_at
        timestamp created_at
    }

    SETTLEMENTS {
        uuid id PK
        uuid worker_id FK
        decimal amount
        varchar status "pending|processing|completed|failed"
        varchar nomba_transfer_id
        varchar reference_number UK
        varchar destination_bank
        varchar destination_account
        text error_message
        timestamp settled_at
        timestamp created_at
        timestamp updated_at
    }

    FINANCIAL_IDENTITY_SCORES {
        uuid id PK
        uuid worker_id FK
        int score_value "0-850"
        jsonb components
        timestamp calculated_at
        timestamp next_recalculation
        timestamp created_at
    }

    VERIFIED_INCOME_CERTIFICATES {
        uuid id PK
        uuid worker_id FK
        varchar certificate_id UK
        decimal monthly_income
        varchar verification_method "platform_api|manual"
        timestamp verification_date
        timestamp expires_at
        varchar status "active|expired"
        timestamp issued_at
        timestamp created_at
    }

    CREDIT_REQUESTS {
        uuid id PK
        uuid worker_id FK
        decimal amount_requested
        varchar status "pending|approved|rejected"
        varchar auto_approval_decision "approved|need_review"
        jsonb repayment_plan
        timestamp requested_at
        timestamp decided_at
        timestamp created_at
        timestamp updated_at
    }

    WORKER_BEHAVIORAL_DATA {
        uuid id PK
        uuid worker_id FK
        jsonb daily_earnings
        int settlement_frequency
        decimal settlement_consistency
        int time_to_settlement
        varchar earnings_trend "growing|stable|declining"
        timestamp last_calculated
        timestamp created_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid worker_id FK
        varchar token UK
        timestamp expires_at
        timestamp revoked_at
        timestamp created_at
    }

    OTP_CODES {
        uuid id PK
        varchar phone_number
        varchar code
        timestamp expires_at
        timestamp consumed_at
        timestamp created_at
    }
```
