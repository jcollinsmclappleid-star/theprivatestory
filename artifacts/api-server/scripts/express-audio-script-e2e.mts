#!/usr/bin/env npx tsx
/**
 * Express audio-script E2E — write + validate speaker labels WITHOUT audio/TTS.
 *
 * Catches the production voice-swap bug class before ElevenLabs:
 *   - missing write-time script / rawText tags
 *   - narrator spans carrying quoted dialogue
 *   - PERFORM missing both protagonist + love_interest voices
 *
 * Usage (from artifacts/api-server):
 *   OPENROUTER_API_KEY=… npx tsx scripts/express-audio-script-e2e.mts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  writeStoryFromBrief,
  parseTaggedScript,
  type GenerateStoryRequest,
} from "../src/routes/generate.js";
import { buildExpressBrief } from "../src/lib/expressBrief.js";
import { runExpressDeterministicQc } from "../src/lib/expressQc.js";
import {
  validateWriterScript,
} from "../src/lib/expressAudioScript.js";
import { totalWordCountFromSceneTexts } from "../src/lib/storyLength.js";
import { summarizeExpressWriteTimings } from "../src/lib/expressWriteTiming.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/test-stories");

function customerIntake(): GenerateStoryRequest {
  return {
    mood: "Forbidden",
    intensity: "Explicit",
    numericIntensity: 5,
    voiceFeel: "tQ4MEZFJOzsahSEEZtHK",
    storyLength: process.env.STORY_LENGTH ?? "5 min",
    perspective: "her",
    whoIsHe: "The Executive",
    dynamic: "Magnetic",
    storyMode: "forbidden",
    experienceTags: [
      "He shouldn't, and neither should you",
      "The risk is part of the pull",
      "She wanted to be blindfolded",
      "She wanted to be praised while it happens",
    ],
    scenarioTags: ["He shouldn't, and neither should you", "The risk is part of the pull"],
    customerDesireTags: ["She wanted to be blindfolded", "She wanted to be praised while it happens"],
    pairing: "Her & Him",
    atmosphere: "Electric",
    chemistry: "Magnetic",
    setting: "Luxury Hotel",
    listenerName: "Rochelle",
    partnerName: "James",
    scenarioRoom: "the_forbidden",
    situationId: "fc_01",
    bypassCache: true,
  } as GenerateStoryRequest;
}

type SceneReport = {
  id: number;
  heading: string;
  phase: string;
  hasRawText: boolean;
  scriptLines: number;
  taggedSegments: number;
  charA: number;
  charB: number;
  narrator: number;
  scriptIssues: string[];
};

async function main() {
  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    console.error("OPENROUTER_API_KEY required for write step");
    process.exit(1);
  }

  console.log("=".repeat(72));
  console.log("EXPRESS AUDIO-SCRIPT E2E — write + label validation (NO audio)");
  console.log("=".repeat(72));

  const intake = customerIntake();
  const t0 = Date.now();
  const brief = buildExpressBrief(intake);
  const originalUserInput = {
    whoIsHe: intake.whoIsHe,
    setting: intake.setting,
    dynamic: intake.dynamic,
    mood: intake.mood,
    pairing: intake.pairing,
    partnerName: intake.partnerName,
    listenerName: intake.listenerName,
    intensity: intake.intensity,
    chemistry: intake.chemistry,
    atmosphere: intake.atmosphere,
    storyMode: intake.storyMode,
    experienceTags: intake.experienceTags,
    scenarioTags: intake.scenarioTags,
    customerDesireTags: intake.customerDesireTags,
    scenarioRoom: intake.scenarioRoom,
    situationId: intake.situationId,
    storyLength: intake.storyLength,
  };

  const story = await writeStoryFromBrief(
    brief,
    intake.listenerName ?? "You",
    intake.intensity,
    originalUserInput,
    { expressFastPath: true, maxStructuralAttempts: 2, skipExpandPass: true },
  );

  const words = totalWordCountFromSceneTexts(story.scenes.map((s) => s.text));
  console.log(`\nWritten: "${story.title}" — ${story.scenes.length} beats, ~${words} words`);

  const phaseById = new Map(brief.scene_plan.map((p) => [p.scene_number, p.phase]));
  const sceneReports: SceneReport[] = [];
  const failures: string[] = [];

  for (const scene of story.scenes) {
    const phase = phaseById.get(scene.id) ?? "?";
    const rawText = scene.rawText?.trim() ?? "";
    const hasRawText = /\[A\]|\[B\]/.test(rawText);
    let scriptLines = 0;
    let scriptIssues: string[] = [];
    let charA = 0;
    let charB = 0;
    let narrator = 0;
    let taggedSegments = 0;

    if (!hasRawText) {
      failures.push(`Scene ${scene.id} (${phase}): missing rawText [A]/[B] tags`);
    } else {
      const tagged = parseTaggedScript(rawText);
      taggedSegments = tagged.segments.length;
      for (const seg of tagged.segments) {
        if (seg.role === "CHAR_A") charA += 1;
        else if (seg.role === "CHAR_B") charB += 1;
        else narrator += 1;
      }

      // Re-validate script structure from tagged output
      const script = [
        ...tagged.segments.map((s) => ({
          role:
            s.role === "NARRATOR"
              ? ("narrator" as const)
              : s.role === "CHAR_A"
                ? ("protagonist" as const)
                : ("love_interest" as const),
          text: s.text,
        })),
      ];
      scriptLines = script.length;
      const v = validateWriterScript(script, {
        phase,
        requireBothSpeakers: phase === "PERFORM" || phase === "DECLARE" || phase === "FRAME",
      });
      scriptIssues = v.issues;
      if (!v.ok) failures.push(`Scene ${scene.id} (${phase}): ${v.issues.join("; ")}`);
    }

    sceneReports.push({
      id: scene.id,
      heading: scene.heading,
      phase,
      hasRawText,
      scriptLines,
      taggedSegments,
      charA,
      charB,
      narrator,
      scriptIssues,
    });
  }

  const combinedRaw = story.scenes
    .map((s) => s.rawText?.trim())
    .filter(Boolean)
    .join("\n\n");
  const combinedTagged = /\[A\]|\[B\]/.test(combinedRaw) ? parseTaggedScript(combinedRaw) : null;

  const qc = runExpressDeterministicQc({
    story,
    scenePlan: brief.scene_plan,
    storyLength: intake.storyLength,
    fantasySpine: brief.fantasy_spine,
  });

  console.log("\n── Per-beat audio script ──");
  for (const r of sceneReports) {
    const status = r.scriptIssues.length ? "FAIL" : r.hasRawText ? "OK" : "MISSING";
    console.log(
      `  [${status}] ${r.phase.padEnd(8)} ${r.heading.slice(0, 40).padEnd(42)} ` +
        `N=${r.narrator} A=${r.charA} B=${r.charB} segs=${r.taggedSegments}`,
    );
    if (r.scriptIssues.length) {
      for (const issue of r.scriptIssues) console.log(`         ↳ ${issue}`);
    }
  }

  if (combinedTagged) {
    const charSegs = combinedTagged.segments.filter((s) => s.role !== "NARRATOR");
    console.log("\n── Combined TTS map (no audio generated) ──");
    console.log(
      `  segments=${combinedTagged.segments.length} explicit=${combinedTagged.explicitAttributions} ` +
        `distinctRoles=${combinedTagged.distinctCharRoles} charLines=${charSegs.length}`,
    );
    console.log("\n  Sample (first 12 non-narrator):");
    for (const seg of charSegs.slice(0, 12)) {
      console.log(`    [${seg.role}] ${seg.text.slice(0, 70).replace(/\s+/g, " ")}…`);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: "audio-script-e2e-no-tts",
    title: story.title,
    wordCount: words,
    qcScore: qc.score_total,
    qcPassed: qc.passed,
    sceneReports,
    combinedTagged: combinedTagged
      ? {
          segments: combinedTagged.segments.length,
          explicitAttributions: combinedTagged.explicitAttributions,
          distinctCharRoles: combinedTagged.distinctCharRoles,
          sample: combinedTagged.segments.slice(0, 30).map((s) => ({
            role: s.role,
            preview: s.text.slice(0, 120),
          })),
        }
      : null,
    failures,
    elapsedMs: Date.now() - t0,
    writeTiming: summarizeExpressWriteTimings(),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "express-audio-script-latest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  console.log(`\nQC: ${qc.score_total.toFixed(1)} pass=${qc.passed}`);
  console.log(`Manifest: public/test-stories/express-audio-script-latest.json`);
  console.log(`Elapsed: ${((Date.now() - t0) / 1000).toFixed(1)}s (no TTS)`);

  if (failures.length) {
    console.error(`\n❌ ${failures.length} audio-script validation failure(s):`);
    for (const f of failures) console.error(`   • ${f}`);
    process.exit(1);
  }
  console.log("\n✅ All beats have valid write-time audio scripts — safe to generate audio.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
