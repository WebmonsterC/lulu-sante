import { useMemo, useState } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { DateInput } from "./DateInput";
import { TermLabel } from "./TermTooltip";
import { isEndDateValid, isIsoInRange } from "../lib/dates";
import { useAppData } from "../context/AppDataContext";
import {
  agentLabel,
  POLES_CHUM,
  TYPES_ABSENCE,
  type Agent,
  getPoleLibelle,
} from "../data/mock";

export type WizardResult = {
  agent: Agent;
  numeroDossier: string;
};

const STEP_TITLES = ["Sélection agent", "Informations dossier", "Premier arrêt"];

type WizardDialogProps = {
  modal: ReturnType<typeof createModal>;
  onCreated: (result: WizardResult) => void;
};

function WizardDialog({ modal, onCreated }: WizardDialogProps) {
  const { metier } = useAppData();
  const { Component: Modal } = modal;
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dateReception, setDateReception] = useState("2026-05-30");
  const [dateCreation, setDateCreation] = useState("2026-05-30");
  const [typeAbsence, setTypeAbsence] = useState("CLML");
  const [poleId, setPoleId] = useState("CHUMFMET");
  const [dateDebutArret, setDateDebutArret] = useState("2026-05-30");
  const [dateFinArret, setDateFinArret] = useState("");
  const numeroDossier = "DOS-2026-0156";

  const step2DatesValid =
    isIsoInRange(dateReception, undefined, dateCreation) &&
    isIsoInRange(dateCreation, dateReception);
  const step3DatesValid = isEndDateValid(dateDebutArret, dateFinArret);

  const filteredAgents = metier.agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.matricule.includes(q) ||
      a.nom.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q)
    );
  });

  function reset() {
    setStep(1);
    setSearch("");
    setSelectedAgent(null);
    setDateReception("2026-05-30");
    setDateCreation("2026-05-30");
    setTypeAbsence("CLML");
    setPoleId("CHUMFMET");
    setDateDebutArret("2026-05-30");
    setDateFinArret("");
  }

  function handleClose() {
    reset();
    modal.close();
  }

  function handleCreate() {
    if (!selectedAgent) return;
    onCreated({ agent: selectedAgent, numeroDossier });
    handleClose();
  }

  return (
    <Modal
      title="Nouveau dossier"
      size="large"
      buttons={[
        {
          children: "Fermer",
          priority: "secondary",
          onClick: handleClose,
        },
      ]}
    >
      <Stepper
        currentStep={step}
        stepCount={3}
        title={STEP_TITLES[step - 1]}
        nextTitle={step < 3 ? STEP_TITLES[step] : undefined}
        className="fr-mb-4w"
      />

      {step === 1 && (
        <div>
          <Input
            label="Rechercher un agent (matricule ou nom)"
            nativeInputProps={{
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Ex. 18452 ou Martin",
            }}
          />
          <div className="fr-table fr-table--bordered fr-mt-3w lulu-table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Matricule</th>
                  <th scope="col">Agent</th>
                  <th scope="col">Pôle</th>
                  <th scope="col">Sélection</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <tr key={agent.id}>
                    <td>{agent.matricule}</td>
                    <td>{agentLabel(agent)}</td>
                    <td>{getPoleLibelle(agent.poleId)}</td>
                    <td>
                      <button
                        type="button"
                        className={`fr-btn fr-btn--sm ${selectedAgent?.id === agent.id ? "" : "fr-btn--secondary"}`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        {selectedAgent?.id === agent.id ? "Sélectionné" : "Choisir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fr-text--xs fr-text--mention fr-mt-2w">
            <button type="button" className="fr-link fr-link--sm">
              + Créer un agent
            </button>{" "}
            (import XLS — à venir)
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="lulu-form-grid">
          <DateInput
            label="Date réception arrêt"
            term="date_reception_arret"
            value={dateReception}
            onChange={setDateReception}
            maxDate={dateCreation}
            required
          />
          <DateInput
            label="Date création dossier"
            term="date_creation_dossier"
            value={dateCreation}
            onChange={setDateCreation}
            minDate={dateReception}
            required
          />
          <div className="fr-select-group">
            <TermLabel htmlFor="wizard-type" term="type_absence" required>
              Type d&apos;absence
            </TermLabel>
            <select
              className="fr-select"
              id="wizard-type"
              value={typeAbsence}
              onChange={(e) => setTypeAbsence(e.target.value)}
            >
              {TYPES_ABSENCE.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="fr-select-group">
            <TermLabel htmlFor="wizard-pole" term="pole" required>
              Pôle
            </TermLabel>
            <select
              className="fr-select"
              id="wizard-pole"
              value={poleId}
              onChange={(e) => setPoleId(e.target.value)}
            >
              {POLES_CHUM.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.libelle}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="N° dossier généré"
            hintText="Attribué automatiquement"
            nativeInputProps={{ value: numeroDossier, readOnly: true }}
          />
          {selectedAgent && (
            <div className="lulu-form-full">
              <div className="fr-callout fr-callout--blue-cumulus fr-mb-0">
                <p className="fr-callout__text">
                  Agent sélectionné : {agentLabel(selectedAgent)} ({selectedAgent.matricule})
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="lulu-form-grid">
            <DateInput
              label="Date début arrêt"
              term="jours_ouvrables"
              value={dateDebutArret}
              onChange={setDateDebutArret}
              maxDate={dateFinArret || undefined}
              required
            />
            <DateInput
              label="Date fin arrêt"
              hintText="Laisser vide si en cours"
              value={dateFinArret}
              onChange={setDateFinArret}
              minDate={dateDebutArret}
            />
            <div className="fr-select-group">
              <TermLabel htmlFor="wizard-arret-type" term="type_absence">
                Type d&apos;absence
              </TermLabel>
              <select className="fr-select" id="wizard-arret-type" defaultValue={typeAbsence}>
                {TYPES_ABSENCE.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Jours ouvrables (calculés)"
              hintText="Hors week-ends et jours fériés"
              nativeInputProps={{ value: dateFinArret ? "15" : "—", readOnly: true }}
            />
          </div>
          <div className="fr-callout fr-callout--green-emeraude fr-mt-3w">
            <p className="fr-callout__text">
              Confirmez la création du dossier {numeroDossier} pour{" "}
              {selectedAgent ? agentLabel(selectedAgent) : "—"}.
            </p>
          </div>
        </div>
      )}

      <div className="lulu-modal-actions fr-mt-4w">
        {step > 1 && (
          <Button priority="secondary" onClick={() => setStep(step - 1)}>
            Retour
          </Button>
        )}
        <span className="lulu-modal-actions__spacer" />
        <Button priority="tertiary" onClick={handleClose}>
          Annuler
        </Button>
        {step < 3 ? (
          <Button
            disabled={(step === 1 && !selectedAgent) || (step === 2 && !step2DatesValid)}
            onClick={() => setStep(step + 1)}
          >
            Suivant
          </Button>
        ) : (
          <Button disabled={!selectedAgent || !step3DatesValid} onClick={handleCreate}>
            Créer le dossier
          </Button>
        )}
      </div>
    </Modal>
  );
}

export function useDossierWizard(onCreated: (result: WizardResult) => void) {
  const modal = useMemo(
    () => createModal({ id: "wizard-dossier", isOpenedByDefault: false }),
    [],
  );

  return {
    wizardButtonProps: modal.buttonProps,
    WizardModal: () => <WizardDialog modal={modal} onCreated={onCreated} />,
  };
}
