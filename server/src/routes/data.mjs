import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { getDb, getDbPath } from "../db/index.mjs";
import { appendAudit } from "../db/seed.mjs";
import { requireAuth } from "../middleware/auth.mjs";
import { auditDisplayDate } from "../lib/time.mjs";
import { newId, nowIso } from "../lib/time.mjs";

export const auditRouter = Router();

auditRouter.use(requireAuth);

auditRouter.get("/", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, utilisateur_login, action, created_at
       FROM journal_audit
       ORDER BY created_at DESC
       LIMIT 50`,
    )
    .all();

  res.json({
    entries: rows.map((row) => ({
      id: row.id,
      date: auditDisplayDate(row.created_at),
      user: row.utilisateur_login,
      action: row.action,
    })),
  });
});

export const snapshotsRouter = Router();

snapshotsRouter.use(requireAuth);

snapshotsRouter.get("/", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, kind, label, filters_json, donnees_json, created_at
       FROM snapshot_indicateur
       ORDER BY created_at DESC
       LIMIT 50`,
    )
    .all();

  res.json({
    snapshots: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      label: row.label,
      filters: JSON.parse(row.filters_json),
      data: JSON.parse(row.donnees_json),
      createdAt: row.created_at,
    })),
  });
});

snapshotsRouter.post("/", (req, res) => {
  const { kind, label, filters, data } = req.body ?? {};
  if (!kind || !label) {
    res.status(400).json({ error: "kind et label requis." });
    return;
  }

  const db = getDb();
  const id = newId("snap");
  const now = nowIso();
  db.prepare(
    `INSERT INTO snapshot_indicateur (id, utilisateur_id, kind, label, filters_json, donnees_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    req.user.id,
    kind,
    label,
    JSON.stringify(filters ?? {}),
    JSON.stringify(data ?? {}),
    now,
  );

  appendAudit(db, req.user.login, `Snapshot « ${label} » enregistré`);
  res.status(201).json({
    snapshot: {
      id,
      kind,
      label,
      filters: filters ?? {},
      data: data ?? {},
      createdAt: now,
    },
    total: db.prepare("SELECT COUNT(*) AS n FROM snapshot_indicateur").get().n,
  });
});

export const configRouter = Router();

configRouter.use(requireAuth);

configRouter.get("/", (_req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM config_applicatif WHERE id = 'CONF'").get();
  const lastBackup = db
    .prepare(
      `SELECT created_at FROM journal_audit
       WHERE action LIKE 'Sauvegarde SQLite%'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .get();
  res.json({
    joursOuvrablesMensuels: row?.jours_ouvrables_mensuels ?? 20,
    seuilAttenteJours: row?.seuil_attente_jours ?? 30,
    databasePath: getDbPath(),
    lastBackupAt: lastBackup?.created_at ?? null,
  });
});

configRouter.patch("/", (req, res) => {
  if (req.user.role !== "ADMN") {
    res.status(403).json({ error: "Profil ADMN requis." });
    return;
  }

  const db = getDb();
  const current = db.prepare("SELECT * FROM config_applicatif WHERE id = 'CONF'").get();
  const jours = Number(req.body?.joursOuvrablesMensuels ?? current?.jours_ouvrables_mensuels ?? 20);

  db.prepare(
    `UPDATE config_applicatif SET jours_ouvrables_mensuels = ?, updated_at = ? WHERE id = 'CONF'`,
  ).run(jours, nowIso());

  appendAudit(db, req.user.login, `Paramètres mis à jour (jours ouvrables : ${jours})`);
  res.json({
    joursOuvrablesMensuels: jours,
    seuilAttenteJours: current?.seuil_attente_jours ?? 30,
    databasePath: getDbPath(),
    lastBackupAt: db
      .prepare(
        `SELECT created_at FROM journal_audit
         WHERE action LIKE 'Sauvegarde SQLite%'
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get()?.created_at ?? null,
  });
});

configRouter.get("/backup", (req, res) => {
  if (req.user.role !== "ADMN") {
    res.status(403).json({ error: "Profil ADMN requis." });
    return;
  }

  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    res.status(404).json({ error: "Base SQLite introuvable." });
    return;
  }

  const db = getDb();
  const stamp = new Date().toISOString().slice(0, 10);
  appendAudit(db, req.user.login, "Sauvegarde SQLite téléchargée");
  res.download(dbPath, `lulu-sante-${stamp}.sqlite`);
});
