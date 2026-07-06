#!/usr/bin/env npx tsx
/**
 * Re-run TTS + speaker attribution from a saved story manifest (no rewrite).
 *
 * Usage:
 *   LOCAL_AUDIO_MIRROR=1 SKIP_GCS_UPLOAD=1 ATTRIBUTION_QA=1 \
 *     npx tsx scripts/regenerate-audio-from-manifest.mts [manifest.json]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  generateAudioFile,
  getCacheKey,
  protagonistNameForAudio,
} from "../src/routes/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath =
  process.argv[2] ??
  path.join(__dirname, "../public/test-stories/story-extreme-latest.json");

type Manifest = {
  title: string;
  fullScenes: Array<{
    id: number;
    heading: string;
    text: string;
    rawText?: string;
    visualPrompt?: string;
    durationEstimate?: number;
    emotionalShift?: string;
  }>;
};

async function main() {
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest & {
    intake?: {
      voiceFeel?: string;
      pairing?: string;
      intensity?: string;
      partnerName?: string;
      listenerName?: string;
    };
  };
  const intake = raw.intake ?? {
    voiceFeel: "aTxZrSrp47xsP6Ot4Kgd",
    pairing: "Her & Him",
    intensity: "Explicit",
    partnerName: "James",
    listenerName: "You",
  };

  const scenes = raw.fullScenes.map((s) => ({
    id: s.id,
    heading: s.heading,
    text: s.text,
    rawText: s.rawText ?? s.text,
    visualPrompt: s.visualPrompt ?? "",
    durationEstimate: s.durationEstimate ?? 60,
    emotionalShift: s.emotionalShift,
  }));

  const storyHash = getCacheKey({ title: raw.title, scenes });
  console.log(`Regenerating audio for "${raw.title}" (${scenes.length} scenes)…`);

  const t0 = Date.now();
  const audioResult = await generateAudioFile(
    scenes,
    intake.voiceFeel!,
    storyHash,
    intake.pairing,
    intake.intensity,
    intake.partnerName,
    protagonistNameForAudio(intake.pairing ?? "", intake.listenerName),
  );

  const audioDir = path.join(__dirname, "../public/audio");
  const src = path.join(audioDir, `audio-${storyHash}.mp3`);
  const dest = path.join(audioDir, "audio-story-extreme-latest.mp3");
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);

  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log(`Duration: ${audioResult.durationSeconds}s`);
  console.log(`Tagger: ${audioResult.qa?.tagger ?? "?"}`);
  console.log(`Listen: http://127.0.0.1:8770/audio/audio-story-extreme-latest.mp3`);

  if (audioResult.qa?.segments?.length) {
    const sample = audioResult.qa.segments.filter((s) => s.role !== "NARRATOR").slice(0, 12);
    console.log("\nFirst dialogue segments:");
    for (const s of sample) {
      console.log(`  [${s.role}] ${s.spokenText.slice(0, 72)}…`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
