/**
 * Structural dialogue-attribution handling for audio segmentation.
 *
 * Attribution ("she said", "he commands, voice low") exists in prose for speaker
 * disambiguation. It must never be spoken by the narrator voice. Stripping uses
 * quote-adjacency + dialogue grammar — not open-ended TTS mute lists.
 *
 * Only narrator spans adjacent to a quoted line are processed. Mid-paragraph
 * narration ("She said nothing for a long time") is never touched.
 *
 * Keep in sync with scripts/lib/dialogueAttribution.mjs
 */

/** Finite speech verbs used as clause boundaries in dialogue grammar — not a TTS mute list. */
const SPEECH_VERB =
  "said|say|says|ask|asked|asks|replied|reply|replies|answered|answer|answers|" +
  "whispered|whisper|whispers|murmured|murmur|murmurs|breathed|breathe|breathes|" +
  "muttered|mutter|mutters|growled|growl|growls|demanded|demand|demands|" +
  "told|tell|tells|added|add|adds|sighed|sigh|sighs|gasped|gasp|gasps|" +
  "moaned|moan|moans|hissed|hiss|hisses|laughed|laugh|laughs|warned|warn|warns|" +
  "admitted|admit|admits|confessed|confess|confesses|urged|urge|urges|" +
  "pleaded|plead|pleads|teased|tease|teases|promised|promise|promises|" +
  "repeated|repeat|repeats|continued|continue|continues|insisted|insist|insists|" +
  "called|call|calls|shouted|shout|shouts|snapped|snap|snaps|" +
  "purred|purr|purrs|drawled|drawl|drawls|countered|counter|counters|" +
  "offered|offer|offers|begged|beg|begs|commanded|command|commands|" +
  "noted|note|notes|observes|observe|observed|suggests|suggest|suggested|" +
  "announced|announce|announces|managed|manage|manages|conceded|concede|concedes|" +
  "agreed|agree|agrees";

function speechVerbPattern(): string {
  return SPEECH_VERB.split("|").sort((a, b) => b.length - a.length).join("|");
}

/** After "said/asked/…", these indicate narrative complement — not a dialogue tag. */
const NARRATIVE_COMPLEMENT_RE =
  /^\s*(?:nothing|that|what|how|why|if|when|where|who|which|to|she|he|they|it|the|a|an|this|not|about|would|could|should|will|was|were|had|has|have|is|are)\b/i;

const SUBJECT_PHRASE =
  /^(?:the\s+)?[\w'-]+(?:\s+[\w'-]+){0,4}$/i;

export type QuoteAdjacency = {
  followsQuote: boolean;
  precedesQuote: boolean;
};

function trimPunct(s: string): string {
  return s.replace(/^[,;:\-—\s]+|[,;:\-—\s]+$/g, "").trim();
}

function isSubjectPhrase(s: string): boolean {
  const t = s.trim();
  return t.length > 0 && SUBJECT_PHRASE.test(t);
}

/**
 * True when text after a speech verb is a narrative complement, not end-of-tag punctuation.
 * "she said nothing" → true. "she said." → false.
 */
function hasNarrativeComplementAfterVerb(remainder: string): boolean {
  const r = remainder.trim();
  if (!r) return false;
  if (/^[.!?…,—\-]+$/.test(r)) return false;
  return NARRATIVE_COMPLEMENT_RE.test(r);
}

/**
 * Strip a leading post-quote attribution clause. Returns [strippedRemainder, didStrip].
 * e.g. "she said." → ["", true]; "he commands, voice low." → ["voice low", true]
 */
function stripLeadingPostQuoteAttribution(text: string): { rest: string; stripped: boolean } {
  const t = text.trim();
  if (!t) return { rest: "", stripped: false };

  // Optional comma/punct, optional subject, speech verb, optional remainder.
  const m = t.match(
    new RegExp(
      `^(?:[,;:\\-—\\s]*)` +
        `(?:(the\\s+)?([\\w'-]+(?:\\s+[\\w'-]+){0,4})\\s+)?` +
        `\\b(${speechVerbPattern()})\\b` +
        `(\\s*[\\s\\S]*)$`,
      "i",
    ),
  );
  if (!m) return { rest: t, stripped: false };

  const subject = (m[2] ?? "").trim();
  if (subject && !isSubjectPhrase(subject)) return { rest: t, stripped: false };

  const remainder = m[4] ?? "";
  if (hasNarrativeComplementAfterVerb(remainder)) return { rest: t, stripped: false };

  const rest = trimPunct(remainder.replace(/^[.!?…,—\-]+/, "").trim());
  return { rest, stripped: true };
}

/**
 * Strip a trailing pre-quote attribution clause from narrator prose before a quote.
 * e.g. "The heat rose. He murmured," → "The heat rose."
 */
function stripTrailingPreQuoteAttribution(text: string): { rest: string; stripped: boolean } {
  const t = text.trim();
  if (!t) return { rest: "", stripped: false };

  const m = t.match(
    new RegExp(
      `^(.*?)` +
        `(?:[,;:\\-—\\s]+)` +
        `(?:(the\\s+)?([\\w'-]+(?:\\s+[\\w'-]+){0,4})\\s+)?` +
        `\\b(${speechVerbPattern()})\\b` +
        `\\s*[,;:\\-—]*\\s*$`,
      "i",
    ),
  );
  if (!m) return { rest: t, stripped: false };

  const prefix = (m[1] ?? "").trim();
  const subject = (m[3] ?? "").trim();
  if (subject && !isSubjectPhrase(subject)) return { rest: t, stripped: false };

  if (!prefix) return { rest: "", stripped: true };
  return { rest: prefix, stripped: true };
}

/**
 * Returns narrator text safe for TTS, or null when the span should be silent.
 * Non-adjacent spans are returned unchanged.
 */
export function speakableNarratorSpan(text: string, adj: QuoteAdjacency): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (!adj.followsQuote && !adj.precedesQuote) return t;

  let current = t;

  if (adj.followsQuote) {
    const { rest, stripped } = stripLeadingPostQuoteAttribution(current);
    if (stripped) current = rest;
  }

  if (adj.precedesQuote && current) {
    const { rest, stripped } = stripTrailingPreQuoteAttribution(current);
    if (stripped) current = rest;
  }

  current = trimPunct(current).replace(/[.!?…]+$/, "").trim();
  return current.length > 0 ? current : null;
}

export interface NarratorCleanSegment {
  role: string;
  text: string;
  isFirst?: boolean;
  how?: string;
}

/**
 * After role assignment, strip quote-adjacent attribution from NARRATOR payloads.
 * CHAR / dialogue segments are unchanged.
 */
export function cleanNarratorSegmentsForTts<T extends NarratorCleanSegment>(segments: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (seg.role === "NARRATOR") {
      const followsQuote = i > 0 && segments[i - 1]!.role !== "NARRATOR";
      const precedesQuote = i < segments.length - 1 && segments[i + 1]!.role !== "NARRATOR";
      const text = speakableNarratorSpan(seg.text, { followsQuote, precedesQuote });
      if (!text) continue;
      if (out.length > 0 && out[out.length - 1]!.role === "NARRATOR") {
        out[out.length - 1] = { ...out[out.length - 1]!, text: `${out[out.length - 1]!.text} ${text}`.trim() };
        continue;
      }
      out.push({ ...seg, text });
      continue;
    }
    out.push(seg);
  }
  return out;
}

/** Dialogue line for TTS — inner words only, no surrounding quote marks. */
export function speakableDialogueLine(text: string): string {
  return text.replace(/^[“"]|[”"]$/g, "").trim();
}
