import { Link } from "react-router-dom";
import { X } from "@phosphor-icons/react";
import { agentLabel, getAgent, getDossier, getPoleLibelle } from "../../data/mock";
import { buildDrillDownDossiersUrl } from "../../data/indicateurs";
import type { ChartPoint } from "../../data/indicateurs";
import { dossierPath } from "../../lib/navigation";

type DrillDownPanelProps = {
  sectionLabel: string;
  chartTitle: string;
  point: ChartPoint;
  onClose: () => void;
};

export function DrillDownPanel({ sectionLabel, chartTitle, point, onClose }: DrillDownPanelProps) {
  const dossiers = point.dossierIds
    .map((id) => getDossier(id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);

  const listUrl = buildDrillDownDossiersUrl({
    dossierIds: point.dossierIds,
    label: `${sectionLabel} — ${point.label}`,
  });

  return (
    <section className="fr-card lulu-drilldown fr-mt-4w" aria-labelledby="drilldown-title">
      <div className="fr-card__body">
        <div className="lulu-drilldown__header">
          <div>
            <p className="fr-text--xs fr-text--mention fr-mb-1v">Exploration détaillée</p>
            <h3 id="drilldown-title" className="fr-h6 fr-mb-0">
              {point.label}
              <span className="fr-text--sm fr-text--mention"> — {chartTitle}</span>
            </h3>
            <p className="fr-text--sm fr-mt-1w fr-mb-0">
              Valeur agrégée : <strong>{point.value}</strong>
              {dossiers.length > 0
                ? ` · ${dossiers.length} dossier(s) identifié(s) dans le jeu de démo`
                : " · Aucun dossier de démo associé (données agrégées simulées)"}
            </p>
          </div>
          <button
            type="button"
            className="fr-btn fr-btn--tertiary fr-btn--icon-left lulu-drilldown__close"
            onClick={onClose}
            aria-label="Fermer l'exploration"
          >
            <X weight="duotone" size={18} aria-hidden />
            Fermer
          </button>
        </div>

        {dossiers.length > 0 ? (
          <>
            <div className="fr-table fr-table--bordered fr-mt-3w lulu-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">N° dossier</th>
                    <th scope="col">Agent</th>
                    <th scope="col">Pôle</th>
                    <th scope="col">Type</th>
                    <th scope="col">Durée</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {dossiers.map((d) => {
                    const agent = getAgent(d.agentId);
                    return (
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td>{agent ? agentLabel(agent) : "—"}</td>
                        <td>{getPoleLibelle(d.poleId)}</td>
                        <td>{d.typeAbsence}</td>
                        <td>{d.dureeJours} j</td>
                        <td>
                          <Link className="fr-link" to={dossierPath(d.id)}>
                            Ouvrir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
              <Link className="fr-btn fr-btn--secondary" to={listUrl}>
                Voir dans la liste des dossiers
              </Link>
            </div>
          </>
        ) : (
          <div className="fr-callout fr-callout--yellow-tournesol fr-mt-3w">
            <p className="fr-callout__text">
              Cet agrégat représente l&apos;ensemble du CHUM sur la période. Les dossiers de
              démonstration ne couvrent qu&apos;un échantillon — consultez la liste complète des
              dossiers pour filtrer manuellement.
            </p>
            <Link className="fr-link fr-link--sm fr-mt-1w" to="/dossiers">
              Accéder à tous les dossiers
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
