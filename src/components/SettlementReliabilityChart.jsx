import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import Card from "./ui/Card";
import Skeleton from "./ui/dark/Skeleton";
import { ErrorState } from "./ui/dark/States";
import { chartColors } from "../lib/chartTheme";

// Reliability doesn't have its own historical endpoint — the three
// components the score already tracks (how many settlements succeeded, how
// predictable the timing is, how fast earnings get settled) are the honest
// data that exists today, shown as gauges rather than a fabricated
// day-by-day trend line.
const GAUGES = [
  { key: "settlement_reliability", label: "Reliability", max: 200, color: chartColors.accent2 },
  { key: "settlement_consistency", label: "Consistency", max: 100, color: chartColors.accent },
  { key: "time_to_settlement", label: "Settlement Speed", max: 50, color: "#f59e0b" },
];

export default function SettlementReliabilityChart({ state }) {
  if (state.status === "loading") {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-40" />
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

  const { components } = state.data;

  return (
    <Card>
      <p className="text-sm font-bold text-text-1">Settlement Reliability</p>
      <p className="mt-1 text-xs text-text-3">How your settlement behavior feeds your score</p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {GAUGES.map((g) => {
          const value = components?.[g.key] ?? 0;
          const pct = Math.min(100, Math.round((value / g.max) * 100));
          return (
            <div key={g.key} className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={90}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={8}
                  data={[{ value: pct, fill: g.color }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "#ffffff14" }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="-mt-6 text-sm font-bold text-text-1">{pct}%</p>
              <p className="mt-1 text-center text-[11px] text-text-3">{g.label}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
