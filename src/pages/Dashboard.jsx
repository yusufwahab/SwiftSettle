import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/States";
import SettlementModal from "../components/SettlementModal";
import { formatNaira } from "../lib/format";
import { walletService } from "../services";
import { useAsync } from "../hooks/useAsync";

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const balanceState = useAsync(() => walletService.getBalance(), []);
  const activityState = useAsync(() => walletService.getTodayActivity(), []);
  const paymentState = useAsync(() => walletService.getPaymentMethod(), []);

  return (
    <AppLayout title="Dashboard">
      <BalanceCard
        state={balanceState}
        onSettle={() => setModalOpen(true)}
      />

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <SummaryCard
          label="Today's Earnings"
          loading={balanceState.status === "loading"}
          value={balanceState.data && formatNaira(balanceState.data.todayEarnings)}
          footer={
            balanceState.data && (
              <span className="text-success">
                +{formatNaira(balanceState.data.todayTrend)} from yesterday
              </span>
            )
          }
        />
        <SummaryCard
          label="Pending Payouts"
          loading={balanceState.status === "loading"}
          value={balanceState.data && formatNaira(balanceState.data.pendingPayouts)}
          footer={<span className="text-success">All settled</span>}
        />
        <SummaryCard
          label="This Week's Total"
          loading={balanceState.status === "loading"}
          value={balanceState.data && formatNaira(balanceState.data.weekTotal)}
          footer={balanceState.data && <span>{balanceState.data.weekDays} days of work</span>}
        />
      </div>

      <Card className="mt-6">
        <p className="mb-2 text-sm font-bold text-ink">Today's Activity</p>
        {activityState.status === "loading" && (
          <div className="space-y-3 py-3">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        )}
        {activityState.status === "error" && (
          <ErrorState message={activityState.error} onRetry={activityState.reload} className="py-8" />
        )}
        {activityState.status === "success" && activityState.data.length === 0 && (
          <EmptyState title="No activity yet today" className="py-8" />
        )}
        {activityState.status === "success" && activityState.data.length > 0 && (
          <div>
            {activityState.data.map((row, index) => (
              <div
                key={row.id}
                className={`flex items-center justify-between py-3 text-sm ${
                  index < activityState.data.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-ink">{row.label}</span>
                <span className="text-muted">{row.time}</span>
                <span className="font-medium text-success">+{formatNaira(row.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Your Payment Methods</p>
          <button type="button" className="text-sm text-primary hover:text-primary-dark">
            Edit
          </button>
        </div>
        {paymentState.status === "loading" && <Skeleton className="h-12" />}
        {paymentState.status === "error" && (
          <ErrorState message={paymentState.error} onRetry={paymentState.reload} className="py-4" />
        )}
        {paymentState.status === "success" && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{paymentState.data.name}</p>
              <p className="text-sm text-muted">
                {paymentState.data.accountNumberMasked} · {paymentState.data.accountHolder}
              </p>
            </div>
            {paymentState.data.isPrimary && <Badge tone="primary">Primary account</Badge>}
          </div>
        )}
      </Card>

      <SettlementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        balance={balanceState.data?.available ?? 0}
        onSettled={balanceState.reload}
      />
    </AppLayout>
  );
}

function BalanceCard({ state, onSettle }) {
  if (state.status === "loading") {
    return (
      <Card className="p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-10 w-48" />
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="p-8">
        <ErrorState message={state.error} onRetry={state.reload} className="py-4" />
      </Card>
    );
  }

  return (
    <Card padded={false} className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Available Balance</p>
        <p className="mt-2 text-4xl font-bold text-ink">{formatNaira(state.data.available)}</p>
        <p className="mt-2 text-xs text-muted">Updated {state.data.updatedAt}</p>
      </div>
      <Button variant="success" onClick={onSettle} className="px-8 py-3.5">
        Settle Now
      </Button>
    </Card>
  );
}

function SummaryCard({ label, value, loading, footer }) {
  return (
    <Card>
      <p className="text-xs text-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
      )}
      {!loading && footer && <p className="mt-1.5 text-xs">{footer}</p>}
    </Card>
  );
}
