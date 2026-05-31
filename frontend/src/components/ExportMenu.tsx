import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Export, FilePdf, FileXls } from "@phosphor-icons/react";
import type { PageFilters } from "../lib/filters";

type ExportMenuProps = {
  filters: PageFilters;
  /** Ex. « Section 1 — Activité » */
  scopeLabel: string;
  onExportPdf: (filters: PageFilters) => void;
  onExportExcel: (filters: PageFilters) => void;
  onSnapshot: (filters: PageFilters) => void;
  /** Sous-texte des actions d'export (ex. « Section courante », « Comité de direction »). */
  actionHint?: string;
  /** Afficher l'action snapshot (défaut : true). */
  includeSnapshot?: boolean;
};

type PanelPosition = {
  top: number;
  left: number;
};

export function ExportMenu({
  filters,
  scopeLabel,
  onExportPdf,
  onExportExcel,
  onSnapshot,
  actionHint = "Section courante",
  includeSnapshot = true,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<PanelPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const margin = 8;
      const gap = 4;
      const rect = trigger.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;

      let top = rect.bottom + gap;
      if (top + panelHeight > window.innerHeight - margin) {
        top = rect.top - panelHeight - gap;
      }
      if (top < margin) {
        top = margin;
      }

      let left = rect.right - panelWidth;
      if (left < margin) left = margin;
      if (left + panelWidth > window.innerWidth - margin) {
        left = window.innerWidth - panelWidth - margin;
      }

      setPanelStyle({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, includeSnapshot, scopeLabel, filters.periodeLabel, filters.poleLabel]);

  useEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const context = `${filters.periodeLabel} · ${filters.poleLabel}`;

  function run(action: (filters: PageFilters) => void) {
    action(filters);
    setOpen(false);
  }

  const panel = open ? (
    <div
      ref={panelRef}
      className="lulu-export-menu__panel lulu-export-menu__panel--floating"
      id={menuId}
      role="menu"
      aria-label="Options d'export"
      style={
        panelStyle
          ? { top: panelStyle.top, left: panelStyle.left }
          : { visibility: "hidden" as const }
      }
    >
      <p className="lulu-export-menu__scope">{scopeLabel}</p>
      <p className="lulu-export-menu__context">{context}</p>
      <ul className="lulu-export-menu__list">
        <li role="none">
          <button
            type="button"
            role="menuitem"
            className="lulu-export-menu__item"
            onClick={() => run(onExportPdf)}
          >
            <FilePdf weight="duotone" size={20} aria-hidden />
            <span>
              Exporter en PDF
              <span className="lulu-export-menu__hint">{actionHint}</span>
            </span>
          </button>
        </li>
        <li role="none">
          <button
            type="button"
            role="menuitem"
            className="lulu-export-menu__item"
            onClick={() => run(onExportExcel)}
          >
            <FileXls weight="duotone" size={20} aria-hidden />
            <span>
              Exporter en Excel
              <span className="lulu-export-menu__hint">{actionHint}</span>
            </span>
          </button>
        </li>
        {includeSnapshot ? (
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="lulu-export-menu__item"
              onClick={() => run(onSnapshot)}
            >
              <Camera weight="duotone" size={20} aria-hidden />
              <span>
                Exporter snapshot
                <span className="lulu-export-menu__hint">Reporting figé</span>
              </span>
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  ) : null;

  return (
    <div className="lulu-export-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="fr-btn fr-btn--secondary fr-btn--sm fr-btn--menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Export weight="duotone" size={18} aria-hidden className="lulu-export-menu__trigger-icon" />
        Exporter
      </button>

      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
