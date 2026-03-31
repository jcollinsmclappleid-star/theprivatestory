/**
 * Standalone library seed script — run directly with tsx (no HTTP required).
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run seed-library
 *   # or:
 *   node_modules/.bin/tsx src/scripts/seedLibrary.ts [--replace]
 *
 * Flags:
 *   --replace   Delete all existing library stories before seeding.
 *   --from N    Start from story index N (1-based). Useful for resuming.
 */

import { db } from "@workspace/db";
import { generatedStories } from "@workspace/db/schema";
import { eq, like } from "drizzle-orm";
import { storiesStore } from "../lib/storage.js";
import { LIBRARY_SEED_MANIFEST } from "../lib/librarySeedManifest.js";
import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  buildImagePrompts,
  generateAllImages,
  type GenerateStoryRequest,
} from "../routes/generate.js";

const QC_PASS_THRESHOLD = 7.0;

function log(msg: string) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes("--replace");
  const fromIdx = parseInt(args.find(a => a.startsWith("--from="))?.split("=")[1] ?? "1", 10);

  if (replace) {
    const result = await db
      .delete(generatedStories)
      .where(eq(generatedStories.isLibraryStory, true));
    const deleted = (result as any).rowCount ?? 0;
    log(`CLEARED: deleted ${deleted} existing library stories`);
  }

  const total = LIBRARY_SEED_MANIFEST.length;
  log(`STARTING: ${total} stories to seed (starting from #${fromIdx})`);

  let created = 0;
  let failed = 0;
  let skipped = 0;
  const qcScores: number[] = [];

  for (let i = 0; i < LIBRARY_SEED_MANIFEST.length; i++) {
    const idx = i + 1;
    if (idx < fromIdx) continue;

    const entry = LIBRARY_SEED_MANIFEST[i];
    log(`[${idx}/${total}] START: ${entry.situationId} — ${entry.label.slice(0, 80)}`);

    // Skip if already exists (and we're not replacing)
    if (!replace) {
      const existing = await db
        .select({ id: generatedStories.id })
        .from(generatedStories)
        .where(like(generatedStories.id, `lib-${entry.situationId}-%`))
        .limit(1);
      if (existing.length > 0) {
        log(`[${idx}/${total}] SKIP: ${entry.situationId} already exists (${existing[0].id})`);
        skipped++;
        continue;
      }
    }

    try {
      const intake: GenerateStoryRequest = {
        mood: entry.mood,
        intensity: entry.intensity,
        voiceFeel: entry.voiceFeel,
        storyLength: entry.storyLength,
        pairing: entry.pairing,
        chemistry: entry.chemistry,
        atmosphere: entry.atmosphere,
        setting: entry.setting,
        country: entry.country,
        city: entry.city,
        whoIsHe: entry.whoIsHe,
        situationId: entry.situationId,
        cinematicVisuals: true,
        emotionalFocus: true,
      };

      // 1. Plan
      log(`[${idx}/${total}] PLAN: ${entry.situationId}`);
      let brief = await planStory(intake);

      // 2. Write
      log(`[${idx}/${total}] WRITE: ${entry.situationId}`);
      let story = await writeStoryFromBrief(brief, "the listener", entry.intensity, intake);

      // 3. QC
      log(`[${idx}/${total}] QC: ${entry.situationId}`);
      let qcResult = await qcStory(brief, story);
      log(`[${idx}/${total}] QC SCORE: ${qcResult.score_total.toFixed(1)} (threshold: ${QC_PASS_THRESHOLD})`);

      if (qcResult.score_total < QC_PASS_THRESHOLD) {
        log(`[${idx}/${total}] QC RETRY: score ${qcResult.score_total.toFixed(1)} below threshold — retrying`);
        brief = await planStory(intake);
        story = await writeStoryFromBrief(brief, "the listener", entry.intensity, intake);
        qcResult = await qcStory(brief, story);
        log(`[${idx}/${total}] QC RETRY SCORE: ${qcResult.score_total.toFixed(1)}`);
      }

      qcScores.push(qcResult.score_total);

      // 4. Images
      log(`[${idx}/${total}] IMAGES: ${entry.situationId}`);
      const storyToken = `${entry.situationId}-${Date.now()}`;
      const prompts = await buildImagePrompts(brief, story);
      const images = await generateAllImages(prompts, `lib-${storyToken}`);

      // 5. Save
      const castingData: Record<string, string> = {
        pairing: entry.pairing,
        chemistry: entry.chemistry,
        mood: entry.mood,
        intensity: entry.intensity,
        atmosphere: entry.atmosphere,
        setting: entry.setting,
        country: entry.country,
        city: entry.city,
        archetype: entry.whoIsHe,
      };
      if (brief.situation) castingData.situation = brief.situation;
      if (brief.situationId) castingData.situationId = brief.situationId;

      const storyId = `lib-${storyToken}`;
      await storiesStore.set(storyId, {
        id: storyId,
        title: story.title,
        description: story.description,
        mood: entry.mood,
        audioUrl: "",
        duration: entry.storyLength,
        brief,
        scenes: story.scenes,
        images: { cover: images.cover, scenes: images.scenes ?? [] },
        recommendation_tags: brief.recommendation_tags ?? [entry.mood],
        isLibraryStory: true,
        status: "published",
        ownerUserId: null,
        castingData,
        qc: qcResult,
        qcScore: qcResult.score_total,
      });

      created++;
      log(`[${idx}/${total}] SAVED: "${story.title}" (id=${storyId}, QC=${qcResult.score_total.toFixed(1)})`);

      // Batch QC checkpoint every 5
      if (idx % 5 === 0) {
        const recentScores = qcScores.slice(-5);
        const avg = recentScores.reduce((s, v) => s + v, 0) / recentScores.length;
        log(`=== BATCH QC (stories ${idx - 4}–${idx}): avg ${avg.toFixed(1)} ===`);
      }
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      log(`[${idx}/${total}] ERROR: ${entry.situationId} — ${message}`);
    }
  }

  // Final summary
  const avgQc = qcScores.length > 0
    ? qcScores.reduce((s, v) => s + v, 0) / qcScores.length
    : null;

  log("=".repeat(60));
  log(`COMPLETE: ${created} created, ${skipped} skipped, ${failed} failed`);
  log(`QC: avg ${avgQc !== null ? avgQc.toFixed(1) : "n/a"}, min ${qcScores.length ? Math.min(...qcScores).toFixed(1) : "n/a"}, max ${qcScores.length ? Math.max(...qcScores).toFixed(1) : "n/a"}`);
  log("=".repeat(60));
}

main().catch(err => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
