import { getDossier } from "../data/mock";
import { getIndicateurSection, INDICATEUR_SECTION_KPI } from "../data/indicateurs";
import { linkTo } from "./linkTo";

export const NAV_ITEMS = [
  { text: "Dashboard", to: "/dashboard" },
  { text: "Dossiers", to: "/dossiers" },
  { text: "Indicateurs", to: "/indicateurs" },
  { text: "KPI direction", to: "/kpi" },
  { text: "Exports", to: "/exports" },
  { text: "Administration", to: "/admin" },
] as const;

export const FICHE_TABS = [
  { key: "synthese", label: "Synthèse", segment: "" },
  { key: "arrets", label: "Arrêts", segment: "arrets" },
  { key: "cm", label: "Conseil médical", segment: "cm" },
  { key: "mt", label: "Méd. travail", segment: "mt" },
  { key: "maintien", label: "Maintien", segment: "maintien" },
  { key: "ppr", label: "PPR", segment: "ppr" },
  { key: "retraite", label: "Retraite", segment: "retraite" },
] as const;

export type FicheTabKey = (typeof FICHE_TABS)[number]["key"];

export type BreadcrumbSegment = {
  label: string;
  linkProps: ReturnType<typeof linkTo>;
};

export function dossierPath(dossierId: string, tab: FicheTabKey = "synthese"): string {
  const def = FICHE_TABS.find((t) => t.key === tab);
  const segment = def?.segment ?? "";
  return segment ? `/dossiers/${dossierId}/${segment}` : `/dossiers/${dossierId}`;
}

export function pageTitle(pathname: string): string {
  const crumb = buildBreadcrumb(pathname);
  return crumb.currentPageLabel as string;
}

export function parseDossierTab(pathname: string): FicheTabKey {
  const match = pathname.match(/^\/dossiers\/[^/]+\/([^/]+)/);
  if (!match) return "synthese";
  const tab = FICHE_TABS.find((t) => t.segment === match[1]);
  return tab?.key ?? "synthese";
}

export function parseDossierId(pathname: string): string | null {
  const match = pathname.match(/^\/dossiers\/([^/]+)/);
  if (!match) return null;
  return match[1];
}

export function userCreatePath(): string {
  return "/admin/utilisateurs/nouveau";
}

export function userEditPath(userId: string): string {
  return `/admin/utilisateurs/${userId}/modifier`;
}

export function profilePath(): string {
  return "/profil";
}

export function isNavActive(pathname: string, navTo: string): boolean {
  if (pathname === navTo) return true;
  if (navTo === "/dossiers" && pathname.startsWith("/dossiers/")) return true;
  if (navTo === "/indicateurs" && (pathname.startsWith("/indicateurs/") || pathname === "/kpi")) {
    return true;
  }
  if (navTo === "/admin" && pathname.startsWith("/admin")) return true;
  return false;
}

export function buildBreadcrumb(pathname: string): {
  segments: BreadcrumbSegment[];
  currentPageLabel: string;
} {
  const accueil: BreadcrumbSegment = {
    label: "Accueil",
    linkProps: linkTo("/dashboard"),
  };

  const dossierId = parseDossierId(pathname);
  if (dossierId) {
    const tab = parseDossierTab(pathname);
    const tabDef = FICHE_TABS.find((t) => t.key === tab);
    const dossier = getDossier(dossierId);
    const dossierLabel = dossier?.id ?? dossierId;

    const segments: BreadcrumbSegment[] = [
      accueil,
      { label: "Dossiers", linkProps: linkTo("/dossiers") },
    ];

    if (tab === "synthese") {
      return { segments, currentPageLabel: dossierLabel };
    }

    segments.push({
      label: dossierLabel,
      linkProps: linkTo(dossierPath(dossierId, "synthese")),
    });

    return {
      segments,
      currentPageLabel: tabDef?.label ?? "Fiche dossier",
    };
  }

  if (pathname === "/kpi") {
    return {
      segments: [
        accueil,
        { label: "Indicateurs", linkProps: linkTo("/indicateurs/1") },
      ],
      currentPageLabel: `Section ${INDICATEUR_SECTION_KPI.catalogNumber} — ${INDICATEUR_SECTION_KPI.navTitle}`,
    };
  }

  const indicateursMatch = pathname.match(/^\/indicateurs\/([^/]+)$/);
  if (indicateursMatch) {
    const section = getIndicateurSection(indicateursMatch[1]);
    return {
      segments: [
        accueil,
        { label: "Indicateurs", linkProps: linkTo("/indicateurs/1") },
      ],
      currentPageLabel: section ? `Section ${section.catalogNumber} — ${section.navTitle}` : "Indicateurs",
    };
  }

  if (pathname === userCreatePath()) {
    return {
      segments: [accueil, { label: "Administration", linkProps: linkTo("/admin") }],
      currentPageLabel: "Nouvel utilisateur",
    };
  }

  const userEditMatch = pathname.match(/^\/admin\/utilisateurs\/([^/]+)\/modifier$/);
  if (userEditMatch) {
    return {
      segments: [accueil, { label: "Administration", linkProps: linkTo("/admin") }],
      currentPageLabel: "Modifier utilisateur",
    };
  }

  if (pathname === profilePath()) {
    return { segments: [accueil], currentPageLabel: "Mon profil" };
  }

  const sectionTitles: Record<string, { title: string }> = {
    "/dashboard": { title: "Dashboard APRS" },
    "/dossiers": { title: "Dossiers" },
    "/indicateurs": { title: "Indicateurs" },
    "/kpi": { title: "Indicateurs détaillés" },
    "/exports": { title: "Exports" },
    "/admin": { title: "Administration" },
  };

  const entry = sectionTitles[pathname];
  if (entry) {
    return { segments: [accueil], currentPageLabel: entry.title };
  }

  return { segments: [accueil], currentPageLabel: "Lulu Santé" };
}
