import { useState } from "react";
import {
  Wallet, TrendingUp, Clock, CalendarDays, Building2, Bell, Mail, MessageCircle, Phone,
  CheckCircle2, Info, AlertTriangle, ShieldAlert, ArrowRight, XCircle,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/dark/Button";
import Badge from "../components/ui/dark/Badge";
import Skeleton from "../components/ui/dark/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/dark/States";
import SettlementModal from "../components/SettlementModal";
import FinancialScoreCard from "../components/FinancialScoreCard";
import { formatNaira } from "../lib/format";
import { chartColors } from "../lib/chartTheme";
import { walletService, earningsService, notificationsService, financialService, payoutsService } from "../services";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../context/AuthContext";

const notifTone = {
  success: { icon: CheckCircle2, className: "text-accent-2 bg-accent-2/12" },
  info: { icon: Info, className: "text-accent bg-accent/12" },
  primary: { icon: ShieldAlert, className: "text-accent bg-accent/12" },
  warning: { icon: AlertTriangle, className: "text-warning-vivid bg-warning-vivid/12" },
  danger: { icon: XCircle, className: "text-danger-vivid bg-danger-vivid/12" },
};

const activityTone = {
  pending: "neutral",
  requested: "primary",
  underpaid: "warning",
  overpaid: "warning",
  unmatched: "danger",
};

const OPEN_STATUSES = ["pending", "requested"];

export default function Dashboard() {
  const { worker } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulateError, setSimulateError] = useState("");
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const balanceState = useAsync(() => walletService.getBalance(), []);
  const activityState = useAsync(() => walletService.getTodayActivity(), []);
  const paymentState = useAsync(() => walletService.getPaymentMethod(), []);
  const weeklyState = useAsync(() => earningsService.getWeekly(), []);
  const notifState = useAsync(() => notificationsService.list(), []);
  const scoreState = useAsync(() => financialService.getScore(), []);
  const payoutsState = useAsync(() => payoutsService.mine(), []);

  // No real gig-platform partner is wired up yet, so nothing ever records a
  // real earning on its own. This lets any onboarded worker add one
  // themselves — no developer/SQL required — then refreshes the views that
  // would change as a result.
  const handleSimulateDelivery = async () => {
    setSimulateError("");
    setSimulating(true);
    try {
      await earningsService.simulate();
      await Promise.all([balanceState.reload(), activityState.reload(), weeklyState.reload()]);
    } catch (err) {
      setSimulateError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const pendingOrders = activityState.data?.filter((row) => row.status === "pending") || [];
  const pendingTotal = pendingOrders.reduce((sum, row) => sum + row.amount, 0);

  // Doesn't move money itself — bundles every pending order into one
  // request an admin has to process. The actual money movement (and the
  // matched/underpaid/overpaid outcome) happens on the Admin page.
  const handleRequestPayout = async () => {
    setPayoutError("");
    setRequestingPayout(true);
    try {
      await payoutsService.request();
      await Promise.all([activityState.reload(), payoutsState.reload()]);
    } catch (err) {
      setPayoutError(err.message);
    } finally {
      setRequestingPayout(false);
    }
  };

  return (
    <AppLayout title="Dashboard" breadcrumb="Overview" rightRail={<RightRail notifState={notifState} />}>
      {!worker?.onboardingCompletedAt && <OnboardingNudge step={worker?.onboardingStep} />}
      <BalanceCard state={balanceState} onSettle={() => setModalOpen(true)} />

      <PayoutRequestsCard
        payoutsState={payoutsState}
        pendingOrders={pendingOrders}
        pendingTotal={pendingTotal}
        onRequestPayout={handleRequestPayout}
        requesting={requestingPayout}
        error={payoutError}
      />

      <div className="mt-5">
        <FinancialScoreCard state={scoreState} compact />
        <Link to="/app/credit" className="mt-2 inline-block text-sm text-accent hover:text-accent-dark">
          View financial identity & credit →
        </Link>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          tone="accent-2"
          label="Today's Earnings"
          loading={balanceState.status === "loading"}
          value={balanceState.data && formatNaira(balanceState.data.todayEarnings)}
          footer={
            balanceState.data && (
              <span className="text-accent-2">+{formatNaira(balanceState.data.todayTrend)} from yesterday</span>
            )
          }
        />
        <StatCard
          icon={Clock}
          tone="accent"
          label="Pending Payouts"
          loading={balanceState.status === "loading"}
          value={balanceState.data && formatNaira(balanceState.data.pendingPayouts)}
          footer={<span className="text-accent-2">All settled</span>}
        />
        <StatCard
          icon={CalendarDays}
          tone="warning-vivid"
          label="This Week's Total"
          loading={balanceState.status === "loading"}
          value={balanceState.data && formatNaira(balanceState.data.weekTotal)}
          footer={balanceState.data && <span className="text-text-3">{balanceState.data.weekDays} days of work</span>}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-text-1">Today's Activity</p>
            <button
              type="button"
              onClick={handleSimulateDelivery}
              disabled={simulating}
              className="text-xs text-accent hover:text-accent-dark disabled:opacity-50"
            >
              {simulating ? "Adding…" : "+ Simulate Delivery (Demo)"}
            </button>
          </div>
          {simulateError && <p className="mb-2 text-xs text-danger-vivid">{simulateError}</p>}
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
                  className={`flex items-center justify-between gap-3 py-3 text-sm ${
                    index < activityState.data.length - 1 ? "border-b border-white/6" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-text-1">{row.label}</span>
                  <span className="text-text-3">{row.time}</span>
                  {row.status && row.status !== "matched" && (
                    <Badge tone={activityTone[row.status] || "neutral"}>{row.status}</Badge>
                  )}
                  {OPEN_STATUSES.includes(row.status) ? (
                    <span className="shrink-0 text-text-3">{formatNaira(row.amount)} expected</span>
                  ) : (
                    <span className="shrink-0 font-medium text-accent-2">
                      +{formatNaira(row.receivedAmount ?? row.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-1 text-sm font-bold text-text-1">Weekly Trend</p>
          <p className="mb-3 text-xs text-text-3">Daily earnings</p>
          {weeklyState.status === "loading" && <Skeleton className="h-32" />}
          {weeklyState.status === "error" && (
            <ErrorState message={weeklyState.error} onRetry={weeklyState.reload} className="py-6" />
          )}
          {weeklyState.status === "success" && (
            <ResponsiveContainer width="100%" height={128}>
              <AreaChart data={weeklyState.data}>
                <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={chartColors.accent2}
                  strokeWidth={2}
                  fill={chartColors.accent2}
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-text-1">Your Payment Methods</p>
          <button type="button" className="text-sm text-accent hover:text-accent-dark">
            Edit
          </button>
        </div>
        {paymentState.status === "loading" && <Skeleton className="h-12" />}
        {paymentState.status === "error" && (
          <ErrorState message={paymentState.error} onRetry={paymentState.reload} className="py-4" />
        )}
        {paymentState.status === "success" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <Building2 className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-medium text-text-1">{paymentState.data.name}</p>
                <p className="text-sm text-text-3">
                  {paymentState.data.accountNumberMasked} · {paymentState.data.accountHolder}
                </p>
              </div>
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

function OnboardingNudge({ step }) {
  const remaining = 4 - Math.min(step || 1, 4) + 1;
  return (
    <Card className="mb-5 flex flex-col gap-4 border border-accent/25 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-text-1">Finish setting up your account</p>
        <p className="mt-1 text-sm text-text-3">
          Add your bank details and security PIN to unlock settlements and start building your financial score.
          {remaining > 1 ? ` ${remaining} steps left.` : " Almost done."}
        </p>
      </div>
      <Button as={Link} to="/app/onboarding" className="shrink-0 px-5 py-2.5">
        Continue Setup <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </Button>
    </Card>
  );
}

// Always visible (unlike a conditional banner buried in another card) so
// the worker-requests → admin-processes flow has one obvious home instead
// of only appearing once you already have a pending order.
function PayoutRequestsCard({ payoutsState, pendingOrders, pendingTotal, onRequestPayout, requesting, error }) {
  const openRequest = payoutsState.data?.find((r) => r.status === "requested");
  const lastProcessed = payoutsState.data?.find((r) => r.status !== "requested");

  return (
    <Card className="mt-5 border border-accent/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-1">Payout Requests</p>
        <Link to="/app/earnings" className="text-xs text-accent hover:text-accent-dark">
          View history →
        </Link>
      </div>

      {payoutsState.status === "loading" && <Skeleton className="mt-3 h-14" />}
      {payoutsState.status === "error" && (
        <ErrorState message={payoutsState.error} onRetry={payoutsState.reload} className="py-4" />
      )}

      {payoutsState.status === "success" && (
        <div className="mt-3">
          {openRequest ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-accent/8 p-3">
              <p className="text-sm text-text-2">
                Payout request of {formatNaira(openRequest.requested_total)} sent — awaiting admin review.
              </p>
              <Badge tone="primary">requested</Badge>
            </div>
          ) : pendingOrders.length > 0 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-accent/8 p-3">
              <p className="text-sm text-text-2">
                {pendingOrders.length} completed order{pendingOrders.length === 1 ? "" : "s"} worth{" "}
                {formatNaira(pendingTotal)} ready to request.
              </p>
              <Button
                variant="success"
                onClick={onRequestPayout}
                disabled={requesting}
                className="shrink-0 px-4 py-2 text-sm"
              >
                {requesting ? "Requesting…" : "Request Payout"}
              </Button>
            </div>
          ) : (
            <EmptyState
              title="No completed orders yet"
              message="Simulate a delivery below, then come back here to request payout — that's what alerts the admin to pay you."
              className="py-6"
            />
          )}
          {error && <p className="mt-2 text-xs text-danger-vivid">{error}</p>}
          {lastProcessed && (
            <p className="mt-3 text-xs text-text-3">
              Last payout: {formatNaira(lastProcessed.received_amount)} received of{" "}
              {formatNaira(lastProcessed.requested_total)} requested —{" "}
              <span className="font-medium text-text-2">{lastProcessed.status}</span>
            </p>
          )}
        </div>
      )}
    </Card>
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
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
          <Wallet className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-3">Available Balance</p>
          <p className="mt-2 text-4xl font-bold text-text-1">{formatNaira(state.data.available)}</p>
          <p className="mt-2 text-xs text-text-3">Updated {state.data.updatedAt}</p>
        </div>
      </div>
      <Button variant="success" onClick={onSettle} className="px-8 py-3.5">
        Settle Now
      </Button>
    </Card>
  );
}

const statTones = {
  "accent-2": "bg-accent-2/12 text-accent-2",
  accent: "bg-accent/12 text-accent",
  "warning-vivid": "bg-warning-vivid/12 text-warning-vivid",
};

function StatCard({ icon: Icon, tone, label, value, loading, footer }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statTones[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <p className="text-xs text-text-3">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-24" />
      ) : (
        <p className="mt-3 text-2xl font-bold text-text-1">{value}</p>
      )}
      {!loading && footer && <p className="mt-1.5 text-xs">{footer}</p>}
    </Card>
  );
}

function RightRail({ notifState }) {
  return (
    <>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-text-1">Notifications</p>
          <Bell className="h-4 w-4 text-text-3" strokeWidth={1.75} />
        </div>
        {notifState.status === "loading" && (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        )}
        {notifState.status === "error" && (
          <ErrorState message={notifState.error} onRetry={notifState.reload} className="py-4" />
        )}
        {notifState.status === "success" && (
          <div className="flex flex-col gap-4">
            {notifState.data.map((n) => {
              const tone = notifTone[n.type] || notifTone.info;
              return (
                <div key={n.id} className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.className}`}>
                    <tone.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-text-1">{n.text}</p>
                    <p className="mt-0.5 text-xs text-text-3">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm font-bold text-text-1">Need help?</p>
        <div className="flex flex-col gap-3">
          <ContactRow icon={Mail} label="support@swiftsettle.app" />
          <ContactRow icon={MessageCircle} label="Live chat" sub="Mon-Fri, 9AM-6PM" />
          <ContactRow icon={Phone} label="+234 800 SETTLE" />
        </div>
        <Link
          to="/app/support"
          className="mt-4 inline-block text-sm text-accent hover:text-accent-dark"
        >
          Visit Help Center →
        </Link>
      </Card>
    </>
  );
}

function ContactRow({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/6 text-text-2">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-text-1">{label}</p>
        {sub && <p className="text-xs text-text-3">{sub}</p>}
      </div>
    </div>
  );
}
