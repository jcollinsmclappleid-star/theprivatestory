import { intensityToLevel } from "@workspace/intensity";
import { selectTtsModel, V3_CHAR_STABILITY, V3_CHAR_STYLE_BOOST, type ElevenLabsModelId, type TtsRole } from "./ttsModel.js";

export {
  ALLOWED_V3_AUDIO_TAGS,
  hasV3AudioTags,
  stripV3AudioTags,
  MAX_V3_TAGGED_LINES_PER_STORY,
  VOCAL_PERFORMANCE_PROMPT_BLOCK,
} from "./v3Tags.js";
export { selectTtsModel, V3_CHAR_STABILITY, V3_CHAR_STYLE_BOOST, type ElevenLabsModelId, type TtsRole };

/**
 * Vocal effects via Eleven v3 tags on character lines.
 * Enabled for Explicit+ (level ≥ 4) unless VOCAL_EFFECTS=0.
 */
export function isVocalEffectsEnabled(intensity?: string | null): boolean {
  if (process.env.VOCAL_EFFECTS === "0") return false;
  if (process.env.VOCAL_EFFECTS === "1") return true;
  const level = intensityToLevel(intensity ?? "Warm");
  return level >= 4;
}

export function resolveSegmentTts(
  role: TtsRole,
  spokenText: string,
  intensity: string | undefined,
  narratorStability: number,
  charStability: number,
): { modelId: ElevenLabsModelId; stability: number; styleBoost: number } {
  const vocal = isVocalEffectsEnabled(intensity);
  const modelId = selectTtsModel(role, spokenText, vocal);
  if (role === "NARRATOR") {
    return { modelId: "eleven_turbo_v2_5", stability: narratorStability, styleBoost: 0 };
  }
  if (modelId === "eleven_v3") {
    return { modelId, stability: V3_CHAR_STABILITY, styleBoost: V3_CHAR_STYLE_BOOST };
  }
  return { modelId, stability: charStability, styleBoost: 0 };
}
