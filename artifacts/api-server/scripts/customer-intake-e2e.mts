#!/usr/bin/env npx tsx
/**
 * Customer-intake E2E — mirrors After Dark Express clicks, then runs the
 * production generate-full-story pipeline (plan → write → QC → audio).
 *
 * This is the same code path a paying customer hits after casting + paywall,
 * minus auth/billing/images/DB persistence.
 *
 * Usage (from artifacts/api-server):
 *   LOCAL_AUDIO_MIRROR=1 SKIP_GCS_UPLOAD=1 DATABASE_URL=… ELEVENLABS_API_KEY=… \
 *     ATTRIBUTION_QA=1 npx tsx scripts/customer-intake-e2e.mts
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
  getCacheKey,
  computeVarietyProfile,
  protagonistNameForAudio,
  type GenerateStoryRequest,
} from "../src/routes/generate.js";
import { wordCountTargetForStoryLength } from "../src/lib/storyLength.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/test-stories");

/** Mirrors AfterDark.tsx scenario `the_colleague`. */
const SCENARIO = {
  id: "the_colleague",
  label: "The Colleague",
  sub: "Months of professionalism. One after-hours moment. Everything between them shifts.",
  room: "the_forbidden",
  storyMode: "forbidden",
  tags: ["He shouldn't, and neither should you", "The risk is part of the pull"],
};

const KAYLA = "aTxZrSrp47xsP6Ot4Kgd";

function logStep(n: number, label: string, detail?: string) {
  console.log(`\n${"─".repeat(72)}`);
  console.log(`STEP ${n}: ${label}`);
  if (detail) console.log(`       ${detail}`);
}

/** Same shape as buildGeneratePayload() after Express casting completes. */
function customerIntake(): GenerateStoryRequest {
  return {
    mood: "Charged",
    intensity: "Explicit",
    numericIntensity: 5,
    voiceFeel: KAYLA,
    storyLength: "10 min",
    perspective: "her",
    cinematicVisuals: true,
    emotionalFocus: false,
    whoIsHe: "The Executive",
    dynamic: "Magnetic",
    storyMode: SCENARIO.storyMode,
    experienceTags: SCENARIO.tags,
    pairing: "Her & Him",
    heritage: "Ambiguous",
    atmosphere: "Electric",
    chemistry: "Magnetic",
    setting: "After hours",
    listenerName: "You",
    partnerName: "James",
    scenarioRoom: SCENARIO.room,
    situationId: "fc_01",
    bypassCache: true,
  } as GenerateStoryRequest;
}

function pickIgniteScene(scenes: Array<{ id: number; heading: string; text: string }>) {
  const scored = scenes.map((s) => ({
    scene: s,
    quotes: (s.text.match(/"/g) ?? []).length,
    words: s.text.split(/\s+/).filter(Boolean).length,
  }));
  scored.sort((a, b) => b.quotes * 100 + b.words - (a.quotes * 100 + a.words));
  return scored[0]?.scene ?? scenes[Math.floor(scenes.length / 2)]!;
}

async function main() {
  process.env.ATTRIBUTION_QA = "1";

  console.log("=".repeat(72));
  console.log("CUSTOMER INTAKE E2E — After Dark Express → full production pipeline");
  console.log("=".repeat(72));

  logStep(1, "Open /after-dark", "Customer lands on After Dark");
  logStep(2, "Choose fantasy", `"${SCENARIO.label}" — ${SCENARIO.sub}`);
  logStep(3, "Pairing", "Her & Him");
  logStep(4, "Express Act IV", [
    "Intensity: Explicit",
    "Narrator: Kayla",
    "Chemistry: Magnetic",
    "Archetype: The Executive",
    "Setting: After hours",
    `Tags: ${SCENARIO.tags.join(", ")}`,
    "Names: You + James",
  ].join("\n       "));
  logStep(5, "Paywall + auth", "Skipped in script — billing not charged");
  logStep(6, "Generate story", "POST /api/generate-full-story equivalent…");

  const intake = customerIntake();
  const t0 = Date.now();
  const varietyProfile = computeVarietyProfile(3);

  const brief = await planStory(intake, { varietyProfile });
  console.log(`   Planned: "${brief.working_title ?? "(untitled)"}"`);

  const originalUserInput = {
    scenarioPrompt: intake.scenarioPrompt,
    whoIsHe: intake.whoIsHe,
    setting: intake.setting,
    dynamic: intake.dynamic,
    mood: intake.mood,
    pairing: intake.pairing,
    partnerName: intake.partnerName,
    intensity: intake.intensity,
    chemistry: intake.chemistry,
    heritage: intake.heritage,
    atmosphere: intake.atmosphere,
    storyMode: intake.storyMode,
    experienceTags: intake.experienceTags,
    scenarioRoom: intake.scenarioRoom,
    situationId: intake.situationId,
    perspective: intake.perspective,
    varietyProfile,
    storyLength: intake.storyLength,
    wordCountTarget: wordCountTargetForStoryLength(intake.storyLength),
  };

  const story = await writeStoryFromBrief(
    brief,
    intake.listenerName ?? "You",
    intake.intensity,
    originalUserInput,
  );
  console.log(`   Written: "${story.title}" — ${story.scenes.length} scenes`);

  const qc = await qcStory(brief, story, originalUserInput);
  console.log(`   QC: score=${qc.score_total.toFixed(1)} pass=${qc.passed}`);

  const storyHash = getCacheKey({ brief, story });
  const audioResult = await generateAudioFile(
    story.scenes,
    intake.voiceFeel!,
    storyHash,
    intake.pairing,
    intake.intensity,
    intake.partnerName,
    protagonistNameForAudio(intake.pairing ?? "", intake.listenerName),
  );

  const ignite = pickIgniteScene(story.scenes);
  const quoteCount = (ignite.text.match(/"/g) ?? []).length / 2;

  const slug = `customer-e2e-${storyHash.slice(0, 12)}`;
  const manifest = {
    generatedAt: new Date().toISOString(),
    customerJourney: "After Dark Express → The Colleague → Her & Him → Explicit → Kayla",
    title: story.title,
    description: story.description,
    durationSeconds: audioResult.durationSeconds,
    audioUrl: audioResult.url,
    audioFilename: `audio-${storyHash}.mp3`,
    listenUrl: `http://localhost:3000${audioResult.url}`,
    staticListenUrl: `http://127.0.0.1:8770/audio/audio-${storyHash}.mp3`,
    qcScore: qc.score_total,
    qcPassed: qc.passed,
    pairing: intake.pairing,
    narrator: "Kayla",
    partnerName: intake.partnerName,
    sceneCount: story.scenes.length,
    igniteScene: {
      id: ignite.id,
      heading: ignite.heading,
      quoteLines: Math.floor(quoteCount),
      wordCount: ignite.text.split(/\s+/).filter(Boolean).length,
      textPreview: ignite.text.slice(0, 400),
    },
    qa: audioResult.qa ?? null,
    elapsedMs: Date.now() - t0,
    intake,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify({ ...manifest, fullScenes: story.scenes }, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "customer-e2e-latest.json"), JSON.stringify(manifest, null, 2));

  // Copy to predictable filename for listen page
  const audioSrc = path.join(__dirname, "../public/audio", `audio-${storyHash}.mp3`);
  const audioDest = path.join(__dirname, "../public/audio/audio-customer-e2e-latest.mp3");
  if (fs.existsSync(audioSrc)) fs.copyFileSync(audioSrc, audioDest);

  console.log(`\n${"=".repeat(72)}`);
  console.log("DONE — customer E2E story ready");
  console.log(`Title:    ${story.title}`);
  console.log(`Duration: ~${Math.floor(audioResult.durationSeconds / 60)}m ${audioResult.durationSeconds % 60}s`);
  console.log(`IGNITE:   scene ${ignite.id} "${ignite.heading}" (~${Math.floor(quoteCount)} dialogue lines)`);
  console.log(`Audio:    http://127.0.0.1:8770/audio/audio-customer-e2e-latest.mp3`);
  console.log(`Manifest: public/test-stories/customer-e2e-latest.json`);
  if (audioResult.qa) {
    const narr = audioResult.qa.segments.filter((s) => s.role === "NARRATOR").length;
    const chars = audioResult.qa.segments.filter((s) => s.role !== "NARRATOR").length;
    console.log(`Audio QA: multiVoice=${audioResult.qa.useMultiVoice} tagger=${audioResult.qa.tagger} segments=${audioResult.qa.segments.length} (narr=${narr} char=${chars})`);
  }
  console.log(`Elapsed:  ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  console.log("=".repeat(72));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
