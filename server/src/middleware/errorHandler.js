const logger = require("../utils/logger");

class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "not_found", message: `No route for ${req.method} ${req.path}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "internal_error";

  logger.error(err.message, {
    path: req.path,
    method: req.method,
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: code,
    message: statusCode >= 500 ? "Something went wrong. Please try again." : err.message,
  });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
