import { useState } from "react";
import {
  ChartBar,
  ChartLineUp,
  Export,
  Folders,
  SquaresFour,
} from "@phosphor-icons/react";
import { FlashNotice } from "../components/FlashNotice";
import { GlobalFilters } from "../components/GlobalFilters";
import { ExportScopeCard } from "../components/ExportScopeCard";
import { DEFAULT_PAGE_FILTERS, type PageFilters } from "../lib/filters";
import {
  exportDashboardExcel,
  exportDashboardPdf,
  exportDossiersExcel,
  exportDossiersPdf,
  exportIndicateurCatalogExcel,
  exportIndicateurCatalogPdf,
  exportKpiExcel,
  exportKpiPdf,
  snapshotPayloadForCatalog,
  snapshotPayloadForDashboard,
  snapshotPayloadForKpi,
} from "../lib/export-reports";
import { formatSnapshotNotice, saveSnapshot } from "../lib/snapshots";
import { useExportActions, useFlashNotice } from "../hooks/useExportActions";

const EXPORT_SCOPES = [
  {
    id: "dashboard",
    label: "Dashboard APRS",
    description: "Synthèse des 9 indicateurs stratégiques et tableau des alertes.",
    scopeLabel: "Dashboard APRS",
    actionHint: "Vue synthétique",
    icon: <SquaresFour weight="duotone" size={28} />,
    exportPdf: exportDashboardPdf,
    exportExcel: exportDashboardExcel,
    snapshotLabel: "Dashboard APRS",
    snapshotKind: "dashboard" as const,
    snapshotData: snapshotPayloadForDashboard,
  },
  {
    id: "indicateurs",
    label: "Catalogue indicateurs",
    description: "Sections 1 à 8 du catalogue et KPI direction (section 9).",
    scopeLabel: "Catalogue indicateurs (§1–§9)",
    actionHint: "Catalogue complet",
    icon: <ChartBar weight="duotone" size={28} />,
    exportPdf: exportIndicateurCatalogPdf,
    exportExcel: exportIndicateurCatalogExcel,
    snapshotLabel: "Catalogue indicateurs",
    snapshotKind: "indicateur-catalog" as const,
    snapshotData: snapshotPayloadForCatalog,
  },
  {
    id: "dossiers",
    label: "Liste dossiers",
    description: "Extraction de la liste courante des dossiers APRS (mock).",
    scopeLabel: "Liste dossiers APRS",
    actionHint: "Liste filtrée",
    icon: <Folders weight="duotone" size={28} />,
    exportPdf: exportDossiersPdf,
    exportExcel: exportDossiersExcel,
    includeSnapshot: false,
  },
  {
    id: "kpi",
    label: "KPI direction",
    description: "Tableau comité de direction — section 9, comparaison N−1 et objectifs.",
    scopeLabel: "Section 9 — KPI direction",
    actionHint: "Comité de direction",
    icon: <ChartLineUp weight="duotone" size={28} />,
    exportPdf: exportKpiPdf,
    exportExcel: exportKpiExcel,
    snapshotLabel: "KPI direction",
    snapshotKind: "kpi" as const,
    snapshotData: snapshotPayloadForKpi,
  },
] as const;

export function ExportsPage() {
  const [filters, setFilters] = useState<PageFilters>(DEFAULT_PAGE_FILTERS);
  const { message, severity, showSuccess, showError, dismiss } = useFlashNotice();
  const runExport = useExportActions(showError);

  function handleExportPdf(
    exportFn: (filters: PageFilters) => void,
    currentFilters: PageFilters,
  ) {
    runExport(() => exportFn(currentFilters));
  }

  function handleExportExcel(
    exportFn: (filters: PageFilters) => void,
    currentFilters: PageFilters,
  ) {
    runExport(() => exportFn(currentFilters));
  }

  function handleSnapshot(
    scope: (typeof EXPORT_SCOPES)[number],
    currentFilters: PageFilters,
  ) {
    if (!("snapshotLabel" in scope) || !scope.snapshotLabel || !scope.snapshotData) return;

    void saveSnapshot({
      kind: scope.snapshotKind,
      label: `${scope.snapshotLabel} (${currentFilters.periodeLabel} · ${currentFilters.poleLabel})`,
      filters: currentFilters,
      data: scope.snapshotData(currentFilters),
    }).then(({ record, total }) => {
      showSuccess(formatSnapshotNotice(record, total));
    }).catch((err) => {
      showError(err instanceof Error ? err.message : "Snapshot impossible.");
    });
  }

  return (
    <div className="fr-mt-3w lulu-exports">
      <FlashNotice message={message} severity={severity} onClose={dismiss} />

      <div className="lulu-page-header">
        <div className="lulu-page-header__title">
          <h1 className="fr-h3">Exports</h1>
          <p className="fr-text--sm fr-text--mention">
            Génération de rapports PDF ou tableur CSV pour la direction et l&apos;archivage.
          </p>
        </div>
        <div className="lulu-page-header__actions">
          <GlobalFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      <div className="fr-callout fr-callout--blue-cumulus fr-mb-4w">
        <p className="fr-callout__title fr-callout__title--blue-cumulus">
          <Export weight="duotone" size={22} aria-hidden className="lulu-callout-icon" />
          Formats disponibles
        </p>
        <p className="fr-callout__text fr-mb-0">
          Le <strong>PDF</strong> ouvre une fenêtre d&apos;impression du navigateur (Enregistrer en
          PDF). L&apos; <strong>Excel</strong> télécharge un fichier CSV compatible Excel. Le{" "}
          <strong>snapshot</strong> fige les valeurs pour la période et le pôle sélectionnés.
        </p>
      </div>

      <div className="lulu-export-scopes">
        {EXPORT_SCOPES.map((scope) => (
          <ExportScopeCard
            key={scope.id}
            icon={scope.icon}
            label={scope.label}
            description={scope.description}
            filters={filters}
            scopeLabel={scope.scopeLabel}
            actionHint={scope.actionHint}
            includeSnapshot={"includeSnapshot" in scope ? scope.includeSnapshot : true}
            onExportPdf={(currentFilters) => handleExportPdf(scope.exportPdf, currentFilters)}
            onExportExcel={(currentFilters) => handleExportExcel(scope.exportExcel, currentFilters)}
            onSnapshot={
              "snapshotLabel" in scope
                ? (currentFilters) => handleSnapshot(scope, currentFilters)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
