import { buildChemistries } from "@/components/CastingRoom";
import { pairingImage } from "@/lib/chemistryImages";
import { getScenarioImage } from "@/lib/scenarioImages";
import { getScenarioRoomImage } from "@/lib/storyReveal";

export type PaywallCoverInput = {
  baseUrl: string;
  pairing?: string | null;
  /** Chemistry id from casting (e.g. "Forbidden Pull") */
  chemistry?: string | null;
  scenarioId?: string | null;
  scenarioRoom?: string | null;
  setting?: string | null;
};

/**
 * Curated fallback cover art for the paywall — same Act IV / room library as the homepage.
 * Used when AI preview generation fails or is still loading.
 */
export function resolvePaywallCoverUrl(input: PaywallCoverInput): string {
  const base = input.baseUrl.endsWith("/") ? input.baseUrl : `${input.baseUrl}/`;

  if (input.scenarioId && input.scenarioRoom) {
    return getScenarioImage(input.scenarioId, input.scenarioRoom, base);
  }

  const chemistryKey = input.chemistry?.trim();
  if (input.pairing && chemistryKey) {
    const chem = buildChemistries(input.pairing).find(
      (c) => c.id === chemistryKey || c.label === chemistryKey,
    );
    if (chem?.image) {
      const path = chem.image.startsWith("images/") ? chem.image : `images/${chem.image}`;
      return `${base}${path}`;
    }
  }

  const pairingPath = pairingImage(input.pairing ?? undefined);
  if (pairingPath) {
    return `${base}${pairingPath}`;
  }

  const roomImage = getScenarioRoomImage(input.scenarioRoom ?? undefined, base);
  if (roomImage) return roomImage;

  return `${base}images/creation-room-hero.webp`;
}
