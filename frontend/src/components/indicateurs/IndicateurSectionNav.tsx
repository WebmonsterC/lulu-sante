import { Link } from "react-router-dom";
import { ChartLineUp } from "@phosphor-icons/react";
import {
  INDICATEUR_SECTIONS,
  INDICATEUR_SECTION_KPI,
  type IndicateurNavActiveId,
} from "../../data/indicateurs";

type IndicateurSectionNavProps = {
  activeId: IndicateurNavActiveId;
  onNavigate?: () => void;
};

export function IndicateurSectionNav({ activeId, onNavigate }: IndicateurSectionNavProps) {
  const kpiSelected = activeId === "kpi";

  return (
    <nav className="lulu-indicateurs__nav-grid" aria-label="Sections du catalogue indicateurs">
      {INDICATEUR_SECTIONS.map((section) => {
        const selected = section.id === activeId;
        return (
          <Link
            key={section.id}
            to={`/indicateurs/${section.id}`}
            className={`lulu-indicateurs__nav-item${selected ? " lulu-indicateurs__nav-item--selected" : ""}`}
            aria-current={selected ? "page" : undefined}
            onClick={onNavigate}
          >
            <span className="lulu-indicateurs__nav-number">Section {section.catalogNumber}</span>
            <span className="lulu-indicateurs__nav-title">{section.navTitle}</span>
          </Link>
        );
      })}
      <Link
        to={INDICATEUR_SECTION_KPI.href}
        className={`lulu-indicateurs__nav-item lulu-indicateurs__nav-item--kpi${kpiSelected ? " lulu-indicateurs__nav-item--selected" : ""}`}
        aria-current={kpiSelected ? "page" : undefined}
        onClick={onNavigate}
      >
        <span className="lulu-indicateurs__nav-number">
          Section {INDICATEUR_SECTION_KPI.catalogNumber}
        </span>
        <span className="lulu-indicateurs__nav-title lulu-indicateurs__nav-title--kpi">
          <ChartLineUp weight="duotone" size={16} aria-hidden />
          {INDICATEUR_SECTION_KPI.navTitle}
        </span>
        {!kpiSelected ? (
          <span className="lulu-indicateurs__nav-hint">Page dédiée →</span>
        ) : null}
      </Link>
    </nav>
  );
}
