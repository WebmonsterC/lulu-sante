import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import { Header } from "@codegouvfr/react-dsfr/Header";
import type { HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { HeaderUserMenu } from "../components/HeaderUserMenu";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { linkTo } from "../lib/linkTo";
import { logoutApi } from "../lib/auth";

import { buildBreadcrumb, isNavActive, NAV_ITEMS } from "../lib/navigation";
import { APP_ICON_ALT, APP_ICON_URL } from "../lib/brand";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const breadcrumb = buildBreadcrumb(location.pathname);

  function handleLogout() {
    void logoutApi().finally(() => {
      navigate("/", { replace: true });
    });
  }

  const quickAccessItems: (HeaderProps.QuickAccessItem | ReactElement | null)[] = user
    ? [<HeaderUserMenu key="user-menu" user={user} onLogout={handleLogout} />]
    : [
        {
          iconId: "fr-icon-logout-box-r-line",
          text: "Déconnexion",
          buttonProps: {
            type: "button" as const,
            onClick: handleLogout,
            title: "Se déconnecter",
          },
        },
      ];

  return (
    <>
      <Header
        className="lulu-header"
        brandTop=""
        homeLinkProps={{ ...linkTo("/dashboard"), title: "Accueil — Lulu Santé" }}
        operatorLogo={{
          orientation: "vertical",
          imgUrl: APP_ICON_URL,
          alt: APP_ICON_ALT,
          linkProps: { ...linkTo("/dashboard"), title: "Accueil — Lulu Santé" },
        }}
        serviceTitle="Lulu Santé"
        serviceTagline="CHUM — Pilotage APRS"
        navigation={NAV_ITEMS.map((item) => ({
          text: item.text,
          linkProps: linkTo(item.to),
          isActive: isNavActive(location.pathname, item.to),
        }))}
        quickAccessItems={quickAccessItems}
      />

      <div className="fr-container fr-container--fluid lulu-main">
        <Breadcrumb
          segments={breadcrumb.segments}
          currentPageLabel={breadcrumb.currentPageLabel}
        />
        <Outlet />
      </div>
    </>
  );
}
