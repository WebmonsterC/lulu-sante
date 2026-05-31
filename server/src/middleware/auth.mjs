import { getDb } from "../db/index.mjs";

const SESSION_COOKIE = "lulu_session";
const SESSION_HOURS = 2;

export { SESSION_COOKIE, SESSION_HOURS };

export function readSessionToken(req) {
  const cookie = req.headers.cookie ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export function findSessionUser(token) {
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.login, u.nom_affichage, u.role_id AS role, u.actif
       FROM session_utilisateur s
       JOIN utilisateur u ON u.id = s.utilisateur_id
       WHERE s.token = ? AND s.expire_at > ? AND u.actif = 1`,
    )
    .get(token, new Date().toISOString());

  if (!row) return null;
  return {
    id: row.id,
    login: row.login,
    nomAffichage: row.nom_affichage,
    role: row.role,
    actif: Boolean(row.actif),
  };
}

export function requireAuth(req, res, next) {
  const user = findSessionUser(readSessionToken(req));
  if (!user) {
    res.status(401).json({ error: "Authentification requise." });
    return;
  }
  req.user = user;
  next();
}

export function optionalAuth(req, _res, next) {
  req.user = findSessionUser(readSessionToken(req));
  next();
}

export function setSessionCookie(res, token) {
  const maxAge = SESSION_HOURS * 60 * 60;
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
