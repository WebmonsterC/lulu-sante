import { useId, useState, type ReactNode } from "react";
import { Info } from "@phosphor-icons/react";
import { getGlossaryTerm, type GlossaryKey } from "../data/glossary";

type TermTooltipProps = {
  term: GlossaryKey;
  /** Position de l'infobulle par rapport au déclencheur. */
  placement?: "top" | "bottom";
};

export function TermTooltip({ term, placement = "top" }: TermTooltipProps) {
  const { title, definition } = getGlossaryTerm(term);
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={`lulu-term-tooltip lulu-term-tooltip--${placement}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        className="lulu-term-tooltip__btn"
        aria-describedby={visible ? tooltipId : undefined}
        aria-label={`Définition : ${title}`}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        <Info weight="duotone" size={16} aria-hidden />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`fr-tooltip fr-placement fr-tooltip--shown${visible ? "" : " lulu-term-tooltip__panel--hidden"}`}
      >
        {definition}
      </span>
    </span>
  );
}

type TermLabelProps = {
  htmlFor?: string;
  term?: GlossaryKey;
  required?: boolean;
  hintText?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Label de formulaire DSFR avec infobulle optionnelle. */
export function TermLabel({
  htmlFor,
  term,
  required,
  hintText,
  children,
  className = "fr-label",
}: TermLabelProps) {
  return (
    <label className={`${className} lulu-term-label`} htmlFor={htmlFor}>
      <span className="lulu-term-label__row">
        <span>{children}</span>
        {required ? " *" : null}
        {term ? <TermTooltip term={term} /> : null}
      </span>
      {hintText ? <span className="fr-hint-text">{hintText}</span> : null}
    </label>
  );
}

type TermHeadingProps = {
  term?: GlossaryKey;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  children: ReactNode;
};

/** Titre avec infobulle contextuelle (tuiles KPI, sections). */
export function TermHeading({
  term,
  as: Tag = "h3",
  className,
  children,
}: TermHeadingProps) {
  return (
    <Tag className={className}>
      <span className="lulu-term-label__row">
        <span>{children}</span>
        {term ? <TermTooltip term={term} /> : null}
      </span>
    </Tag>
  );
}

type TermTableHeaderProps = {
  term?: GlossaryKey;
  children: ReactNode;
};

export function TermTableHeader({ term, children }: TermTableHeaderProps) {
  return (
    <th scope="col">
      <span className="lulu-term-label__row lulu-term-label__row--header">
        <span>{children}</span>
        {term ? <TermTooltip term={term} placement="bottom" /> : null}
      </span>
    </th>
  );
}
