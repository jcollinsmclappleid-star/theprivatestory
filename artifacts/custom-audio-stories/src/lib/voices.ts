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
  /** Short badge in narrator picker (e.g. "Recommended", "Male narrator"). */
  recommendLabel?: string;
}

export const KAYLA_VOICE_ID = "aTxZrSrp47xsP6Ot4Kgd";
export const LISA_VOICE_ID = "PB6BdkFkZLbI39GHdnbQ";
export const SOFIA_VOICE_ID = "D9MdulIxfrCUUJcGNQon";
export const MAYA_VOICE_ID = "tQ4MEZFJOzsahSEEZtHK";
export const JAMES_VOICE_ID = "AeRdCCKzvd23BpJoofzx";
export const ETHAN_VOICE_ID = "n1PvBOwxb8X6m7tahp2h";
export const THEO_VOICE_ID = "jfIS2w2yJi0grJZPyEsk";

/** @deprecated Clara/Eleanor → Sofia */
export const CLARA_VOICE_ID = SOFIA_VOICE_ID;

export const VOICES: Voice[] = [
  {
    id: KAYLA_VOICE_ID,
    displayName: "Kayla",
    label: "Expressive",
    accent: "American",
    accentLabel: "American · Expressive",
    desc: "American expressive narration — warm, dynamic, and emotionally alive. Draws you in with natural pull.",
    bestFor: "After Dark · Romance · Main storyteller",
    gender: "female",
    recommended: true,
    recommendLabel: "Recommended narrator",
  },
  {
    id: LISA_VOICE_ID,
    displayName: "Lisa",
    label: "Sensual",
    accent: "American",
    accentLabel: "American · Sensual",
    desc: "American sensual narration — warm, close, and measured. A softer, more intimate register.",
    bestFor: "Romance · Slow burn · Closer delivery",
    gender: "female",
  },
  {
    id: THEO_VOICE_ID,
    displayName: "Theo",
    label: "Gravel",
    accent: "British",
    accentLabel: "British · Textured",
    desc: "Textured, unhurried, and deeply felt. A voice that lingers long after the story ends.",
    presence: "Feels raw, grounded, and quietly intense.",
    bestFor: "Slow burn · Dark romance · His perspective",
    gender: "male",
  },
  {
    id: SOFIA_VOICE_ID,
    displayName: "Sofia",
    label: "Warm",
    accent: "Latina",
    accentLabel: "Latina · Warm",
    desc: "Gentle Latina warmth — soothing, unhurried, and emotionally present. Every word lands with care.",
    presence: "Feels genuine, warm, and completely unhurried.",
    bestFor: "All moods · First listen · Calm presence",
    gender: "female",
  },
  {
    id: MAYA_VOICE_ID,
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
    id: JAMES_VOICE_ID,
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
    id: ETHAN_VOICE_ID,
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

/** @deprecated use JAMES_VOICE_ID */
export const JOSHUA_VOICE_ID = JAMES_VOICE_ID;

export const DEFAULT_FEMALE_VOICE_ID = KAYLA_VOICE_ID;
export const DEFAULT_MALE_VOICE_ID   = JAMES_VOICE_ID;
/** Default narrator — Kayla (American, expressive). */
export const DEFAULT_NARRATOR_VOICE_ID = KAYLA_VOICE_ID;

/** Retired voice IDs → current catalogue (saved prefs, old stories). */
export const LEGACY_VOICE_ID_MAP: Record<string, string> = {
  FA6HhUjVbervLw2rNl8M: SOFIA_VOICE_ID, // Clara / Eleanor
};

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

/** Dialogue pools — skips narrator to avoid same voice twice. */
const HER_DIALOGUE_POOL = [MAYA_VOICE_ID, KAYLA_VOICE_ID, LISA_VOICE_ID, SOFIA_VOICE_ID] as const;
const HIM_DIALOGUE_POOL = [JAMES_VOICE_ID, THEO_VOICE_ID, ETHAN_VOICE_ID] as const;
const HIM_DIALOGUE_POOL_STANDARD = [JAMES_VOICE_ID, THEO_VOICE_ID] as const;
const MALE_NARRATOR_IDS = new Set([JAMES_VOICE_ID, ETHAN_VOICE_ID, THEO_VOICE_ID]);

function isHimAndHimPairing(pairing: string | undefined): boolean {
  return (pairing ?? "").toLowerCase().trim() === "him & him";
}

function himDialoguePool(pairing: string | undefined): readonly string[] {
  return isHimAndHimPairing(pairing) ? HIM_DIALOGUE_POOL : HIM_DIALOGUE_POOL_STANDARD;
}

function pickHerDialogue(narratorId: string): string {
  return HER_DIALOGUE_POOL.find((v) => v !== narratorId) ?? MAYA_VOICE_ID;
}

function pickHimDialogue(narratorId: string, pairing?: string): string {
  return himDialoguePool(pairing).find((v) => v !== narratorId) ?? JAMES_VOICE_ID;
}

/**
 * Resolve CHAR_A (protagonist dialogue) and CHAR_B (love interest dialogue).
 * Neither returned voice equals narratorId when another option exists.
 */
export function resolveCharacterVoices(
  narratorId: string,
  pairing: string,
): { charA: string; charB: string } {
  const resolved = LEGACY_VOICE_ID_MAP[narratorId] ?? narratorId;
  const p = (pairing ?? "").toLowerCase().trim();
  const isMale = MALE_NARRATOR_IDS.has(resolved);
  const twoHer = () => HER_DIALOGUE_POOL.filter((v) => v !== resolved);
  const twoHim = () => himDialoguePool(pairing).filter((v) => v !== resolved);

  switch (p) {
    case "her & him":
      return { charA: pickHerDialogue(resolved), charB: pickHimDialogue(resolved, pairing) };
    case "her & her": {
      const [a, b] = twoHer();
      return { charA: a ?? MAYA_VOICE_ID, charB: b ?? KAYLA_VOICE_ID };
    }
    case "him & him": {
      const [a, b] = twoHim();
      return { charA: a ?? JAMES_VOICE_ID, charB: b ?? THEO_VOICE_ID };
    }
    case "her & them":
      return { charA: pickHerDialogue(resolved), charB: pickHimDialogue(resolved, pairing) };
    case "him & them":
      return { charA: pickHimDialogue(resolved, pairing), charB: pickHerDialogue(resolved) };
    case "them & them":
      return isMale
        ? { charA: pickHimDialogue(resolved, pairing), charB: pickHerDialogue(resolved) }
        : { charA: pickHerDialogue(resolved), charB: pickHimDialogue(resolved, pairing) };
    default:
      return { charA: pickHerDialogue(resolved), charB: pickHimDialogue(resolved, pairing) };
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
  const base =
    pairing && ALL_MALE_PAIRINGS.includes(pairing)
      ? [...MALE_VOICES, ...FEMALE_VOICES]
      : [...FEMALE_VOICES, ...MALE_VOICES];
  const filtered = isHimAndHimPairing(pairing)
    ? base
    : base.filter((v) => v.id !== ETHAN_VOICE_ID);
  return [...filtered].sort((a, b) => {
    const ar = a.recommended ? 0 : 1;
    const br = b.recommended ? 0 : 1;
    if (ar !== br) return ar - br;
    return 0;
  });
}

export function getDefaultVoiceId(_pairing?: string): string {
  return DEFAULT_NARRATOR_VOICE_ID;
}

export function voiceDisplayName(voiceId: string): string {
  const resolved = LEGACY_VOICE_ID_MAP[voiceId] ?? voiceId;
  const v = VOICES.find((voice) => voice.id === resolved);
  return v?.displayName ?? v?.label ?? "Narrator";
}

export type CastVoiceRole = "narrator" | "charA" | "charB";

/** Chip labels for the three-voice cast row (pairing-aware). */
export function getCastRoleChips(pairing: string): { role: CastVoiceRole; label: string }[] {
  const { labelA, labelB } = getCastLabels(pairing);
  return [
    { role: "narrator", label: "Narrator" },
    { role: "charA", label: labelA },
    { role: "charB", label: labelB },
  ];
}

function dialoguePoolForRole(role: "charA" | "charB", pairing: string): readonly string[] {
  const p = (pairing ?? "").toLowerCase().trim();
  const himPool = himDialoguePool(pairing);
  if (role === "charA") {
    if (p.startsWith("him &")) return himPool;
    return HER_DIALOGUE_POOL;
  }
  if (p.startsWith("her & her")) return HER_DIALOGUE_POOL;
  if (p.startsWith("him & him")) return himPool;
  if (p.startsWith("her & him")) return himPool;
  if (p.startsWith("him & them")) return HER_DIALOGUE_POOL;
  if (p.startsWith("her & them")) return himPool;
  return [...HER_DIALOGUE_POOL, ...himPool];
}

/** Voices available for a cast role — excludes narrator from dialogue pools when possible. */
export function getVoicesForCastRole(
  role: CastVoiceRole,
  pairing: string,
  narratorId: string,
): Voice[] {
  if (role === "narrator") return getVoicesForPairing(pairing);
  const pool = dialoguePoolForRole(role, pairing);
  const voices = pool
    .map((id) => VOICES.find((v) => v.id === id))
    .filter((v): v is Voice => !!v)
    .filter((v) => v.id !== narratorId);
  if (voices.length > 0) return voices;
  return pool.map((id) => VOICES.find((v) => v.id === id)).filter((v): v is Voice => !!v);
}

/** Default char voices when user hasn't picked — same logic as resolveCharacterVoices. */
export function defaultCastVoices(narratorId: string, pairing: string): { charA: string; charB: string } {
  return resolveCharacterVoices(narratorId, pairing);
}
