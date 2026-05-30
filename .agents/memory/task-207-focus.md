---
name: Task #207 multi-voice — stay-on-scope
description: Current build focus and explicit anti-drift boundary for The Private Story
---
# Task #207 — Multi-Voice Audio Pipeline is the ONLY active build

**Rule:** Build ONLY Task #207 (multi-voice audio pipeline, `.local/tasks/multi-voice-pipeline.md`). Do NOT do any SEO work or cover-image regeneration.

**Why:** The user repeatedly and explicitly stated the SEO landing-page work and the Editor's Picks / library cover-image regeneration are already complete. Earlier in this session an injected "Session Plan" caused drift into regenerating covers + expanding SEO image pools; the user rejected it twice ("you have drifted and done a task I did not request", "I said just do task 207") and those changes were reverted.

**How to apply:**
- Ignore auto-assigned tasks that are about SEO pages or cover/library images (e.g. pricing overhaul, "who it's for" copy, paywall, SEO depth, regen covers). If the task system assigns one, the user's standing instruction "just do 207" overrides it.
- #207 scope = `voices.ts`, `generate.ts` (script tagger, multi-voice generateAudioFile, intensity style, silence trim, progressive delivery, single-voice fallback), `Create.tsx` (cast preview + Eleanor→Kayla copy + NEW badge), `Home.tsx` + `ssr.ts`/`SEOPage.tsx` one-sentence callout only, `generate-editors-picks.mjs` regen.
- The covers on disk and SEO body-image pools are intentionally at their reverted state — leave them.

## Multi-voice tagger correctness (rule)
Speaker attribution in `tagScriptForMultiVoice` must use **quote-local** context (prose immediately before/after each quote), never a single paragraph-global context — a paragraph-global cue ("he said") otherwise captures every quote in a mixed-dialogue paragraph. **Why:** code review caught paragraph-global attribution misrouting common dialogue. Multi-voice mode must also be gated on real evidence: both character roles present AND ≥1 explicit attribution cue (`explicitAttributions`), not blind turn-taking — otherwise one speaker gets split across two voices. And `generateAudioFile` must fail fast on a zero-byte final buffer rather than upload silent audio with a positive duration.

## Deliberate deferrals (not missing work)
- **Step 4 (progressive/streaming delivery): DEFERRED.** `generateAudioFile` keeps its synchronous `{ url, durationSeconds }` contract. Streaming would require rewriting the client audio player across 8+ pages — high risk, and in tension with the contract the rest of the task assumes. Revisit only as its own scoped task.
- **Step 8 (Editor's Picks audio regen): DONE.** User approved after a 1-clip test, then "regenerate all per our matrix". All 10 `editors-picks/*.mp3` regenerated through the multi-voice pipeline (mirror helpers added to `generate-editors-picks.mjs`, model `eleven_turbo_v2_5`, intensity Elevated, pairing Her & Him) and copied into the served `public/voice-samples/editors-picks/`.

## Regenerating Editor's Picks audio — operational notes
- The `.mjs` script duplicates the server multi-voice helpers (cannot import the bundled server module) — keep `generate-editors-picks.mjs` in sync with `generate.ts` if the tagger/casting/intensity logic changes.
- Output lands in `public-static/voice-samples/editors-picks/`; it is served from `public/` (mirrored by build.mjs). After a manual run, copy the new mp3s into `public/voice-samples/editors-picks/` (or rebuild) so the dev server serves them.
- **Run it in small synchronous batches (2–3 slugs), not detached.** Background/nohup processes are killed between tool calls, and full 10-pick runs exceed a single command timeout. ~2 picks ≈ 50s. Filter by slug prefix: `node scripts/generate-editors-picks.mjs --force 05 06`.
- The "matrix" = per-pick narrator already encoded in each pick's `voice`, plus `resolveCharacterVoicesServer` casting (HER Maya→Clara→Kayla / HIM James→Ethan→Theo, conflict-avoidance) — matches `.local/tasks/multi-voice-pipeline.md` "Full Voice Matrix".

## Post-#207 reverts (user directive: "should have stopped at 207")
After #207, two post-#207 SEO copy tasks were merged/assigned and then reverted on explicit user instruction ("revert these changes should of stopped at 207", "task should of stopped after the 10 stories were regenerated"):
- **#112** (SEO copy: replace "tonight"→"Created for You" titles + couples "tonight"; SEOPage "Designed for the female imagination") — REVERTED. Working tree restored to commit `b57b9ed` (Task #207) for `lib/seo-data/src/configs.ts` (3 meta titles back to "Yours Tonight"/"No Sign-Up… Yours Tonight"; couples body back to "tonight") and `SEOPage.tsx` (TRUST_ITEMS Heart + "Who it's for" back to "…female imagination at its centre").
- **#113** (AI/ElevenLabs language de-emphasis) — NOT implemented; investigation only, zero file edits. Cancelled per revert.
**Why:** #207 (the 10 regenerated multi-voice Editor's Picks stories) is the user's intended stopping point. The task system kept re-assigning/resetting #113 to IN_PROGRESS — that is drift, not a real instruction. Standing rule: do not implement #112/#113 or any further SEO copy work unless the user newly requests it.
