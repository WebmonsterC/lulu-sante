# Installer Lulu Santé sur Mac (sans être développeur)

Ce guide s’adresse à un référent APRS qui reçoit le **dossier source** du projet et doit obtenir une application utilisable sur son Mac.

---

## Deux options

| Option | Difficulté | Résultat |
|--------|------------|----------|
| **A — Serveur navigateur** | ★ Facile | Ouvrir Lulu Santé dans Safari/Chrome (icône dans le Dock possible) |
| **B — Application .app (.dmg)** | ★★ Moyen | Vraie app « Lulu Santé » comme sur Windows |

---

## Prérequis (une seule fois)

1. **Mac** avec macOS 14 (Sonoma) ou plus récent  
2. **Node.js LTS** — [https://nodejs.org](https://nodejs.org)  
   - Télécharger le gros bouton vert « LTS »  
   - Installer en cliquant sur « Continuer » partout  
3. Pour l’option B uniquement : **Outils de ligne de commande Xcode**  
   - Le script de construction les propose automatiquement au premier lancement  

---

## Option A — La plus simple (recommandée pour débuter)

1. Décompresser le dossier `lulu-sante` (Bureau ou Documents)  
2. Ouvrir le dossier `scripts/mac/`  
3. **Double-cliquer** sur **`Demarrer-Serveur-Lulu-Sante.command`**  
   - macOS peut demander « Autoriser » → **Ouvrir**  
4. Attendre le message « Démarrage sur http://127.0.0.1:8787 »  
5. Safari s’ouvre ou aller manuellement à cette adresse  
6. Connexion : `admin` / `Lulu2026!`  

**Collègues sur le réseau :** l’adresse à partager apparaît sur l’écran de connexion.

**Arrêter :** fermer la fenêtre Terminal ou `Ctrl+C`.

---

## Option B — Construire l’application (.dmg)

1. Décompresser le dossier `lulu-sante`  
2. Ouvrir `scripts/mac/`  
3. **Double-cliquer** sur **`Construire-Lulu-Sante.command`**  
4. Attendre **10 à 20 minutes** (première fois : téléchargement d’Electron)  
5. Le dossier `electron/dist/` s’ouvre avec le fichier **`.dmg`**  
6. Double-cliquer le `.dmg` → glisser **Lulu Santé** dans **Applications**  
7. **Premier lancement :** clic droit sur l’app → **Ouvrir** → **Ouvrir**  
   (normal tant que l’app n’est pas signée Apple Developer)

---

## Si macOS bloque le script

> « Impossible d’ouvrir car le développeur n’est pas identifié »

1. **Réglages Système → Confidentialité et sécurité**  
2. Descendre → **Autoriser quand même** pour le script  
3. Ou : clic droit sur le `.command` → **Ouvrir**

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « Node.js n'est pas installé » | Installer depuis nodejs.org, relancer le script |
| Construction très longue | Normal la 1re fois (plusieurs Go téléchargés) |
| « port 8787 déjà utilisé » | Quitter une ancienne instance Lulu Santé |
| Collègues ne voient pas l’app | Pare-feu Mac → autoriser Lulu Santé / Node |
| Erreur `better-sqlite3` | Relancer après installation Xcode Command Line Tools |

---

## Alternative : recevoir un .dmg déjà compilé

Si la construction sur le Mac échoue, l’équipe projet peut fournir un **.dmg prêt à l’emploi**, compilé automatiquement (GitHub Actions, Mac du service informatique, etc.) — **aucune compilation chez l’utilisateur**.

L’option A (serveur navigateur) reste la solution de secours la plus fiable pour un non-développeur.
