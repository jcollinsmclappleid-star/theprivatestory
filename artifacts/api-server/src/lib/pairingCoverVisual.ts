/**
 * Pairing-aware cover/scene image prompts — figure composition + unwanted visual guardrails.
 */

export function normalisePairingLabel(pairing?: string): string {
  return (pairing ?? "Her & Him").trim();
}

/** Who appears on the cover for this pairing (always two figures). */
export function pairingCoverFigures(pairing?: string): string {
  const p = normalisePairingLabel(pairing).toLowerCase();
  if (p.startsWith("her & her")) return "two women close together, both clearly women";
  if (p.startsWith("him & him")) return "two men close together, both clearly men";
  if (p.startsWith("her & him")) return "a woman and a man in close proximity";
  if (p.startsWith("her & them")) return "a woman and a nonbinary-presenting partner in close proximity";
  if (p.startsWith("him & them")) return "a man and a nonbinary-presenting partner in close proximity";
  if (p.startsWith("them & them")) return "two androgynous or nonbinary-presenting people in close proximity";
  return "a woman and a man in close proximity";
}

const HERITAGE_IMAGE_LABELS: Record<string, string> = {
  Latina: "Latina",
  Black: "Black",
  "South Asian": "South Asian",
  European: "European",
  "East Asian": "East Asian",
  "Middle Eastern": "Middle Eastern",
  Indigenous: "Indigenous",
};

/** Resolve a casting heritage id to a visual ethnicity descriptor (undefined for Ambiguous / unknown). */
export function heritageImageLabel(heritage?: string): string | undefined {
  const key = heritage?.trim() ?? "";
  if (!key || key === "Ambiguous") return undefined;
  return HERITAGE_IMAGE_LABELS[key];
}

/** Casting-room cover subject line — heritage applies to both characters when specified. */
export function pairingCastingSubject(pairing?: string, heritage?: string): string {
  const p = normalisePairingLabel(pairing).toLowerCase();
  const ethnicity = heritageImageLabel(heritage);
  const h = ethnicity ? `${ethnicity} ` : "";

  if (p.startsWith("her & her")) {
    return ethnicity
      ? `two ${h}women close together, both clearly ${ethnicity} women`
      : "two women close together, both clearly women";
  }
  if (p.startsWith("him & him")) {
    return ethnicity
      ? `two ${h}men close together, both clearly ${ethnicity} men`
      : "two men close together, both clearly men";
  }
  if (p.startsWith("her & him")) {
    return ethnicity
      ? `a ${h}woman and a ${h}man in close proximity`
      : "a woman and a man in close proximity";
  }
  if (p.startsWith("her & them")) {
    return ethnicity
      ? `a ${h}woman and a ${h}nonbinary-presenting partner in close proximity`
      : "a woman and a nonbinary-presenting partner in close proximity";
  }
  if (p.startsWith("him & them")) {
    return ethnicity
      ? `a ${h}man and a ${h}nonbinary-presenting partner in close proximity`
      : "a man and a nonbinary-presenting partner in close proximity";
  }
  if (p.startsWith("them & them")) {
    return ethnicity
      ? `two ${h}androgynous or nonbinary-presenting people in close proximity`
      : "two androgynous or nonbinary-presenting people in close proximity";
  }
  return ethnicity
    ? `a ${h}woman and a ${h}man in close proximity`
    : "a woman and a man in close proximity";
}

/** Instruction block for LLM visual extraction — pairing + ethnicity. */
export function pairingImageExtractionGuide(pairing?: string, heritage?: string): string {
  const label = normalisePairingLabel(pairing);
  const figures = pairingCastingSubject(pairing, heritage);
  const ethnicityLine = heritageImageLabel(heritage)
    ? `HERITAGE (${heritageImageLabel(heritage)}): Both characters must visibly reflect ${heritageImageLabel(heritage)} heritage — skin tone, features, and presence. Do not default to European or light-skinned appearances.`
    : "HERITAGE: Reflect global human diversity; do not default to European or light-skinned appearances.";
  return `PAIRING (${label}): Cover and every scene must show exactly ${figures}. Do not swap genders or default to a generic man-and-woman couple unless that is the pairing. ${ethnicityLine}`;
}

/** Hardcoded casting lock prepended to every DALL-E cover prompt. */
export function buildCastingCoverLock(pairing?: string, heritage?: string): string {
  const figures = pairingCastingSubject(pairing, heritage);
  const heritageLabel = heritageImageLabel(heritage);
  const ethnicityBlock = heritageLabel
    ? `Both figures MUST read as ${heritageLabel} — skin tone, facial features, and hair texture clearly ${heritageLabel}. Never European or light-skinned default.`
    : "Show clearly diverse, non-default casting — never generic European stock faces.";
  return [
    `CASTING LOCK: Show exactly ${figures}.`,
    ethnicityBlock,
    "Wrong genders or swapped roles invalidates the image.",
  ].join(" ");
}

export const IMAGE_NEGATIVE_SUFFIX =
  "no flames, no fire, no bonfires, no burning, no explosions, no smoke plumes, no fantasy creatures, no dragons, no visible text, no logos";

/** Strip or soften words that commonly produce unwanted DALL-E imagery (flames, literal fire, etc.). */
export function sanitizeUnwantedImageVisuals(text: string): string {
  if (!text) return "";
  let result = text
    .replace(/\bfirelit\b/gi, "warm ambient glow")
    .replace(/\bcandle\s*flames?\b/gi, "soft candle glow")
    .replace(/\bopen\s+flames?\b/gi, "warm ambient light")
    .replace(/\bflames?\b/gi, "")
    .replace(/\bbonfires?\b/gi, "")
    .replace(/\binfernos?\b/gi, "")
    .replace(/\bplaying\s+with\s+fire\b/gi, "charged emotional tension")
    .replace(/\b(?:on\s+)?fire\b/gi, "warm glow")
    .replace(/\bburning\b/gi, "glowing")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
  return result;
}

export function appendImageSafetyConstraints(prompt: string): string {
  const cleaned = sanitizeUnwantedImageVisuals(prompt);
  if (cleaned.toLowerCase().includes("no flames")) return cleaned;
  return `${cleaned}, ${IMAGE_NEGATIVE_SUFFIX}`;
}
