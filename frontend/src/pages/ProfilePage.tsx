import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { UserCircle } from "@phosphor-icons/react";
import { ProfileFormFields } from "../components/ProfileFormFields";
import { FlashNotice } from "../components/FlashNotice";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUsersAdmin } from "../hooks/useUsersAdmin";
import { useFlashNotice } from "../hooks/useExportActions";
import { fetchCurrentUser } from "../lib/auth";
import { profileToFormValues, validateProfileForm, type ProfileFormValues } from "../data/users";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, setUser } = useCurrentUser();
  const { updateProfile } = useUsersAdmin();
  const { message, severity, showSuccess, dismiss } = useFlashNotice();

  const [values, setValues] = useState<ProfileFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setValues(profileToFormValues(user));
      setError(null);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="fr-container fr-mt-6w">
        <p className="fr-text--sm">Chargement du profil…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const currentUser = user;

  if (!values) {
    return null;
  }

  const formValues = values;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateProfileForm(formValues);
    if (validationError) {
      setError(validationError);
      return;
    }

    const updateError = await updateProfile(currentUser.id, formValues);
    if (updateError) {
      setError(updateError);
      return;
    }

    const refreshed = await fetchCurrentUser();
    if (refreshed) setUser(refreshed);

    setValues({
      nomAffichage: formValues.nomAffichage.trim(),
      motDePasse: "",
      confirmation: "",
    });
    setError(null);
    showSuccess("Profil mis à jour.");
  }

  return (
    <div className="fr-mt-3w lulu-profile">
      <FlashNotice message={message} severity={severity} onClose={dismiss} />

      <div className="lulu-page-header">
        <div className="lulu-page-header__title">
          <h1 className="fr-h3">Mon profil</h1>
          <p className="fr-text--sm fr-text--mention">
            Gérez votre nom affiché et votre mot de passe de connexion.
          </p>
        </div>
      </div>

      <article className="lulu-chart lulu-admin-form">
        <header className="lulu-admin-section__header fr-mb-4w">
          <span className="lulu-export-scope__icon" aria-hidden>
            <UserCircle weight="duotone" size={28} />
          </span>
          <div>
            <h2 className="fr-h6 fr-mb-1w">{currentUser.nomAffichage}</h2>
            <p className="fr-text--sm fr-text--mention fr-mb-0">
              Connecté en tant que <strong>{currentUser.login}</strong>
            </p>
          </div>
        </header>

        {error ? (
          <div className="fr-alert fr-alert--error fr-mb-4w" role="alert">
            <p className="fr-alert__title">Erreur</p>
            <p className="fr-alert__desc fr-mb-0">{error}</p>
          </div>
        ) : null}

        <form id="profile-form" onSubmit={handleSubmit}>
          <ProfileFormFields
            user={currentUser}
            values={formValues}
            onChange={(patch) => {
              setValues((current) => (current ? { ...current, ...patch } : current));
              setError(null);
            }}
          />

          <div className="fr-btns-group fr-btns-group--inline fr-mt-4w">
            <Button type="submit">Enregistrer</Button>
            <Button priority="secondary" type="button" onClick={() => navigate("/dashboard")}>
              Retour
            </Button>
          </div>
        </form>
      </article>
    </div>
  );
}
