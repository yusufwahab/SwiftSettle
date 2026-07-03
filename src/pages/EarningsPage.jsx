import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import { formatNaira } from "../lib/format";
import { chartColors } from "../lib/chartTheme";
import { earningsService } from "../services";
import { useAsync } from "../hooks/useAsync";

export default function EarningsPage() {
  const weeklyState = useAsync(() => earningsService.getWeekly(), []);
  const monthlyState = useAsync(() => earningsService.getMonthly(), []);
  const statsState = useAsync(() => earningsService.getStats(), []);
  const performanceState = useAsync(() => earningsService.getPerformance(), []);

  return (
    <AppLayout title="Earnings" subtitle="Track your income and performance">
      <Card className="mb-6">
        <p className="mb-4 text-sm font-bold text-ink">Weekly Earnings</p>
        <ChartFrame state={weeklyState} height={260}>
          {(data) => (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: chartColors.muted }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => [formatNaira(v), "Earnings"]} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  fill={chartColors.primary}
                  fillOpacity={0.08}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>
        <p className="mt-2 text-center text-xs text-muted">Daily Earnings</p>
      </Card>

      <div className="mb-6 grid gap-5 sm:grid-cols-3">
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

      <Card className="mb-6">
        <p className="mb-4 text-sm font-bold text-ink">Monthly Breakdown</p>
        <ChartFrame state={monthlyState} height={220}>
          {(data) => (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: chartColors.muted }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => [formatNaira(v), "Earnings"]} />
                <Bar dataKey="amount" fill={chartColors.primary} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>
      </Card>

      <Card>
        <p className="mb-6 text-sm font-bold text-ink">Performance Metrics</p>
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
                <span className="text-sm text-ink">Customer Rating</span>
                <span className="text-sm font-bold text-primary">
                  {performanceState.data.rating} / 5
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-border">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(performanceState.data.rating / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
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
      <p className="text-xs text-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
      )}
      {!loading &&
        lines.map((line) => (
          <p key={line} className="mt-1 text-xs text-muted">
            {line}
          </p>
        ))}
      {!loading && highlight && <p className="mt-1 text-xs text-success">{highlight}</p>}
    </Card>
  );
}

function ProgressMetric({ pct, label, subtext }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-sm font-bold text-primary">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-border">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">{subtext}</p>
    </div>
  );
}
