/**
 * Deterministic-first speaker attribution for multi-voice TTS.
 * Classifies quoted dialogue as protagonist (CHAR_A) or love interest (CHAR_B)
 * using line content and surrounding prose before any LLM fallback.
 */

import {
  inferSpeakerFromVocative,
  isPartnerCommandToListener,
  praisePhraseForPairing,
  buildSpeechCuePatterns,
} from "./pairingWrite.js";

export type MultiVoiceRole = "NARRATOR" | "CHAR_A" | "CHAR_B";
export type AttributionConfidence = "high" | "medium" | "low";
export type AttributionMethod =
  | "vocative"
  | "partner_directed"
  | "protagonist_response"
  | "line_first_person"
  | "context_name"
  | "context_gender"
  | "context_they"
  | "context_voice"
  | "surround_cue"
  | "continuation"
  | "sticky"
  | "toggle"
  | "llm";

export interface DialogueAttribution {
  role: "CHAR_A" | "CHAR_B";
  confidence: AttributionConfidence;
  method: AttributionMethod;
  explicit: boolean;
}

export interface CastingContext {
  pairing: string;
  /** Listener / protagonist name — always used for vocative rules when set. */
  listenerName?: string;
  partnerName?: string;
  /** Legacy alias for listenerName in some call sites. */
  protagonistName?: string;
}

export interface QuoteSpan {
  text: string;
  dialogueIndex: number;
}

export interface SegmentedStory {
  spans: QuoteSpan[];
  dialogues: string[];
}

export interface AttributionState {
  lastSpeaker: "CHAR_A" | "CHAR_B";
  hadExplicitSpeaker: boolean;
}

const ATTR_VERBS =
  "said|asked|replied|answered|whispered|murmured|breathed|muttered|growled|" +
  "demanded|told|added|sighed|gasped|moaned|hissed|laughed|warned|admitted|" +
  "confessed|urged|pleaded|teased|promised|repeated|continued|insisted|" +
  "called|shouted|snapped|purred|drawled|countered|offered|begged|" +
  "says|asks|replies|answers|whispers|murmurs|breathes|mutters|growls|" +
  "demands|tells|adds|sighs|gasps|moans|hisses|laughs|warns|admits|" +
  "confesses|urges|pleads|teases|promises|repeats|continues|insists|" +
  "calls|shouts|snaps|purrs|drawls|counters|offers|begs|" +
  "groans|notes|observes|suggests|agrees|concedes|manages|announces|breathes";

const ATTR_RE = new RegExp(`\\b(${ATTR_VERBS})\\b`, "i");
const MALE_RE = /\b(he|him|his)\b/i;
const FEMALE_RE = /\b(she|her|hers)\b/i;
const FIRST_SECOND_RE = /\b(I|you|your|me|my)\b/i;
const SINGULAR_THEY_ATTR_RE =
  /\bthey\s+(said|asked|replied|whispered|breathed|told|answered|continued|added|say|ask|reply|whisper|breathe|tell|answer|continue|add)\b/i;

const QUOTE_RE = /[“"][^“”"]*[”"]/g;

/** Shared write-contract text — multi-voice needs anchors at speaker switches, not bare quote chains. */
export const SPEAKER_ATTRIBUTION_WRITE_CONTRACT = `
MULTI-VOICE AUDIO — SPEAKER ATTRIBUTION (MANDATORY):
Each character has a distinct voice in audio. The listener cannot hear who speaks unless the prose anchors it.
- At EVERY speaker switch, the new speaker's first line MUST carry an anchor: their NAME, a pronoun+speech verb ("she murmured", "he said"), or a possessive action beat ("his hand stilled — 'Stay.'").
- You may omit redundant "he said/she said" on the second and third line of the same uninterrupted turn — never on the first line of a new turn.
- When the listener has a name, the partner may address them by name in dialogue — the surrounding prose must still anchor who speaks that line.
- Never stack three or more consecutive bare quotes with no anchor in the prose between them.
- Same-gender and they/them pairings: use NAMES at every switch — gender pronouns alone are not enough.
`.trim();

export function pairingGenders(
  pairing: string,
): { protag: "m" | "f" | "them"; li: "m" | "f" | "them" } | null {
  const p = (pairing ?? "").toLowerCase().trim();
  switch (p) {
    case "her & him":
    case "her & him & him":
    case "her & her & him":
      return { protag: "f", li: "m" };
    case "her & them":
      return { protag: "f", li: "them" };
    case "him & them":
      return { protag: "m", li: "them" };
    case "them & them":
      return { protag: "them", li: "them" };
    default:
      return null;
  }
}

export function dialogueInner(quote: string): string {
  return quote
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

export function segmentStoryQuotes(storyText: string): SegmentedStory {
  const cleaned = storyText.trim();
  const spans: QuoteSpan[] = [];
  const dialogues: string[] = [];
  let last = 0;
  for (const m of cleaned.matchAll(QUOTE_RE)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > last) spans.push({ text: cleaned.slice(last, start), dialogueIndex: -1 });
    spans.push({ text: m[0], dialogueIndex: dialogues.length });
    dialogues.push(m[0].trim());
    last = end;
  }
  if (last < cleaned.length) spans.push({ text: cleaned.slice(last), dialogueIndex: -1 });
  return { spans, dialogues };
}

export function surroundContextForDialogue(spans: QuoteSpan[], dialogueIndex: number): string {
  for (let si = 0; si < spans.length; si++) {
    if (spans[si]!.dialogueIndex !== dialogueIndex) continue;
    let prevText = "";
    if (si > 0 && spans[si - 1]!.dialogueIndex < 0) {
      prevText = spans[si - 1]!.text.replace(/\s+/g, " ").trim().slice(-200);
    }
    let nextText = "";
    if (si + 1 < spans.length && spans[si + 1]!.dialogueIndex < 0) {
      nextText = spans[si + 1]!.text.replace(/\s+/g, " ").trim().slice(0, 160);
    }
    return `${prevText} ${nextText}`.trim();
  }
  return "";
}

function listenerName(casting: CastingContext): string | undefined {
  return casting.listenerName?.trim() || casting.protagonistName?.trim() || undefined;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Lines the partner speaks TO the listener (second-person commands, praise, control). */
export function isPartnerDirectedAtListener(line: string, pairing?: string): boolean {
  if (isPartnerCommandToListener(line)) return true;
  const praise = praisePhraseForPairing(pairing);
  if (praise && new RegExp(`^${escapeRe(praise)}\\b`, "i").test(line)) return true;
  if (/^(Tell me|Don't move|Stay still|Hands behind|Not yet|Look at me|Look at this|Spread|Open your)\b/i.test(line)) {
    return true;
  }
  if (/^(You're|You are)\b/i.test(line) && /\byou\b/i.test(line)) return true;
  if (/\byou\b/i.test(line) && /stay still|don't move|not going to move/i.test(line)) return true;
  return false;
}

/** Lines the protagonist speaks (responses, confessions, begging). */
export function isProtagonistResponseLine(line: string): boolean {
  if (/^I (had|wanted|need|want|—|--)/i.test(line)) return true;
  if (/^(Yes|Please|More|I want|I need)\b/i.test(line)) return true;
  if (/^Your (weight|thighs)/i.test(line) || /^your thighs/i.test(line)) return true;
  return false;
}

function roleFromGenderInContext(
  genders: { protag: "m" | "f" | "them"; li: "m" | "f" | "them" },
  context: string,
): "CHAR_A" | "CHAR_B" | null {
  const male = MALE_RE.test(context);
  const female = FEMALE_RE.test(context);
  if (male && !female) return genders.li === "m" ? "CHAR_B" : "CHAR_A";
  if (female && !male) return genders.li === "f" ? "CHAR_B" : "CHAR_A";
  return null;
}

function inferFromSurround(
  context: string,
  pairing: string,
  partnerName?: string,
  listener?: string,
): "CHAR_A" | "CHAR_B" | null {
  if (!context.trim()) return null;
  const { liSpeechAfter, protagSpeechAfter } = buildSpeechCuePatterns(pairing, partnerName, listener);
  const liCue = liSpeechAfter.test(context);
  const protagCue = protagSpeechAfter.test(context);
  const g = pairingGenders(pairing);
  if (!g) {
    if (liCue && !protagCue) return "CHAR_B";
    if (protagCue && !liCue) return "CHAR_A";
    return null;
  }
  if (liCue && !protagCue) return g.li === "m" || g.li === "them" ? "CHAR_B" : "CHAR_A";
  if (protagCue && !liCue) return g.protag === "m" || g.protag === "them" ? "CHAR_A" : "CHAR_B";
  return null;
}

/**
 * Classify a single quoted line. Priority: line content → surrounding prose → continuity.
 */
export function classifyDialogueLine(
  quoteInner: string,
  surroundContext: string,
  casting: CastingContext,
  state: AttributionState,
): DialogueAttribution {
  const genders = pairingGenders(casting.pairing);
  const listener = listenerName(casting);
  const partner = casting.partnerName?.trim();
  const ctxLc = surroundContext.toLowerCase();

  const finish = (
    role: "CHAR_A" | "CHAR_B",
    confidence: AttributionConfidence,
    method: AttributionMethod,
    explicit: boolean,
  ): DialogueAttribution => {
    state.lastSpeaker = role;
    if (explicit) state.hadExplicitSpeaker = true;
    return { role, confidence, method, explicit };
  };

  const vocative = inferSpeakerFromVocative(quoteInner, listener, partner);
  if (vocative) return finish(vocative, "high", "vocative", true);

  if (isPartnerDirectedAtListener(quoteInner, casting.pairing)) {
    return finish("CHAR_B", "high", "partner_directed", true);
  }

  if (isProtagonistResponseLine(quoteInner)) {
    return finish("CHAR_A", "high", "protagonist_response", true);
  }

  if (genders && /^I(\b|'|')/i.test(quoteInner)) {
    const liCue =
      (partner && ctxLc.includes(partner.toLowerCase())) ||
      (genders.li === "m" && MALE_RE.test(surroundContext) && !FEMALE_RE.test(surroundContext)) ||
      (genders.li === "f" && FEMALE_RE.test(surroundContext) && !MALE_RE.test(surroundContext));
    if (!liCue) return finish("CHAR_A", "high", "line_first_person", true);
  }

  if (genders && /\b(his|he['']s)\s+voice\b/i.test(surroundContext)) {
    const role = genders.li === "m" ? "CHAR_B" : "CHAR_A";
    return finish(role, "high", "context_voice", true);
  }
  if (genders && /\b(her|she['']s)\s+voice\b/i.test(surroundContext)) {
    const role = genders.li === "f" ? "CHAR_B" : "CHAR_A";
    return finish(role, "high", "context_voice", true);
  }

  const hasAttr = ATTR_RE.test(surroundContext);
  if (hasAttr) {
    if (partner && ctxLc.includes(partner.toLowerCase())) {
      return finish("CHAR_B", "high", "context_name", true);
    }
    if (listener && ctxLc.includes(listener.toLowerCase())) {
      return finish("CHAR_A", "high", "context_name", true);
    }
    if (genders) {
      const fromGender = roleFromGenderInContext(genders, surroundContext);
      if (fromGender) return finish(fromGender, "high", "context_gender", true);
    }
    if (genders?.li === "them" && SINGULAR_THEY_ATTR_RE.test(surroundContext)) {
      return finish("CHAR_B", "high", "context_they", true);
    }
    if (FIRST_SECOND_RE.test(surroundContext)) {
      return finish("CHAR_A", "medium", "context_gender", true);
    }
  }

  if (genders) {
    const fromGender = roleFromGenderInContext(genders, surroundContext);
    if (fromGender) return finish(fromGender, "medium", "context_gender", true);
  }

  const fromSurround = inferFromSurround(surroundContext, casting.pairing, partner, listener);
  if (fromSurround) return finish(fromSurround, "medium", "surround_cue", true);

  if (/^[a-z(]/.test(quoteInner) && state.hadExplicitSpeaker) {
    return finish(state.lastSpeaker, "medium", "continuation", false);
  }

  if (state.hadExplicitSpeaker) {
    return finish(state.lastSpeaker, "low", "sticky", false);
  }

  state.lastSpeaker = state.lastSpeaker === "CHAR_A" ? "CHAR_B" : "CHAR_A";
  return finish(state.lastSpeaker, "low", "toggle", false);
}

export function attributeAllDialoguesDeterministic(
  dialogues: string[],
  spans: QuoteSpan[],
  casting: CastingContext,
): DialogueAttribution[] {
  const state: AttributionState = { lastSpeaker: "CHAR_A", hadExplicitSpeaker: false };
  return dialogues.map((quote, i) => {
    const inner = dialogueInner(quote);
    const context = surroundContextForDialogue(spans, i);
    return classifyDialogueLine(inner, context, casting, state);
  });
}

export function mergeWithLlmRoles(
  deterministic: DialogueAttribution[],
  llmRoles: ("CHAR_A" | "CHAR_B")[],
): DialogueAttribution[] {
  return deterministic.map((det, i) => {
    const llmRole = llmRoles[i];
    if (!llmRole) return det;
    // Keep only deterministic labels that are explicitly anchored in prose.
    // Medium-confidence heuristics (continuation, context_gender, sticky) and all
    // low-confidence fallbacks are overridden — they drift badly in PERFORM climax.
    if (det.confidence === "high" && det.explicit) return det;
    return { role: llmRole, confidence: "medium", method: "llm", explicit: true };
  });
}

export function validateAttributionConfidence(
  attributions: DialogueAttribution[],
): { ok: boolean; lowIndices: number[] } {
  const lowIndices: number[] = [];
  for (let i = 0; i < attributions.length; i++) {
    const a = attributions[i]!;
    if (a.confidence !== "low") continue;
    if (a.method === "continuation" && i > 0 && attributions[i - 1]!.confidence !== "low") continue;
    lowIndices.push(i);
  }
  return { ok: lowIndices.length === 0, lowIndices };
}

export function formatDialogueForClassifier(
  spans: QuoteSpan[],
  dialogueIndex: number,
): string {
  for (let si = 0; si < spans.length; si++) {
    if (spans[si]!.dialogueIndex !== dialogueIndex) continue;
    const parts: string[] = [];
    if (si > 0 && spans[si - 1]!.dialogueIndex < 0) {
      const prevText = spans[si - 1]!.text.replace(/\s+/g, " ").trim().slice(-200);
      if (prevText) parts.push(`…${prevText}`);
    }
    parts.push(spans[si]!.text);
    if (si + 1 < spans.length && spans[si + 1]!.dialogueIndex < 0) {
      const nextText = spans[si + 1]!.text.replace(/\s+/g, " ").trim().slice(0, 120);
      if (nextText) parts.push(`${nextText}…`);
    }
    return parts.join(" ");
  }
  return "";
}
