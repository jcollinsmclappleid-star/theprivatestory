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

export const VOICE_IDENTITY: Record<string, { gradient: string; ring: string; svgFill: string }> = {
  "RILOU7YmBhvwJGDGjNmP": {
    gradient: "from-amber-950 via-yellow-900/60 to-stone-950",
    ring: "ring-amber-700/40",
    svgFill: "#c9a227",
  },
  "tQ4MEZFJOzsahSEEZtHK": {
    gradient: "from-rose-950 via-pink-900/50 to-stone-950",
    ring: "ring-rose-700/40",
    svgFill: "#d4768a",
  },
  "FA6HhUjVbervLw2rNl8M": {
    gradient: "from-slate-900 via-blue-950/60 to-stone-950",
    ring: "ring-slate-600/40",
    svgFill: "#8ba7c7",
  },
  "AeRdCCKzvd23BpJoofzx": {
    gradient: "from-stone-900 via-neutral-800/60 to-stone-950",
    ring: "ring-stone-600/30",
    svgFill: "#7a7068",
  },
  "n1PvBOwxb8X6m7tahp2h": {
    gradient: "from-zinc-900 via-neutral-800/60 to-zinc-950",
    ring: "ring-zinc-600/30",
    svgFill: "#6b7280",
  },
  "jfIS2w2yJi0grJZPyEsk": {
    gradient: "from-neutral-900 via-stone-800/60 to-neutral-950",
    ring: "ring-neutral-600/30",
    svgFill: "#78716c",
  },
};
