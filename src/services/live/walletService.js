import { apiRequest } from "../../lib/apiClient";
import { maskAccountNumber } from "../../lib/format";

export const walletService = {
  // GET /earnings/balance only returns { balance, updated_at, daily_total,
  // earnings_trend } — pendingPayouts/weekTotal aren't part of that
  // response, so they're derived here from two extra calls. This is more
  // round trips than the mock version needed; a real "GET /dashboard"
  // endpoint (which updatedPrompt.md's endpoint list calls for but
  // BackendPrompt.md's literal endpoint list omits) would collapse this
  // into one call — flagged as a good follow-up, not silently assumed.
  async getBalance() {
    const [balanceRes, dailyRes, pendingRes] = await Promise.all([
      apiRequest("/earnings/balance", { method: "GET" }),
      apiRequest("/earnings/daily", { method: "GET" }),
      apiRequest("/settlements/history?status=pending", { method: "GET" }),
    ]);

    const days = Object.keys(dailyRes.daily_breakdown).sort();
    const last7 = days.slice(-7);
    const weekTotal = last7.reduce((sum, d) => sum + dailyRes.daily_breakdown[d], 0);
    const yesterday = days[days.length - 2];
    const todayTrend = yesterday ? balanceRes.daily_total - dailyRes.daily_breakdown[yesterday] : 0;
    const pendingPayouts = (pendingRes.settlements || []).reduce((sum, s) => sum + Number(s.amount), 0);

    return {
      available: balanceRes.balance,
      updatedAt: "just now",
      todayEarnings: balanceRes.daily_total,
      todayTrend,
      pendingPayouts,
      weekTotal,
      weekDays: last7.length,
    };
  },

  async getTodayActivity() {
    const today = new Date().toISOString().slice(0, 10);
    const { earnings } = await apiRequest(
      `/earnings/history?start_date=${today}&limit=50`,
      { method: "GET" }
    );
    // `amount` is what the platform claimed the order was worth; once
    // reconciled, `received_amount` is what Nomba actually confirmed landed
    // in the VA — they can differ (under/overpayment), so both are exposed
    // rather than collapsing to one number.
    return (earnings || []).map((row) => ({
      id: row.id,
      label: row.description || "Earnings recorded",
      time: new Date(row.recorded_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      amount: Number(row.amount),
      receivedAmount: row.received_amount != null ? Number(row.received_amount) : null,
      status: row.status,
    }));
  },

  async getPaymentMethod() {
    const { worker } = await apiRequest("/auth/me", { method: "GET" });
    return {
      name: worker.bank_name,
      accountNumberMasked: maskAccountNumber(worker.account_number),
      accountHolder: worker.account_holder_name,
      isPrimary: true,
    };
  },

  async settle() {
    const balance = await walletService.getBalance();
    const { worker } = await apiRequest("/auth/me", { method: "GET" });

    const result = await apiRequest("/settlements/create", {
      method: "POST",
      body: { amount: balance.available },
    });

    return { amount: balance.available, reference: result.reference, bank: worker.bank_name };
  },
};
