const schedule = require("node-schedule");
const scoringService = require("../services/scoringService");
const logger = require("../utils/logger");

// Runs daily at 00:00 server time — per updatedPrompt.md: "Runs daily at
// 12:00 AM. Finds workers at day 30. Calculates score. Generates
// certificate if > 600." (Credit-request creation is deliberately not
// auto-triggered here — see the comment on autoTriggerAt30Days itself.)
function start() {
  const job = schedule.scheduleJob("0 0 * * *", async () => {
    logger.info("Running 30-day financial score auto-trigger");
    try {
      const result = await scoringService.autoTriggerAt30Days();
      logger.info("30-day auto-trigger finished", result);
    } catch (err) {
      logger.error("30-day auto-trigger crashed", { error: err.message });
    }
  });

  logger.info("Score scheduler started", { nextRun: job.nextInvocation()?.toISOString() });
  return job;
}

module.exports = { start };
