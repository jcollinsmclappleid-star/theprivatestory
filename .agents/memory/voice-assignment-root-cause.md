---
name: Voice assignment root cause
description: How speaker attribution / multi-voice allocation works in generated audio across all pairings
---

## CURRENT ARCHITECTURE (supersedes the rawText/parseTaggedScript notes below)

`generateAudioFile` no longer trusts inline `[N]/[A]/[B]` tags. Tags are stripped, then attribution runs in two tiers:

1. **Primary — `attributeSpeakers()`**: deterministic split of prose into narrator spans vs quoted-dialogue spans (sliced by quote marks, so prose is never dropped/altered), then a Mistral *classification-only* pass labels each quote `protagonist`(CHAR_A) / `love_interest`(CHAR_B), in order. Prompt is given each character's name + pronoun from `mvPairingGenders`. 2 retries, returns null on failure.
2. **Fallback — `tagScriptForMultiVoice()`** (regex/toggle heuristic) only if attributeSpeakers returns null twice.

**Why the redesign:** asking the model to re-emit tagged prose silently dropped sentences. Classifying labels (not re-emitting prose) removes truncation risk and works for same-gender + they/them (relies on names + conversational flow, not gender pronouns).

**Multi-voice gate** (unchanged principle): `nullGenderPairing = !pg || pg.li==="them" || pg.protag==="them"`. Gendered pairings need `explicitAttributions>=1`; same-gender + any they/them need `charSegments>=4` (toggle). Voice assignment per pairing lives in `resolveCharacterVoicesServer` (covers her&him, her&her, him&him, her&them, him&them, them&them).

---
## HISTORICAL (pre-attributeSpeakers — kept for context, no longer the live path)

## The bug

`writeStory()` in `generate.ts` strips `[A]/[B]/[N]` tags from scene text at the end of the
scene-map loop (line ~3750) **before** `generateAudioFile()` is ever called.

`generateAudioFile()` receives tag-free scenes → `tagScriptForMultiVoice()` detects no `[A]/[B]`
→ falls to the **regex heuristic** (toggle + "he said"/"she said" attribution) rather than
`parseTaggedScript()`. Literary AI prose uses `"His voice broke"`, `"she breathed"` etc. which
are NOT in `MV_ATTR_VERBS`, so the toggle chain breaks → voices flip mid-story.

## Secondary bug (echo dedup)

LLM sometimes echoes dialogue in both `[N]` and `[B]` tags (warned as MISTAKE 2 in prompt):
```
[N]"You're still here," he says.[/N][B]"You're still here,"[/B]
```
The narrator segment `"You're still here," he says.` starts with the character dialogue but is
NOT equal to it, so the old dedup check (`normSeg === normNext`) misses it. Narrator voice reads
the line first, then the male voice reads it again.

## Fixes applied (generate.ts)

1. **`Scene` interface**: added `rawText?: string` — LLM-tagged version, audio-only, never stored.
2. **`writeStory()` scene map**: `rawText = text` (tagged) captured BEFORE the tag-strip step.
   `text` remains the clean version for QC, moderation, and DB storage.
3. **`generateAudioFile()`**: uses `s.rawText ?? s.text` when building `fullText` for the tagger.
   Now `tagScriptForMultiVoice()` detects `[A]/[B]` → dispatches to `parseTaggedScript()` ✓
4. **`parseTaggedScript()` dedup**: extended echo check with `startsWith` in addition to equality:
   `isEcho = normSeg === normNext || normSeg.startsWith(normNext) || ...` — catches the
   "dialogue + attribution in [N]" pattern that the exact-match check missed.

**Why:**
The regex heuristic is inherently unreliable for literary prose — the correct fix is ensuring
`parseTaggedScript` always processes the real LLM tags. The `rawText` field is the minimal-change
path that avoids architectural rework (e.g. separating audio generation from writeStory).

## Rewritten stories

`rewriteStory()` does NOT strip tags (it returns `text: s.text` directly from the LLM output).
So rewritten scenes have tags in `text` and `rawText` is undefined. `generateAudioFile` uses
`rawText ?? text` = `text` (with tags) → still routes to `parseTaggedScript`. ✓

## Empty scene 3 (separate issue)

QC flagged scene 3 as empty (0 chars) but still passed the story (score 8.6). The empty scene
is silently skipped in audio (`filter(Boolean)` in generateAudioFile). QC should fail-fast on
empty scenes rather than penalising the sub-score alone.
