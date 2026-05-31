import { apiGet, apiPatch } from "./api-client";

export type AppConfig = {
  joursOuvrablesMensuels: number;
  seuilAttenteJours: number;
  databasePath: string;
  lastBackupAt: string | null;
};

export function fetchConfig(): Promise<AppConfig> {
  return apiGet<AppConfig>("/api/config");
}

export function updateConfig(payload: { joursOuvrablesMensuels: number }): Promise<AppConfig> {
  return apiPatch<AppConfig>("/api/config", payload);
}

export async function downloadDatabaseBackup(): Promise<void> {
  const response = await fetch("/api/config/backup", { credentials: "include" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Échec du téléchargement de la sauvegarde.");
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `lulu-sante-${stamp}.sqlite`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatConfigDate(iso: string | null): string {
  if (!iso) return "Aucune sauvegarde enregistrée";
  return new Date(iso).toLocaleString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
