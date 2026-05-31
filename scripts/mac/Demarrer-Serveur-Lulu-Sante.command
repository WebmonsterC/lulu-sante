#!/bin/bash
# Mode simple sans .app : lance le serveur dans le navigateur
# Idéal si la construction Electron échoue ou pour tester rapidement

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo ""
echo "  Lulu Santé — mode serveur (navigateur)"
echo "  Dossier : $ROOT"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Installez Node.js LTS depuis https://nodejs.org puis relancez."
  read -r -p "  Entrée pour quitter…"
  exit 1
fi

echo "  Installation des dépendances si nécessaire…"
npm run install:all

echo ""
echo "  Démarrage sur http://127.0.0.1:8787"
echo "  Arrêt : Ctrl+C dans cette fenêtre"
echo ""
npm run start
