#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import { shouldUseExpressFastPath, buildExpressBrief } from "../src/lib/expressBrief.js";

assert.equal(shouldUseExpressFastPath({ situationId: "fc_01" }), true);
assert.equal(shouldUseExpressFastPath({ customerDesireTags: ["She wanted to be blindfolded"] }), true);
assert.equal(shouldUseExpressFastPath({}), false);

const brief = buildExpressBrief({
  pairing: "Her & Him",
  setting: "Office After Hours",
  storyMode: "forbidden",
  situationId: "fc_01",
  scenarioTags: ["He shouldn't, and neither should you"],
  customerDesireTags: ["She wanted to be blindfolded"],
  intensity: "Explicit",
  storyLength: "10 min",
});

assert.equal(brief.scene_count, 4);
assert.ok(brief.fantasy_spine?.perform_spine.includes("blindfold"));
assert.ok(brief.scene_plan[2]?.phase === "PERFORM");
assert.ok(brief.scene_plan[2]?.customer_desire_beats?.length);

console.log("expressBrief.test.mts — all assertions passed");
