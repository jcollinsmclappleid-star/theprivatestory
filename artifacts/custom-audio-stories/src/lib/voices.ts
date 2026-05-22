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
    displayName: "James",
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

export const JAMES_VOICE_ID = "AeRdCCKzvd23BpJoofzx";
/** @deprecated use JAMES_VOICE_ID */
export const JOSHUA_VOICE_ID = JAMES_VOICE_ID;
export const THEO_VOICE_ID   = "jfIS2w2yJi0grJZPyEsk";

export const DEFAULT_FEMALE_VOICE_ID = "FA6HhUjVbervLw2rNl8M";
export const DEFAULT_MALE_VOICE_ID   = "AeRdCCKzvd23BpJoofzx";

const ALL_MALE_PAIRINGS = ["Him & Him", "Him & Them"];

export function getVoicesForPairing(pairing: string | undefined): Voice[] {
  // All-male pairings naturally lead with male voices, female options still available below.
  if (pairing && ALL_MALE_PAIRINGS.includes(pairing)) {
    return [...MALE_VOICES, ...FEMALE_VOICES];
  }
  // Everyone else (including no pairing, Her & Her, Her & Him, Her & Them):
  // female voices first (product default), male voices offered as additional options.
  return [...FEMALE_VOICES, ...MALE_VOICES];
}

export function getDefaultVoiceId(pairing?: string): string {
  if (pairing && ALL_MALE_PAIRINGS.includes(pairing)) return DEFAULT_MALE_VOICE_ID;
  return DEFAULT_FEMALE_VOICE_ID;
}
