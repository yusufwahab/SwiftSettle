import { apiRequest } from "../../lib/apiClient";

const STATUS_MAP = { pending: "Pending", processing: "Pending", completed: "Completed", failed: "Failed" };

function mapRow(row) {
  const created = new Date(row.created_at);
  return {
    id: row.reference_number,
    date: created.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    time: created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    amount: Number(row.amount),
    status: STATUS_MAP[row.status] || "Pending",
    // Kept for the "View" detail modal — getHistory's select("*") already
    // returns these, mapRow just used to drop them on the floor.
    bank: row.destination_bank || null,
    account: row.destination_account || null,
    settledAt: row.settled_at
      ? new Date(row.settled_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : null,
    errorMessage: row.error_message || null,
  };
}

export const settlementsService = {
  // The backend has no search-by-reference/amount query param, so search
  // filtering happens client-side over whatever page of history comes
  // back. Fine for a demo dataset; a real search endpoint would be needed
  // at scale.
  async list({ status = "All", search = "" } = {}) {
    const backendStatus = { All: undefined, Completed: "completed", Pending: "pending", Failed: "failed" }[status];
    const query = backendStatus ? `?status=${backendStatus}&limit=100` : "?limit=100";
    const { settlements } = await apiRequest(`/settlements/history${query}`, { method: "GET" });

    let rows = (settlements || []).map(mapRow);
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter((row) => row.id.toLowerCase().includes(term) || String(row.amount).includes(term));
    }
    return rows;
  },

  // No dedicated summary endpoint exists on the backend — derived here from
  // the same history call. A real aggregate endpoint would be cheaper at
  // scale; flagged rather than built silently as a bigger backend change.
  async getSummary() {
    const { settlements } = await apiRequest("/settlements/history?limit=200", { method: "GET" });
    const rows = settlements || [];
    const completed = rows.filter((r) => r.status === "completed");
    const pending = rows.filter((r) => r.status === "pending" || r.status === "processing");

    return {
      totalSettled: completed.reduce((sum, r) => sum + Number(r.amount), 0),
      rangeLabel: "recent",
      pendingAmount: pending.reduce((sum, r) => sum + Number(r.amount), 0),
      settledCount: completed.length,
    };
  },
};
