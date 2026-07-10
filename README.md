# SwiftSettle

A financial identity platform for gig workers, built on Nomba's payment
rails: real-time earnings tracking, instant settlement to a bank account,
a behavior-driven credit score with auto-approved micro-loans, and a
worker-initiated payout request flow with a lightweight admin role to
process it. React + Vite + Tailwind v4 frontend; the real backend lives in
[`server/`](server/README.md) (Express + Supabase + Nomba + Brevo).

## Tech stack

- **React 19 + Vite + React Router 7**
- **Tailwind v4** (CSS-first `@theme` config — there's no `tailwind.config.js`)
- **Recharts** for charts/gauges
- **lucide-react** for icons

No state-management library — data-fetching is a shared `useAsync` hook per
page, auth session lives in `AuthContext` (backed by `sessionStorage`).

## Setup

```
npm install
npm run dev       # http://localhost:5173
npm run build
npm run lint
```

### Mock vs. live mode

The entire app runs against a set of "services" (`src/services/`) with two
interchangeable implementations, picked by `VITE_API_MODE`:

```
# .env.local
VITE_API_MODE=mock   # default — in-browser fake data, no backend needed
VITE_API_MODE=live   # calls the real backend in server/
VITE_API_URL=http://localhost:5000/api   # only used when live
```

Pages never import from `services/mock` or `services/live` directly — they
import from `src/services/index.js`, which picks the active implementation
based on `VITE_API_MODE`. Switching modes requires no component changes.

**What's actually mocked, and what isn't, in `live` mode:**
- **Real, backed by the Express API:** auth, onboarding, earnings/balance,
  settlements, payout requests, financial score/identity/certificate,
  credit eligibility/requests, bank list, and **in-app notifications**
  (this was mocked even in live mode until the payout-request work — it's
  a real table + endpoint now).
- **Still intentionally mock, even in `live` mode:** the Support/FAQ page
  content, notification *preferences* (the toggles on Settings), and
  Earnings' "Performance Metrics" (completion rate / rating / on-time
  delivery) — none of these have a real data source in either backend
  prompt (no orders/ratings subsystem exists), so rather than fabricate
  numbers, they stay on the canned dataset. This is called out in a
  comment at each call site (`src/services/live/earningsService.js`'s
  `getPerformance`, `src/services/index.js`'s registry).

If a page looks "mocked" and it's *not* one of the three things listed
above, that's a bug, not by design — the backend for everything else
(including the payout/admin flow) is real and wired up.

## What's implemented

- **Auth** — email + password signup with an email-OTP verification step, login, session refresh.
- **Onboarding** — a 4-step skippable wizard (personal/contact, bank details, security PIN, consent); a persistent nudge on Dashboard/Settings if it's incomplete.
- **Dashboard** — available balance, real Nomba settlement ("Settle Now"), a live financial-score snapshot, and the **Payout Requests** flow (see below).
- **Payout requests** — "Log a Completed Order" records a completed delivery or trip (a grid of realistic amount presets, or a custom one); "Request Payout" bundles every logged order into one request, which the worker must then confirm with a 6-digit code (sent by email and in-app notification) before an admin can act on it. An **Admin: Payouts** page (only visible to accounts with admin access) processes confirmed requests with an amount that can deliberately differ from what was requested, demonstrating matched/underpaid/overpaid/unmatched reconciliation. Any account can self-grant admin access from Settings — no separate admin login exists.
- **Earnings** — weekly/monthly charts, stats, and a payout-request history table.
- **Settlements** — history of real outbound transfers to the worker's bank.
- **Financial Identity & Credit** (`/app/credit`) — score breakdown, identity progress tracker, verified income certificate, settlement reliability gauges, credit eligibility + request modal, and an educational credit-building guide.
- **Settings** — profile/bank details, notification preferences, and the admin-access self-service toggle.
- **Real in-app + email notifications** — a processed payout triggers both a real notification row (shown in the Dashboard's notification panel) and a real email (via Brevo, through the backend).

## Project structure

```
src/
├── pages/            One component per route (see App.jsx for the full route list)
├── components/        Shared UI: modals (SettlementModal, CreditRequestModal, ProcessPayoutModal, ...),
│                       layout (Sidebar, AppLayout, TopBar), ui/dark/* design system
├── services/
│   ├── index.js        Registry — the only import surface the rest of the app uses
│   ├── mock/            Fake data + simulated latency, no network calls
│   └── live/             Real fetch calls to the backend, plus response normalization
│                         (normalizeWorker.js is the single place backend snake_case
│                         becomes the camelCase shape every page expects)
├── context/AuthContext.jsx   Session state, persisted to sessionStorage
├── hooks/useAsync.js         Shared loading/error/success data-fetching pattern
├── lib/               apiClient (fetch wrapper + token refresh), format, chartTheme
└── data/mockData.js   Static fixtures consumed by the mock service layer
```

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Landing | Public marketing page |
| `/login`, `/signup` | Auth | Public |
| `/app/dashboard` | Dashboard | Balance, Settle Now, Payout Requests, financial-score snapshot |
| `/app/onboarding` | Onboarding wizard | 4 steps, skippable |
| `/app/earnings` | Earnings | Charts + payout-request history |
| `/app/settlements` | Settlements | Outbound transfer history |
| `/app/credit` | Financial Identity & Credit | Score, certificate, credit request |
| `/app/admin/payouts` | Admin: Payouts | Only reachable with admin access; redirects otherwise |
| `/app/settings` | Settings | Profile, notification prefs, admin-access toggle |
| `/app/support` | Support | FAQ (static content) |

## Where this deviates from the original design

- **Auth is email + password with an email-OTP verification step**, not
  passwordless phone+OTP — changed per direct follow-up instruction partway
  through the build. See `server/README.md`'s deviations list for the full
  reasoning.
- **Onboarding is 4 steps, not 8**, and happens entirely after signup rather
  than blocking it — every step is skippable, with a persistent nudge
  instead of a hard gate.
- **The dashboard shows financial-identity progress, not just earnings** —
  a compact score card sits directly under the balance, linking to the full
  `/app/credit` page.
- **A real admin surface exists** (`/app/admin/payouts`) even though the
  backend's original "no admin UI" instruction is still honored for the
  *other* admin concept (`GET /api/admin/behavioral-analytics`, which
  remains API-only). This is a different, later-added admin role scoped
  specifically to processing payout requests — see `server/README.md`'s
  "Two separate admin mechanisms" section.

See [`server/README.md`](server/README.md) for the backend's full API
reference, the reconciliation model, and the complete deviations list.
