import { KPI_APRS } from "../data/dashboard";
import {
  INDICATEUR_SECTIONS,
  type IndicateurSection,
} from "../data/indicateurs";
import { getRuntimeMetier } from "../data/runtime-metier";
import { agentLabel, getAgent } from "../data/mock";
import type { PageFilters } from "./filters";
import { downloadTextFile, openPrintReport, rowsToCsv } from "./download";

function metierData() {
  const runtime = getRuntimeMetier();
  return {
    dossiers: runtime?.dossiers ?? [],
    alertes: runtime?.alertes ?? [],
    kpiDirection: runtime?.kpiDirection ?? [],
  };
}

function reportMeta(filters: PageFilters): string {
  return `<p class="meta">Période : ${filters.periodeLabel} · Pôle : ${filters.poleLabel}</p>`;
}

function sectionSummaryRows(section: IndicateurSection): (string | number)[][] {
  return [["Indicateur", "Valeur"], ...section.summary.map((s) => [s.label, s.value])];
}

function sectionChartRows(section: IndicateurSection): (string | number)[][] {
  const rows: (string | number)[][] = [];
  for (const chart of section.charts) {
    rows.push([`Graphique — ${chart.title}`, chart.unit ?? ""]);
    rows.push(["Segment", "Valeur"]);
    for (const point of chart.data) {
      rows.push([point.label, point.value]);
    }
    rows.push([]);
  }
  return rows;
}

function sectionToCsv(section: IndicateurSection, filters: PageFilters): string {
  return rowsToCsv([
    [`Section ${section.catalogNumber} — ${section.navTitle}`],
    ["Période", filters.periodeLabel],
    ["Pôle", filters.poleLabel],
    [],
    ...sectionSummaryRows(section),
    [],
    ...sectionChartRows(section),
  ]);
}

function sectionToHtml(section: IndicateurSection, filters: PageFilters): string {
  const summaryTable = `<table><thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead><tbody>${section.summary
    .map((s) => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`)
    .join("")}</tbody></table>`;

  const chartsHtml = section.charts
    .map((chart) => {
      const rows = chart.data
        .map((p) => `<tr><td>${p.label}</td><td>${p.value}${chart.unit ? ` ${chart.unit}` : ""}</td></tr>`)
        .join("");
      return `<h3>${chart.title}</h3><table><thead><tr><th>Segment</th><th>Valeur</th></tr></thead><tbody>${rows}</tbody></table>`;
    })
    .join("");

  return `<h2>Section ${section.catalogNumber} — ${section.navTitle}</h2>
${reportMeta(filters)}
<p>${section.description}</p>
<h3>Synthèse</h3>
${summaryTable}
${chartsHtml}`;
}

export function exportIndicateurSectionExcel(section: IndicateurSection, filters: PageFilters) {
  const filename = `lulu-indicateurs-section-${section.catalogNumber}-${filters.periodeKey}.csv`;
  downloadTextFile(filename, sectionToCsv(section, filters), "text/csv;charset=utf-8");
}

export function exportIndicateurSectionPdf(section: IndicateurSection, filters: PageFilters) {
  const title = `Section ${section.catalogNumber} — ${section.navTitle}`;
  openPrintReport(
    title,
    `<h1>${title}</h1>${reportMeta(filters)}${sectionToHtml(section, filters)}`,
  );
}

export function exportIndicateurCatalogExcel(filters: PageFilters) {
  const parts = INDICATEUR_SECTIONS.map((section) => sectionToCsv(section, filters));
  const kpiPart = rowsToCsv([
    ["Section 9 — KPI direction"],
    ["Période", filters.periodeLabel],
    ["Pôle", filters.poleLabel],
    [],
    ["KPI", "Valeur", "Objectif", "N−1", "Évolution"],
    ...metierData().kpiDirection.map((r) => [r.kpi, r.valeur, r.objectif, r.n1, r.evolution]),
  ]);
  downloadTextFile(
    `lulu-indicateurs-catalogue-${filters.periodeKey}.csv`,
    [...parts, kpiPart].join("\r\n\r\n"),
    "text/csv;charset=utf-8",
  );
}

export function exportIndicateurCatalogPdf(filters: PageFilters) {
  const sectionsHtml = INDICATEUR_SECTIONS.map((s) => sectionToHtml(s, filters)).join("");
  const kpiTable = `<h2>Section 9 — KPI direction</h2>
${reportMeta(filters)}
<table><thead><tr><th>KPI</th><th>Valeur</th><th>Objectif</th><th>N−1</th><th>Évolution</th></tr></thead><tbody>
${metierData().kpiDirection.map((r) => `<tr><td>${r.kpi}</td><td>${r.valeur}</td><td>${r.objectif}</td><td>${r.n1}</td><td>${r.evolution}</td></tr>`).join("")}
</tbody></table>`;

  openPrintReport(
    "Catalogue indicateurs — Lulu Santé",
    `<h1>Catalogue indicateurs (sections 1 à 9)</h1>${reportMeta(filters)}${sectionsHtml}${kpiTable}`,
  );
}

export function exportKpiExcel(filters: PageFilters) {
  downloadTextFile(
    `lulu-kpi-direction-${filters.periodeKey}.csv`,
    rowsToCsv([
      ["Section 9 — KPI direction"],
      ["Période", filters.periodeLabel],
      ["Pôle", filters.poleLabel],
      [],
      ["KPI", "Valeur", "Objectif", "N−1", "Évolution"],
      ...metierData().kpiDirection.map((r) => [r.kpi, r.valeur, r.objectif, r.n1, r.evolution]),
    ]),
    "text/csv;charset=utf-8",
  );
}

export function exportKpiPdf(filters: PageFilters) {
  const table = metierData().kpiDirection.map(
    (r) =>
      `<tr><td>${r.kpi}</td><td>${r.valeur}</td><td>${r.objectif}</td><td>${r.n1}</td><td>${r.evolution}</td></tr>`,
  ).join("");

  openPrintReport(
    "KPI direction — Lulu Santé",
    `<h1>Section 9 — KPIs de direction</h1>
${reportMeta(filters)}
<p>Indicateurs remontant en comité de direction — ${filters.periodeLabel} vs période précédente</p>
<table><thead><tr><th>KPI</th><th>Valeur</th><th>Objectif</th><th>N−1</th><th>Évolution</th></tr></thead><tbody>${table}</tbody></table>`,
  );
}

export function exportDashboardExcel(filters: PageFilters) {
  downloadTextFile(
    `lulu-dashboard-aprs-${filters.periodeKey}.csv`,
    rowsToCsv([
      ["Dashboard APRS"],
      ["Période", filters.periodeLabel],
      ["Pôle", filters.poleLabel],
      [],
      ["Indicateur", "Valeur", "Évolution"],
      ...KPI_APRS.map((k) => [k.label, k.value, k.trend]),
      [],
      ["Alertes"],
      ["Type", "Dossier", "Agent", "Depuis"],
      ...metierData().alertes.map((a) => [a.type, a.dossierId, a.agent, a.depuis]),
    ]),
    "text/csv;charset=utf-8",
  );
}

export function exportDashboardPdf(filters: PageFilters) {
  const kpiRows = KPI_APRS.map(
    (k) => `<tr><td>${k.label}</td><td>${k.value}</td><td>${k.trend}</td></tr>`,
  ).join("");
  const alertRows = metierData().alertes.map(
    (a) => `<tr><td>${a.type}</td><td>${a.dossierId}</td><td>${a.agent}</td><td>${a.depuis}</td></tr>`,
  ).join("");

  openPrintReport(
    "Dashboard APRS — Lulu Santé",
    `<h1>Dashboard APRS</h1>
${reportMeta(filters)}
<h2>Indicateurs stratégiques</h2>
<table><thead><tr><th>Indicateur</th><th>Valeur</th><th>Évolution</th></tr></thead><tbody>${kpiRows}</tbody></table>
<h2>Alertes</h2>
<table><thead><tr><th>Type</th><th>Dossier</th><th>Agent</th><th>Depuis</th></tr></thead><tbody>${alertRows}</tbody></table>`,
  );
}

export function exportDossiersExcel(filters: PageFilters) {
  downloadTextFile(
    `lulu-dossiers-${filters.periodeKey}.csv`,
    rowsToCsv([
      ["Liste dossiers APRS"],
      ["Période", filters.periodeLabel],
      ["Pôle", filters.poleLabel],
      [],
      ["N° dossier", "Agent", "Type absence", "Statut", "Pôle", "Ouverture"],
      ...metierData().dossiers.map((d) => {
        const agent = getAgent(d.agentId);
        return [
          d.id,
          agent ? agentLabel(agent) : d.agentId,
          d.typeLabel,
          d.statut,
          d.poleId,
          d.dateCreation,
        ];
      }),
    ]),
    "text/csv;charset=utf-8",
  );
}

export function exportDossiersPdf(filters: PageFilters) {
  const rows = metierData().dossiers.map((d) => {
    const agent = getAgent(d.agentId);
    return `<tr><td>${d.id}</td><td>${agent ? agentLabel(agent) : d.agentId}</td><td>${d.typeLabel}</td><td>${d.statut}</td><td>${d.dateCreation}</td></tr>`;
  }).join("");

  openPrintReport(
    "Liste dossiers — Lulu Santé",
    `<h1>Liste des dossiers APRS</h1>
${reportMeta(filters)}
<table><thead><tr><th>N° dossier</th><th>Agent</th><th>Type</th><th>Statut</th><th>Ouverture</th></tr></thead><tbody>${rows}</tbody></table>`,
  );
}

export function getExportErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "POPUP_BLOCKED") {
    return "Autorisez les fenêtres pop-up dans votre navigateur pour exporter en PDF.";
  }
  return "L'export a échoué. Réessayez.";
}

export function snapshotPayloadForSection(section: IndicateurSection, filters: PageFilters) {
  return {
    filters,
    section: {
      id: section.id,
      catalogNumber: section.catalogNumber,
      navTitle: section.navTitle,
      summary: section.summary,
      charts: section.charts,
    },
  };
}

export function snapshotPayloadForKpi(filters: PageFilters) {
  return { filters, kpi: metierData().kpiDirection };
}

export function snapshotPayloadForCatalog(filters: PageFilters) {
  return {
    filters,
    sections: INDICATEUR_SECTIONS.map((s) => ({
      id: s.id,
      catalogNumber: s.catalogNumber,
      navTitle: s.navTitle,
      summary: s.summary,
    })),
    kpi: metierData().kpiDirection,
  };
}

export function snapshotPayloadForDashboard(filters: PageFilters) {
  const data = metierData();
  return { filters, kpis: KPI_APRS, alertes: data.alertes };
}
