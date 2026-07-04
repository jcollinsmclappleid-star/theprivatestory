/**
 * Intensity canonicalization QA — run: node --experimental-strip-types lib/intensity/scripts/qa.mjs
 */
import {
  canonicalizeIntensity,
  intensityToLevel,
  intensityStyleFor,
  marketingIntensityToCanonical,
  canonicalToMarketing,
} from "../src/index.ts";

let failures = 0;

function assert(label, actual, expected) {
  if (actual !== expected) {
    console.error(`FAIL: ${label} — got "${actual}", expected "${expected}"`);
    failures++;
  } else {
    console.log(`OK: ${label}`);
  }
}

const canonicalCases = [
  ["Subtle", "Subtle", 1],
  ["Warm", "Warm", 3],
  ["Elevated", "Elevated", 4],
  ["Intense", "Intense", 5],
];

for (const [input, canon, level] of canonicalCases) {
  assert(`canonicalize(${input})`, canonicalizeIntensity(input), canon);
  assert(`level(${input})`, intensityToLevel(input), level);
}

const legacyCases = [
  ["Explicit", "Elevated", 4],
  ["Heated", "Elevated", 4],
  ["Scorching", "Intense", 5],
  ["Tender", "Subtle", 1],
  ["Sensual", "Warm", 3],
  ["Slow burn", "Subtle", 1],
  ["Unrestrained", "Intense", 5],
];

for (const [input, canon, level] of legacyCases) {
  assert(`legacy canonicalize(${input})`, canonicalizeIntensity(input), canon);
  assert(`legacy level(${input})`, intensityToLevel(input), level);
}

assert("invalid → Warm fallback", canonicalizeIntensity("NUCLEAR"), "Warm");
assert("empty → Warm fallback", canonicalizeIntensity(""), "Warm");

const marketingCases = [
  ["Slow burn", "Subtle"],
  ["Warm", "Warm"],
  ["Explicit", "Elevated"],
  ["Unrestrained", "Intense"],
];
for (const [label, canon] of marketingCases) {
  assert(`marketing(${label})`, marketingIntensityToCanonical(label), canon);
}

assert("round-trip Elevated", canonicalToMarketing("Elevated"), "Explicit");
assert("style Explicit", JSON.stringify(intensityStyleFor("Explicit")), JSON.stringify({ narrator: 0.25, char: 0.50 }));
assert("style Intense", JSON.stringify(intensityStyleFor("Scorching")), JSON.stringify({ narrator: 0.35, char: 0.70 }));

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nAll intensity QA checks passed.");
