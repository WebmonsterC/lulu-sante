import type { AppUser } from "../data/users";
import { apiGet, apiPost } from "./api-client";

export const PROTOTYPE_DEFAULT_PASSWORD = "Lulu2026!";

export async function fetchCurrentUser(): Promise<AppUser | null> {
  try {
    const data = await apiGet<{ user: AppUser }>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function loginWithApi(login: string, password: string): Promise<AppUser> {
  const data = await apiPost<{ user: AppUser }>("/api/auth/login", { login, password });
  return data.user;
}

export async function logoutApi(): Promise<void> {
  try {
    await apiPost("/api/auth/logout");
  } catch {
    // session déjà expirée
  }
}

/** @deprecated Utiliser fetchCurrentUser — conservé pour compatibilité sync minimale */
export function isAuthenticated(): boolean {
  return false;
}

/** @deprecated */
export function getCurrentUserId(): string | null {
  return null;
}

/** @deprecated */
export function getCurrentUser(): AppUser | null {
  return null;
}

/** @deprecated */
export function login(_userId: string): void {}

/** @deprecated */
export function logout(): void {
  void logoutApi();
}

/** @deprecated */
export function authenticate(_identifiant: string, _motDePasse: string): AppUser | null {
  return null;
}

/** @deprecated */
export function repairLegacySession(): AppUser | null {
  return null;
}
