#!/usr/bin/env npx tsx
/**
 * Generate audio for a saved story snippet (e.g. last N minutes).
 * Usage: npx tsx scripts/generate-snippet-audio.mts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateAudioFile } from "../src/routes/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KAYLA = "aTxZrSrp47xsP6Ot4Kgd";
const OUT_SLUG = "test-door-open-kayla-last4min";

const storyPath = path.resolve(__dirname, "../public/test-stories/4e32994e76eecd44ab8ab8cc0bd9213a.json");
const saved = JSON.parse(fs.readFileSync(storyPath, "utf8")) as {
  title: string;
  fullScenes: Array<{ id: number; heading: string; text: string }>;
};

// Last ~4 min of the 11m27 story: scene 4 (On Your Knees) + scene 6 (coda)
const scenes = saved.fullScenes
  .filter((s) => s.id === 4 || s.id === 6)
  .map((s) => ({
    id: s.id,
    heading: s.heading,
    text: s.text,
    rawText: s.text,
    visualPrompt: "",
    durationEstimate: s.id === 4 ? 210 : 30,
    emotionalShift: "",
  }));

async function main() {
  console.log(`Generating: ${saved.title} — last scenes (${scenes.map((s) => s.heading).join(" + ")})`);
  console.log(`Narrator: Kayla · cast: Maya (her) · James (him)`);

  const { url, durationSeconds } = await generateAudioFile(
    scenes,
    KAYLA,
    OUT_SLUG,
    "Her & Him",
    "Explicit",
    "James",
    "You",
  );

  const manifest = {
    title: `${saved.title} (last ~4 min)`,
    narrator: "Kayla",
    cast: "Maya · James",
    scenes: scenes.map((s) => s.heading),
    durationSeconds,
    audioUrl: url,
    listenUrl: `http://localhost:8770/${path.basename(url)}`,
    filename: path.basename(url),
  };

  const outDir = path.resolve(__dirname, "../public/test-stories");
  fs.writeFileSync(path.join(outDir, "kayla-last4min.json"), JSON.stringify(manifest, null, 2));

  console.log("\nDone.");
  console.log(`Duration: ~${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`);
  console.log(`File: public/audio/${manifest.filename}`);
  console.log(`Listen: http://127.0.0.1:8770/${manifest.filename}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
