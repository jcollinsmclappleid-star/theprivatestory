---
name: Intensity canonicalization + unrestrained floor
description: Why explicit sex scenes silently vanished — frontend intensity labels not in VALID_INTENSITIES get rewritten to "Warm" before the explicit gate runs.
---

# Intensity must be canonicalized before validation, and floored for unrestrained mode

`normaliseIntake` validates `raw.intensity` against `VALID_INTENSITIES` = ["Subtle","Warm","Elevated","Intense"]. Any label NOT in that list silently falls through to "Warm" (level 3). The After Dark door sends `"Unrestrained"` and the paywall fallback sends `"Heated"` — both got neutered to Warm, so `labelToIntensityLevel` returned 3, the explicit-content contract (`numericLevel >= 4`) never fired, and the erotic-architecture QC rewrite never ran. Result: explicit sex scenes missing despite the user requesting the most explicit mode.

**Two-part guarantee (both required):**
1. **Canonicalize synonyms BEFORE validation** via `INTENSITY_SYNONYMS` (Unrestrained/Scorching→Intense, Heated→Elevated). Map must be applied before the `VALID_INTENSITIES.includes(...)` check, not after.
2. **Floor for `storyMode === "unrestrained"`**: floor BOTH the label (`intensity` → "Elevated") AND `numericIntensity` (→ max(n, 4)). Both are needed because the QC check derives its level as `max(numericIntensity, labelToIntensityLevel(label))` — a low client-supplied `numericIntensity` would otherwise weaken/skip the check.

**Why:** numericIntensity takes precedence over the label in the QC erotic-architecture gate. Flooring only the label leaves a hole if a client sends a low numeric value.

**How to apply:** Any time a new frontend "door" or intensity label is added, either add it to VALID_INTENSITIES or map it in INTENSITY_SYNONYMS — otherwise it silently degrades to Warm. The explicit-content guarantee lives in `normaliseIntake` (generate.ts), NOT in the frontend.
