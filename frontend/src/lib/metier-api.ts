import { apiGet, apiPut } from "./api-client";
import type { MetierBundle } from "../data/runtime-metier";

const KEY_MAP: Record<keyof MetierBundle, string> = {
  agents: "agents",
  dossiers: "dossiers",
  alertes: "alertes",
  arrets: "arrets",
  saisinesCm: "saisines_cm",
  visitesMt: "visites_mt",
  parcoursPpr: "parcours_ppr",
  chronologie: "chronologie",
  kpiDirection: "kpi_direction",
};

export async function fetchMetierBundle(): Promise<MetierBundle> {
  return apiGet<MetierBundle>("/api/metier");
}

export async function saveMetierKey<K extends keyof MetierBundle>(
  key: K,
  value: MetierBundle[K],
): Promise<MetierBundle> {
  return apiPut<MetierBundle>(`/api/metier/${KEY_MAP[key]}`, value);
}
