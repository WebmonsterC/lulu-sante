/** Définitions métier — glossaire CDF §16 + termes UI. */
export const GLOSSARY = {
  aprs: {
    title: "APRS",
    definition:
      "Absences pour raison de santé — cellule RH spécialisée dans le suivi des agents en arrêt maladie et parcours associés.",
  },
  dossier_aprs: {
    title: "Dossier APRS",
    definition:
      "Dossier de suivi regroupant les arrêts, démarches CM/MT, maintien en emploi et parcours de reclassement d'un agent.",
  },
  como: {
    title: "COM / COMO",
    definition: "Congé maladie ordinaire — arrêt de courte durée pour raison de santé.",
  },
  clml: {
    title: "CLM / CLML",
    definition:
      "Congé longue maladie — absence prolongée ouvrant droit à un examen par le conseil médical.",
  },
  cld: {
    title: "CLD",
    definition:
      "Congé longue durée — prolongation du parcours après avis du conseil médical (jusqu'à 5 ans).",
  },
  citis: {
    title: "CITIS",
    definition:
      "Congé pour Invalidité Temporaire Imputable au Service — lien établi entre la pathologie et le service.",
  },
  tpt: {
    title: "TPT",
    definition:
      "Temps partiel thérapeutique — aménagement de temps de travail à visée médicale.",
  },
  do: {
    title: "DO",
    definition:
      "Disponibilité d'office pour raison de santé — position statutaire après épuisement des droits à congé maladie.",
  },
  ppr: {
    title: "PPR",
    definition:
      "Parcours de reclassement professionnel — accompagnement et formation visant une réorientation ou un nouveau poste.",
  },
  cm: {
    title: "Conseil médical",
    definition:
      "Instance médicale consultée pour avis sur la capacité de l'agent à reprendre ou poursuivre son activité.",
  },
  mt: {
    title: "Médecine du travail",
    definition:
      "Service médical évaluant l'aptitude au poste, au métier et les risques professionnels.",
  },
  kpi: {
    title: "KPI",
    definition: "Key Performance Indicator — indicateur de pilotage pour la direction et le comité de suivi.",
  },
  saisine: {
    title: "Saisine",
    definition:
      "Demande d'avis adressée au conseil médical sur l'état de santé et la situation d'un agent.",
  },
  delai_instruction: {
    title: "Délai d'instruction",
    definition:
      "Nombre de jours entre la date de saisine et la date de l'avis du conseil médical.",
  },
  favr: {
    title: "Avis favorable",
    definition: "Le conseil médical estime que l'agent peut reprendre ou maintenir son activité.",
  },
  defa: {
    title: "Avis défavorable",
    definition:
      "Le conseil médical estime que l'agent ne peut pas reprendre dans les conditions actuelles.",
  },
  surs: {
    title: "Sursis",
    definition:
      "Le conseil médical reporte sa décision en attendant des éléments complémentaires ou une évolution.",
  },
  visite_mt: {
    title: "Visite MT",
    definition:
      "Consultation en médecine du travail pour évaluer l'aptitude au poste ou au métier.",
  },
  aptitu: {
    title: "Aptitude",
    definition: "L'agent est jugé apte à exercer son poste ou métier sans restriction.",
  },
  inapop: {
    title: "Inaptitude au poste",
    definition:
      "L'agent ne peut plus occuper son poste actuel mais pourrait être maintenu avec aménagement ou reclassement.",
  },
  inapmt: {
    title: "Inaptitude au métier",
    definition:
      "L'agent ne peut plus exercer son métier — ouvre généralement un parcours PPR ou une réorientation.",
  },
  reclmt: {
    title: "Reclassement (MT)",
    definition: "Avis orientant l'agent vers un reclassement ou un parcours de reconversion.",
  },
  maintien: {
    title: "Maintien en emploi",
    definition:
      "Actions visant à conserver l'agent dans l'emploi : aménagement de poste, TPT, formation adaptée.",
  },
  reclassement_reussi: {
    title: "Reclassement réussi",
    definition:
      "L'agent a été affecté à un nouveau poste — enregistré par une date d'affectation sur le parcours PPR (KPI D5).",
  },
  jours_ouvrables: {
    title: "Jours ouvrables",
    definition:
      "Jours comptabilisés hors week-ends et jours fériés pour mesurer la durée d'un arrêt.",
  },
  absenteeisme: {
    title: "Absentéisme",
    definition:
      "Mesure du volume d'absences pour raison de santé rapporté à l'effectif ou au temps de travail.",
  },
  date_reception_arret: {
    title: "Date réception arrêt",
    definition:
      "Date à laquelle le service APRS reçoit le certificat médical initial ou de prolongation.",
  },
  date_creation_dossier: {
    title: "Date création dossier",
    definition: "Date d'ouverture officielle du dossier APRS dans l'application.",
  },
  pole: {
    title: "Pôle",
    definition:
      "Unité clinique ou direction du CHUM à laquelle l'agent est rattaché administrativement.",
  },
  type_absence: {
    title: "Type d'absence",
    definition:
      "Statut RH de l'arrêt : maladie ordinaire, longue maladie, longue durée, CITIS, etc.",
  },
  retraite: {
    title: "Retraite",
    definition:
      "Sortie définitive de l'emploi public pour limite d'âge, retraite anticipée ou invalidité.",
  },
  indicateurs_4a: {
    title: "Indicateurs section 4a",
    definition: "Indicateurs liés au conseil médical : saisines, délais, avis favorables/défavorables.",
  },
  indicateurs_4b: {
    title: "Indicateurs section 4b",
    definition: "Indicateurs liés à la médecine du travail : visites, inaptitudes, délais.",
  },
  indicateurs_8: {
    title: "Indicateurs section 8",
    definition: "Indicateurs de suivi des parcours PPR : entrées, durées, taux de reclassement.",
  },
  indicateurs_9: {
    title: "Indicateurs section 9",
    definition:
      "KPIs de direction remontant en comité : absentéisme, délais, retours emploi, reclassement.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;

export function getGlossaryTerm(key: GlossaryKey) {
  return GLOSSARY[key];
}
