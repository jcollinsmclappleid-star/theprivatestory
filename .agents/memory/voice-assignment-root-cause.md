---
name: Voice assignment root cause
description: Why Her & Him stories produce wrong male/female voice allocation in generated audio
---

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
