/**
 * Dialogue density enforcement — quoted words and exchange count per scene phase/beat.
 */

import { countWords, isExpressBeatPhase, phaseLengthScale } from "./storyLength.js";

const LEGACY_PHASE_ORDER = ["ESTABLISH", "SIMMER", "CRACK", "IGNITE", "RESONATE"] as const;
const EXPRESS_BEAT_ORDER = ["FRAME", "DECLARE", "PERFORM", "LAND"] as const;

/** FRAME/LAND are narrator-led; DECLARE/PERFORM carry dialogue weight for audio. */
const DIALOGUE_PHASE_WEIGHT: Record<string, number> = {
  FRAME: 0.7,
  DECLARE: 1,
  PERFORM: 1.08,
  LAND: 0.72,
  ESTABLISH: 0.7,
  SIMMER: 1,
  CRACK: 1,
  IGNITE: 1.05,
  RESONATE: 0.75,
};

/** Minimum quoted words per scene by phase/beat. */
export const PHASE_QUOTED_WORD_MIN: Record<string, number> = {
  FRAME: 60,
  DECLARE: 115,
  PERFORM: 200,
  LAND: 50,
  ESTABLISH: 75,
  SIMMER: 115,
  CRACK: 135,
  IGNITE: 180,
  RESONATE: 60,
};

/** Minimum number of quoted lines (opening quote pairs) per scene. */
export const PHASE_QUOTE_LINE_MIN: Record<string, number> = {
  FRAME: 5,
  DECLARE: 8,
  PERFORM: 14,
  LAND: 4,
  ESTABLISH: 5,
  SIMMER: 8,
  CRACK: 10,
  IGNITE: 12,
  RESONATE: 5,
};

/** Minimum ratio of quoted words to total scene words. */
export const PHASE_QUOTED_RATIO_MIN: Record<string, number> = {
  FRAME: 0.24,
  DECLARE: 0.34,
  PERFORM: 0.36,
  LAND: 0.22,
  ESTABLISH: 0.24,
  SIMMER: 0.32,
  CRACK: 0.36,
  IGNITE: 0.40,
  RESONATE: 0.24,
};

/** Average words per quoted line should exceed this (avoids micro one-word volleys). */
export const MIN_AVG_WORDS_PER_QUOTE_LINE = 6;

export type ScenePhaseRef = { phase?: string };

export type WeakDialogueScene = {
  sceneIndex: number;
  phase: string;
  totalWords: number;
  quotedWords: number;
  quoteLines: number;
  quotedRatio: number;
  avgQuoteLineWords: number;
  issues: string[];
};

export type DialogueDensityValidation = {
  ok: boolean;
  weakScenes: WeakDialogueScene[];
  storyQuotedRatio: number;
};

export function countQuotedWords(text: string): number {
  let total = 0;
  for (const m of text.matchAll(/"([^"]+)"/g)) {
    total += countWords(m[1] ?? "");
  }
  return total;
}

export function countQuoteLines(text: string): number {
  const quotes = text.match(/"/g);
  return quotes ? Math.floor(quotes.length / 2) : 0;
}

export function extractQuoteLineWordCounts(text: string): number[] {
  const counts: number[] = [];
  for (const m of text.matchAll(/"([^"]+)"/g)) {
    counts.push(countWords(m[1] ?? ""));
  }
  return counts;
}

export function validateDialogueDensity(
  parsed: Record<string, unknown>,
  scenePlan: ScenePhaseRef[] = [],
  storyLength?: string,
): DialogueDensityValidation {
  const scenes = (parsed.scenes ?? []) as Array<{ text?: string }>;
  const weakScenes: WeakDialogueScene[] = [];
  let totalWords = 0;
  let totalQuoted = 0;
  const scale = phaseLengthScale(storyLength);

  for (let i = 0; i < scenes.length; i++) {
    const text = scenes[i]?.text ?? "";
    const phase =
      scenePlan[i]?.phase ??
      (scenePlan.length === 4 ? EXPRESS_BEAT_ORDER[i] : LEGACY_PHASE_ORDER[i]) ??
      LEGACY_PHASE_ORDER[LEGACY_PHASE_ORDER.length - 1]!;
    const tw = countWords(text);
    const qw = countQuotedWords(text);
    const ql = countQuoteLines(text);
    const ratio = tw > 0 ? qw / tw : 0;
    const lineCounts = extractQuoteLineWordCounts(text);
    const avgQuote =
      lineCounts.length > 0
        ? lineCounts.reduce((a, b) => a + b, 0) / lineCounts.length
        : 0;

    totalWords += tw;
    totalQuoted += qw;

    const phaseWeight = DIALOGUE_PHASE_WEIGHT[phase] ?? 1;
    const issues: string[] = [];
    const minQuoted = Math.max(
      18,
      Math.round((PHASE_QUOTED_WORD_MIN[phase] ?? 50) * scale * phaseWeight),
    );
    const minLines = Math.max(3, Math.round((PHASE_QUOTE_LINE_MIN[phase] ?? 4) * scale * phaseWeight));
    let minRatio = PHASE_QUOTED_RATIO_MIN[phase] ?? 0.2;
    if (phase === "PERFORM" && tw >= 350) {
      minRatio *= 0.82;
    }

    if (qw < minQuoted) {
      const frameQuotedFlex = phase === "FRAME" && tw < 200 && ql >= minLines;
      if (!frameQuotedFlex) issues.push(`quoted words ${qw} < ${minQuoted}`);
    }
    if (ql < minLines) issues.push(`quote lines ${ql} < ${minLines}`);
    if (tw > 0 && ratio < minRatio) {
      const frameShort = phase === "FRAME" && tw < 200 && ql >= minLines;
      const performVolumeOk = phase === "PERFORM" && ql >= 14 && qw >= 200;
      if (!frameShort && !performVolumeOk) {
        issues.push(`quoted ratio ${Math.round(ratio * 100)}% < ${Math.round(minRatio * 100)}%`);
      }
    }
    const enforceAvgLine =
      phase === "DECLARE" ||
      phase === "SIMMER" ||
      phase === "CRACK" ||
      phase === "IGNITE" ||
      (phase === "PERFORM" && tw >= 550);
    if (enforceAvgLine && lineCounts.length > 0 && avgQuote < MIN_AVG_WORDS_PER_QUOTE_LINE) {
      const performVolumeOk = phase === "PERFORM" && ql >= 14 && qw >= 200;
      if (!performVolumeOk) {
        issues.push(`avg words/line ${avgQuote.toFixed(1)} < ${MIN_AVG_WORDS_PER_QUOTE_LINE}`);
      }
    }

    if (issues.length > 0) {
      weakScenes.push({
        sceneIndex: i + 1,
        phase,
        totalWords: tw,
        quotedWords: qw,
        quoteLines: ql,
        quotedRatio: ratio,
        avgQuoteLineWords: avgQuote,
        issues,
      });
    }
  }

  return {
    ok: weakScenes.length === 0,
    weakScenes,
    storyQuotedRatio: totalWords > 0 ? totalQuoted / totalWords : 0,
  };
}

export const DIALOGUE_FORWARD_PROMPT_BLOCK = `
DIALOGUE VOLUME — MANDATORY (this story is performed in multi-voice audio):
- Characters talk to each other in dedicated conversation blocks. Narrator bridges between blocks only (max 1–2 sentences).
- FRAME: 1 block (6–10 lines) — situation stakes live in quoted speech; foreshadow chip themes in subtext.
- DECLARE: 2 blocks — tension/risk, then desire negotiation; partner tests fantasies in speech (no verbatim chip echo).
- PERFORM: 1 block per customer chip — OFFER→ACT→REACT→DEEPEN; sensation in dirty talk, not narrator description.
- Each speaker turn: 6–20 words inside quotes — fuller lines, not ping-pong unless rhythm demands it.
- SAY ≠ ENACT: DECLARE negotiates; PERFORM shows partner doing through commands and touch framed in speech.
`.trim();

export function buildDialogueRetryNote(v: DialogueDensityValidation): string {
  if (v.ok) return "";
  const lines = v.weakScenes
    .map(
      (s) =>
        `  Scene ${s.sceneIndex} (${s.phase}): ${s.quotedWords} quoted words, ${s.quoteLines} lines, ${Math.round(s.quotedRatio * 100)}% ratio — ${s.issues.join("; ")}`,
    )
    .join("\n");
  return `CRITICAL — DIALOGUE DENSITY: The story is too narrator-heavy. Expand quoted character speech in these scenes (add real back-and-forth; longer lines inside quotes; let dialogue carry PERFORM beats):\n${lines}\nStory-wide quoted ratio: ${Math.round(v.storyQuotedRatio * 100)}% (target: DECLARE ~34%, PERFORM ~42%+). Do NOT shorten narrator scenes that already pass — add dialogue.`;
}

export function defaultPhaseOrder(sceneCount: number): readonly string[] {
  return sceneCount === 4 ? EXPRESS_BEAT_ORDER : LEGACY_PHASE_ORDER;
}

export function isExpressBeatPlan(scenePlan: ScenePhaseRef[]): boolean {
  return scenePlan.some((s) => isExpressBeatPhase(s.phase ?? ""));
}
