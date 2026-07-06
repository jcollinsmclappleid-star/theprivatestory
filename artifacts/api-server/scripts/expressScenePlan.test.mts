#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import { buildExpressScenePlan } from "../src/lib/expressScenePlan.js";
import { EXPRESS_BEAT_ORDER } from "../src/lib/storyLength.js";

const plan = buildExpressScenePlan({
  setting: "Office After Hours",
  situationLabel: "works for him",
  declareGoal: "Name blindfold + praise in dialogue",
  performSpine: "Blindfold on; praise during act",
  customerDesireBeatsByPhase: { PERFORM: ["blindfold", "praise"] },
  intensityLevel: 5,
  storyLength: "10 min",
});

assert.equal(plan.length, 4);
assert.deepEqual(plan.map((p) => p.phase), [...EXPRESS_BEAT_ORDER]);
assert.ok(plan[0]!.goal.toLowerCase().includes("do not name customer sex chips"), "FRAME forbids chip naming");
assert.ok(plan[2]!.fantasy_enactment_spine?.includes("Blindfold"), "PERFORM carries enactment spine");
assert.ok(plan[2]!.word_budget_target! > plan[0]!.word_budget_target!, "PERFORM gets largest budget");

console.log("expressScenePlan.test.mts — all assertions passed");
