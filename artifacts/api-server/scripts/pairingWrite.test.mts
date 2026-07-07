#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import {
  adaptTextForPairing,
  buildSpeechCuePatterns,
  inferSpeakerFromVocative,
  isAddressingCharacterName,
  isPartnerCommandToListener,
  perspectiveFromPairing,
  positionChangeExamples,
  praisePhraseForPairing,
  protPronounsFromPairing,
} from "../src/lib/pairingWrite.js";

const herThem = protPronounsFromPairing("Her & Them");
assert.equal(herThem.sub, "She");
assert.equal(herThem.obj, "her");

const himThem = protPronounsFromPairing("Him & Them");
assert.equal(himThem.sub, "He");

assert.equal(praisePhraseForPairing("Him & Them"), "Good boy");
assert.equal(praisePhraseForPairing("Her & Her"), "Good girl");

assert.equal(perspectiveFromPairing("Him & Him"), "his");
assert.equal(perspectiveFromPairing("Them & Them"), "their");

const adapted = adaptTextForPairing("He shouldn't, and neither should you", "Her & Her");
assert.ok(adapted.includes("She shouldn't"));
assert.ok(!/\bHe shouldn't\b/.test(adapted));

const ffPositions = positionChangeExamples("Her & Her", "Sophia");
assert.ok(/\bshe said\b/i.test(ffPositions[0]!));
assert.ok(!/\bhe said\b/i.test(ffPositions[0]!));

const cues = buildSpeechCuePatterns("Her & Her", "Sophia", "Elena");
assert.ok(cues.liSpeechAfter.test('"Stay still," she breathed.'));
assert.ok(cues.protagSpeechAfter.test("you whisper"));

assert.ok(isAddressingCharacterName("You're going to come for me, Rochelle", "Rochelle"));
assert.equal(inferSpeakerFromVocative("You're going to come for me, Rochelle", "Rochelle", "Sophia"), "CHAR_B");
assert.ok(isPartnerCommandToListener("You're going to come for me, Rochelle"));

console.log("pairingWrite.test.mts — all assertions passed");
