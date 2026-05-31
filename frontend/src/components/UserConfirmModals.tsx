import { useMemo, useState, type ReactNode } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import type { AppUser } from "../data/users";

type ConfirmModalProps = {
  modal: ReturnType<typeof createModal>;
  user: AppUser | null;
  title: string;
  confirmLabel: string;
  message: ReactNode;
  onConfirm: () => string | null | Promise<string | null>;
};

function ConfirmModal({ modal, user, title, confirmLabel, message, onConfirm }: ConfirmModalProps) {
  const { Component: Modal } = modal;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  function handleClose() {
    setError(null);
    modal.close();
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      const validationError = await Promise.resolve(onConfirm());
      if (validationError) {
        setError(validationError);
        return;
      }
      handleClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      buttons={[
        { children: "Annuler", priority: "secondary", onClick: handleClose, disabled: busy },
        { children: confirmLabel, onClick: handleConfirm, disabled: busy },
      ]}
    >
      {error ? (
        <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-3w" role="alert">
          <p className="fr-alert__title">Erreur</p>
          <p className="fr-alert__desc fr-mb-0">{error}</p>
        </div>
      ) : null}
      {message}
    </Modal>
  );
}

export function useUserConfirmModals(handlers: {
  onToggle: (userId: string) => string | null | Promise<string | null>;
  onDelete: (userId: string) => string | null | Promise<string | null>;
}) {
  const toggleModalRef = useMemo(
    () => createModal({ id: "admin-user-toggle", isOpenedByDefault: false }),
    [],
  );
  const deleteModalRef = useMemo(
    () => createModal({ id: "admin-user-delete", isOpenedByDefault: false }),
    [],
  );

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  function openToggleConfirm(user: AppUser) {
    setSelectedUser(user);
    toggleModalRef.open();
  }

  function openDeleteConfirm(user: AppUser) {
    setSelectedUser(user);
    deleteModalRef.open();
  }

  return {
    openToggleConfirm,
    openDeleteConfirm,
    ConfirmModals: () => (
      <>
        <ConfirmModal
          modal={toggleModalRef}
          user={selectedUser}
          title={selectedUser?.actif ? "Désactiver le compte" : "Activer le compte"}
          confirmLabel={selectedUser?.actif ? "Désactiver" : "Activer"}
          message={
            <p className="fr-mb-0">
              {selectedUser?.actif ? (
                <>
                  Confirmer la désactivation du compte <strong>{selectedUser.login}</strong> (
                  {selectedUser.nomAffichage}) ? L&apos;utilisateur ne pourra plus se connecter.
                </>
              ) : (
                <>
                  Confirmer l&apos;activation du compte <strong>{selectedUser?.login}</strong> (
                  {selectedUser?.nomAffichage}) ?
                </>
              )}
            </p>
          }
          onConfirm={() => (selectedUser ? handlers.onToggle(selectedUser.id) : "Utilisateur introuvable.")}
        />
        <ConfirmModal
          modal={deleteModalRef}
          user={selectedUser}
          title="Supprimer l'utilisateur"
          confirmLabel="Supprimer"
          message={
            <p className="fr-mb-0">
              Confirmer la suppression du compte <strong>{selectedUser?.login}</strong> (
              {selectedUser?.nomAffichage}) ? Cette action est irréversible.
            </p>
          }
          onConfirm={() => (selectedUser ? handlers.onDelete(selectedUser.id) : "Utilisateur introuvable.")}
        />
      </>
    ),
  };
}
