const cors = require("cors");
const env = require("../config/env");

module.exports = cors({
  origin(origin, callback) {
    // Allow non-browser requests (curl, server-to-server, Postman) which
    // send no Origin header at all.
    if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
});
