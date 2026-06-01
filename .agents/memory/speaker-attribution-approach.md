---
name: Speaker attribution approach (multi-voice audio)
description: How to attribute dialogue to character voices without dropping prose; why asking the LLM to re-emit prose fails.
---

# Speaker attribution for multi-voice TTS

Multi-voice stories (Her & Him etc.) need each chunk labelled narrator / protagonist / love-interest so the right ElevenLabs voice reads it.

## The rule
Segment the prose **deterministically** — split on double quotes (straight or curly): everything inside quotes is dialogue, everything outside is narrator. Then ask the LLM **only to classify** each quoted line as protagonist vs love-interest, returning a small ordered label array. Apply the labels to the quote spans locally.

**Why:** Two prior approaches failed. (1) Inline speaker tags emitted *during* prose generation come back unbalanced (orphan/missing openers) → literal tag tokens leak into TTS and mis-merge dialogue into the narrator voice. (2) A post-gen pass asking the LLM to **re-emit the whole story split into labelled segments silently drops sentences** (verified: reconstruction ~0.97, a narration sentence just vanished from the audio). Re-emitting prose is the trap — never ask the model to reproduce the text, only to label it.

**How to apply:** Deterministic slicing makes content loss impossible (every segment is a literal slice of the input) and the label-only output is tiny (~3s vs ~50s, no truncation risk). Validate that label count == quote count and each is a valid speaker; on any mismatch fall back to the regex heuristic tagger. Zero-quote prose → single-narrator, no model call. Keep prose generation clean (no inline tags). Gate-metric convention across all taggers: distinctCharRoles = uniqueCharRoles + 1 (narrator counts as a voice) — keep new taggers consistent with this or the multi-voice gate breaks.
