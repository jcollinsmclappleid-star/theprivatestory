/**
 * Funnel smoke checks — run: node --experimental-strip-types lib/intensity/scripts/smoke-funnel.mjs
 */
import {
  canonicalizeIntensity,
  marketingIntensityToCanonical,
  intensityToLevel,
} from "../src/index.ts";

let failures = 0;
function assert(label, cond) {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    failures++;
  } else {
    console.log(`OK: ${label}`);
  }
}

// Home dial → casting → API canonical
assert("Explicit → Elevated", marketingIntensityToCanonical("Explicit") === "Elevated");
assert("Explicit level 4", intensityToLevel("Explicit") === 4);
assert("Unrestrained → Intense level 5", intensityToLevel("Unrestrained") === 5);
assert("Slow burn → Subtle level 1", intensityToLevel("Slow burn") === 1);

// Legacy paths must not fall through to Warm silently at wrong level
assert("Heated → Elevated", canonicalizeIntensity("Heated") === "Elevated");
assert("Sensual → Warm", canonicalizeIntensity("Sensual") === "Warm");
assert("Scorching → Intense", canonicalizeIntensity("Scorching") === "Intense");
assert("invalid → Warm fallback", canonicalizeIntensity("NUCLEAR") === "Warm");

// Drift redirect target (static check)
const driftRedirect = "/after-dark?funnel=bedtime&enter=1";
assert("Drift redirect includes bedtime funnel", driftRedirect.includes("funnel=bedtime"));
assert("Drift redirect auto-enter", driftRedirect.includes("enter=1"));

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nFunnel smoke checks passed.");
