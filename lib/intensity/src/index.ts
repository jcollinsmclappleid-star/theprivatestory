/** Canonical intensity labels — single source of truth for story + TTS pipelines. */
export const CANONICAL_INTENSITIES = ["Subtle", "Warm", "Elevated", "Intense"] as const;
export type CanonicalIntensity = (typeof CANONICAL_INTENSITIES)[number];

/** Marketing labels shown in the Creation Room dial / home brief. */
export const DISPLAY_INTENSITY_LABELS: Record<CanonicalIntensity, string> = {
  Subtle: "Slow burn",
  Warm: "Warm",
  Elevated: "Explicit",
  Intense: "Unrestrained",
};

/**
 * Legacy and marketing labels → canonical. Applied at API boundary and in UI
 * handoffs so unknown strings never silently fall through to Warm.
 */
export const INTENSITY_SYNONYMS: Record<string, CanonicalIntensity> = {
  Unrestrained: "Intense",
  Scorching: "Intense",
  Heated: "Elevated",
  Explicit: "Elevated",
  "Slow burn": "Subtle",
  Tender: "Subtle",
  Sensual: "Warm",
};

const LEVEL_BY_CANONICAL: Record<CanonicalIntensity, number> = {
  Subtle: 1,
  Warm: 3,
  Elevated: 4,
  Intense: 5,
};

export function canonicalizeIntensity(
  raw: string | undefined | null,
  fallback: CanonicalIntensity = "Warm",
): CanonicalIntensity {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return fallback;
  const synonym = INTENSITY_SYNONYMS[trimmed];
  if (synonym) return synonym;
  if ((CANONICAL_INTENSITIES as readonly string[]).includes(trimmed)) {
    return trimmed as CanonicalIntensity;
  }
  return fallback;
}

/** Home / BriefBuilder dial label → canonical Casting Room intensity. */
export function marketingIntensityToCanonical(label: string): CanonicalIntensity {
  switch (label.trim()) {
    case "Slow burn":
      return "Subtle";
    case "Warm":
      return "Warm";
    case "Explicit":
      return "Elevated";
    case "Unrestrained":
      return "Intense";
    default:
      return canonicalizeIntensity(label);
  }
}

export function canonicalToMarketing(intensity: CanonicalIntensity): string {
  return DISPLAY_INTENSITY_LABELS[intensity];
}

/** Numeric story level (1 / 3 / 4 / 5) for buildPrompt intensity layers. */
export function intensityToLevel(label: string): number {
  return LEVEL_BY_CANONICAL[canonicalizeIntensity(label)];
}

/** ElevenLabs style weights per canonical intensity (narrator vs character dialogue). */
export const CANONICAL_INTENSITY_STYLE: Record<
  CanonicalIntensity,
  { narrator: number; char: number }
> = {
  Subtle: { narrator: 0.15, char: 0.35 },
  Warm: { narrator: 0.15, char: 0.35 },
  Elevated: { narrator: 0.25, char: 0.50 },
  Intense: { narrator: 0.35, char: 0.70 },
};

export const DEFAULT_INTENSITY_STYLE = { narrator: 0.25, char: 0.50 };

/** Resolve TTS style from any intensity label (canonical, marketing, or legacy). */
export function intensityStyleFor(
  raw: string | undefined | null,
): { narrator: number; char: number } {
  return CANONICAL_INTENSITY_STYLE[canonicalizeIntensity(raw, "Elevated")];
}
