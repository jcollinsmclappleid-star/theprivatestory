/**
 * Ten-minute story length enforcement — word counts that map to ~9–11 min audio.
 * Used by writeStoryFromBrief and the generation pipeline pre-audio guard.
 */

/** Minimum total words for a standard 10-minute customer story. */
export const TEN_MIN_MIN_WORDS = 1440;

/** Soft upper bound — prompts ask the model not to exceed this. */
export const TEN_MIN_MAX_WORDS = 1760;

/** Per-phase floors for the 5-scene ESTABLISH → RESONATE arc. */
export const PHASE_WORD_MIN: Record<string, number> = {
  ESTABLISH: 280,
  SIMMER: 310,
  CRACK: 340,
  IGNITE: 380,
  RESONATE: 220,
};

const DEFAULT_PHASE_ORDER = ["ESTABLISH", "SIMMER", "CRACK", "IGNITE", "RESONATE"] as const;

export const MAX_STRUCTURAL_WRITE_ATTEMPTS = 5;

export function wordCountTargetForStoryLength(storyLength?: string): string | undefined {
  switch (storyLength) {
    case "10 min":
      return "1,440–1,760 words total (~10 minutes of audio narration)";
    case "12 min":
      return "1,760–2,100 words total (~12 minutes of audio narration)";
    case "5 min":
      return "720–900 words total (~5 minutes of audio narration)";
    case "3 min":
      return "400–520 words total (~3 minutes of audio narration)";
    default:
      return undefined;
  }
}

export function minWordsForStoryLength(storyLength?: string): number {
  switch (storyLength) {
    case "10 min":
      return TEN_MIN_MIN_WORDS;
    case "12 min":
      return 1760;
    case "5 min":
      return 720;
    case "3 min":
      return 400;
    default:
      return TEN_MIN_MIN_WORDS;
  }
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function totalWordCountFromParsed(parsed: Record<string, unknown>): number {
  const scenes = (parsed.scenes ?? []) as Array<{ text?: string }>;
  return scenes.reduce((sum, s) => sum + countWords(s.text ?? ""), 0);
}

export function totalWordCountFromSceneTexts(texts: string[]): number {
  return texts.reduce((sum, t) => sum + countWords(t), 0);
}

export type ScenePhaseRef = { phase?: string };

export type StoryLengthValidation = {
  ok: boolean;
  sceneCount: number;
  wordCount: number;
  targetScenes: number;
  minWords: number;
  shortPhases: Array<{ sceneIndex: number; phase: string; words: number; min: number }>;
};

export function validateStoryLength(
  parsed: Record<string, unknown>,
  targetScenes: number,
  scenePlan: ScenePhaseRef[] = [],
  minWords = TEN_MIN_MIN_WORDS,
): StoryLengthValidation {
  const scenes = (parsed.scenes ?? []) as Array<{ text?: string }>;
  const sceneCount = scenes.length;
  const wordCount = totalWordCountFromParsed(parsed);
  const shortPhases: StoryLengthValidation["shortPhases"] = [];

  for (let i = 0; i < scenes.length; i++) {
    const phase =
      scenePlan[i]?.phase ??
      DEFAULT_PHASE_ORDER[i] ??
      DEFAULT_PHASE_ORDER[DEFAULT_PHASE_ORDER.length - 1]!;
    const min = PHASE_WORD_MIN[phase] ?? 200;
    const words = countWords(scenes[i]?.text ?? "");
    if (words < min) {
      shortPhases.push({ sceneIndex: i + 1, phase, words, min });
    }
  }

  const ok =
    sceneCount === targetScenes &&
    wordCount >= minWords &&
    shortPhases.length === 0;

  return { ok, sceneCount, wordCount, targetScenes, minWords, shortPhases };
}

export function buildStructuralRetryNote(v: StoryLengthValidation): string {
  const notes: string[] = [];

  if (v.sceneCount !== v.targetScenes) {
    notes.push(
      `CRITICAL — SCENE COUNT: You returned ${v.sceneCount} scene(s) but the story requires EXACTLY ${v.targetScenes} scenes (ESTABLISH / SIMMER / CRACK / IGNITE / RESONATE). Return exactly ${v.targetScenes} scene objects in the "scenes" array.`,
    );
  }

  if (v.wordCount < v.minWords) {
    notes.push(
      `CRITICAL — WORD COUNT: Your story has only ~${v.wordCount} words. The TARGET is ${v.minWords}–${TEN_MIN_MAX_WORDS} words total (no more, no less). Each phase has a mandatory word range — write to this length exactly:\n  ESTABLISH = 280–320 words (count them — do not stop early)\n  SIMMER = 310–350 words (count them — do not stop early)\n  CRACK = 340–380 words (count them — do not stop early)\n  IGNITE = 380–420 words (count them — do not stop early)\n  RESONATE = 220–260 words\nDo NOT compress. Do NOT summarise. Write each phase fully to its minimum before moving to the next. Do NOT exceed the upper bound.`,
    );
  }

  if (v.shortPhases.length > 0) {
    const lines = v.shortPhases
      .map((p) => `  Scene ${p.sceneIndex} (${p.phase}): ${p.words} words — minimum ${p.min}`)
      .join("\n");
    notes.push(
      `CRITICAL — PER-SCENE LENGTH: The following scenes are below their phase minimum. Expand ONLY these scenes until each meets its floor (add dialogue, sensation, and interiority — do not pad with repetition):\n${lines}`,
    );
  }

  return notes.join("\n\n");
}

export function buildExpandOnlyNote(
  parsed: Record<string, unknown>,
  v: StoryLengthValidation,
): string {
  return `${buildStructuralRetryNote(v)}

EXPAND-ONLY PASS: Keep the same title, characters, plot beats, and scene headings. Do NOT shorten any scene that already meets its minimum. Return the complete JSON with every scene expanded to meet the word-count floors. Current draft for reference:
${JSON.stringify({ title: parsed.title, description: parsed.description, scenes: parsed.scenes }, null, 0)}`;
}
