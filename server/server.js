const env = require("./src/config/env");
const app = require("./src/app");
const logger = require("./src/utils/logger");
const scoreScheduler = require("./src/jobs/scoreScheduler");

app.listen(env.PORT, () => {
  logger.info(`SwiftSettle backend listening on port ${env.PORT}`, { env: env.NODE_ENV });
  scoreScheduler.start();
});
