export interface Voice {
  id: string;
  displayName?: string;
  label: string;
  accent: string;
  accentLabel?: string;
  desc: string;
  presence?: string;
  bestFor?: string;
  gender: "female" | "male";
  recommended?: boolean;
}

export const VOICES: Voice[] = [
  {
    id: "jfIS2w2yJi0grJZPyEsk",
    displayName: "Theo",
    label: "Gravel",
    accent: "British",
    accentLabel: "British · Textured",
    desc: "Textured, unhurried, and deeply felt. A voice that lingers long after the story ends.",
    presence: "Feels raw, grounded, and quietly intense.",
    bestFor: "Slow burn · Dark romance · His perspective",
    gender: "male",
    recommended: true,
  },
  {
    id: "aTxZrSrp47xsP6Ot4Kgd",
    displayName: "Kayla",
    label: "Expressive",
    accent: "American",
    accentLabel: "American · Warm",
    desc: "Expressive and calm. Rich narrative delivery with natural warmth and engaging presence.",
    bestFor: "Emotional scenes · Romance · Engaging tone",
    gender: "female",
    recommended: true,
  },
  {
    id: "FA6HhUjVbervLw2rNl8M",
    displayName: "Clara",
    label: "Soothing",
    accent: "British",
    accentLabel: "British · Warm",
    desc: "Warm, measured narration. Nothing rushed. Everything allowed to breathe, drawing you in completely.",
    presence: "Feels genuine, warm, and completely unhurried.",
    bestFor: "All moods · First listen · Calm presence",
    gender: "female",
  },
  {
    id: "tQ4MEZFJOzsahSEEZtHK",
    displayName: "Maya",
    label: "Close",
    accent: "American",
    accentLabel: "American · Intimate",
    desc: "Softer, closer delivery. Feels like she's speaking just for you — quiet, intimate, and immediate.",
    presence: "Feels personal, warm, and quietly intense.",
    bestFor: "Late night · Intimacy · Closer delivery",
    gender: "female",
  },
  {
    id: "AeRdCCKzvd23BpJoofzx",
    displayName: "James",
    label: "Assured",
    accent: "British",
    accentLabel: "British · Engaging",
    desc: "Warm and assured. An engaging British delivery that pulls you in and keeps you there.",
    presence: "Feels present, grounded, and quietly compelling.",
    bestFor: "Tension · Drama · His perspective",
    gender: "male",
  },
  {
    id: "n1PvBOwxb8X6m7tahp2h",
    displayName: "Ethan",
    label: "Deep",
    accent: "American",
    accentLabel: "American · Commanding",
    desc: "Rich, commanding voice. Immersive and dramatic. Each word carries weight.",
    presence: "Feels powerful, deliberate, and totally present.",
    bestFor: "Intensity · Drama · Deep fantasy",
    gender: "male",
  },
];

export const FEMALE_VOICES = VOICES.filter(v => v.gender === "female");
export const MALE_VOICES   = VOICES.filter(v => v.gender === "male");

export const CLARA_VOICE_ID  = "FA6HhUjVbervLw2rNl8M";
export const MAYA_VOICE_ID   = "tQ4MEZFJOzsahSEEZtHK";
export const KAYLA_VOICE_ID  = "aTxZrSrp47xsP6Ot4Kgd";
export const JAMES_VOICE_ID  = "AeRdCCKzvd23BpJoofzx";
export const ETHAN_VOICE_ID  = "n1PvBOwxb8X6m7tahp2h";
export const THEO_VOICE_ID   = "jfIS2w2yJi0grJZPyEsk";

/** @deprecated use JAMES_VOICE_ID */
export const JOSHUA_VOICE_ID = JAMES_VOICE_ID;

export const DEFAULT_FEMALE_VOICE_ID = KAYLA_VOICE_ID;
export const DEFAULT_MALE_VOICE_ID   = THEO_VOICE_ID;
/** Default narrator across the product — Theo (British, textured). */
export const DEFAULT_NARRATOR_VOICE_ID = THEO_VOICE_ID;

export const NARRATOR_VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.80,
  style: 0.25,
  use_speaker_boost: true,
} as const;

export const CHAR_VOICE_SETTINGS = {
  stability: 0.40,
  similarity_boost: 0.82,
  style: 0.50,
  use_speaker_boost: true,
} as const;

export {
  CANONICAL_INTENSITY_STYLE as INTENSITY_STYLE_MAP,
  intensityStyleFor,
} from "@workspace/intensity";

// HER pool priority: Kayla → Maya → Clara
// HIM pool priority: Theo → James → Ethan
const HER_POOL = [KAYLA_VOICE_ID, MAYA_VOICE_ID, CLARA_VOICE_ID] as const;
const HIM_POOL = [THEO_VOICE_ID, JAMES_VOICE_ID, ETHAN_VOICE_ID] as const;
const MALE_NARRATOR_IDS = new Set([JAMES_VOICE_ID, ETHAN_VOICE_ID, THEO_VOICE_ID]);

/**
 * Resolve CHAR_A (protagonist dialogue) and CHAR_B (love interest dialogue)
 * for a given narrator voice + story pairing.
 * Neither returned voice will equal narratorId.
 */
export function resolveCharacterVoices(
  narratorId: string,
  pairing: string,
): { charA: string; charB: string } {
  const p = (pairing ?? "").toLowerCase().trim();
  const isMale = MALE_NARRATOR_IDS.has(narratorId);

  const her   = () => HER_POOL.find(v => v !== narratorId) ?? KAYLA_VOICE_ID;
  const him   = () => HIM_POOL.find(v => v !== narratorId) ?? THEO_VOICE_ID;
  const twoHer = () => HER_POOL.filter(v => v !== narratorId);
  const twoHim = () => HIM_POOL.filter(v => v !== narratorId);

  switch (p) {
    case "her & him":
      return { charA: her(), charB: him() };
    case "her & her": {
      const [a, b] = twoHer();
      return { charA: a ?? KAYLA_VOICE_ID, charB: b ?? MAYA_VOICE_ID };
    }
    case "him & him": {
      const [a, b] = twoHim();
      return { charA: a ?? THEO_VOICE_ID, charB: b ?? JAMES_VOICE_ID };
    }
    case "her & them":
      return { charA: her(), charB: him() };
    case "him & them":
      return { charA: him(), charB: her() };
    case "them & them":
      return isMale
        ? { charA: him(), charB: her() }
        : { charA: her(), charB: him() };
    default:
      return { charA: her(), charB: him() };
  }
}

/** Display labels for cast preview chips based on pairing */
export function getCastLabels(pairing: string): { labelA: string; labelB: string } {
  const p = (pairing ?? "").toLowerCase().trim();
  if (p === "her & her")  return { labelA: "Her voice", labelB: "Her voice" };
  if (p === "him & him")  return { labelA: "His voice", labelB: "His voice" };
  if (p === "him & them") return { labelA: "His voice", labelB: "Their voice" };
  if (p === "her & them") return { labelA: "Her voice", labelB: "Their voice" };
  if (p === "them & them") return { labelA: "Their voice", labelB: "Their voice" };
  return { labelA: "Her voice", labelB: "His voice" };
}

const ALL_MALE_PAIRINGS = ["Him & Him", "Him & Them"];

export function getVoicesForPairing(pairing: string | undefined): Voice[] {
  if (pairing && ALL_MALE_PAIRINGS.includes(pairing)) {
    return [...MALE_VOICES, ...FEMALE_VOICES];
  }
  return [...FEMALE_VOICES, ...MALE_VOICES];
}

export function getDefaultVoiceId(_pairing?: string): string {
  return DEFAULT_NARRATOR_VOICE_ID;
}
