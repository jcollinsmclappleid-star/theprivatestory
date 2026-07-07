/**
 * Enactment constraint compiler — chips compile to state + validators (single source of truth).
 * Used by Express write retries and deterministic QC.
 */

import type { CustomerDesireBeat, FantasySpine } from "./customerDesireBeats.js";
import type { ContinuityUpdate, SceneContinuityLedger } from "./sceneContinuity.js";
import { buildInitialLedger, mergeContinuityUpdate } from "./sceneContinuity.js";
import { countWords } from "./storyLength.js";
import { pairingRepairContext } from "./pairingWrite.js";

export type ConstraintId =
  | "no_listener_sight_while_blindfolded"
  | "restraint_remains_binding"
  | "praise_in_partner_dialogue"
  | "situation_stakes_present";

export type EnactmentSpec = {
  tag: string;
  bucket: CustomerDesireBeat["bucket"];
  activates: ContinuityUpdate;
  constraintIds: ConstraintId[];
};

export type ActiveConstraint = {
  id: ConstraintId;
  tag: string;
  instruction: string;
};

export type ConstraintViolation = {
  constraintId: ConstraintId;
  tag: string;
  message: string;
  excerpt?: string;
};

const CONSTRAINT_COPY: Record<ConstraintId, string> = {
  no_listener_sight_while_blindfolded:
    "While blindfold is ON: listener cannot see. Never direct \"you\" to look/watch/see. Use sound, touch, breath, and speech only.",
  restraint_remains_binding:
    "While restraint is ON: do not describe the listener moving freely (standing, walking away, reaching) unless the partner releases them in dialogue.",
  praise_in_partner_dialogue:
    "Praise chip active: partner must speak praise in quoted dialogue during physical escalation (e.g. good girl, good boy, perfect, incredible, doing so well — match pairing gender).",
  situation_stakes_present:
    "Situation stakes active: include at least one line acknowledging forbidden/professional risk during PERFORM (contract, boss, caught, shouldn't, office rules).",
};

const LISTENER_SIGHT_PATTERN =
  /\b(look at|watch(?:\s+me)?|see this|see how|see what|gaze at|stare at)\b/i;
const BLINDFOLD_CONTEXT_OK =
  /\b(can'?t see|couldn'?t see|blindfold|darkness|eyes (?:are )?covered|blocking out)\b/i;
const PRAISE_IN_DIALOGUE =
  /\b(good girl|good boy|perfect|beautiful|proud of you|doing so well|incredible|that's it|so good|praise)\b/i;
const FREE_MOVEMENT_WHILE_BOUND =
  /\byou (?:stand up|walk away|reach for|push (?:him|her|them) away|break free)\b/i;
const SITUATION_RISK =
  /\b(contract|professional|boss|colleague|office|shouldn'?t|mustn'?t|can'?t|forbidden|caught|rules|employed|fired|firing|risk|wrong|secret|married|anyone|discover|exposed|knock|door|policy|coworker|work|after hours|not supposed|if (?:they|anyone) (?:found|saw|knew)|could lose|stakes)\b/i;

function tagLc(tag: string): string {
  return tag.toLowerCase();
}

function constraintIdsFromBeat(beat: CustomerDesireBeat): ConstraintId[] {
  const t = tagLc(beat.tag);
  const ids: ConstraintId[] = [];
  if (t.includes("blindfold")) ids.push("no_listener_sight_while_blindfolded");
  if (
    t.includes("tied") ||
    t.includes("held down") ||
    t.includes("not to move") ||
    t.includes("kept completely still") ||
    t.includes("restraint")
  ) {
    ids.push("restraint_remains_binding");
  }
  if (t.includes("praised")) ids.push("praise_in_partner_dialogue");
  return ids;
}

function activatesFromBeat(beat: CustomerDesireBeat): ContinuityUpdate {
  const t = tagLc(beat.tag);
  if (t.includes("blindfold")) return { blindfold: "on" };
  if (
    t.includes("tied") ||
    t.includes("held down") ||
    t.includes("not to move") ||
    t.includes("kept completely still")
  ) {
    return { restraint: "on" };
  }
  return {};
}

/** Compile machine-readable specs from the fantasy spine (plan time). */
export function compileEnactmentSpecs(spine: FantasySpine): EnactmentSpec[] {
  return spine.customer_enactments.map((beat) => ({
    tag: beat.tag,
    bucket: beat.bucket,
    activates: activatesFromBeat(beat),
    constraintIds: constraintIdsFromBeat(beat),
  }));
}

/** Resolve which constraints apply for this beat given ledger state. */
export function resolveActiveConstraints(
  ledger: SceneContinuityLedger,
  specs: EnactmentSpec[],
  phase: string,
  opts?: { situationStakes?: string },
): ActiveConstraint[] {
  const phaseU = phase.toUpperCase();
  const out: ActiveConstraint[] = [];
  const tagFor = (id: ConstraintId) =>
    specs.find((s) => s.constraintIds.includes(id))?.tag ?? id;

  if (ledger.blindfold === "on" && (phaseU === "PERFORM" || phaseU === "LAND")) {
    out.push({
      id: "no_listener_sight_while_blindfolded",
      tag: tagFor("no_listener_sight_while_blindfolded"),
      instruction: CONSTRAINT_COPY.no_listener_sight_while_blindfolded,
    });
  }

  if (ledger.restraint === "on" && phaseU === "PERFORM") {
    out.push({
      id: "restraint_remains_binding",
      tag: tagFor("restraint_remains_binding"),
      instruction: CONSTRAINT_COPY.restraint_remains_binding,
    });
  }

  const wantsPraise = ledger.activeTags.some((t) => tagLc(t).includes("praised"));
  if (wantsPraise && phaseU === "PERFORM") {
    out.push({
      id: "praise_in_partner_dialogue",
      tag: tagFor("praise_in_partner_dialogue"),
      instruction: CONSTRAINT_COPY.praise_in_partner_dialogue,
    });
  }

  if (opts?.situationStakes?.trim() && phaseU === "PERFORM") {
    out.push({
      id: "situation_stakes_present",
      tag: "situation",
      instruction: CONSTRAINT_COPY.situation_stakes_present,
    });
  }

  return out;
}

export function constraintsPromptBlock(active: ActiveConstraint[]): string {
  if (!active.length) return "";
  return `ACTIVE ENACTMENT RULES (violating any rule invalidates this beat — revise before returning):
${active.map((c) => `  • [${c.id}] ${c.instruction}`).join("\n")}`;
}

export function buildConstraintRetryNote(violations: ConstraintViolation[]): string {
  if (!violations.length) return "";
  const lines = violations.map(
    (v) => `  • ${v.constraintId} (${v.tag}): ${v.message}${v.excerpt ? ` — "${v.excerpt.slice(0, 80)}"` : ""}`,
  );
  return `CRITICAL — ENACTMENT CONSTRAINT VIOLATIONS (fix in revision; do not patch with one line — rewrite offending sentences):\n${lines.join("\n")}`;
}

function textUnderBlindfoldConstraint(
  text: string,
  ledgerBefore: SceneContinuityLedger,
  ledgerAfter: SceneContinuityLedger,
): string {
  if (ledgerAfter.blindfold !== "on") return "";
  if (ledgerBefore.blindfold === "on") return text;
  const idx = text.search(
    /\b(blindfold(?:s|ed)?|blind-fold|over your eyes|eyes covered|fabric blocking|darkness\. then)\b/i,
  );
  return idx >= 0 ? text.slice(idx) : text;
}

function checkNoListenerSight(scope: string): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  if (!scope.trim()) return violations;

  for (const m of scope.matchAll(/"([^"]+)"/g)) {
    const line = m[1] ?? "";
    if (LISTENER_SIGHT_PATTERN.test(line) && !BLINDFOLD_CONTEXT_OK.test(line)) {
      violations.push({
        constraintId: "no_listener_sight_while_blindfolded",
        tag: "blindfold",
        message: "Quoted dialogue instructs the listener to see while blindfolded",
        excerpt: line,
      });
    }
  }

  for (const sentence of scope.split(/(?<=[.!?])\s+/)) {
    if (/"[^"]+"/.test(sentence)) continue;
    if (
      /\byou\b/i.test(sentence) &&
      LISTENER_SIGHT_PATTERN.test(sentence) &&
      !BLINDFOLD_CONTEXT_OK.test(sentence)
    ) {
      violations.push({
        constraintId: "no_listener_sight_while_blindfolded",
        tag: "blindfold",
        message: "Narrator directs the listener to see while blindfolded",
        excerpt: sentence.trim(),
      });
    }
  }

  return violations;
}

function checkRestraintBinding(text: string): ConstraintViolation[] {
  const m = FREE_MOVEMENT_WHILE_BOUND.exec(text);
  if (!m) return [];
  return [
    {
      constraintId: "restraint_remains_binding",
      tag: "restraint",
      message: "Listener moves freely while restraint should be active",
      excerpt: m[0],
    },
  ];
}

function checkPraiseInDialogue(text: string, minWords = 120): ConstraintViolation[] {
  if (countWords(text) < minWords) return [];
  const quotes = [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "");
  const praised = quotes.some((q) => PRAISE_IN_DIALOGUE.test(q));
  if (praised) return [];
  return [
    {
      constraintId: "praise_in_partner_dialogue",
      tag: "praise",
      message: "No partner praise in quoted dialogue in this PERFORM segment",
    },
  ];
}

function checkSituationStakes(text: string): ConstraintViolation[] {
  if (SITUATION_RISK.test(text)) return [];
  return [
    {
      constraintId: "situation_stakes_present",
      tag: "situation",
      message: "PERFORM segment missing forbidden/professional risk acknowledgment",
    },
  ];
}

/** Last-resort patch when the model omits stakes language after salvage — keeps generation from hard-failing. */
export function repairSituationStakesText(text: string, pairing?: string): string {
  if (SITUATION_RISK.test(text)) return text;
  const { partnSub } = pairingRepairContext(pairing);
  const trimmed = text.trimEnd();
  const bridge = trimmed.endsWith('"') || trimmed.endsWith(".") ? "" : ".";
  return `${trimmed}${bridge}\n\n"We shouldn't—" ${partnSub} said, voice low with the risk of it, the forbidden part of the situation still between them like a door someone could open.`;
}

/** Append partner praise in dialogue when the model skipped the praise chip. */
export function repairPraiseInDialogue(text: string, pairing?: string): string {
  const quotes = [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "");
  if (quotes.some((q) => PRAISE_IN_DIALOGUE.test(q))) return text;
  const { partnSub, praisePhrase } = pairingRepairContext(pairing);
  const trimmed = text.trimEnd();
  const bridge = trimmed.endsWith('"') || trimmed.endsWith(".") ? "" : ".";
  return `${trimmed}${bridge}\n\n"${praisePhrase}," ${partnSub.toLowerCase()} murmured against your skin. "Perfect — you're doing so well."`;
}

/** Rewrite sight-directing language while blindfold is on — touch/sound only. */
export function repairBlindfoldSightText(text: string): string {
  const fixLine = (line: string) =>
    line
      .replace(/\blook at\b/gi, "feel")
      .replace(/\bwatch(?:\s+me)?\b/gi, "listen to me")
      .replace(/\bsee (?:this|how|what)\b/gi, "sense ")
      .replace(/\bgaze at\b/gi, "turn toward")
      .replace(/\bstare at\b/gi, "face");

  let out = text.replace(/"([^"]+)"/g, (full, inner: string) => {
    if (!LISTENER_SIGHT_PATTERN.test(inner) || BLINDFOLD_CONTEXT_OK.test(inner)) return full;
    return `"${fixLine(inner)}"`;
  });

  for (const sentence of out.split(/(?<=[.!?])\s+/)) {
    if (/"[^"]+"/.test(sentence)) continue;
    if (
      /\byou\b/i.test(sentence) &&
      LISTENER_SIGHT_PATTERN.test(sentence) &&
      !BLINDFOLD_CONTEXT_OK.test(sentence)
    ) {
      out = out.replace(sentence, fixLine(sentence));
    }
  }
  return out;
}

/** Soften free-movement lines while restraint should still be active. */
export function repairRestraintBindingText(text: string): string {
  return text
    .replace(/\byou stand up\b/gi, "you strain to rise")
    .replace(/\byou walk away\b/gi, "you pull against the binding")
    .replace(/\byou reach for\b/gi, "you try to reach for")
    .replace(/\byou push (?:him|her|them) away\b/gi, "you twist against the hold")
    .replace(/\byou break free\b/gi, "you test the restraint");
}

export type ConstraintRepairResult = {
  text: string;
  applied: ConstraintId[];
};

/** Apply deterministic text patches for each reported violation type. */
export function applyDeterministicConstraintRepairs(
  text: string,
  violations: ConstraintViolation[],
  pairing?: string,
): ConstraintRepairResult {
  const ids = new Set(violations.map((v) => v.constraintId));
  let out = text;
  const applied: ConstraintId[] = [];

  const patch = (id: ConstraintId, next: string) => {
    if (next !== out) {
      out = next;
      applied.push(id);
    }
  };

  if (ids.has("situation_stakes_present")) patch("situation_stakes_present", repairSituationStakesText(out, pairing));
  if (ids.has("praise_in_partner_dialogue")) patch("praise_in_partner_dialogue", repairPraiseInDialogue(out, pairing));
  if (ids.has("no_listener_sight_while_blindfolded")) {
    patch("no_listener_sight_while_blindfolded", repairBlindfoldSightText(out));
  }
  if (ids.has("restraint_remains_binding")) {
    patch("restraint_remains_binding", repairRestraintBindingText(out));
  }

  return { text: out, applied };
}

export function describeConstraintViolations(violations: ConstraintViolation[]): string {
  return violations.map((v) => `${v.constraintId}: ${v.message}`).join("; ");
}

/** Validate one beat's prose against active constraints. */
export function validateBeatConstraints(
  text: string,
  ledgerBefore: SceneContinuityLedger,
  ledgerAfter: SceneContinuityLedger,
  phase: string,
  specs: EnactmentSpec[],
  opts?: { situationStakes?: string; skipSituationStakes?: boolean },
): ConstraintViolation[] {
  const active = resolveActiveConstraints(ledgerAfter, specs, phase, {
    situationStakes: opts?.skipSituationStakes ? undefined : opts?.situationStakes,
  });
  if (!active.length) return [];

  const violations: ConstraintViolation[] = [];

  for (const constraint of active) {
    switch (constraint.id) {
      case "no_listener_sight_while_blindfolded": {
        const scope = textUnderBlindfoldConstraint(text, ledgerBefore, ledgerAfter);
        violations.push(...checkNoListenerSight(scope));
        break;
      }
      case "restraint_remains_binding":
        violations.push(...checkRestraintBinding(text));
        break;
      case "praise_in_partner_dialogue":
        violations.push(...checkPraiseInDialogue(text));
        break;
      case "situation_stakes_present":
        violations.push(...checkSituationStakes(text));
        break;
      default:
        break;
    }
  }

  return violations;
}

/** Walk full story for QC — reconstructs ledger from scene text. */
export function validateStoryEnactmentConstraints(
  scenes: Array<{ heading?: string; text: string }>,
  scenePlan: Array<{ phase?: string }>,
  spine: FantasySpine,
): ConstraintViolation[] {
  const specs = compileEnactmentSpecs(spine);
  let ledger = buildInitialLedger({ activeTags: spine.customer_desire_tags });
  const violations: ConstraintViolation[] = [];
  const performIndices: number[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const phase = scenePlan[i]?.phase ?? "";
    if (phase.toUpperCase() === "PERFORM") performIndices.push(i);
  }

  for (let i = 0; i < scenes.length; i++) {
    const phase = scenePlan[i]?.phase ?? "";
    const text = scenes[i]?.text ?? "";
    const before = ledger;
    const inferred = inferContinuityFromText(text, before);
    const after = mergeContinuityUpdate(ledger, inferred);
    const isLastPerform = i === performIndices[performIndices.length - 1];

    violations.push(
      ...validateBeatConstraints(text, before, after, phase, specs, {
        situationStakes: spine.situation_stakes,
        skipSituationStakes: phase.toUpperCase() === "PERFORM" && !isLastPerform,
      }),
    );

    ledger = after;
  }

  return violations;
}

function inferContinuityFromText(
  text: string,
  ledger: SceneContinuityLedger,
): ContinuityUpdate {
  const t = text.toLowerCase();
  const update: ContinuityUpdate = {};
  if (/\b(blindfolds?|blind-fold|over your eyes|eyes covered|fabric over)\b/.test(t)) {
    update.blindfold = "on";
  }
  if (/\b(blindfold (?:comes )?off|removed the blindfold|eyes uncovered)\b/.test(t)) {
    update.blindfold = "removed";
  }
  if (/\b(tied|bound|rope|restraint|cuffs|wrists.*(?:held|pinned|fixed))\b/.test(t)) {
    update.restraint = "on";
  }
  if (/\b(untied|unbound|released (?:your|her|his) wrists)\b/.test(t)) {
    update.restraint = "released";
  }
  if (ledger.blindfold === "on" && !update.blindfold) {
    update.blindfold = "on";
  }
  if (ledger.restraint === "on" && !update.restraint) {
    update.restraint = "on";
  }
  return update;
}
