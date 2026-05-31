import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ListMagnifyingGlass } from "@phosphor-icons/react";
import { GlobalFilters } from "../components/GlobalFilters";
import { ExportMenu } from "../components/ExportMenu";
import { TermHeading, TermTooltip } from "../components/TermTooltip";
import { IndicateurChartView } from "../components/indicateurs/IndicateurChartView";
import { DrillDownPanel } from "../components/indicateurs/DrillDownPanel";
import { IndicateurSectionNav } from "../components/indicateurs/IndicateurSectionNav";
import { FlashNotice } from "../components/FlashNotice";
import {
  getIndicateurSection,
  isIndicateurSectionId,
  type ChartPoint,
  type IndicateurChart,
} from "../data/indicateurs";
import { DEFAULT_PAGE_FILTERS, type PageFilters } from "../lib/filters";
import {
  exportIndicateurSectionExcel,
  exportIndicateurSectionPdf,
  snapshotPayloadForSection,
} from "../lib/export-reports";
import { formatSnapshotNotice, saveSnapshot } from "../lib/snapshots";
import { useExportActions, useFlashNotice } from "../hooks/useExportActions";

type DrillSelection = {
  chart: IndicateurChart;
  point: ChartPoint;
};

export function IndicateursPage() {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const activeId = sectionId && isIndicateurSectionId(sectionId) ? sectionId : "1";
  const section = getIndicateurSection(activeId)!;
  const [drill, setDrill] = useState<DrillSelection | null>(null);
  const [filters, setFilters] = useState<PageFilters>(DEFAULT_PAGE_FILTERS);
  const { message, severity, showSuccess, showError, dismiss } = useFlashNotice();
  const runExport = useExportActions(showError);

  const summaryCards = useMemo(() => section.summary, [section]);
  const scopeLabel = `Section ${section.catalogNumber} — ${section.navTitle}`;

  if (sectionId && !isIndicateurSectionId(sectionId)) {
    return <Navigate to="/indicateurs/1" replace />;
  }

  function handleSelect(chart: IndicateurChart, point: ChartPoint) {
    setDrill({ chart, point });
  }

  function handleSummaryClick(item: (typeof section.summary)[number]) {
    if (!item.dossierIds?.length) return;
    setDrill({
      chart: { id: "summary", title: item.label, kind: "bar", data: [] },
      point: { label: item.label, value: 0, dossierIds: item.dossierIds },
    });
  }

  function handleExportSectionPdf(currentFilters: PageFilters) {
    runExport(() => exportIndicateurSectionPdf(section, currentFilters));
  }

  function handleExportSectionExcel(currentFilters: PageFilters) {
    runExport(() => exportIndicateurSectionExcel(section, currentFilters));
  }

  function handleSnapshot(currentFilters: PageFilters) {
    void saveSnapshot({
      kind: "indicateur-section",
      label: `${scopeLabel} (${currentFilters.periodeLabel} · ${currentFilters.poleLabel})`,
      filters: currentFilters,
      data: snapshotPayloadForSection(section, currentFilters),
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
            Sections 1 à 8 du catalogue indicateurs — graphiques et exploration par dossier.
            La section 9 (KPI direction) est sur une page dédiée.
          </p>
        </div>
        <div className="lulu-page-header__actions">
          <GlobalFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      <div className="fr-callout fr-callout--blue-cumulus fr-mb-4w">
        <p className="fr-callout__title fr-callout__title--blue-cumulus">
          <ListMagnifyingGlass
            weight="duotone"
            size={22}
            aria-hidden
            className="lulu-callout-icon"
          />
          Exploration détaillée
        </p>
        <p className="fr-callout__text fr-mb-0">
          Cliquez sur une <strong>barre</strong>, un <strong>segment</strong> ou un{" "}
          <strong>point</strong> du graphique pour afficher les dossiers concernés. Vous pouvez
          aussi cliquer sur une carte récapitulative lorsqu&apos;elle est surlignée. Le lien « Voir
          dans la liste des dossiers » ouvre la liste pré-filtrée.
        </p>
      </div>

      <IndicateurSectionNav activeId={activeId} onNavigate={() => setDrill(null)} />

      <div className="lulu-indicateurs__content">
        <header className="fr-mb-4w lulu-indicateurs__section-header">
          <p className="fr-text--xs fr-text--mention fr-mb-1w">
            Section {section.catalogNumber} du catalogue
          </p>
          <div className="lulu-indicateurs__section-heading">
            <TermHeading as="h2" className="fr-h4 fr-mb-0" term={section.term}>
              {section.navTitle}
            </TermHeading>
            <ExportMenu
              filters={filters}
              scopeLabel={scopeLabel}
              onExportPdf={handleExportSectionPdf}
              onExportExcel={handleExportSectionExcel}
              onSnapshot={handleSnapshot}
            />
          </div>
          <p className="fr-text--md fr-mb-0 fr-mt-2w">{section.description}</p>
        </header>

        <div className="lulu-stats-grid fr-mb-4w">
          {summaryCards.map((item) => {
            const clickable = Boolean(item.dossierIds?.length);
            return (
              <article
                key={item.label}
                className={`fr-tile fr-p-3w ${clickable ? "lulu-summary-card--clickable" : ""}`}
              >
                {clickable ? (
                  <button
                    type="button"
                    className="lulu-summary-card__btn"
                    onClick={() => handleSummaryClick(item)}
                  >
                    <span className="lulu-term-label__row">
                      <span className="fr-tile__title fr-text--sm">{item.label}</span>
                      {item.term ? <TermTooltip term={item.term} /> : null}
                    </span>
                    <p className="fr-display--sm fr-mb-0">{item.value}</p>
                    <span className="fr-text--xs fr-text--mention">Cliquer pour explorer →</span>
                  </button>
                ) : (
                  <>
                    <span className="lulu-term-label__row">
                      <span className="fr-tile__title fr-text--sm">{item.label}</span>
                      {item.term ? <TermTooltip term={item.term} /> : null}
                    </span>
                    <p className="fr-display--sm fr-mb-0">{item.value}</p>
                  </>
                )}
              </article>
            );
          })}
        </div>

        <div className="lulu-indicateurs__charts">
          {section.charts.map((chart) => (
            <IndicateurChartView
              key={chart.id}
              chart={chart}
              selectedLabel={drill?.chart.id === chart.id ? drill.point.label : null}
              onSelect={(point) => handleSelect(chart, point)}
            />
          ))}
        </div>

        {drill ? (
          <DrillDownPanel
            sectionLabel={`Section ${section.catalogNumber} — ${section.navTitle}`}
            chartTitle={drill.chart.title}
            point={drill.point}
            onClose={() => setDrill(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
