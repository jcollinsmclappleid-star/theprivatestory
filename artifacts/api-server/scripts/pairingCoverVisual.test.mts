#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import {
  appendImageSafetyConstraints,
  buildCastingCoverLock,
  heritageImageLabel,
  pairingCastingSubject,
  pairingCoverFigures,
  pairingImageExtractionGuide,
  sanitizeUnwantedImageVisuals,
} from "../src/lib/pairingCoverVisual.js";

assert.match(pairingCoverFigures("Her & Her"), /two women/i);
assert.match(pairingCoverFigures("Him & Him"), /two men/i);
assert.match(pairingCoverFigures("Her & Him"), /woman and a man/i);
assert.match(pairingCastingSubject("Her & Her", "Latina"), /two Latina women/i);
assert.match(pairingCastingSubject("Her & Him", "Black"), /Black woman and a Black man/i);
assert.match(pairingCastingSubject("Him & Him", "East Asian"), /two East Asian men/i);
assert.equal(heritageImageLabel("Ambiguous"), undefined);
assert.equal(heritageImageLabel("Latina"), "Latina");

const guide = pairingImageExtractionGuide("Him & Him", "Latina");
assert.ok(guide.includes("Him & Him"));
assert.ok(guide.includes("Latina"));

const lock = buildCastingCoverLock("Her & Him", "South Asian");
assert.ok(lock.includes("CASTING LOCK"));
assert.ok(lock.includes("South Asian"));
assert.ok(lock.includes("Never European"));

const cleaned = sanitizeUnwantedImageVisuals("firelit warmth with dancing flames near a bonfire");
assert.ok(!/\bflames?\b/i.test(cleaned));
assert.ok(!/\bbonfire/i.test(cleaned));
assert.ok(!/\bfirelit\b/i.test(cleaned));

const safe = appendImageSafetyConstraints("romantic cover, warm candlelight");
assert.ok(safe.toLowerCase().includes("no flames"));
assert.ok(!/\bflames?\b/i.test(safe.replace(/no flames/gi, "")));

console.log("pairingCoverVisual.test.mts — all assertions passed");
