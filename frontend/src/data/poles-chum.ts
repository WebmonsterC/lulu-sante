/**
 * Pôles d'activité clinique et médico-technique du CHUM
 * (Centre Hospitalier Universitaire de Martinique).
 *
 * Libellés inspirés de l'annuaire FHF / organigramme public du CHUM.
 * Identifiants CHAR(8) alignés sur `ref_pole` (specs/schema.sql).
 */
export type RefPole = {
  id: string;
  code: string;
  libelle: string;
};

export const POLES_CHUM: RefPole[] = [
  { id: "CHUMBIOL", code: "BIOL", libelle: "Biologie — Pathologie" },
  { id: "CHUMFMET", code: "FMET", libelle: "Femme — Mère — Enfant de territoire" },
  { id: "CHUMGERI", code: "GERI", libelle: "Gériatrie — Gérontologie" },
  { id: "CHUMIMGM", code: "IMGM", libelle: "Imagerie médicale" },
  { id: "CHUMNEUR", code: "NEUR", libelle: "Neurosciences — Appareil locomoteur" },
  { id: "CHUMPDIG", code: "PDIG", libelle: "Pathologies digestives" },
  { id: "CHUMPALL", code: "PALL", libelle: "Soins palliatifs" },
  { id: "CHUMURGE", code: "URGE", libelle: "Médecine d'urgence" },
];

export const ETABLISSEMENT = {
  nom: "CHUM",
  libelle: "Centre Hospitalier Universitaire de Martinique",
  site: "Fort-de-France",
} as const;

export function getPole(poleId: string): RefPole | undefined {
  return POLES_CHUM.find((p) => p.id === poleId);
}

export function getPoleLibelle(poleId: string): string {
  return getPole(poleId)?.libelle ?? poleId;
}

export function getPoleCode(poleId: string): string {
  return getPole(poleId)?.code ?? poleId;
}
