const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

// Service-role client: the only way this backend ever touches Postgres.
// Bypasses RLS by design (see docs/database/relationships.md) — every
// authorization check (a worker can only see their own data) happens in
// the controller layer, not in Postgres policies.
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
