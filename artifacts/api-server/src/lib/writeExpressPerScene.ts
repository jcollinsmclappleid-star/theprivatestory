/**
 * Express 4-beat write path — FRAME → DECLARE → PERFORM → LAND.
 * One Mistral call per beat; continuity ledger + word budget per beat.
 */

import { openrouter, MISTRAL_MODEL } from "./openrouter.js";
import { buildIntensityLayerForPairing } from "./buildPrompt.js";
import { VOCAL_PERFORMANCE_PROMPT_BLOCK } from "./audioVocal/index.js";
import { buildCustomerDesireWriteBlock, buildConversationBlockContract, buildScenarioFrameInstruction } from "./customerDesireBeats.js";
import type { ExpressStoryBrief } from "./expressBrief.js";
import type { ExpressScenePlanRow } from "./expressScenePlan.js";
import {
  buildDialogueRetryNote,
  countQuotedWords,
  countQuoteLines,
  DIALOGUE_FORWARD_PROMPT_BLOCK,
  PHASE_QUOTE_LINE_MIN,
  PHASE_QUOTED_RATIO_MIN,
  PHASE_QUOTED_WORD_MIN,
  validateDialogueDensity,
} from "./dialogueRatio.js";
import { SPEAKER_ATTRIBUTION_WRITE_CONTRACT } from "./speakerAttribution.js";
import {
  EXPRESS_AUDIO_SCRIPT_CONTRACT,
  mergeWriterScripts,
  parseWriterScriptField,
  validateWriterScript,
  writerScriptToDisplayProse,
  writerScriptToTaggedRawText,
  type WriterScriptLine,
} from "./expressAudioScript.js";
import {
  buildInitialLedger,
  ledgerPromptBlock,
  mergeContinuityUpdate,
  parseContinuityFromSceneJson,
  type SceneContinuityLedger,
} from "./sceneContinuity.js";
import { beatWordMax, beatWordMin, countWords, minWordsForStoryLength, phaseLengthScale } from "./storyLength.js";
import { logger } from "./logger.js";
import { recordExpressWriteTiming, resetExpressWriteTimings, summarizeExpressWriteTimings, timeExpressWrite } from "./expressWriteTiming.js";
import {
  assertExpressLlmBudget,
  canMakeExpressLlmCall,
  expressLlmCallsUsed,
  recordExpressLlmCall,
  resetExpressLlmBudget,
} from "./expressLlmBudget.js";
import {
  applyDeterministicConstraintRepairs,
  buildConstraintRetryNote,
  describeConstraintViolations,
  compileEnactmentSpecs,
  constraintsPromptBlock,
  resolveActiveConstraints,
  validateBeatConstraints,
  type ConstraintViolation,
  type EnactmentSpec,
} from "./enactmentConstraints.js";
import {
  autoPickPartnerName,
  pairingGuideLine,
  performPartGoalSuffix,
  performSexActsLine,
  protPronounsFromPairing,
} from "./pairingWrite.js";

const BANNED_REPEAT_PHRASES = [
  "neither of you moves to close the distance",
  "the space between what's allowed",
  "the wanting is the thing",
  "they both know that isn't an ending",
  "you came anyway",
];

export type ExpressWriteContext = {
  whoIsHe?: string;
  setting?: string;
  dynamic?: string;
  mood?: string;
  chemistry?: string;
  storyMode?: string;
  scenarioTags?: string[];
  situationId?: string;
  ending?: string;
  atmosphere?: string;
  partnerAppearance?: string;
};

export type PerSceneWriteInput = {
  brief: ExpressStoryBrief;
  listenerName: string;
  intensity: string;
  partnerName?: string;
  pairing?: string;
  storyLength?: string;
  context?: ExpressWriteContext;
  /** Called when a beat begins — keeps progress moving during long LLM calls. */
  onBeatStart?: (beat: string) => void;
  /** Called after each beat (and PERFORM part A/B) completes — for job progress UI. */
  onBeatComplete?: (beat: string, part?: "A" | "B") => void;
  /** Max QC revision passes per non-PERFORM beat (default 2). Express uses 1. */
  maxSceneAttempts?: number;
  /** Max QC revision passes per PERFORM part (default 2). Express uses 1. */
  maxPerformPartAttempts?: number;
};

type SceneDraft = {
  id: number;
  heading: string;
  text: string;
  /** Tagged [N]/[A]/[B] text for multi-voice TTS — from write-time script. */
  rawText?: string;
  duration_estimate: number;
  emotional_shift: string;
};

function intensityLevel(label: string): number {
  const m: Record<string, number> = {
    Subtle: 1, Warm: 3, Elevated: 4, Explicit: 5, Intense: 5,
  };
  return m[label] ?? 4;
}

function coerceSceneText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map((v) => String(v)).join("\n\n").trim();
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.prose === "string") return o.prose.trim();
    if (typeof o.content === "string") return o.content.trim();
  }
  return value == null ? "" : String(value).trim();
}

function parseSceneJson(
  raw: string,
  phase?: string,
): {
  heading?: string;
  text: string;
  script?: WriterScriptLine[];
  emotional_shift?: string;
  continuity?: ReturnType<typeof parseContinuityFromSceneJson>;
} {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  const script = parseWriterScriptField(parsed.script);
  const textFromField = coerceSceneText(parsed.text);
  const scriptProse = script ? writerScriptToDisplayProse(script) : "";
  const text =
    textFromField && countWords(textFromField) >= countWords(scriptProse)
      ? textFromField
      : scriptProse || textFromField;
  if (script) {
    const v = validateWriterScript(script, { phase, requireBothSpeakers: phase !== "LAND" });
    if (!v.ok) {
      throw new Error(`Invalid audio script for ${phase ?? "beat"}: ${v.issues.join("; ")}`);
    }
  }
  return {
    heading: typeof parsed.heading === "string" ? parsed.heading : undefined,
    text,
    script: script ?? undefined,
    emotional_shift: typeof parsed.emotional_shift === "string" ? parsed.emotional_shift : undefined,
    continuity: parseContinuityFromSceneJson(parsed),
  };
}

function performPartDialogueOk(text: string, storyLength?: string): boolean {
  const ql = countQuoteLines(text);
  const qw = countQuotedWords(text);
  const scale = phaseLengthScale(storyLength);
  const minLines = Math.max(5, Math.round(7 * scale));
  const minQuoted = Math.max(35, Math.round(85 * scale));
  return ql >= minLines && qw >= minQuoted;
}

function performCombinedDialogueOk(text: string, storyLength?: string): boolean {
  const ql = countQuoteLines(text);
  const qw = countQuotedWords(text);
  const scale = phaseLengthScale(storyLength);
  const minLines = Math.max(12, Math.round(14 * scale));
  const minQuoted = Math.max(150, Math.round(200 * scale));
  return ql >= minLines && qw >= minQuoted;
}

function frameDialogueOk(text: string): boolean {
  return countQuoteLines(text) >= 3 && countWords(text) >= 80;
}

/** LAND is afterglow — if the story already carries dialogue weight, allow a lighter closing beat. */
function landDialogueOk(
  text: string,
  priorSceneTexts: string[],
  storyLength?: string,
): boolean {
  const solo = validateDialogueDensity({ scenes: [{ text }] }, [{ phase: "LAND" }], storyLength);
  if (solo.weakScenes.length === 0) return true;
  const allTexts = [...priorSceneTexts, text];
  const story = validateDialogueDensity(
    { scenes: allTexts.map((t) => ({ text: t })) },
    allTexts.map((_, i) => ({ phase: i < allTexts.length - 1 ? "PERFORM" : "LAND" })),
    storyLength,
  );
  if (story.storyQuotedRatio >= 0.3 && countQuoteLines(text) >= 3) return true;
  return false;
}

function sceneDialogueOk(
  text: string,
  phase: string,
  storyLength?: string,
  priorSceneTexts?: string[],
): boolean {
  if (phase === "FRAME") return frameDialogueOk(text);
  if (phase === "LAND" && priorSceneTexts) return landDialogueOk(text, priorSceneTexts, storyLength);
  const v = validateDialogueDensity({ scenes: [{ text }] }, [{ phase }], storyLength);
  return v.weakScenes.length === 0;
}

function sceneWordsUnderMin(text: string, phase: string, storyLength?: string, plan?: ExpressScenePlanRow): boolean {
  const min = plan?.word_budget_min ?? beatWordMin(phase, storyLength);
  return countWords(text) >= min;
}

function sceneWordsOverMax(text: string, phase: string, storyLength?: string, plan?: ExpressScenePlanRow): boolean {
  const max = plan?.word_budget_max ?? beatWordMax(phase, storyLength);
  return countWords(text) > max;
}

function buildBeatScreenplayContract(
  phase: string,
  level: number,
  storyLength?: string,
  plan?: ExpressScenePlanRow,
  pairing?: string,
): string {
  const minLines = PHASE_QUOTE_LINE_MIN[phase] ?? 5;
  const minQuoted = PHASE_QUOTED_WORD_MIN[phase] ?? 60;
  const minRatio = Math.round((PHASE_QUOTED_RATIO_MIN[phase] ?? 0.24) * 100);
  const minWords = plan?.word_budget_min ?? beatWordMin(phase, storyLength);
  const maxWords = plan?.word_budget_max ?? beatWordMax(phase, storyLength);
  const target = plan?.word_budget_target ?? Math.round((minWords + maxWords) / 2);
  const chipCount = plan?.customer_desire_beats?.length ?? 0;
  const conversationBlocks = buildConversationBlockContract(phase, chipCount);

  const base = `
SCREENPLAY-FIRST — performed in multi-voice audio (narrator + partner):
- Dedicated conversation blocks: uninterrupted quoted lines (6–10 per block); narrator MAX 1–2 sentences BETWEEN blocks only — never between every line.
- Target ${target} words (${minWords}–${maxWords} hard band). Do NOT exceed ${maxWords}.
- Partner speaks in full sentences (6–20 words per line).`;

  if (phase === "FRAME") {
    return `${base}
${conversationBlocks}
- FRAME: situation stakes + scenario frame in DIALOGUE. Setting grounded in speech and brief narrator bridges.
- Foreshadow chip themes in subtext; do NOT name customer sex-chip labels. No sex acts. ${minLines}+ quoted lines; ${minRatio}%+ dialogue.
- Open with a conversation block within first 120 words.`;
  }
  if (phase === "DECLARE") {
    return `${base}
${conversationBlocks}
- DECLARE: negotiate Make it yours fantasies — partner TESTS desires in speech; listener confesses. No verbatim chip echo.
- No sex acts, no blindfold on body yet. ${minLines}+ quoted lines; ${minQuoted}+ quoted words; ${minRatio}%+ dialogue.`;
  }
  if (phase === "PERFORM") {
    return `${base}
${conversationBlocks}
- PERFORM: ONE continuous scene — opens with first physical cross, then enacts every chip as OFFER→ACT→REACT→DEEPEN.
- SAY ≠ ENACT: chip labels were negotiated in DECLARE; PERFORM shows partner doing (commands, position, pace).
- Sensation in dirty talk, not narrator body prose. Blindfold: applied in dialogue; stays through climax.
- Praise: partner praises DURING the act in quoted lines.
- ${minLines}+ quoted lines; ${minQuoted}+ quoted words; ${minRatio}%+ dialogue.
- One line acknowledging situation/forbidden risk during sex.
${performSexActsLine(pairing, level)}`;
  }
  if (phase === "LAND") {
    return `${base}
${conversationBlocks}
- LAND: aftermath only — MUST match continuity ledger (position, acts, blindfold state). No new sex.
- Reference what physically happened in PERFORM. ${minLines}+ quoted lines; emotional landing.`;
  }
  return base;
}

function buildInputAnchors(ctx: ExpressWriteContext | undefined, brief: ExpressStoryBrief, pairing?: string): string {
  const lines: string[] = [];
  const prot = protPronounsFromPairing(pairing);
  lines.push(`REQUIRED — PAIRING: ${pairingGuideLine(pairing)}`);
  if (ctx?.whoIsHe) lines.push(`REQUIRED — Partner archetype: ${ctx.whoIsHe}`);
  if (ctx?.setting || brief.fantasy_spine?.scenario_frame) {
    lines.push(`REQUIRED — Setting: ${ctx?.setting ?? "from scenario"}`);
  }
  if (ctx?.dynamic) lines.push(`REQUIRED — Power dynamic: ${ctx.dynamic}`);
  if (ctx?.chemistry) lines.push(`REQUIRED — Chemistry: ${ctx.chemistry}`);
  if (ctx?.mood) lines.push(`REQUIRED — Mood: ${ctx.mood}`);
  if (ctx?.storyMode) lines.push(`REQUIRED — Story mode: ${ctx.storyMode}`);
  if (ctx?.atmosphere) lines.push(`REQUIRED — Atmosphere: ${ctx.atmosphere}`);
  if (ctx?.ending) lines.push(`REQUIRED — Ending type: ${ctx.ending}`);
  if (brief.fantasy_spine?.scenario_tags?.length) {
    lines.push(buildScenarioFrameInstruction(brief.fantasy_spine.scenario_tags, prot));
  }
  if (brief.situation) lines.push(`REQUIRED — Situation (Act IV): ${brief.situation}`);
  return lines.filter(Boolean).join("\n");
}

function buildSceneUserPrompt(
  plan: ExpressScenePlanRow,
  ctx: {
    titleDirection: string;
    priorSummary: string;
    bannedPhrases: string[];
    fantasyBlock: string;
    inputAnchors: string;
    partnerName: string;
    listenerName: string;
    level: number;
    storyLength?: string;
    ledger: SceneContinuityLedger;
    usedHeadings: string[];
    enactmentSpecs: EnactmentSpec[];
    situationStakes?: string;
    skipSituationStakes?: boolean;
    pairing?: string;
  },
): string {
  const phase = plan.phase.toUpperCase();
  const constraintBlock = constraintsPromptBlock(
    resolveActiveConstraints(ctx.ledger, ctx.enactmentSpecs, phase, {
      situationStakes: ctx.skipSituationStakes ? undefined : ctx.situationStakes,
    }),
  );
  return `Write ONE beat for a custom erotic audio story (4-beat arc: FRAME → DECLARE → PERFORM → LAND).

Story title direction: ${ctx.titleDirection}
Listener: ${ctx.listenerName} | Partner: ${ctx.partnerName}

CUSTOMER INPUT ANCHORS (non-negotiable):
${ctx.inputAnchors || "(see fantasy contract)"}

${ledgerPromptBlock(ctx.ledger)}

${constraintBlock ? `${constraintBlock}\n` : ""}

PREVIOUS BEATS (do not repeat dialogue beats or headings):
${ctx.priorSummary || "(opening beat — FRAME)"}

USED HEADINGS (must not reuse): ${ctx.usedHeadings.join(", ") || "(none)"}

THIS BEAT CONTRACT:
${JSON.stringify({
  phase: plan.phase,
  goal: plan.goal,
  emotional_shift: plan.emotional_shift,
  customer_desire_beats: plan.customer_desire_beats ?? [],
  situation_beats: plan.situation_beats ?? [],
  fantasy_enactment_spine: plan.fantasy_enactment_spine,
  word_budget: {
    target: plan.word_budget_target,
    min: plan.word_budget_min,
    max: plan.word_budget_max,
  },
  dirty_talk_register: plan.dirty_talk_register,
  verbal_desire_declaration: plan.verbal_desire_declaration,
  position_changes: plan.position_changes,
}, null, 2)}

${buildBeatScreenplayContract(phase, ctx.level, ctx.storyLength, plan, ctx.pairing)}

${ctx.fantasyBlock ? `FANTASY CONTRACT:\n${ctx.fantasyBlock}\n` : ""}

BANNED phrases (already used or template filler):
${[...BANNED_REPEAT_PHRASES, ...ctx.bannedPhrases].map((p) => `  - "${p}"`).join("\n")}

Return ONLY JSON:
{
  "heading": "unique evocative beat title",
  "script": [
    { "role": "narrator", "text": "scene prose without spoken character lines" },
    { "role": "love_interest", "text": "\\"Partner dialogue in quotes.\\"" },
    { "role": "protagonist", "text": "\\"Listener dialogue in quotes.\\"" }
  ],
  "text": "optional — same beat as flat prose if easier",
  "emotional_shift": "one line",
  "continuity": {
    "location": "where bodies are",
    "clothing": "what they're wearing / state of undress",
    "blindfold": "off|on|removed",
    "restraint": "off|on|released",
    "lastPosition": "physical configuration",
    "actsCompleted": ["kiss", "oral", "penetration"]
  }
}

${EXPRESS_AUDIO_SCRIPT_CONTRACT}`;
}

function trimProseToWordMax(text: string, maxWords: number): string {
  if (countWords(text) <= maxWords) return text;
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const keep = [...paragraphs];
  while (keep.length > 1 && countWords(keep.join("\n\n")) > maxWords) {
    let removed = false;
    for (let i = keep.length - 1; i >= 0; i--) {
      const p = keep[i]!;
      const tw = countWords(p);
      const qw = countQuotedWords(p);
      if (tw > 0 && qw / tw < 0.55) {
        keep.splice(i, 1);
        removed = true;
        break;
      }
    }
    if (!removed) keep.pop();
  }
  let trimmed = keep.join("\n\n");
  if (countWords(trimmed) > maxWords) {
    const sentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [trimmed];
    const kept: string[] = [];
    for (const s of sentences) {
      if (countWords([...kept, s].join(" ")) > maxWords) break;
      kept.push(s);
    }
    trimmed = kept.join(" ").trim() || trimmed.slice(0, maxWords * 5);
  }
  return trimmed;
}

/** Trim prose when salvage/repair pushed a beat over its soft ceiling — prefer shipping over hard-fail. */
function trimBeatToCeiling(text: string, wordMax: number, ceilingRatio = 1.15): string {
  const softCeiling = Math.ceil(wordMax * ceilingRatio);
  const words = countWords(text);
  if (words <= softCeiling) return text;
  logger.warn(
    { words, softCeiling, wordMax },
    "[writeExpress] Trimming beat over ceiling after recovery",
  );
  return trimProseToWordMax(text, wordMax);
}

export { resetExpressWriteTimings, summarizeExpressWriteTimings };

const MAX_CONSTRAINT_SALVAGE_WRITES = 1;
const MAX_SCENE_ATTEMPTS = 2;
const MAX_PERFORM_PART_ATTEMPTS = 2;
const WORD_FLOOR_SLACK = 0.9;

type SceneWriteDraft = {
  heading: string;
  text: string;
  emotional_shift: string;
  continuity?: ReturnType<typeof parseContinuityFromSceneJson>;
  script?: WriterScriptLine[];
  rawText?: string;
};

type EnactmentValidateOpts = {
  situationStakes?: string;
  skipSituationStakes?: boolean;
};

function validateSceneConstraints(
  text: string,
  ledgerBefore: SceneContinuityLedger,
  ledgerAfter: SceneContinuityLedger,
  phase: string,
  specs: EnactmentSpec[],
  opts?: EnactmentValidateOpts,
): ConstraintViolation[] {
  return validateBeatConstraints(text, ledgerBefore, ledgerAfter, phase, specs, opts);
}

/** Identify QC failures, patch what we can deterministically, then targeted LLM salvage. */
async function recoverSceneConstraints(
  draft: SceneWriteDraft,
  opts: {
    plan: ExpressScenePlanRow;
    systemPrompt: string;
    userPrompt: string;
    tokenCap?: number;
    ledgerBefore: SceneContinuityLedger;
    specs: EnactmentSpec[];
    phase: string;
    validateOpts?: EnactmentValidateOpts;
    timingPrefix: string;
    wordMax?: number;
    ceilingRatio?: number;
    pairing?: string;
    /** When true, ship best-effort after deterministic repairs instead of throwing. */
    relaxFinalQc?: boolean;
  },
): Promise<SceneWriteDraft> {
  let current = draft;
  let ledgerAfter = mergeContinuityUpdate(opts.ledgerBefore, current.continuity);
  let violations = validateSceneConstraints(
    current.text,
    opts.ledgerBefore,
    ledgerAfter,
    opts.phase,
    opts.specs,
    opts.validateOpts,
  );

  const tryDeterministic = () => {
    if (!violations.length) return;
    const repaired = applyDeterministicConstraintRepairs(current.text, violations, opts.pairing);
    if (repaired.text === current.text) return;
    current = { ...current, text: repaired.text };
    if (opts.wordMax) {
      current = {
        ...current,
        text: trimBeatToCeiling(current.text, opts.wordMax, opts.ceilingRatio),
      };
    }
    logger.info(
      { repairs: repaired.applied, timingPrefix: opts.timingPrefix },
      "[writeExpress] Applied deterministic constraint repairs",
    );
    ledgerAfter = mergeContinuityUpdate(opts.ledgerBefore, current.continuity);
    violations = validateSceneConstraints(
      current.text,
      opts.ledgerBefore,
      ledgerAfter,
      opts.phase,
      opts.specs,
      opts.validateOpts,
    );
  };

  tryDeterministic();

  for (let salvage = 0; salvage < MAX_CONSTRAINT_SALVAGE_WRITES && violations.length; salvage++) {
    if (!canMakeExpressLlmCall()) break;
    const ids = violations.map((v) => v.constraintId).join(", ");
    logger.warn(
      { violationIds: ids, salvage: salvage + 1, timingPrefix: opts.timingPrefix },
      "[writeExpress] Constraint QC failed — targeted salvage rewrite",
    );
    current = await writeOneScene(
      opts.plan,
      opts.systemPrompt,
      opts.userPrompt,
      `${buildConstraintRetryNote(violations)}\n\nCONSTRAINT SALVAGE ${salvage + 1}/${MAX_CONSTRAINT_SALVAGE_WRITES} — fix ONLY these violation types: ${ids}. Rewrite offending sentences; keep word band and plot.`,
      opts.tokenCap,
      `${opts.timingPrefix}:salvage${salvage}`,
    );
    ledgerAfter = mergeContinuityUpdate(opts.ledgerBefore, current.continuity);
    violations = validateSceneConstraints(
      current.text,
      opts.ledgerBefore,
      ledgerAfter,
      opts.phase,
      opts.specs,
      opts.validateOpts,
    );
    tryDeterministic();
    if (opts.wordMax) {
      current = {
        ...current,
        text: trimBeatToCeiling(current.text, opts.wordMax, opts.ceilingRatio),
      };
    }
  }

  if (violations.length) {
    logger.error(
      { violations: describeConstraintViolations(violations), timingPrefix: opts.timingPrefix },
      "[writeExpress] Constraint recovery exhausted — applying final deterministic pass",
    );
    const finalRepair = applyDeterministicConstraintRepairs(current.text, violations, opts.pairing);
    current = { ...current, text: finalRepair.text };
    violations = validateSceneConstraints(
      current.text,
      opts.ledgerBefore,
      mergeContinuityUpdate(opts.ledgerBefore, current.continuity),
      opts.phase,
      opts.specs,
      opts.validateOpts,
    );
  }

  if (opts.wordMax) {
    current = {
      ...current,
      text: trimBeatToCeiling(current.text, opts.wordMax, opts.ceilingRatio),
    };
    violations = validateSceneConstraints(
      current.text,
      opts.ledgerBefore,
      mergeContinuityUpdate(opts.ledgerBefore, current.continuity),
      opts.phase,
      opts.specs,
      opts.validateOpts,
    );
    if (violations.length) tryDeterministic();
  }

  if (violations.length) {
    if (opts.relaxFinalQc) {
      logger.warn(
        { violations: describeConstraintViolations(violations), timingPrefix: opts.timingPrefix },
        "[writeExpress] Constraint QC soft-fail — shipping best-effort after deterministic repair",
      );
      return current;
    }
    throw new Error(
      `${opts.phase} enactment constraints failed after recovery: ${describeConstraintViolations(violations)}`,
    );
  }

  return current;
}

async function recoverPerformDialogue(
  draft: SceneWriteDraft,
  plan: ExpressScenePlanRow,
  systemPrompt: string,
  userPrompt: string,
  storyLength: string | undefined,
  tokenCap: number | undefined,
  timingLabel: string,
  combined = false,
): Promise<SceneWriteDraft> {
  const dlg = combined
    ? performCombinedDialogueOk(draft.text, storyLength)
    : performPartDialogueOk(draft.text, storyLength);
  if (dlg) return draft;
  if (!canMakeExpressLlmCall()) return draft;

  const density = validateDialogueDensity(
    { scenes: [{ text: draft.text }] },
    [{ phase: "PERFORM" }],
    storyLength,
  );
  logger.warn({ timingLabel }, "[writeExpress] PERFORM below dialogue floor — dialogue salvage rewrite");
  return writeOneScene(
    plan,
    systemPrompt,
    userPrompt,
    `${DIALOGUE_FORWARD_PROMPT_BLOCK}\n\n${buildDialogueRetryNote(density)}\n\nDIALOGUE SALVAGE — add multi-turn quoted partner/listener lines during physical escalation. Do not shorten plot.`,
    tokenCap,
    `${timingLabel}:dialogue-salvage`,
  );
}

async function writePerformSingle(
  plan: ExpressScenePlanRow,
  systemPrompt: string,
  baseUserPrompt: string,
  storyLength: string | undefined,
  ledger: SceneContinuityLedger,
  enactmentCtx: { specs: EnactmentSpec[]; situationStakes?: string; pairing?: string; performPartAttempts?: number },
): Promise<{ heading: string; text: string; emotional_shift: string; continuity?: ReturnType<typeof parseContinuityFromSceneJson> }> {
  const maxAttempts = enactmentCtx.performPartAttempts ?? MAX_PERFORM_PART_ATTEMPTS;
  const min = plan.word_budget_min ?? beatWordMin("PERFORM", storyLength);
  const max = plan.word_budget_max ?? beatWordMax("PERFORM", storyLength);
  const tokenCap = 3200;
  const constraintBlock = constraintsPromptBlock(
    resolveActiveConstraints(ledger, enactmentCtx.specs, "PERFORM", {
      situationStakes: enactmentCtx.situationStakes,
    }),
  );
  const prompt = constraintBlock ? `${baseUserPrompt}\n\n${constraintBlock}` : baseUserPrompt;

  let draft = await writeOneScene(plan, systemPrompt, prompt, undefined, tokenCap, "PERFORM:single:0");
  for (let attempt = 1; attempt < maxAttempts; attempt++) {
    const w = countWords(draft.text);
    const ledgerAfter = mergeContinuityUpdate(ledger, draft.continuity);
    const violations = validateBeatConstraints(
      draft.text,
      ledger,
      ledgerAfter,
      "PERFORM",
      enactmentCtx.specs,
      { situationStakes: enactmentCtx.situationStakes },
    );
    const under = w < min;
    const over = w > max * 1.15;
    const dlgOk = performCombinedDialogueOk(draft.text, storyLength);
    if (!under && !over && dlgOk && violations.length === 0) break;
    if (!canMakeExpressLlmCall()) break;

    const noteParts = [
      under || over ? buildSceneRetryNote("PERFORM", draft.text, storyLength, plan) : "",
      !dlgOk
        ? `${DIALOGUE_FORWARD_PROMPT_BLOCK}\n${buildDialogueRetryNote(
            validateDialogueDensity({ scenes: [{ text: draft.text }] }, [{ phase: "PERFORM" }], storyLength),
          )}`
        : "",
      violations.length ? buildConstraintRetryNote(violations) : "",
      `PERFORM single revision ${attempt + 1}/${maxAttempts} — one continuous scene ${min}–${max} words.`,
    ];
    const note = noteParts.filter(Boolean).join("\n\n");
    draft = await writeOneScene(plan, systemPrompt, prompt, note, tokenCap, `PERFORM:single:${attempt}`);
  }

  let w = countWords(draft.text);
  if (w > max * 1.15) {
    draft = { ...draft, text: trimProseToWordMax(draft.text, max) };
    w = countWords(draft.text);
  }
  if (w < min) throw new Error(`PERFORM single below floor (${w} < ${min})`);
  if (w > max * 1.15) throw new Error(`PERFORM single above ceiling (${w} > ${max})`);

  draft = await recoverPerformDialogue(
    draft,
    plan,
    systemPrompt,
    prompt,
    storyLength,
    tokenCap,
    "PERFORM:single",
  );
  if (!performCombinedDialogueOk(draft.text, storyLength)) {
    logger.warn("[writeExpress] PERFORM single below dialogue floor after salvage — shipping best-effort");
  }

  draft = await recoverSceneConstraints(draft, {
    plan,
    systemPrompt,
    userPrompt: prompt,
    tokenCap,
    ledgerBefore: ledger,
    specs: enactmentCtx.specs,
    phase: "PERFORM",
    validateOpts: { situationStakes: enactmentCtx.situationStakes },
    timingPrefix: "PERFORM:single",
    wordMax: max,
    ceilingRatio: 1.15,
    pairing: enactmentCtx.pairing,
    relaxFinalQc: true,
  });

  const finalLedger = mergeContinuityUpdate(ledger, draft.continuity);
  return attachAudioScript({
    heading: draft.heading,
    text: draft.text,
    script: draft.script,
    emotional_shift: draft.emotional_shift,
    continuity: {
      location: finalLedger.location,
      clothing: finalLedger.clothing,
      blindfold: finalLedger.blindfold,
      restraint: finalLedger.restraint,
      lastPosition: finalLedger.lastPosition,
      actsCompleted: finalLedger.actsCompleted,
    },
  });
}

async function writePerformBeat(
  plan: ExpressScenePlanRow,
  systemPrompt: string,
  baseUserPrompt: string,
  storyLength: string | undefined,
  ledger: SceneContinuityLedger,
  enactmentCtx: { specs: EnactmentSpec[]; situationStakes?: string; pairing?: string; performPartAttempts?: number },
  onPartComplete?: (part: "A" | "B") => void,
): Promise<{ heading: string; text: string; emotional_shift: string; continuity?: ReturnType<typeof parseContinuityFromSceneJson> }> {
  if (minWordsForStoryLength(storyLength) >= 1440) {
    return timeExpressWrite("PERFORM", () =>
      writePerformSingle(plan, systemPrompt, baseUserPrompt, storyLength, ledger, enactmentCtx),
      "single-call",
    );
  }
  return writePerformBeatSplit(
    plan,
    systemPrompt,
    baseUserPrompt,
    storyLength,
    ledger,
    enactmentCtx,
    onPartComplete,
  );
}

async function writePerformBeatSplit(
  plan: ExpressScenePlanRow,
  systemPrompt: string,
  baseUserPrompt: string,
  storyLength: string | undefined,
  ledger: SceneContinuityLedger,
  enactmentCtx: { specs: EnactmentSpec[]; situationStakes?: string; pairing?: string; performPartAttempts?: number },
  onPartComplete?: (part: "A" | "B") => void,
): Promise<{ heading: string; text: string; emotional_shift: string; continuity?: ReturnType<typeof parseContinuityFromSceneJson> }> {
  const maxAttempts = enactmentCtx.performPartAttempts ?? MAX_PERFORM_PART_ATTEMPTS;
  const min = plan.word_budget_min ?? beatWordMin("PERFORM", storyLength);
  const max = plan.word_budget_max ?? beatWordMax("PERFORM", storyLength);
  const halfMin = Math.max(120, Math.floor(min / 2));
  const halfMax = Math.floor(max / 2);

  const partPlan = (part: "A" | "B"): ExpressScenePlanRow => ({
    ...plan,
    word_budget_min: halfMin,
    word_budget_max: halfMax,
    word_budget_target: Math.round((halfMin + halfMax) / 2),
    goal: `${plan.goal} — ${performPartGoalSuffix(enactmentCtx.pairing, part)}`,
  });

  let partLedger = ledger;
  const parts: string[] = [];
  const partScripts: WriterScriptLine[][] = [];
  let heading = plan.phase;
  let emotional = plan.emotional_shift;
  const partTokenCap = () => 2200;

  let partBPromptForExpand = "";

  for (const [idx, part] of (["A", "B"] as const).entries()) {
    const pPlan = partPlan(part);
    const userPrompt =
      idx === 0
        ? baseUserPrompt
        : `${baseUserPrompt}\n\nPERFORM PART B — continue directly from Part A prose (no recap, no restart at desk):\n${parts[0]!.slice(-500)}`;

    const tokenCap = partTokenCap();
    const partConstraints = constraintsPromptBlock(
      resolveActiveConstraints(partLedger, enactmentCtx.specs, "PERFORM", {
        situationStakes: part === "B" ? enactmentCtx.situationStakes : undefined,
      }),
    );
    const partPrompt = partConstraints ? `${userPrompt}\n\n${partConstraints}` : userPrompt;
    if (part === "B") partBPromptForExpand = partPrompt;

    let draft = await writeOneScene(pPlan, systemPrompt, partPrompt, undefined, tokenCap, `PERFORM:${part}:0`);
    const partCeiling = Math.ceil(halfMax * 1.08);
    const ledgerBeforePart = partLedger;
    for (let attempt = 1; attempt < maxAttempts; attempt++) {
      const w = countWords(draft.text);
      const under = w < halfMin;
      const over = w > halfMax;
      const dlg = performPartDialogueOk(draft.text, storyLength);
      const ledgerAfterPart = mergeContinuityUpdate(ledgerBeforePart, draft.continuity);
      const violations = validateBeatConstraints(
        draft.text,
        ledgerBeforePart,
        ledgerAfterPart,
        "PERFORM",
        enactmentCtx.specs,
        {
          situationStakes: enactmentCtx.situationStakes,
          skipSituationStakes: part === "A",
        },
      );
      if (!under && !over && dlg && violations.length === 0) {
        partLedger = ledgerAfterPart;
        break;
      }
      if (!canMakeExpressLlmCall()) break;

      const note = [
        buildSceneRetryNote("PERFORM", draft.text, storyLength, pPlan),
        !dlg ? DIALOGUE_FORWARD_PROMPT_BLOCK : "",
        violations.length ? buildConstraintRetryNote(violations) : "",
        `PERFORM part ${part} revision ${attempt + 1}/${maxAttempts} — stay in ${halfMin}–${halfMax} words; dialogue-heavy.`,
      ]
        .filter(Boolean)
        .join("\n\n");
      draft = await writeOneScene(pPlan, systemPrompt, partPrompt, note, tokenCap, `PERFORM:${part}:${attempt}`);
      partLedger = mergeContinuityUpdate(ledgerBeforePart, draft.continuity);
    }
    let partWords = countWords(draft.text);
    if (partWords > partCeiling) {
      draft = {
        ...draft,
        text: trimProseToWordMax(draft.text, halfMax),
      };
      partWords = countWords(draft.text);
    }
    if (partWords > partCeiling) {
      throw new Error(`PERFORM part ${part} above ceiling (${partWords} > ${partCeiling})`);
    }
    if (!performPartDialogueOk(draft.text, storyLength)) {
      draft = await recoverPerformDialogue(
        draft,
        pPlan,
        systemPrompt,
        partPrompt,
        storyLength,
        tokenCap,
        `PERFORM:${part}`,
      );
    }
    if (!performPartDialogueOk(draft.text, storyLength) && canMakeExpressLlmCall()) {
      throw new Error(`PERFORM part ${part} below dialogue floor after salvage`);
    }

    const validateOpts: EnactmentValidateOpts = {
      situationStakes: enactmentCtx.situationStakes,
      skipSituationStakes: part === "A",
    };
    draft = await recoverSceneConstraints(draft, {
      plan: pPlan,
      systemPrompt,
      userPrompt: partPrompt,
      tokenCap,
      ledgerBefore: ledgerBeforePart,
      specs: enactmentCtx.specs,
      phase: "PERFORM",
      validateOpts,
      timingPrefix: `PERFORM:${part}`,
      wordMax: halfMax,
      ceilingRatio: 1.08,
      pairing: enactmentCtx.pairing,
      relaxFinalQc: true,
    });
    partLedger = mergeContinuityUpdate(ledgerBeforePart, draft.continuity);
    parts.push(draft.text);
    if (draft.script?.length) partScripts.push(draft.script);
    onPartComplete?.(part);
    heading = draft.heading || heading;
    emotional = draft.emotional_shift || emotional;
  }

  let combined = parts.join("\n\n");
  let total = countWords(combined);
  const scale = phaseLengthScale(storyLength);
  const combinedCeiling = max * (scale < 0.55 ? 1.55 : 1.15);

  if (total < min && partBPromptForExpand && canMakeExpressLlmCall()) {
    const expand = await writeOneScene(
      partPlan("B"),
      systemPrompt,
      partBPromptForExpand,
      `EXPAND-ONLY — PERFORM combined is ${total} words; floor is ${min}. Extend Part B with ${min - total}+ more words of dialogue-heavy climax; keep blindfold/praise/situation constraints; do not recap Part A.`,
      partTokenCap(),
    );
    parts[1] = parts[1] ? `${parts[1]}\n\n${expand.text}` : expand.text;
    if (expand.script?.length) {
      if (partScripts[1]) partScripts[1] = mergeWriterScripts([partScripts[1], expand.script]);
      else partScripts.push(expand.script);
    }
    combined = parts.join("\n\n");
    total = countWords(combined);
  }

  if (total < min) {
    logger.warn({ total, min }, "[writeExpress] PERFORM below floor after split — shipping best-effort");
  }

  let combinedDraft: SceneWriteDraft = { heading, text: combined, emotional_shift: emotional };
  combinedDraft = await recoverPerformDialogue(
    combinedDraft,
    partPlan("B"),
    systemPrompt,
    partBPromptForExpand || baseUserPrompt,
    storyLength,
    partTokenCap(),
    "PERFORM:combined",
    true,
  );
  combined = combinedDraft.text;
  if (!performCombinedDialogueOk(combined, storyLength)) {
    logger.warn("[writeExpress] PERFORM combined below dialogue floor — shipping best-effort");
  }

  let combinedViolations = validateSceneConstraints(
    combined,
    ledger,
    partLedger,
    "PERFORM",
    enactmentCtx.specs,
    { situationStakes: enactmentCtx.situationStakes },
  );
  if (combinedViolations.length) {
    const repaired = applyDeterministicConstraintRepairs(combined, combinedViolations, enactmentCtx.pairing);
    combined = repaired.text;
    combinedViolations = validateSceneConstraints(
      combined,
      ledger,
      partLedger,
      "PERFORM",
      enactmentCtx.specs,
      { situationStakes: enactmentCtx.situationStakes },
    );
    if (combinedViolations.length && partBPromptForExpand) {
      logger.warn(
        { violations: describeConstraintViolations(combinedViolations) },
        "[writeExpress] Combined PERFORM constraint QC failed — Part B salvage",
      );
      const partBSalvage = await recoverSceneConstraints(
        { heading, text: parts[1] ?? "", emotional_shift: emotional },
        {
          plan: partPlan("B"),
          systemPrompt,
          userPrompt: partBPromptForExpand,
          tokenCap: partTokenCap(),
          ledgerBefore: partLedger,
          specs: enactmentCtx.specs,
          phase: "PERFORM",
          validateOpts: { situationStakes: enactmentCtx.situationStakes },
          timingPrefix: "PERFORM:B:combined",
          pairing: enactmentCtx.pairing,
          relaxFinalQc: true,
        },
      );
      parts[1] = partBSalvage.text;
      combined = parts.join("\n\n");
      const finalRepair = applyDeterministicConstraintRepairs(
        combined,
        validateSceneConstraints(combined, ledger, partLedger, "PERFORM", enactmentCtx.specs, {
          situationStakes: enactmentCtx.situationStakes,
        }),
        enactmentCtx.pairing,
      );
      combined = finalRepair.text;
    }
  }

  total = countWords(combined);
  if (total > combinedCeiling) {
    logger.warn(
      { total, combinedCeiling },
      "[writeExpress] PERFORM combined over ceiling after recovery — trimming",
    );
    combined = trimProseToWordMax(combined, Math.floor(max * (scale < 0.55 ? 1.55 : 1.15)));
  }

  const mergedScript = partScripts.length ? mergeWriterScripts(partScripts) : undefined;
  const scriptValidation = mergedScript
    ? validateWriterScript(mergedScript, { phase: "PERFORM", requireBothSpeakers: true })
    : { ok: false, issues: ["missing script"] };
  if (!scriptValidation.ok) {
    logger.warn({ issues: scriptValidation.issues }, "[writeExpress] PERFORM combined script invalid");
  }

  return attachAudioScript({
    heading,
    text: combined,
    script: mergedScript,
    emotional_shift: emotional,
    continuity: {
      location: partLedger.location,
      clothing: partLedger.clothing,
      blindfold: partLedger.blindfold,
      restraint: partLedger.restraint,
      lastPosition: partLedger.lastPosition,
      actsCompleted: partLedger.actsCompleted,
    },
  });
}

function attachAudioScript(draft: SceneWriteDraft): SceneWriteDraft {
  if (!draft.script?.length) return draft;
  const scriptProse = writerScriptToDisplayProse(draft.script);
  const displayText =
    draft.text && countWords(draft.text) >= countWords(scriptProse)
      ? draft.text
      : scriptProse || draft.text;
  return {
    ...draft,
    text: displayText,
    rawText: writerScriptToTaggedRawText(draft.script),
  };
}

async function writeOneScene(
  plan: ExpressScenePlanRow,
  systemPrompt: string,
  userPrompt: string,
  extraNote?: string,
  maxTokens?: number,
  timingLabel?: string,
): Promise<SceneWriteDraft> {
  const t0 = Date.now();
  try {
  assertExpressLlmBudget(timingLabel ?? plan.phase);
  const completion = await openrouter.chat.completions.create({
    model: MISTRAL_MODEL,
    max_tokens: maxTokens ?? phaseMaxTokens(plan.phase),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: extraNote ? `${userPrompt}\n\n${extraNote}` : userPrompt },
    ],
  });
  recordExpressLlmCall();
  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: ReturnType<typeof parseSceneJson>;
  try {
    parsed = parseSceneJson(raw, plan.phase);
  } catch (parseErr) {
    if (!canMakeExpressLlmCall()) {
      throw new Error(`Invalid scene JSON for ${plan.phase} and LLM budget exhausted`);
    }
    assertExpressLlmBudget(`${timingLabel ?? plan.phase}:json-repair`);
    const repairTokens = Math.max((maxTokens ?? phaseMaxTokens(plan.phase)) + 600, 2400);
    const repair = await openrouter.chat.completions.create({
      model: MISTRAL_MODEL,
      max_tokens: repairTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: extraNote ? `${userPrompt}\n\n${extraNote}` : userPrompt },
        {
          role: "user",
          content:
            parseErr instanceof Error && parseErr.message.includes("audio script")
              ? `${parseErr.message}\n\nReturn ONE complete json_object with heading, script (ordered narrator/protagonist/love_interest spans), emotional_shift, continuity. Every quoted line must be protagonist or love_interest — never narrator.`
              : "Your previous response was truncated or invalid JSON. Return ONE complete json_object with heading, script array, emotional_shift, continuity. Keep within word budget; escape quotes properly.",
        },
      ],
    });
    recordExpressLlmCall();
    try {
      parsed = parseSceneJson(repair.choices[0]?.message?.content ?? "{}", plan.phase);
    } catch (repairErr) {
      throw new Error(
        `Invalid scene JSON for ${plan.phase}: ${repairErr instanceof Error ? repairErr.message : "parse failed"}`,
      );
    }
  }
  if (!parsed.script?.length) {
    throw new Error(`Missing audio script array for ${plan.phase} — multi-voice requires labelled script spans`);
  }
  if (!parsed.text) throw new Error(`Empty scene text for ${plan.phase}`);
  return attachAudioScript({
    heading: parsed.heading?.trim() || plan.phase,
    text: parsed.text,
    script: parsed.script,
    emotional_shift: parsed.emotional_shift?.trim() || plan.emotional_shift,
    continuity: parsed.continuity,
  });
  } finally {
    if (timingLabel) recordExpressWriteTiming(timingLabel, Date.now() - t0);
  }
}

function phaseMaxTokens(phase: string): number {
  if (phase === "PERFORM") return 4000;
  if (phase === "DECLARE") return 2200;
  return 1800;
}

function summarizeScene(text: string, heading: string): string {
  const preview = text.slice(0, 350).replace(/\s+/g, " ");
  return `- "${heading}": ${preview}…`;
}

function extractBannedFromScene(text: string): string[] {
  const found: string[] = [];
  for (const p of BANNED_REPEAT_PHRASES) {
    if (text.toLowerCase().includes(p.toLowerCase())) found.push(p);
  }
  const openers = text.match(/"[^"]{8,60}"/g)?.slice(0, 3) ?? [];
  return [...found, ...openers];
}

function buildSceneRetryNote(
  phase: string,
  text: string,
  storyLength: string | undefined,
  plan: ExpressScenePlanRow,
): string {
  const parts: string[] = [];
  const min = plan.word_budget_min ?? beatWordMin(phase, storyLength);
  const max = plan.word_budget_max ?? beatWordMax(phase, storyLength);
  const w = countWords(text);
  if (w < min) parts.push(`Beat too short: ${w} words (need ${min}–${max}). Expand with dialogue.`);
  if (w > max) parts.push(`Beat too long: ${w} words (max ${max}). Trim narrator only; keep dialogue and plot beats.`);
  const d = validateDialogueDensity({ scenes: [{ text }] }, [{ phase }], storyLength);
  if (!d.ok) parts.push(buildDialogueRetryNote(d));
  return parts.filter(Boolean).join("\n\n");
}

export async function writeExpressStoryPerScene(input: PerSceneWriteInput): Promise<{
  title: string;
  description: string;
  scenes: SceneDraft[];
}> {
  const { brief, listenerName, intensity, partnerName, pairing, storyLength, context, onBeatStart, onBeatComplete, maxSceneAttempts: maxSceneAttemptsInput, maxPerformPartAttempts } = input;
  const maxSceneAttempts = maxSceneAttemptsInput ?? MAX_SCENE_ATTEMPTS;
  const performCtx = {
    performPartAttempts: maxPerformPartAttempts,
  };
  const level = intensityLevel(intensity);
  const resolvedPairing = pairing ?? "Her & Him";
  const partner = partnerName ?? autoPickPartnerName(resolvedPairing, listenerName);
  const fantasyBlock = brief.fantasy_spine ? buildCustomerDesireWriteBlock(brief.fantasy_spine) : "";
  const inputAnchors = buildInputAnchors(context, brief, resolvedPairing);
  const enactmentSpecs = brief.fantasy_spine ? compileEnactmentSpecs(brief.fantasy_spine) : [];
  const situationStakes = brief.fantasy_spine?.situation_stakes;

  resetExpressWriteTimings();
  resetExpressLlmBudget();
  const vocalBlock = level >= 4 ? `\n\n${VOCAL_PERFORMANCE_PROMPT_BLOCK}\n` : "";
  const systemPrompt = `You write explicit adult audio fiction for a premium product. Mistral-only pipeline.
${buildIntensityLayerForPairing(level, resolvedPairing)}
${pairingGuideLine(resolvedPairing)}
${vocalBlock}
${SPEAKER_ATTRIBUTION_WRITE_CONTRACT}
Second-person "you" for the listener unless brief says otherwise.
Return only valid JSON per beat.`;

  const scenes: SceneDraft[] = [];
  const priorSummaries: string[] = [];
  const bannedAccum: string[] = [];
  const usedHeadings: string[] = [];
  let ledger = buildInitialLedger({
    setting: context?.setting,
    partnerName: partner,
    activeTags: brief.fantasy_spine?.customer_desire_tags ?? [],
  });

  for (const plan of brief.scene_plan) {
    const phase = plan.phase.toUpperCase();
    onBeatStart?.(phase);
    const userPrompt = buildSceneUserPrompt(plan, {
      titleDirection: brief.title_direction,
      priorSummary: priorSummaries.join("\n"),
      bannedPhrases: bannedAccum,
      fantasyBlock: phase === "DECLARE" || phase === "PERFORM" ? fantasyBlock : "",
      inputAnchors,
      partnerName: partner,
      listenerName: listenerName || "you",
      level,
      storyLength,
      ledger,
      usedHeadings,
      enactmentSpecs,
      situationStakes,
      skipSituationStakes: false,
      pairing: resolvedPairing,
    });

    let draft =
      phase === "PERFORM"
        ? await writePerformBeat(
            plan,
            systemPrompt,
            userPrompt,
            storyLength,
            ledger,
            { specs: enactmentSpecs, situationStakes, pairing: resolvedPairing, ...performCtx },
            (part) => onBeatComplete?.("PERFORM", part),
          )
        : await writeOneScene(plan, systemPrompt, userPrompt, undefined, undefined, phase);

    const sceneMaxAttempts = maxSceneAttempts;
    if (phase !== "PERFORM") {
    for (let attempt = 1; attempt < sceneMaxAttempts; attempt++) {
      const underMin = !sceneWordsUnderMin(draft.text, phase, storyLength, plan);
      const overMax = sceneWordsOverMax(draft.text, phase, storyLength, plan);
      const dialogueOk = sceneDialogueOk(
        draft.text,
        phase,
        storyLength,
        scenes.map((s) => s.text),
      );
      const ledgerAfterDraft = mergeContinuityUpdate(ledger, draft.continuity);
      const constraintOk =
        validateBeatConstraints(
          draft.text,
          ledger,
          ledgerAfterDraft,
          phase,
          enactmentSpecs,
          { situationStakes },
        ).length === 0;
      if (!underMin && !overMax && dialogueOk && constraintOk) break;
      if (!canMakeExpressLlmCall()) break;

      const retryParts = [buildSceneRetryNote(phase, draft.text, storyLength, plan)];
      if (!dialogueOk) {
        const d = validateDialogueDensity({ scenes: [{ text: draft.text }] }, [{ phase }], storyLength);
        retryParts.push(DIALOGUE_FORWARD_PROMPT_BLOCK, buildDialogueRetryNote(d));
      }
      if (!constraintOk) {
        const violations = validateBeatConstraints(
          draft.text,
          ledger,
          ledgerAfterDraft,
          phase,
          enactmentSpecs,
          { situationStakes },
        );
        retryParts.push(buildConstraintRetryNote(violations));
      }
      retryParts.push(
        `REVISE (attempt ${attempt + 1}/${sceneMaxAttempts}) — same plot; stay in word band ${plan.word_budget_min}–${plan.word_budget_max}:\n${JSON.stringify({ heading: draft.heading, text: draft.text.slice(0, 600) }, null, 0)}`,
      );
      draft = await writeOneScene(plan, systemPrompt, userPrompt, retryParts.filter(Boolean).join("\n\n"), undefined, `${phase}:retry${attempt}`);
    }

    const ledgerBeforeScene = ledger;
    draft = await recoverSceneConstraints(draft, {
      plan,
      systemPrompt,
      userPrompt,
      ledgerBefore: ledgerBeforeScene,
      specs: enactmentSpecs,
      phase,
      validateOpts: { situationStakes },
      timingPrefix: phase,
      wordMax: plan.word_budget_max ?? beatWordMax(phase, storyLength),
      ceilingRatio: phase === "DECLARE" ? 1.35 : 1.15,
      pairing: resolvedPairing,
      relaxFinalQc: true,
    });
    }

    const w = countWords(draft.text);
    const min = plan.word_budget_min ?? beatWordMin(phase, storyLength);
    const max = plan.word_budget_max ?? beatWordMax(phase, storyLength);
    const softMin = Math.floor(min * WORD_FLOOR_SLACK);
    if (w < softMin && phase !== "PERFORM" && canMakeExpressLlmCall()) {
      draft = await writeOneScene(
        plan,
        systemPrompt,
        userPrompt,
        `EXPAND-ONLY — ${phase} is ${w} words; floor is ${min} (target ${plan.word_budget_target ?? min}). Keep the same heading, plot, and character voices. Add multi-turn dialogue${phase === "DECLARE" ? " naming the customer's Make it yours choices aloud" : ""}. Do not summarize — write the scene fully.`,
        undefined,
        `${phase}:expand`,
      );
    }
    const finalWords = countWords(draft.text);
    if (finalWords < softMin) {
      throw new Error(`Express write failed: ${phase} below word floor (${finalWords} < ${softMin})`);
    }
    const ceilingRatio = phase === "DECLARE" ? 1.35 : 1.15;
    if (phase === "PERFORM" || phase === "DECLARE") {
      draft = {
        ...draft,
        text: trimBeatToCeiling(draft.text, max, ceilingRatio),
      };
    }
    if (
      !sceneDialogueOk(draft.text, phase, storyLength, scenes.map((s) => s.text)) &&
      phase !== "PERFORM" &&
      canMakeExpressLlmCall()
    ) {
      if (phase === "DECLARE" || phase === "LAND") {
        const issues = validateDialogueDensity({ scenes: [{ text: draft.text }] }, [{ phase }], storyLength)
          .weakScenes[0]?.issues.join("; ");
        draft = await writeOneScene(
          plan,
          systemPrompt,
          userPrompt,
          `DIALOGUE-EXPAND — ${phase} needs more quoted speech (${issues ?? "below floor"}). Keep heading, plot, and word band ${min}–${max}; add multi-turn partner/listener lines inside quotes.`,
          undefined,
          `${phase}:dialogue-expand`,
        );
      }
      if (
        !sceneDialogueOk(draft.text, phase, storyLength, scenes.map((s) => s.text)) &&
        phase !== "PERFORM"
      ) {
        const issues = validateDialogueDensity({ scenes: [{ text: draft.text }] }, [{ phase }], storyLength)
          .weakScenes[0]?.issues.join("; ");
        throw new Error(`Express write failed: ${phase} below dialogue floor (${issues ?? "unknown"})`);
      }
    }

    if (usedHeadings.includes(draft.heading)) {
      throw new Error(`Express write failed: duplicate heading "${draft.heading}"`);
    }

    scenes.push({
      id: plan.scene_number,
      heading: draft.heading,
      text: draft.text,
      rawText: draft.rawText,
      duration_estimate: 60,
      emotional_shift: draft.emotional_shift,
    });
    ledger = mergeContinuityUpdate(ledger, draft.continuity);
    priorSummaries.push(summarizeScene(draft.text, draft.heading));
    bannedAccum.push(...extractBannedFromScene(draft.text));
    usedHeadings.push(draft.heading);
    if (phase === "PERFORM") {
      onBeatComplete?.("PERFORM", "B");
    } else {
      onBeatComplete?.(phase);
    }
  }

  const timing = summarizeExpressWriteTimings();
  logger.info(
    { llmCalls: timing.llmCalls, expressLlmBudgetUsed: expressLlmCallsUsed(), totalWriteMs: timing.totalMs, beats: timing.byBeat },
    "[writeExpress] generation timing",
  );

  return {
    title: deriveTitle(brief, scenes),
    description: deriveDescription(brief, scenes),
    scenes,
  };
}

function deriveTitle(brief: ExpressStoryBrief, scenes: SceneDraft[]): string {
  const perform = scenes.find((s) => brief.scene_plan[s.id - 1]?.phase === "PERFORM");
  return perform?.heading ?? scenes[2]?.heading ?? scenes[0]?.heading ?? "Your Story";
}

function deriveDescription(brief: ExpressStoryBrief, scenes: SceneDraft[]): string {
  const first = scenes[0]?.text.slice(0, 120) ?? "";
  return `${brief.relationship_dynamic} — ${first.replace(/\s+/g, " ").trim()}…`;
}
