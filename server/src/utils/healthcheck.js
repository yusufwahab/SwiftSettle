const http = require("http");
const env = require("../config/env");

http
  .get(`http://localhost:${env.PORT}/health`, (res) => {
    console.log(`Health check status: ${res.statusCode}`);
    process.exit(res.statusCode === 200 ? 0 : 1);
  })
  .on("error", (err) => {
    console.error("Health check failed:", err.message);
    process.exit(1);
  });
