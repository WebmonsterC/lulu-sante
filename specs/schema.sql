-- Lulu Santé — Schéma SQLite v1.0
-- Toutes les PK/FK : CHAR(n) à longueur fixe (intégrité des clés)
-- PRAGMA recommandés au démarrage serveur :
--   PRAGMA foreign_keys = ON;
--   PRAGMA journal_mode = WAL;

-- =============================================================================
-- RÉFÉRENTIELS (PK = codes métier CHAR)
-- =============================================================================

CREATE TABLE ref_type_absence (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_type_attente (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_resultat_cm (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_type_visite_mt (
    id          CHAR(6)  NOT NULL PRIMARY KEY CHECK (length(id) = 6),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_modalite_reprise (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_motif_retraite (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_type_orientation (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_type_action_maintien (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_statut_emploi (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_statut_dossier (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

CREATE TABLE ref_role_utilisateur (
    id          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4),
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1))
);

-- =============================================================================
-- PÔLES
-- =============================================================================

CREATE TABLE ref_pole (
    id          CHAR(8)  NOT NULL PRIMARY KEY CHECK (length(id) = 8),
    code        TEXT     NOT NULL UNIQUE,
    libelle     TEXT     NOT NULL,
    actif       INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1)),
    created_at  TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT     NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- AGENTS & DOSSIERS
-- =============================================================================

CREATE TABLE agent (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    matricule           TEXT     NOT NULL UNIQUE,
    nom                 TEXT     NOT NULL,
    prenom              TEXT     NOT NULL,
    pole_id             CHAR(8)  NOT NULL CHECK (length(pole_id) = 8)
        REFERENCES ref_pole (id) ON DELETE RESTRICT,
    statut_emploi_id    CHAR(4)  NOT NULL CHECK (length(statut_emploi_id) = 4)
        REFERENCES ref_statut_emploi (id) ON DELETE RESTRICT,
    actif               INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1)),
    date_entree         TEXT,
    date_sortie         TEXT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE dossier (
    id                          CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    agent_id                    CHAR(26) NOT NULL CHECK (length(agent_id) = 26)
        REFERENCES agent (id) ON DELETE RESTRICT,
    numero_dossier              TEXT     NOT NULL UNIQUE,
    statut_id                   CHAR(4)  NOT NULL CHECK (length(statut_id) = 4)
        REFERENCES ref_statut_dossier (id) ON DELETE RESTRICT,
    type_absence_id             CHAR(4)  NOT NULL CHECK (length(type_absence_id) = 4)
        REFERENCES ref_type_absence (id) ON DELETE RESTRICT,
    date_reception_arret        TEXT     NOT NULL,
    date_creation_dossier       TEXT     NOT NULL,
    date_cloture                TEXT,
    date_demarches_obligatoires TEXT,
    complet                     INTEGER  NOT NULL DEFAULT 0 CHECK (complet IN (0, 1)),
    commentaire                 TEXT,
    created_at                  TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at                  TEXT     NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- ÉVÉNEMENTS DOSSIER
-- =============================================================================

CREATE TABLE episode_absence (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    type_absence_id     CHAR(4)  NOT NULL CHECK (length(type_absence_id) = 4)
        REFERENCES ref_type_absence (id) ON DELETE RESTRICT,
    date_debut          TEXT     NOT NULL,
    date_fin            TEXT,
    jours_ouvrables     INTEGER  CHECK (jours_ouvrables IS NULL OR jours_ouvrables >= 0),
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE attente (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    type_attente_id     CHAR(4)  NOT NULL CHECK (length(type_attente_id) = 4)
        REFERENCES ref_type_attente (id) ON DELETE RESTRICT,
    date_debut          TEXT     NOT NULL,
    date_fin            TEXT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE saisine_conseil_medical (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    date_saisine        TEXT     NOT NULL,
    date_avis           TEXT,
    resultat_id         CHAR(4)  CHECK (resultat_id IS NULL OR length(resultat_id) = 4)
        REFERENCES ref_resultat_cm (id) ON DELETE RESTRICT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE visite_medecine_travail (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    date_visite         TEXT     NOT NULL,
    type_visite_id      CHAR(6)  NOT NULL CHECK (length(type_visite_id) = 6)
        REFERENCES ref_type_visite_mt (id) ON DELETE RESTRICT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE reprise_emploi (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    date_reprise        TEXT     NOT NULL,
    modalite_id         CHAR(4)  NOT NULL CHECK (length(modalite_id) = 4)
        REFERENCES ref_modalite_reprise (id) ON DELETE RESTRICT,
    rechute             INTEGER  NOT NULL DEFAULT 0 CHECK (rechute IN (0, 1)),
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE action_maintien_emploi (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    type_action_id      CHAR(4)  NOT NULL CHECK (length(type_action_id) = 4)
        REFERENCES ref_type_action_maintien (id) ON DELETE RESTRICT,
    orientation_id      CHAR(4)  CHECK (orientation_id IS NULL OR length(orientation_id) = 4)
        REFERENCES ref_type_orientation (id) ON DELETE RESTRICT,
    date_action         TEXT     NOT NULL,
    description         TEXT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE depart_retraite (
    id                      CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id              CHAR(26) NOT NULL UNIQUE CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    motif_id                CHAR(4)  NOT NULL CHECK (length(motif_id) = 4)
        REFERENCES ref_motif_retraite (id) ON DELETE RESTRICT,
    date_decision           TEXT     NOT NULL,
    date_depart_effectif    TEXT,
    en_preparation          INTEGER  NOT NULL DEFAULT 1 CHECK (en_preparation IN (0, 1)),
    created_at              TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE parcours_ppr (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    dossier_id          CHAR(26) NOT NULL CHECK (length(dossier_id) = 26)
        REFERENCES dossier (id) ON DELETE RESTRICT,
    date_entree         TEXT     NOT NULL,
    date_sortie         TEXT,
    date_affectation    TEXT,
    poste_affectation   TEXT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- SYSTÈME
-- =============================================================================

CREATE TABLE parametre_application (
    id                          CHAR(4)  NOT NULL PRIMARY KEY CHECK (length(id) = 4) DEFAULT 'CONF',
    jours_ouvrables_mensuels    INTEGER  NOT NULL DEFAULT 20 CHECK (jours_ouvrables_mensuels > 0),
    seuil_attente_jours         INTEGER  NOT NULL DEFAULT 30 CHECK (seuil_attente_jours > 0),
    duree_rechute_mois          INTEGER  NOT NULL DEFAULT 6 CHECK (duree_rechute_mois > 0),
    updated_at                  TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE utilisateur (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    login               TEXT     NOT NULL UNIQUE,
    nom_affichage       TEXT     NOT NULL,
    role_id             CHAR(4)  NOT NULL CHECK (length(role_id) = 4)
        REFERENCES ref_role_utilisateur (id) ON DELETE RESTRICT,
    mot_de_passe_hash   TEXT     NOT NULL,
    actif               INTEGER  NOT NULL DEFAULT 1 CHECK (actif IN (0, 1)),
    created_at          TEXT     NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE session_utilisateur (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    utilisateur_id      CHAR(26) NOT NULL CHECK (length(utilisateur_id) = 26)
        REFERENCES utilisateur (id) ON DELETE CASCADE,
    token_hash          TEXT     NOT NULL,
    expire_at           TEXT     NOT NULL,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE journal_audit (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    utilisateur_id      CHAR(26) NOT NULL CHECK (length(utilisateur_id) = 26)
        REFERENCES utilisateur (id) ON DELETE RESTRICT,
    table_name          TEXT     NOT NULL,
    enregistrement_id   CHAR(26) NOT NULL CHECK (length(enregistrement_id) = 26),
    action              TEXT     NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    donnees_avant       TEXT,
    donnees_apres       TEXT,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE snapshot_indicateur (
    id                  CHAR(26) NOT NULL PRIMARY KEY CHECK (length(id) = 26),
    utilisateur_id      CHAR(26) NOT NULL CHECK (length(utilisateur_id) = 26)
        REFERENCES utilisateur (id) ON DELETE RESTRICT,
    periode_debut       TEXT     NOT NULL,
    periode_fin         TEXT     NOT NULL,
    pole_id             CHAR(8)  CHECK (pole_id IS NULL OR length(pole_id) = 8)
        REFERENCES ref_pole (id) ON DELETE RESTRICT,
    donnees_json        TEXT     NOT NULL,
    created_at          TEXT     NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- INDEX
-- =============================================================================

CREATE INDEX idx_agent_pole ON agent (pole_id);
CREATE INDEX idx_agent_matricule ON agent (matricule);
CREATE INDEX idx_dossier_agent ON dossier (agent_id);
CREATE INDEX idx_dossier_statut ON dossier (statut_id);
CREATE INDEX idx_dossier_type_absence ON dossier (type_absence_id);
CREATE INDEX idx_dossier_dates ON dossier (date_creation_dossier, date_cloture);
CREATE INDEX idx_episode_dossier ON episode_absence (dossier_id);
CREATE INDEX idx_episode_dates ON episode_absence (date_debut, date_fin);
CREATE INDEX idx_attente_dossier ON attente (dossier_id, date_fin);
CREATE INDEX idx_saisine_dossier ON saisine_conseil_medical (dossier_id);
CREATE INDEX idx_saisine_dates ON saisine_conseil_medical (date_saisine, date_avis);
CREATE INDEX idx_visite_dossier ON visite_medecine_travail (dossier_id);
CREATE INDEX idx_reprise_dossier ON reprise_emploi (dossier_id);
CREATE INDEX idx_action_dossier ON action_maintien_emploi (dossier_id);
CREATE INDEX idx_parcours_dossier ON parcours_ppr (dossier_id);
CREATE INDEX idx_parcours_affectation ON parcours_ppr (date_affectation);
CREATE INDEX idx_audit_enregistrement ON journal_audit (table_name, enregistrement_id);
CREATE INDEX idx_session_utilisateur ON session_utilisateur (utilisateur_id, expire_at);

-- =============================================================================
-- DONNÉES DE RÉFÉRENCE
-- =============================================================================

INSERT INTO ref_pole (id, code, libelle) VALUES
    ('CHUMBIOL', 'BIOL', 'Biologie — Pathologie'),
    ('CHUMFMET', 'FMET', 'Femme — Mère — Enfant de territoire'),
    ('CHUMGERI', 'GERI', 'Gériatrie — Gérontologie'),
    ('CHUMIMGM', 'IMGM', 'Imagerie médicale'),
    ('CHUMNEUR', 'NEUR', 'Neurosciences — Appareil locomoteur'),
    ('CHUMPDIG', 'PDIG', 'Pathologies digestives'),
    ('CHUMPALL', 'PALL', 'Soins palliatifs'),
    ('CHUMURGE', 'URGE', 'Médecine d''urgence');

INSERT INTO ref_type_absence (id, libelle) VALUES
    ('COMO', 'Maladie ordinaire (COM)'),
    ('CLML', 'Longue maladie (CLM)'),
    ('CLDL', 'Longue durée (CLD)'),
    ('ACCS', 'Accident de service'),
    ('MALP', 'Maladie professionnelle'),
    ('TPTE', 'Temps partiel thérapeutique (TPT)'),
    ('DOFF', 'Disponibilité d''office pour raison de santé'),
    ('CITI', 'CITIS — Congé pour Invalidité Temporaire Imputable au Service');

INSERT INTO ref_type_attente (id, libelle) VALUES
    ('EXPM', 'Expertise médicale'),
    ('CMED', 'Avis du conseil médical'),
    ('DADM', 'Décision administrative'),
    ('MAGR', 'Retour d''un médecin agréé');

INSERT INTO ref_resultat_cm (id, libelle) VALUES
    ('FAVR', 'Avis favorable'),
    ('DEFA', 'Avis défavorable'),
    ('SURS', 'Sursis à statuer');

INSERT INTO ref_type_visite_mt (id, libelle) VALUES
    ('APTITU', 'Aptitude'),
    ('INAPOP', 'Inaptitude au poste de travail'),
    ('INAPMT', 'Inaptitude au métier'),
    ('RECLMT', 'Reclassement');

INSERT INTO ref_modalite_reprise (id, libelle) VALUES
    ('TPLE', 'Temps plein'),
    ('TPTE', 'Temps partiel thérapeutique'),
    ('RECL', 'Reclassement');

INSERT INTO ref_motif_retraite (id, libelle) VALUES
    ('INAP', 'Retraite pour inaptitude'),
    ('HAND', 'Retraite anticipée pour handicap'),
    ('DRTE', 'Retraite de droit (âge limite)'),
    ('AUTR', 'Autres motifs liés à la santé');

INSERT INTO ref_type_orientation (id, libelle) VALUES
    ('MEDT', 'Médecine du travail'),
    ('ERGO', 'Ergonomie'),
    ('PSYC', 'Accompagnement psychologique'),
    ('FIPH', 'Handicap / FIPHFP'),
    ('FORM', 'Formation'),
    ('BILA', 'Bilan de compétences');

INSERT INTO ref_type_action_maintien (id, libelle) VALUES
    ('ETUD', 'Étude de poste'),
    ('AMEN', 'Aménagement de poste'),
    ('RECL', 'Reclassement');

INSERT INTO ref_statut_emploi (id, libelle) VALUES
    ('TITU', 'Titulaire'),
    ('CONT', 'Contractuel'),
    ('STAG', 'Stagiaire'),
    ('AUTR', 'Autre');

INSERT INTO ref_statut_dossier (id, libelle) VALUES
    ('ACTI', 'Actif'),
    ('CLOT', 'Clôturé');

INSERT INTO ref_role_utilisateur (id, libelle) VALUES
    ('ADMN', 'Administrateur'),
    ('GEST', 'Gestionnaire APRS'),
    ('RCME', 'Référent conseil médical'),
    ('RMED', 'Référent médecine du travail'),
    ('DIRE', 'Direction (lecture seule)');

INSERT INTO parametre_application (id) VALUES ('CONF');

-- Vue utilitaire : reclassement réussi (D5)
CREATE VIEW v_reclassement_reussi AS
SELECT
    p.id,
    p.dossier_id,
    p.date_entree,
    p.date_affectation,
    p.poste_affectation,
    CASE WHEN p.date_affectation IS NOT NULL THEN 1 ELSE 0 END AS reclassement_reussi
FROM parcours_ppr p;
