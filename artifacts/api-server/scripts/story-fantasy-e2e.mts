#!/usr/bin/env npx tsx
/**
 * Story-only E2E — Act III Fantasy + Act IV Situation + Make it yours.
 * Runs plan → write → QC (no audio).
 *
 * Usage (from artifacts/api-server):
 *   npx tsx scripts/story-fantasy-e2e.mts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  getCacheKey,
  computeVarietyProfile,
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

const SCENARIO_TAGS = ["He shouldn't, and neither should you", "The risk is part of the pull"];
const CUSTOMER_TAGS = ["She wanted to be blindfolded", "She wanted to be praised while it happens"];

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
  console.log("STORY FANTASY E2E — plan + write + QC (no audio)");
  console.log("=".repeat(72));
  console.log(`Scenario: The Colleague tags: ${SCENARIO_TAGS.join(", ")}`);
  console.log(`Make it yours: ${CUSTOMER_TAGS.join(", ")}`);
  console.log(`Situation: fc_01 (works for him)`);

  const intake = customerIntake();
  const t0 = Date.now();
  const expressFast = shouldUseExpressFastPath(intake);
  console.log(`Fast path: ${expressFast ? "ON (code plan)" : "OFF"}`);

  const brief = expressFast
    ? buildExpressBrief(intake)
    : await planStory(intake, { varietyProfile: computeVarietyProfile(99) });
  console.log(`\nPlanned: ${brief.emotional_arc}`);
  console.log(`Fantasy spine tags: ${brief.fantasy_spine?.customer_desire_tags?.join(", ") ?? "(none)"}`);

  const originalUserInput = {
    whoIsHe: intake.whoIsHe,
    setting: intake.setting,
    dynamic: intake.dynamic,
    mood: intake.mood,
    pairing: intake.pairing,
    partnerName: intake.partnerName,
    intensity: intake.intensity,
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
    wordCountTarget: intake.storyLength === "10 min" ? "1,440–1,760 words total (~10 minutes of audio narration)" : undefined,
  };

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
  console.log(`Written: "${story.title}" — ${story.scenes.length} scenes, ~${words} words`);

  const qc = expressFast
    ? runExpressDeterministicQc({
        story,
        scenePlan: brief.scene_plan,
        storyLength: intake.storyLength,
        fantasySpine: brief.fantasy_spine,
      })
    : await qcStory(brief, story, originalUserInput);
  console.log(`QC: score=${qc.score_total.toFixed(1)} pass=${qc.passed}`);

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

  const slug = `story-fantasy-${getCacheKey({ brief, story }).slice(0, 12)}`;
  const manifest = {
    generatedAt: new Date().toISOString(),
    title: story.title,
    wordCount: words,
    qcScore: qc.score_total,
    qcPassed: qc.passed,
    fantasySpine: brief.fantasy_spine,
    scenePlanPerform: brief.scene_plan.find((s) => s.phase === "PERFORM"),
    customerDesireCompliance: compliance,
    performScene: {
      heading: perform.heading,
      wordCount: perform.text.split(/\s+/).filter(Boolean).length,
      quoteCount: Math.floor((perform.text.match(/"/g) ?? []).length / 2),
      text: perform.text,
    },
    fullScenes: story.scenes,
    elapsedMs: Date.now() - t0,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "story-fantasy-latest.json"), JSON.stringify(manifest, null, 2));

  console.log(`\nCustomer desire compliance: ${compliance.score}/10`);
  console.log(`  Passes: ${compliance.passes.join(", ") || "(none)"}`);
  console.log(`  Failures: ${compliance.failures.join(", ") || "(none)"}`);
  console.log(`\nPERFORM preview:\n${perform.text.slice(0, 600)}…`);
  console.log(`\nManifest: public/test-stories/story-fantasy-latest.json`);
  console.log(`Elapsed: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const writeTiming = summarizeExpressWriteTimings();
  console.log(`LLM calls: ${writeTiming.llmCalls} | write-phase total: ${(writeTiming.totalMs / 1000).toFixed(1)}s`);
  for (const b of writeTiming.byBeat) {
    console.log(`  ${b.beat}${b.detail ? ` (${b.detail})` : ""}: ${(b.ms / 1000).toFixed(1)}s`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
