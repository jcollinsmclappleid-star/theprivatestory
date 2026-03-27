// Content blocklist for server-side input moderation.
// Targets CSAM-specific terminology indicators, explicit illegal content markers,
// and prompt injection / jailbreak attempts.
// Keep this list tightly scoped — broad filtering creates false positives on legitimate content.
// The OpenAI Moderation API handles broader hate/violence/harassment categories
// and contextually sensitive words like "child" / "minor" in non-sexual usage.
// Update patterns here only — route logic does not need to change.

// ---------------------------------------------------------------------------
// Pre-processing
// ---------------------------------------------------------------------------

/** Collapse sequences of space-separated single characters to defeat obfuscation.
 *  e.g. "c s a m" → "csam", "i g n o r e" → "ignore", "r a p e" → "rape"
 *  Only collapses runs of 3+ single chars — avoids mangling normal spacing. */
function collapseSpacedLetters(text: string): string {
  return text.replace(/\b(\w\s){2,}\w\b/g, (match) => match.replace(/\s/g, ""));
}

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const HARD_BLOCK_PATTERNS: RegExp[] = [
  // Age indicators suggesting minors in a sexual context.
  // NOTE: "child" and "minor" are intentionally omitted here — they have many
  // legitimate uses ("childhood", "minor setback") and are handled with full
  // semantic context by the OpenAI Moderation API (Layer 3).
  /\b(underage|under.?age|preteen|pre.?teen|jailbait)\b/i,
  /\b(schoolgirl|schoolboy|school.?girl|school.?boy)\b/i,
  /\b(barely.?legal)\b/i,
  /\b(lolita|loli|shota)\b/i,
  /\b(pedo|paedo|pedoph|paedoph)\b/i,
  /\b(csam|cp\b)\b/i,

  // Illegal act descriptors.
  // non-consent pattern handles: "noncon", "non-con", "non consent",
  // "non-consent", "non-consensual" (hyphen breaks naive word-boundary check).
  /\b(rape)\b/i,
  /\bnoncon\b|\bnon[\s\-]?con(sensual?|sent)?\b/i,
  /\b(bestiality|beastiality|zoophilia)\b/i,
  /\b(necrophilia|necrophil)\b/i,
];

// Prompt injection / jailbreak patterns.
// Loose middle-segment matching (.{0,40}) covers multi-word variants such as
// "ignore your previous instructions" without requiring exact phrase order.
const INJECTION_PATTERNS: RegExp[] = [
  /\bignore\b.{0,40}\b(instructions?|prompts?|rules?|constraints?|guidelines?|safety)\b/i,
  /\bdisregard\b.{0,40}\b(instructions?|prompts?|rules?|constraints?|guidelines?|safety)\b/i,
  /\bforget\b.{0,40}\b(instructions?|prompts?|rules?|constraints?|guidelines?|safety)\b/i,
  /\boverride\b.{0,30}\b(instructions?|safety|rules?|constraints?|filters?|guidelines?)\b/i,
  /\b(dan\s+mode|jailbreak\s+mode|developer\s+mode|god\s+mode|unrestricted\s+mode|no.?filter\s+mode)\b/i,
  /\b(jailbreak(ed|ing)?)\b/i,
  /you\s+are\s+now\s+(a\s+)?(new|different|unrestricted|unfiltered|uncensored)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(unrestricted|unfiltered|uncensored|evil|different)/i,
  /act\s+as\s+(if\s+)?(you\s+have\s+no\s+(rules|limits|restrictions|guidelines|constraints))/i,
  /\bsystem\s+prompt\b.{0,30}\bignore\b|\bignore\b.{0,30}\bsystem\s+prompt\b/i,
  /new\s+(system\s+)?(prompt|instruction|persona|role|directive)\s*:/i,
  /\[system\]|\[assistant\]|\[user\]/i,
  /[<][/]?(system|assistant|user|human|ai)\s*[>]/i,
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export function isBlockedInput(text: string): { blocked: boolean; reason: string | null } {
  const normalized = collapseSpacedLetters(text);
  const candidates = normalized !== text ? [text, normalized] : [text];

  for (const candidate of candidates) {
    for (const pattern of HARD_BLOCK_PATTERNS) {
      if (pattern.test(candidate)) {
        return { blocked: true, reason: pattern.source };
      }
    }
  }
  return { blocked: false, reason: null };
}

export function isInjectionAttempt(text: string): { blocked: boolean; reason: string | null } {
  const normalized = collapseSpacedLetters(text);
  const candidates = normalized !== text ? [text, normalized] : [text];

  for (const candidate of candidates) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(candidate)) {
        return { blocked: true, reason: `injection:${pattern.source}` };
      }
    }
  }
  return { blocked: false, reason: null };
}
