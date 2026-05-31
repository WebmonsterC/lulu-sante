import metierBundle from "../seed/metier-bundle.json" with { type: "json" };
import { hashPassword, DEFAULT_PASSWORD } from "../auth/password.mjs";
import { nowIso, newId } from "../lib/time.mjs";

const SEED_USERS = [
  { id: "usr-admin-001", login: "admin", nomAffichage: "Administrateur applicatif", role: "ADMN" },
  { id: "usr-mdupont-002", login: "mdupont", nomAffichage: "Marie Dupont", role: "GEST" },
  { id: "usr-jbernard-003", login: "jbernard", nomAffichage: "Jean Bernard", role: "RCME" },
  { id: "usr-lpetit-004", login: "lpetit", nomAffichage: "Luc Petit", role: "RMED" },
  { id: "usr-direction-005", login: "direction", nomAffichage: "Direction CHUM", role: "DIR" },
  { id: "usr-cmartin-006", login: "cmartin", nomAffichage: "Claire Martin", role: "DIR" },
];

const SEED_AUDIT = [
  { user: "mdupont", action: "Modification dossier DOS-2026-0142", created_at: "2026-05-30T09:14:00.000Z" },
  { user: "jbernard", action: "Saisine CM enregistrée", created_at: "2026-05-29T16:42:00.000Z" },
  { user: "direction", action: "Export KPI direction (PDF)", created_at: "2026-05-29T11:05:00.000Z" },
  { user: "admin", action: "Sauvegarde base SQLite", created_at: "2026-05-28T08:30:00.000Z" },
];

export function seedDatabase(db) {
  const userCount = db.prepare("SELECT COUNT(*) AS n FROM utilisateur").get().n;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO utilisateur (id, login, nom_affichage, role_id, mot_de_passe_hash, actif, created_at, updated_at)
      VALUES (@id, @login, @nomAffichage, @role, @hash, 1, @now, @now)
    `);
    const hash = hashPassword(DEFAULT_PASSWORD);
    const now = nowIso();
    for (const user of SEED_USERS) {
      insertUser.run({ ...user, hash, now });
    }
  }

  const configCount = db.prepare("SELECT COUNT(*) AS n FROM config_applicatif").get().n;
  if (configCount === 0) {
    db.prepare(
      `INSERT INTO config_applicatif (id, jours_ouvrables_mensuels, seuil_attente_jours, updated_at)
       VALUES ('CONF', 20, 30, ?)`,
    ).run(nowIso());
  }

  const auditCount = db.prepare("SELECT COUNT(*) AS n FROM journal_audit").get().n;
  if (auditCount === 0) {
    const insertAudit = db.prepare(
      `INSERT INTO journal_audit (id, utilisateur_login, action, created_at) VALUES (?, ?, ?, ?)`,
    );
    for (const entry of SEED_AUDIT) {
      insertAudit.run(newId("aud"), entry.user, entry.action, entry.created_at);
    }
  }

  const upsertMetier = db.prepare(`
    INSERT INTO app_metier (key, data_json, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO NOTHING
  `);
  const now = nowIso();
  for (const [key, value] of Object.entries(metierBundle)) {
    upsertMetier.run(key, JSON.stringify(value), now);
  }
}

export function appendAudit(db, login, action) {
  db.prepare(
    `INSERT INTO journal_audit (id, utilisateur_login, action, created_at) VALUES (?, ?, ?, ?)`,
  ).run(newId("aud"), login, action, nowIso());
}

export function countActiveAdmins(db, excludeId) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM utilisateur WHERE role_id = 'ADMN' AND actif = 1 AND id != ?`,
    )
    .get(excludeId ?? "");
  return row.n;
}

export function readMetierBundle(db) {
  const rows = db.prepare("SELECT key, data_json FROM app_metier").all();
  const bundle = {};
  for (const row of rows) {
    bundle[row.key] = JSON.parse(row.data_json);
  }
  return {
    agents: bundle.agents ?? [],
    dossiers: bundle.dossiers ?? [],
    alertes: bundle.alertes ?? [],
    arrets: bundle.arrets ?? [],
    saisinesCm: bundle.saisines_cm ?? [],
    visitesMt: bundle.visites_mt ?? [],
    parcoursPpr: bundle.parcours_ppr ?? [],
    chronologie: bundle.chronologie ?? {},
    kpiDirection: bundle.kpi_direction ?? [],
  };
}

export function writeMetierKey(db, key, value) {
  db.prepare(
    `INSERT INTO app_metier (key, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`,
  ).run(key, JSON.stringify(value), nowIso());
}
