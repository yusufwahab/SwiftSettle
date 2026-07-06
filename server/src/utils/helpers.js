const { randomInt } = require("crypto");

function generateOtpCode() {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

function generateReference(prefix) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomInt(0, 999999).toString().padStart(6, "0");
  return `${prefix}-${stamp}-${rand}`;
}

function generateCertificateId() {
  const year = new Date().getFullYear();
  const rand = randomInt(0, 999999).toString().padStart(6, "0");
  return `VIC-${year}-${rand}`;
}

function daysBetween(from, to = new Date()) {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = { generateOtpCode, generateReference, generateCertificateId, daysBetween, addDays };
