import { ShieldCheck, Lock } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/dark/Button";
import Skeleton from "./ui/dark/Skeleton";
import { ErrorState } from "./ui/dark/States";
import { formatNaira } from "../lib/format";

const CREDIT_THRESHOLD = 600;

export default function CreditEligibility({ state, onRequestCredit }) {
  if (state.status === "loading") {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-8 w-32" />
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

  const { eligible, score, available_credit: availableCredit, interest_rate: interestRate, terms } = state.data;

  if (!eligible) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/6 text-text-3">
            <Lock className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-bold text-text-1">Credit access locked</p>
            <p className="text-xs text-text-3">Score {score} of {CREDIT_THRESHOLD} needed</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-warning-vivid"
            style={{ width: `${Math.min(100, Math.round((score / CREDIT_THRESHOLD) * 100))}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-text-3">
          Keep settling earnings consistently — credit access unlocks automatically once your score crosses{" "}
          {CREDIT_THRESHOLD}.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-2/12 text-accent-2">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-sm font-bold text-text-1">You're eligible for credit</p>
          <p className="text-xs text-text-3">Score {score} · No paperwork, auto-approved</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-white/5 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-text-3">Available credit</span>
          <span className="font-bold text-text-1">{formatNaira(availableCredit)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-3">Interest rate</span>
          <span className="text-text-1">{interestRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-3">Repayment period</span>
          <span className="text-text-1">{terms?.repayment_period_days} days</span>
        </div>
      </div>

      <Button variant="success" onClick={onRequestCredit} className="mt-4 w-full">
        Request Credit
      </Button>
    </Card>
  );
}
