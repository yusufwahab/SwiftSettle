import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/dark/Badge";
import Skeleton from "../components/ui/dark/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/dark/States";
import { formatNaira } from "../lib/format";
import { chartColors } from "../lib/chartTheme";
import { earningsService, payoutsService } from "../services";
import { useAsync } from "../hooks/useAsync";

const payoutTone = { requested: "primary", matched: "success", underpaid: "warning", overpaid: "warning" };

const tooltipStyle = {
  background: "#181d26",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "#f2f4f7",
  fontSize: 13,
};

export default function EarningsPage() {
  const weeklyState = useAsync(() => earningsService.getWeekly(), []);
  const monthlyState = useAsync(() => earningsService.getMonthly(), []);
  const statsState = useAsync(() => earningsService.getStats(), []);
  const performanceState = useAsync(() => earningsService.getPerformance(), []);
  const payoutsState = useAsync(() => payoutsService.mine(), []);

  return (
    <AppLayout title="Earnings" breadcrumb="Earnings" subtitle="Track your income and performance">
      <Card className="mb-5">
        <p className="mb-4 text-sm font-bold text-text-1">Payout Requests</p>
        {payoutsState.status === "loading" && (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        )}
        {payoutsState.status === "error" && (
          <ErrorState message={payoutsState.error} onRetry={payoutsState.reload} className="py-6" />
        )}
        {payoutsState.status === "success" && payoutsState.data.length === 0 && (
          <EmptyState
            title="No payout requests yet"
            message="Request a payout from the Dashboard once you have completed orders awaiting payment."
            className="py-6"
          />
        )}
        {payoutsState.status === "success" && payoutsState.data.length > 0 && (
          <div>
            {payoutsState.data.map((r, index) => (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 py-3 text-sm ${
                  index < payoutsState.data.length - 1 ? "border-b border-white/6" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-1">
                    {(r.earnings || []).length} order{(r.earnings || []).length === 1 ? "" : "s"} ·{" "}
                    {new Date(r.requested_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <Badge tone={payoutTone[r.status] || "neutral"}>{r.status}</Badge>
                <span className="shrink-0 text-right">
                  {r.status === "requested" ? (
                    <span className="text-text-3">{formatNaira(r.requested_total)} requested</span>
                  ) : (
                    <span className="font-medium text-accent-2">{formatNaira(r.received_amount)} received</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-5">
        <p className="mb-4 text-sm font-bold text-text-1">Weekly Earnings</p>
        <ChartFrame state={weeklyState} height={260}>
          {(data) => (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.gridDark} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: chartColors.mutedDark }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: chartColors.mutedDark }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatNaira(v), "Earnings"]} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={chartColors.accent}
                  strokeWidth={2}
                  fill={chartColors.accent}
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>
        <p className="mt-2 text-center text-xs text-text-3">Daily Earnings</p>
      </Card>

      <div className="mb-5 grid gap-5 sm:grid-cols-3">
        <StatCard
          loading={statsState.status === "loading"}
          label="Average Daily Earnings"
          value={statsState.data && formatNaira(statsState.data.averageDaily.amount)}
          lines={statsState.data && [statsState.data.averageDaily.subtext]}
          highlight={statsState.data?.averageDaily.changeLabel}
        />
        <StatCard
          loading={statsState.status === "loading"}
          label="Best Day"
          value={statsState.data && formatNaira(statsState.data.bestDay.amount)}
          lines={statsState.data && [statsState.data.bestDay.subtext, statsState.data.bestDay.comparator]}
        />
        <StatCard
          loading={statsState.status === "loading"}
          label="Total This Month"
          value={statsState.data && formatNaira(statsState.data.totalThisMonth.amount)}
          lines={statsState.data && [statsState.data.totalThisMonth.subtext]}
        />
      </div>

      <Card className="mb-5">
        <p className="mb-4 text-sm font-bold text-text-1">Monthly Breakdown</p>
        <ChartFrame state={monthlyState} height={220}>
          {(data) => (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.gridDark} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartColors.mutedDark }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: chartColors.mutedDark }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatNaira(v), "Earnings"]} />
                <Bar dataKey="amount" fill={chartColors.accent2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>
      </Card>

      <Card>
        <p className="mb-6 text-sm font-bold text-text-1">Performance Metrics</p>
        {performanceState.status === "loading" && (
          <div className="grid gap-8 sm:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}
        {performanceState.status === "error" && (
          <ErrorState message={performanceState.error} onRetry={performanceState.reload} className="py-6" />
        )}
        {performanceState.status === "success" && (
          <div className="grid gap-8 sm:grid-cols-3">
            <ProgressMetric
              pct={performanceState.data.completionRate}
              label="Order Completion Rate"
              subtext="Excellent performance"
            />
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="flex items-center gap-1.5 text-sm text-text-1">
                  <Star className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} fill="currentColor" />
                  Customer Rating
                </span>
                <span className="text-sm font-bold text-accent">
                  {performanceState.data.rating} / 5
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/8">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(performanceState.data.rating / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-3">
                Based on {performanceState.data.ratingCount} ratings
              </p>
            </div>
            <ProgressMetric
              pct={performanceState.data.onTimeRate}
              label="On-Time Deliveries"
              subtext={`Industry average: ${performanceState.data.industryAverage}%`}
            />
          </div>
        )}
      </Card>
    </AppLayout>
  );
}

function ChartFrame({ state, height, children }) {
  if (state.status === "loading") return <Skeleton className="w-full" style={{ height }} />;
  if (state.status === "error") {
    return <ErrorState message={state.error} onRetry={state.reload} className="py-8" />;
  }
  return children(state.data);
}

function StatCard({ label, value, lines = [], loading, highlight }) {
  return (
    <Card>
      <p className="text-xs text-text-3">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className="mt-1.5 text-2xl font-bold text-text-1">{value}</p>
      )}
      {!loading &&
        lines.map((line) => (
          <p key={line} className="mt-1 text-xs text-text-3">
            {line}
          </p>
        ))}
      {!loading && highlight && <p className="mt-1 text-xs text-accent-2">{highlight}</p>}
    </Card>
  );
}

function ProgressMetric({ pct, label, subtext }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm text-text-1">{label}</span>
        <span className="text-sm font-bold text-accent">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/8">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-text-3">{subtext}</p>
    </div>
  );
}
