---
name: Attribution alternation bias + TTS narrator stability
description: Two audio quality bugs in attributeSpeakers and generateAudioFile; what caused them and how they were fixed.
---

## Attribution alternation bias

**The bug:** `attributeSpeakers` userPrompt told the model to use "the natural back-and-forth of the conversation" as a fallback. Result: any consecutive quotes without an explicit "he said"/"she said" nearby got alternated — wrong voice for the second line.

**The fix:** 
- Removed the alternation-fallback instruction entirely.
- Built `numberedWithContext` — each numbered entry now includes up to 160 chars of prose BEFORE and 120 chars AFTER the quote, so the model reads attribution clues (names, pronouns, speech verbs) directly next to the quote rather than cross-referencing the full story.
- Added CRITICAL RULES to prompt: (1) surrounding prose is primary signal, (2) same speaker CAN speak consecutive lines — DO NOT assume alternation, (3) conversational flow only as last resort.

**Why:** The model was reliable at reading "she said" but unreliable at scrolling back through a 4000-char story to find what surrounded quote #7. Embedding the context inline removed that cross-reference burden.

**Follow-up fix (back-to-back quotes):** The original code did `spans[si-1].dialogueIndex < 0` to get prevText — but if two quotes appear consecutively with no narrator text between them, `spans[si-1]` is itself a dialogue span, so prevText/nextText both come up empty. Fix: scan backward/forward through ALL spans to find the nearest narrator span. Every quote now gets prose context even across runs of consecutive dialogue.

**Fallback rule:** Changed from "conversational flow" (alternation) to "same speaker continues" (persistence). Persistence matches real story dialogue far better — characters routinely speak multiple lines in a row; pure alternation is rarely correct when no cue is present.

## TTS narrator stability

**The bug:** All TTS chunks (narrator + characters) used `stability: 0.45`. ElevenLabs generates each chunk independently; at 0.45 narrator chunks drift noticeably in tone/pitch between them, sounding like "two different narrators."

**The fix:** Added `NARRATOR_STABILITY = 0.65` and `CHAR_STABILITY = 0.45`. `callTTS` / `ttsWithFallback` now accept a `stability` param. Multi-voice path passes NARRATOR_STABILITY for NARRATOR segments, CHAR_STABILITY for CHAR_A/CHAR_B. Single-voice path uses NARRATOR_STABILITY throughout.

**Why:** Narrator reads many sequential chunks; high stability locks its tone. Characters speak fewer chunks and benefit from expressiveness (lower stability).
