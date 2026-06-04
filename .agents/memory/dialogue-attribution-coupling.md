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

**SPEAKER-SWITCH RULE (added):** The "every third line" rule does NOT cover the most common failure — the first line of a new speaker being bare/unattributed at the switch point. A new SPEAKER-SWITCH RULE was added to both `generate.ts` DIALOGUE MANDATE and `masterEroticLayer.ts` DIALOGUE ATTRIBUTION FORMAT: *every time the speaker changes, the NEW speaker's first line MUST carry an explicit attribution (name, possessive action beat, or speech verb + pronoun)*. When editing dialogue prompts, preserve this rule — it is the single highest-priority audio-accuracy instruction.

**Where:** the dialogue contract lives in four coordinated places: the planner's `dialogue_mode` arc + its diversity self-check, the writer's `dialogue_mode` definitions + DIALOGUE MANDATE (including SPEAKER-SWITCH RULE) + writer self-check, the QC `rewriteStory` `enforce_scene_diversity` instruction, and `masterEroticLayer.ts` DIALOGUE ATTRIBUTION FORMAT (including SPEAKER-SWITCH RULE). Change one, change all.

**Edit gotcha:** these prompt instructions are a MIX of backtick template literals and plain double-quoted strings (notably the `rewriteStory` strategy map). Embedding a double-quoted phrase like "he said/she said" inside a double-quoted instruction string silently terminates it and breaks the esbuild build — use single quotes inside double-quoted instruction strings.
