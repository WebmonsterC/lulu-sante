/**
 * Télécharge les polices Marianne absentes du package npm @gouvfr/dsfr.
 * Sans ces fichiers, le navigateur reçoit index.html à la place → erreur sanitizer.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(__dirname, "../public/dsfr/fonts");
const baseUrl =
  "https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.14.2/dist/fonts/";
const fonts = ["Marianne-Regular", "Marianne-Medium", "Marianne-Bold"];
const extensions = ["woff2", "woff"];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          download(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} — ${url}`));
          return;
        }

        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on("finish", () => file.close(() => resolve(undefined)));
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(destDir, { recursive: true });

  let failed = 0;

  for (const font of fonts) {
    for (const ext of extensions) {
      const filename = `${font}.${ext}`;
      const dest = path.join(destDir, filename);

      if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
        continue;
      }

      try {
        await download(`${baseUrl}${filename}`, dest);
        console.log(`✓ ${filename}`);
      } catch (error) {
        failed += 1;
        console.warn(`⚠ ${filename} — ${error.message}`);
      }
    }
  }

  if (failed > 0) {
    console.warn(
      "Certaines polices n'ont pas pu être téléchargées. L'interface utilisera la police système.",
    );
  }
}

main();
