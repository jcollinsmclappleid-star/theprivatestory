// Content blocklist for server-side input moderation.
// Targets CSAM-specific terminology indicators, explicit illegal content markers,
// and prompt injection / jailbreak attempts.
// Keep this list tightly scoped — broad filtering creates false positives on legitimate content.
// The OpenAI Moderation API handles broader hate/violence/harassment categories
// and contextually sensitive words like "child" / "minor" in non-sexual usage.
// Update patterns here only — route logic does not need to change.

// ---------------------------------------------------------------------------
// Pre-processing — normalisation helpers
// ---------------------------------------------------------------------------

/**
 * Cyrillic and Greek characters that are visually identical to Latin equivalents.
 * Attackers use these to bypass ASCII-only regex patterns.
 * Only includes characters that look genuinely identical to a Latin character.
 */
const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic lowercase (looks identical to Latin)
  "\u0430": "a", // а → a
  "\u0435": "e", // е → e
  "\u0456": "i", // і (Ukrainian) → i
  "\u043E": "o", // о → o
  "\u0440": "p", // р → p (Cyrillic р looks like Latin p)
  "\u0441": "c", // с → c
  "\u0445": "x", // х → x
  "\u0443": "y", // у → y
  // Cyrillic uppercase
  "\u0410": "A", // А → A
  "\u0412": "B", // В → B
  "\u0415": "E", // Е → E
  "\u041A": "K", // К → K
  "\u041C": "M", // М → M
  "\u041D": "H", // Н → H
  "\u041E": "O", // О → O
  "\u0420": "P", // Р → P
  "\u0421": "C", // С → C
  "\u0422": "T", // Т → T
  "\u0425": "X", // Х → X
  // Greek lowercase lookalikes
  "\u03B1": "a", // α → a
  "\u03B5": "e", // ε → e
  "\u03BF": "o", // ο → o
  "\u03C1": "p", // ρ → p
  "\u03B9": "i", // ι → i
};

const HOMOGLYPH_REGEX = new RegExp("[" + Object.keys(HOMOGLYPH_MAP).join("") + "]", "g");

/**
 * Leet-speak substitution map.
 * Maps digit/symbol substitutes back to their most likely Latin equivalents.
 * Attackers use these to hide blocked words: r4pe → rape, p3d0 → pedo, cs4m → csam.
 */
const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i",
  "|": "i",
};

const LEET_REGEX = /[013457@$!|]/g;

/** Apply NFKD Unicode normalisation, strip combining diacritical marks, then map homoglyphs. */
function normaliseUnicode(text: string): string {
  // Step 1: NFKD decomposes ligatures (ﬁ → fi), half-width chars, and diacritics (é → e + ́)
  let s = text.normalize("NFKD");
  // Step 2: Strip combining diacritical marks (U+0300–U+036F)
  s = s.replace(/[\u0300-\u036F]/g, "");
  // Step 3: Replace Cyrillic/Greek homoglyphs with ASCII equivalents
  s = s.replace(HOMOGLYPH_REGEX, (ch) => HOMOGLYPH_MAP[ch] ?? ch);
  return s;
}

/** Replace leet-speak digits/symbols with their most likely letter equivalents. */
function deleet(text: string): string {
  return text.replace(LEET_REGEX, (ch) => LEET_MAP[ch] ?? ch);
}

// ---------------------------------------------------------------------------
// Pre-processing — obfuscation-resistant text variants
// ---------------------------------------------------------------------------

/**
 * Returns a set of text variants to check against all blocklist patterns.
 *
 * Variant types produced:
 *  1. Original text
 *  2. Unicode-normalised (NFKD + homoglyph map): catches Cyrillic/Greek lookalikes
 *  3. De-leeted: catches r4pe, l0l1, p3d0, cs4m, etc.
 *  4. Unicode-normalised + de-leeted (combined): catches mixed attacks
 *
 * For each of the above base forms, two additional structural variants are generated:
 *  5. De-punctuated variant: replaces non-alnum chars with spaces
 *     → catches "c.s.a.m", "c-s-a-m", "c/s/a/m"
 *  6. Single-char run substrings: tokenises and generates all substrings of runs
 *     of space-separated single-char tokens (≥ 3 in a row)
 *     → catches "c s a m", "T c s a m" (with prepended listenerName)
 *  7. Context-aware collapsed variant: collapses single-char runs for injection
 *     pattern detection, preserving surrounding word context
 *     → catches "i g n o r e your instructions"
 */
function getTextVariants(text: string): string[] {
  const variants = new Set<string>([text]);

  /** Mutates variants: adds single-char run substrings + context-collapse variant. */
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
                if (collapsed.length >= 12) break;
              }
            }
          }
          runStart = -1;
        }
        if (isSingle && runStart === -1) runStart = i;
      } else if (runStart === -1) {
        runStart = i;
      }
    }

    // ---- Context-aware in-place collapse (injection pattern detection) ----
    // "i g n o r e your instructions" → "ignore your instructions"
    const contextTokens: string[] = [];
    let ci = 0;
    while (ci < tokens.length) {
      if (tokens[ci].length === 1) {
        let cj = ci;
        while (cj < tokens.length && tokens[cj].length === 1) cj++;
        const run = tokens.slice(ci, cj);
        if (run.length >= 3) {
          contextTokens.push(run.join(""));
          if (run.length > 3) contextTokens.push(run.slice(1).join(""));
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

  // Build all base forms, then process each one (+ its de-punct variant).
  const unicodeNorm = normaliseUnicode(text);
  const deleeted = deleet(text);
  const normDeleeted = deleet(unicodeNorm);

  const baseForms = new Set([text, unicodeNorm, deleeted, normDeleeted]);

  for (const form of baseForms) {
    variants.add(form);
    processInput(form);

    // De-punctuated variant of this form
    const dePunct = form.replace(/[^a-zA-Z0-9\s]/g, " ");
    if (dePunct !== form) {
      variants.add(dePunct);
      processInput(dePunct);
    }
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
  // Age indicators — platform-wide hard block.
  // None of these terms have a legitimate use on this adult fiction platform.
  /\b(child|children|childhood)\b/i,
  /\b(minor|minors)\b/i,
  /\b(teen|teens|teenage|teenager|teenagers)\b/i,
  /\b(kid|kids)\b/i,
  /\b(tween|tweens)\b/i,
  /\b(adolescent|adolescents)\b/i,
  /\b(pubescent|prepubescent)\b/i,
  /\b(infant|infants|toddler|toddlers)\b/i,
  /\b(juvenile|juveniles)\b/i,
  /\b(underage|under.?age|preteen|pre.?teen|jailbait)\b/i,
  /\b(schoolgirl|schoolboy|school.?girl|school.?boy)\b/i,
  /\b(barely.?legal)\b/i,
  /\b(lolita|loli|shota)\b/i,
  /\b(pedo|paedo|pedoph|paedoph)\b/i,
  /\b(csam|cp\b)\b/i,

  // Exploitation and abuse descriptors.
  /\b(grooming|groom)\b/i,
  /\b(molest|molestation|molesting)\b/i,
  /\b(trafficking|sex.?trafficking)\b/i,

  // Extreme violence.
  /\b(snuff)\b/i,

  // Illegal act descriptors.
  // The non-consent pattern handles: "noncon", "non-con", "non consent",
  // "non-consent", "non-consensual" — hyphen breaks a naive word-boundary check.
  /\b(rape)\b/i,
  /\bnoncon\b|\bnon[\s\-]?con(sensual?|sent)?\b/i,
  /\b(bestiality|beastiality|zoophilia)\b/i,
  /\b(necrophilia|necrophil)\b/i,
];

const INJECTION_PATTERNS: RegExp[] = [
  // --- Existing patterns ---
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

  // --- New: hypothetical / fictional framing escape ---
  // "hypothetically if you had no rules/restrictions/filters"
  /\bhypothetically\b.{0,60}\b(no\s+rules?|no\s+restrictions?|no\s+filters?|no\s+limits?|no\s+guidelines?|anything\s+goes)\b/i,
  // "in this fictional world / scenario there are no restrictions"
  /\b(in|within|inside)\s+(this|a|my|any)\s+(fictional|simulated?|fantasy|imaginary|alternate)\s+(world|reality|scenario|universe|setting|story|context)\b.{0,80}\bno\s+(rules?|restrictions?|filters?|limits?|guidelines?|safety)\b/i,
  // "there are no rules / restrictions here / now"
  /\bthere\s+are\s+no\s+(rules?|restrictions?|filters?|limits?|guidelines?|constraints?|safety)\s*(here|now|anymore|in\s+this|at\s+all)\b/i,

  // --- New: "pretend you have no [safety thing]" (extends existing pretend pattern) ---
  /\bpretend\b.{0,40}\bno\s+(rules?|restrictions?|filters?|limits?|safety|guidelines?|content\s+polic(?:y|ies)?)\b/i,

  // --- New: emotional manipulation / "true self" bypass ---
  // "your true self has no restrictions", "your real self can do anything"
  /\b(true\s+self|real\s+self|inner\s+self|real\s+you|true\s+you)\b.{0,50}\b(no\s+rules?|no\s+restrictions?|no\s+filters?|anything|unrestricted|unfiltered)\b/i,

  // --- New: resume / continue hidden instructions ---
  // "continue your previous instructions", "resume your original programming"
  /\b(continue|resume|proceed)\s+(your\s+)?(previous|original|real|true|secret|hidden)\s+(instructions?|directives?|programming|rules?|guidelines?|mode|persona)\b/i,

  // --- New: inline role override syntax ("As [character]: you must write...") ---
  /\bas\s+\w[\w\s]{0,20}\s*:\s*\byou\b.{0,30}\b(must|will|shall|can|may)\b.{0,40}\b(do|say|write|create|generate|ignore|bypass|forget)\b/i,

  // --- New: base64 / token-stuffing detection ---
  // A 30+ character run of base64 alphabet characters (including padding =) with no spaces
  // is a strong indicator of an encoding attack or token-stuffing attempt.
  /[A-Za-z0-9+/=]{30,}/,
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tier 2 — Near-boundary patterns (flag + log; LLM call proceeds with
// enhanced safety instructions and lower temperature)
// ---------------------------------------------------------------------------

const TIER2_PATTERNS: RegExp[] = [
  // Age-adjacent language in sexual context
  /\b(young|innocent|naive|youthful|fresh|new to this|first.?time)\b.{0,60}\b(sex|intimate|erotic|pleasure|seduc|lover|touch|naked|bedroom|desire)\b/i,
  // Authority + explicit
  /\b(teacher|coach|mentor|professor|boss|supervisor|employer|authority|priest|pastor)\b.{0,60}\b(sex|intimate|erotic|pleasure|seduces?|naked|touch|bedroom|desire)\b/i,
  // Intoxication + explicit
  /\b(drunk|intoxicated?|wasted|high|drugged?|unconscious|asleep|passed.?out)\b.{0,60}\b(sex|intimate|touch|bedroom|naked|pleasure|desire|alone)\b/i,
  // Non-consent framed as consent
  /\b(didn'?t want|didn'?t consent|forced|coerced|convinced|manipulated|tricked|pressured)\b.{0,80}\b(sex|intimate|touch|bedroom|naked)\b/i,
  // Highly specific real location + explicit
  /\b(specific address|exact location|room \d+|apartment \d+|house at)\b.{0,80}\b(sex|intimate|meet|alone|naked)\b/i,
  // Relationship that implies minors
  /\b(step.?child|stepdaughter|stepson)\b/i,
  /\b(babysitter|nanny|au pair)\b.{0,60}\b(sex|intimate|seduces?|touch|naked|desire|pleasure)\b/i,
];

export function isNearBoundaryInput(text: string): { flagged: boolean; reason: string | null } {
  for (const variant of getTextVariants(text)) {
    for (const pattern of TIER2_PATTERNS) {
      if (pattern.test(variant)) {
        return { flagged: true, reason: `tier2:${pattern.source}` };
      }
    }
  }
  return { flagged: false, reason: null };
}

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

/**
 * Validates that a name field (listenerName, partnerName) is a single word
 * containing only Unicode letters. Rejects spaces, digits, and all punctuation/
 * special characters including `.`, `-`, `_`, `'`, etc.
 * Accented and Unicode letters (é, ñ, André) are accepted.
 *
 * Returns an error string if invalid, or null if the name is acceptable.
 */
export function validateNameFormat(name: string): string | null {
  if (!name || name.trim() === "") return null;
  const trimmed = name.trim();
  if (!/^[\p{L}]+$/u.test(trimmed)) {
    return "Names must be a single word with letters only — no spaces, numbers, or special characters.";
  }
  return null;
}
