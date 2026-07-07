import type { CastingRoomResult } from "@/components/CastingRoom";
import { DEFAULT_NARRATOR_VOICE_ID } from "@/lib/voices";

export type PreviewCoverInput = {
  pairing?: string | null;
  heritage?: string | null;
  chemistry?: string | null;
  dynamic?: string | null;
  mood?: string | null;
  intensity?: string | null;
  atmosphere?: string | null;
  setting?: string | null;
  storyMode?: string | null;
  appearBuild?: string | null;
  appearHeight?: string | null;
  appearColouring?: string | null;
  appearEyes?: string | null;
  appearFeatures?: string[] | null;
  perspective?: string | null;
};

export type PreviewCoverResult = {
  url: string;
  coverKey: string;
};

function previewCoverCacheKey(input: PreviewCoverInput): string {
  const parts = [
    input.pairing ?? "",
    input.heritage ?? "",
    input.chemistry ?? input.dynamic ?? "",
    input.mood ?? "",
    input.intensity ?? "",
    input.atmosphere ?? "",
    input.setting ?? "",
    input.appearBuild ?? "",
    input.appearColouring ?? "",
  ];
  return `preview-cover:afterdark:${parts.join(":")}`;
}

export function castingToPreviewInput(
  casting: CastingRoomResult | Record<string, unknown> | null | undefined,
  fallback?: Partial<PreviewCoverInput>,
): PreviewCoverInput {
  const c = casting ?? {};
  const perspective = (c as CastingRoomResult).perspective;
  const apiPerspective =
    perspective === "your"
      ? "you"
      : perspective === "their"
        ? "they"
        : perspective;

  return {
    pairing: (c.pairing as string | undefined) ?? fallback?.pairing,
    heritage: (c.heritage as string | undefined) ?? fallback?.heritage,
    chemistry: (c.chemistry as string | undefined) ?? fallback?.chemistry,
    dynamic: (c.dynamic as string | undefined) ?? fallback?.dynamic,
    mood: (c.mood as string | undefined) ?? fallback?.mood,
    intensity: (c.intensity as string | undefined) ?? fallback?.intensity,
    atmosphere: (c.atmosphere as string | undefined) ?? fallback?.atmosphere,
    setting: (c.setting as string | undefined) ?? fallback?.setting,
    storyMode: (c.storyMode as string | undefined) ?? fallback?.storyMode,
    appearBuild: (c.appearBuild as string | undefined) ?? fallback?.appearBuild,
    appearHeight: (c.appearHeight as string | undefined) ?? fallback?.appearHeight,
    appearColouring: (c.appearColouring as string | undefined) ?? fallback?.appearColouring,
    appearEyes: (c.appearEyes as string | undefined) ?? fallback?.appearEyes,
    appearFeatures:
      (c.appearFeatures as string[] | undefined) ?? fallback?.appearFeatures ?? undefined,
    perspective: apiPerspective ?? fallback?.perspective,
  };
}

/** POST /api/preview-cover — pairing + heritage aware, Act IV homepage style. */
export async function fetchPreviewCover(
  apiBase: string,
  input: PreviewCoverInput,
): Promise<PreviewCoverResult | null> {
  if (!input.pairing?.trim()) return null;

  const sessionKey = previewCoverCacheKey(input);
  try {
    const cached = sessionStorage.getItem(sessionKey);
    const cachedKey = sessionStorage.getItem(`${sessionKey}:coverKey`);
    if (cached && cachedKey) {
      return { url: cached, coverKey: cachedKey };
    }
  } catch {
    /* storage unavailable */
  }

  const body = {
    mood: input.mood ?? "Late Night",
    intensity: input.intensity ?? "Warm",
    voiceFeel: DEFAULT_NARRATOR_VOICE_ID,
    storyLength: "10 min",
    pairing: input.pairing ?? undefined,
    heritage: input.heritage ?? undefined,
    chemistry: input.chemistry ?? input.dynamic ?? undefined,
    atmosphere: input.atmosphere ?? undefined,
    setting: input.setting ?? undefined,
    storyMode: input.storyMode ?? "unrestrained",
    appearBuild: input.appearBuild ?? undefined,
    appearHeight: input.appearHeight ?? undefined,
    appearColouring: input.appearColouring ?? undefined,
    appearEyes: input.appearEyes ?? undefined,
    appearFeatures: input.appearFeatures?.length ? input.appearFeatures : undefined,
    perspective: input.perspective ?? undefined,
  };

  try {
    const res = await fetch(`${apiBase}/api/preview-cover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string; coverKey?: string };
    if (!data.url || !data.coverKey) return null;
    try {
      sessionStorage.setItem(sessionKey, data.url);
      sessionStorage.setItem(`${sessionKey}:coverKey`, data.coverKey);
    } catch {
      /* storage unavailable */
    }
    return { url: data.url, coverKey: data.coverKey };
  } catch {
    return null;
  }
}
