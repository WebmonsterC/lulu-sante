import type { GlossaryKey } from "./glossary";

export const KPI_APRS: Array<{
  label: string;
  value: string;
  trend: string;
  term: GlossaryKey;
}> = [
  { label: "Absentéisme global", value: "4,2 %", trend: "+0,3 pt", term: "absenteeisme" },
  { label: "Durée moyenne d'arrêt", value: "38 j", trend: "−2 j", term: "jours_ouvrables" },
  { label: "Dossiers actifs", value: "287", trend: "+12", term: "dossier_aprs" },
  { label: "Taux de reclassement", value: "62 %", trend: "+5 pt", term: "reclassement_reussi" },
  { label: "Visites MT en retard", value: "8", trend: "−3", term: "visite_mt" },
  { label: "CM à planifier", value: "14", trend: "+2", term: "saisine" },
  { label: "Parcours PPR ouverts", value: "23", trend: "stable", term: "ppr" },
  { label: "Dossiers > 365 j", value: "19", trend: "+1", term: "dossier_aprs" },
  { label: "Agents en CITIS", value: "6", trend: "−1", term: "citis" },
];
