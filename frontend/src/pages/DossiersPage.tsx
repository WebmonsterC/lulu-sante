import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { SearchBar } from "../components/SearchBar";
import { TermLabel } from "../components/TermTooltip";
import { useDossierWizard } from "../components/DossierWizardModal";
import { useAppData } from "../context/AppDataContext";
import {
  getAgent,
  agentLabel,
  TYPES_ABSENCE,
  POLES_CHUM,
  getPoleLibelle,
} from "../data/mock";
import { dossierPath } from "../lib/navigation";

export function DossiersPage() {
  const { metier } = useAppData();
  const allDossiers = metier.dossiers;
  const [searchParams] = useSearchParams();
  const drillLabel = searchParams.get("drill");
  const idsParam = searchParams.get("ids");
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState(searchParams.get("statut") ?? "actif");
  const [typeFiltre, setTypeFiltre] = useState(searchParams.get("type") ?? "");
  const [poleFiltre, setPoleFiltre] = useState(searchParams.get("pole") ?? "");
  const drillIds = useMemo(
    () => (idsParam ? idsParam.split(",").filter(Boolean) : null),
    [idsParam],
  );

  useEffect(() => {
    setStatut(searchParams.get("statut") ?? "actif");
    setTypeFiltre(searchParams.get("type") ?? "");
    setPoleFiltre(searchParams.get("pole") ?? "");
  }, [searchParams]);

  const { wizardButtonProps, WizardModal } = useDossierWizard(() => {
    /* prototype : pas de persistance */
  });

  const dossiers = useMemo(() => {
    return allDossiers.filter((d) => {
      const agent = getAgent(d.agentId);
      const label = agent ? agentLabel(agent).toLowerCase() : "";
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        label.includes(q) ||
        agent?.matricule.includes(q);
      const matchStatut = statut === "tous" || d.statut === statut;
      const matchType = !typeFiltre || d.typeAbsence === typeFiltre;
      const matchPole = !poleFiltre || d.poleId === poleFiltre;
      const matchDrill = !drillIds || drillIds.includes(d.id);
      return matchSearch && matchStatut && matchType && matchPole && matchDrill;
    });
  }, [allDossiers, search, statut, typeFiltre, poleFiltre, drillIds]);

  const actifs = allDossiers.filter((d) => d.statut === "actif").length;

  return (
    <div className="fr-mt-3w">
      <div className="lulu-page-header">
        <h1 className="fr-h3">Dossiers</h1>
        <button type="button" className="fr-btn" {...wizardButtonProps}>
          + Nouveau dossier
        </button>
      </div>

      {drillLabel ? (
        <div className="fr-callout fr-callout--blue-cumulus fr-mb-3w">
          <p className="fr-callout__text fr-mb-0">
            Filtre depuis les indicateurs : <strong>{drillLabel}</strong>
            {drillIds ? ` (${drillIds.length} dossier(s))` : ""}
            {" · "}
            <Link className="fr-link fr-link--sm" to="/dossiers">
              Effacer le filtre
            </Link>
          </p>
        </div>
      ) : null}

      <div className="lulu-filter-bar fr-mb-4w">
        <SearchBar
          id="filtre-recherche"
          label="Recherche"
          value={search}
          onChange={setSearch}
          placeholder="Matricule, nom, n° dossier…"
        />
        <div className="fr-select-group lulu-filter-bar__field">
          <label className="fr-label" htmlFor="filtre-statut">
            Statut
          </label>
          <select
            className="fr-select"
            id="filtre-statut"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option value="actif">Actif</option>
            <option value="cloture">Clôturé</option>
            <option value="tous">Tous</option>
          </select>
        </div>
        <div className="fr-select-group lulu-filter-bar__field">
          <TermLabel htmlFor="filtre-type" term="type_absence">
            Type absence
          </TermLabel>
          <select
            className="fr-select"
            id="filtre-type"
            value={typeFiltre}
            onChange={(e) => setTypeFiltre(e.target.value)}
          >
            <option value="">Tous</option>
            {TYPES_ABSENCE.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code}
              </option>
            ))}
          </select>
        </div>
        <div className="fr-select-group lulu-filter-bar__field">
          <TermLabel htmlFor="filtre-pole-dossiers" term="pole">
            Pôle
          </TermLabel>
          <select
            className="fr-select"
            id="filtre-pole-dossiers"
            value={poleFiltre}
            onChange={(e) => setPoleFiltre(e.target.value)}
          >
            <option value="">Tous</option>
            {POLES_CHUM.map((p) => (
              <option key={p.id} value={p.id}>
                {p.libelle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fr-table fr-table--bordered fr-table--layout-fixed lulu-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">N° dossier</th>
              <th scope="col">Agent</th>
              <th scope="col">Pôle</th>
              <th scope="col">Type</th>
              <th scope="col">Depuis</th>
              <th scope="col">Statut</th>
              <th scope="col">Complet</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((d) => {
              const agent = getAgent(d.agentId);
              return (
                <tr key={d.id}>
                  <td>
                    <Link className="fr-link" to={dossierPath(d.id)}>
                      {d.id}
                    </Link>
                  </td>
                  <td>{agent ? agentLabel(agent) : "—"}</td>
                  <td>{getPoleLibelle(d.poleId)}</td>
                  <td>{d.typeAbsence}</td>
                  <td>{d.dureeJours} j</td>
                  <td>
                    <StatusBadge
                      label={d.statut === "actif" ? "Actif" : "Clôturé"}
                      tone={d.statut === "actif" ? "info" : "neutral"}
                    />
                  </td>
                  <td>{d.complet ? "Oui" : "Non"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="fr-text--xs fr-text--mention fr-mt-2w">
        {actifs} dossiers actifs · {dossiers.length} résultat(s) affiché(s)
      </p>

      <WizardModal />
    </div>
  );
}
