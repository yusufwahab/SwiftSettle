import { API_URL } from "../config/env";

// Thin fetch wrapper for the live backend: attaches the bearer token,
// transparently refreshes it once on a 401 and retries, and throws a
// plain Error with the backend's message so callers can treat it exactly
// like the mock service layer's simulate() rejections.
//
// Uses fetch rather than adding axios as a new frontend dependency — the
// interceptor behavior BackendPrompt.md sketched with axios is
// reproduced here with the same effect (auto-refresh + retry once).

const TOKEN_KEY = "swiftsettle_token";
const REFRESH_KEY = "swiftsettle_refresh_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (token, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = rawRequest("/auth/refresh-token", {
      method: "POST",
      body: { refresh_token: tokenStorage.getRefresh() },
      skipAuth: true,
    })
      .then((data) => {
        tokenStorage.set(data.token, tokenStorage.getRefresh());
        return data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function rawRequest(path, { method = "GET", body, skipAuth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (!skipAuth) {
    const token = tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong. Please try again.");
    error.status = response.status;
    error.code = data.error;
    throw error;
  }
  return data;
}

export async function apiRequest(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (error) {
    if (error.status === 401 && !options.skipAuth && tokenStorage.getRefresh()) {
      await refreshAccessToken();
      return rawRequest(path, options);
    }
    throw error;
  }
}
