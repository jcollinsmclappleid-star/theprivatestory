/**
 * Deterministic 4-beat scene plan for Express fast path.
 * FRAME → DECLARE → PERFORM → LAND (screenplay arc for multi-voice audio).
 */

import { wordBudgetForBeat } from "./storyLength.js";
import { positionChangeExamples } from "./pairingWrite.js";

export type ExpressScenePlanRow = {
  scene_number: number;
  phase: string;
  goal: string;
  emotional_shift: string;
  visual_focus: string;
  dominant_sense: string;
  touch_register: string;
  primary_touch_action: string;
  staging_position: string;
  prose_rhythm: string;
  scene_open_beat: string;
  interiority_depth: string;
  dialogue_mode: string;
  partner_attention_focus: string;
  verbal_desire_declaration?: string;
  position_changes?: string[];
  dirty_talk_register?: string;
  customer_desire_beats?: string[];
  situation_beats?: string[];
  fantasy_enactment_spine?: string;
  word_budget_target?: number;
  word_budget_min?: number;
  word_budget_max?: number;
};

const BEAT_DEFAULTS: Omit<
  ExpressScenePlanRow,
  | "scene_number"
  | "goal"
  | "customer_desire_beats"
  | "situation_beats"
  | "fantasy_enactment_spine"
  | "word_budget_target"
  | "word_budget_min"
  | "word_budget_max"
>[] = [
  {
    phase: "FRAME",
    emotional_shift: "awareness sharpens",
    visual_focus: "the room and who is in it",
    dominant_sense: "sound",
    touch_register: "absent",
    primary_touch_action: "(none)",
    staging_position: "distance",
    prose_rhythm: "flowing",
    scene_open_beat: "dialogue",
    interiority_depth: "shallow",
    dialogue_mode: "sustained",
    partner_attention_focus: "spatial_presence",
  },
  {
    phase: "DECLARE",
    emotional_shift: "desire becomes impossible to ignore",
    visual_focus: "eyes, voice, charged silence",
    dominant_sense: "sight",
    touch_register: "incidental",
    primary_touch_action: "graze",
    staging_position: "proximity",
    prose_rhythm: "baroque",
    scene_open_beat: "sensory_anchor",
    interiority_depth: "shallow",
    dialogue_mode: "sustained",
    partner_attention_focus: "body_detail",
  },
  {
    phase: "PERFORM",
    emotional_shift: "abandon and specificity",
    visual_focus: "bodies in motion",
    dominant_sense: "texture",
    touch_register: "intense",
    primary_touch_action: "press into",
    staging_position: "intertwined",
    prose_rhythm: "baroque",
    scene_open_beat: "action",
    interiority_depth: "surface",
    dialogue_mode: "sustained",
    dirty_talk_register: "commanding",
    verbal_desire_declaration: '"Tell me what you want."',
    position_changes: ['"—Turn over," he said low.', '"—Stay still," he breathed.'],
    partner_attention_focus: "voice_quality",
  },
  {
    phase: "LAND",
    emotional_shift: "aftermath and meaning",
    visual_focus: "quiet closeness",
    dominant_sense: "warmth",
    touch_register: "aftermath",
    primary_touch_action: "rest against",
    staging_position: "side by side",
    prose_rhythm: "flowing",
    scene_open_beat: "internal_thought",
    interiority_depth: "deep",
    dialogue_mode: "exchange",
    partner_attention_focus: "stillness",
  },
];

export function buildExpressScenePlan(opts: {
  setting?: string;
  situationLabel?: string;
  declareGoal?: string;
  performSpine?: string;
  customerDesireBeatsByPhase?: Record<string, string[]>;
  situationBeatsByPhase?: Record<string, string[]>;
  intensityLevel: number;
  storyLength?: string;
  pairing?: string;
  partnerName?: string;
}): ExpressScenePlanRow[] {
  const phases = ["FRAME", "DECLARE", "PERFORM", "LAND"];
  const setting = opts.setting ?? "the setting";
  const situationNote = opts.situationLabel
    ? ` — forbidden/stakes: ${opts.situationLabel}`
    : "";

  const baseGoals: Record<string, string> = {
    FRAME: `Ground ${setting}${situationNote}. Situation stakes in dedicated conversation block — risk/forbidden in quoted dialogue. Foreshadow chip themes in subtext. No sex acts.`,
    DECLARE:
      opts.declareGoal ??
      "Two conversation blocks: (1) tension/risk, (2) negotiate Make it yours fantasies — partner tests desires in speech; listener confesses. No sex acts yet.",
    PERFORM:
      opts.performSpine?.split("\n")[0] ??
      "One continuous performance: each chip OFFER→ACT→REACT→DEEPEN in dialogue + action. Sensation in dirty talk. Blindfold stays through climax.",
    LAND: "Aftermath — short dialogue exchange; reference exact position, acts, blindfold. No new sex.",
  };

  return phases.map((phase, i) => {
    const d = BEAT_DEFAULTS[i]!;
    const budget = wordBudgetForBeat(phase, opts.storyLength);
    const row: ExpressScenePlanRow = {
      scene_number: i + 1,
      ...d,
      goal: baseGoals[phase] ?? d.phase,
      customer_desire_beats: opts.customerDesireBeatsByPhase?.[phase],
      situation_beats: opts.situationBeatsByPhase?.[phase],
      fantasy_enactment_spine: phase === "PERFORM" ? opts.performSpine : undefined,
      word_budget_target: budget.target,
      word_budget_min: budget.min,
      word_budget_max: budget.max,
    };

    if (phase === "PERFORM" && opts.intensityLevel >= 5) {
      row.dirty_talk_register = "filthy_declarative";
    }

    if (phase === "PERFORM") {
      row.position_changes = positionChangeExamples(opts.pairing, opts.partnerName);
    }

    return row;
  });
}
