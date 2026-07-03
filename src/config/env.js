// Central place that reads build-time environment variables.
// Swapping the mock layer for live Nomba endpoints later means setting
// VITE_API_MODE=live and pointing VITE_NOMBA_BASE_URL at the real API —
// nothing in services/index.js or any component needs to change.

export const API_MODE = import.meta.env.VITE_API_MODE || "mock";

export const NOMBA_BASE_URL = import.meta.env.VITE_NOMBA_BASE_URL || "";
export const NOMBA_CLIENT_ID = import.meta.env.VITE_NOMBA_CLIENT_ID || "";
export const NOMBA_ACCOUNT_ID = import.meta.env.VITE_NOMBA_ACCOUNT_ID || "";
