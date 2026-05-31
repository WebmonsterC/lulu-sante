import { useEffect, useState } from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginNetworkPanel } from "../components/LoginNetworkPanel";
import { APP_ICON_ALT, APP_ICON_URL } from "../lib/brand";
import { fetchCurrentUser, loginWithApi, PROTOTYPE_DEFAULT_PASSWORD } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        if (user) navigate(redirectTo, { replace: true });
      })
      .finally(() => setCheckingSession(false));
  }, [navigate, redirectTo]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await loginWithApi(identifiant, motDePasse);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Identifiant ou mot de passe incorrect, ou compte inactif.",
      );
    }
  }

  if (checkingSession) {
    return (
      <div className="fr-container fr-mt-6w">
        <p className="fr-text--sm">Vérification de la session…</p>
      </div>
    );
  }

  return (
    <div className="lulu-login">
      <header className="fr-header fr-header--public lulu-header">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row">
              <div className="fr-header__brand">
                <div className="lulu-header__brand-row">
                  <img
                    className="lulu-header__app-icon"
                    src={APP_ICON_URL}
                    alt={APP_ICON_ALT}
                    width={48}
                    height={48}
                  />
                  <div className="fr-header__service">
                    <p className="fr-header__service-title">Lulu Santé</p>
                    <p className="fr-header__service-tagline">
                      CHUM — Pilotage des absences pour raison de santé
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="lulu-login__main">
        <div className="fr-container lulu-login__grid">
          <div className="fr-card">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h1 className="fr-h4">Connexion</h1>
                <p className="fr-text--sm fr-text--mention">
                  Authentification sur le serveur du réseau local (données centralisées SQLite).
                </p>

                {error ? (
                  <div className="fr-alert fr-alert--error fr-mt-3w" role="alert">
                    <p className="fr-alert__title">Connexion refusée</p>
                    <p className="fr-alert__desc fr-mb-0">{error}</p>
                  </div>
                ) : null}

                <form className="fr-mt-4w" onSubmit={handleSubmit}>
                  <Input
                    label="Identifiant"
                    nativeInputProps={{
                      name: "identifiant",
                      autoComplete: "username",
                      value: identifiant,
                      onChange: (e) => setIdentifiant(e.target.value),
                      required: true,
                    }}
                  />

                  <PasswordInput
                    label="Mot de passe"
                    nativeInputProps={{
                      name: "motDePasse",
                      autoComplete: "current-password",
                      value: motDePasse,
                      onChange: (e) => setMotDePasse(e.target.value),
                      required: true,
                    }}
                  />

                  <div className="fr-mt-4w">
                    <Button type="submit">Se connecter</Button>
                  </div>
                </form>

                <p className="fr-text--xs fr-text--mention fr-mt-4w">
                  Comptes de démonstration : mot de passe par défaut{" "}
                  <strong>{PROTOTYPE_DEFAULT_PASSWORD}</strong>
                  <br />
                  Exemples — <strong>admin</strong> (ADMN), <strong>mdupont</strong> (GEST),{" "}
                  <strong>cmartin</strong> ou <strong>direction</strong> (DIR)
                  <br />
                  Session expirée après 2 h d&apos;inactivité · Serveur LAN · v0.2.0
                </p>
              </div>
            </div>
          </div>

          <LoginNetworkPanel />
        </div>
      </main>
    </div>
  );
}
