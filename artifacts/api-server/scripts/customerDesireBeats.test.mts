#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import {
  attachFantasySpineToBrief,
  buildFantasySpine,
  classifyExperienceTag,
  scoreCustomerDesireCompliance,
} from "../src/lib/customerDesireBeats.js";

const prot = { sub: "She", obj: "her", poss: "her", refl: "herself" };

assert.equal(classifyExperienceTag("She wanted to be blindfolded"), "physical");
assert.equal(classifyExperienceTag("He shouldn't, and neither should you"), "general");

const spine = buildFantasySpine(
  {
    scenarioTags: ["He shouldn't, and neither should you", "The risk is part of the pull"],
    customerDesireTags: ["She wanted to be blindfolded", "She wanted to be praised while it happens"],
    situationId: "fc_01",
    storyMode: "forbidden",
    setting: "Office After Hours",
    dynamic: "Magnetic",
    chemistry: "Magnetic",
  },
  prot,
);

assert.ok(spine.situation_stakes?.includes("employed by him"));
assert.equal(spine.customer_enactments.length, 2);
assert.ok(spine.perform_spine.includes("blindfold"));
assert.ok(spine.declare_desire_declaration.includes("DECLARE"));

const brief = attachFantasySpineToBrief(
  {
    scene_plan: [
      { phase: "FRAME", goal: "open" },
      { phase: "DECLARE", goal: "name desires" },
      { phase: "PERFORM", goal: "enact" },
      { phase: "LAND", goal: "close" },
    ],
  },
  spine,
);

const perform = brief.scene_plan[2]!;
assert.ok(perform.customer_desire_beats?.length);
assert.ok(perform.fantasy_enactment_spine);

  const compliance = scoreCustomerDesireCompliance(
    [
      { heading: "Perform", text: 'He tied the blindfold over her eyes. "Good girl," he murmured, praising her as she gasped.' },
    ],
    spine,
    brief.scene_plan,
  );
assert.ok(compliance.passes.length >= 1);

console.log("customerDesireBeats.test.mts — all assertions passed");
