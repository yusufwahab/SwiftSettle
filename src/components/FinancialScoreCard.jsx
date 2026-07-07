import Card from "./ui/Card";
import Badge from "./ui/dark/Badge";
import Skeleton from "./ui/dark/Skeleton";
import { ErrorState } from "./ui/dark/States";

const MAX_SCORE = 850;

const COMPONENT_META = [
  { key: "phone_verified", label: "Phone Verified", max: 50 },
  { key: "bank_verified", label: "Bank Account", max: 75 },
  { key: "platform_connected", label: "Platform Connected", max: 100 },
  { key: "account_tenure", label: "Account Tenure", max: 50 },
  { key: "income_baseline", label: "Income Baseline", max: 150 },
  { key: "settlement_reliability", label: "Settlement Reliability", max: 200 },
  { key: "settlement_consistency", label: "Settlement Consistency", max: 100 },
  { key: "earnings_trend", label: "Earnings Trend", max: 75 },
  { key: "time_to_settlement", label: "Time to Settlement", max: 50 },
];

const tierTone = { premium: "success", standard: "primary", basic: "warning", none: "neutral" };

export default function FinancialScoreCard({ state, compact = false }) {
  if (state.status === "loading") {
    return (
      <Card>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-10 w-24" />
        {!compact && <Skeleton className="mt-4 h-32" />}
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card>
        <ErrorState message={state.error} onRetry={state.reload} className="py-4" />
      </Card>
    );
  }

  const { score, tier, components } = state.data;
  const pct = Math.min(100, Math.round((score / MAX_SCORE) * 100));

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-text-3">Financial Identity Score</p>
        <Badge tone={tierTone[tier] || "neutral"}>{tier} tier</Badge>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-4xl font-bold text-text-1">{score}</p>
        <p className="text-sm text-text-3">/ {MAX_SCORE}</p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>

      {!compact && (
        <div className="mt-5 space-y-3">
          {COMPONENT_META.map((c) => {
            const value = components?.[c.key] ?? 0;
            const barPct = Math.min(100, Math.round((value / c.max) * 100));
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-2">{c.label}</span>
                  <span className="text-text-3">
                    {value}/{c.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div className="h-full rounded-full bg-accent-2" style={{ width: `${barPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
