const notificationService = require("../services/notificationService");

// GET /api/notifications
async function list(req, res, next) {
  try {
    const notifications = await notificationService.listForWorker(req.worker.id);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications/:id/read
async function markRead(req, res, next) {
  try {
    await notificationService.markRead(req.worker.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.worker.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, markRead, markAllRead };
