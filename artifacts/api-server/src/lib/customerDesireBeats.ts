/**
 * Customer fantasy contract — Act IV Make it yours + Situation + Scenario frame.
 * Builds structured enactment beats so PERFORM is architected around customer chips.
 */

import { getSituationById } from "./situations.js";
import { adaptTextForPairing } from "./pairingWrite.js";
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
  /** FRAME — theme in situation talk; no sex acts, no full enactment */
  foreshadow: string;
  /** DECLARE — desire named; partner tests in speech only */
  negotiate: string;
  /** PERFORM — ordered audio-visual beats: command → act → react → deepen */
  actBeats: string[];
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
      dialogueHooks: [`"Don't move."`, `"I said still."`, `"Good ${subLc === "they" ? "child" : subLc === "he" ? "boy" : "girl"} — hold it."`],
      qcCheck: "stillness or hold-down enacted by partner in PERFORM",
    };
  }
  if (t.includes("surrender")) {
    return {
      enactment: `Surrender enacted in PERFORM — partner takes control through commands, positioning, and pace; ${prot.sub} complies in speech while losing agency. Do NOT only repeat "surrender" — show it.`,
      partnerAction: "commands stillness or position; controls pace; praises compliance; does not ask permission mid-act",
      dialogueHooks: [`"Hands behind your back."`, `"Don't move until I say."`, `"That's surrender — stay still."`, `"Give me everything."`],
      qcCheck: "surrender shown via partner commands + listener compliance in PERFORM, not label-only",
    };
  }
  if (t.includes("powerless") || t.includes("completely enclosed")) {
    return {
      enactment: `Powerlessness enacted in PERFORM — partner restricts movement or senses; ${prot.sub} responds while unable to act freely.`,
      partnerAction: "restricts body or senses; checks in through speech; escalates only when ${prot.obj} complies",
      dialogueHooks: [`"You don't get to move."`, `"Let me do this."`, `"That's it — let go."`],
      qcCheck: "powerlessness performed through restriction + compliance in PERFORM",
    };
  }

  return {
    enactment: `Physical tag enacted in PERFORM by the partner's action and dialogue — not narrator-only description. ${prot.sub} responds in speech while it happens.`,
    partnerAction: "performs the act; directs ${prot.obj} through it",
    dialogueHooks: [`"Tell me if you want more."`, `"This is what you chose."`],
    qcCheck: `physical act for "${tag}" performed in PERFORM`,
  };
}

function isLiteralWordsChip(tag: string): boolean {
  const t = tag.toLowerCase();
  return (
    t.includes("wanted to be called") ||
    t.includes("wanted to say it back") ||
    t.includes("wanted to beg") ||
    t.includes("wanted to be degraded") ||
    t.includes("wanted to be worshipped")
  );
}

function wordsEnactment(tag: string, prot: ProtPronouns): Pick<CustomerDesireBeat, "enactment" | "partnerAction" | "dialogueHooks" | "qcCheck"> {
  if (isLiteralWordsChip(tag)) {
    return {
      enactment: `Specific phrasing from this tag must appear in PERFORM dialogue — written out in full while partner touches ${prot.obj}.`,
      partnerAction: "speaks the requested words while acting on ${prot.obj}",
      dialogueHooks: [`(use the specific phrasing implied by: "${tag}")`],
      qcCheck: `dialogue in PERFORM reflects "${tag}" with actual spoken lines`,
    };
  }
  return {
    enactment: `Partner embodies this verbal desire in PERFORM — praise, narration, or dirty talk WHILE acting on ${prot.obj}. Speaking the chip label alone is not enough.`,
    partnerAction: "delivers the requested words through commands, praise, or description during physical escalation",
    dialogueHooks: [`"Good ${prot.sub.toLowerCase() === "they" ? "one" : prot.sub.toLowerCase() === "he" ? "boy" : "girl"}."`, `"Tell me what you feel."`, `"You wanted to hear this."`],
    qcCheck: `verbal desire from "${tag}" enacted in partner dialogue during PERFORM action`,
  };
}

function buildChipLifecycle(
  tag: string,
  bucket: DesireTagBucket,
  prot: ProtPronouns,
  partnerAction: string,
  dialogueHooks: string[],
): Pick<CustomerDesireBeat, "foreshadow" | "negotiate" | "actBeats"> {
  const t = tag.toLowerCase();
  const subLc = prot.sub.toLowerCase();

  if (t.includes("surrender") || t.includes("powerless")) {
    return {
      foreshadow: `Power dynamic in banter — who leads, who yields; subtext of giving control (no restraint yet)`,
      negotiate: `Partner tests surrender in words: "You'd let me take over?" / ${prot.sub} admits want; partner previews control without full enactment`,
      actBeats: [
        "OFFER: partner names what ${prot.sub} asked for",
        "ACT: command stillness or position — hands back, don't move, slower",
        "REACT: ${prot.sub} complies in one word or breath",
        "DEEPEN: partner praises compliance while escalating — sensation in dirty talk",
      ],
    };
  }
  if (t.includes("blindfold")) {
    return {
      foreshadow: `Trust and sight teased in conversation — "What if you couldn't see me?"`,
      negotiate: `Partner asks permission; ${prot.sub} agrees; partner describes what will happen before touching`,
      actBeats: [
        "OFFER: partner confirms ${prot.obj} wants this",
        "ACT: blindfold applied in dialogue — fabric, darkness, stillness",
        "REACT: ${prot.sub} speaks from sensation not sight",
        "DEEPEN: partner controls pace using sound and touch; praise in speech",
      ],
    };
  }
  if (t.includes("tied") || t.includes("restraint") || t.includes("wrist")) {
    return {
      foreshadow: `Restriction hinted — "I could keep you right here" without binding yet`,
      negotiate: `Partner asks if ${prot.obj} would stay still; tests trust in speech`,
      actBeats: [
        "OFFER: partner names the fantasy",
        "ACT: binding applied; partner tests ${prot.obj} cannot move",
        "REACT: ${prot.sub} strains or submits in dialogue",
        "DEEPEN: every touch framed by restraint in partner speech",
      ],
    };
  }
  if (t.includes("praised") || t.includes("worship")) {
    return {
      foreshadow: `Compliments with edge — partner notices what ${prot.sub} is holding back`,
      negotiate: `"Tell me what you need to hear" / partner mirrors desire without full sex`,
      actBeats: [
        "OFFER: partner promises to say what ${prot.obj} needs",
        "ACT: praise during touch — specific, not generic",
        "REACT: ${prot.sub} responds to words while body reacts",
        "DEEPEN: praise escalates with intensity — 'good' becomes ownership language",
      ],
    };
  }
  if (t.includes("spank")) {
    return {
      foreshadow: `Playful threat or challenge in banter — consequence implied`,
      negotiate: `Partner asks if ${prot.obj} wants it; ${prot.sub} admits; partner sets terms in speech`,
      actBeats: [
        "OFFER: partner confirms consent in dialogue",
        "ACT: strike + sound; partner checks in or commands between",
        "REACT: ${prot.sub} counts or gasps in speech",
        "DEEPEN: partner links impact to desire in dirty talk",
      ],
    };
  }
  if (t.includes("kneel")) {
    return {
      foreshadow: `Height and position referenced — looking up, being below`,
      negotiate: `"Would you kneel for me?" — asked in dialogue, not yet performed`,
      actBeats: [
        "OFFER: partner invites or commands",
        "ACT: ${prot.sub} kneels; partner maintains eye line or touch from above",
        "REACT: ${prot.sub} speaks from lowered position",
        "DEEPEN: scene plays from kneeling — commands and praise",
      ],
    };
  }
  if (t.includes("edged") || t.includes("not to move") || t.includes("still")) {
    return {
      foreshadow: `Pace and denial teased — "I might not let you"`,
      negotiate: `Partner previews control of pace; ${prot.sub} agrees to follow`,
      actBeats: [
        "OFFER: partner states the rule in dialogue",
        "ACT: partner controls pace — brings close, withdraws, commands stillness",
        "REACT: ${prot.sub} begs or breathes compliance",
        "DEEPEN: denial repeated until partner allows release",
      ],
    };
  }
  if (bucket === "emotional_state") {
    return {
      foreshadow: `Emotional tone of "${tag}" in how they speak — vulnerability, charge, or pull`,
      negotiate: `Partner names what they see in ${prot.obj}; ${prot.sub} admits the feeling`,
      actBeats: [
        `OFFER: partner reflects the feeling`,
        `ACT: partner's behaviour makes ${prot.obj} feel ${tag.toLowerCase()}`,
        `REACT: ${prot.sub} names it in speech`,
        `DEEPEN: feeling sustained through dialogue during touch`,
      ],
    };
  }
  if (bucket === "fantasy") {
    return {
      foreshadow: `Fantasy tone of "${tag}" in situation talk — rules of this world, impossibility, charge`,
      negotiate: `Characters acknowledge the fantasy frame in dialogue before bodies cross`,
      actBeats: [
        `OFFER: partner leans into fantasy register`,
        `ACT: fantasy shapes how partner commands and touches`,
        `REACT: ${prot.sub} speaks inside the fantasy`,
        `DEEPEN: world-rules or impossible charge sustained in dirty talk`,
      ],
    };
  }
  if (bucket === "words" && isLiteralWordsChip(tag)) {
    return {
      foreshadow: `Verbal theme hinted — partner almost says the line`,
      negotiate: `Partner asks what ${prot.obj} wants to hear; ${prot.sub} asks explicitly`,
      actBeats: [
        "OFFER: partner promises the words",
        "ACT: exact requested phrasing spoken during touch",
        "REACT: ${prot.sub} responds to hearing it",
        "DEEPEN: phrase repeated with escalation",
      ],
    };
  }

  const hook = dialogueHooks[0] ?? `"I know what you want."`;
  return {
    foreshadow: `Theme of "${tag}" in subtext — situation talk, not the chip label verbatim`,
    negotiate: `Partner tests the desire in dialogue; ${prot.sub} confesses; partner previews: ${hook}`,
    actBeats: [
      `OFFER: partner names what ${prot.sub} chose`,
      `ACT: ${partnerAction}`,
      `REACT: ${prot.sub} responds while it happens`,
      `DEEPEN: sensation and want in partner dirty talk — not narrator summary`,
    ],
  };
}

function substituteLifecycle(
  lc: Pick<CustomerDesireBeat, "foreshadow" | "negotiate" | "actBeats">,
  prot: ProtPronouns,
): Pick<CustomerDesireBeat, "foreshadow" | "negotiate" | "actBeats"> {
  const sub = (s: string) =>
    s.replace(/\$\{prot\.obj\}/g, prot.obj).replace(/\$\{prot\.sub\}/g, prot.sub);
  return {
    foreshadow: sub(lc.foreshadow),
    negotiate: sub(lc.negotiate),
    actBeats: lc.actBeats.map(sub),
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

  const lifecycle = substituteLifecycle(
    buildChipLifecycle(tag, bucket, prot, base.partnerAction, base.dialogueHooks),
    prot,
  );

  return {
    tag,
    bucket,
    setupPhase,
    enactPhase,
    enactment: base.enactment.replace(/\$\{prot\.obj\}/g, prot.obj).replace(/\$\{prot\.sub\}/g, prot.sub),
    partnerAction: base.partnerAction.replace(/\$\{prot\.obj\}/g, prot.obj).replace(/\$\{prot\.sub\}/g, prot.sub).replace(/\$\{subLc\}/g, subLc),
    dialogueHooks: base.dialogueHooks,
    qcCheck: base.qcCheck,
    ...lifecycle,
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
  pairing?: string;
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
      situationStakes = adaptTextForPairing(sit.internalInject, input.pairing);
      situationLabel = sit.label;
    }
  }

  const declareTags = enactments.filter((b) => b.setupPhase === "DECLARE");

  const declareDeclaration = customerDesireTags.length
    ? `DECLARE — DESIRE NEGOTIATION (not verbatim echo): Characters negotiate Make it yours choices in dedicated conversation blocks. Partner TESTS each desire in speech ("You'd let me…?" / "You want me to…?"); ${prot.sub} confesses. Do NOT parrot chip labels — negotiate the dynamic. Tags to develop: ${declareTags.map((b) => `"${b.tag}"`).join(", ") || customerDesireTags.map((t) => `"${t}"`).join(", ")}.`
    : "";

  const performLines = enactments
    .filter((b) => b.enactPhase === "PERFORM")
    .map((b, i) => `${i + 1}. "${b.tag}" — ${b.actBeats.join(" → ")}`)
    .join("\n");

  const performSpine = customerDesireTags.length
    ? `CUSTOMER FANTASY SCENE (PERFORM SPINE) — non-negotiable:\nPERFORM is one continuous scene. Each chip is a mini-scene: OFFER → ACT → REACT → DEEPEN. Partner acts; narrator bridges (max 1–2 sentences between dialogue blocks). SAY ≠ ENACT — chip labels were named in DECLARE; PERFORM shows doing.\n${performLines || "(no customer chips — infer from scenario)"}`
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
    parts.push(`3. CUSTOMER FANTASY CONTRACT (Act IV · Make it yours) — CHIP LIFECYCLE (foreshadow FRAME → negotiate DECLARE → enact PERFORM):\n${spine.customer_enactments.map((b) => `  • "${b.tag}" [${b.bucket}] → FRAME: ${b.foreshadow} | DECLARE: ${b.negotiate} | PERFORM: ${b.actBeats.join(" → ")}`).join("\n")}`);
    if (spine.declare_desire_declaration) parts.push(spine.declare_desire_declaration);
    if (spine.perform_spine) parts.push(spine.perform_spine);
  }

  parts.push(`
SCENE_PLAN EXTENSIONS — for each scene in scene_plan also include:
  • customer_desire_beats: array of tag strings that MUST fire in this scene (from Make it yours)
  • situation_beats: array of short phrases for how situation stakes appear in this scene (empty if no situation)
  • fantasy_enactment_spine: per-phase chip lifecycle — foreshadow in FRAME, negotiate in DECLARE, enact in PERFORM

RULES:
  • Every customer_desire_tags entry must appear in at least one scene's customer_desire_beats
  • Chips progress: foreshadow (FRAME) → negotiate (DECLARE) → enact (PERFORM) — each phase adds a layer, never repeat the same line
  • Situation stakes in quoted FRAME dialogue + threaded through DECLARE and PERFORM
  • PERFORM: one mini-scene per chip in order — partner ACTS, narrator only glues`);

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
    `CHIP LIFECYCLE — SAY ≠ ENACT:
  • FRAME: foreshadow chip themes in situation conversation — no sex acts, no full enactment
  • DECLARE: negotiate desires in dialogue — partner tests in speech, ${spine.customer_desire_tags.length ? "listener confesses" : "characters confess"}
  • PERFORM: partner ACTS each chip (command → touch → compliance) — sensation in dirty talk, not narrator prose
  • Do NOT repeat chip label text in PERFORM without partner action in the same beat`,
    "ENACTMENT RULE: Chips are performed by the partner in dialogue and action — not only described by the narrator. Follow scene_plan.customer_desire_beats and fantasy_enactment_spine per scene.",
  );

  return lines.join("\n\n");
}

/** Conversation-block structure for Express screenplay beats. */
export function buildConversationBlockContract(phase: string, chipCount = 0): string {
  const p = phase.toUpperCase();
  if (p === "FRAME") {
    return `CONVERSATION BLOCKS — FRAME (mandatory):
- Include 1 dedicated dialogue block: 6–10 consecutive quoted lines with NO narrator interrupting mid-block.
- Situation stakes must live in what they SAY (risk, forbidden, professional cost) — not narrator-only.
- Foreshadow customer chip themes in subtext; do NOT name sex-chip labels verbatim.
- Bookend each block with max 1–2 narrator sentences (where they are / what shifted).`;
  }
  if (p === "DECLARE") {
    return `CONVERSATION BLOCKS — DECLARE (mandatory):
- Include 2 dedicated dialogue blocks (6–10 quoted lines each): (1) tension/risk, (2) desire negotiation.
- Partner TESTS each chip in speech — "You'd let me…?" — listener confesses; no blindfold on body yet.
- Do NOT verbatim-echo chip menu text; negotiate the dynamic.
- Narrator max 1–2 sentences between blocks only.`;
  }
  if (p === "PERFORM") {
    const perChip = chipCount > 0 ? chipCount : "each customer";
    return `CONVERSATION BLOCKS — PERFORM (mandatory):
- One dialogue cluster per chip (${perChip}): OFFER → ACT → REACT → DEEPEN (6+ quoted lines per chip).
- Partner commands and acts THROUGH speech — listener responds while it happens.
- Move sensation into dirty talk ("I can feel you…") — NOT narrator body description.
- SAY ≠ ENACT: chip labels were negotiated in DECLARE; PERFORM shows doing.
- Narrator max 1–2 sentences between chip clusters.`;
  }
  if (p === "LAND") {
    return `CONVERSATION BLOCKS — LAND:
- Include 1 short dialogue exchange (4–6 lines) — aftermath talk, not essay.
- Reference what physically happened; ending chips as behaviour in speech.`;
  }
  return "";
}

export function buildPhaseChipLifecycleBlock(phase: string, beats: CustomerDesireBeat[]): string {
  if (!beats.length) return "";
  const p = phase.toUpperCase();
  if (p === "FRAME") {
    return beats.map((b) => `  • "${b.tag}" — FORESHADOW: ${b.foreshadow}`).join("\n");
  }
  if (p === "DECLARE") {
    return beats.map((b) => `  • "${b.tag}" — NEGOTIATE: ${b.negotiate}`).join("\n");
  }
  if (p === "PERFORM") {
    return beats
      .filter((b) => b.enactPhase === "PERFORM")
      .map((b, i) => `  CHIP ${i + 1} "${b.tag}": ${b.actBeats.join(" → ")}`)
      .join("\n");
  }
  if (p === "LAND") {
    return beats
      .filter((b) => b.enactPhase === "LAND")
      .map((b) => `  • "${b.tag}" — reflect in quiet dialogue`)
      .join("\n");
  }
  return "";
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
    const relevantBeats = spine.customer_enactments.filter((b) => {
      if (b.setupPhase === phase) return true;
      if (b.enactPhase === phase) return true;
      if (phase === "FRAME" && (b.bucket === "fantasy" || b.bucket === "emotional_state" || b.bucket === "physical" || b.bucket === "words" || b.bucket === "general")) return true;
      if (phase === "LAND" && b.bucket === "ending") return true;
      if (phase === "DECLARE" && b.bucket === "emotional_state") return true;
      return false;
    });
    const desireBeats = relevantBeats.map((b) => b.tag);

    const situationBeats =
      spine.situation_stakes && ["FRAME", "DECLARE", "PERFORM"].includes(phase)
        ? situationPhrases
        : [];

    const lifecycleBlock = buildPhaseChipLifecycleBlock(phase, relevantBeats);
    let fantasyEnactmentSpine = scene.fantasy_enactment_spine;
    if (lifecycleBlock) {
      fantasyEnactmentSpine = lifecycleBlock;
    }

    const goalSuffix =
      phase === "PERFORM" && desireBeats.length
        ? ` [Enact in order: ${desireBeats.join(" → ")}]`
        : phase === "DECLARE" && desireBeats.length
          ? ` [Negotiate in dialogue: ${desireBeats.join(", ")}]`
          : phase === "FRAME" && desireBeats.length
            ? ` [Foreshadow in conversation: ${desireBeats.slice(0, 4).join(", ")}${desireBeats.length > 4 ? "…" : ""}]`
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
function extractQuotedText(text: string): string {
  return [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "").join(" ").toLowerCase();
}

function tagActEnactedInPerform(tagLc: string, performText: string, beat: CustomerDesireBeat): boolean {
  if (tagLc.includes("blindfold")) {
    return /blindfold|blind-fold|eyes covered|couldn't see|can't see|darkness over/.test(performText);
  }
  if (tagLc.includes("tied") || tagLc.includes("restraint") || tagLc.includes("wrist")) {
    return /tied|bound|restraint|rope|wrists.*(held|fixed|pinned)/.test(performText);
  }
  if (tagLc.includes("spank")) {
    return /spank|palm.*(ass|cheek|behind)|slap/.test(performText);
  }
  if (tagLc.includes("kneel")) {
    return /kneel|on (your|her|his|their) knees/.test(performText);
  }
  if (tagLc.includes("surrender") || tagLc.includes("powerless")) {
    return /don't move|stay still|hands behind|let me|give me|compliance|still for me|i said still/.test(performText);
  }
  if (tagLc.includes("praised") || tagLc.includes("worship")) {
    return /good girl|good boy|good (one|pet)|perfect|beautiful|praise|proud of you|that's my/.test(performText);
  }
  if (tagLc.includes("edged") || tagLc.includes("not yet")) {
    return /not yet|don't come|ask me|until i say|hold it/.test(performText);
  }
  if (beat.bucket === "words" && isLiteralWordsChip(beat.tag)) {
    return (performText.match(/"/g) ?? []).length >= 6;
  }
  if (beat.bucket === "emotional_state" || beat.bucket === "fantasy" || beat.bucket === "general") {
    const keywords = tagLc.split(/\s+/).filter((w) => w.length > 4);
    const hasKeyword = keywords.some((w) => performText.includes(w));
    const hasActLanguage = /don't move|stay|kneel|look at me|let me|tell me|good |hands |slower|stop|wait/.test(performText);
    return hasKeyword && hasActLanguage;
  }
  return tagLc.split(/\s+/).some((w) => w.length > 5 && performText.includes(w));
}

function isLabelOnlyEnactment(tag: string, performText: string): boolean {
  const tagWords = tag.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  if (!tagWords.length) return false;
  const inQuotes = extractQuotedText(performText);
  const tagInQuotes = tagWords.filter((w) => inQuotes.includes(w)).length >= Math.min(2, tagWords.length);
  const hasActVerbs = /don't move|stay still|hands behind|kneel|blindfold|tied|spank|good girl|good boy|let me|i said|look at me/.test(performText);
  return tagInQuotes && !hasActVerbs;
}

export function validateSituationStakesInFrame(
  scenes: Array<{ heading?: string; text: string }>,
  spine: FantasySpine,
): { ok: boolean; message?: string } {
  if (!spine.situation_stakes) return { ok: true };
  const frameScene = scenes.find((s, i) => /frame/i.test(s.heading ?? "") || i === 0);
  if (!frameScene) return { ok: true };
  const quoted = extractQuotedText(frameScene.text);
  if (quoted.length < 20) {
    return { ok: false, message: "Situation stakes not present in quoted FRAME dialogue" };
  }
  const riskPattern = /shouldn't|can't|if anyone|door|office|forbidden|risk|catch|wrong|professional|not supposed|someone|hear|see us/.test(quoted);
  return riskPattern ? { ok: true } : { ok: false, message: "FRAME dialogue lacks situation risk/forbidden language" };
}

export function scoreCustomerDesireCompliance(
  scenes: Array<{ heading?: string; text: string }>,
  spine: FantasySpine,
  scenePlan: Array<{ phase?: string }> = [],
): { score: number; failures: string[]; passes: string[] } {
  const failures: string[] = [];
  const passes: string[] = [];

  const performText = scenes
    .filter((s, i) => /perform/i.test(s.heading ?? "") || i === 2)
    .map((s) => s.text)
    .join("\n")
    .toLowerCase();

  for (const beat of spine.customer_enactments) {
    if (beat.enactPhase !== "PERFORM" && beat.bucket !== "physical" && beat.bucket !== "words") continue;
    if (beat.bucket === "tone" || beat.bucket === "pacing" || beat.bucket === "ending") continue;

    const tagLc = beat.tag.toLowerCase();
    let found = tagActEnactedInPerform(tagLc, performText, beat);

    if (found && isLabelOnlyEnactment(beat.tag, performText)) {
      failures.push(`${beat.tag}: label echoed without partner action`);
      continue;
    }

    if (found) passes.push(beat.tag);
    else failures.push(beat.tag);
  }

  const enactable = spine.customer_enactments.filter(
    (b) => b.enactPhase === "PERFORM" && b.bucket !== "tone" && b.bucket !== "pacing",
  );
  const total = enactable.length;
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

  const situationFrame = validateSituationStakesInFrame(scenes, spine);
  if (!situationFrame.ok && situationFrame.message) {
    failures.push(situationFrame.message);
    score = Math.min(score, 7);
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
      `Situation compliance (Act IV The situation) — stakes from "${spine.situation_label}" must appear in quoted FRAME dialogue AND thread through DECLARE and PERFORM.`,
    );
  }
  if (spine.scenario_tags.length) {
    lines.push(`Scenario frame tags present as tension: ${spine.scenario_tags.join(", ")}`);
  }
  return lines;
}
