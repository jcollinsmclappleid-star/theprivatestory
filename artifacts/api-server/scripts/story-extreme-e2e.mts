#!/usr/bin/env npx tsx
/**
 * Extreme express E2E — max intensity + dense Make it yours chips + audio.
 *
 * Usage (from artifacts/api-server):
 *   LOCAL_AUDIO_MIRROR=1 SKIP_GCS_UPLOAD=1 npx tsx scripts/story-extreme-e2e.mts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  writeStoryFromBrief,
  getCacheKey,
  computeVarietyProfile,
  generateAudioFile,
  protagonistNameForAudio,
  type GenerateStoryRequest,
} from "../src/routes/generate.js";
import {
  buildExpressBrief,
  shouldUseExpressFastPath,
} from "../src/lib/expressBrief.js";
import { runExpressDeterministicQc } from "../src/lib/expressQc.js";
import {
  scoreCustomerDesireCompliance,
  type FantasySpine,
} from "../src/lib/customerDesireBeats.js";
import { totalWordCountFromSceneTexts } from "../src/lib/storyLength.js";
import { summarizeExpressWriteTimings } from "../src/lib/expressWriteTiming.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/test-stories");
const AUDIO_DIR = path.resolve(__dirname, "../public/audio");

/** Scenario frame — max dominance / explicit framing (After Dark presets). */
const SCENARIO_TAGS = [
  "He's completely in control",
  "Nothing off limits",
  "Total surrender",
];

/** 8 customer chips — UI cap: 3 restraint + 3 words + 2 submission. */
const CUSTOMER_TAGS = [
  "She wanted to be tied up",
  "She wanted to be blindfolded",
  "She wanted to be held down",
  "She wanted to be praised",
  "She wanted every moment described as it happened",
  "She wanted to be told she was perfect",
  "She wanted to beg for it",
  "She wanted to be edged",
];

function customerIntake(): GenerateStoryRequest {
  return {
    mood: "Charged",
    intensity: "Explicit",
    numericIntensity: 5,
    voiceFeel: "aTxZrSrp47xsP6Ot4Kgd",
    storyLength: process.env.STORY_LENGTH ?? "10 min",
    perspective: "her",
    cinematicVisuals: true,
    whoIsHe: "The Executive",
    dynamic: "Magnetic",
    storyMode: "forbidden",
    experienceTags: [...SCENARIO_TAGS, ...CUSTOMER_TAGS],
    scenarioTags: SCENARIO_TAGS,
    customerDesireTags: CUSTOMER_TAGS,
    pairing: "Her & Him",
    atmosphere: "Electric",
    chemistry: "Magnetic",
    setting: "Office After Hours",
    listenerName: "You",
    partnerName: "James",
    scenarioRoom: "the_forbidden",
    situationId: "fc_01",
    bypassCache: true,
  } as GenerateStoryRequest;
}

function pickPerformScene(scenes: Array<{ id: number; heading: string; text: string }>) {
  return scenes[2] ?? scenes[Math.floor(scenes.length / 2)]!;
}

async function main() {
  console.log("=".repeat(72));
  console.log("EXTREME EXPRESS E2E — plan + write + QC + audio");
  console.log("=".repeat(72));
  console.log(`Scenario: ${SCENARIO_TAGS.join(" | ")}`);
  console.log(`Make it yours (${CUSTOMER_TAGS.length}):`);
  for (const t of CUSTOMER_TAGS) console.log(`  • ${t}`);
  console.log(`Intensity: Explicit (5/5)`);
  console.log(`LOCAL_AUDIO_MIRROR: ${process.env.LOCAL_AUDIO_MIRROR ?? "off"}`);

  const intake = customerIntake();
  const t0 = Date.now();
  const expressFast = shouldUseExpressFastPath(intake);
  console.log(`Fast path: ${expressFast ? "ON" : "OFF"}`);

  const brief = buildExpressBrief(intake);
  console.log(`\nPlanned: ${brief.emotional_arc}`);
  console.log(`Fantasy spine: ${brief.fantasy_spine?.customer_desire_tags?.length ?? 0} enactment chips`);

  const originalUserInput = {
    whoIsHe: intake.whoIsHe,
    setting: intake.setting,
    dynamic: intake.dynamic,
    mood: intake.mood,
    pairing: intake.pairing,
    partnerName: intake.partnerName,
    intensity: intake.intensity,
    numericIntensity: intake.numericIntensity,
    chemistry: intake.chemistry,
    atmosphere: intake.atmosphere,
    storyMode: intake.storyMode,
    experienceTags: intake.experienceTags,
    scenarioTags: intake.scenarioTags,
    customerDesireTags: intake.customerDesireTags,
    scenarioRoom: intake.scenarioRoom,
    situationId: intake.situationId,
    perspective: intake.perspective,
    varietyProfile: computeVarietyProfile(99),
    storyLength: intake.storyLength,
    wordCountTarget:
      intake.storyLength === "10 min"
        ? "1,440–1,760 words total (~10 minutes of audio narration)"
        : undefined,
  };

  console.log("\n▶  Write…");
  const story = await writeStoryFromBrief(
    brief,
    intake.listenerName ?? "You",
    intake.intensity,
    originalUserInput,
    {
      expressFastPath: expressFast,
      maxStructuralAttempts: expressFast ? 2 : undefined,
      skipExpandPass: expressFast,
    },
  );

  const words = totalWordCountFromSceneTexts(story.scenes.map((s) => s.text));
  console.log(`   "${story.title}" — ${story.scenes.length} scenes, ~${words} words`);

  const qc = runExpressDeterministicQc({
    story,
    scenePlan: brief.scene_plan,
    storyLength: intake.storyLength,
    fantasySpine: brief.fantasy_spine,
  });
  console.log(`   QC: score=${qc.score_total.toFixed(1)} pass=${qc.passed}`);

  const perform = pickPerformScene(story.scenes);
  const spine: FantasySpine = brief.fantasy_spine ?? {
    scenario_frame: "",
    customer_desire_tags: CUSTOMER_TAGS,
    scenario_tags: SCENARIO_TAGS,
    customer_enactments: [],
    declare_desire_declaration: "",
    perform_spine: "",
  };
  const compliance = scoreCustomerDesireCompliance(story.scenes, spine, brief.scene_plan);

  const storyHash = getCacheKey({ brief, story });
  console.log("\n▶  Audio…");
  const audioResult = await generateAudioFile(
    story.scenes,
    intake.voiceFeel!,
    storyHash,
    intake.pairing,
    intake.intensity,
    intake.partnerName,
    protagonistNameForAudio(intake.pairing ?? "", intake.listenerName),
  );

  const manifest = {
    generatedAt: new Date().toISOString(),
    profile: "extreme-express-e2e",
    title: story.title,
    wordCount: words,
    durationSeconds: audioResult.durationSeconds,
    audioUrl: audioResult.url,
    audioFilename: `audio-${storyHash}.mp3`,
    listenUrl: `http://127.0.0.1:8770/audio/audio-${storyHash}.mp3`,
    qcScore: qc.score_total,
    qcPassed: qc.passed,
    scenarioTags: SCENARIO_TAGS,
    customerDesireTags: CUSTOMER_TAGS,
    fantasySpine: brief.fantasy_spine,
    customerDesireCompliance: compliance,
    performScene: {
      heading: perform.heading,
      wordCount: perform.text.split(/\s+/).filter(Boolean).length,
      quoteCount: Math.floor((perform.text.match(/"/g) ?? []).length / 2),
      textPreview: perform.text.slice(0, 800),
      text: perform.text,
    },
    fullScenes: story.scenes,
    audioQa: audioResult.qa ?? null,
    elapsedMs: Date.now() - t0,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "story-extreme-latest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(OUT_DIR, `story-extreme-${storyHash.slice(0, 12)}.json`),
    JSON.stringify(manifest, null, 2),
  );

  const audioSrc = path.join(AUDIO_DIR, `audio-${storyHash}.mp3`);
  const audioDest = path.join(AUDIO_DIR, "audio-story-extreme-latest.mp3");
  if (fs.existsSync(audioSrc)) fs.copyFileSync(audioSrc, audioDest);

  console.log(`\n${"=".repeat(72)}`);
  console.log("DONE");
  console.log(`Title:      ${story.title}`);
  console.log(`Duration:   ~${Math.floor(audioResult.durationSeconds / 60)}m ${audioResult.durationSeconds % 60}s`);
  console.log(`Compliance: ${compliance.score}/10 — fails: ${compliance.failures.join(", ") || "(none)"}`);
  console.log(`Audio:      http://127.0.0.1:8770/audio/audio-story-extreme-latest.mp3`);
  console.log(`Manifest:   public/test-stories/story-extreme-latest.json`);
  console.log(`Elapsed:    ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  const writeTiming = summarizeExpressWriteTimings();
  console.log(`LLM calls:  ${writeTiming.llmCalls} | write: ${(writeTiming.totalMs / 1000).toFixed(1)}s`);
  console.log("=".repeat(72));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
