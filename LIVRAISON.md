# Livraison de Lulu Santé (macOS)

Ce guide décrit comment livrer l'application pour qu'un référent APRS sur **macOS** (Sonoma, Sequoia ou plus récent) puisse l'installer, héberger le serveur sur son poste et permettre à des collègues du **même réseau local** d'y accéder via un navigateur.

## Architecture cible

```
┌─────────────────────────────────────────────────────────┐
│  Mac hôte (poste serveur)                               │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │ App macOS (.app) │───▶│ Serveur Node + SQLite    │   │
│  │ ou terminal      │    │ (port 8787)              │   │
│  └──────────────────┘    └───────────┬──────────────┘   │
└────────────────────────────────────────┼──────────────────┘
                                         │ Wi‑Fi / Ethernet
              ┌──────────────────────────┼──────────────────────────┐
              │  Autres postes (Mac/PC)  │                          │
              │  Navigateur → http://IP:8787/                       │
              └─────────────────────────────────────────────────────┘
```

**État actuel (v0.2) :**

- Interface React + **serveur Node/Express + SQLite** (`better-sqlite3`)
- Données partagées : utilisateurs, sessions, audit, snapshots, dossiers/agents (seed)
- Base SQLite : `data/lulu-sante.sqlite` (dev) ou dossier utilisateur Electron (`.app`)
- Emballage bureau Electron (`electron/`) — `.dmg` macOS et `.exe` Windows (NSIS)

---

## Option 1 — Serveur LAN (recommandée pour tester tout de suite)

Sur le Mac hôte :

### Prérequis

- **Node.js 20 LTS** ou plus récent — [https://nodejs.org](https://nodejs.org)

### Installation et démarrage

```bash
cd lulu-sante
npm run install:all
npm run start
```

Cela compile le frontend puis lance le serveur sur **http://0.0.0.0:8787**.

### Accès

| Qui | URL |
|-----|-----|
| Poste hôte | http://127.0.0.1:8787/ |
| Collègues sur le LAN | http://\<IP-du-Mac\>:8787/ |

L'écran de **connexion** affiche automatiquement :

- l'**adresse IP** du Mac sur le réseau local ;
- le **lien d'invitation** à copier/partager ;
- un rappel sur le pare-feu.

### Pare-feu macOS

Au premier lancement, macOS peut demander d'autoriser **Node** ou **Lulu Santé** à accepter les connexions entrantes → choisir **Autoriser**.

Sinon : **Réglages Système → Réseau → Pare-feu → Options** et autoriser l'application.

### Arrêt

`Ctrl + C` dans le terminal.

---

## Option 2 — Application macOS (.dmg)

L'utilisateur double-clique sur **Lulu Santé.app** : le serveur SQLite démarre en arrière-plan et la fenêtre s'ouvre.

### Prérequis de build

> **Important :** la construction d'un `.dmg` macOS doit se faire **sur un Mac** (ou via CI GitHub Actions `macos-latest`).

Sur le Mac de build :

```bash
cd lulu-sante
npm run install:all
npm run package:mac
```

### Option 2b — Build automatique GitHub Actions (sans Mac)

Le dépôt inclut `.github/workflows/build-mac.yml` : GitHub exécute le build sur un **Mac virtuel** (`macos-latest`).

#### Première utilisation

1. Pousser le projet sur **GitHub** (dépôt privé ou public).
2. Aller dans **Actions → Build macOS → Run workflow** (bouton « Run workflow »).
3. Attendre ~15–25 min (première exécution).
4. Télécharger le `.dmg` dans **Artifacts → lulu-sante-macos-dmg**.

#### Livraison par Release (recommandé)

1. **Releases → Create a new release**
2. Tag : `v0.2.0` (exemple) → **Publish release**
3. Le workflow se lance automatiquement et **attache le `.dmg`** à la release.
4. Distribuer le fichier `lulu-sante-0.2.0-mac.dmg` aux utilisateurs.

> L'app n'est pas signée Apple Developer : premier lancement → clic droit → **Ouvrir**.  
> Si macOS affiche « Impossible d'ouvrir le programme » : `xattr -cr "/Applications/Lulu Santé.app"` puis clic droit → Ouvrir.

Voir aussi `INSTALL-MAC.md` pour l'utilisateur final et `scripts/mac/` pour un build local manuel.

## Option 3 — Application Windows (.exe)

Sur une machine Windows :

```bash
cd lulu-sante
npm run install:all
npm run package:windows
```

Installeur NSIS dans `electron/dist/`. Même principe : serveur + SQLite embarqués, données dans `%APPDATA%/Lulu Santé/`.

Le fichier `.dmg` est généré dans `electron/dist/`.

### Distribution aux utilisateurs

1. Transférer le `.dmg` (clé USB, partage réseau interne, MDM interne…).
2. L'utilisateur ouvre le `.dmg` et glisse **Lulu Santé** dans **Applications**.
3. Au premier lancement : clic droit → **Ouvrir** si macOS bloque une app non signée.

### Signature et notarisation (production)

Pour une diffusion sans avertissement « développeur non identifié » :

1. Compte **Apple Developer** (99 USD/an).
2. Certificat **Developer ID Application**.
3. Signer avec `electron-builder` (`mac.identity`).
4. **Notariser** l'app auprès d'Apple (`notarize: true`).

Sans signature, l'app fonctionne en interne CHUM avec consignes d'ouverture manuelle.

---

## Développement local (deux terminaux)

Terminal 1 — serveur API + réseau :

```bash
cd server && npm install && npm run dev
```

Terminal 2 — interface Vite :

```bash
cd frontend && npm run dev
```

Vite proxy `/api` vers le port **8787** : le panneau réseau de la page de connexion fonctionne aussi en dev.

---

## Checklist livraison utilisateur final

- [ ] Mac à jour (macOS 14+ recommandé)
- [ ] Node 20+ installé (option serveur) **ou** `.dmg` installé (option bureau)
- [ ] Pare-feu autorise le port **8787**
- [ ] Tous les postes clients sur le **même réseau** (pas de VPN isolant)
- [ ] Compte admin créé (`admin` / mot de passe défini)
- [ ] Lien d'invitation testé depuis un second poste
- [ ] Sauvegarde des données prévue avant mise à jour (SQLite à venir)

---

## Prochaines étapes techniques

| Étape | Objectif |
|-------|----------|
| API + SQLite | Persistance réelle des dossiers, utilisateurs, audit |
| Serveur unique | Remplacer `localStorage` par appels API |
| Auto-update | Mises à jour `.dmg` via canal interne |
| HTTPS local | Optionnel ; en LAN HTTP suffit en intranet |

---

## Dépannage

**Le lien d'invitation ne s'ouvre pas sur un autre poste**

- Vérifier l'IP affichée sur l'écran de connexion du Mac hôte
- Ping `IP` depuis l'autre poste
- Désactiver temporairement le pare-feu pour tester
- Vérifier que les deux postes sont sur le même sous-réseau (ex. 192.168.1.x)

**« Non disponible — démarrez le serveur » sur la page de connexion**

- L'UI est ouverte via `npm run dev` sans serveur → lancer `server` en parallèle
- Ou utiliser `npm run start` / l'app Electron

**Données différentes selon le poste**

- Normal en prototype : chaque navigateur a son propre `localStorage`
- Résolu quand SQLite + API seront branchés sur le Mac hôte
