# Lulu Santé — Frontend

Prototype UI **React + DSFR + Tailwind** pour l'application de pilotage APRS.

## Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [@codegouvfr/react-dsfr](https://react-dsfr.codegouv.studio/) — [Système de design de l'État](https://www.systeme-de-design.gouv.fr/)
- Tailwind CSS v4 (préfixe `tw-`, sans preflight)

Voir [specs/design-system.md](../specs/design-system.md) pour les conventions.

## Démarrage

```bash
npm install
npm run dev
```

### Parcours prototype

1. **Connexion** — `/`
2. **Dashboard** — KPI 3×3 + tableau alertes (liens vers fiches)
3. **Dossiers** — liste filtrable + wizard 3 étapes (modale)
4. **Fiche dossier** — `/dossiers/DOS-2026-0142` + onglets (Synthèse, Arrêts, CM, MT, Maintien, PPR, Retraite)
5. **Indicateurs** — grille §1–§8 (PPR en §8) + §9 KPI direction (page dédiée)
6. **KPI direction** — section 9, tableau comité
7. **Exports** — choix PDF/Excel par périmètre
8. **Administration** — utilisateurs, paramètres, sauvegarde

## Build

```bash
npm run build
npm run preview
```

Les assets DSFR sont copiés dans `public/dsfr/` via le script `postinstall`.
Les polices Marianne (absentes du package npm) sont téléchargées automatiquement dans `public/dsfr/fonts/`.
