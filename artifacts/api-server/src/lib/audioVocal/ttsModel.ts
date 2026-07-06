import { hasV3AudioTags } from "./v3Tags.js";

export type ElevenLabsModelId = "eleven_turbo_v2_5" | "eleven_v3";

export type TtsRole = "NARRATOR" | "CHAR_A" | "CHAR_B";

/** Narrator always turbo; character lines with v3 tags use eleven_v3 when vocal FX enabled. */
export function selectTtsModel(
  role: TtsRole,
  spokenText: string,
  vocalEffectsEnabled: boolean,
): ElevenLabsModelId {
  if (!vocalEffectsEnabled || role === "NARRATOR") return "eleven_turbo_v2_5";
  return hasV3AudioTags(spokenText) ? "eleven_v3" : "eleven_turbo_v2_5";
}

export const V3_CHAR_STABILITY = 0.32;
export const V3_CHAR_STYLE_BOOST = 0.12;
