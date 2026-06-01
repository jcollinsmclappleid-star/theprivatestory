---
name: LLM inline speaker tags
description: Root-cause fix for voice mis-attribution — [N][A][B] tags generated at story-write time, parsed at audio-render time. Includes Mistral compliance failure and regression fixes.
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
  WRONG-example section (MISTAKE 1/2/3) added to address Mistral's tendency to duplicate dialogue in both [N] and [B].
- `generate.ts` — `parseTaggedScript()` function added; `tagScriptForMultiVoice()` dispatches to it only when [A] or [B] tags are present (NOT narrator-only [N] tags).

## Mistral compliance failure (CRITICAL) — discovered after first test run
Mistral wraps ALL prose in [N] tags but never produces [A]/[B] tags. This caused TWO regressions:
1. `tagScriptForMultiVoice` dispatched to parseTaggedScript on narrator-only output → all-NARRATOR segments → `distinctCharRoles=0` → single-voice → TTS read "[N]" aloud.
2. Stored text contained `[N]text[/N]` visible to display UI.

## Regression fixes applied
- `tagScriptForMultiVoice` detection: changed from `/\[N\]|\[A\]|\[B\]/` to `/\[A\]|\[B\]/`. Narrator-only wrapping now falls through to regex tagger after `\[N\]|\[\/N\]` stripped from `normalised`.
- Single-voice TTS path: `scene.text.trim().replace(/\[(?:N|A|B)\]|\[\/(?:N|A|B)\]/g, "")` before chunking.
- `extractStoryParts` (admin.ts): strips [N][A][B] tags from `clean` before storage.
- `writeStoryFromBrief` (generate.ts): strips tags from scene text after repair passes.
- DB cleanup: both polluted test stories stripped via SQL `regexp_replace`.

## `distinctCharRoles` bug + fix
Second-person Her & Him stories have protagonist's voice = narrator → no [A] tags → `distinctCharRoles=1` → multi-voice gate fails.
Fix: `const distinctCharRoles = uniqueCharRoleSet.size > 0 ? uniqueCharRoleSet.size + 1 : 0;` — narrator always counts as +1 when any character role is present.

## Deduplication fix
Mistral sometimes echoes dialogue as `[N]"text"[/N]\n[B]"text"[/B]`. `parseTaggedScript` now strips [N] segments that exactly match the immediately following [B]/[A] segment.

## Fallback (primary in practice)
Regex tagger (MV_ATTR_VERBS with past + present tense verbs) handles all stories. On a typical Her & Him after_hours story: `explicitAttributions=34, charBFound=true` — multi-voice gate passes solidly.

**How to apply:** Check `scenes[].text` in DB for `[N]`/`[A]`/`[B]` tags. If any [A]/[B] → tag parser runs (multi-voice exact path). If [N]-only or no tags → regex tagger. Tags must never appear in stored prose after the storage-strip fixes.
