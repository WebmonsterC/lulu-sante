export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

export function auditDisplayDate(iso) {
  return new Date(iso).toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}
