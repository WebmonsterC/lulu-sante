import type { ReactNode } from "react";
import { POLES_CHUM } from "../data/poles-chum";
import { buildPageFilters, type PageFilters } from "../lib/filters";
import { TermLabel } from "./TermTooltip";

type GlobalFiltersProps = {
  filters?: PageFilters;
  onFiltersChange?: (filters: PageFilters) => void;
  showExport?: boolean;
  onExportPdf?: () => void;
  trailing?: ReactNode;
};

export function GlobalFilters({
  filters,
  onFiltersChange,
  showExport,
  onExportPdf,
  trailing,
}: GlobalFiltersProps) {
  const controlled = Boolean(filters && onFiltersChange);

  function handlePeriodeChange(periodeKey: string) {
    if (!onFiltersChange) return;
    onFiltersChange(buildPageFilters(periodeKey, filters?.poleId ?? ""));
  }

  function handlePoleChange(poleId: string) {
    if (!onFiltersChange) return;
    onFiltersChange(buildPageFilters(filters?.periodeKey ?? "mai", poleId));
  }

  return (
    <div className="lulu-filters">
      <div className="fr-select-group">
        <label className="fr-label" htmlFor="filtre-periode">
          Période
        </label>
        <select
          className="fr-select"
          id="filtre-periode"
          name="periode"
          value={controlled ? filters!.periodeKey : undefined}
          defaultValue={controlled ? undefined : "mai"}
          onChange={(e) => handlePeriodeChange(e.target.value)}
        >
          <option value="mai">Mai 2026</option>
          <option value="avril">Avril 2026</option>
        </select>
      </div>
      <div className="fr-select-group">
        <TermLabel htmlFor="filtre-pole" term="pole">
          Pôle
        </TermLabel>
        <select
          className="fr-select"
          id="filtre-pole"
          name="pole"
          value={controlled ? filters!.poleId : undefined}
          defaultValue={controlled ? undefined : ""}
          onChange={(e) => handlePoleChange(e.target.value)}
        >
          <option value="">Tous les pôles</option>
          {POLES_CHUM.map((p) => (
            <option key={p.id} value={p.id}>
              {p.libelle}
            </option>
          ))}
        </select>
      </div>
      {showExport && onExportPdf ? (
        <div className="lulu-filters__action">
          <button type="button" className="fr-btn fr-btn--secondary fr-btn--sm" onClick={onExportPdf}>
            Exporter PDF
          </button>
        </div>
      ) : null}
      {trailing}
    </div>
  );
}
