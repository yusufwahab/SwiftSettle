import { useState } from "react";
import { Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/dark/Badge";
import Skeleton from "../components/ui/dark/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/dark/States";
import ProcessPayoutModal from "../components/ProcessPayoutModal";
import { formatNaira } from "../lib/format";
import { payoutsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../context/AuthContext";

const statusTone = { requested: "primary", matched: "success", underpaid: "warning", overpaid: "warning" };

export default function AdminPayoutsPage() {
  const { worker } = useAuth();
  const [target, setTarget] = useState(null);
  const requestsState = useAsync(() => payoutsService.all(), []);

  if (!worker?.isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const open = (requestsState.data || []).filter((r) => r.status === "requested");
  const processed = (requestsState.data || []).filter((r) => r.status !== "requested");

  return (
    <AppLayout
      title="Admin — Payouts"
      breadcrumb="Admin"
      subtitle="Process worker payout requests — this is what actually moves money into a worker's virtual account"
    >
      <Card className="mb-5">
        <p className="mb-4 text-sm font-bold text-text-1">Open Requests</p>
        {requestsState.status === "loading" && (
          <div className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        )}
        {requestsState.status === "error" && (
          <ErrorState message={requestsState.error} onRetry={requestsState.reload} className="py-8" />
        )}
        {requestsState.status === "success" && open.length === 0 && (
          <EmptyState title="No open payout requests" className="py-8" />
        )}
        {requestsState.status === "success" && open.length > 0 && (
          <div>
            {open.map((r, index) => (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 py-3 text-sm ${
                  index < open.length - 1 ? "border-b border-white/6" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-1">{r.worker?.full_name || r.worker_id}</p>
                  <p className="text-xs text-text-3">
                    {(r.earnings || []).length} order{(r.earnings || []).length === 1 ? "" : "s"} ·{" "}
                    {new Date(r.requested_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-text-1">{formatNaira(r.requested_total)}</span>
                <button
                  type="button"
                  onClick={() => setTarget(r)}
                  className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dark"
                >
                  Process
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-4 text-sm font-bold text-text-1">Processed</p>
        {requestsState.status === "success" && processed.length === 0 && (
          <EmptyState title="Nothing processed yet" className="py-8" />
        )}
        {requestsState.status === "success" && processed.length > 0 && (
          <div>
            {processed.map((r, index) => (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 py-3 text-sm ${
                  index < processed.length - 1 ? "border-b border-white/6" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-1">{r.worker?.full_name || r.worker_id}</p>
                  <p className="text-xs text-text-3">
                    Requested {formatNaira(r.requested_total)} · Received {formatNaira(r.received_amount)}
                  </p>
                </div>
                <Badge tone={statusTone[r.status] || "neutral"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ProcessPayoutModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        payoutRequest={target}
        onProcessed={requestsState.reload}
      />
    </AppLayout>
  );
}
