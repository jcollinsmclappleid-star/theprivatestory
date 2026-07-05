#!/usr/bin/env npx tsx
/**
 * Unit tests for structural dialogue-attribution parsing.
 * Run: npx tsx scripts/dialogueAttribution.test.mts
 */
import assert from "node:assert/strict";
import {
  speakableNarratorSpan,
  cleanNarratorSegmentsForTts,
  speakableDialogueLine,
} from "../src/lib/dialogueAttribution.js";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : err}`);
  }
}

console.log("dialogueAttribution tests\n");

test("post-quote: she said → silent", () => {
  assert.equal(speakableNarratorSpan("she said.", { followsQuote: true, precedesQuote: false }), null);
});

test("post-quote: her supervisor said → silent", () => {
  assert.equal(
    speakableNarratorSpan("her supervisor said.", { followsQuote: true, precedesQuote: false }),
    null,
  );
});

test("post-quote: he commands, voice low → keep stage direction", () => {
  assert.equal(
    speakableNarratorSpan("he commands, voice low.", { followsQuote: true, precedesQuote: false }),
    "voice low",
  );
});

test("post-quote: you ask, taking him deeper → keep action tail", () => {
  assert.equal(
    speakableNarratorSpan("you ask, taking him deeper.", { followsQuote: true, precedesQuote: false }),
    "taking him deeper",
  );
});

test("post-quote: you breathe, looking back → keep tail", () => {
  assert.equal(
    speakableNarratorSpan("you breathe, looking back at him.", { followsQuote: true, precedesQuote: false }),
    "looking back at him",
  );
});

test("non-adjacent: She said nothing → preserved", () => {
  assert.equal(
    speakableNarratorSpan("She said nothing for a long time.", { followsQuote: false, precedesQuote: false }),
    "She said nothing for a long time.",
  );
});

test("non-adjacent: what she said about → preserved", () => {
  assert.equal(
    speakableNarratorSpan("He listened to what she said about the contract.", {
      followsQuote: false,
      precedesQuote: false,
    }),
    "He listened to what she said about the contract.",
  );
});

test("pre-quote: prose + he murmured → keep prose only", () => {
  assert.equal(
    speakableNarratorSpan("The heat rose. He murmured,", { followsQuote: false, precedesQuote: true }),
    "The heat rose",
  );
});

test("cleanNarratorSegmentsForTts drops attribution-only narrator segs", () => {
  const cleaned = cleanNarratorSegmentsForTts([
    { role: "CHAR_B", text: '"Stop."' },
    { role: "NARRATOR", text: "she said." },
    { role: "NARRATOR", text: "The room was still." },
  ]);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0]!.role, "CHAR_B");
  assert.equal(cleaned[1]!.text, "The room was still.");
});

test("speakableDialogueLine strips quotes", () => {
  assert.equal(speakableDialogueLine('"Hello."'), "Hello.");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
