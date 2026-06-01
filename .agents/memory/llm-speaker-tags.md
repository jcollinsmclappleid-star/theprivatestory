---
name: LLM inline speaker tags + tagger root cause fix
description: Full history of multi-voice mis-attribution fixes. Root cause: firstSecondRe priority order in attribute(). 22/31 lines were wrong before fix.
---

# Multi-Voice Speaker Attribution — Complete Fix History

## Original issue
"Woman saying man's lines" — love interest dialogue voiced by Clara/Maya instead of James.

## Root causes (all fixed)

### Root cause 1 — Past-tense-only verb list (FIXED in earlier session)
`MV_ATTR_VERBS` only had `said|asked|...` — missed present-tense LLM prose (`says|asks|...`).
Fix: added full present-tense set + groans/notes/observes/etc.

### Root cause 2 — `firstSecondRe` priority order (FIXED — the primary bug)
**Simulation result**: 22 of 31 explicit attributions were wrong before this fix.

In second-person Her & Him stories, attribution context after love interest dialogue routinely
contains "you/your/yours" as an OBJECT, not a speaker indicator:
  `"You're still here," he says, watching you.`
  → context = "he says, watching you."
  → OLD: firstSecondRe fires on "you" → CHAR_A (narrator voice) ✗
  → NEW: male "he" wins first → CHAR_B (James) ✓

Fix: reordered `attribute()` priority in `tagScriptForMultiVoice`:
  1. Exact name (partnerName / protagonistName)
  2. Unambiguous gender pronoun (he/him/his → CHAR_B, she/her → CHAR_A for Her & Him)
  3. Singular "they said/says" — Them pairings only
  4. firstSecondRe ("you say", "I told her") — LAST, only when no gender pronoun found

After fix: 31/31 attributions correct, 0 misattributions on tested story.

### Root cause 3 — LLM tagging (Mistral compliance failure, best-effort)
Instruction added to masterEroticLayer.ts to emit [N][A][B] tags.
Mistral wraps all prose in [N] but rarely emits [A]/[B] character tags.
Fallback: tag detection now only dispatches to parseTaggedScript when [A] or [B] present.
Storage strips all [N][A][B] tags before saving (admin.ts + writeStoryFromBrief).

## parseTaggedScript extras (for when LLM does comply)
- `distinctCharRoles`: narrator counts as +1 when any character role present → fixes
  second-person stories where [A] absent (protagonist = narrator voice).
- Deduplication: skips [N] segment that exactly mirrors adjacent [B]/[A] (LLM echo).

## Regression guards
- Single-voice TTS path: strips all tags from sceneText before chunking.
- tagScriptForMultiVoice: strips stray [N]/[/N] from `normalised` before regex tagger.
- DB cleanup: two test stories had [N] pollution; cleaned via SQL regexp_replace.

**How to apply:** If voice mis-attribution recurs, check attribute() priority order first.
Run the simulation in code_execution using the story text and count CHAR_B explicit segments.
Expected for Her & Him: all "he says/murmurs/breathes" lines → CHAR_B (James).
