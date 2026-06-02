---
name: Derived-story casting anchors
description: How variations/continuations keep the original protagonist/partner names + intensity for audio attribution
---

Variations and continuations reuse the parent's `StoryBrief`, but `StoryBrief` has
NO name fields and the `generatedStories` table has NO name columns. The only
persisted free-form vehicle is the `castingData` jsonb column.

**Rule:** Names (`listenerName`/`partnerName`) and `intensity` must be persisted
into `castingData` at story creation, and forwarded into derived stories' own
`castingData` too — otherwise a derived story (and any further variation/
continuation of it) loses its protagonist name anchor and intensity styling, which
degrades multi-voice speaker attribution for same-gender / Them pairings.

**Why:** Audio attribution uses the protagonist name as an anchor (via
`protagonistNameForAudio(pairing, listenerName)`) for null-gender pairings
(Her&Her, Him&Him) and Them&Them. Without the name, attribution falls back to
flow-only and quality drops. Chaining (variation-of-a-variation) regresses unless
each derived story re-persists the anchors.

**How to apply:** When touching the derive path, pass the parent's whole
`castingData` object through, extract the anchor fields for the audio call, AND
spread `castingData` back into the derived story's persisted result. Persisting
names here is not a new PII exposure — names already appear throughout the story
prose/scenes. The frontend casting display (`CastSituation`/`ln`) renders only an
allowlist of keys (`PILL_FIELDS`), so extra keys like names never surface in UI.
