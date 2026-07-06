const axios = require("axios");
const env = require("./env");
const logger = require("../utils/logger");

// Verified against developer.nomba.com (2026-07-06):
//   POST {base}/v1/auth/token/issue
//   headers: accountId (PARENT account), Content-Type: application/json
//   body: { grant_type: 'client_credentials', client_id, client_secret }
//   response: { data: { access_token, refresh_token, expiresAt (ISO string) } }
//
// SwiftSettle operates as a sub-account of a parent Nomba account. The
// `accountId` header is ALWAYS the parent account ID, on every call,
// including calls that are additionally scoped to the sub-account via a
// {subAccountId} path segment (see nombaService.js). The two IDs are not
// interchangeable — mixing them up authenticates against the wrong entity.
let cachedToken = null;
let cachedTokenExpiresAt = 0;

function isConfigured() {
  return Boolean(
    env.NOMBA_API_KEY && env.NOMBA_API_SECRET && env.NOMBA_PARENT_ACCOUNT_ID && env.NOMBA_SUB_ACCOUNT_ID
  );
}

function assertConfigured() {
  if (!isConfigured()) {
    throw new Error(
      "Nomba is not configured. Set NOMBA_API_KEY, NOMBA_API_SECRET, NOMBA_PARENT_ACCOUNT_ID, and NOMBA_SUB_ACCOUNT_ID in .env."
    );
  }
}

const rawClient = axios.create({ baseURL: env.NOMBA_BASE_URL, timeout: 15000 });

async function getAccessToken() {
  assertConfigured();
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const { data } = await rawClient.post(
    "/v1/auth/token/issue",
    {
      grant_type: "client_credentials",
      client_id: env.NOMBA_API_KEY,
      client_secret: env.NOMBA_API_SECRET,
    },
    { headers: { accountId: env.NOMBA_PARENT_ACCOUNT_ID, "Content-Type": "application/json" } }
  );

  cachedToken = data.data.access_token;
  // Refresh 60s before actual expiry to avoid using a token that dies
  // mid-request.
  cachedTokenExpiresAt = new Date(data.data.expiresAt).getTime() - 60_000;
  return cachedToken;
}

// Authenticated Nomba client. Every call goes through this so token
// acquisition/refresh is never duplicated at the call site. `path` must
// include its own version prefix (e.g. "/v1/accounts/virtual",
// "/v2/transfers/bank") — Nomba's endpoints aren't all on the same version.
async function nombaRequest(config) {
  assertConfigured();
  const token = await getAccessToken();
  try {
    const response = await rawClient.request({
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        accountId: env.NOMBA_PARENT_ACCOUNT_ID,
      },
    });
    return response.data;
  } catch (error) {
    logger.error("Nomba API request failed", {
      url: config.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

module.exports = { nombaRequest, isConfigured, assertConfigured, subAccountId: () => env.NOMBA_SUB_ACCOUNT_ID };
