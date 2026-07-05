import { HOME_STORY_SHOWCASES } from "@/lib/homeStoryShowcases";
import { PAIRING_IMAGES } from "@/lib/chemistryImages";
import { preloadImages } from "@/lib/preloadImages";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function url(path: string): string {
  return `${BASE}/${path.replace(/^\//, "")}`;
}

/** Warm cache for homepage carousel + express pairing heroes. */
export function preloadHomeCriticalImages(): void {
  const carousel = HOME_STORY_SHOWCASES.map((s) => url(s.image));
  const pairings = Object.values(PAIRING_IMAGES).map((p) => url(p));
  preloadImages([...carousel.slice(0, 3), ...pairings.slice(0, 4)]);
}

/** All carousel covers — call when showcase section nears viewport. */
export function preloadHomeCarouselImages(): void {
  preloadImages(HOME_STORY_SHOWCASES.map((s) => url(s.image)));
}

/** Express Act IV pairing + category pool (subset). */
export function preloadExpressPairingImages(): void {
  preloadImages(Object.values(PAIRING_IMAGES).map((p) => url(p)));
}
