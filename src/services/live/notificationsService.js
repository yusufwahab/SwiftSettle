import { apiRequest } from "../../lib/apiClient";

// Dashboard's RightRail reads `n.type` as the display *tone*
// (success/info/primary/warning), matching the mock data shape — the
// backend's `tone` column is that same value; `type` there is the event
// category (e.g. "payout_processed"), which the UI doesn't need yet.
function normalize(row) {
  return {
    id: row.id,
    type: row.tone,
    text: row.body,
    title: row.title,
    read: Boolean(row.read_at),
    time: new Date(row.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export const notificationsService = {
  async list() {
    const { notifications } = await apiRequest("/notifications", { method: "GET" });
    return (notifications || []).map(normalize);
  },

  async markRead(id) {
    return apiRequest(`/notifications/${id}/read`, { method: "POST" });
  },

  async markAllRead() {
    return apiRequest("/notifications/read-all", { method: "POST" });
  },
};
