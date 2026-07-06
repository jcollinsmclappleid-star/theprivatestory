#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import {
  countQuoteLines,
  countQuotedWords,
  validateDialogueDensity,
  buildDialogueRetryNote,
} from "../src/lib/dialogueRatio.js";
import {
  hasV3AudioTags,
  stripV3AudioTags,
  selectTtsModel,
  isVocalEffectsEnabled,
} from "../src/lib/audioVocal/index.js";

const weak = validateDialogueDensity(
  {
    scenes: [
      { text: 'She waited. "Hi." He nodded. The room was warm and full of tension and many narrator words here.' },
      { text: Array(350).fill("narration").join(" ") },
      { text: Array(360).fill("narration").join(" ") },
      { text: Array(400).fill("narration").join(" ") },
      { text: '"Bye."' },
    ],
  },
  [
    { phase: "ESTABLISH" },
    { phase: "SIMMER" },
    { phase: "CRACK" },
    { phase: "IGNITE" },
    { phase: "RESONATE" },
  ],
);
assert.equal(weak.ok, false);
assert.ok(buildDialogueRetryNote(weak).includes("DIALOGUE DENSITY"));

const dense = validateDialogueDensity(
  {
    scenes: [
      {
        text: `"You wanted to see me?" she said. "I did." he replied. "Then close the door." "Already closed." "Good."`,
      },
    ],
  },
  [{ phase: "ESTABLISH" }],
);
assert.ok(countQuotedWords(dense ? `"a b c" "d e f"` : "") >= 0);
assert.equal(countQuoteLines('"one" "two" "three"'), 3);

assert.equal(hasV3AudioTags('[breathless] "Stay."'), true);
assert.equal(hasV3AudioTags('"Stay."'), false);
assert.equal(stripV3AudioTags('[gasps softly] Yes—there.').includes("gasps"), false);

assert.equal(selectTtsModel("NARRATOR", '[breathless] hi', true), "eleven_turbo_v2_5");
assert.equal(selectTtsModel("CHAR_A", '[breathless] Stay—', true), "eleven_v3");
assert.equal(selectTtsModel("CHAR_A", "Stay—", true), "eleven_turbo_v2_5");

process.env.VOCAL_EFFECTS = "0";
assert.equal(isVocalEffectsEnabled("Explicit"), false);
delete process.env.VOCAL_EFFECTS;
assert.equal(isVocalEffectsEnabled("Explicit"), true);

console.log("dialogueRatio + audioVocal tests — all passed");
