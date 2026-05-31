import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { UserCircle } from "@phosphor-icons/react";
import { UserFormFields } from "../components/UserFormFields";
import {
  emptyUserForm,
  userToFormValues,
  validateUserForm,
  type UserFormValues,
} from "../data/users";
import { useUsersAdmin } from "../hooks/useUsersAdmin";

type UserFormPageProps = {
  mode: "create" | "edit";
};

export function UserFormPage({ mode }: UserFormPageProps) {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { users, createUser, updateUser } = useUsersAdmin();

  const existingUser = useMemo(
    () => (mode === "edit" && userId ? users.find((user) => user.id === userId) : undefined),
    [mode, userId, users],
  );

  const [values, setValues] = useState<UserFormValues>(emptyUserForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && existingUser) {
      setValues(userToFormValues(existingUser));
      setError(null);
    }
    if (mode === "create") {
      setValues(emptyUserForm());
      setError(null);
    }
  }, [mode, existingUser]);

  if (mode === "edit" && !userId) {
    return <Navigate to="/admin" replace />;
  }

  if (mode === "edit" && userId && users.length > 0 && !existingUser) {
    return <Navigate to="/admin" replace />;
  }

  if (mode === "edit" && userId && !existingUser) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateUserForm(values, {
      mode,
      existingLogins: users
        .filter((user) => user.id !== existingUser?.id)
        .map((user) => user.login),
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    if (mode === "create") {
      const createError = await createUser(values);
      if (createError) {
        setError(createError);
        return;
      }
      navigate("/admin", {
        state: { flash: `Utilisateur « ${values.login.trim().toLowerCase()} » créé.` },
      });
      return;
    }

    if (!existingUser) {
      setError("Utilisateur introuvable.");
      return;
    }

    const updateError = await updateUser(existingUser.id, values);
    if (updateError) {
      setError(updateError);
      return;
    }
    navigate("/admin", {
      state: { flash: `Utilisateur « ${existingUser.login} » mis à jour.` },
    });
  }

  const title = mode === "create" ? "Nouvel utilisateur" : `Modifier — ${existingUser?.login ?? ""}`;

  return (
    <div className="fr-mt-3w lulu-admin">
      <div className="lulu-page-header">
        <div className="lulu-page-header__title">
          <p className="fr-text--xs fr-text--mention fr-mb-1w">
            <Link className="fr-link" to="/admin">
              ← Administration
            </Link>
          </p>
          <h1 className="fr-h3">{title}</h1>
          <p className="fr-text--sm fr-text--mention">
            {mode === "create"
              ? "Création d'un compte applicatif local avec rôle et mot de passe."
              : "Modification du profil, du rôle ou du mot de passe."}
          </p>
        </div>
      </div>

      <article className="lulu-chart lulu-admin-form">
        <header className="lulu-admin-section__header fr-mb-4w">
          <span className="lulu-export-scope__icon" aria-hidden>
            <UserCircle weight="duotone" size={28} />
          </span>
          <div>
            <h2 className="fr-h6 fr-mb-1w">Informations du compte</h2>
            <p className="fr-text--sm fr-text--mention fr-mb-0">
              Rôles disponibles : GEST, RCME, RMED, DIR, ADMN.
            </p>
          </div>
        </header>

        {error ? (
          <div className="fr-alert fr-alert--error fr-mb-4w" role="alert">
            <p className="fr-alert__title">Erreur</p>
            <p className="fr-alert__desc fr-mb-0">{error}</p>
          </div>
        ) : null}

        <form id="user-form" onSubmit={handleSubmit}>
          <UserFormFields
            mode={mode}
            values={values}
            onChange={(patch) => {
              setValues((current) => ({ ...current, ...patch }));
              setError(null);
            }}
          />

          <div className="fr-btns-group fr-btns-group--inline fr-mt-4w">
            <Button type="submit">{mode === "create" ? "Créer l'utilisateur" : "Enregistrer"}</Button>
            <Button priority="secondary" onClick={() => navigate("/admin")}>
              Annuler
            </Button>
          </div>
        </form>
      </article>
    </div>
  );
}
