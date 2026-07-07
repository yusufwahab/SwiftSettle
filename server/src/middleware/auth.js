const { verifyAccessToken } = require("../utils/jwt");
const supabase = require("../config/database");

// Verifies the bearer JWT and attaches the worker's row to req.worker so
// every controller downstream can trust req.worker.id without re-querying.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "unauthorized", message: "Missing bearer token." });
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Invalid or expired token." });
  }

  const { data: worker, error } = await supabase
    .from("workers")
    .select("*")
    .eq("id", payload.sub)
    .maybeSingle();

  if (error || !worker || !worker.is_active) {
    return res.status(401).json({ error: "unauthorized", message: "Account not found or inactive." });
  }

  req.worker = worker;
  next();
}

// Chains after requireAuth — req.worker is already loaded, so this is just
// a flag check. Same login as any other worker, no separate admin auth
// system; a worker account just has is_admin set to true.
function requireAdmin(req, res, next) {
  if (!req.worker.is_admin) {
    return res.status(403).json({ error: "forbidden", message: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
