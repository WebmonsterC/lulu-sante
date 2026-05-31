import { Router } from "express";
import { getDb } from "../db/index.mjs";
import { appendAudit, countActiveAdmins } from "../db/seed.mjs";
import { hashPassword } from "../auth/password.mjs";
import { requireAuth } from "../middleware/auth.mjs";
import { newId, nowIso } from "../lib/time.mjs";

export const usersRouter = Router();

const PROTECTED_LOGIN = "admin";
const LOGIN_PATTERN = /^[a-z][a-z0-9._-]{2,31}$/;

usersRouter.use(requireAuth);

function mapUser(row) {
  return {
    id: row.id,
    login: row.login,
    nomAffichage: row.nom_affichage,
    role: row.role_id,
    actif: Boolean(row.actif),
  };
}

function validateUserPayload(body, { mode, existingLogins, userId }) {
  const login = String(body.login ?? "")
    .trim()
    .toLowerCase();
  const nomAffichage = String(body.nomAffichage ?? "").trim();
  const role = body.role;
  const motDePasse = String(body.motDePasse ?? "");
  const confirmation = String(body.confirmation ?? "");
  const actif = body.actif !== false;

  if (mode === "create") {
    if (!login) return "Le login est obligatoire.";
    if (!LOGIN_PATTERN.test(login)) return "Login invalide.";
    if (existingLogins.includes(login)) return "Ce login existe déjà.";
  }

  if (!nomAffichage) return "Le nom affiché est obligatoire.";

  if (mode === "create" || motDePasse || confirmation) {
    if (motDePasse.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (motDePasse !== confirmation) return "Les mots de passe ne correspondent pas.";
  }

  if (!role) return "Le rôle est obligatoire.";
  void userId;
  void actif;
  return null;
}

usersRouter.get("/", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, login, nom_affichage, role_id, actif FROM utilisateur ORDER BY login`,
    )
    .all();
  res.json({ users: rows.map(mapUser) });
});

usersRouter.post("/", (req, res) => {
  const db = getDb();
  const existingLogins = db
    .prepare("SELECT login FROM utilisateur")
    .all()
    .map((row) => row.login);

  const error = validateUserPayload(req.body, { mode: "create", existingLogins });
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const login = req.body.login.trim().toLowerCase();
  const id = newId("usr");
  const now = nowIso();
  const hash = hashPassword(req.body.motDePasse);

  db.prepare(
    `INSERT INTO utilisateur (id, login, nom_affichage, role_id, mot_de_passe_hash, actif, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    login,
    req.body.nomAffichage.trim(),
    req.body.role,
    hash,
    req.body.actif === false ? 0 : 1,
    now,
    now,
  );

  appendAudit(db, req.user.login, `Création utilisateur « ${login} » (${req.body.role})`);
  const user = mapUser(
    db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(id),
  );
  res.status(201).json({ user });
});

usersRouter.patch("/:userId", (req, res) => {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(req.params.userId);
  if (!existing) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  const existingLogins = db
    .prepare("SELECT login FROM utilisateur WHERE id != ?")
    .all(existing.id)
    .map((row) => row.login);

  const error = validateUserPayload(req.body, {
    mode: "edit",
    existingLogins,
    userId: existing.id,
  });
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const nextRole = req.body.role ?? existing.role_id;
  const nextActif = req.body.actif === undefined ? Boolean(existing.actif) : req.body.actif !== false;

  if (existing.role_id === "ADMN" && nextRole !== "ADMN" && countActiveAdmins(db, existing.id) === 0) {
    res.status(400).json({ error: "Impossible de retirer le dernier administrateur actif." });
    return;
  }

  if (existing.role_id === "ADMN" && existing.actif && !nextActif && countActiveAdmins(db, existing.id) === 0) {
    res.status(400).json({ error: "Impossible de désactiver le dernier administrateur actif." });
    return;
  }

  const motDePasse = String(req.body.motDePasse ?? "");
  const hash = motDePasse ? hashPassword(motDePasse) : existing.mot_de_passe_hash;

  db.prepare(
    `UPDATE utilisateur
     SET nom_affichage = ?, role_id = ?, actif = ?, mot_de_passe_hash = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    String(req.body.nomAffichage ?? existing.nom_affichage).trim(),
    nextRole,
    nextActif ? 1 : 0,
    hash,
    nowIso(),
    existing.id,
  );

  appendAudit(db, req.user.login, `Modification utilisateur « ${existing.login} »`);
  res.json({
    user: mapUser(db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(existing.id)),
  });
});

usersRouter.post("/:userId/toggle-active", (req, res) => {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(req.params.userId);
  if (!existing) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  const nextActif = !existing.actif;
  if (existing.actif && existing.role_id === "ADMN" && countActiveAdmins(db, existing.id) === 0) {
    res.status(400).json({ error: "Impossible de désactiver le dernier administrateur actif." });
    return;
  }

  db.prepare("UPDATE utilisateur SET actif = ?, updated_at = ? WHERE id = ?").run(
    nextActif ? 1 : 0,
    nowIso(),
    existing.id,
  );

  appendAudit(
    db,
    req.user.login,
    `${existing.actif ? "Désactivation" : "Activation"} utilisateur « ${existing.login} »`,
  );

  res.json({
    user: mapUser(db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(existing.id)),
  });
});

usersRouter.delete("/:userId", (req, res) => {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(req.params.userId);
  if (!existing) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  if (existing.login === PROTECTED_LOGIN) {
    res.status(400).json({ error: "Le compte administrateur principal ne peut pas être supprimé." });
    return;
  }

  if (existing.role_id === "ADMN" && existing.actif && countActiveAdmins(db, existing.id) === 0) {
    res.status(400).json({ error: "Impossible de supprimer le dernier administrateur actif." });
    return;
  }

  db.prepare("DELETE FROM utilisateur WHERE id = ?").run(existing.id);
  appendAudit(db, req.user.login, `Suppression utilisateur « ${existing.login} »`);
  res.json({ ok: true });
});

usersRouter.patch("/:userId/profile", (req, res) => {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(req.params.userId);
  if (!existing) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  if (req.user.id !== existing.id && req.user.role !== "ADMN") {
    res.status(403).json({ error: "Modification non autorisée." });
    return;
  }

  const nomAffichage = String(req.body.nomAffichage ?? "").trim();
  const motDePasse = String(req.body.motDePasse ?? "");
  const confirmation = String(req.body.confirmation ?? "");

  if (!nomAffichage) {
    res.status(400).json({ error: "Le nom affiché est obligatoire." });
    return;
  }

  if (motDePasse || confirmation) {
    if (motDePasse.length < 8) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (motDePasse !== confirmation) {
      res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
      return;
    }
  }

  const hash = motDePasse ? hashPassword(motDePasse) : existing.mot_de_passe_hash;
  db.prepare(
    `UPDATE utilisateur SET nom_affichage = ?, mot_de_passe_hash = ?, updated_at = ? WHERE id = ?`,
  ).run(nomAffichage, hash, nowIso(), existing.id);

  appendAudit(db, req.user.login, `Mise à jour du profil « ${existing.login} »`);
  res.json({
    user: mapUser(db.prepare("SELECT * FROM utilisateur WHERE id = ?").get(existing.id)),
  });
});
