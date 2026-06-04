---
name: After Dark preview-cover pairing default
description: Why "Him & Him" showed a woman on the cover — preview-cover pre-gen dropped pairing and the endpoint defaults to "Her & Him".
---

# Preview-cover pre-gen must pass a resolved pairing

The After Dark scenario-click handler pre-generates the cover image before the paywall appears. It called `fetchPreviewCover(selectedPairing ?? undefined)`. When `selectedPairing` is null at click time, pairing goes undefined, and the `/api/preview-cover` endpoint (and image protagonistNoun / loveInterestNoun defaults in generate.ts) default a MISSING pairing to **"Her & Him" → a woman**. So a "Him & Him" run could show a woman on the COVER even though the story text was male-correct.

**Fix:** `fetchPreviewCover(selectedPairing ?? confirmedPairing ?? undefined)`.

**Why:** the cover bug was an image-only defaulting issue, distinct from story/voice pairing. The story prose was correct; only the cover defaulted.

**How to apply:** when debugging a "wrong gender on cover but story is correct" report, look at cover/image pairing fallbacks, NOT the story generation pairing. Any code path that can call a cover/image endpoint with an undefined pairing will silently default to Her & Him.
