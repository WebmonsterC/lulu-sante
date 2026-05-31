#!/bin/bash
# Double-cliquez ce fichier dans le Finder pour construire Lulu Santé (.dmg)
# macOS 14+ recommandé · Node.js 20+ requis

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   Lulu Santé — construction macOS        ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  Dossier : $ROOT"
echo ""

# ── Node.js ──────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "  ✗ Node.js n'est pas installé."
  echo ""
  echo "  1. Ouvrez https://nodejs.org dans Safari"
  echo "  2. Téléchargez la version « LTS » (bouton vert)"
  echo "  3. Installez, puis relancez ce script"
  echo ""
  read -r -p "  Appuyez sur Entrée pour quitter…"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "  ✗ Node.js 20 ou plus récent requis (actuel : $(node -v))"
  echo "    Mettez à jour sur https://nodejs.org"
  read -r -p "  Appuyez sur Entrée pour quitter…"
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# ── Outils de compilation Apple (obligatoire pour Electron) ──────────
if ! xcode-select -p >/dev/null 2>&1; then
  echo ""
  echo "  Les outils de développement Apple sont requis (installation unique)."
  echo "  Une fenêtre système va s'ouvrir — cliquez « Installer »."
  echo ""
  xcode-select --install || true
  echo ""
  echo "  Une fois l'installation terminée, relancez ce script."
  read -r -p "  Appuyez sur Entrée pour quitter…"
  exit 1
fi
echo "  ✓ Outils Apple (Xcode Command Line Tools)"

# ── Construction ───────────────────────────────────────────────────
echo ""
echo "  ⏳ Installation des dépendances (5–10 min la première fois)…"
echo ""
npm run install:all

echo ""
echo "  ⏳ Compilation de l'application (.dmg)…"
echo "     Ne fermez pas cette fenêtre."
echo ""
npm run package:mac

DMG="$(find "$ROOT/electron/dist" -maxdepth 1 -name '*.dmg' -print -quit 2>/dev/null || true)"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   ✓ Construction terminée                ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
if [ -n "$DMG" ]; then
  echo "  Fichier créé :"
  echo "  $DMG"
  echo ""
  echo "  → Double-cliquez le .dmg, glissez « Lulu Santé » dans Applications."
  echo "  → Premier lancement : clic droit → Ouvrir (app non signée)."
  echo ""
  open "$ROOT/electron/dist" 2>/dev/null || true
else
  echo "  Consultez le dossier electron/dist/"
fi
echo ""
read -r -p "  Appuyez sur Entrée pour fermer…"
