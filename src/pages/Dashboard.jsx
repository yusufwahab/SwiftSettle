import { useState } from "react";
import {
  Wallet, TrendingUp, Clock, CalendarDays, Building2, Bell, Mail, MessageCircle, Phone,
  CheckCircle2, Info, AlertTriangle, ShieldAlert,
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
import { formatNaira } from "../lib/format";
import { chartColors } from "../lib/chartTheme";
import { walletService, earningsService, notificationsService } from "../services";
import { useAsync } from "../hooks/useAsync";

const notifTone = {
  success: { icon: CheckCircle2, className: "text-accent-2 bg-accent-2/12" },
  info: { icon: Info, className: "text-accent bg-accent/12" },
  primary: { icon: ShieldAlert, className: "text-accent bg-accent/12" },
  warning: { icon: AlertTriangle, className: "text-warning-vivid bg-warning-vivid/12" },
};

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const balanceState = useAsync(() => walletService.getBalance(), []);
  const activityState = useAsync(() => walletService.getTodayActivity(), []);
  const paymentState = useAsync(() => walletService.getPaymentMethod(), []);
  const weeklyState = useAsync(() => earningsService.getWeekly(), []);
  const notifState = useAsync(() => notificationsService.list(), []);

  return (
    <AppLayout title="Dashboard" breadcrumb="Overview" rightRail={<RightRail notifState={notifState} />}>
      <BalanceCard state={balanceState} onSettle={() => setModalOpen(true)} />

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
          <p className="mb-2 text-sm font-bold text-text-1">Today's Activity</p>
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
                    index < activityState.data.length - 1 ? "border-b border-white/6" : ""
                  }`}
                >
                  <span className="text-text-1">{row.label}</span>
                  <span className="text-text-3">{row.time}</span>
                  <span className="font-medium text-accent-2">+{formatNaira(row.amount)}</span>
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
