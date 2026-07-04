/**
 * Convert express-act4-*.png → .webp in all public image directories.
 * Run: node scripts/convertExpressAct4ToWebp.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");

const IMAGE_DIRS = [
  path.resolve(repoRoot, "artifacts/custom-audio-stories/public/images"),
  path.resolve(repoRoot, "artifacts/api-server/public/images"),
  path.resolve(repoRoot, "artifacts/api-server/public/client/images"),
];

const QUALITY = 82;

async function convertDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`  skip (missing): ${dir}`);
    return { converted: 0, bytesSaved: 0 };
  }

  const pngs = fs.readdirSync(dir).filter((f) => /^express-act4-.+\.png$/i.test(f));
  let converted = 0;
  let bytesSaved = 0;

  for (const png of pngs) {
    const src = path.join(dir, png);
    const dest = path.join(dir, png.replace(/\.png$/i, ".webp"));
    const before = fs.statSync(src).size;

    await sharp(src)
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(dest);

    const after = fs.statSync(dest).size;
    converted++;
    bytesSaved += Math.max(0, before - after);
    console.log(`  ✓ ${path.basename(dir)}/${png} → .webp (${(before / 1024).toFixed(0)}K → ${(after / 1024).toFixed(0)}K)`);
  }

  return { converted, bytesSaved };
}

console.log("Converting Act IV PNGs to WebP…\n");

let totalConverted = 0;
let totalSaved = 0;

for (const dir of IMAGE_DIRS) {
  console.log(dir);
  const { converted, bytesSaved } = await convertDir(dir);
  totalConverted += converted;
  totalSaved += bytesSaved;
  console.log("");
}

console.log(`Done: ${totalConverted} files, ~${(totalSaved / 1024 / 1024).toFixed(1)} MB saved vs PNG originals.`);
