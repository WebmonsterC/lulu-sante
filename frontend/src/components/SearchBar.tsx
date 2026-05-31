import { MagnifyingGlass } from "@phosphor-icons/react";

type SearchBarProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Barre de recherche DSFR (fr-search-bar) avec icône Phosphor duotone.
 * @see https://www.systeme-de-design.gouv.fr/version-courante/fr/composants/barre-de-recherche/design-de-la-barre-de-recherche
 */
export function SearchBar({
  id,
  label,
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="fr-search-bar" role="search" id={id}>
      <label className="fr-label" htmlFor={`${id}-input`}>
        {label}
      </label>
      <input
        className="fr-input"
        id={`${id}-input`}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="fr-btn lulu-search-bar__btn"
        title="Rechercher"
        aria-label="Rechercher"
      >
        <MagnifyingGlass weight="duotone" size={20} aria-hidden />
      </button>
    </div>
  );
}
