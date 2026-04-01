/**
 * Standalone library seed script — run directly with tsx (no HTTP required).
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run seed-library
 *   # or:
 *   node_modules/.bin/tsx src/scripts/seedLibrary.ts [--replace]
 *
 * Flags:
 *   --replace       Delete all existing library stories before seeding.
 *   --from=N        Start from story index N (1-based). Useful for resuming.
 *   --parallel=N    Run N stories concurrently (default: 1). Use 3–5 for speed.
 *
 * Environment:
 *   DISABLE_AUDIO=true   Skip ElevenLabs audio generation (much faster, add audio later).
 */

import { db } from "@workspace/db";
import { generatedStories } from "@workspace/db/schema";
import { eq, like, sql } from "drizzle-orm";
import { storiesStore } from "../lib/storage.js";
import { LIBRARY_SEED_MANIFEST, type SeedEntry } from "../lib/librarySeedManifest.js";
import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  buildImagePrompts,
  generateAllImages,
  type GenerateStoryRequest,
} from "../routes/generate.js";

const QC_PASS_THRESHOLD = 7.0;

/** Map situationId prefix → { categoryId, subthemeId } */
const CATEGORY_MAP: Record<string, string> = {
  fc2: "forbidden_complicated",
  rr2: "reunion_return",
  fu2: "first_unknown",
  pt2: "power_tension",
  po2: "psychological_obsessive",
  cp2: "circumstance_proximity",
  su2: "secrets_unspoken",
  dd2: "dark_dangerous",
  sb2: "slow_burn_patience",
  pl2: "professional_crossing_lines",
};

function log(msg: string) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

/** Derive categoryId and subthemeId from the situationId (e.g. "fc2_01") */
function deriveCategory(situationId: string): { categoryId: string; subthemeId: string } {
  const prefix = situationId.split("_")[0];
  return {
    categoryId: CATEGORY_MAP[prefix] ?? prefix,
    subthemeId: situationId,
  };
}

/** Check if a story already exists in the DB */
async function storyExists(situationId: string): Promise<string | null> {
  const existing = await db
    .select({ id: generatedStories.id })
    .from(generatedStories)
    .where(like(generatedStories.id, `lib-${situationId}-%`))
    .limit(1);
  return existing[0]?.id ?? null;
}

/** Generate and save a single story. Returns the QC score, or null on failure. */
async function processSingleStory(
  entry: SeedEntry,
  idx: number,
  total: number,
  counters: { created: number; failed: number; skipped: number; qcScores: number[] },
  replace: boolean,
): Promise<void> {
  log(`[${idx}/${total}] START: ${entry.situationId} — ${entry.label.slice(0, 80)}`);

  if (!replace) {
    const existingId = await storyExists(entry.situationId);
    if (existingId) {
      log(`[${idx}/${total}] SKIP: ${entry.situationId} already exists (${existingId})`);
      counters.skipped++;
      return;
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

    counters.qcScores.push(qcResult.score_total);

    // 4. Images
    log(`[${idx}/${total}] IMAGES: ${entry.situationId}`);
    const storyToken = `${entry.situationId}-${Date.now()}`;
    const prompts = await buildImagePrompts(brief, story);
    const images = await generateAllImages(prompts, `lib-${storyToken}`);

    // 5. Category derivation
    const { categoryId, subthemeId } = deriveCategory(entry.situationId);

    // 6. Save
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
      categoryId,
      subthemeId,
    });

    counters.created++;
    log(`[${idx}/${total}] SAVED: "${story.title}" (id=${storyId}, QC=${qcResult.score_total.toFixed(1)}, category=${categoryId})`);
  } catch (err) {
    counters.failed++;
    const message = err instanceof Error ? err.message : String(err);
    log(`[${idx}/${total}] ERROR: ${entry.situationId} — ${message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes("--replace");
  const fromIdx = parseInt(args.find(a => a.startsWith("--from="))?.split("=")[1] ?? "1", 10);
  const parallel = Math.max(1, parseInt(args.find(a => a.startsWith("--parallel="))?.split("=")[1] ?? "1", 10));

  if (replace) {
    const [{ count: deleted }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(generatedStories)
      .where(eq(generatedStories.isLibraryStory, true));
    await db
      .delete(generatedStories)
      .where(eq(generatedStories.isLibraryStory, true));
    log(`CLEARED: deleted ${deleted} existing library stories`);
  }

  const entries = LIBRARY_SEED_MANIFEST.slice(fromIdx - 1);
  const total = LIBRARY_SEED_MANIFEST.length;
  log(`STARTING: ${entries.length} stories to process (indices ${fromIdx}–${total}), parallel=${parallel}`);

  const counters = { created: 0, failed: 0, skipped: 0, qcScores: [] as number[] };

  // Process in parallel batches
  for (let b = 0; b < entries.length; b += parallel) {
    const batch = entries.slice(b, b + parallel);
    const batchIndexes = batch.map((_, j) => fromIdx + b + j);

    await Promise.all(
      batch.map((entry, j) =>
        processSingleStory(entry, batchIndexes[j], total, counters, replace)
      )
    );

    // Batch QC checkpoint every 5 processed
    const processed = b + parallel;
    if (processed % 5 === 0 || b + parallel >= entries.length) {
      const recent = counters.qcScores.slice(-5);
      if (recent.length > 0) {
        const avg = recent.reduce((s, v) => s + v, 0) / recent.length;
        log(`=== BATCH QC checkpoint: avg ${avg.toFixed(1)} ===`);
      }
    }
  }

  // Final summary
  const avgQc = counters.qcScores.length > 0
    ? counters.qcScores.reduce((s, v) => s + v, 0) / counters.qcScores.length
    : null;

  log("=".repeat(60));
  log(`COMPLETE: ${counters.created} created, ${counters.skipped} skipped, ${counters.failed} failed`);
  log(`QC: avg ${avgQc !== null ? avgQc.toFixed(1) : "n/a"}, min ${counters.qcScores.length ? Math.min(...counters.qcScores).toFixed(1) : "n/a"}, max ${counters.qcScores.length ? Math.max(...counters.qcScores).toFixed(1) : "n/a"}`);
  log("=".repeat(60));
}

main().catch(err => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
