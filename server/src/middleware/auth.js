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

module.exports = { requireAuth };
