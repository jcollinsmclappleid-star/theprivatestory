---
name: LLM inline speaker tags
description: Root-cause fix for voice mis-attribution — [N][A][B] inline tags generated at story-write time, parsed at audio-render time.
---

# LLM Inline Speaker Tags — Root-Cause Fix

## What & Why
The regex tagger (`tagScriptForMultiVoice`) was guessing speaker roles post-hoc from prose cues.
Root causes: past-tense-only verb list, `firstSecondRe` over-firing, same-gender pairings with no pronoun cues.
Fix: instruct the LLM to annotate its own output with `[N]`/`[A]`/`[B]` tags at write time.

## Tag semantics
- `[N]...[/N]` — narrator voice (ALL prose, attribution phrases, internal monologue)
- `[A]...[/A]` — protagonist's spoken words only (quote marks stay inside the tag)
- `[B]...[/B]` — love interest's spoken words only

## What was done
- `masterEroticLayer.ts` — added "AUDIO SPEAKER TAGGING — MANDATORY" block to `getMasterEroticLayer()`.
  Applies to both the `MASTER_EROTIC_LAYER` constant (library stories) and all runtime pairing calls (user stories).
- `generate.ts` — `parseTaggedScript()` function added before `tagScriptForMultiVoice()`.
  `tagScriptForMultiVoice()` now detects `/\[N\]|\[A\]|\[B\]/` and dispatches to the parser; falls back to regex for legacy stories.

## Fallback
Old stories in the DB (no tags) still go through the regex tagger.
`MV_ATTR_VERBS` was already updated with present-tense verbs in a prior session.

**How to apply:** When debugging attribution, check whether the stored `scenes[].text` contains `[N]` tags. If yes → tag parser ran. If no → regex fallback ran; check MV_ATTR_VERBS and firstSecondRe logic.
