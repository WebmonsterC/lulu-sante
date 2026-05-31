import { useState } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { Copy, Key } from "@phosphor-icons/react";
import { USER_ROLES, type UserFormValues } from "../data/users";
import { copyTextToClipboard, generateRobustPassword } from "../lib/generate-password";

type UserFormFieldsProps = {
  mode: "create" | "edit";
  values: UserFormValues;
  onChange: (patch: Partial<UserFormValues>) => void;
  formId?: string;
};

export function UserFormFields({ mode, values, onChange, formId = "user-form" }: UserFormFieldsProps) {
  const [generatorNotice, setGeneratorNotice] = useState<string | null>(null);

  async function handleGeneratePassword() {
    const password = generateRobustPassword(16);
    onChange({ motDePasse: password, confirmation: password });
    const copied = await copyTextToClipboard(password);
    setGeneratorNotice(
      copied
        ? "Mot de passe généré et copié dans le presse-papiers — communiquez-le de façon sécurisée."
        : "Mot de passe généré — copiez-le manuellement si besoin.",
    );
  }

  async function handleCopyPassword() {
    if (!values.motDePasse) return;
    const copied = await copyTextToClipboard(values.motDePasse);
    setGeneratorNotice(copied ? "Mot de passe copié." : "Copie impossible — sélectionnez le champ manuellement.");
  }

  return (
    <>
      <Input
        label="Login"
        hintText="Identifiant de connexion (non modifiable après création)"
        nativeInputProps={{
          id: `${formId}-login`,
          value: values.login,
          onChange: (e) => onChange({ login: e.target.value.toLowerCase() }),
          disabled: mode === "edit",
          autoComplete: "off",
          required: true,
        }}
      />

      <Input
        label="Nom affiché"
        nativeInputProps={{
          id: `${formId}-nom`,
          value: values.nomAffichage,
          onChange: (e) => onChange({ nomAffichage: e.target.value }),
          autoComplete: "name",
          required: true,
        }}
      />

      <div className="fr-select-group fr-mt-2w">
        <label className="fr-label" htmlFor={`${formId}-role`}>
          Rôle
        </label>
        <select
          className="fr-select"
          id={`${formId}-role`}
          value={values.role}
          onChange={(e) => onChange({ role: e.target.value as UserFormValues["role"] })}
        >
          {USER_ROLES.map((role) => (
            <option key={role.id} value={role.id}>
              {role.id} — {role.label}
            </option>
          ))}
        </select>
      </div>

      {mode === "create" ? (
        <div className="lulu-password-generator fr-mt-3w">
          <p className="fr-text--sm fr-mb-2w">
            Générez un mot de passe robuste (16 caractères, lettres, chiffres et symboles).
          </p>
          <div className="fr-btns-group fr-btns-group--inline">
            <Button priority="secondary" size="small" type="button" onClick={handleGeneratePassword}>
              <Key weight="duotone" size={18} aria-hidden className="lulu-btn-icon" />
              Générer un mot de passe
            </Button>
            {values.motDePasse ? (
              <Button priority="tertiary" size="small" type="button" onClick={handleCopyPassword}>
                <Copy weight="duotone" size={18} aria-hidden className="lulu-btn-icon" />
                Copier
              </Button>
            ) : null}
          </div>
          {generatorNotice ? (
            <p className="fr-text--xs fr-text--mention fr-mt-2w fr-mb-0">{generatorNotice}</p>
          ) : null}
        </div>
      ) : null}

      <PasswordInput
        className="fr-mt-2w"
        label={mode === "create" ? "Mot de passe" : "Nouveau mot de passe"}
        hintText={
          mode === "create"
            ? "Minimum 8 caractères — ou utilisez le générateur ci-dessus"
            : "Laisser vide pour conserver le mot de passe actuel"
        }
        nativeInputProps={{
          id: `${formId}-password`,
          value: values.motDePasse,
          onChange: (e) => {
            onChange({ motDePasse: e.target.value });
            setGeneratorNotice(null);
          },
          autoComplete: mode === "create" ? "new-password" : "off",
          required: mode === "create",
        }}
      />

      <PasswordInput
        className="fr-mt-2w"
        label="Confirmer le mot de passe"
        nativeInputProps={{
          id: `${formId}-password-confirm`,
          value: values.confirmation,
          onChange: (e) => {
            onChange({ confirmation: e.target.value });
            setGeneratorNotice(null);
          },
          autoComplete: "new-password",
          required: mode === "create",
        }}
      />

      <div className="fr-checkbox-group fr-mt-3w">
        <input
          type="checkbox"
          className="fr-checkbox"
          id={`${formId}-actif`}
          checked={values.actif}
          onChange={(e) => onChange({ actif: e.target.checked })}
        />
        <label className="fr-label" htmlFor={`${formId}-actif`}>
          Compte actif
        </label>
      </div>
    </>
  );
}
