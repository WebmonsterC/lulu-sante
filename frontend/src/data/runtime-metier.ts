import type {
  Agent,
  Alerte,
  Arret,
  Dossier,
  ParcoursPpr,
  SaisineCm,
  VisiteMt,
} from "./mock";

export type MetierBundle = {
  agents: Agent[];
  dossiers: Dossier[];
  alertes: Alerte[];
  arrets: Arret[];
  saisinesCm: SaisineCm[];
  visitesMt: VisiteMt[];
  parcoursPpr: ParcoursPpr[];
  chronologie: Record<string, string[]>;
  kpiDirection: Array<{
    kpi: string;
    valeur: string;
    objectif: string;
    n1: string;
    evolution: string;
  }>;
};

let runtimeMetier: MetierBundle | null = null;

export function setRuntimeMetier(data: MetierBundle) {
  runtimeMetier = data;
}

export function clearRuntimeMetier() {
  runtimeMetier = null;
}

export function getRuntimeMetier(): MetierBundle | null {
  return runtimeMetier;
}

export function getMetierAgents() {
  return runtimeMetier?.agents ?? [];
}

export function getMetierDossiers() {
  return runtimeMetier?.dossiers ?? [];
}

export function getMetierAlertes() {
  return runtimeMetier?.alertes ?? [];
}

export function getMetierArrets() {
  return runtimeMetier?.arrets ?? [];
}

export function getMetierSaisinesCm() {
  return runtimeMetier?.saisinesCm ?? [];
}

export function getMetierVisitesMt() {
  return runtimeMetier?.visitesMt ?? [];
}

export function getMetierParcoursPpr() {
  return runtimeMetier?.parcoursPpr ?? [];
}

export function getMetierChronologie() {
  return runtimeMetier?.chronologie ?? {};
}

export function getMetierKpiDirection() {
  return runtimeMetier?.kpiDirection ?? [];
}
