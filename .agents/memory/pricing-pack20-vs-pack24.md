---
name: Pricing model is 20-story packs (pack_20), not 24
description: The authoritative credit-pack pricing for The Private Story, and a known false-positive in the configured code review.
---

The final, authoritative pricing model for "The Private Story" (custom-audio-stories) is THREE one-time credit packs, no subscriptions:

- Immersive Story — £12 / $15 — 1 credit (trial, no After Dark) — CTA "Create One Story"
- Immersive Bundle — £29 / $39 — 5 credits (After Dark) — CTA "Get 5 Stories"
- Immersive Collection — £79 / $99 — 20 credits (After Dark, Best Value) — CTA "Unlock 20 Stories"

Display order: Collection (Best Value, highlighted) → Bundle → Story.
Runtime/DB enum is `pack_20` (NOT `pack_24`). Top tier credits = +20.

**Why:** An earlier iteration of the spec used a 24-story top tier at £99/$119 with names like
"Your First Story / Five Private Stories / The Full Collection (Most Chosen)". The user later
EXPLICITLY superseded that: "I updated 24 stories to 20 instead and lowered price to gbp 79 99usd"
and renamed everything to the "Immersive" family. So 20/£79/$99 is correct; 24/£99/$119 is stale.

**How to apply:** The configured external code review for this repo has been seen to REJECT against
the stale 24-story spec (demanding pack_24, £99/£119, the old card names). If that happens and the
app code is internally consistent on pack_20 / £79 / $99 / Immersive naming, the rejection is a
false positive from an outdated spec — do NOT "fix" it by switching to pack_24. Verify against the
latest user instruction before flipping any pricing numbers.
