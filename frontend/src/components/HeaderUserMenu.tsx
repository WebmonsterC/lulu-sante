import { useNavigate } from "react-router-dom";
import { UserGear, SignOut } from "@phosphor-icons/react";
import type { AppUser } from "../data/users";
import { getRoleLabel } from "../data/users";
import { profilePath } from "../lib/navigation";
import { DropdownMenu } from "./DropdownMenu";

type HeaderUserMenuProps = {
  user: AppUser;
  onLogout: () => void;
};

export function HeaderUserMenu({ user, onLogout }: HeaderUserMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu
      className="lulu-header-user-menu"
      triggerClassName="lulu-header-user-menu__trigger fr-btn fr-btn--tertiary fr-icon-account-line"
      triggerLabel={
        <span className="lulu-header-user-menu__label">
          <span className="lulu-header-user-menu__name">{user.nomAffichage}</span>
          <span className="lulu-header-user-menu__role">{user.role}</span>
        </span>
      }
      ariaLabel="Menu utilisateur"
      scopeLabel={user.nomAffichage}
      contextLabel={`${user.login} · ${getRoleLabel(user.role)}`}
      items={[
        {
          id: "profile",
          label: "Mon profil",
          hint: "Nom affiché et mot de passe",
          icon: <UserGear weight="duotone" size={20} aria-hidden />,
          onClick: () => navigate(profilePath()),
        },
        {
          id: "logout",
          label: "Déconnexion",
          icon: <SignOut weight="duotone" size={20} aria-hidden />,
          onClick: onLogout,
        },
      ]}
    />
  );
}
