import { CheckCircle2, Circle } from "lucide-react";
import Card from "./ui/Card";
import Skeleton from "./ui/dark/Skeleton";
import { ErrorState } from "./ui/dark/States";

export default function IdentityProgressTracker({ state }) {
  if (state.status === "loading") {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-2 w-full" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
        </div>
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

  const { progress, days_remaining: daysRemaining, milestones, verification_status: verificationStatus } = state.data;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-1">Financial Identity Progress</p>
        <span className="text-xs text-text-3">{progress}%</span>
      </div>
      <p className="mt-1 text-xs text-text-3">
        {verificationStatus === "verified"
          ? "Identity verified — your score and certificate are active."
          : daysRemaining > 0
            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} until your financial identity certificate`
            : "Finalizing verification…"}
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-accent-2" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {milestones.map((m) => (
          <div key={m.label} className="flex items-center gap-2.5 text-sm">
            {m.complete ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-2" strokeWidth={1.75} />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-text-3" strokeWidth={1.75} />
            )}
            <span className={m.complete ? "text-text-1" : "text-text-3"}>{m.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
