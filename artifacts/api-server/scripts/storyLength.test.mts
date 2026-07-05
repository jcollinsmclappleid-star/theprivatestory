#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import {
  buildStructuralRetryNote,
  countWords,
  minWordsForStoryLength,
  totalWordCountFromParsed,
  validateStoryLength,
  wordCountTargetForStoryLength,
} from "../src/lib/storyLength.js";

function scene(text: string) {
  return { text };
}

const plan = [
  { phase: "ESTABLISH" },
  { phase: "SIMMER" },
  { phase: "CRACK" },
  { phase: "IGNITE" },
  { phase: "RESONATE" },
];

const phaseMin: Record<string, number> = {
  ESTABLISH: 300,
  SIMMER: 330,
  CRACK: 360,
  IGNITE: 400,
  RESONATE: 240,
};

const okParsed = {
  scenes: plan.map((p) => scene(Array(phaseMin[p.phase]!).fill("word").join(" "))),
};

assert.equal(wordCountTargetForStoryLength("10 min")?.includes("1,440"), true);
assert.equal(minWordsForStoryLength("10 min"), 1440);

const ok = validateStoryLength(okParsed, 5, plan);
assert.equal(ok.ok, true);

const short = validateStoryLength(
  {
    scenes: [
      scene("one two three"),
      scene(Array(320).fill("a").join(" ")),
      scene(Array(350).fill("b").join(" ")),
      scene(Array(200).fill("c").join(" ")),
      scene(Array(240).fill("d").join(" ")),
    ],
  },
  5,
  plan,
);

assert.equal(short.ok, false);
assert.equal(short.wordCount < 1440, true);
assert.ok(short.shortPhases.some((p) => p.phase === "IGNITE"));
assert.ok(buildStructuralRetryNote(short).includes("PER-SCENE LENGTH"));

assert.equal(countWords("  hello   world  "), 2);
assert.equal(totalWordCountFromParsed({ scenes: [{ text: "a b c" }, { text: "d e" }] }), 5);

console.log("storyLength.test.mts — all passed");
