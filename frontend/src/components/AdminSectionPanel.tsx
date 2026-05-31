import type { ReactNode } from "react";

type AdminSectionPanelProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function AdminSectionPanel({
  icon,
  title,
  description,
  children,
  className = "",
}: AdminSectionPanelProps) {
  return (
    <article className={`lulu-chart lulu-admin-section ${className}`.trim()}>
      <header className="lulu-admin-section__header">
        <span className="lulu-export-scope__icon" aria-hidden>
          {icon}
        </span>
        <div>
          <h2 className="fr-h6 fr-mb-1w">{title}</h2>
          <p className="fr-text--sm fr-text--mention fr-mb-0">{description}</p>
        </div>
      </header>
      <div className="lulu-admin-section__body">{children}</div>
    </article>
  );
}
