import type { ReactNode } from "react";
import { ExportMenu } from "./ExportMenu";
import type { PageFilters } from "../lib/filters";

type ExportScopeCardProps = {
  icon: ReactNode;
  label: string;
  description: string;
  filters: PageFilters;
  scopeLabel: string;
  actionHint?: string;
  includeSnapshot?: boolean;
  onExportPdf: (filters: PageFilters) => void;
  onExportExcel: (filters: PageFilters) => void;
  onSnapshot?: (filters: PageFilters) => void;
};

export function ExportScopeCard({
  icon,
  label,
  description,
  filters,
  scopeLabel,
  actionHint,
  includeSnapshot = true,
  onExportPdf,
  onExportExcel,
  onSnapshot,
}: ExportScopeCardProps) {
  return (
    <article className="lulu-chart lulu-export-scope">
      <div className="lulu-export-scope__header">
        <div className="lulu-export-scope__intro">
          <span className="lulu-export-scope__icon" aria-hidden>
            {icon}
          </span>
          <div>
            <h2 className="fr-h6 fr-mb-1w">{label}</h2>
            <p className="fr-text--sm fr-text--mention fr-mb-0">{description}</p>
          </div>
        </div>
        <ExportMenu
          filters={filters}
          scopeLabel={scopeLabel}
          actionHint={actionHint}
          includeSnapshot={includeSnapshot && Boolean(onSnapshot)}
          onExportPdf={onExportPdf}
          onExportExcel={onExportExcel}
          onSnapshot={onSnapshot ?? (() => undefined)}
        />
      </div>
      <p className="lulu-export-scope__context fr-text--xs fr-text--mention fr-mb-0 fr-mt-3w">
        Période : <strong>{filters.periodeLabel}</strong> · Pôle :{" "}
        <strong>{filters.poleLabel}</strong>
      </p>
    </article>
  );
}
