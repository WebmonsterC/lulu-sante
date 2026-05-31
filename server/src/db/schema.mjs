export function applySchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS utilisateur (
      id TEXT PRIMARY KEY,
      login TEXT NOT NULL UNIQUE COLLATE NOCASE,
      nom_affichage TEXT NOT NULL,
      role_id TEXT NOT NULL,
      mot_de_passe_hash TEXT NOT NULL,
      actif INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_utilisateur (
      id TEXT PRIMARY KEY,
      utilisateur_id TEXT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expire_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_audit (
      id TEXT PRIMARY KEY,
      utilisateur_login TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS config_applicatif (
      id TEXT PRIMARY KEY,
      jours_ouvrables_mensuels INTEGER NOT NULL DEFAULT 20,
      seuil_attente_jours INTEGER NOT NULL DEFAULT 30,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshot_indicateur (
      id TEXT PRIMARY KEY,
      utilisateur_id TEXT,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      filters_json TEXT NOT NULL,
      donnees_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_metier (
      key TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_session_token ON session_utilisateur (token);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON journal_audit (created_at DESC);
  `);
}
