const supabase = require("../config/database");

// Real in-app notifications — previously this was 100% mocked, even in
// live mode (src/services/mock/notificationsService.js was read
// regardless of API_MODE). Deliberately just a table + create/list/
// markRead — no push/websocket delivery, the frontend polls on load like
// every other resource in this app.
async function create({ workerId, type, title, body, tone = "info" }) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({ worker_id: workerId, type, title, body, tone })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listForWorker(workerId, { limit = 20 } = {}) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function markRead(workerId, notificationId) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("worker_id", workerId);
  if (error) throw error;
}

async function markAllRead(workerId) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("worker_id", workerId)
    .is("read_at", null);
  if (error) throw error;
}

module.exports = { create, listForWorker, markRead, markAllRead };
