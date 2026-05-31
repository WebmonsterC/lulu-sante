# Lulu Santé

Application de pilotage APRS (CHUM) — frontend React/DSFR, serveur Node + SQLite, emballage Electron.

## Démarrage rapide (développement)

```bash
npm run install:all
npm run start
```

→ http://127.0.0.1:8787 — compte démo : `admin` / `Lulu2026!`

## Documentation

| Fichier | Contenu |
|---------|---------|
| [LIVRAISON.md](./LIVRAISON.md) | Livraison réseau, Windows, macOS, GitHub Actions |
| [INSTALL-MAC.md](./INSTALL-MAC.md) | Guide utilisateur Mac (scripts double-clic) |
| [specs/](./specs/) | Cahier des charges, schéma BDD, maquettes |

## Build bureau

```bash
npm run package:windows   # Windows (.exe)
npm run package:mac       # macOS (.dmg) — sur Mac ou via GitHub Actions
```

## CI macOS (GitHub Actions)

Workflow **Build macOS** : onglet [Actions](https://github.com/WebmonsterC/lulu-sante/actions) → **Run workflow**, ou publier une **Release** pour attacher le `.dmg` automatiquement.
