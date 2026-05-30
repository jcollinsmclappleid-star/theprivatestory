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

export const DEFAULT_FEMALE_VOICE_ID = CLARA_VOICE_ID;
export const DEFAULT_MALE_VOICE_ID   = JAMES_VOICE_ID;

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

export const INTENSITY_STYLE_MAP: Record<string, { narrator: number; char: number }> = {
  "Subtle":    { narrator: 0.15, char: 0.35 },
  "Tender":    { narrator: 0.15, char: 0.35 },
  "Warm":      { narrator: 0.15, char: 0.35 },
  "Heated":    { narrator: 0.25, char: 0.50 },
  "Elevated":  { narrator: 0.25, char: 0.50 },
  "Scorching": { narrator: 0.35, char: 0.70 },
  "Intense":   { narrator: 0.35, char: 0.70 },
};

// HER pool priority: Maya → Clara → Kayla
// HIM pool priority: James → Ethan → Theo
const HER_POOL = [MAYA_VOICE_ID, CLARA_VOICE_ID, KAYLA_VOICE_ID] as const;
const HIM_POOL = [JAMES_VOICE_ID, ETHAN_VOICE_ID, THEO_VOICE_ID] as const;
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

  const her   = () => HER_POOL.find(v => v !== narratorId) ?? MAYA_VOICE_ID;
  const him   = () => HIM_POOL.find(v => v !== narratorId) ?? JAMES_VOICE_ID;
  const twoHer = () => HER_POOL.filter(v => v !== narratorId);
  const twoHim = () => HIM_POOL.filter(v => v !== narratorId);

  switch (p) {
    case "her & him":
      return { charA: her(), charB: him() };
    case "her & her": {
      const [a, b] = twoHer();
      return { charA: a ?? MAYA_VOICE_ID, charB: b ?? CLARA_VOICE_ID };
    }
    case "him & him": {
      const [a, b] = twoHim();
      return { charA: a ?? JAMES_VOICE_ID, charB: b ?? ETHAN_VOICE_ID };
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
      // Threesome pairings (Her & Him & Him) and unknowns → Her & Him behaviour
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

export function getDefaultVoiceId(pairing?: string): string {
  if (pairing && ALL_MALE_PAIRINGS.includes(pairing)) return DEFAULT_MALE_VOICE_ID;
  return DEFAULT_FEMALE_VOICE_ID;
}
