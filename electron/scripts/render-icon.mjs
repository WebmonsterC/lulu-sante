import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, "../build/icon.svg");
const svg = fs.readFileSync(svgPath);

const targets = [
  path.join(__dirname, "../build/icon.png"),
  path.join(__dirname, "../../frontend/public/apple-touch-icon.png"),
];

for (const target of targets) {
  await sharp(svg).resize(1024, 1024).png().toFile(target);
  console.log(`Generated ${target}`);
}
