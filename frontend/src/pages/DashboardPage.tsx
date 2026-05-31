import { Link } from "react-router-dom";
import { GlobalFilters } from "../components/GlobalFilters";
import { FlashNotice } from "../components/FlashNotice";
import { StatusBadge } from "../components/StatusBadge";
import { TermHeading } from "../components/TermTooltip";
import { KPI_APRS } from "../data/dashboard";
import { useAppData } from "../context/AppDataContext";
import { dossierPath } from "../lib/navigation";
import { readPageFilters } from "../lib/filters";
import { exportDashboardPdf } from "../lib/export-reports";
import { useExportActions, useFlashNotice } from "../hooks/useExportActions";

export function DashboardPage() {
  const { metier } = useAppData();
  const alertes = metier.alertes;
  const { message, severity, showError, dismiss } = useFlashNotice();
  const runExport = useExportActions(showError);

  function handleExportPdf() {
    runExport(() => exportDashboardPdf(readPageFilters()));
  }

  return (
    <div className="fr-mt-3w">
      <FlashNotice message={message} severity={severity} onClose={dismiss} />

      <div className="lulu-page-header">
        <div className="lulu-page-header__title">
          <TermHeading as="h1" className="fr-h3" term="aprs">
            Dashboard APRS
          </TermHeading>
          <p className="fr-text--sm fr-text--mention">
            Vue synthétique des indicateurs stratégiques
          </p>
        </div>
        <GlobalFilters showExport onExportPdf={handleExportPdf} />
      </div>

      <div className="lulu-kpi-grid fr-mb-6w">
        {KPI_APRS.map((kpi) => (
          <article key={kpi.label} className="fr-tile fr-p-3w">
            <TermHeading as="h3" className="fr-tile__title fr-text--sm" term={kpi.term}>
              {kpi.label}
            </TermHeading>
            <p className="fr-display--sm fr-mb-0">{kpi.value}</p>
            <p className="fr-text--xs fr-text--mention fr-mt-1w">
              {kpi.trend} vs période précédente
            </p>
          </article>
        ))}
      </div>

      <h2 className="fr-h5">Alertes</h2>
      <div className="fr-table fr-table--bordered fr-mt-2w lulu-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Dossier</th>
              <th scope="col">Agent</th>
              <th scope="col">Depuis</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {alertes.map((a) => (
              <tr key={a.id}>
                <td>
                  <StatusBadge label={a.type} tone={a.tone} />
                </td>
                <td>{a.dossierId}</td>
                <td>{a.agent}</td>
                <td>{a.depuis}</td>
                <td>
                  <Link className="fr-link" to={dossierPath(a.dossierId)}>
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="fr-h5 fr-mt-6w">Accès rapides</h2>
      <div className="lulu-tiles-grid fr-mt-2w">
        <Link className="fr-tile fr-enlarge-link" to="/dossiers">
          <h3 className="fr-tile__title">Liste des dossiers</h3>
          <p className="fr-tile__desc">Rechercher et ouvrir un dossier APRS</p>
        </Link>
        <Link className="fr-tile fr-enlarge-link" to="/indicateurs/1">
          <h3 className="fr-tile__title">Indicateurs détaillés</h3>
          <p className="fr-tile__desc">Sections 1 à 9 du catalogue indicateurs</p>
        </Link>
        <Link className="fr-tile fr-enlarge-link" to="/exports">
          <h3 className="fr-tile__title">Exporter un rapport</h3>
          <p className="fr-tile__desc">PDF ou tableur pour la direction</p>
        </Link>
      </div>
    </div>
  );
}
