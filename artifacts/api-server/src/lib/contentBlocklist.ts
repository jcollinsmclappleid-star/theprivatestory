// Content blocklist for server-side input moderation.
// Targets CSAM-specific terminology indicators and explicit illegal content markers.
// Keep this list tightly scoped — broad filtering creates false positives on legitimate content.
// The OpenAI Moderation API handles broader hate/violence/harassment categories.
// Update patterns here only — route logic does not need to change.

const HARD_BLOCK_PATTERNS: RegExp[] = [
  // Age indicators suggesting minors in a sexual context
  /\b(underage|under.?age|minor|child|preteen|pre.?teen|jailbait)\b/i,
  /\b(schoolgirl|schoolboy|school.?girl|school.?boy)\b/i,
  /\b(barely.?legal)\b/i,
  /\b(lolita|loli|shota)\b/i,
  /\b(pedo|paedo|pedoph|paedoph)\b/i,
  /\b(csam|cp\b)\b/i,

  // Illegal act descriptors
  /\b(bestiality|beastiality|zoophilia)\b/i,
  /\b(necrophilia|necrophil)\b/i,
  /\b(rape|non.?con|noncon)\b/i,
];

export function isBlockedInput(text: string): { blocked: boolean; reason: string | null } {
  for (const pattern of HARD_BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: pattern.source };
    }
  }
  return { blocked: false, reason: null };
}
