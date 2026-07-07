/**
 * ElevenLabs TTS — narrator turbo, character lines with v3 tags use eleven_v3.
 * Mirrors src/lib/audioVocal (production engine).
 */

const ALLOWED_TAGS = [
  "breathless",
  "sighs",
  "sighs softly",
  "gasps",
  "gasps softly",
  "groans softly",
  "whispers",
  "moans softly",
];

const TAG_PATTERN = new RegExp(
  `\\[(?:${ALLOWED_TAGS.map((t) => t.replace(/\s+/g, "\\s+")).join("|")})\\]`,
  "gi",
);

export function hasV3AudioTags(text) {
  TAG_PATTERN.lastIndex = 0;
  return TAG_PATTERN.test(text);
}

export function stripV3AudioTags(text) {
  return text
    .replace(TAG_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const V3_CHAR_STABILITY = 0.32;
const V3_CHAR_STYLE_BOOST = 0.12;

/**
 * @param {string} voiceId
 * @param {string} text
 * @param {{ role?: 'NARRATOR'|'CHAR', style?: number, stability?: number, vocalEffects?: boolean, apiKey: string }} opts
 */
export async function hybridTts(voiceId, text, opts) {
  const {
    role = "NARRATOR",
    style = 0.25,
    stability = 0.45,
    vocalEffects = true,
    apiKey,
  } = opts;

  const useV3 =
    vocalEffects && role !== "NARRATOR" && hasV3AudioTags(text);
  const modelId = useV3 ? "eleven_v3" : "eleven_turbo_v2_5";
  const stab = useV3 ? V3_CHAR_STABILITY : stability;
  const effectiveStyle = useV3 ? Math.min(0.95, style + V3_CHAR_STYLE_BOOST) : style;
  const similarity = modelId === "eleven_v3" ? 0.88 : 0.8;

  const call = async (chunk, model) => {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: chunk,
        model_id: model,
        voice_settings: {
          stability: model === "eleven_v3" ? V3_CHAR_STABILITY : stab,
          similarity_boost: model === "eleven_v3" ? 0.88 : similarity,
          style: model === "eleven_v3" ? effectiveStyle : effectiveStyle,
          use_speaker_boost: true,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ElevenLabs (${model}) ${res.status}: ${err}`);
    }
    return Buffer.from(await res.arrayBuffer());
  };

  try {
    return await call(text, modelId);
  } catch (err) {
    if (modelId === "eleven_v3") {
      const stripped = stripV3AudioTags(text);
      if (stripped && stripped !== text) {
        console.warn(`    [tts] v3 failed — turbo fallback: ${stripped.slice(0, 48)}…`);
        return call(stripped, "eleven_turbo_v2_5");
      }
    }
    throw err;
  }
}
