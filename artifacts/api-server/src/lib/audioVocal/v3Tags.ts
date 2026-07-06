/**
 * ElevenLabs v3 audio tags — character dialogue only, intimate register.
 * No SFX library; same provider, performed reactions in character voice.
 */

/** Tags allowed in customer stories (subtle, not porn-loop). */
export const ALLOWED_V3_AUDIO_TAGS = [
  "breathless",
  "sighs",
  "sighs softly",
  "gasps",
  "gasps softly",
  "groans softly",
  "whispers",
  "moans softly",
] as const;

const TAG_PATTERN = new RegExp(
  `\\[(?:${ALLOWED_V3_AUDIO_TAGS.map((t) => t.replace(/\s+/g, "\\s+")).join("|")})\\]`,
  "gi",
);

/** True when text contains an allowed v3 performance tag. */
export function hasV3AudioTags(text: string): boolean {
  TAG_PATTERN.lastIndex = 0;
  return TAG_PATTERN.test(text);
}

/** Remove v3 tags for turbo fallback when v3 API rejects a line. */
export function stripV3AudioTags(text: string): string {
  return text
    .replace(TAG_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const MAX_V3_TAGGED_LINES_PER_STORY = 12;

export const VOCAL_PERFORMANCE_PROMPT_BLOCK = `
VOCAL PERFORMANCE (character quoted dialogue only — Explicit / Unrestrained IGNITE scenes):
You may place ElevenLabs performance tags in square brackets INSIDE quoted character lines only — sparingly (max 2 tagged lines per IGNITE scene, max ${MAX_V3_TAGGED_LINES_PER_STORY} per story).
Allowed tags only: [breathless], [sighs softly], [gasps softly], [groans softly], [whispers]
Example: "[breathless] Don't stop—" / "[gasps softly] Yes—there."
NEVER place these tags in narrator prose. NEVER use graphic or loop-style moaning — one brief tag per beat, then real words.
`.trim();
