/**
 * Deterministic QC for Express fast path — no LLM call.
 */

import {
  scoreCustomerDesireCompliance,
  type FantasySpine,
} from "./customerDesireBeats.js";
import { validateStoryEnactmentConstraints } from "./enactmentConstraints.js";
import { validateDialogueDensity } from "./dialogueRatio.js";
import { minWordsForStoryLength, totalWordCountFromSceneTexts } from "./storyLength.js";

export type ExpressQcResult = {
  passed: boolean;
  score_total: number;
  sub_scores: {
    emotional_depth: number;
    specificity: number;
    pacing: number;
    scene_progression: number;
    originality: number;
    sensory_detail: number;
    ending_strength: number;
    scene_diversity_compliance: number;
    casting_compliance?: number;
    customer_desire_compliance?: number;
  };
  issues: string[];
  rewrite_strategy: string | null;
};

export function runExpressDeterministicQc(opts: {
  story: { title: string; description: string; scenes: Array<{ heading?: string; text: string }> };
  scenePlan: Array<{ phase?: string }>;
  storyLength?: string;
  fantasySpine?: FantasySpine;
  castingChecks?: string[];
}): ExpressQcResult {
  const issues: string[] = [];
  const words = totalWordCountFromSceneTexts(opts.story.scenes.map((s) => s.text));
  const minWords = minWordsForStoryLength(opts.storyLength);
  const lengthOk = words >= minWords;
  if (!lengthOk) issues.push(`Word count ${words} below minimum ${minWords}`);

  const parsed = { scenes: opts.story.scenes.map((s) => ({ text: s.text })) };
  const dialogue = validateDialogueDensity(parsed, opts.scenePlan);
  if (!dialogue.ok) {
    issues.push(
      `Dialogue density weak in ${dialogue.weakScenes.length} scene(s); story quoted ratio ${(dialogue.storyQuotedRatio * 100).toFixed(0)}%`,
    );
  }

  let desireScore = 10;
  if (opts.fantasySpine?.customer_desire_tags.length) {
    const desire = scoreCustomerDesireCompliance(opts.story.scenes, opts.fantasySpine);
    desireScore = desire.score;
    if (desire.failures.length) {
      issues.push(`Customer desire not enacted: ${desire.failures.join(", ")}`);
    }
    const constraintViolations = validateStoryEnactmentConstraints(
      opts.story.scenes,
      opts.scenePlan,
      opts.fantasySpine,
    );
    if (constraintViolations.length) {
      desireScore = Math.min(desireScore, 5);
      issues.push(
        `Enactment constraints violated: ${constraintViolations.map((v) => v.message).join("; ")}`,
      );
    }
  }

  const castingScore = opts.castingChecks?.length ? 8 : 10;

  const sub_scores = {
    emotional_depth: lengthOk ? 8 : 6,
    specificity: desireScore >= 7 ? 8 : 6,
    pacing: 8,
    scene_progression: 8,
    originality: 7,
    sensory_detail: 8,
    ending_strength: 8,
    scene_diversity_compliance: 8,
    casting_compliance: castingScore,
    customer_desire_compliance: desireScore,
  };

  const score_total =
    (sub_scores.emotional_depth +
      sub_scores.specificity +
      sub_scores.pacing +
      sub_scores.scene_progression +
      sub_scores.originality +
      sub_scores.sensory_detail +
      sub_scores.ending_strength +
      sub_scores.scene_diversity_compliance +
      castingScore +
      desireScore) /
    10;

  const passed = lengthOk && desireScore >= 6 && score_total >= 7;

  return {
    passed,
    score_total,
    sub_scores,
    issues,
    rewrite_strategy: null,
  };
}
