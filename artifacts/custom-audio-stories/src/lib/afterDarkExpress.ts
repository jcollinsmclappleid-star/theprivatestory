import type { CastingRoomResult } from "@/components/CastingRoom";
import { PAIRINGS } from "@/components/CastingRoom";
import { getDefaultVoiceId, VOICES } from "@/lib/voices";
import type { CastCategoryId } from "@/components/BriefBuilder";
import type { HomeBrief } from "@/lib/homeBriefUtils";
import {
  marketingIntensityToCanonical,
  canonicalToMarketing,
  type CanonicalIntensity,
} from "@workspace/intensity";

export const HOME_BRIEF_KEY = "afterDarkHomeBrief";
/** Pre-select express fantasy scenario when user taps “Build one like this” from a sample. */
export const SAMPLE_SCENARIO_KEY = "afterDarkSampleScenarioId";
export type { HomeBrief } from "@/lib/homeBriefUtils";
export { HOME_STUDIO_HANDOFF_KEY } from "@/lib/homeBriefUtils";

export const CURATED_SCENARIO_IDS = [
  "he_decides",
  "finally",
  "the_colleague",
  "two_of_him",
  "completely_undone",
  "she_takes_the_reins",
] as const;

/** Pairing gate — multi-partner rooms default to Her & Him unless explicitly allowed. */
export function scenarioAllowsPairing(
  scenario: { allowedPairings?: string[]; room?: string },
  pairing: string,
): boolean {
  if (scenario.allowedPairings?.length) {
    return scenario.allowedPairings.includes(pairing);
  }
  if (scenario.room === "more_than_two") {
    return pairing === "Her & Him";
  }
  return true;
}

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

export function perspectiveFromPairing(pairing: string): CastingRoomResult["perspective"] {
  const cfg = PAIRINGS.find((p) => p.id === pairing);
  if (!cfg) return "her";
  if (cfg.protagonistPronouns === "he/him") return "his";
  if (cfg.protagonistPronouns === "they/them") return "their";
  return "her";
}

function defaultDynamicForPairing(pairing: string): string {
  return pairing === "Her & Her" ? "She Takes Charge" : "He Takes Charge";
}

export function buildExpressCasting(
  scenario: ExpressScenario,
  pairing: string,
  intensity: CastingRoomResult["intensity"],
  opts: {
    perspective?: CastingRoomResult["perspective"];
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
    situation?: string;
    situationId?: string;
    chooseForMe?: boolean;
    listenerName?: string;
    partnerName?: string;
    charAVoiceId?: string;
    charBVoiceId?: string;
  },
): CastingRoomResult {
  const primaryTag = scenario.tags[0] ?? defaultDynamicForPairing(pairing);
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
    perspective: opts.perspective ?? perspectiveFromPairing(pairing),
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
    charAVoiceId: opts.charAVoiceId || undefined,
    charBVoiceId: opts.charBVoiceId || undefined,
    customTags: opts.customTags?.length ? opts.customTags : undefined,
    listenerName: opts.listenerName || undefined,
    partnerName: opts.partnerName || undefined,
    situation: opts.situation || undefined,
    situationId: opts.situationId || undefined,
  };
}
