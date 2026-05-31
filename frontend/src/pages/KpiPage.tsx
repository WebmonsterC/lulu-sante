import { useMemo, useState } from "react";
import { ChartLineUp } from "@phosphor-icons/react";
import { GlobalFilters } from "../components/GlobalFilters";
import { ExportMenu } from "../components/ExportMenu";
import { FlashNotice } from "../components/FlashNotice";
import { IndicateurSectionNav } from "../components/indicateurs/IndicateurSectionNav";
import { TermHeading, TermTableHeader, TermTooltip } from "../components/TermTooltip";
import { useAppData } from "../context/AppDataContext";
import { INDICATEUR_SECTION_KPI } from "../data/indicateurs";
import type { GlossaryKey } from "../data/glossary";
import { DEFAULT_PAGE_FILTERS, type PageFilters } from "../lib/filters";
import {
  exportKpiExcel,
  exportKpiPdf,
  snapshotPayloadForKpi,
} from "../lib/export-reports";
import { formatSnapshotNotice, saveSnapshot } from "../lib/snapshots";
import { useExportActions, useFlashNotice } from "../hooks/useExportActions";

const KPI_TERMS: Record<string, GlossaryKey> = {
  "Taux absentéisme global": "absenteeisme",
  "Reclassement réussi": "reclassement_reussi",
  "Taux retour emploi": "maintien",
  "Agents arrêt > 180 j": "dossier_aprs",
  "Délai traitement dossiers": "jours_ouvrables",
  "Reprise durable 12 m": "maintien",
  "Dossiers attente > 30 j": "saisine",
};

const KPI_SUMMARY_LABELS = [
  "Taux absentéisme global",
  "Taux retour emploi",
  "Reclassement réussi",
];

function evolutionClass(evolution: string): string {
  if (evolution.startsWith("↑")) return "lulu-kpi-evolution lulu-kpi-evolution--up";
  if (evolution.startsWith("↓")) return "lulu-kpi-evolution lulu-kpi-evolution--down";
  return "lulu-kpi-evolution";
}

export function KpiPage() {
  const { metier } = useAppData();
  const kpiDirection = metier.kpiDirection;
  const [filters, setFilters] = useState<PageFilters>(DEFAULT_PAGE_FILTERS);
  const { message, severity, showSuccess, showError, dismiss } = useFlashNotice();
  const runExport = useExportActions(showError);

  const scopeLabel = `Section ${INDICATEUR_SECTION_KPI.catalogNumber} — ${INDICATEUR_SECTION_KPI.navTitle}`;

  const summaryCards = useMemo(
    () => kpiDirection.filter((row) => KPI_SUMMARY_LABELS.includes(row.kpi)),
    [kpiDirection],
  );

  function handleExportPdf(currentFilters: PageFilters) {
    runExport(() => exportKpiPdf(currentFilters));
  }

  function handleExportExcel(currentFilters: PageFilters) {
    runExport(() => exportKpiExcel(currentFilters));
  }

  function handleSnapshot(currentFilters: PageFilters) {
    void saveSnapshot({
      kind: "kpi",
      label: `${scopeLabel} (${currentFilters.periodeLabel} · ${currentFilters.poleLabel})`,
      filters: currentFilters,
      data: snapshotPayloadForKpi(currentFilters),
    }).then(({ record, total }) => {
      showSuccess(formatSnapshotNotice(record, total));
    }).catch((err) => {
      showError(err instanceof Error ? err.message : "Snapshot impossible.");
    });
  }

  return (
    <div className="fr-mt-3w lulu-indicateurs">
      <FlashNotice message={message} severity={severity} onClose={dismiss} />

      <div className="lulu-page-header">
        <div className="lulu-page-header__title">
          <TermHeading as="h1" className="fr-h3" term="kpi">
            Indicateurs détaillés
          </TermHeading>
          <p className="fr-text--sm fr-text--mention">
            Section 9 du catalogue — KPIs remontant en comité de direction, avec comparaison N−1
            et objectifs.
          </p>
        </div>
        <div className="lulu-page-header__actions">
          <GlobalFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      <div className="fr-callout fr-callout--blue-cumulus fr-mb-4w">
        <p className="fr-callout__title fr-callout__title--blue-cumulus">
          <ChartLineUp weight="duotone" size={22} aria-hidden className="lulu-callout-icon" />
          Tableau comité de direction
        </p>
        <p className="fr-callout__text fr-mb-0">
          Synthèse des indicateurs stratégiques pour la direction —{" "}
          <strong>{filters.periodeLabel}</strong> comparée à la période précédente. Les objectifs
          indiquent la tendance souhaitée (↑ augmenter, ↓ diminuer).
        </p>
      </div>

      <IndicateurSectionNav activeId="kpi" />

      <div className="lulu-indicateurs__content">
        <header className="fr-mb-4w lulu-indicateurs__section-header">
          <p className="fr-text--xs fr-text--mention fr-mb-1w">
            Section {INDICATEUR_SECTION_KPI.catalogNumber} du catalogue
          </p>
          <div className="lulu-indicateurs__section-heading">
            <TermHeading as="h2" className="fr-h4 fr-mb-0" term={INDICATEUR_SECTION_KPI.term}>
              {INDICATEUR_SECTION_KPI.navTitle}
            </TermHeading>
            <ExportMenu
              filters={filters}
              scopeLabel={scopeLabel}
              actionHint="Comité de direction"
              onExportPdf={handleExportPdf}
              onExportExcel={handleExportExcel}
              onSnapshot={handleSnapshot}
            />
          </div>
          <p className="fr-text--md fr-mb-0 fr-mt-2w">{INDICATEUR_SECTION_KPI.description}</p>
        </header>

        <div className="lulu-stats-grid fr-mb-4w">
          {summaryCards.map((row) => (
            <article key={row.kpi} className="fr-tile fr-p-3w">
              <span className="lulu-term-label__row">
                <span className="fr-tile__title fr-text--sm">{row.kpi}</span>
                {KPI_TERMS[row.kpi] ? <TermTooltip term={KPI_TERMS[row.kpi]} /> : null}
              </span>
              <p className="fr-display--sm fr-mb-0">{row.valeur}</p>
              <p className={`fr-text--xs fr-mb-0 fr-mt-1w ${evolutionClass(row.evolution)}`}>
                {row.evolution} vs N−1 ({row.n1})
              </p>
            </article>
          ))}
        </div>

        <div className="lulu-chart lulu-kpi-table">
          <h3 className="fr-h6 fr-mb-2w">Détail des KPIs</h3>
          <div className="fr-table fr-table--bordered lulu-table-scroll">
            <table>
              <thead>
                <tr>
                  <TermTableHeader term="kpi">KPI</TermTableHeader>
                  <th scope="col">Valeur</th>
                  <th scope="col">Objectif</th>
                  <th scope="col">N−1</th>
                  <th scope="col">Évolution</th>
                </tr>
              </thead>
              <tbody>
                {kpiDirection.map((row) => (
                  <tr key={row.kpi}>
                    <td>
                      <span className="lulu-term-label__row">
                        <span>{row.kpi}</span>
                        {KPI_TERMS[row.kpi] ? <TermTooltip term={KPI_TERMS[row.kpi]} /> : null}
                      </span>
                    </td>
                    <td>
                      <strong>{row.valeur}</strong>
                    </td>
                    <td className="fr-text--sm">{row.objectif}</td>
                    <td>{row.n1}</td>
                    <td>
                      <span className={evolutionClass(row.evolution)}>{row.evolution}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
