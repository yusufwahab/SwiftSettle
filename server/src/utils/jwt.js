const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAccessToken(workerId) {
  return jwt.sign({ sub: workerId, type: "access" }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (payload.type !== "access") throw new Error("Not an access token.");
  return payload;
}

function signRefreshToken(workerId) {
  return jwt.sign({ sub: workerId, type: "refresh" }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRE,
  });
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  if (payload.type !== "refresh") throw new Error("Not a refresh token.");
  return payload;
}

module.exports = { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken };
