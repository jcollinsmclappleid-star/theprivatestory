---
name: Markdown emphasis must be stripped from scene prose
description: Why generated story text must have *word*/**word** markup removed at every writer
---

The story model intermittently emits markdown emphasis in scene prose
(`*word*`, `**word**`, `_word_`). This is wrong for this product on two fronts:
the frontend renders `scene.text` as raw text (no markdown parser), so literal
asterisks show on screen; and the TTS pipeline narrates the prose, so the markers
get read aloud / cause artifacts.

**Rule:** Strip emphasis markup (keep the words) at EVERY scene-text generation
entry point, not on the frontend. There are four: the main writer, the QC-rewrite
writer, the variation writer, and the continuation writer. Missing any one lets
asterisks leak back in for that path.

**Why:** Fixing it only on the frontend would still leave the markers in the audio
narration. The prose must be clean at the source so display and TTS share one
clean string.

**How to apply:** Use the shared `stripProseMarkdown` helper. In the main writer
apply it BEFORE `rawText` is captured and before `[A]/[B]/[N]` speaker-tag
stripping — the helper only touches `*`/`_`, so the bracket tags TTS attribution
needs survive. Underscore stripping uses non-alphanumeric edge lookarounds so
`snake_case`/paths are left intact. A global unmatched-`*` removal is acceptable
here because narrative prose never contains literal asterisks (no math, no
`* * *` dividers — scenes use headings).

## Related: clipped one-word abstract-label prose
The model sometimes emits bare abstract-noun "label" sentences ("Professionalism.
Boundaries." / "Dangerous."). These are NOT injected seeds — there is no
keyword-injection layer; the only seed is the brief's `recurring_motif` (a full
phrase). The clipped style is driven by the CRACK-phase `fragmented` prose_rhythm.
**Fix style preferences at the prompt layer, not post-processing** — a "weave
concepts, don't label them" rule plus tightening the fragmented-rhythm definition,
mirrored across all four writers. Post-processing can't tell an intentional terse
beat ("Still." / "Yes.") from an undesirable abstract label without semantic loss.
