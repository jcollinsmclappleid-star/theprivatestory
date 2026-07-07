#!/usr/bin/env node
/**
 * Build square favicons from logo-icon.png — circular crop fills canvas (Google-ready).
 * Outputs: public/favicon-48.png, favicon-192.png, favicon-512.png, favicon-square.png
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const src = path.join(publicDir, "images/logo-icon.png");

/** Site plum-black — matches favicon.svg plate */
const BG = { r: 13, g: 10, b: 6 };

function circleMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`,
  );
}

async function buildFavicon(size, outName) {
  const trimmed = await sharp(src).trim({ threshold: 18 }).png().toBuffer();
  const scaled = await sharp(trimmed)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const clipped = await sharp(scaled)
    .composite([{ input: circleMask(size), blend: "dest-in" }])
    .flatten({ background: BG })
    .png()
    .toBuffer();

  const out = path.join(publicDir, outName);
  await sharp({
    create: { width: size, height: size, channels: 3, background: BG },
  })
    .composite([{ input: clipped, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log(`✓ ${outName} (${size}×${size})`);
}

const sizes = [
  [48, "favicon-48.png"],
  [192, "favicon-192.png"],
  [512, "favicon-512.png"],
];

for (const [size, name] of sizes) {
  await buildFavicon(size, name);
}

await sharp(path.join(publicDir, "favicon-512.png")).toFile(path.join(publicDir, "favicon-square.png"));
console.log("✓ favicon-square.png (copy of 512)");
