const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const corsHandler = require("./middleware/corsHandler");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const routes = require("./routes");
const logger = require("./utils/logger");

const app = express();

app.use(helmet());
app.use(corsHandler);
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// `verify` captures the exact request bytes onto req.rawBody before body-
// parsing touches them — the platform-webhook HMAC signature has to be
// computed over those exact bytes, not a re-serialized copy of req.body.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
