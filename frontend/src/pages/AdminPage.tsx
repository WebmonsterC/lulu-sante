import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import {
  ClockCounterClockwise,
  Database,
  GearSix,
  ShieldCheck,
} from "@phosphor-icons/react";
import { AdminSectionPanel } from "../components/AdminSectionPanel";
import { FlashNotice } from "../components/FlashNotice";
import { UsersAdminSection } from "../components/UsersAdminSection";
import { useUsersAdmin } from "../hooks/useUsersAdmin";
import {
  downloadDatabaseBackup,
  fetchConfig,
  formatConfigDate,
  updateConfig,
} from "../lib/config-api";
import { useFlashNotice } from "../hooks/useExportActions";

export function AdminPage() {
  const location = useLocation();
  const { message, severity, showSuccess, showError, dismiss } = useFlashNotice();
  const { users, auditLog, toggleActive, deleteUser } = useUsersAdmin();
  const [joursOuvrables, setJoursOuvrables] = useState("20");
  const [databasePath, setDatabasePath] = useState("");
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  async function loadConfig() {
    try {
      const config = await fetchConfig();
      setJoursOuvrables(String(config.joursOuvrablesMensuels));
      setDatabasePath(config.databasePath);
      setLastBackupAt(config.lastBackupAt);
    } catch {
      showError("Impossible de lire la configuration SQLite.");
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const flash = (location.state as { flash?: string } | null)?.flash;
    if (flash) {
      showSuccess(flash);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showSuccess]);

  async function handleSaveConfig() {
    const value = Number(joursOuvrables);
    if (!Number.isFinite(value) || value < 1 || value > 31) {
      showError("Saisissez un nombre de jours ouvrables entre 1 et 31.");
      return;
    }

    setSavingConfig(true);
    try {
      const config = await updateConfig({ joursOuvrablesMensuels: value });
      setJoursOuvrables(String(config.joursOuvrablesMensuels));
      setDatabasePath(config.databasePath);
      setLastBackupAt(config.lastBackupAt);
      showSuccess(`Paramètres enregistrés — ${config.joursOuvrablesMensuels} jours ouvrables.`);
    } catch {
      showError("Échec de l'enregistrement dans SQLite.");
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleBackup() {
    setDownloadingBackup(true);
    try {
      await downloadDatabaseBackup();
      await loadConfig();
      showSuccess("Sauvegarde SQLite téléchargée.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Échec de la sauvegarde.");
    } finally {
      setDownloadingBackup(false);
    }
  }

  return (
    <div className="fr-mt-3w lulu-admin">
      <FlashNotice message={message} severity={severity} onClose={dismiss} />

      <div className="lulu-page-header">
        <div className="lulu-page-header__title">
          <h1 className="fr-h3">Administration</h1>
          <p className="fr-text--sm fr-text--mention">
            Gestion des utilisateurs, paramètres applicatifs, sauvegardes et journal d&apos;audit.
          </p>
        </div>
      </div>

      <div className="fr-callout fr-callout--blue-cumulus fr-mb-4w">
        <p className="fr-callout__title fr-callout__title--blue-cumulus">
          <ShieldCheck weight="duotone" size={22} aria-hidden className="lulu-callout-icon" />
          Espace réservé aux administrateurs
        </p>
        <p className="fr-callout__text fr-mb-0">
          Profil <strong>ADMN</strong> requis — comptes locaux, paramètres globaux (D4 : 20 jours
          ouvrables), sauvegarde SQLite et traçabilité des actions (prototype).
        </p>
      </div>

      <div className="lulu-admin-sections">
        <UsersAdminSection
          users={users}
          onToggleActive={toggleActive}
          onDelete={deleteUser}
          onSuccess={showSuccess}
        />

        <AdminSectionPanel
          icon={<GearSix weight="duotone" size={28} />}
          title="Paramètres"
          description="Valeurs globales impactant le calcul des indicateurs."
        >
          <Input
            label="Jours ouvrables / agent / mois"
            hintText="Dénominateur absentéisme (décision D4) — défaut : 20"
            nativeInputProps={{
              value: joursOuvrables,
              onChange: (e) => setJoursOuvrables(e.target.value),
              type: "number",
              min: 1,
              max: 31,
            }}
          />
          <div className="fr-mt-3w">
            <Button disabled={savingConfig} onClick={handleSaveConfig}>
              Enregistrer
            </Button>
          </div>
        </AdminSectionPanel>

        <AdminSectionPanel
          icon={<Database weight="duotone" size={28} />}
          title="Sauvegarde & import"
          description="Base SQLite centralisée · import agents XLS/PDF (D3)."
        >
          <p className="fr-text--sm fr-text--mention fr-mb-2w">
            Fichier base : <strong className="lulu-break-all">{databasePath || "—"}</strong>
          </p>
          <p className="fr-text--sm fr-text--mention fr-mb-3w">
            Dernière sauvegarde : <strong>{formatConfigDate(lastBackupAt)}</strong>
          </p>
          <div className="fr-btns-group fr-btns-group--inline">
            <Button
              priority="secondary"
              disabled={downloadingBackup}
              onClick={handleBackup}
            >
              Sauvegarder maintenant
            </Button>
            <Button priority="secondary" onClick={() => showSuccess("Assistant import agents — à venir.")}>
              Importer agents
            </Button>
          </div>
        </AdminSectionPanel>

        <AdminSectionPanel
          className="lulu-admin-section--wide"
          icon={<ClockCounterClockwise weight="duotone" size={28} />}
          title="Journal d'audit"
          description="Traçabilité des modifications et exports (ADM-04)."
        >
          <div className="fr-table fr-table--bordered lulu-table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Utilisateur</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => (
                  <tr key={entry.id}>
                    <td className="fr-text--sm">{entry.date}</td>
                    <td>{entry.user}</td>
                    <td className="fr-text--sm">{entry.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSectionPanel>
      </div>
    </div>
  );
}
