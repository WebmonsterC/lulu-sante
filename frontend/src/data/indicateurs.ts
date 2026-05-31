import type { GlossaryKey } from "./glossary";

export type IndicateurSectionId = "1" | "2" | "3" | "4a" | "4b" | "5" | "6" | "7" | "8";

export type ChartKind = "bar" | "pie" | "line";

export type ChartPoint = {
  label: string;
  value: number;
  /** Dossiers concernés par ce segment (drill-down). */
  dossierIds: string[];
};

export type IndicateurChart = {
  id: string;
  title: string;
  kind: ChartKind;
  unit?: string;
  data: ChartPoint[];
};

export type IndicateurSummary = {
  label: string;
  value: string;
  term?: GlossaryKey;
  dossierIds?: string[];
};

export type IndicateurSection = {
  id: IndicateurSectionId;
  /** Libellé complet affiché en titre de section. */
  label: string;
  /** Numéro dans le catalogue README (ex. « 4a », « 9 »). */
  catalogNumber: string;
  /** Titre court pour la grille de navigation. */
  navTitle: string;
  description: string;
  term?: GlossaryKey;
  summary: IndicateurSummary[];
  charts: IndicateurChart[];
};

/** Section 9 du catalogue = KPI direction (page dédiée). */
export const INDICATEUR_SECTION_KPI = {
  catalogNumber: "9",
  navTitle: "KPI direction",
  href: "/kpi",
  description:
    "Indicateurs remontant en comité de direction : comparaison avec la période précédente (N−1) et objectifs (↑ augmenter, ↓ diminuer).",
  term: "indicateurs_9" as GlossaryKey,
} as const;

export type IndicateurNavActiveId = IndicateurSectionId | "kpi";

/** Couleurs chart alignées DSFR (Marianne). */
export const CHART_COLORS = [
  "#000091",
  "#0063cb",
  "#2975d9",
  "#465f9d",
  "#929292",
  "#ce0500",
  "#18753c",
  "#fe5815",
];

export const INDICATEUR_SECTIONS: IndicateurSection[] = [
  {
    id: "1",
    catalogNumber: "1",
    navTitle: "Activité",
    label: "Section 1 — Activité",
    term: "dossier_aprs",
    description:
      "Volume de dossiers suivis : actifs, ouvertures et clôtures sur la période, répartition par type d'absence et par pôle.",
    summary: [
      { label: "Dossiers actifs", value: "287", term: "dossier_aprs", dossierIds: ["DOS-2026-0142", "DOS-2026-0088", "DOS-2025-0891", "DOS-2026-0101"] },
      { label: "Nouveaux ce mois", value: "24", dossierIds: ["DOS-2026-0142", "DOS-2026-0088", "DOS-2026-0101"] },
      { label: "Clôturés ce mois", value: "11", dossierIds: ["DOS-2025-0440"] },
    ],
    charts: [
      {
        id: "activite-type",
        title: "Répartition par type d'absence",
        kind: "pie",
        data: [
          { label: "COMO", value: 98, dossierIds: ["DOS-2026-0088", "DOS-2025-1200"] },
          { label: "CLML", value: 112, dossierIds: ["DOS-2026-0142", "DOS-2025-0891"] },
          { label: "CLD", value: 45, dossierIds: ["DOS-2025-0440"] },
          { label: "CITIS", value: 32, dossierIds: ["DOS-2026-0101"] },
        ],
      },
      {
        id: "activite-pole",
        title: "Dossiers actifs par pôle",
        kind: "bar",
        unit: "dossiers",
        data: [
          { label: "Neuro", value: 42, dossierIds: ["DOS-2026-0142"] },
          { label: "FMET", value: 38, dossierIds: ["DOS-2026-0088"] },
          { label: "Gériatrie", value: 35, dossierIds: ["DOS-2025-0891"] },
          { label: "IMG", value: 28, dossierIds: [] },
          { label: "Biologie", value: 22, dossierIds: ["DOS-2026-0101"] },
        ],
      },
    ],
  },
  {
    id: "2",
    catalogNumber: "2",
    navTitle: "Absentéisme",
    label: "Section 2 — Absentéisme",
    term: "absenteeisme",
    description:
      "Mesure du volume d'absences : taux global, jours d'absence et répartition par tranche de durée d'arrêt.",
    summary: [
      { label: "Taux global", value: "4,2 %", term: "absenteeisme" },
      { label: "Jours d'absence (mois)", value: "1 240 j", term: "jours_ouvrables" },
      { label: "Durée moyenne arrêt", value: "38 j", term: "jours_ouvrables", dossierIds: ["DOS-2026-0142", "DOS-2026-0088", "DOS-2025-0891"] },
    ],
    charts: [
      {
        id: "absenteisme-tranches",
        title: "Agents par tranche de durée d'arrêt",
        kind: "bar",
        unit: "agents",
        data: [
          { label: "< 30 j", value: 124, dossierIds: ["DOS-2026-0088"] },
          { label: "30 – 90 j", value: 86, dossierIds: [] },
          { label: "90 – 180 j", value: 54, dossierIds: [] },
          { label: "> 180 j", value: 63, dossierIds: ["DOS-2026-0142", "DOS-2025-0891"] },
        ],
      },
      {
        id: "absenteisme-evolution",
        title: "Évolution du taux d'absentéisme",
        kind: "line",
        unit: "%",
        data: [
          { label: "Jan", value: 4.8, dossierIds: [] },
          { label: "Fév", value: 4.6, dossierIds: [] },
          { label: "Mar", value: 4.5, dossierIds: [] },
          { label: "Avr", value: 4.3, dossierIds: [] },
          { label: "Mai", value: 4.2, dossierIds: ["DOS-2026-0142", "DOS-2026-0088", "DOS-2025-0891"] },
        ],
      },
    ],
  },
  {
    id: "3",
    catalogNumber: "3",
    navTitle: "Gestion RH",
    label: "Section 3 — Gestion RH",
    description:
      "Performance du service APRS : délais d'ouverture et de traitement, complétude et dossiers en attente.",
    summary: [
      { label: "Délai ouverture moyen", value: "2,4 j", dossierIds: ["DOS-2026-0142"] },
      { label: "Délai traitement moyen", value: "12 j", dossierIds: ["DOS-2026-0142", "DOS-2025-0891"] },
      { label: "Dossiers complets", value: "78 %", dossierIds: ["DOS-2026-0088", "DOS-2025-0440"] },
    ],
    charts: [
      {
        id: "gestion-attente",
        title: "Dossiers en attente par motif",
        kind: "bar",
        unit: "dossiers",
        data: [
          { label: "Avis CM", value: 14, dossierIds: ["DOS-2026-0142"] },
          { label: "Visite MT", value: 8, dossierIds: ["DOS-2026-0088"] },
          { label: "Expertise", value: 5, dossierIds: [] },
          { label: "Décision admin.", value: 3, dossierIds: ["DOS-2025-0891"] },
        ],
      },
      {
        id: "gestion-completude",
        title: "Complétude des dossiers actifs",
        kind: "pie",
        data: [
          { label: "Complets", value: 224, dossierIds: ["DOS-2026-0088"] },
          { label: "Incomplets", value: 63, dossierIds: ["DOS-2026-0142", "DOS-2025-0891"] },
        ],
      },
    ],
  },
  {
    id: "4a",
    catalogNumber: "4a",
    navTitle: "Conseil médical",
    label: "Section 4a — Conseil médical",
    term: "indicateurs_4a",
    description:
      "Activité du conseil médical : saisines, délais d'instruction et répartition des avis (favorable, défavorable, sursis).",
    summary: [
      { label: "Saisines (mois)", value: "8", term: "saisine", dossierIds: ["DOS-2026-0142"] },
      { label: "Délai instruction moyen", value: "26 j", term: "delai_instruction", dossierIds: ["DOS-2026-0142"] },
      { label: "Avis en attente", value: "3", dossierIds: ["DOS-2026-0142"] },
    ],
    charts: [
      {
        id: "cm-resultats",
        title: "Répartition des avis CM",
        kind: "pie",
        data: [
          { label: "Favorable", value: 42, dossierIds: ["DOS-2026-0142"], },
          { label: "Défavorable", value: 8, dossierIds: [] },
          { label: "Sursis", value: 5, dossierIds: [] },
          { label: "En attente", value: 3, dossierIds: ["DOS-2026-0142"] },
        ],
      },
      {
        id: "cm-evolution",
        title: "Saisines par mois",
        kind: "bar",
        unit: "saisines",
        data: [
          { label: "Jan", value: 6, dossierIds: [] },
          { label: "Fév", value: 9, dossierIds: ["DOS-2026-0142"] },
          { label: "Mar", value: 7, dossierIds: [] },
          { label: "Avr", value: 10, dossierIds: [] },
          { label: "Mai", value: 8, dossierIds: ["DOS-2026-0142"] },
        ],
      },
    ],
  },
  {
    id: "4b",
    catalogNumber: "4b",
    navTitle: "Médecine du travail",
    label: "Section 4b — Médecine du travail",
    term: "indicateurs_4b",
    description:
      "Suivi des visites en médecine du travail : aptitudes, inaptitudes au poste ou au métier, orientations reclassement.",
    summary: [
      { label: "Visites (mois)", value: "14", term: "visite_mt", dossierIds: ["DOS-2026-0142"] },
      { label: "Inaptitudes métier", value: "4", term: "inapmt", dossierIds: [] },
      { label: "Inaptitudes poste", value: "9", term: "inapop", dossierIds: ["DOS-2026-0142"] },
    ],
    charts: [
      {
        id: "mt-avis",
        title: "Types d'avis MT",
        kind: "pie",
        data: [
          { label: "Aptitude", value: 52, dossierIds: ["DOS-2026-0142"] },
          { label: "Inap. poste", value: 28, dossierIds: ["DOS-2026-0142"] },
          { label: "Inap. métier", value: 12, dossierIds: [] },
          { label: "Reclassement", value: 8, dossierIds: [] },
        ],
      },
      {
        id: "mt-retard",
        title: "Visites en retard vs planifiées",
        kind: "bar",
        unit: "visites",
        data: [
          { label: "À jour", value: 126, dossierIds: ["DOS-2026-0142"] },
          { label: "En retard", value: 8, dossierIds: ["DOS-2026-0088"] },
        ],
      },
    ],
  },
  {
    id: "5",
    catalogNumber: "5",
    navTitle: "Retour emploi",
    label: "Section 5 — Retour emploi",
    description:
      "Mesure des reprises : retour au poste, reprise durable et modalités (temps plein, TPT, reclassement).",
    summary: [
      { label: "Taux retour emploi", value: "68 %", term: "maintien" },
      { label: "Reprise durable 12 m", value: "41 %" },
      { label: "Rechutes (6 m)", value: "9 %" },
    ],
    charts: [
      {
        id: "retour-modalites",
        title: "Reprises par modalité",
        kind: "bar",
        unit: "agents",
        data: [
          { label: "Temps plein", value: 45, dossierIds: ["DOS-2025-0440"] },
          { label: "TPT", value: 18, dossierIds: [] },
          { label: "Reclassement", value: 22, dossierIds: ["DOS-2026-0142"] },
        ],
      },
      {
        id: "retour-evolution",
        title: "Taux de retour emploi (évolution)",
        kind: "line",
        unit: "%",
        data: [
          { label: "Jan", value: 62, dossierIds: [] },
          { label: "Fév", value: 64, dossierIds: [] },
          { label: "Mar", value: 65, dossierIds: [] },
          { label: "Avr", value: 66, dossierIds: [] },
          { label: "Mai", value: 68, dossierIds: ["DOS-2025-0440"] },
        ],
      },
    ],
  },
  {
    id: "6",
    catalogNumber: "6",
    navTitle: "Maintien",
    label: "Section 6 — Maintien en emploi",
    term: "maintien",
    description:
      "Actions de maintien en emploi : études de poste, aménagements, orientations (MT, ergonomie, FIPHFP…).",
    summary: [
      { label: "Études de poste", value: "12", term: "maintien" },
      { label: "Aménagements actifs", value: "19", term: "tpt" },
      { label: "Orientations FIPHFP", value: "7" },
    ],
    charts: [
      {
        id: "maintien-actions",
        title: "Actions de maintien réalisées",
        kind: "bar",
        unit: "actions",
        data: [
          { label: "Aménagement", value: 19, dossierIds: ["DOS-2026-0142"] },
          { label: "TPT", value: 14, dossierIds: [] },
          { label: "Ergonomie", value: 8, dossierIds: [] },
          { label: "Formation", value: 6, dossierIds: [] },
        ],
      },
      {
        id: "maintien-orientations",
        title: "Orientations par filière",
        kind: "pie",
        data: [
          { label: "Médecine travail", value: 24, dossierIds: ["DOS-2026-0142"] },
          { label: "Ergonomie", value: 18, dossierIds: [] },
          { label: "FIPHFP", value: 12, dossierIds: [] },
          { label: "Psy / social", value: 9, dossierIds: [] },
        ],
      },
    ],
  },
  {
    id: "7",
    catalogNumber: "7",
    navTitle: "Retraite",
    label: "Section 7 — Retraite",
    term: "retraite",
    description:
      "Départs à la retraite liés à la santé : volume, motifs et délais entre décision et départ effectif.",
    summary: [
      { label: "Départs (mois)", value: "6", term: "retraite", dossierIds: ["DOS-2025-0440"] },
      { label: "Dossiers en préparation", value: "4", dossierIds: [] },
      { label: "Délai moyen traitement", value: "45 j" },
    ],
    charts: [
      {
        id: "retraite-motifs",
        title: "Répartition par motif de départ",
        kind: "pie",
        data: [
          { label: "Âge limite", value: 18, dossierIds: ["DOS-2025-0440"] },
          { label: "Anticipée handicap", value: 6, dossierIds: [] },
          { label: "Invalidité", value: 4, dossierIds: [] },
          { label: "Autre (santé)", value: 3, dossierIds: [] },
        ],
      },
      {
        id: "retraite-evolution",
        title: "Départs par mois",
        kind: "bar",
        unit: "départs",
        data: [
          { label: "Jan", value: 4, dossierIds: [] },
          { label: "Fév", value: 5, dossierIds: [] },
          { label: "Mar", value: 7, dossierIds: [] },
          { label: "Avr", value: 5, dossierIds: [] },
          { label: "Mai", value: 6, dossierIds: ["DOS-2025-0440"] },
        ],
      },
    ],
  },
  {
    id: "8",
    catalogNumber: "8",
    navTitle: "PPR",
    label: "Section 8 — Parcours PPR",
    term: "indicateurs_8",
    description:
      "Parcours de reclassement professionnel : entrées, sorties, durées et taux de reclassement réussi (KPI D5).",
    summary: [
      { label: "Parcours ouverts", value: "23", term: "ppr", dossierIds: ["DOS-2026-0142"] },
      { label: "Entrées (mois)", value: "5", dossierIds: ["DOS-2026-0142"] },
      { label: "Reclassement réussi", value: "60 %", term: "reclassement_reussi", dossierIds: ["DOS-2026-0142"] },
    ],
    charts: [
      {
        id: "ppr-flux",
        title: "Flux parcours PPR (mois)",
        kind: "bar",
        unit: "agents",
        data: [
          { label: "Entrées", value: 5, dossierIds: ["DOS-2026-0142"] },
          { label: "Sorties", value: 3, dossierIds: [] },
          { label: "Affectations", value: 2, dossierIds: ["DOS-2026-0142"] },
        ],
      },
      {
        id: "ppr-duree",
        title: "Durée moyenne des parcours (mois)",
        kind: "line",
        unit: "jours",
        data: [
          { label: "Jan", value: 95, dossierIds: [] },
          { label: "Fév", value: 88, dossierIds: [] },
          { label: "Mar", value: 82, dossierIds: ["DOS-2026-0142"] },
          { label: "Avr", value: 79, dossierIds: ["DOS-2026-0142"] },
          { label: "Mai", value: 76, dossierIds: ["DOS-2026-0142"] },
        ],
      },
    ],
  },
];

export function getIndicateurSection(id: string): IndicateurSection | undefined {
  return INDICATEUR_SECTIONS.find((s) => s.id === id);
}

export function isIndicateurSectionId(id: string): id is IndicateurSectionId {
  return INDICATEUR_SECTIONS.some((s) => s.id === id);
}

/** Lien vers la liste dossiers pré-filtrée depuis un drill-down. */
export function buildDrillDownDossiersUrl(params: {
  dossierIds?: string[];
  type?: string;
  statut?: string;
  label?: string;
}): string {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.statut) search.set("statut", params.statut);
  if (params.dossierIds?.length) search.set("ids", params.dossierIds.join(","));
  if (params.label) search.set("drill", params.label);
  const q = search.toString();
  return q ? `/dossiers?${q}` : "/dossiers";
}
