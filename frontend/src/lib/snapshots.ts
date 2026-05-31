import type { PageFilters } from "./filters";
import { apiGet, apiPost } from "./api-client";

export type SnapshotKind = "dashboard" | "indicateur-section" | "indicateur-catalog" | "kpi";

export type SnapshotRecord = {
  id: string;
  kind: SnapshotKind;
  label: string;
  filters: PageFilters;
  data: unknown;
  createdAt: string;
};

export async function saveSnapshot(
  input: Omit<SnapshotRecord, "id" | "createdAt">,
): Promise<{ record: SnapshotRecord; total: number }> {
  const response = await apiPost<{ snapshot: SnapshotRecord; total: number }>("/api/snapshots", input);
  return { record: response.snapshot, total: response.total };
}

export async function listSnapshots(): Promise<SnapshotRecord[]> {
  const response = await apiGet<{ snapshots: SnapshotRecord[] }>("/api/snapshots");
  return response.snapshots;
}

export function formatSnapshotNotice(record: SnapshotRecord, total: number): string {
  const date = new Date(record.createdAt).toLocaleString("fr-CA", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return `Snapshot « ${record.label} » enregistré le ${date} (${total} snapshot${total > 1 ? "s" : ""} sur le serveur).`;
}
