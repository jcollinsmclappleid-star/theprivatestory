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
    id: "IaDFOlnnCT0PtDisEmcR",
    displayName: "Clara",
    label: "Warm",
    accent: "British",
    accentLabel: "British · Warm",
    desc: "Warm, expressive narration. Present and immediate, with a natural quality that draws you straight into the scene.",
    presence: "Feels genuine, warm, and completely unhurried.",
    bestFor: "All moods · First listen · Natural delivery",
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
    id: "FA6HhUjVbervLw2rNl8M",
    displayName: "Isla",
    label: "Unhurried",
    accent: "British",
    accentLabel: "British · Refined",
    desc: "Measured and soothing. Nothing rushed. Everything allowed to breathe.",
    bestFor: "Bedtime · Calm stories · Softer romance",
    gender: "female",
  },
  {
    id: "GnBFl759Iuvi5mfB5b2x",
    displayName: "Kayla",
    label: "Expressive",
    accent: "American",
    accentLabel: "American · Warm",
    desc: "Expressive and warm. Rich emotion on every line, delivered with natural American warmth.",
    bestFor: "Emotional scenes · Romance · Warmth",
    gender: "female",
  },
  {
    id: "pvVzZzZWR8S5FsiMztVE",
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
    id: "AeRdCCKzvd23BpJoofzx",
    label: "Low",
    accent: "British",
    desc: "Low and controlled. Tension held under the surface throughout.",
    gender: "male",
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

export const VALID_MALE_PAIRINGS = ["Her & Him", "Him & Him", "Him & Them", "Her & Them"];

export const DEFAULT_FEMALE_VOICE_ID = "IaDFOlnnCT0PtDisEmcR";
export const DEFAULT_MALE_VOICE_ID   = "pvVzZzZWR8S5FsiMztVE";

export function getDefaultVoiceId(pairing?: string): string {
  if (pairing && VALID_MALE_PAIRINGS.includes(pairing)) return DEFAULT_MALE_VOICE_ID;
  return DEFAULT_FEMALE_VOICE_ID;
}
