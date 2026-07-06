/**
 * Customer fantasy contract — Act IV Make it yours + Situation + Scenario frame.
 * Builds structured enactment beats so PERFORM is architected around customer chips.
 */

import { getSituationById } from "./situations.js";
import { validateStoryEnactmentConstraints } from "./enactmentConstraints.js";

export type DesireTagBucket =
  | "physical"
  | "words"
  | "fantasy"
  | "emotional_state"
  | "tone"
  | "pacing"
  | "ending"
  | "general";

export interface ProtPronouns {
  sub: string;
  obj: string;
  poss: string;
  refl: string;
}

export type ExpressBeatPhase = "FRAME" | "DECLARE" | "PERFORM" | "LAND";

export interface CustomerDesireBeat {
  tag: string;
  bucket: DesireTagBucket;
  setupPhase: "DECLARE" | null;
  enactPhase: ExpressBeatPhase;
  enactment: string;
  partnerAction: string;
  dialogueHooks: string[];
  qcCheck: string;
}

export interface FantasySpine {
  scenario_frame: string;
  situation_stakes?: string;
  situation_label?: string;
  customer_desire_tags: string[];
  scenario_tags: string[];
  customer_enactments: CustomerDesireBeat[];
  /** DECLARE: chips named in dialogue before sex */
  declare_desire_declaration: string;
  /** PERFORM: ordered enactment spine */
  perform_spine: string;
}

export function classifyExperienceTag(tag: string): DesireTagBucket {
  const t = tag.toLowerCase();

  const EMOTIONAL_STATE_SINGLES = new Set([
    "desired", "seen", "powerful", "safe", "vulnerable", "chosen", "overwhelmed",
    "undone", "adored", "electric", "rescued", "consumed", "breathless", "known",
    "discovered", "wanted", "held", "irreplaceable", "shattered", "lit up",
  ]);
  if (EMOTIONAL_STATE_SINGLES.has(t)) return "emotional_state";

  if (
    t.includes("falls asleep") || t.includes("don't leave until morning") ||
    t.includes("asks for more") || t.includes("no one speaks afterward") ||
    t.includes("go again immediately") || t.includes("doesn't want it to be over") ||
    (t.includes("they leave") && t.includes("doesn't stop")) ||
    (t.includes("they stay") && t.includes("surprised")) ||
    t.includes("left open") || t.includes("still feeling it") ||
    t.includes("texts them") || t.includes("lock the door again")
  ) return "ending";

  if (
    t.includes("not entirely human") || t.includes("rules of this world") ||
    t.includes("time works differently") || t.includes("no consequences, no morning") ||
    (t.includes("impossible") && !t.includes("read") && !t.includes("resist")) ||
    t.includes("magic") || t.includes("mythology") || t.includes("something older") ||
    t.includes("power that couldn't be explained") || t.includes("power that can't be explained") ||
    t.includes("power neither of them") || t.includes("world suspended") ||
    t.includes("taken somewhere impossible") || t.includes("rules suspended")
  ) return "fantasy";

  if (
    t.includes("wanted to be praised") || t.includes("wanted to hear what") ||
    t.includes("wanted to be narrated") || t.includes("wanted to have to ask") ||
    t.includes("wanted to say it back") || t.includes("wanted to be told") ||
    t.includes("wanted every moment described") || t.includes("wanted to hear how much") ||
    t.includes("wanted to be called") || t.includes("wanted to be degraded") ||
    t.includes("wanted to be worshipped") || t.includes("wanted to beg") ||
    t.includes("wanted to be taken completely")
  ) return "words";

  if (
    t.includes("wanted to be tied up") || t.includes("wanted to be blindfolded") ||
    t.includes("wanted to be held down") || t.includes("wanted to be told not to move") ||
    t.includes("wanted a hand pressed") || t.includes("wanted to be looked at") ||
    t.includes("wanted to kneel") || t.includes("wanted to be completely powerless") ||
    t.includes("wanted something around") || t.includes("wanted to be undressed") ||
    t.includes("wanted to be kept completely still") ||
    t.includes("wanted to feel completely enclosed") ||
    t.includes("surrendered to them") ||
    t.includes("wanted to be spanked") || t.includes("wanted to be edged")
  ) return "physical";

  const TONE_TAGS = [
    "dialogue-rich", "mostly sensation", "poetic", "sharp & direct", "dreamlike",
    "cinematic", "raw & real", "intimate & internal", "lyrical", "sensory",
    "grounded & physical", "interior monologue", "explicit & direct", "fragmented & urgent",
  ];
  if (TONE_TAGS.some((k) => t === k)) return "tone";

  const PACING_TAGS = [
    "slow simmer", "quick burn", "even tension", "agonising build", "all foreplay",
    "fast then tender", "one long exhale", "interrupted and restarted",
    "building to a crash", "starting mid-desire", "two speeds",
  ];
  if (PACING_TAGS.some((k) => t.includes(k))) return "pacing";

  return "general";
}

function physicalEnactment(tag: string, prot: ProtPronouns): Pick<CustomerDesireBeat, "enactment" | "partnerAction" | "dialogueHooks" | "qcCheck"> {
  const t = tag.toLowerCase();
  const subLc = prot.sub.toLowerCase();

  if (t.includes("blindfolded")) {
    return {
      enactment: `Partner applies a blindfold in PERFORM (action + dialogue). Sex while blindfold remains on uses sound, touch, and speech — not visual description. Blindfold stays through climax; removal only in LAND if at all.`,
      partnerAction: "places blindfold, controls pace while ${prot.obj} cannot see",
      dialogueHooks: [`"Don't open your eyes."`, `"Tell me what you feel."`, `"You wanted this — stay still."`],
      qcCheck: "blindfold applied on body + sustained play without sight in PERFORM dialogue/action",
    };
  }
  if (t.includes("tied up") || t.includes("something around") && t.includes("wrist")) {
    return {
      enactment: `Partner restrains ${prot.obj} in PERFORM — binding is performed in dialogue/action, not only narrated. Restriction shapes every touch and command.`,
      partnerAction: "binds wrists or body; tests restraint before escalating",
      dialogueHooks: [`"Can you move?"`, `"Good — don't."`, `"That's what you asked for."`],
      qcCheck: "restraint applied and active during PERFORM",
    };
  }
  if (t.includes("spanked")) {
    return {
      enactment: `Spanking enacted in PERFORM: partner strikes, ${prot.sub} responds in speech. Impact, sound, and heat through dialogue and sensation — partner initiates.`,
      partnerAction: "spanks with clear intent; checks in or commands between strikes",
      dialogueHooks: [`"Count for me."`, `"You wanted this."`, `"Again?"`],
      qcCheck: "spanking performed in PERFORM, not only remembered",
    };
  }
  if (t.includes("kneel")) {
    return {
      enactment: `Kneeling is a chosen physical act in PERFORM — partner invites or commands; ${prot.sub} lowers; scene plays from that position.`,
      partnerAction: "directs ${prot.obj} to knees; maintains eye line or touch from above",
      dialogueHooks: [`"On your knees."`, `"Look at me."`, `"Stay there."`],
      qcCheck: "kneeling happens in scene with dialogue",
    };
  }
  if (t.includes("edged")) {
    return {
      enactment: `Edging architecture in PERFORM: partner brings ${prot.obj} to threshold and withdraws — repeated in action and dirty talk.`,
      partnerAction: "controls pace; denies release until chosen moment",
      dialogueHooks: [`"Not yet."`, `"Ask me."`, `"You don't come until I say."`],
      qcCheck: "edging pattern with partner control in PERFORM",
    };
  }
  if (t.includes("held down") || t.includes("told not to move") || t.includes("kept completely still")) {
    return {
      enactment: `Stillness/restraint commanded and enforced by partner in PERFORM — ${prot.sub} struggles to comply; partner holds ${prot.obj} in place.`,
      partnerAction: "pins or commands stillness; rewards compliance",
      dialogueHooks: [`"Don't move."`, `"I said still."`, `"Good ${subLc === "they" ? "child" : "girl"} — hold it."`],
      qcCheck: "stillness or hold-down enacted by partner in PERFORM",
    };
  }

  return {
    enactment: `Physical tag enacted in PERFORM by the partner's action and dialogue — not narrator-only description. ${prot.sub} responds in speech while it happens.`,
    partnerAction: "performs the act; directs ${prot.obj} through it",
    dialogueHooks: [`"Tell me if you want more."`, `"This is what you chose."`],
    qcCheck: `physical act for "${tag}" performed in PERFORM`,
  };
}

function wordsEnactment(tag: string, prot: ProtPronouns): Pick<CustomerDesireBeat, "enactment" | "partnerAction" | "dialogueHooks" | "qcCheck"> {
  return {
    enactment: `Exact words from this tag must appear in PERFORM dialogue — written out in full, not paraphrased.`,
    partnerAction: "speaks the requested words while touching ${prot.obj}",
    dialogueHooks: [`(use the specific phrasing implied by: "${tag}")`],
    qcCheck: `dialogue in PERFORM reflects "${tag}" with actual spoken lines`,
  };
}

export function buildBeatForTag(tag: string, prot: ProtPronouns): CustomerDesireBeat {
  const bucket = classifyExperienceTag(tag);
  const subLc = prot.sub.toLowerCase();

  let setupPhase: CustomerDesireBeat["setupPhase"] = "DECLARE";
  let enactPhase: CustomerDesireBeat["enactPhase"] = "PERFORM";

  if (bucket === "ending") {
    setupPhase = null;
    enactPhase = "LAND";
  } else if (bucket === "tone" || bucket === "pacing") {
    setupPhase = null;
    enactPhase = "PERFORM";
  } else if (bucket === "emotional_state") {
    setupPhase = "DECLARE";
    enactPhase = "PERFORM";
  } else if (bucket === "fantasy") {
    setupPhase = "DECLARE";
    enactPhase = "PERFORM";
  }

  const base = bucket === "physical"
    ? physicalEnactment(tag, prot)
    : bucket === "words"
      ? wordsEnactment(tag, prot)
      : {
          enactment: `Engineer "${tag}" through partner action and dialogue in ${enactPhase} — felt, not named as a label.`,
          partnerAction: "embodies this desire through what they do and say",
          dialogueHooks: [`"I know what you want."`],
          qcCheck: `"${tag}" enacted in ${enactPhase}, not only implied`,
        };

  return {
    tag,
    bucket,
    setupPhase,
    enactPhase,
    enactment: base.enactment.replace(/\$\{prot\.obj\}/g, prot.obj).replace(/\$\{prot\.sub\}/g, prot.sub),
    partnerAction: base.partnerAction.replace(/\$\{prot\.obj\}/g, prot.obj).replace(/\$\{prot\.sub\}/g, prot.sub).replace(/\$\{subLc\}/g, subLc),
    dialogueHooks: base.dialogueHooks,
    qcCheck: base.qcCheck,
  };
}

export function buildCustomerDesireBeats(tags: string[], prot: ProtPronouns): CustomerDesireBeat[] {
  return tags.map((tag) => buildBeatForTag(tag, prot));
}

export interface FantasySpineInput {
  scenarioTags?: string[];
  customerDesireTags?: string[];
  situationId?: string;
  storyMode?: string;
  dynamic?: string;
  chemistry?: string;
  setting?: string;
}

export function buildFantasySpine(input: FantasySpineInput, prot: ProtPronouns): FantasySpine {
  const scenarioTags = input.scenarioTags ?? [];
  const customerDesireTags = input.customerDesireTags ?? [];
  const enactments = buildCustomerDesireBeats(customerDesireTags, prot);

  const scenarioFrame = scenarioTags.length
    ? `Fantasy frame (${input.storyMode ?? "after dark"}): ${scenarioTags.join("; ")}. Setting/dynamic: ${input.setting ?? "infer"}, ${input.dynamic ?? ""}, ${input.chemistry ?? ""}.`
    : `Fantasy frame: ${input.storyMode ?? "after dark"} — ${input.setting ?? "infer from scenario"}.`;

  let situationStakes: string | undefined;
  let situationLabel: string | undefined;
  if (input.situationId) {
    const sit = getSituationById(input.situationId);
    if (sit) {
      situationStakes = sit.internalInject;
      situationLabel = sit.label;
    }
  }

  const physicalOrWords = enactments.filter((b) => b.bucket === "physical" || b.bucket === "words");
  const declareTags = enactments.filter((b) => b.setupPhase === "DECLARE");

  const declareDeclaration = customerDesireTags.length
    ? `DECLARE MANDATORY — DESIRE DECLARATION: Before PERFORM, characters must speak the customer's chosen fantasies aloud in dialogue (negotiate, confess, or command). Tags to name or acknowledge: ${declareTags.map((b) => `"${b.tag}"`).join(", ") || customerDesireTags.map((t) => `"${t}"`).join(", ")}. At least one multi-turn exchange where the partner repeats back what ${prot.sub} wants.`
    : "";

  const performLines = physicalOrWords.length
    ? physicalOrWords.map((b, i) => `${i + 1}. "${b.tag}" — ${b.enactment}`).join("\n")
    : enactments.filter((b) => b.enactPhase === "PERFORM").map((b, i) => `${i + 1}. "${b.tag}" — ${b.enactment}`).join("\n");

  const performSpine = customerDesireTags.length
    ? `CUSTOMER FANTASY SCENE (PERFORM SPINE) — non-negotiable:\nPERFORM is one continuous scene built around the listener's Make it yours choices. Partners act; narrator bridges.\n${performLines || "(no customer chips — infer from scenario)"}`
    : "";

  return {
    scenario_frame: scenarioFrame,
    situation_stakes: situationStakes,
    situation_label: situationLabel,
    customer_desire_tags: customerDesireTags,
    scenario_tags: scenarioTags,
    customer_enactments: enactments,
    declare_desire_declaration: declareDeclaration,
    perform_spine: performSpine,
  };
}

export function buildFantasySpinePlanBlock(spine: FantasySpine): string {
  const parts: string[] = [];

  parts.push(`FANTASY SPINE — THREE-LAYER CONTRACT (plan every scene against this):\n1. SCENARIO FRAME (Act III): ${spine.scenario_frame}`);
  if (spine.situation_stakes) {
    parts.push(`2. SITUATION STAKES (Act IV · The situation): "${spine.situation_label ?? "selected situation"}" — thread through FRAME, DECLARE, and PERFORM (stakes felt during sex, not only opening):\n${spine.situation_stakes}`);
  }
  if (spine.customer_desire_tags.length) {
    parts.push(`3. CUSTOMER FANTASY CONTRACT (Act IV · Make it yours) — HIGHEST PRIORITY FOR PERFORM:\n${spine.customer_enactments.map((b) => `  • "${b.tag}" [${b.bucket}] → setup: ${b.setupPhase ?? "n/a"}, enact: ${b.enactPhase}. ${b.enactment}`).join("\n")}`);
    if (spine.declare_desire_declaration) parts.push(spine.declare_desire_declaration);
    if (spine.perform_spine) parts.push(spine.perform_spine);
  }

  parts.push(`
SCENE_PLAN EXTENSIONS — for each scene in scene_plan also include:
  • customer_desire_beats: array of tag strings that MUST fire in this scene (from Make it yours)
  • situation_beats: array of short phrases for how situation stakes appear in this scene (empty if no situation)
  • fantasy_enactment_spine: (PERFORM scenes only) one paragraph — ordered enactment of customer tags in this scene

RULES:
  • Every customer_desire_tags entry must appear in at least one scene's customer_desire_beats
  • Physical and words tags: must appear in DECLARE (named) AND PERFORM (enacted)
  • Situation stakes in FRAME + DECLARE + PERFORM
  • PERFORM goal field must reference the customer fantasy spine explicitly when chips are present`);

  return parts.join("\n\n");
}

export function buildCustomerDesireWriteBlock(spine: FantasySpine): string {
  if (!spine.customer_desire_tags.length && !spine.situation_stakes) return "";

  const lines: string[] = [
    "CUSTOMER FANTASY CONTRACT — ACT IV (non-negotiable):",
    spine.scenario_frame,
  ];

  if (spine.situation_stakes) {
    lines.push(
      `SITUATION STAKES — felt in dialogue during DECLARE and PERFORM (risk, forbidden, professional cost):\n${spine.situation_stakes}`,
    );
  }

  if (spine.declare_desire_declaration) lines.push(spine.declare_desire_declaration);
  if (spine.perform_spine) lines.push(spine.perform_spine);

  lines.push(
    "ENACTMENT RULE: Physical and BDSM chips are performed by the partner in dialogue and action — not only described by the narrator. Follow scene_plan.customer_desire_beats and fantasy_enactment_spine per scene.",
  );

  return lines.join("\n\n");
}

export function buildScenarioFrameInstruction(tags: string[], prot: ProtPronouns): string {
  if (!tags.length) return "";
  return `SCENARIO FRAME (Act III fantasy — tone and tension, lower priority than Make it yours):\n${tags.map((t) => `  • "${t}" — weave into FRAME–DECLARE as emotional/dynamic framing; do not let these override customer physical/words chips in PERFORM.`).join("\n")}`;
}

export interface ScenePlanWithDesire {
  phase: string;
  goal?: string;
  customer_desire_beats?: string[];
  situation_beats?: string[];
  fantasy_enactment_spine?: string;
}

export function enrichScenePlanWithDesireBeats<T extends ScenePlanWithDesire>(
  scenePlan: T[],
  spine: FantasySpine,
): T[] {
  if (!spine.customer_desire_tags.length && !spine.situation_stakes) return scenePlan;

  const situationPhrases = spine.situation_stakes
    ? ["professional/forbidden tension present", "stakes sharpen the risk of being caught or crossed"]
    : [];

  return scenePlan.map((scene) => {
    const phase = scene.phase?.toUpperCase() ?? "";
    const desireBeats = spine.customer_enactments
      .filter((b) => {
        if (b.setupPhase === phase) return true;
        if (b.enactPhase === phase) return true;
        if (phase === "FRAME" && b.bucket === "fantasy") return true;
        if (phase === "LAND" && b.bucket === "ending") return true;
        if ((phase === "FRAME" || phase === "DECLARE") && b.bucket === "emotional_state") return true;
        return false;
      })
      .map((b) => b.tag);

    const situationBeats =
      spine.situation_stakes && ["FRAME", "DECLARE", "PERFORM"].includes(phase)
        ? situationPhrases
        : [];

    let fantasyEnactmentSpine = scene.fantasy_enactment_spine;
    if (phase === "PERFORM" && spine.customer_desire_tags.length) {
      const performTags = spine.customer_enactments
        .filter((b) => b.enactPhase === "PERFORM" || b.setupPhase === "DECLARE")
        .map((b) => b.tag);
      fantasyEnactmentSpine = `Enact in order: ${performTags.join(" → ")}. Partners lead; narrator bridges. ${spine.perform_spine.split("\n").slice(1, 4).join(" ")}`;
    }

    const goalSuffix =
      phase === "PERFORM" && desireBeats.length
        ? ` [Customer fantasy: ${desireBeats.join(", ")}]`
        : phase === "DECLARE" && desireBeats.length
          ? ` [Name desires in dialogue: ${desireBeats.join(", ")}]`
          : "";

    return {
      ...scene,
      goal: scene.goal ? `${scene.goal}${goalSuffix}` : goalSuffix.trim(),
      customer_desire_beats: desireBeats.length ? desireBeats : scene.customer_desire_beats,
      situation_beats: situationBeats.length ? situationBeats : scene.situation_beats,
      fantasy_enactment_spine: fantasyEnactmentSpine ?? scene.fantasy_enactment_spine,
    };
  });
}

export function attachFantasySpineToBrief<B extends { scene_plan: ScenePlanWithDesire[] }>(
  brief: B,
  spine: FantasySpine,
): B & { fantasy_spine: FantasySpine; customer_desire_tags: string[]; scenario_tags: string[] } {
  return {
    ...brief,
    fantasy_spine: spine,
    customer_desire_tags: spine.customer_desire_tags,
    scenario_tags: spine.scenario_tags,
    scene_plan: enrichScenePlanWithDesireBeats(brief.scene_plan, spine),
  };
}

/** Lightweight text checks for story-only QA (no LLM). */
export function scoreCustomerDesireCompliance(
  scenes: Array<{ heading?: string; text: string }>,
  spine: FantasySpine,
  scenePlan: Array<{ phase?: string }> = [],
): { score: number; failures: string[]; passes: string[] } {
  const failures: string[] = [];
  const passes: string[] = [];
  const fullText = scenes.map((s) => s.text).join("\n").toLowerCase();

  const performText = scenes
    .filter((s, i) => /perform/i.test(s.heading ?? "") || i === 2)
    .map((s) => s.text)
    .join("\n")
    .toLowerCase();

  for (const beat of spine.customer_enactments) {
    if (beat.bucket !== "physical" && beat.bucket !== "words") continue;

    const tagLc = beat.tag.toLowerCase();
    let found = false;

    if (tagLc.includes("blindfold")) {
      found = /blindfold|blind-fold|eyes covered|couldn't see|can't see|darkness over her eyes|darkness over his eyes|darkness over your eyes/.test(performText);
    } else if (tagLc.includes("tied")) {
      found = /tied|bound|restraint|rope|wrists.*(held|fixed|pinned)/.test(performText);
    } else if (tagLc.includes("spank")) {
      found = /spank|palm.*(ass|cheek|behind)|slap/.test(performText);
    } else if (tagLc.includes("kneel")) {
      found = /kneel|on (your|her|his|their) knees/.test(performText);
    } else if (tagLc.includes("praised")) {
      found = /good girl|perfect|beautiful|praise|proud of you/.test(performText);
    } else if (beat.bucket === "words") {
      found = (performText.match(/"/g) ?? []).length >= 6;
    } else {
      found = tagLc.split(/\s+/).some((w) => w.length > 5 && fullText.includes(w));
    }

    if (found) passes.push(beat.tag);
    else failures.push(beat.tag);
  }

  const total = spine.customer_enactments.filter((b) => b.bucket === "physical" || b.bucket === "words").length;
  let score = total === 0 ? 10 : Math.round((passes.length / total) * 10);

  if (scenePlan.length) {
    const violations = validateStoryEnactmentConstraints(scenes, scenePlan, spine);
    for (const v of violations) {
      failures.push(`${v.tag}: ${v.message}`);
    }
    if (violations.length) {
      score = Math.min(score, Math.max(0, score - violations.length * 2));
    }
  }

  return { score, failures, passes };
}

export function buildCustomerDesireQcLines(spine: FantasySpine): string[] {
  const lines: string[] = [];
  if (spine.customer_desire_tags.length) {
    lines.push(
      `Customer desire compliance (Act IV Make it yours) — each tag MUST be enacted in its assigned phase, not narrator-only:\n${spine.customer_enactments.map((b) => `  • "${b.tag}" → ${b.qcCheck}`).join("\n")}`,
    );
  }
  if (spine.situation_stakes) {
    lines.push(
      `Situation compliance (Act IV The situation) — stakes from "${spine.situation_label}" must be felt in DECLARE and PERFORM dialogue, not only FRAME.`,
    );
  }
  if (spine.scenario_tags.length) {
    lines.push(`Scenario frame tags present as tension: ${spine.scenario_tags.join(", ")}`);
  }
  return lines;
}
