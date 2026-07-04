import type { CastingRoomResult } from "@/components/CastingRoom";
import { DEFAULT_NARRATOR_VOICE_ID } from "@/lib/voices";

export type StoryFunnel = "erotic" | "bedtime";

export type BuildGeneratePayloadOptions = {
  funnel: StoryFunnel;
  casting: CastingRoomResult;
  experienceTags?: string[];
  scenarioRoom?: string;
  /** After Dark scenario storyMode — bedtime uses casting.storyMode (nocturne). */
  scenarioStoryMode?: string;
};

/**
 * Single client-side builder for POST /api/generate-full-story.
 * All funnels (After Dark, bedtime/Drift handoff) must use this — no per-page genData objects.
 */
export function buildGeneratePayload(opts: BuildGeneratePayloadOptions): Record<string, unknown> {
  const { casting, funnel, experienceTags = [], scenarioRoom, scenarioStoryMode } = opts;

  const apiPerspective =
    casting.perspective === "your"
      ? "you"
      : casting.perspective === "their"
        ? "they"
        : casting.perspective;

  const storyMode =
    casting.storyMode ??
    scenarioStoryMode ??
    (funnel === "bedtime" ? "nocturne" : "unrestrained");

  return {
    mood: casting.mood || (funnel === "bedtime" ? "Late Night" : "Late Night"),
    intensity: casting.intensity,
    voiceFeel: casting.voiceId ?? DEFAULT_NARRATOR_VOICE_ID,
    storyLength: "10 min",
    perspective: apiPerspective,
    cinematicVisuals: true,
    emotionalFocus: funnel === "bedtime",
    whoIsHe: casting.archetype || undefined,
    dynamic: casting.dynamic || undefined,
    storyMode,
    experienceTags: experienceTags.length > 0 ? experienceTags : undefined,
    pairing: casting.pairing || undefined,
    heritage: casting.heritage || undefined,
    atmosphere: casting.atmosphere || undefined,
    chemistry: casting.chemistry || undefined,
    setting: casting.setting || undefined,
    appearBuild: casting.appearBuild || undefined,
    appearHeight: casting.appearHeight || undefined,
    appearColouring: casting.appearColouring || undefined,
    appearEyes: casting.appearEyes || undefined,
    appearFeatures: casting.appearFeatures?.length ? casting.appearFeatures : undefined,
    listenerName: casting.listenerName || undefined,
    partnerName: casting.partnerName || undefined,
    country: casting.country || undefined,
    city: casting.city || undefined,
    scenarioRoom: scenarioRoom || undefined,
    situationId: casting.situationId || undefined,
  };
}
