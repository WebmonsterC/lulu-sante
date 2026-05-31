/**
 * Copie les SVG d'icônes DSFR référencés par utility/icons/icons.min.css.
 * react-dsfr copy-static-assets ne copie que le CSS, pas les fichiers icons/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "../node_modules/@gouvfr/dsfr/dist/icons");
const destDir = path.join(__dirname, "../public/dsfr/icons");

if (!fs.existsSync(srcDir)) {
  console.warn("⚠ @gouvfr/dsfr/dist/icons introuvable — icônes DSFR non copiées.");
  process.exit(0);
}

fs.cpSync(srcDir, destDir, { recursive: true });
console.log("✓ Icônes DSFR copiées vers public/dsfr/icons/");
