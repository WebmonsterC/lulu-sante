import type { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";

/** Pont react-router → types DSFR (LinkProps générique non inféré par react-dsfr). */
export function linkTo(to: string, title?: string): RegisteredLinkProps {
  return { to, title } as RegisteredLinkProps;
}
