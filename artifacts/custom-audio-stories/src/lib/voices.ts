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
    recommended: true,
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
  },
  {
    id: "AeRdCCKzvd23BpJoofzx",
    displayName: "Nathaniel",
    label: "Assured",
    accent: "British",
    accentLabel: "British · Engaging",
    desc: "Warm and assured. An engaging British delivery that pulls you in and keeps you there.",
    presence: "Feels present, grounded, and quietly compelling.",
    bestFor: "Tension · Drama · His perspective",
    gender: "male",
    recommended: true,
  },
  {
    id: "n1PvBOwxb8X6m7tahp2h",
    label: "Deep",
    accent: "American",
    desc: "Rich, commanding voice. Immersive and dramatic.",
    gender: "male",
  },
  {
    id: "jfIS2w2yJi0grJZPyEsk",
    label: "Heavy",
    accent: "British",
    desc: "Heavy, textured, and intense. Weight in every word.",
    gender: "male",
  },
];

export const FEMALE_VOICES = VOICES.filter(v => v.gender === "female");
export const MALE_VOICES   = VOICES.filter(v => v.gender === "male");

export const NATHANIEL_VOICE_ID = "AeRdCCKzvd23BpJoofzx";

export const VALID_MALE_PAIRINGS = ["Her & Him", "Him & Him", "Him & Them", "Her & Them"];

export const DEFAULT_FEMALE_VOICE_ID = "FA6HhUjVbervLw2rNl8M";
export const DEFAULT_MALE_VOICE_ID   = "AeRdCCKzvd23BpJoofzx";

const HER_HER = "Her & Her";
const ALL_MALE_PAIRINGS = ["Him & Him", "Him & Them"];

const NATHANIEL = VOICES.find(v => v.id === NATHANIEL_VOICE_ID)!;

export function getVoicesForPairing(pairing: string | undefined): Voice[] {
  if (!pairing) return FEMALE_VOICES;
  if (pairing === HER_HER) return FEMALE_VOICES;
  if (ALL_MALE_PAIRINGS.includes(pairing)) return MALE_VOICES;
  return [...FEMALE_VOICES, NATHANIEL];
}

export function getDefaultVoiceId(pairing?: string): string {
  if (pairing && ALL_MALE_PAIRINGS.includes(pairing)) return DEFAULT_MALE_VOICE_ID;
  return DEFAULT_FEMALE_VOICE_ID;
}
