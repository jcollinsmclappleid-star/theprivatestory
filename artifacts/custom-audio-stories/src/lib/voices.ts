export interface Voice {
  id: string;
  label: string;
  accent: string;
  desc: string;
  gender: "female" | "male";
  recommended?: boolean;
}

export const VOICES: Voice[] = [
  { id: "RILOU7YmBhvwJGDGjNmP", label: "Classic",    accent: "British",  desc: "Warm, composed narration. Emotionally precise and unhurried.", gender: "female", recommended: true },
  { id: "tQ4MEZFJOzsahSEEZtHK", label: "Close",      accent: "American", desc: "Softer, closer delivery. Like being whispered to.", gender: "female" },
  { id: "FA6HhUjVbervLw2rNl8M", label: "Unhurried",  accent: "British",  desc: "Measured and soothing. Steady pacing for a deeply immersive listen.", gender: "female" },
  { id: "AeRdCCKzvd23BpJoofzx", label: "Low",        accent: "British",  desc: "Low and controlled. Tension held under the surface throughout.", gender: "male" },
  { id: "n1PvBOwxb8X6m7tahp2h", label: "Deep",       accent: "American", desc: "Rich, commanding voice. Immersive and dramatic.", gender: "male" },
  { id: "jfIS2w2yJi0grJZPyEsk", label: "Heavy",      accent: "British",  desc: "Heavy, textured, and intense. Weight in every word.", gender: "male" },
];

export const FEMALE_VOICES = VOICES.filter(v => v.gender === "female");
export const MALE_VOICES   = VOICES.filter(v => v.gender === "male");

export const VALID_MALE_PAIRINGS = ["Him & Him", "Him & Them"];

export const DEFAULT_FEMALE_VOICE_ID = "RILOU7YmBhvwJGDGjNmP";
export const DEFAULT_MALE_VOICE_ID   = "AeRdCCKzvd23BpJoofzx";

export function getDefaultVoiceId(pairing?: string): string {
  if (pairing && VALID_MALE_PAIRINGS.includes(pairing)) return DEFAULT_MALE_VOICE_ID;
  return DEFAULT_FEMALE_VOICE_ID;
}
