import type { CastCategoryId } from "@/components/BriefBuilder";
import { interpolateSituation, type SituationDisplay } from "@/data/situations";

export type HomeBrief = Record<CastCategoryId, string> & {
  intensity: string;
  situationId?: string;
  situationLabel?: string;
  customTags?: string[];
};

const PAIRING_PRONOUNS: Record<string, { protagonist: string; partner: string }> = {
  "Her & Him": { protagonist: "she/her", partner: "he/him" },
  "Her & Her": { protagonist: "she/her", partner: "she/her" },
  "Him & Him": { protagonist: "he/him", partner: "he/him" },
  "Her & Them": { protagonist: "she/her", partner: "they/them" },
  "Him & Them": { protagonist: "he/him", partner: "they/them" },
  "Them & Them": { protagonist: "they/them", partner: "they/them" },
};

export function getPairingPronouns(pairing: string): {
  protagonist: string;
  partner: string;
} {
  return PAIRING_PRONOUNS[pairing] ?? { protagonist: "she/her", partner: "he/him" };
}

export function interpolateHomeSituation(
  sit: SituationDisplay,
  pairing: string,
): string {
  const { protagonist, partner } = getPairingPronouns(pairing);
  return interpolateSituation(sit, protagonist, partner);
}

export function buildLiveBriefSentence(brief: HomeBrief): string {
  const parts: string[] = [
    brief.pairing,
    brief.chemistry,
    brief.archetype,
    brief.setting,
  ];

  if (brief.situationLabel) {
    parts.push(brief.situationLabel);
  }

  parts.push(brief.intensity);

  if (brief.customTags?.length) {
    const n = brief.customTags.length;
    parts.push(`${n} desire${n === 1 ? "" : "s"} chosen`);
  }

  return parts.filter(Boolean).join(" · ");
}

export const HOME_DIMENSION_STATS = [
  { key: "pairing", label: "Pairings", total: "6" },
  { key: "chemistry", label: "Chemistries", total: "8" },
  { key: "archetype", label: "Archetypes", total: "19" },
  { key: "setting", label: "Settings", total: "200+" },
  { key: "situation", label: "Situations", total: "200+" },
  { key: "desires", label: "Desires", total: "40+" },
  { key: "intensity", label: "Intensity", total: "4" },
  { key: "voice", label: "Voices", total: "6" },
] as const;

export const HOME_STUDIO_HANDOFF_KEY = "afterDarkHomeStudioHandoff";
