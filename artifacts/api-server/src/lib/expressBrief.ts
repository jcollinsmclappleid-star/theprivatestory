/**
 * Express fast path — code-generated story brief (no LLM plan).
 * Mistral-only pipeline: one plan-equivalent in-process, then single write call.
 */

import { getSituationById } from "./situations.js";
import {
  attachFantasySpineToBrief,
  buildFantasySpine,
  type FantasySpine,
} from "./customerDesireBeats.js";
import { buildExpressScenePlan, type ExpressScenePlanRow } from "./expressScenePlan.js";
import { adaptTextForPairing, protPronounsFromPairing } from "./pairingWrite.js";

export type ExpressBriefInput = {
  listenerName?: string;
  partnerName?: string;
  mood?: string;
  intensity?: string;
  storyLength?: string;
  storyMode?: string;
  perspective?: string;
  setting?: string;
  dynamic?: string;
  chemistry?: string;
  whoIsHe?: string;
  pairing?: string;
  situationId?: string;
  scenarioTags?: string[];
  customerDesireTags?: string[];
  experienceTags?: string[];
  scenarioRoom?: string;
};

export type ExpressStoryBrief = {
  emotional_arc: string;
  relationship_dynamic: string;
  conflict_type: string;
  pacing_style: string;
  ending_type: string;
  sensory_palette: string[];
  point_of_view: string;
  voice_tone: string;
  scene_count: number;
  scene_plan: ExpressScenePlanRow[];
  recurring_motif: string;
  title_direction: string;
  image_style_direction: string;
  recommendation_tags: string[];
  quality_target: string;
  situation?: string;
  situationId?: string;
  fantasy_spine?: FantasySpine;
  customer_desire_tags?: string[];
  scenario_tags?: string[];
};


function sceneCountForLength(_storyLength?: string): number {
  return 4;
}

/** After Dark Express / customer funnel — skip LLM plan when structured Act IV inputs exist. */
export function shouldUseExpressFastPath(intake: ExpressBriefInput): boolean {
  if (process.env.EXPRESS_FAST_PATH === "0") return false;
  if (process.env.EXPRESS_FAST_PATH === "1") return true;
  return !!(
    intake.customerDesireTags?.length ||
    intake.scenarioTags?.length ||
    intake.situationId ||
    intake.scenarioRoom
  );
}

export function buildExpressBrief(intake: ExpressBriefInput): ExpressStoryBrief {
  const prot = protPronounsFromPairing(intake.pairing);
  const customerDesireTags = intake.customerDesireTags?.length
    ? intake.customerDesireTags
    : (!intake.scenarioTags?.length ? (intake.experienceTags ?? []) : []);
  const scenarioTags = (intake.scenarioTags ?? []).map((t) => adaptTextForPairing(t, intake.pairing));

  const spine = buildFantasySpine(
    {
      scenarioTags,
      customerDesireTags,
      situationId: intake.situationId,
      storyMode: intake.storyMode,
      dynamic: intake.dynamic,
      chemistry: intake.chemistry,
      setting: intake.setting,
      pairing: intake.pairing,
    },
    prot,
  );

  const beatsByPhase: Record<string, string[]> = {};
  for (const beat of spine.customer_enactments) {
    if (beat.setupPhase) {
      beatsByPhase[beat.setupPhase] = [...(beatsByPhase[beat.setupPhase] ?? []), beat.tag];
    }
    if (beat.enactPhase) {
      beatsByPhase[beat.enactPhase] = [...(beatsByPhase[beat.enactPhase] ?? []), beat.tag];
    }
  }

  const situationBeats: Record<string, string[]> = spine.situation_stakes
    ? {
        FRAME: ["situation stakes introduced"],
        DECLARE: ["forbidden/professional tension in speech"],
        PERFORM: ["risk felt during sex — stakes not forgotten"],
      }
    : {};

  const scenePlan = buildExpressScenePlan({
    setting: intake.setting,
    situationLabel: spine.situation_label,
    declareGoal: customerDesireTags.length
      ? `Name customer's chosen fantasies in dialogue: ${customerDesireTags.slice(0, 3).join("; ")}`
      : undefined,
    performSpine: spine.perform_spine,
    customerDesireBeatsByPhase: beatsByPhase,
    situationBeatsByPhase: situationBeats,
    intensityLevel: intensityLabelToLevel(intake.intensity),
    storyLength: intake.storyLength,
    pairing: intake.pairing,
    partnerName: intake.partnerName,
  });

  let brief: ExpressStoryBrief = {
    emotional_arc: "tension → vulnerability → release",
    relationship_dynamic: intake.chemistry || intake.dynamic || "charged mutual wanting",
    conflict_type: spine.situation_stakes ? "forbidden or high-stakes circumstance" : "desire held too long",
    pacing_style: intake.storyMode === "forbidden" ? "slow then sudden" : "even tension climbing",
    ending_type: "lingering and charged",
    sensory_palette: [intake.setting ?? "night air", "close heat", "held breath"],
    point_of_view: intake.perspective === "her" || intake.perspective === "his" ? "third person close" : "second person",
    voice_tone: `${intake.mood ?? "intimate"}, cinematic, adult`,
    scene_count: sceneCountForLength(intake.storyLength),
    scene_plan: scenePlan,
    recurring_motif: "the space between what is allowed and what is wanted",
    title_direction: "specific, emotionally charged, premium",
    image_style_direction:
      "hand-painted fine-art oil illustration, dark adult fantasy romance, moody candlelit tones, premium gallery fine art",
    recommendation_tags: [intake.mood ?? "Late Night", intake.storyMode ?? "After Dark", "Personal"],
    quality_target: "The listener feels their exact fantasy was performed — not described from a distance.",
    situationId: intake.situationId,
    fantasy_spine: spine,
    customer_desire_tags: spine.customer_desire_tags,
    scenario_tags: spine.scenario_tags,
  };

  if (intake.situationId) {
    const sit = getSituationById(intake.situationId);
    if (sit) brief.situation = sit.label;
  }

  return attachFantasySpineToBrief(brief, spine) as ExpressStoryBrief;
}

function intensityLabelToLevel(label?: string): number {
  const m: Record<string, number> = {
    Subtle: 1, Warm: 3, Elevated: 4, Explicit: 5, Intense: 5,
  };
  return m[label ?? "Warm"] ?? 4;
}

/** Smaller brief JSON for the write prompt — cuts tokens and latency. */
export function compactBriefForExpressWrite(brief: ExpressStoryBrief): Record<string, unknown> {
  return {
    emotional_arc: brief.emotional_arc,
    relationship_dynamic: brief.relationship_dynamic,
    ending_type: brief.ending_type,
    point_of_view: brief.point_of_view,
    voice_tone: brief.voice_tone,
    scene_count: brief.scene_count,
    recurring_motif: brief.recurring_motif,
    fantasy_spine: brief.fantasy_spine
      ? {
          scenario_frame: brief.fantasy_spine.scenario_frame,
          situation_stakes: brief.fantasy_spine.situation_stakes,
          declare_desire_declaration: brief.fantasy_spine.declare_desire_declaration,
          perform_spine: brief.fantasy_spine.perform_spine,
          customer_enactments: brief.fantasy_spine.customer_enactments.map((e) => ({
            tag: e.tag,
            setupPhase: e.setupPhase,
            enactPhase: e.enactPhase,
            enactment: e.enactment,
            dialogueHooks: e.dialogueHooks,
          })),
        }
      : undefined,
    scene_plan: brief.scene_plan.map((sp) => ({
      scene_number: sp.scene_number,
      phase: sp.phase,
      goal: sp.goal,
      emotional_shift: sp.emotional_shift,
      dominant_sense: sp.dominant_sense,
      touch_register: sp.touch_register,
      primary_touch_action: sp.primary_touch_action,
      staging_position: sp.staging_position,
      prose_rhythm: sp.prose_rhythm,
      scene_open_beat: sp.scene_open_beat,
      interiority_depth: sp.interiority_depth,
      dialogue_mode: sp.dialogue_mode,
      dirty_talk_register: sp.dirty_talk_register,
      verbal_desire_declaration: sp.verbal_desire_declaration,
      position_changes: sp.position_changes,
      customer_desire_beats: sp.customer_desire_beats,
      situation_beats: sp.situation_beats,
      fantasy_enactment_spine: sp.fantasy_enactment_spine,
      word_budget_target: sp.word_budget_target,
      word_budget_min: sp.word_budget_min,
      word_budget_max: sp.word_budget_max,
      partner_attention_focus: sp.partner_attention_focus,
    })),
  };
}
