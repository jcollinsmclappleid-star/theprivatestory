/**
 * Story generation stress test.
 * Run from artifacts/api-server:  npx tsx stress-test.mts
 *
 * Generates N stories sequentially using the real pipeline (plan → write → QC).
 * Audio is already disabled via DISABLE_AUDIO=true.
 * Images are skipped — we test text generation only.
 * Reports timing, word count, QC scores, and pass/fail per story.
 */

import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  type GenerateStoryRequest,
} from "./src/routes/generate.js";

// ---------------------------------------------------------------------------
// Test cases — varied inputs across different moods, pairings, intensities
// ---------------------------------------------------------------------------
const TESTS: Array<{ label: string; input: Partial<GenerateStoryRequest> }> = [
  {
    label: "T1 — Default (minimal input)",
    input: {
      storyLength: "10 min",
      intensity: 3,
      scenarioPrompt: "A late-night encounter in a city hotel bar. Two strangers who have been circling each other all evening.",
    },
  },
  {
    label: "T2 — High intensity, explicit pairing",
    input: {
      storyLength: "10 min",
      intensity: 5,
      pairing: "Me & Him",
      whoIsHe: "The Architect",
      setting: "Her private studio, late night",
      dynamic: "He's been patient. She's been testing that.",
      scenarioPrompt: "She's spent all evening testing how long he can wait before he stops waiting.",
    },
  },
  {
    label: "T3 — Female pairing, emotional arc",
    input: {
      storyLength: "10 min",
      intensity: 3,
      pairing: "Me & Her",
      setting: "A cottage by the sea, off-season",
      mood: "Tender, unhurried, a little bittersweet",
      scenarioPrompt: "Two women who have been friends for years and have always known it could be more.",
    },
  },
  {
    label: "T4 — Power dynamic, experience tags",
    input: {
      storyLength: "10 min",
      intensity: 4,
      pairing: "Me & Him",
      dynamic: "He's in charge but only because she lets him be",
      experienceTags: ["wanted to be told", "desired", "chosen"],
      scenarioPrompt: "After dinner at his apartment, where everything was too perfectly arranged, and she realised she was the thing he'd been arranging toward.",
    },
  },
  {
    label: "T5 — Minimal input, system chooses",
    input: {
      storyLength: "10 min",
      intensity: 2,
      scenarioPrompt: "A bookshop. Closing time. They've both been avoiding leaving.",
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface Result {
  label: string;
  planMs: number;
  writeMs: number;
  qcMs: number;
  totalMs: number;
  wordCount: number;
  qcScore: number;
  qcPassed: boolean;
  qcSceneDiversity: number;
  qcEndingStrength: number;
  qcOriginality: number;
  qcIssues: string[];
  rewriteStrategy: string | null;
  title: string;
  error?: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function padRight(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function runOne(label: string, input: Partial<GenerateStoryRequest>): Promise<Result> {
  const start = Date.now();
  try {
    const req: GenerateStoryRequest = {
      storyLength: "10 min",
      intensity: 3,
      scenarioPrompt: "",
      ...input,
    } as GenerateStoryRequest;

    // --- Plan ---
    const planStart = Date.now();
    const brief = await planStory(req);
    const planMs = Date.now() - planStart;

    // Check new diversity fields are present
    const missingFields: string[] = [];
    for (const scene of brief.scene_plan) {
      for (const f of ["prose_rhythm", "scene_open_beat", "interiority_depth", "dialogue_mode", "partner_attention_focus"]) {
        if (!(scene as Record<string, unknown>)[f]) missingFields.push(`scene${scene.scene_number}.${f}`);
      }
    }
    if (missingFields.length > 0) {
      console.log(`   ⚠️  Missing diversity fields: ${missingFields.join(", ")}`);
    } else {
      console.log(`   ✓  All 9 diversity dimensions present in brief`);
    }

    // --- Write ---
    const writeStart = Date.now();
    const listenerName = req.listenerName ?? "You";
    const intensityLabel = req.intensity === 5 ? "Explicit" : req.intensity === 4 ? "Steamy" : req.intensity === 2 ? "Warm" : req.intensity === 1 ? "Gentle" : "Sensual";
    const story = await writeStoryFromBrief(brief, listenerName, intensityLabel, {
      scenarioPrompt: req.scenarioPrompt,
      pairing: req.pairing,
      whoIsHe: req.whoIsHe,
      setting: req.setting,
      dynamic: req.dynamic,
      mood: req.mood,
      experienceTags: req.experienceTags,
    });
    const writeMs = Date.now() - writeStart;

    // --- QC ---
    const qcStart = Date.now();
    const qcResult = await qcStory(brief, story, {
      scenarioPrompt: req.scenarioPrompt,
      pairing: req.pairing,
    });
    const qcMs = Date.now() - qcStart;

    const totalMs = Date.now() - start;
    const allText = story.scenes.map((s: { text: string }) => s.text).join(" ");
    const wordCount = countWords(allText);

    return {
      label,
      planMs,
      writeMs,
      qcMs,
      totalMs,
      wordCount,
      qcScore: qcResult.score_total,
      qcPassed: qcResult.passed,
      qcSceneDiversity: qcResult.sub_scores?.scene_diversity_compliance ?? 0,
      qcEndingStrength: qcResult.sub_scores?.ending_strength ?? 0,
      qcOriginality: qcResult.sub_scores?.originality ?? 0,
      qcIssues: qcResult.issues ?? [],
      rewriteStrategy: qcResult.rewrite_strategy ?? null,
      title: story.title ?? "Untitled",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message + "\n" + err.stack : String(err);
    return {
      label,
      planMs: 0, writeMs: 0, qcMs: 0,
      totalMs: Date.now() - start,
      wordCount: 0,
      qcScore: 0,
      qcPassed: false,
      qcSceneDiversity: 0,
      qcEndingStrength: 0,
      qcOriginality: 0,
      qcIssues: [],
      rewriteStrategy: null,
      title: "ERROR",
      error: msg,
    };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log("=".repeat(72));
console.log("STORY GENERATION STRESS TEST");
console.log(`DISABLE_AUDIO: ${process.env.DISABLE_AUDIO ?? "not set"}`);
console.log(`Running ${TESTS.length} tests sequentially...`);
console.log("=".repeat(72));

const results: Result[] = [];

for (const test of TESTS) {
  console.log(`\n▶  ${test.label}`);
  const result = await runOne(test.label, test.input);
  results.push(result);

  if (result.error) {
    console.log(`   ❌  ERROR: ${result.error.split("\n")[0]}`);
    if (result.error.includes("\n")) {
      console.log(result.error.split("\n").slice(1, 5).map(l => "      " + l).join("\n"));
    }
  } else {
    const pass = result.qcPassed ? "✅ PASS" : "❌ FAIL";
    console.log(`   Title:      "${result.title}"`);
    console.log(`   ${pass}  score=${result.qcScore.toFixed(1)}  words=${result.wordCount}  total=${(result.totalMs/1000).toFixed(1)}s`);
    console.log(`   plan=${(result.planMs/1000).toFixed(1)}s  write=${(result.writeMs/1000).toFixed(1)}s  qc=${(result.qcMs/1000).toFixed(1)}s`);
    console.log(`   Sub-scores  diversity=${result.qcSceneDiversity}  ending=${result.qcEndingStrength}  originality=${result.qcOriginality}`);
    if (result.rewriteStrategy) console.log(`   Strategy:   ${result.rewriteStrategy}`);
    if (result.qcIssues.length > 0) {
      console.log(`   Issues:`);
      result.qcIssues.slice(0, 6).forEach(i => console.log(`     - ${i}`));
      if (result.qcIssues.length > 6) console.log(`     ... (${result.qcIssues.length - 6} more)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------
console.log("\n" + "=".repeat(72));
console.log("SUMMARY");
console.log("=".repeat(72));
console.log(
  padRight("Test", 28) +
  padRight("Pass", 6) +
  padRight("Score", 7) +
  padRight("Words", 7) +
  padRight("Div", 5) +
  padRight("Time(s)", 8) +
  "Strategy"
);
console.log("-".repeat(72));
for (const r of results) {
  console.log(
    padRight(r.label.slice(0, 27), 28) +
    padRight(r.qcPassed ? "✅" : "❌", 6) +
    padRight(r.error ? "ERR" : r.qcScore.toFixed(1), 7) +
    padRight(String(r.wordCount), 7) +
    padRight(String(r.qcSceneDiversity), 5) +
    padRight(((r.totalMs)/1000).toFixed(1) + "s", 8) +
    (r.rewriteStrategy ?? r.error?.split("\n")[0].slice(0, 30) ?? "—")
  );
}

const passed = results.filter(r => r.qcPassed && !r.error).length;
const errored = results.filter(r => !!r.error).length;
const valid = results.filter(r => !r.error);
const avgScore = valid.length ? valid.reduce((s, r) => s + r.qcScore, 0) / valid.length : 0;
const avgWords = valid.length ? valid.reduce((s, r) => s + r.wordCount, 0) / valid.length : 0;
const avgDiv = valid.length ? valid.reduce((s, r) => s + r.qcSceneDiversity, 0) / valid.length : 0;
const totalSec = results.reduce((s, r) => s + r.totalMs, 0) / 1000;

console.log("-".repeat(72));
console.log(
  `Passed: ${passed}/${results.length}  Errored: ${errored}  ` +
  `Avg score: ${avgScore.toFixed(2)}  Avg words: ${Math.round(avgWords)}  ` +
  `Avg diversity: ${avgDiv.toFixed(1)}  Total time: ${totalSec.toFixed(0)}s`
);
console.log("=".repeat(72));
