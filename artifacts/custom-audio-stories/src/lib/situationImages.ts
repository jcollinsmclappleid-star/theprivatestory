import { act4 } from "@/lib/chemistryImages";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const img = (path: string) => `${BASE}/${path.replace(/^\//, "")}`;

export type SituationVisualMeta = { image: string; accent: string };

/** Category thumbnails for home situation picker. */
export const SITUATION_CATEGORY_VISUALS: Record<string, SituationVisualMeta> = {
  "Forbidden & Complicated": { image: img(act4("penthouse-hotel-mf")), accent: "#c9a227" },
  "Reunion & Return": { image: img(act4("yours")), accent: "#f472b6" },
  "First & Unknown": { image: img(act4("desire-she")), accent: "#e879a0" },
  "Tension & Pull": { image: img(act4("tension")), accent: "#fb7185" },
  "Complex & Unspoken": { image: img(act4("plot")), accent: "#a78bfa" },
  "Circumstance & Proximity": { image: img(act4("scene")), accent: "#34d399" },
  "Secrets & Unspoken": { image: img(act4("restraint-bdsm-v3")), accent: "#818cf8" },
  "High Stakes": { image: img(act4("devotion")), accent: "#ef4444" },
  "Slow Burn & Patience": { image: img(act4("romance")), accent: "#f9a8d4" },
  "Professional Tension": { image: img(act4("style-written")), accent: "#60a5fa" },
  "Her Desire": { image: img(act4("her-dominance")), accent: "#e11d48" },
};

/** Curated home picks — unique art per scenario tile. */
export const HOME_SITUATION_VISUALS: Record<string, SituationVisualMeta> = {
  fc_01: { image: img(act4("tension")), accent: "#c9a227" },
  rr_01: { image: img(act4("ending")), accent: "#f472b6" },
  fu_04: { image: img(act4("desire-she")), accent: "#e879a0" },
  pt_03: { image: img(act4("style-written")), accent: "#60a5fa" },
  cp_02: { image: img(act4("scene")), accent: "#34d399" },
  sb_02: { image: img(act4("romance")), accent: "#f9a8d4" },
  pt_01: { image: img(act4("desire-he")), accent: "#6b8cce" },
  hd_01: { image: img(act4("submission-worship")), accent: "#e11d48" },
};

export function situationVisualMeta(situationId: string, category: string): SituationVisualMeta {
  return (
    HOME_SITUATION_VISUALS[situationId] ??
    SITUATION_CATEGORY_VISUALS[category] ?? {
      image: img(act4("plot")),
      accent: "#c9a227",
    }
  );
}

/** Short tile label from full situation copy. */
export function situationTileLabel(label: string, maxWords = 5): string {
  const words = label.replace(/\.$/, "").split(/\s+/);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}
