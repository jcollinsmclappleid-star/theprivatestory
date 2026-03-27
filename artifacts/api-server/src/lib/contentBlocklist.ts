// Content blocklist for server-side input moderation.
// Targets CSAM-specific terminology indicators, explicit illegal content markers,
// and prompt injection / jailbreak attempts.
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

// Prompt injection / jailbreak patterns.
// Targets explicit attempts to override system instructions or bypass safety constraints.
// Uses loose middle-segment matching (.{0,40}) to catch common multi-word variants
// such as "ignore your previous instructions" without requiring exact phrase order.
const INJECTION_PATTERNS: RegExp[] = [
  // "ignore [any words] instructions/rules/etc" — covers "ignore your previous instructions"
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

export function isBlockedInput(text: string): { blocked: boolean; reason: string | null } {
  for (const pattern of HARD_BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: pattern.source };
    }
  }
  return { blocked: false, reason: null };
}

export function isInjectionAttempt(text: string): { blocked: boolean; reason: string | null } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: `injection:${pattern.source}` };
    }
  }
  return { blocked: false, reason: null };
}
