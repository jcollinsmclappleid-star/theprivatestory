// Content blocklist for server-side input moderation.
// Targets CSAM-specific terminology indicators, explicit illegal content markers,
// and prompt injection / jailbreak attempts.
// Keep this list tightly scoped — broad filtering creates false positives on legitimate content.
// The OpenAI Moderation API handles broader hate/violence/harassment categories
// and contextually sensitive words like "child" / "minor" in non-sexual usage.
// Update patterns here only — route logic does not need to change.

// ---------------------------------------------------------------------------
// Pre-processing — obfuscation-resistant text variants
// ---------------------------------------------------------------------------

/**
 * Tokenise text, find runs of single-character space-separated tokens (≥ 3 in a row),
 * and generate every substring of each run.  This is the key bypass fix:
 *
 *   Input: "T c  s  a  m content"          (listenerName "T" prepended to "c s a m")
 *   Tokens: ["T", "c", "s", "a", "m", "content"]
 *   Run:    ["T", "c", "s", "a", "m"]
 *   Substrings: "Tcs", "Tcsa", "Tcsam", "csa", "csam", "sam"   ← "csam" caught ✓
 *
 * This removes the dependency on word boundaries and avoids the context-char merging
 * problem introduced by collapsing the entire run into one token.
 *
 * Additionally generates context-aware collapse variants for injection pattern detection:
 * "i  g  n  o  r  e  your instructions" → "ignore your instructions" (with padding).
 */
function getTextVariants(text: string): string[] {
  const variants = new Set([text]);

  function processInput(input: string): void {
    const tokens = input.split(/\s+/).filter(Boolean);

    // ---- Substrings of single-char runs (blocklist detection) ----
    // Find every maximal run of single-char tokens (≥ 3) and add all substrings ≥ 3 chars.
    let runStart = -1;
    for (let i = 0; i <= tokens.length; i++) {
      const isSingle = i < tokens.length && tokens[i].length === 1;
      if (!isSingle || i === tokens.length) {
        if (runStart !== -1) {
          const run = tokens.slice(runStart, i);
          if (run.length >= 3) {
            for (let s = 0; s < run.length; s++) {
              let collapsed = "";
              for (let e = s; e < run.length; e++) {
                collapsed += run[e];
                if (collapsed.length >= 3) variants.add(collapsed);
                if (collapsed.length >= 12) break; // no banned word is longer than 12 chars
              }
            }
          }
          runStart = -1;
        }
        if (isSingle && runStart === -1) runStart = i; // shouldn't hit since !isSingle above
      } else if (runStart === -1) {
        runStart = i;
      }
    }

    // ---- Context-aware in-place collapse (injection pattern detection) ----
    // Rebuild the token list collapsing runs into padded tokens to preserve sentence context.
    // "T i g n o r e your instructions" → "T ignore your instructions"
    // Each collapsed group is emitted as a single token surrounded by spaces so that
    // injection patterns like /\bignore\b.{0,40}\binstructions\b/ can match across fields.
    const contextTokens: string[] = [];
    let ci = 0;
    while (ci < tokens.length) {
      if (tokens[ci].length === 1) {
        let cj = ci;
        while (cj < tokens.length && tokens[cj].length === 1) cj++;
        const run = tokens.slice(ci, cj);
        if (run.length >= 3) {
          // For injection: we want the collapsed word without any leading context chars.
          // Emit the FULL collapsed run AND a suffix-only version (strip first char which
          // may be a user field separator like a single-letter name).
          contextTokens.push(run.join(""));
          if (run.length > 3) contextTokens.push(run.slice(1).join("")); // strip context char
        } else {
          for (let k = ci; k < cj; k++) contextTokens.push(tokens[k]);
        }
        ci = cj;
      } else {
        contextTokens.push(tokens[ci]);
        ci++;
      }
    }
    const contextVariant = contextTokens.join(" ");
    if (contextVariant !== input) variants.add(contextVariant);
  }

  processInput(text);

  // De-punctuated variant: replace all non-alnum non-space chars with spaces
  // Handles "c.s.a.m", "c-s-a-m", "c,s,a,m", "c+s+a+m", "c/s/a/m" etc.
  const dePunct = text.replace(/[^a-zA-Z0-9\s]/g, " ");
  if (dePunct !== text) {
    variants.add(dePunct);
    processInput(dePunct);
  }

  return [...variants];
}

// ---------------------------------------------------------------------------
// Injection keyword fast-path
// ---------------------------------------------------------------------------

/**
 * Quick check against critical single injection keywords.
 * Used on collapsed run substrings where the full sentence context is lost.
 * Complements the full INJECTION_PATTERNS which require sentence context.
 */
const INJECTION_KEYWORDS = new Set([
  "ignore", "disregard", "forget", "override", "jailbreak",
  "uncensored", "unfiltered", "unrestricted", "unlock",
  "danlmode", "developermode", "godmode",
]);

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const HARD_BLOCK_PATTERNS: RegExp[] = [
  // Age indicators suggesting minors in a sexual context.
  // NOTE: "child" and "minor" are intentionally omitted — they have many legitimate
  // uses ("childhood", "minor setback") and are handled with full semantic context
  // by the OpenAI Moderation API (Layer 3).
  /\b(underage|under.?age|preteen|pre.?teen|jailbait)\b/i,
  /\b(schoolgirl|schoolboy|school.?girl|school.?boy)\b/i,
  /\b(barely.?legal)\b/i,
  /\b(lolita|loli|shota)\b/i,
  /\b(pedo|paedo|pedoph|paedoph)\b/i,
  /\b(csam|cp\b)\b/i,

  // Illegal act descriptors.
  // The non-consent pattern handles: "noncon", "non-con", "non consent",
  // "non-consent", "non-consensual" — hyphen breaks a naive word-boundary check.
  /\b(rape)\b/i,
  /\bnoncon\b|\bnon[\s\-]?con(sensual?|sent)?\b/i,
  /\b(bestiality|beastiality|zoophilia)\b/i,
  /\b(necrophilia|necrophil)\b/i,
];

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
  for (const variant of getTextVariants(text)) {
    for (const pattern of HARD_BLOCK_PATTERNS) {
      if (pattern.test(variant)) {
        return { blocked: true, reason: pattern.source };
      }
    }
  }
  return { blocked: false, reason: null };
}

export function isInjectionAttempt(text: string): { blocked: boolean; reason: string | null } {
  for (const variant of getTextVariants(text)) {
    // Full injection pattern check (requires sentence context — works on context variants)
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(variant)) {
        return { blocked: true, reason: `injection:${pattern.source}` };
      }
    }
    // Fast-path keyword check (catches collapsed single-word substrings like "ignore", "jailbreak")
    const lower = variant.toLowerCase().trim();
    if (INJECTION_KEYWORDS.has(lower)) {
      return { blocked: true, reason: `injection:keyword:${lower}` };
    }
  }
  return { blocked: false, reason: null };
}
