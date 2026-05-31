import { useState } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Copy, GlobeHemisphereWest, LinkSimple } from "@phosphor-icons/react";
import { useNetworkInfo } from "../hooks/useNetworkInfo";
import { copyTextToClipboard } from "../lib/generate-password";

export function LoginNetworkPanel() {
  const { info, loading } = useNetworkInfo();
  const [notice, setNotice] = useState<string | null>(null);

  async function handleCopy(text: string, message: string) {
    const copied = await copyTextToClipboard(text);
    setNotice(copied ? message : "Copie impossible — sélectionnez le texte manuellement.");
  }

  return (
    <aside className="fr-card lulu-login-network" aria-labelledby="login-network-title">
      <div className="fr-card__body">
        <div className="fr-card__content">
          <h2 id="login-network-title" className="fr-h5 fr-mb-2w">
            <GlobeHemisphereWest weight="duotone" size={22} aria-hidden className="lulu-callout-icon" />
            Accès réseau local
          </h2>
          <p className="fr-text--sm fr-text--mention">
            Sur le poste qui héberge l&apos;application, notez l&apos;adresse IP et partagez le lien
            d&apos;invitation aux collègues connectés au même réseau (Wi‑Fi ou Ethernet).
          </p>

          {loading ? (
            <p className="fr-text--sm fr-mt-3w fr-mb-0">Détection de l&apos;adresse réseau…</p>
          ) : info ? (
            <dl className="lulu-login-network__list fr-mt-3w fr-mb-0">
              <div className="lulu-login-network__row">
                <dt>Poste hôte</dt>
                <dd>
                  <code>{info.localUrl}</code>
                </dd>
              </div>

              <div className="lulu-login-network__row">
                <dt>Adresse IP (LAN)</dt>
                <dd>
                  {info.primaryAddress ? (
                    <code>{info.primaryAddress}</code>
                  ) : (
                    <span className="fr-text--mention">
                      Non disponible — démarrez le serveur applicatif sur ce poste.
                    </span>
                  )}
                </dd>
              </div>

              {info.addresses.length > 1 ? (
                <div className="lulu-login-network__row">
                  <dt>Autres interfaces</dt>
                  <dd>
                    {info.addresses.slice(1).map((entry) => (
                      <span key={`${entry.name}-${entry.address}`} className="lulu-login-network__iface">
                        <code>{entry.address}</code>
                        <span className="fr-text--xs fr-text--mention"> ({entry.name})</span>
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}

              <div className="lulu-login-network__row">
                <dt>Lien d&apos;invitation</dt>
                <dd>
                  {info.inviteUrl ? (
                    <>
                      <a className="fr-link" href={info.inviteUrl}>
                        {info.inviteUrl}
                      </a>
                      <div className="fr-btns-group fr-btns-group--inline fr-mt-2w">
                        <Button
                          priority="secondary"
                          size="small"
                          type="button"
                          onClick={() => handleCopy(info.inviteUrl!, "Lien d'invitation copié.")}
                        >
                          <Copy weight="duotone" size={18} aria-hidden className="lulu-btn-icon" />
                          Copier le lien
                        </Button>
                        <Button
                          priority="tertiary"
                          size="small"
                          type="button"
                          onClick={() => handleCopy(info.primaryAddress!, "Adresse IP copiée.")}
                        >
                          <LinkSimple weight="duotone" size={18} aria-hidden className="lulu-btn-icon" />
                          Copier l&apos;IP
                        </Button>
                      </div>
                    </>
                  ) : (
                    <span className="fr-text--mention">
                      Disponible lorsque l&apos;application tourne en mode serveur sur le réseau local.
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          ) : null}

          {notice ? (
            <p className="fr-text--xs fr-text--mention fr-mt-3w fr-mb-0">{notice}</p>
          ) : null}

          <p className="fr-text--xs fr-text--mention fr-mt-4w fr-mb-0">
            Les autres postes ouvrent le lien dans Chrome, Edge ou Safari avec les mêmes identifiants.
            Le pare-feu du Mac hôte doit autoriser les connexions entrantes sur le port{" "}
            {info?.port ?? 8787}.
          </p>
        </div>
      </div>
    </aside>
  );
}
