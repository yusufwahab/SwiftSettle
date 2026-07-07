const express = require("express");
const { requireAuth } = require("../middleware/auth");
const notificationsController = require("../controllers/notificationsController");

const router = express.Router();

router.use(requireAuth);

router.get("/", notificationsController.list);
router.post("/read-all", notificationsController.markAllRead);
router.post("/:id/read", notificationsController.markRead);

module.exports = router;
