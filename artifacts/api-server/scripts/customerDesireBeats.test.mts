#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import {
  attachFantasySpineToBrief,
  buildConversationBlockContract,
  buildFantasySpine,
  buildPhaseChipLifecycleBlock,
  classifyExperienceTag,
  scoreCustomerDesireCompliance,
  validateSituationStakesInFrame,
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
assert.ok(spine.perform_spine.includes("OFFER"));
assert.ok(spine.declare_desire_declaration.includes("NEGOTIATION"));
assert.ok(spine.customer_enactments[0]!.actBeats.length >= 4);
assert.ok(spine.customer_enactments[0]!.foreshadow.length > 10);

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

const frame = brief.scene_plan[0]!;
const perform = brief.scene_plan[2]!;
assert.ok(frame.customer_desire_beats?.length);
assert.ok(frame.fantasy_enactment_spine?.includes("FORESHADOW"));
assert.ok(perform.customer_desire_beats?.length);
assert.ok(perform.fantasy_enactment_spine?.includes("CHIP 1"));

assert.ok(buildConversationBlockContract("FRAME").includes("6–10"));
assert.ok(buildPhaseChipLifecycleBlock("DECLARE", spine.customer_enactments).includes("NEGOTIATE"));

const compliance = scoreCustomerDesireCompliance(
  [
    {
      heading: "Frame",
      text: '"We shouldn\'t be here," she said. "If anyone walks past that door." "Then be quiet," he murmured.',
    },
    {
      heading: "Perform",
      text: 'He tied the blindfold over her eyes. "Don\'t move," he said. "Good girl," he murmured, praising her as she gasped. "Stay still for me."',
    },
  ],
  spine,
  brief.scene_plan,
);
assert.ok(compliance.passes.length >= 1);

const situationOk = validateSituationStakesInFrame(
  [{ heading: "Frame", text: '"We can\'t do this here — if anyone hears us." "I know."' }],
  spine,
);
assert.equal(situationOk.ok, true);

console.log("customerDesireBeats.test.mts — all assertions passed");
