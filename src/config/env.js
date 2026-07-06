// Central place that reads build-time environment variables.
// Swapping the mock layer for the real backend means setting
// VITE_API_MODE=live and pointing VITE_API_URL at the SwiftSettle backend —
// nothing in services/index.js or any component needs to change.

export const API_MODE = import.meta.env.VITE_API_MODE || "mock";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
