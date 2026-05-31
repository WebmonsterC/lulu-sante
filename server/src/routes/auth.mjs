import { Router } from "express";
import { randomBytes } from "node:crypto";
import { getDb } from "../db/index.mjs";
import { appendAudit } from "../db/seed.mjs";
import { verifyPassword } from "../auth/password.mjs";
import {
  clearSessionCookie,
  findSessionUser,
  readSessionToken,
  requireAuth,
  SESSION_HOURS,
  setSessionCookie,
} from "../middleware/auth.mjs";
import { newId, nowIso } from "../lib/time.mjs";

export const authRouter = Router();

function mapUser(row) {
  return {
    id: row.id,
    login: row.login,
    nomAffichage: row.nom_affichage,
    role: row.role_id,
    actif: Boolean(row.actif),
  };
}

authRouter.post("/login", (req, res) => {
  const login = String(req.body?.login ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!login || !password) {
    res.status(400).json({ error: "Identifiant et mot de passe requis." });
    return;
  }

  const db = getDb();
  const user = db
    .prepare(
      `SELECT * FROM utilisateur WHERE login = ? COLLATE NOCASE AND actif = 1`,
    )
    .get(login);

  if (!user || !verifyPassword(password, user.mot_de_passe_hash)) {
    res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expireAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const sessionId = newId("ses");
  const now = nowIso();

  db.prepare(
    `INSERT INTO session_utilisateur (id, utilisateur_id, token, expire_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(sessionId, user.id, token, expireAt, now);

  appendAudit(db, user.login, "Connexion");
  setSessionCookie(res, token);
  res.json({ user: mapUser(user) });
});

authRouter.post("/logout", requireAuth, (req, res) => {
  const token = readSessionToken(req);
  const db = getDb();
  db.prepare("DELETE FROM session_utilisateur WHERE token = ?").run(token);
  appendAudit(db, req.user.login, "Déconnexion");
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  const user = findSessionUser(readSessionToken(req));
  if (!user) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }
  res.json({ user });
});
