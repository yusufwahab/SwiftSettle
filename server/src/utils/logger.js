const env = require("../config/env");

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[env.LOG_LEVEL] ?? levels.info;

function log(level, message, meta) {
  if (levels[level] > currentLevel) return;
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

module.exports = {
  error: (message, meta) => log("error", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  info: (message, meta) => log("info", message, meta),
  debug: (message, meta) => log("debug", message, meta),
};
