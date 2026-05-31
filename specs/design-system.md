# Design system — Lulu Santé

**Version :** 1.0  
**Date :** 30 mai 2026  
**Références :** [DSFR — Prise en main développeur](https://www.systeme-de-design.gouv.fr/version-courante/fr/premiers-pas/vous-etes-developpeur/prise-en-main) · [react-dsfr](https://react-dsfr.codegouv.studio/) · [Maquettes](./maquettes-ecrans.md)

---

## 1. Choix retenus

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Composants UI** | `@codegouvfr/react-dsfr` | Boutons, formulaires, en-tête, navigation, alertes, onglets — conformité DSFR / RGAA |
| **Mise en page** | **Tailwind CSS** (préfixe `tw-`) | Grilles applicatives, espacements internes, responsive hors composants DSFR |
| **Tokens couleur** | Variables CSS DSFR (`--background-*`, `--text-*`, etc.) | Cohérence visuelle avec l’État ; exposées dans `tailwind.config` |
| **Typographie** | **Marianne** (police officielle DSFR) | Chargée via react-dsfr ; pas de police tierce |
| **Icônes** | **Remix Icon** + **DSFR icons** (`fr-icon-*`) | Via feuille `icons.min.css` |

> **Canvas Cursor** : les maquettes interactives restent en `cursor/canvas` (contrainte SDK). L’application réelle suit ce design system DSFR + Tailwind dans `frontend/`.

---

## 2. Principes de cohabitation DSFR + Tailwind

1. **DSFR en priorité** pour tout élément d’interface standard (champ, bouton, fil d’Ariane, menu latéral, tableau de bord institutionnel).
2. **Tailwind pour le layout** : conteneurs, colonnes KPI, zones de filtres, espacements entre blocs — classes préfixées `tw-` pour éviter les conflits avec les utilitaires `fr-*`.
3. **Pas de preflight Tailwind** : le reset CSS de Tailwind est désactivé pour ne pas écraser les styles DSFR.
4. **Pas de surcouche visuelle** : ne pas re-styler les composants DSFR avec Tailwind (`!important`, override de bordures, etc.).
5. **Couleurs sémantiques DSFR** : info, success, warning, error — pas de palette ad hoc.

---

## 3. Tokens principaux (DSFR)

| Token | Usage Lulu Santé |
|-------|------------------|
| `blue-france` | Actions primaires, liens, éléments actifs |
| `red-marianne` | Alertes critiques, seuils dépassés |
| `green-emeraude` | Indicateurs favorables, validations |
| `background-default-grey` | Fond de page |
| `background-alt-grey` | Cartes, panneaux |
| `text-default-grey` | Texte courant |
| `text-mention-grey` | Métadonnées, libellés secondaires |

Accès en code :

```tsx
import { fr } from "@codegouvfr/react-dsfr/fr";

// Variable CSS (recommandé)
fr.colors.decisions.background.default.grey.default;

// Classe utilitaire DSFR
fr.cx("fr-p-4v", "fr-mb-2w");
```

---

## 4. Correspondance maquettes → composants DSFR

| Composant maquette | Composant DSFR / react-dsfr |
|--------------------|----------------------------|
| `AppShell` | `Header` + `SideMenu` + layout Tailwind |
| `LoginCard` | `main` centré + `Input` + `PasswordInput` + `Button` |
| `WizardModal` | `Modal` + `Stepper` |
| `WizardSteps` | `Stepper` |
| `FicheHeader` | `Breadcrumb` + titre `h1` |
| `FicheTabBar` | `Tabs` |
| `WireField` / `WireSelect` | `Input` / `Select` |
| `Stat` | `Tile` ou carte `fr-card` + typo DSFR |
| `Table` | `Table` (react-dsfr) ou tableau HTML avec classes `fr-table` |
| Alertes dashboard | `Callout` / `Alert` |
| Filtres période/pôle | `Select` + `SegmentedControl` si pertinent |

---

## 5. Structure de page type

```
┌─────────────────────────────────────────────────────────┐
│ Header DSFR — marque · titre service · accès rapide     │
├──────────────┬──────────────────────────────────────────┤
│ SideMenu     │  Breadcrumb                              │
│ (navigation) │  Titre H1 + actions                      │
│              │  ┌─ Filtres globaux (période, pôle) ─┐   │
│              │  └───────────────────────────────────┘   │
│              │  Contenu (grille Tailwind tw-grid…)      │
└──────────────┴──────────────────────────────────────────┘
```

- **Header** : « République Française » + « Lulu Santé — Pilotage APRS ».
- **SideMenu** : Dashboard, Dossiers, Indicateurs, KPI direction, Exports, Administration (selon RBAC).
- **Filtres globaux** : barre persistante sous le titre sur les écrans analytiques.

---

## 6. Accessibilité (RGAA AA)

| Exigence | Mise en œuvre |
|----------|---------------|
| Contraste | Tokens DSFR certifiés |
| Navigation clavier | Composants DSFR natifs |
| Libellés formulaires | `label` explicite sur chaque `Input` |
| Mot de passe | `PasswordInput` avec bouton afficher/masquer |
| Langue | `lang="fr"` sur `<html>` |
| Focus visible | Styles DSFR — ne pas les supprimer |

---

## 7. Prototype frontend

Le dossier `frontend/` contient une application **Vite + React + TypeScript** :

```bash
cd frontend
npm install
npm run dev
```

- Écran **Connexion** (DSFR)
- **Dashboard** minimal avec shell Header + SideMenu
- Configuration Tailwind v4 sans preflight, préfixe `tw-`

---

## 8. Évolutions prévues

- [ ] Thème collectivité (logo opérateur dans `Header.operatorLogo`)
- [ ] Composants métier : tuile KPI APRS, tableau alertes
- [ ] Mode sombre (optionnel — `defaultColorScheme: "system"`)
- [ ] Storybook ou page « design system » interne listant les composants utilisés

---

*Stack UI proposée pour le MVP client/serveur LAN — compatible navigateur et encapsulation desktop (Tauri/Electron) ultérieure.*
