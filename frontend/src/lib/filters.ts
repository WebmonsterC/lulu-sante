import { POLES_CHUM } from "../data/poles-chum";

const PERIODE_LABELS: Record<string, string> = {
  mai: "Mai 2026",
  avril: "Avril 2026",
};

export type PageFilters = {
  periodeKey: string;
  periodeLabel: string;
  poleId: string;
  poleLabel: string;
};

export function buildPageFilters(periodeKey: string, poleId: string): PageFilters {
  const pole = POLES_CHUM.find((p) => p.id === poleId);

  return {
    periodeKey,
    periodeLabel: PERIODE_LABELS[periodeKey] ?? periodeKey,
    poleId,
    poleLabel: pole?.libelle ?? "Tous les pôles",
  };
}

export const DEFAULT_PAGE_FILTERS = buildPageFilters("mai", "");

export function readPageFilters(): PageFilters {
  const periodeEl = document.getElementById("filtre-periode") as HTMLSelectElement | null;
  const poleEl = document.getElementById("filtre-pole") as HTMLSelectElement | null;

  return buildPageFilters(periodeEl?.value ?? "mai", poleEl?.value ?? "");
}
