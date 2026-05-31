import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { StatusBadge } from "./StatusBadge";
import { getRoleLabel, ROLE_TONE, type AppUser, type ProfileFormValues } from "../data/users";

type ProfileFormFieldsProps = {
  user: AppUser;
  values: ProfileFormValues;
  onChange: (patch: Partial<ProfileFormValues>) => void;
  formId?: string;
};

export function ProfileFormFields({
  user,
  values,
  onChange,
  formId = "profile-form",
}: ProfileFormFieldsProps) {
  return (
    <>
      <Input
        label="Login"
        hintText="Identifiant de connexion — non modifiable"
        nativeInputProps={{
          id: `${formId}-login`,
          value: user.login,
          disabled: true,
          readOnly: true,
        }}
      />

      <div className="fr-input-group fr-mt-2w">
        <label className="fr-label">Rôle</label>
        <p className="fr-mb-0">
          <StatusBadge label={user.role} tone={ROLE_TONE[user.role]} />
          <span className="fr-text--sm fr-ml-2w">{getRoleLabel(user.role)}</span>
        </p>
        <p className="fr-hint-text fr-mb-0">
          Le rôle est géré par un administrateur depuis l&apos;espace Administration.
        </p>
      </div>

      <Input
        label="Nom affiché"
        hintText="Nom visible dans l'application et dans le header"
        nativeInputProps={{
          id: `${formId}-nom`,
          value: values.nomAffichage,
          onChange: (e) => onChange({ nomAffichage: e.target.value }),
          autoComplete: "name",
          required: true,
        }}
      />

      <PasswordInput
        className="fr-mt-2w"
        label="Nouveau mot de passe"
        hintText="Laisser vide pour conserver le mot de passe actuel"
        nativeInputProps={{
          id: `${formId}-password`,
          value: values.motDePasse,
          onChange: (e) => onChange({ motDePasse: e.target.value }),
          autoComplete: "new-password",
        }}
      />

      <PasswordInput
        className="fr-mt-2w"
        label="Confirmer le mot de passe"
        nativeInputProps={{
          id: `${formId}-password-confirm`,
          value: values.confirmation,
          onChange: (e) => onChange({ confirmation: e.target.value }),
          autoComplete: "new-password",
        }}
      />
    </>
  );
}
