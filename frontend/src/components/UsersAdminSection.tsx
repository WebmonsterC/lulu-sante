import { Link, useNavigate } from "react-router-dom";
import { PencilSimple, Plus, Prohibit, Trash, UsersThree } from "@phosphor-icons/react";
import { AdminSectionPanel } from "./AdminSectionPanel";
import { DropdownMenu } from "./DropdownMenu";
import { StatusBadge } from "./StatusBadge";
import { useUserConfirmModals } from "./UserConfirmModals";
import { getRoleLabel, PROTECTED_LOGIN, ROLE_TONE, type AppUser } from "../data/users";
import { userCreatePath, userEditPath } from "../lib/navigation";

type UsersAdminSectionProps = {
  users: AppUser[];
  onToggleActive: (userId: string) => string | null | Promise<string | null>;
  onDelete: (userId: string) => string | null | Promise<string | null>;
  onSuccess: (message: string) => void;
};

export function UsersAdminSection({
  users,
  onToggleActive,
  onDelete,
  onSuccess,
}: UsersAdminSectionProps) {
  const navigate = useNavigate();
  const { ConfirmModals, openToggleConfirm, openDeleteConfirm } = useUserConfirmModals({
    onToggle: async (userId) => {
      const user = users.find((entry) => entry.id === userId);
      const error = await onToggleActive(userId);
      if (error) return error;
      onSuccess(
        user?.actif
          ? `Compte « ${user.login} » désactivé.`
          : `Compte « ${user?.login ?? ""} » activé.`,
      );
      return null;
    },
    onDelete: async (userId) => {
      const user = users.find((entry) => entry.id === userId);
      const error = await onDelete(userId);
      if (error) return error;
      onSuccess(`Utilisateur « ${user?.login ?? ""} » supprimé.`);
      return null;
    },
  });

  return (
    <>
      <AdminSectionPanel
        className="lulu-admin-section--wide"
        icon={<UsersThree weight="duotone" size={28} />}
        title="Utilisateurs"
        description="Comptes applicatifs et rôles CHAR(4) — GEST, RCME, RMED, DIR, ADMN."
      >
        <div className="fr-table fr-table--bordered lulu-table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Login</th>
                <th scope="col">Nom affiché</th>
                <th scope="col">Rôle</th>
                <th scope="col">Profil</th>
                <th scope="col">Statut</th>
                <th scope="col">
                  <span className="fr-sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="fr-text--sm fr-text--mention">
                    Aucun utilisateur enregistré.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.login}</strong>
                      {user.login === PROTECTED_LOGIN ? (
                        <span className="fr-text--xs fr-text--mention fr-ml-1w">(principal)</span>
                      ) : null}
                    </td>
                    <td>{user.nomAffichage}</td>
                    <td>
                      <StatusBadge label={user.role} tone={ROLE_TONE[user.role]} />
                    </td>
                    <td className="fr-text--sm">{getRoleLabel(user.role)}</td>
                    <td>
                      <StatusBadge
                        label={user.actif ? "Actif" : "Inactif"}
                        tone={user.actif ? "success" : "neutral"}
                      />
                    </td>
                    <td>
                      <DropdownMenu
                        ariaLabel={`Actions pour ${user.login}`}
                        scopeLabel={user.login}
                        contextLabel={getRoleLabel(user.role)}
                        items={[
                          {
                            id: "edit",
                            label: "Modifier",
                            hint: "Ouvrir la fiche",
                            icon: <PencilSimple weight="duotone" size={20} aria-hidden />,
                            onClick: () => navigate(userEditPath(user.id)),
                          },
                          {
                            id: "toggle",
                            label: user.actif ? "Désactiver" : "Activer",
                            hint: user.actif ? "Suspendre l'accès" : "Rétablir l'accès",
                            icon: <Prohibit weight="duotone" size={20} aria-hidden />,
                            onClick: () => openToggleConfirm(user),
                          },
                          {
                            id: "delete",
                            label: "Supprimer",
                            hint: "Action irréversible",
                            icon: <Trash weight="duotone" size={20} aria-hidden />,
                            disabled: user.login === PROTECTED_LOGIN,
                            onClick: () => openDeleteConfirm(user),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="fr-mt-3w">
          <Link to={userCreatePath()} className="fr-btn fr-btn--secondary fr-btn--sm">
            <Plus weight="bold" size={16} aria-hidden className="lulu-btn-icon" />
            Utilisateur
          </Link>
        </div>
      </AdminSectionPanel>

      <ConfirmModals />
    </>
  );
}
