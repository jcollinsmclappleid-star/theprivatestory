---
name: They/Them pairing multi-voice gate
description: Why Her&Them and Him&Them need nullGenderPairing=true for the multi-voice toggle gate to fire
---

## Rule
`nullGenderPairing` must include any pairing where `pg.li === "them" || pg.protag === "them"`, not just Them & Them.

**Why:** The stricter `explicitAttributions >= 1` gate can never be satisfied when LLM output uses bare quotes or partner-name attribution without a recognised verb. This silently keeps all Her & Them / Him & Them stories in single-voice mode even when 9+ character segments exist.

**How to apply:** In `generate.ts`, the condition appears in two places:
1. `generateAudioFile` (~line 4278)
2. `debug-tags` endpoint (~line 5636)

Both must read: `const nullGenderPairing = !pg || pg.li === "them" || pg.protag === "them";`

The `singularTheyAttrRe` ("they said/asked/whispered") still gives explicit credit when present — the fix just removes the hard dependency on it.
