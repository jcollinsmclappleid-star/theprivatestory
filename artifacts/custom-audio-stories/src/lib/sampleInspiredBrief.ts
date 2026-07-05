import { DEFAULT_CAST_SELECTIONS } from "@/components/BriefBuilder";
import type { EditorsPick } from "@/data/editorsPicks";
import { saveHomeBrief, SAMPLE_SCENARIO_KEY } from "@/lib/afterDarkExpress";
import type { HomeBrief } from "@/lib/homeBriefUtils";

const NARRATOR_TO_VOICE: Record<string, string> = {
  theo: "Theo",
  kayla: "Kayla",
  maya: "Maya",
  james: "James",
  clara: "Clara",
};

/** Studio teaser slug → After Dark express scenario id */
const SAMPLE_SLUG_TO_SCENARIO: Record<string, string> = {
  "02-adjoining-suites": "two_of_him",
  "06-supervisor": "the_colleague",
};

/** Map a studio teaser → minimal brief for /after-dark pre-fill. */
export function buildSampleInspiredBrief(pick: EditorsPick): HomeBrief {
  const tagSet = new Set(pick.tags.map((t) => t.toLowerCase()));
  let chemistry = DEFAULT_CAST_SELECTIONS.chemistry;
  if (tagSet.has("mfm") || pick.pairing === "Her & Him & Him") {
    chemistry = "Power Play";
  } else if (tagSet.has("forbidden") || tagSet.has("office")) {
    chemistry = "Forbidden Pull";
  } else if (tagSet.has("slow burn")) {
    chemistry = "Slow Surrender";
  }

  let setting = DEFAULT_CAST_SELECTIONS.setting;
  if (tagSet.has("hotel")) setting = "Luxury hotel";
  else if (tagSet.has("office")) setting = "Office after hours";

  return {
    pairing: pick.pairing,
    chemistry,
    archetype: tagSet.has("office") ? "The Executive" : DEFAULT_CAST_SELECTIONS.archetype,
    setting,
    voice: NARRATOR_TO_VOICE[pick.narrator] ?? pick.voiceName,
    intensity: tagSet.has("forbidden") ? "Explicit" : "Warm",
  };
}

export function handoffFromSample(pick: EditorsPick): void {
  saveHomeBrief(buildSampleInspiredBrief(pick));
  const scenarioId = SAMPLE_SLUG_TO_SCENARIO[pick.slug];
  try {
    if (scenarioId) {
      sessionStorage.setItem(SAMPLE_SCENARIO_KEY, scenarioId);
    } else {
      sessionStorage.removeItem(SAMPLE_SCENARIO_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

export function readSampleScenarioId(): string | null {
  try {
    const id = sessionStorage.getItem(SAMPLE_SCENARIO_KEY);
    if (id) sessionStorage.removeItem(SAMPLE_SCENARIO_KEY);
    return id;
  } catch {
    return null;
  }
}
