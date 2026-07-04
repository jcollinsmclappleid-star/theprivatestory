/** Act IV asset path helper */
export function act4(slug: string): string {
  return `images/express-act4-${slug}.webp`;
}

/**
 * Fixed pairing hero/CTA art — Act IV character illustrations (not legacy prop photos).
 * Paywall covers are still AI-generated via POST /api/preview-cover; pairing tiles use these only.
 */
export const PAIRING_IMAGES: Record<string, string> = {
  /** M+F · rope restraint · gallery characters */
  "Her & Him": act4("restraint-bdsm-v2"),
  /** F+F · sunlit embrace */
  "Her & Her": act4("feel"),
  /** M portrait — no dedicated M+M duo in library yet */
  "Him & Him": act4("desire-he"),
  /** Woman lead · intimate POV */
  "Her & Them": act4("desire-she"),
  /** Man lead · rain-lit portrait */
  "Him & Them": act4("desire-he"),
  /** Two-person rooftop intimacy */
  "Them & Them": act4("desire-they"),
};

/** Human-readable catalog for pairing → image assignments. */
export const PAIRING_IMAGE_CATALOG = [
  { pairing: "Her & Him", slug: "restraint-bdsm-v2", pairingType: "M+F", tone: "BDSM · characters" },
  { pairing: "Her & Her", slug: "feel", pairingType: "F+F", tone: "Embrace · characters" },
  { pairing: "Him & Him", slug: "desire-he", pairingType: "M solo", tone: "Male lead portrait" },
  { pairing: "Her & Them", slug: "desire-she", pairingType: "F lead", tone: "Female lead portrait" },
  { pairing: "Him & Them", slug: "desire-he", pairingType: "M lead", tone: "Male lead portrait" },
  { pairing: "Them & Them", slug: "desire-they", pairingType: "Couple", tone: "Rooftop intimacy" },
] as const;

export function pairingImage(pairingId: string | null | undefined): string | undefined {
  if (!pairingId) return undefined;
  return PAIRING_IMAGES[pairingId];
}

/** Sensual Act IV illustrations for casting-room chemistry tiles. */
export const CHEMISTRY_IMAGES = {
  takesCharge: act4("restraint-bdsm"),
  equalTension: act4("tension"),
  leads: act4("her-dominance"),
  pushPull: act4("praise-words"),
  slowSurrender: act4("romance"),
  powerPlay: act4("restraint-bdsm-v2"),
  forbidden: act4("dark-fantasy"),
  devotion: act4("submission-worship"),
  rivals: act4("scene"),
  lovers: act4("feel"),
  playful: act4("desire-they"),
  romantic: act4("romance"),
  bestFriend: act4("yours"),
  sweetTender: act4("devotion"),
  nervous: act4("desire-she"),
} as const;

/**
 * Home Creation Studio — one unique Act IV image per tile.
 * Pairing-accurate (M+F / F+F / MFM) and no repeats within each row.
 * Defaults across tabs are also distinct (see comment per key).
 */
export const HOME_STUDIO_IMAGES = {
  pairing: {
    /** M+F · BDSM characters (not rain-street prop) */
    herHim: act4("restraint-bdsm-v2"),
    /** F+F · sunlit embrace */
    herHer: act4("feel"),
    /** MFM · penthouse trio */
    mfm: act4("scene"),
  },
  chemistry: {
    /** M+F almost-kiss */
    forbidden: act4("tension"),
    /** Woman centred, two admirers */
    power: act4("devotion"),
    /** M+F intimate whisper */
    surrender: act4("praise-words"),
    /** F+F rooftop charged */
    pushPull: act4("desire-they"),
  },
  archetype: {
    executive: act4("desire-he"),
    professor: act4("style-written"),
    stranger: act4("desire-she"),
    charmer: act4("her-dominance"),
  },
  intensity: {
    slowBurn: act4("romance"),
    warm: act4("ending"),
    /** Restrained explicit — cuffs / tension */
    explicit: act4("restraint-bdsm-v3"),
    /** No limits — darker, distinct from explicit */
    unrestrained: act4("dark-fantasy"),
  },
} as const;
