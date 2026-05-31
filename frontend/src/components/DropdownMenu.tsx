import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DotsThreeVertical } from "@phosphor-icons/react";

export type DropdownMenuItem = {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type DropdownMenuProps = {
  triggerLabel?: ReactNode;
  triggerIcon?: ReactNode;
  triggerClassName?: string;
  className?: string;
  ariaLabel: string;
  scopeLabel?: string;
  contextLabel?: string;
  items: DropdownMenuItem[];
};

type PanelPosition = {
  top: number;
  left: number;
};

export function DropdownMenu({
  triggerLabel = "Actions",
  triggerIcon,
  triggerClassName,
  className,
  ariaLabel,
  scopeLabel,
  contextLabel,
  items,
}: DropdownMenuProps) {
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
      if (top < margin) top = margin;

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
  }, [open, items.length, scopeLabel, contextLabel]);

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

  function run(item: DropdownMenuItem) {
    if (item.disabled) return;
    item.onClick();
    setOpen(false);
  }

  const panel = open ? (
    <div
      ref={panelRef}
      className="lulu-export-menu__panel lulu-export-menu__panel--floating"
      id={menuId}
      role="menu"
      aria-label={ariaLabel}
      style={
        panelStyle
          ? { top: panelStyle.top, left: panelStyle.left }
          : { visibility: "hidden" as const }
      }
    >
      {scopeLabel ? <p className="lulu-export-menu__scope">{scopeLabel}</p> : null}
      {contextLabel ? <p className="lulu-export-menu__context">{contextLabel}</p> : null}
      <ul className="lulu-export-menu__list">
        {items.map((item) => (
          <li key={item.id} role="none">
            <button
              type="button"
              role="menuitem"
              className="lulu-export-menu__item"
              disabled={item.disabled}
              onClick={() => run(item)}
            >
              {item.icon}
              <span>
                {item.label}
                {item.hint ? <span className="lulu-export-menu__hint">{item.hint}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <div className={className ? `lulu-export-menu ${className}` : "lulu-export-menu"} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={
          triggerClassName ??
          "fr-btn fr-btn--secondary fr-btn--sm fr-btn--menu"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {triggerIcon ?? (
          <DotsThreeVertical weight="duotone" size={18} aria-hidden className="lulu-export-menu__trigger-icon" />
        )}
        {triggerLabel}
      </button>
      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
