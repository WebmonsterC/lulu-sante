import { useCallback, useEffect, useState } from "react";
import {
  PROTECTED_LOGIN,
  type AppUser,
  type ProfileFormValues,
  type UserFormValues,
  validateProfileForm,
  validateUserForm,
} from "../data/users";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api-client";

export type AuditEntry = {
  id: string;
  date: string;
  user: string;
  action: string;
};

export function useUsersAdmin() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [usersData, auditData] = await Promise.all([
      apiGet<{ users: AppUser[] }>("/api/users"),
      apiGet<{ entries: AuditEntry[] }>("/api/audit"),
    ]);
    setUsers(usersData.users);
    setAuditLog(auditData.entries);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {
        setUsers([]);
        setAuditLog([]);
      })
      .finally(() => setLoading(false));
  }, [refresh]);

  const createUser = useCallback(
    async (values: UserFormValues): Promise<string | null> => {
      const error = validateUserForm(values, {
        mode: "create",
        existingLogins: users.map((user) => user.login),
      });
      if (error) return error;

      try {
        await apiPost("/api/users", values);
        await refresh();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Erreur lors de la création.";
      }
    },
    [refresh, users],
  );

  const updateUser = useCallback(
    async (userId: string, values: UserFormValues): Promise<string | null> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing) return "Utilisateur introuvable.";

      const error = validateUserForm(values, {
        mode: "edit",
        existingLogins: users.filter((user) => user.id !== userId).map((user) => user.login),
      });
      if (error) return error;

      try {
        await apiPatch(`/api/users/${userId}`, values);
        await refresh();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Erreur lors de la modification.";
      }
    },
    [refresh, users],
  );

  const toggleActive = useCallback(
    async (userId: string): Promise<string | null> => {
      try {
        await apiPost(`/api/users/${userId}/toggle-active`);
        await refresh();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Erreur lors du changement de statut.";
      }
    },
    [refresh],
  );

  const deleteUser = useCallback(
    async (userId: string): Promise<string | null> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing) return "Utilisateur introuvable.";
      if (existing.login === PROTECTED_LOGIN) {
        return "Le compte administrateur principal ne peut pas être supprimé.";
      }

      try {
        await apiDelete(`/api/users/${userId}`);
        await refresh();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Erreur lors de la suppression.";
      }
    },
    [refresh, users],
  );

  const updateProfile = useCallback(
    async (userId: string, values: ProfileFormValues): Promise<string | null> => {
      const error = validateProfileForm(values);
      if (error) return error;

      try {
        await apiPatch(`/api/users/${userId}/profile`, values);
        await refresh();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil.";
      }
    },
    [refresh],
  );

  return {
    users,
    auditLog,
    loading,
    refresh,
    createUser,
    updateUser,
    updateProfile,
    toggleActive,
    deleteUser,
  };
}
