import type { CastingRoomResult } from "@/components/CastingRoom";
import { getDefaultVoiceId, VOICES } from "@/lib/voices";
import type { CategoryId } from "@/components/BriefBuilder";
import {
  marketingIntensityToCanonical,
  canonicalToMarketing,
  type CanonicalIntensity,
} from "@workspace/intensity";

export const HOME_BRIEF_KEY = "afterDarkHomeBrief";

export type HomeBrief = Record<CategoryId, string>;

export const CURATED_SCENARIO_IDS = [
  "he_decides",
  "finally",
  "the_colleague",
  "two_of_him",
  "completely_undone",
  "she_takes_the_reins",
] as const;

const ROOM_SETTING: Record<string, string> = {
  power_exchange: "Private club",
  slow_burn: "His apartment",
  the_forbidden: "After hours",
  more_than_two: "Hotel suite",
  dark_territory: "Penthouse",
  sweet_and_savage: "Bedroom",
  the_edge: "Study",
  eyes_on_us: "Gallery opening",
  in_character: "On set",
};

const ROOM_ATMOSPHERE: Record<string, string> = {
  power_exchange: "Candlelit",
  slow_burn: "Midnight",
  the_forbidden: "Electric",
  more_than_two: "Languid",
  dark_territory: "Firelit",
};

export function readHomeBrief(): HomeBrief | null {
  try {
    const raw = sessionStorage.getItem(HOME_BRIEF_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HomeBrief;
  } catch {
    return null;
  }
}

export function saveHomeBrief(brief: HomeBrief): void {
  try {
    sessionStorage.setItem(HOME_BRIEF_KEY, JSON.stringify(brief));
  } catch { /* storage unavailable */ }
}

export function homeIntensityToCasting(label: string): CastingRoomResult["intensity"] {
  return marketingIntensityToCanonical(label);
}

export function castingIntensityToHome(intensity: CastingRoomResult["intensity"]): string {
  return canonicalToMarketing(intensity as CanonicalIntensity);
}

export function voiceNameToId(name: string, pairing?: string): string {
  const v = VOICES.find(
    (voice) =>
      voice.displayName === name ||
      voice.label === name ||
      voice.displayName?.startsWith(name) ||
      voice.label?.startsWith(name),
  );
  return v?.id ?? getDefaultVoiceId(pairing);
}

export type ExpressScenario = {
  id: string;
  label: string;
  sub: string;
  room: string;
  darkness: string;
  accent: string;
  storyMode: string;
  tags: string[];
};

export function buildExpressCasting(
  scenario: ExpressScenario,
  pairing: string,
  intensity: CastingRoomResult["intensity"],
  opts: {
    chemistry?: string;
    archetype?: string;
    voiceId?: string;
    country?: string;
    city?: string;
    setting?: string;
    afterDarkScene?: string;
    atmosphere?: string;
    mood?: string;
    heritage?: string;
    customTags?: string[];
    chooseForMe?: boolean;
    listenerName?: string;
    partnerName?: string;
  },
): CastingRoomResult {
  const primaryTag = scenario.tags[0] ?? "He Takes Charge";
  const mood =
    opts.mood ??
    (scenario.darkness === "No Limits"
      ? "Raw"
      : scenario.darkness === "Deep Night"
        ? "Burning"
        : "Charged");

  const chemistry = opts.chooseForMe ? primaryTag : (opts.chemistry || primaryTag);
  const archetype = opts.chooseForMe ? "The Executive" : (opts.archetype || "The Executive");
  const setting =
    opts.afterDarkScene || opts.setting || ROOM_SETTING[scenario.room] || "Luxury Hotel";

  return {
    perspective: "her",
    pairing,
    heritage: opts.heritage || "Ambiguous",
    archetype,
    chemistry,
    country: opts.country || undefined,
    city: opts.city || undefined,
    setting,
    atmosphere: opts.atmosphere || ROOM_ATMOSPHERE[scenario.room] || "Candlelit",
    intensity,
    mood,
    whoIsHe: archetype,
    dynamic: chemistry,
    storyMode: scenario.storyMode,
    voiceId: opts.voiceId ?? getDefaultVoiceId(pairing),
    customTags: opts.customTags?.length ? opts.customTags : undefined,
    listenerName: opts.listenerName || undefined,
    partnerName: opts.partnerName || undefined,
  };
}
