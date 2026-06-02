---
name: Dialogue volume vs. speaker attribution coupling
description: How to safely make stories more dialogue-heavy / reduce "he said/she said" without breaking multi-voice tagging
---

When tuning the story generator to be more conversational (more dialogue, fewer "he said/she said" tags), you MUST preserve speaker attribution, because for NEW stories attribution is a **post-hoc pass** that reads CLEAN prose with no inline tags and classifies each quote's speaker from: the character's name, attribution verbs, action-beat anchors, and conversational turn-taking. Only TWO character voices are cast (protagonist + love interest) plus narrator.

**The safe contract (encoded in the writer/planner prompts):**
- Keep dialogue to **two clearly-alternating speakers at a time**. In a group scene, an extra speaker MUST be named on their line — an unnamed third speaker cannot be told apart (no third voice exists).
- Never stack more than two consecutive spoken lines without a speaker anchor: **at least every third line carries a name or an action beat** (a bare "you" is not enough).
- This anchoring matters most in **same-sex and they/them** exchanges, where there is no gender cue for the classifier to fall back on. (See also `them-pairing-multivoice.md`, `voice-assignment-root-cause.md`.)
- Within those bounds, plain "he said/she said" tags can be dropped freely — the distinct voices carry who is speaking.

**Why:** removing tags shifts attribution load onto turn-taking + name cues; without recurring anchors a long tagless volley drifts and lines get the wrong voice — worst in same-gender pairings.

**Where:** the dialogue contract lives in three coordinated places in `generate.ts` that must stay consistent — the planner's `dialogue_mode` arc + its diversity self-check, the writer's `dialogue_mode` definitions + DIALOGUE MANDATE + writer self-check, and the QC `rewriteStory` `enforce_scene_diversity` instruction. Change one, change all.

**Edit gotcha:** these prompt instructions are a MIX of backtick template literals and plain double-quoted strings (notably the `rewriteStory` strategy map). Embedding a double-quoted phrase like "he said/she said" inside a double-quoted instruction string silently terminates it and breaks the esbuild build — use single quotes inside double-quoted instruction strings.
