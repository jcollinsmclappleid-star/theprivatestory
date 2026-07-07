#!/usr/bin/env npx tsx
import assert from "node:assert/strict";
import { buildFantasySpine } from "../src/lib/customerDesireBeats.js";
import {
  applyDeterministicConstraintRepairs,
  compileEnactmentSpecs,
  repairBlindfoldSightText,
  repairPraiseInDialogue,
  repairSituationStakesText,
  resolveActiveConstraints,
  validateBeatConstraints,
  validateStoryEnactmentConstraints,
} from "../src/lib/enactmentConstraints.js";
import { buildInitialLedger, mergeContinuityUpdate } from "../src/lib/sceneContinuity.js";

const prot = { sub: "She", obj: "her", poss: "her", refl: "herself" };

const spine = buildFantasySpine(
  {
    scenarioTags: ["He shouldn't, and neither should you"],
    customerDesireTags: ["She wanted to be blindfolded", "She wanted to be praised while it happens"],
    situationId: "fc_01",
    storyMode: "forbidden",
    setting: "Office After Hours",
    dynamic: "Magnetic",
    chemistry: "Magnetic",
  },
  prot,
);

const specs = compileEnactmentSpecs(spine);
assert.ok(specs.some((s) => s.constraintIds.includes("no_listener_sight_while_blindfolded")));
assert.ok(specs.some((s) => s.constraintIds.includes("praise_in_partner_dialogue")));

const ledgerOn = buildInitialLedger({
  activeTags: spine.customer_desire_tags,
  partnerName: "James",
});
ledgerOn.blindfold = "on";

const badLine =
  'The blindfold slips over your eyes. "Look at this pretty cunt," he murmurs, and his tongue follows.';
const before = buildInitialLedger({ activeTags: spine.customer_desire_tags });
const after = mergeContinuityUpdate(before, { blindfold: "on" });
const violations = validateBeatConstraints(badLine, before, after, "PERFORM", specs);
assert.ok(violations.some((v) => v.constraintId === "no_listener_sight_while_blindfolded"));

const goodLine =
  'The blindfold slips over your eyes. "Tell me what you feel," he murmurs, praising you as his hands move.';
const goodViolations = validateBeatConstraints(goodLine, before, after, "PERFORM", specs, {
  situationStakes: spine.situation_stakes,
});
assert.equal(
  goodViolations.filter((v) => v.constraintId === "no_listener_sight_while_blindfolded").length,
  0,
);

const active = resolveActiveConstraints(ledgerOn, specs, "PERFORM", {
  situationStakes: spine.situation_stakes,
});
assert.ok(active.some((a) => a.id === "no_listener_sight_while_blindfolded"));

const storyViolations = validateStoryEnactmentConstraints(
  [
    { heading: "Frame", text: "Office tension." },
    { heading: "Declare", text: '"I want to be blindfolded," you say.' },
    {
      heading: "Perform",
      text:
        'He blindfolds you. "Look at this," he says. "Good girl," he praises while touching you. The office risk thrills you.',
    },
    { heading: "Land", text: "Aftermath." },
  ],
  [
    { phase: "FRAME" },
    { phase: "DECLARE" },
    { phase: "PERFORM" },
    { phase: "LAND" },
  ],
  spine,
);
assert.ok(storyViolations.some((v) => v.constraintId === "no_listener_sight_while_blindfolded"));

const stakesMissing = "He touched you slowly, voice low, hands mapping every curve.";
const stakesRepaired = repairSituationStakesText(stakesMissing);
assert.ok(/shouldn'?t|forbidden/i.test(stakesRepaired));

const praiseMissing = 'He moved against you. "Tell me," he said.';
const praiseRepaired = repairPraiseInDialogue(praiseMissing, "Her & Her");
assert.ok(/good girl|perfect/i.test(praiseRepaired));
assert.ok(!/\bhe murmured\b/i.test(praiseRepaired));

const praiseRepairedMlm = repairPraiseInDialogue(praiseMissing, "Him & Him");
assert.ok(/good boy/i.test(praiseRepairedMlm));

const blindfoldBad = 'The blindfold slips on. "Look at this," he says.';
const blindfoldRepaired = repairBlindfoldSightText(blindfoldBad);
assert.ok(!/look at this/i.test(blindfoldRepaired));

const repairResult = applyDeterministicConstraintRepairs(stakesMissing, [
  { constraintId: "situation_stakes_present", tag: "situation", message: "missing stakes" },
]);
assert.ok(repairResult.applied.includes("situation_stakes_present"));

console.log("enactmentConstraints.test.mts — all assertions passed");
