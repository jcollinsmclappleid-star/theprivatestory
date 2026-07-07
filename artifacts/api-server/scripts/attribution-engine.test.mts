#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  attributeAllDialoguesDeterministic,
  classifyDialogueLine,
  dialogueInner,
  isPartnerDirectedAtListener,
  segmentStoryQuotes,
  validateAttributionConfidence,
  type AttributionState,
  type CastingContext,
} from "../src/lib/speakerAttribution.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, "../fixtures/attribution-snippets");

function cast(pairing: string, listener?: string, partner?: string): CastingContext {
  return { pairing, listenerName: listener, partnerName: partner, protagonistName: listener };
}

function classifyOne(
  quote: string,
  context: string,
  casting: CastingContext,
  state?: AttributionState,
): ReturnType<typeof classifyDialogueLine> {
  const s = state ?? { lastSpeaker: "CHAR_A" as const, hadExplicitSpeaker: false };
  return classifyDialogueLine(dialogueInner(quote), context, casting, s);
}

// ── Rochelle vocative (reported production bug) ─────────────────────────────
assert.equal(
  classifyOne(
    '"You\'re going to come for me, Rochelle"',
    "he murmured, voice rough",
    cast("Her & Him", "Rochelle", "James"),
  ).role,
  "CHAR_B",
);
assert.equal(
  classifyOne(
    '"You\'re going to come for me, Rochelle"',
    "he murmured",
    cast("Her & Him", "Rochelle", "James"),
  ).confidence,
  "high",
);

// Partner command without name
assert.ok(isPartnerDirectedAtListener("You're going to come for me", "Her & Him"));
assert.equal(
  classifyOne('"You\'re going to come for me"', "", cast("Her & Him", "Rochelle", "James")).role,
  "CHAR_B",
);

// Protagonist response
assert.equal(
  classifyOne('"Yes,"', "you breathed", cast("Her & Him", "Rochelle", "James")).role,
  "CHAR_A",
);

// Surrounding prose anchor
assert.equal(
  classifyOne('"Say it,"', "he demanded", cast("Her & Him", "Rochelle", "James")).role,
  "CHAR_B",
);

// Her & Her — name in context
assert.equal(
  classifyOne(
    '"On the desk,"',
    "her supervisor said",
    cast("Her & Her", "Maya", "Clara"),
  ).role,
  "CHAR_B",
);

// Fixture batch — deterministic must resolve all lines with high/medium confidence
const STRICT_FIXTURES = new Set(["vocative-listener-name"]);

for (const file of fs.readdirSync(FIXTURES).filter((f) => f.endsWith(".json"))) {
  const fx = JSON.parse(fs.readFileSync(path.join(FIXTURES, file), "utf8")) as {
    slug: string;
    text: string;
    pairing: string;
    protagonistName?: string;
    partnerName?: string;
  };
  const { spans, dialogues } = segmentStoryQuotes(fx.text);
  if (!dialogues.length) continue;
  const attributions = attributeAllDialoguesDeterministic(
    dialogues,
    spans,
    cast(fx.pairing, fx.protagonistName, fx.partnerName),
  );
  if (!STRICT_FIXTURES.has(fx.slug)) continue;
  const validation = validateAttributionConfidence(attributions);
  assert.ok(
    validation.ok,
    `${fx.slug}: unresolved low-confidence lines at indices ${validation.lowIndices.join(",")}`,
  );
}

console.log("attribution-engine.test.mts — all assertions passed");
