import type { ExpressScenario } from "@/lib/afterDarkExpress";

export type ExpressSummaryBrief = {
  scenario: ExpressScenario | null;
  pairing: string | null;
  country: string;
  city: string;
  setting: string;
  afterDarkScene: string;
  atmosphere: string;
  heritage: string;
  chemistry: string;
  mood: string;
  customTags: string[];
  situationId?: string;
  situationLabel?: string;
};

/** One flowing summary line — grouped logically, no chip soup */
export function buildExpressSummaryLine(brief: ExpressSummaryBrief, act: number): string | null {
  const parts: string[] = [];

  if (brief.pairing) {
    const who =
      brief.heritage && brief.heritage !== "Ambiguous"
        ? `${brief.pairing} · ${brief.heritage}`
        : brief.pairing;
    parts.push(who);
  }

  if (act >= 1 && brief.scenario) {
    parts.push(brief.scenario.label.replace(/\.$/, ""));
  }

  if (act >= 2) {
    const place = [brief.city, brief.country].filter(Boolean).join(", ");
    const scene = (brief.afterDarkScene || brief.setting || "").replace(/ \(.*\)/, "");
    if (place) parts.push(place);
    if (scene) parts.push(scene);
    if (brief.chemistry) parts.push(brief.chemistry.replace(/ Dominates$/, " leads"));
  }

  if (act >= 3 && brief.situationLabel) {
    parts.push(brief.situationLabel.replace(/\.$/, ""));
  }

  if (act >= 4 && brief.customTags.length > 0) {
    parts.push(`${brief.customTags.length} desire${brief.customTags.length === 1 ? "" : "s"} chosen`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export type ExpressSummaryGroups = {
  who: string | null;
  situation: string | null;
  fantasy: string | null;
  world: string | null;
  heat: string | null;
  desires: string | null;
};

export function buildExpressSummaryGroups(brief: ExpressSummaryBrief): ExpressSummaryGroups {
  const who =
    brief.pairing
      ? brief.heritage && brief.heritage !== "Ambiguous"
        ? `${brief.pairing} · ${brief.heritage}`
        : brief.pairing
      : null;

  const situation = brief.situationLabel ?? null;

  const fantasy = brief.scenario?.label ?? null;

  const place = [brief.city, brief.country].filter(Boolean).join(", ");
  const scene = (brief.afterDarkScene || brief.setting || "").replace(/ \(.*\)/, "");
  const world = [place, scene, brief.atmosphere].filter(Boolean).join(" · ") || null;

  const heat = [brief.chemistry, brief.mood].filter(Boolean).join(" · ") || null;

  const desires =
    brief.customTags.length > 0
      ? `${brief.customTags.length} explicit desire${brief.customTags.length === 1 ? "" : "s"}`
      : null;

  return { who, situation, fantasy, world, heat, desires };
}
