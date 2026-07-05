#!/usr/bin/env npx tsx
/**
 * Generate one full story (plan → write → QC → multi-voice audio) for local QA.
 *
 * Usage (from artifacts/api-server):
 *   LOCAL_AUDIO_MIRROR=1 npx tsx scripts/generate-test-story-audio.mts
 *
 * Output:
 *   - MP3 mirrored to public/audio/audio-{hash}.mp3 (when LOCAL_AUDIO_MIRROR=1)
 *   - Manifest JSON in public/test-stories/latest.json
 *
 * Serve with api-server running: http://localhost:3000/api/audio/audio-{hash}.mp3
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  generateAudioFile,
  type GenerateStoryRequest,
} from "../src/routes/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/test-stories");

/** Mirrors After Dark express defaults — Her & Him, unrestrained, Maya-friendly pairing. */
const TEST_INTAKE: GenerateStoryRequest = {
  storyLength: "10 min",
  intensity: "Explicit",
  numericIntensity: 5,
  mood: "Late Night",
  pairing: "Her & Him",
  voiceFeel: "tQ4MEZFJOzsahSEEZtHK", // Maya
  storyMode: "unrestrained",
  listenerName: "You",
  partnerName: "James",
  dynamic: "He wants control. You let him think he has it.",
  chemistry: "Magnetic",
  atmosphere: "Dim light, close quarters",
  setting: "Hotel suite after an awards dinner",
  scenarioPrompt:
    "Two colleagues who've been circling each other for months. Tonight the adjoining door is open and neither of them is pretending anymore.",
  experienceTags: ["wanted to be told", "desired"],
  bypassCache: true,
} as GenerateStoryRequest;

function hashId(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 32);
}

async function main() {
  console.log("=".repeat(72));
  console.log("FULL STORY + AUDIO TEST (production pipeline)");
  console.log(`LOCAL_AUDIO_MIRROR: ${process.env.LOCAL_AUDIO_MIRROR ?? "off"}`);
  console.log("=".repeat(72));

  const t0 = Date.now();

  console.log("\n▶  Plan…");
  const brief = await planStory(TEST_INTAKE);
  console.log(`   title hint: ${brief.working_title ?? "(untitled)"}`);

  console.log("\n▶  Write…");
  const story = await writeStoryFromBrief(
    brief,
    TEST_INTAKE.listenerName ?? "You",
    TEST_INTAKE.intensity,
    {
      scenarioPrompt: TEST_INTAKE.scenarioPrompt,
      pairing: TEST_INTAKE.pairing,
      dynamic: TEST_INTAKE.dynamic,
      mood: TEST_INTAKE.mood,
      experienceTags: TEST_INTAKE.experienceTags,
      intensity: TEST_INTAKE.intensity,
      chemistry: TEST_INTAKE.chemistry,
      atmosphere: TEST_INTAKE.atmosphere,
      storyMode: TEST_INTAKE.storyMode,
    },
  );
  console.log(`   "${story.title}" — ${story.scenes.length} scenes`);

  console.log("\n▶  QC…");
  const qc = await qcStory(brief, story, {
    scenarioPrompt: TEST_INTAKE.scenarioPrompt,
    pairing: TEST_INTAKE.pairing,
    dynamic: TEST_INTAKE.dynamic,
  });
  console.log(
    `   score=${qc.score_total.toFixed(1)} pass=${qc.passed} multiVoiceLikely=${story.scenes.some((s) => s.text.includes('"'))}`,
  );

  const storyHash = hashId(JSON.stringify({ brief: brief.working_title, title: story.title }));
  console.log("\n▶  Audio (multi-voice when attributed)…");
  const { url, durationSeconds } = await generateAudioFile(
    story.scenes,
    TEST_INTAKE.voiceFeel,
    storyHash,
    TEST_INTAKE.pairing,
    TEST_INTAKE.intensity,
    TEST_INTAKE.partnerName,
    TEST_INTAKE.listenerName,
  );

  const filename = `audio-${storyHash}.mp3`;
  const manifest = {
    generatedAt: new Date().toISOString(),
    title: story.title,
    description: story.description,
    durationSeconds,
    audioUrl: url,
    audioFilename: filename,
    localListenUrl: `http://localhost:3000${url}`,
    qcScore: qc.score_total,
    qcPassed: qc.passed,
    pairing: TEST_INTAKE.pairing,
    voiceFeel: "Maya",
    sceneCount: story.scenes.length,
    wordCount: story.scenes.map((s) => s.text).join(" ").split(/\s+/).filter(Boolean).length,
    elapsedMs: Date.now() - t0,
    scenes: story.scenes.map((s) => ({ id: s.id, heading: s.heading, textPreview: s.text.slice(0, 200) })),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "latest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(OUT_DIR, `${storyHash}.json`),
    JSON.stringify({ ...manifest, fullScenes: story.scenes }, null, 2),
  );

  console.log("\n" + "=".repeat(72));
  console.log("DONE");
  console.log(`Title:    ${story.title}`);
  console.log(`Duration: ~${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`);
  console.log(`Audio:    http://localhost:3000${url}`);
  console.log(`Manifest: public/test-stories/latest.json`);
  console.log(`Elapsed:  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log("=".repeat(72));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
