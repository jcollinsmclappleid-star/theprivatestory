#!/usr/bin/env node
/**
 * Sync transcript fields in editorsPicks.ts from the PICKS source in
 * generate-editors-picks.mjs.  Run this any time pick text changes.
 *
 *   node scripts/sync-transcripts.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PICKS } from "./generate-editors-picks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(
  __dirname,
  "../../custom-audio-stories/src/data/editorsPicks.ts",
);

const textBySlug = Object.fromEntries(PICKS.map((p) => [p.slug, p.text]));

let src = fs.readFileSync(TARGET, "utf8");

let updated = 0;
for (const [slug, text] of Object.entries(textBySlug)) {
  const slugIdx = src.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) {
    console.warn(`  WARN: slug "${slug}" not found in editorsPicks.ts`);
    continue;
  }
  const transcriptMarker = "transcript: `";
  const transcriptStart = src.indexOf(transcriptMarker, slugIdx);
  if (transcriptStart === -1) {
    console.warn(`  WARN: transcript field not found after slug "${slug}"`);
    continue;
  }
  const contentStart = transcriptStart + transcriptMarker.length;
  const contentEnd = src.indexOf("`", contentStart);
  if (contentEnd === -1) {
    console.warn(`  WARN: closing backtick not found for slug "${slug}"`);
    continue;
  }
  const existing = src.slice(contentStart, contentEnd);
  if (existing === text) continue;
  src =
    src.slice(0, transcriptStart) +
    `transcript: \`${text}\`` +
    src.slice(contentEnd + 1);
  console.log(`  updated  ${slug}`);
  updated++;
}

if (updated === 0) {
  console.log("All transcripts already in sync — nothing to update.");
} else {
  fs.writeFileSync(TARGET, src);
  console.log(`\nWrote ${updated} transcript(s) to editorsPicks.ts`);
}
