import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { DateInput } from "../components/DateInput";
import { TermHeading, TermLabel, TermTableHeader } from "../components/TermTooltip";
import { StatusBadge } from "../components/StatusBadge";
import {
  delaiInstruction,
  formatDateFr,
  getAgent,
  getDossier,
  agentLabel,
  RESULTATS_CM,
  TYPES_AVIS_MT,
  getPoleLibelle,
} from "../data/mock";
import { useAppData } from "../context/AppDataContext";
import { FICHE_TABS, dossierPath, type FicheTabKey } from "../lib/navigation";
import { isEndDateValid, minIso } from "../lib/dates";

const VALID_TABS = new Set<string>(FICHE_TABS.map((t) => t.key));

export function DossierPage() {
  const { dossierId, tab } = useParams<{ dossierId: string; tab?: string }>();
  const dossier = dossierId ? getDossier(dossierId) : undefined;
  const agent = dossier ? getAgent(dossier.agentId) : undefined;

  if (!dossier || !agent) {
    return <Navigate to="/dossiers" replace />;
  }

  const activeTab: FicheTabKey =
    tab && VALID_TABS.has(tab) ? (tab as FicheTabKey) : "synthese";

  if (tab && !VALID_TABS.has(tab)) {
    return <Navigate to={dossierPath(dossier.id)} replace />;
  }

  return (
    <div className="fr-mt-3w">
      <div className="lulu-fiche-header">
        <div>
          <h1 className="fr-h4 fr-mb-1w">{dossier.id}</h1>
          <p className="fr-text--sm fr-text--mention">
            {agentLabel(agent)} · Mat. {agent.matricule} · {getPoleLibelle(dossier.poleId)} ·{" "}
            {dossier.typeAbsence}
          </p>
          {dossier.verrouillePar && (
            <p className="fr-mt-1w">
              <StatusBadge label={`Verrouillé par ${dossier.verrouillePar}`} tone="warning" />
            </p>
          )}
        </div>
        {dossier.statut === "actif" && (
          <Button priority="secondary">Clôturer</Button>
        )}
      </div>

      <nav className="fr-tabs fr-mb-4w lulu-tabs" role="tablist">
        {FICHE_TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              role="tab"
              aria-selected={isActive}
              className={`fr-tabs__tab ${isActive ? "fr-tabs__tab--selected" : ""}`}
              to={dossierPath(dossier.id, t.key)}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {activeTab === "synthese" && <SyntheseTab dossierId={dossier.id} dossier={dossier} />}
      {activeTab === "arrets" && <ArretsTab dossierId={dossier.id} />}
      {activeTab === "cm" && <CmTab dossierId={dossier.id} />}
      {activeTab === "mt" && <MtTab dossierId={dossier.id} />}
      {activeTab === "maintien" && <MaintienTab dossierId={dossier.id} />}
      {activeTab === "ppr" && <PprTab dossierId={dossier.id} />}
      {activeTab === "retraite" && <RetraiteTab dossierId={dossier.id} />}
    </div>
  );
}

function SyntheseTab({
  dossierId,
  dossier,
}: {
  dossierId: string;
  dossier: NonNullable<ReturnType<typeof getDossier>>;
}) {
  const { metier } = useAppData();
  const events = metier.chronologie[dossierId] ?? [];

  return (
    <div className="lulu-fiche-grid">
      <section className="fr-card">
        <div className="fr-card__body">
          <h2 className="fr-h6">Chronologie</h2>
          <ul className="fr-list">
            {events.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      </section>
      <div className="lulu-fiche-stack">
        <div className="lulu-stats-grid">
          <article className="fr-tile fr-p-3w">
            <h3 className="fr-tile__title fr-text--sm">Durée absence</h3>
            <p className="fr-display--sm fr-mb-0">{dossier.dureeJours} j</p>
          </article>
          <article className="fr-tile fr-p-3w">
            <h3 className="fr-tile__title fr-text--sm">Délai ouverture</h3>
            <p className="fr-display--sm fr-mb-0">2 j</p>
          </article>
          <article className="fr-tile fr-p-3w">
            <h3 className="fr-tile__title fr-text--sm">En attente</h3>
            <p className="fr-display--sm fr-mb-0">CM — 38 j</p>
          </article>
          <article className="fr-tile fr-p-3w">
            <h3 className="fr-tile__title fr-text--sm">Dossier complet</h3>
            <p className="fr-display--sm fr-mb-0">{dossier.complet ? "Oui" : "Non"}</p>
          </article>
        </div>
        <section className="fr-card">
          <div className="fr-card__body">
            <h2 className="fr-h6">Délais clés</h2>
            <div className="lulu-form-grid">
              <Input
                label="Réception arrêt"
                nativeInputProps={{ value: formatDateFr(dossier.dateReception), readOnly: true }}
              />
              <Input
                label="Création dossier"
                nativeInputProps={{ value: formatDateFr(dossier.dateCreation), readOnly: true }}
              />
              <Input label="Démarches oblig." nativeInputProps={{ value: "—", readOnly: true }} />
              <Input label="Prochaine échéance" nativeInputProps={{ value: "Avis CM", readOnly: true }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ArretsTab({ dossierId }: { dossierId: string }) {
  const { metier } = useAppData();
  const arrets = metier.arrets.filter((a) => a.dossierId === dossierId);

  return (
    <div>
      <div className="lulu-page-header">
        <h2 className="fr-h5">Arrêts maladie</h2>
        <Button>+ Nouvel arrêt</Button>
      </div>
      <div className="fr-table fr-table--bordered lulu-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Date début</th>
              <th scope="col">Date fin</th>
              <TermTableHeader term="type_absence">Type</TermTableHeader>
              <TermTableHeader term="jours_ouvrables">Jours ouvrables</TermTableHeader>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {arrets.map((a) => (
              <tr key={a.id}>
                <td>{formatDateFr(a.dateDebut)}</td>
                <td>{a.dateFin ? formatDateFr(a.dateFin) : "En cours"}</td>
                <td>{a.typeAbsence}</td>
                <td>{a.joursOuvrables}</td>
                <td>
                  <button type="button" className="fr-link fr-link--sm">
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CmTab({ dossierId }: { dossierId: string }) {
  const { metier } = useAppData();
  const saisines = metier.saisinesCm.filter((s) => s.dossierId === dossierId);
  const [dateSaisine, setDateSaisine] = useState("2026-04-15");
  const [dateAvis, setDateAvis] = useState("");
  const cmDatesValid = isEndDateValid(dateSaisine, dateAvis);

  return (
    <div>
      <div className="lulu-page-header">
        <TermHeading as="h2" className="fr-h5" term="cm">
          Conseil médical
        </TermHeading>
        <Button>+ Nouvelle saisine</Button>
      </div>
      <div className="fr-table fr-table--bordered fr-mb-4w lulu-table-scroll">
        <table>
          <thead>
            <tr>
              <TermTableHeader term="saisine">Date saisine</TermTableHeader>
              <TermTableHeader term="cm">Date avis</TermTableHeader>
              <TermTableHeader term="favr">Résultat</TermTableHeader>
              <TermTableHeader term="delai_instruction">Délai</TermTableHeader>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {saisines.map((s) => (
              <tr key={s.id}>
                <td>{formatDateFr(s.dateSaisine)}</td>
                <td>{s.dateAvis ? formatDateFr(s.dateAvis) : "—"}</td>
                <td>
                  <StatusBadge
                    label={s.resultatLabel}
                    tone={
                      s.resultat === "FAVR"
                        ? "success"
                        : s.resultat
                          ? "error"
                          : "warning"
                    }
                  />
                </td>
                <td>{delaiInstruction(s.dateSaisine, s.dateAvis)}</td>
                <td>
                  <button type="button" className="fr-link fr-link--sm">
                    {s.dateAvis ? "Modifier" : "Saisir avis"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="fr-card">
        <div className="fr-card__body">
          <h3 className="fr-h6">Saisir / modifier une saisine</h3>
          <div className="lulu-form-grid fr-mt-3w">
            <DateInput
              label="Date de saisine"
              term="saisine"
              value={dateSaisine}
              onChange={setDateSaisine}
              maxDate={dateAvis || undefined}
            />
            <DateInput
              label="Date de l'avis"
              term="cm"
              value={dateAvis}
              onChange={setDateAvis}
              minDate={dateSaisine}
            />
            <div className="fr-select-group">
              <TermLabel htmlFor="cm-resultat" term="favr">
                Résultat
              </TermLabel>
              <select className="fr-select" id="cm-resultat" defaultValue="">
                <option value="">— Sélectionner —</option>
                {RESULTATS_CM.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="fr-input-group">
              <TermLabel term="delai_instruction">Délai instruction</TermLabel>
              <input className="fr-input" id="cm-delai" value="—" readOnly aria-readonly />
            </div>
          </div>
          <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
            <Button disabled={!cmDatesValid}>Enregistrer</Button>
            <Button priority="tertiary">Annuler</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MtTab({ dossierId }: { dossierId: string }) {
  const { metier } = useAppData();
  const visites = metier.visitesMt.filter((v) => v.dossierId === dossierId);

  return (
    <div>
      <div className="lulu-page-header">
        <TermHeading as="h2" className="fr-h5" term="mt">
          Médecine du travail
        </TermHeading>
        <Button>+ Nouvelle visite</Button>
      </div>
      <div className="fr-table fr-table--bordered fr-mb-4w lulu-table-scroll">
        <table>
          <thead>
            <tr>
              <TermTableHeader term="visite_mt">Date visite</TermTableHeader>
              <TermTableHeader term="inapmt">Type d&apos;avis</TermTableHeader>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {visites.map((v) => (
              <tr key={v.id}>
                <td>{formatDateFr(v.dateVisite)}</td>
                <td>{v.typeAvis}</td>
                <td>
                  <button type="button" className="fr-link fr-link--sm">
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="fr-card">
        <div className="fr-card__body">
          <h3 className="fr-h6">Enregistrer une visite</h3>
          <div className="lulu-form-grid fr-mt-3w">
            <DateInput label="Date de visite" term="visite_mt" defaultValue="2026-05-30" />
            <div className="fr-select-group">
              <TermLabel htmlFor="mt-avis" term="inapmt" required>
                Type d&apos;avis
              </TermLabel>
              <select className="fr-select" id="mt-avis" defaultValue="INAPMT">
                {TYPES_AVIS_MT.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="fr-callout fr-callout--yellow-tournesol fr-mt-3w">
            <p className="fr-callout__text">
              Une inaptitude au métier peut déclencher l&apos;ouverture d&apos;un parcours PPR.
            </p>
          </div>
          <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
            <Button>Enregistrer</Button>
            <Button priority="tertiary">Annuler</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MaintienTab({ dossierId: _dossierId }: { dossierId: string }) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const maintienDatesValid = isEndDateValid(dateDebut, dateFin);

  return (
    <div>
      <TermHeading as="h2" className="fr-h5" term="maintien">
        Maintien en emploi
      </TermHeading>
      <div className="fr-callout fr-callout--blue-cumulus fr-mt-3w">
        <p className="fr-callout__text">
          Suivi des aménagements de poste, temps partiel thérapeutique et actions de maintien.
        </p>
      </div>
      <section className="fr-card fr-mt-4w">
        <div className="fr-card__body">
          <div className="lulu-form-grid">
            <DateInput label="Date début aménagement" term="maintien" value={dateDebut} onChange={setDateDebut} maxDate={dateFin || undefined} />
            <DateInput label="Date fin aménagement" term="tpt" value={dateFin} onChange={setDateFin} minDate={dateDebut || undefined} />
            <Input label="Type de mesure" nativeInputProps={{ placeholder: "TPT, aménagement poste…" }} hintText="Ex. temps partiel thérapeutique (TPT)" />
            <Input label="Commentaire" nativeInputProps={{ placeholder: "Notes" }} />
          </div>
          <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
            <Button disabled={!maintienDatesValid}>Enregistrer</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PprTab({ dossierId }: { dossierId: string }) {
  const { metier } = useAppData();
  const parcours = metier.parcoursPpr.filter((p) => p.dossierId === dossierId);
  const actif = parcours.find((p) => p.enCours);
  const [dateEntree, setDateEntree] = useState(actif?.dateEntree ?? "");
  const [dateSortie, setDateSortie] = useState(actif?.dateSortie ?? "");
  const [dateAffectation, setDateAffectation] = useState(actif?.dateAffectation ?? "");
  const pprDatesValid =
    isEndDateValid(dateEntree, dateSortie) && isEndDateValid(dateEntree, dateAffectation);

  return (
    <div>
      <div className="lulu-page-header">
        <TermHeading as="h2" className="fr-h5" term="ppr">
          Parcours de reclassement (PPR)
        </TermHeading>
        <Button>+ Ouvrir un parcours</Button>
      </div>
      <div className="lulu-stats-grid fr-mb-4w">
        <article className="fr-tile fr-p-3w">
          <h3 className="fr-tile__title fr-text--sm">Entrée parcours</h3>
          <p className="fr-display--sm fr-mb-0">
            {actif ? formatDateFr(actif.dateEntree) : "—"}
          </p>
        </article>
        <article className="fr-tile fr-p-3w">
          <h3 className="fr-tile__title fr-text--sm">Durée à ce jour</h3>
          <p className="fr-display--sm fr-mb-0">79 j</p>
        </article>
        <article className="fr-tile fr-p-3w">
          <TermHeading as="h3" className="fr-tile__title fr-text--sm" term="reclassement_reussi">
            Reclassement réussi
          </TermHeading>
          <p className="fr-display--sm fr-mb-0">{actif?.dateAffectation ? "Oui" : "Non"}</p>
        </article>
      </div>
      {actif && (
        <section className="fr-card fr-mb-4w">
          <div className="fr-card__body">
            <div className="lulu-page-header fr-mb-0">
              <h3 className="fr-h6">Parcours actif</h3>
              <StatusBadge label="En cours" tone="warning" />
            </div>
            <div className="lulu-form-grid fr-mt-3w">
              <DateInput
                label="Date d'entrée"
                term="ppr"
                value={dateEntree}
                onChange={setDateEntree}
                maxDate={minIso(dateSortie, dateAffectation)}
                required
              />
              <DateInput label="Date de sortie" term="ppr" value={dateSortie} onChange={setDateSortie} minDate={dateEntree || undefined} />
              <DateInput
                label="Date d'affectation (nouveau poste)"
                term="reclassement_reussi"
                value={dateAffectation}
                onChange={setDateAffectation}
                minDate={dateEntree || undefined}
              />
              <Input label="Poste d'affectation" nativeInputProps={{ placeholder: "Intitulé du poste" }} />
            </div>
            <div className="fr-callout fr-callout--blue-cumulus fr-mt-3w">
              <p className="fr-callout__text">
                Reclassement réussi (KPI D5) lorsque la date d&apos;affectation est renseignée.
              </p>
            </div>
            <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
              <Button disabled={!pprDatesValid}>Enregistrer</Button>
              <Button priority="secondary">Clôturer le parcours</Button>
            </div>
          </div>
        </section>
      )}
      <div className="fr-table fr-table--bordered lulu-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Entrée</th>
              <th scope="col">Sortie</th>
              <th scope="col">Affectation</th>
              <th scope="col">Poste</th>
              <th scope="col">Réussi</th>
            </tr>
          </thead>
          <tbody>
            {parcours.map((p) => (
              <tr key={p.id}>
                <td>{formatDateFr(p.dateEntree)}</td>
                <td>{p.dateSortie ? formatDateFr(p.dateSortie) : "—"}</td>
                <td>{p.dateAffectation ? formatDateFr(p.dateAffectation) : "—"}</td>
                <td>{p.posteAffectation ?? "—"}</td>
                <td>
                  <StatusBadge
                    label={p.dateAffectation ? "Oui" : "Non"}
                    tone={p.dateAffectation ? "success" : "neutral"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RetraiteTab({ dossierId: _dossierId }: { dossierId: string }) {
  const [dateDemande, setDateDemande] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const retraiteDatesValid = isEndDateValid(dateDemande, dateDepart);

  return (
    <div>
      <TermHeading as="h2" className="fr-h5" term="retraite">
        Retraite
      </TermHeading>
      <section className="fr-card fr-mt-3w">
        <div className="fr-card__body">
          <div className="lulu-form-grid">
            <DateInput label="Date demande retraite" term="retraite" value={dateDemande} onChange={setDateDemande} maxDate={dateDepart || undefined} />
            <DateInput label="Date départ effectif" term="retraite" value={dateDepart} onChange={setDateDepart} minDate={dateDemande || undefined} />
            <div className="fr-select-group">
              <label className="fr-label" htmlFor="retraite-type">
                Type de départ
              </label>
              <select className="fr-select" id="retraite-type" defaultValue="">
                <option value="">— Sélectionner —</option>
                <option value="limite">Limite d&apos;âge</option>
                <option value="anticipee">Anticipée</option>
                <option value="invalidite">Invalidité</option>
              </select>
            </div>
            <Input label="Commentaire" nativeInputProps={{ placeholder: "Notes" }} />
          </div>
          <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
            <Button disabled={!retraiteDatesValid}>Enregistrer</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
