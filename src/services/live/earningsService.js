import { apiRequest } from "../../lib/apiClient";
import { performanceMetrics as mockPerformanceMetrics } from "../../data/mockData";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getDailyBreakdown() {
  const { daily_breakdown: breakdown } = await apiRequest("/earnings/daily", { method: "GET" });
  return breakdown || {};
}

export const earningsService = {
  async getWeekly() {
    const breakdown = await getDailyBreakdown();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({ day: DAY_LABELS[date.getDay()], amount: breakdown[key] || 0 });
    }
    return days;
  },

  async getMonthly() {
    const breakdown = await getDailyBreakdown();
    const totals = new Map();
    for (const [date, amount] of Object.entries(breakdown)) {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      totals.set(key, (totals.get(key) || 0) + amount);
    }
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ month: MONTH_LABELS[d.getMonth()], amount: totals.get(key) || 0 });
    }
    return months;
  },

  async getStats() {
    const breakdown = await getDailyBreakdown();
    const entries = Object.entries(breakdown);
    const now = new Date();

    const last7 = entries.filter(([date]) => (now - new Date(date)) / 86_400_000 <= 7);
    const prior7 = entries.filter(([date]) => {
      const age = (now - new Date(date)) / 86_400_000;
      return age > 7 && age <= 14;
    });
    const thisMonth = entries.filter(([date]) => new Date(date).getMonth() === now.getMonth());

    const sum = (rows) => rows.reduce((s, [, amount]) => s + amount, 0);
    const averageDaily = last7.length ? Math.round(sum(last7) / last7.length) : 0;
    const priorAverage = prior7.length ? sum(prior7) / prior7.length : 0;
    const changePct = priorAverage ? Math.round(((averageDaily - priorAverage) / priorAverage) * 100) : 0;

    const best = entries.reduce((max, [date, amount]) => (amount > (max?.amount || 0) ? { date, amount } : max), null);

    return {
      averageDaily: {
        amount: averageDaily,
        subtext: "Over 7 days",
        changeLabel: `${changePct >= 0 ? "+" : ""}${changePct}% from last week`,
      },
      bestDay: {
        amount: best?.amount || 0,
        subtext: best ? new Date(best.date).toLocaleDateString("en-US", { weekday: "long" }) : "—",
        comparator: `Normal day: ₦${averageDaily.toLocaleString()}`,
      },
      totalThisMonth: {
        amount: sum(thisMonth),
        subtext: `${thisMonth.length} days worked`,
      },
    };
  },

  // No backend data source exists for completion rate / customer rating /
  // on-time delivery anywhere in this schema — those would require an
  // orders + ratings subsystem that isn't part of either prompt. Rather
  // than fabricate numbers from nothing, this stays on the mock dataset
  // even in "live" mode, clearly labeled.
  async getPerformance() {
    return { ...mockPerformanceMetrics };
  },

  // No real gig-platform partner is wired up yet — nothing ever calls
  // POST /webhooks/platform for a real order. This lets a logged-in worker
  // record a completed delivery on their own account (via POST
  // /earnings/simulate — route name is a holdover, the behavior is real:
  // it goes through the same recordEarning() path an actual platform
  // webhook would) instead of a developer hand-inserting rows in Supabase
  // for every worker who wants to see the settlement flow work.
  async log({ amount } = {}) {
    return apiRequest("/earnings/simulate", { method: "POST", body: { amount } });
  },

  // The other half of that flow — settles the *payment* for a logged order
  // (see server/src/controllers/earningsController.js's
  // simulateCustomerPayment for why this can't just be a real Nomba sandbox
  // deposit). Passing an amount that differs from the order's expected
  // amount is how under/overpayment gets demonstrated, not a misuse of the
  // endpoint.
  async settlePayment({ amount, earningId } = {}) {
    return apiRequest("/earnings/simulate-payment", {
      method: "POST",
      body: { amount, earning_id: earningId },
    });
  },
};
