/** Compare deux dates ISO. Retourne -1, 0 ou 1. */
export function compareIsoDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Vérifie qu'une date ISO respecte les bornes min/max (inclusives). */
export function isIsoInRange(iso: string, minDate?: string, maxDate?: string): boolean {
  if (!iso) return true;
  if (minDate && compareIsoDates(iso, minDate) < 0) return false;
  if (maxDate && compareIsoDates(iso, maxDate) > 0) return false;
  return true;
}

/** Message d'erreur si la date est hors bornes, sinon null. */
export function getIsoRangeError(
  iso: string,
  minDate?: string,
  maxDate?: string,
): string | null {
  if (!iso) return null;
  if (minDate && compareIsoDates(iso, minDate) < 0) {
    return `La date ne peut pas être antérieure au ${formatDateFr(minDate)}.`;
  }
  if (maxDate && compareIsoDates(iso, maxDate) > 0) {
    return `La date ne peut pas être postérieure au ${formatDateFr(maxDate)}.`;
  }
  return null;
}

/** Vérifie qu'une date de fin n'est pas antérieure à une date de début. */
export function isEndDateValid(debut: string, fin: string): boolean {
  if (!debut || !fin) return true;
  return compareIsoDates(fin, debut) >= 0;
}

/** Retourne la date ISO la plus ancienne parmi celles fournies. */
export function minIso(...dates: Array<string | undefined | null>): string | undefined {
  const filled = dates.filter((d): d is string => Boolean(d));
  if (filled.length === 0) return undefined;
  return filled.reduce((min, d) => (compareIsoDates(d, min) < 0 ? d : min));
}

/** Formate une date ISO (aaaa-mm-jj) en jj/mm/aaaa. */
export function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Convertit une date ISO en objet Date (heure locale, minuit). */
export function isoToDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Convertit un objet Date en date ISO (aaaa-mm-jj). */
export function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse jj/mm/aaaa ou j/m/aaaa → ISO, ou null si invalide. */
export function parseDateFr(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return dateToIso(date);
}
