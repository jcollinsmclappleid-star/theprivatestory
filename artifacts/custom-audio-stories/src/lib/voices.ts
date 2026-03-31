export interface Voice {
  id: string;
  displayName?: string;
  label: string;
  accent: string;
  desc: string;
  bestFor?: string;
  gender: "female" | "male";
  recommended?: boolean;
}

export const VOICES: Voice[] = [
  {
    id: "RILOU7YmBhvwJGDGjNmP",
    displayName: "Eleanor",
    label: "Classic",
    accent: "British",
    desc: "Warm, composed narration. She takes her time. Every word lands exactly where it should.",
    bestFor: "Emotional tension, first listen, slow burn",
    gender: "female",
    recommended: true,
  },
  {
    id: "tQ4MEZFJOzsahSEEZtHK",
    displayName: "Maya",
    label: "Close",
    accent: "American",
    desc: "Softer, more intimate delivery. Feels like she is speaking just for you.",
    bestFor: "Late night, intimacy, closer delivery",
    gender: "female",
  },
  {
    id: "FA6HhUjVbervLw2rNl8M",
    displayName: "Isla",
    label: "Unhurried",
    accent: "British",
    desc: "Measured and soothing. Nothing rushed. Everything allowed to breathe.",
    bestFor: "Bedtime, calm stories, softer romance",
    gender: "female",
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

export const VALID_MALE_PAIRINGS = ["Him & Him", "Him & Them"];

export const DEFAULT_FEMALE_VOICE_ID = "RILOU7YmBhvwJGDGjNmP";
export const DEFAULT_MALE_VOICE_ID   = "AeRdCCKzvd23BpJoofzx";

export function getDefaultVoiceId(pairing?: string): string {
  if (pairing && VALID_MALE_PAIRINGS.includes(pairing)) return DEFAULT_MALE_VOICE_ID;
  return DEFAULT_FEMALE_VOICE_ID;
}

