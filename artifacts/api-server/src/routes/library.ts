import { Router, type Request, type Response } from "express";
import {
  libraryStore,
  tasteStore,
  progressStore,
  storiesStore,
} from "../lib/storage.js";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { sql as drizzleSql, eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router = Router();

// ---------------------------------------------------------------------------
// Normalise a raw storiesStore record into a shape the frontend can consume.
// User-generated stories store their cover as images.cover ("/api/images/…")
// but the frontend Story type expects a top-level coverImage field.
// ---------------------------------------------------------------------------
function normaliseStory(s: Record<string, unknown>): Record<string, unknown> {
  const images = (s.images ?? {}) as Record<string, unknown>;
  const coverImage =
    (s.coverImage as string | undefined) ||
    (images.cover as string | undefined) ||
    "";
  return { ...s, coverImage };
}

function getUserId(req: Request, res: Response): string | null {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return req.user.id;
}

/** Returns true if the user has an active monthly/annual subscription. Sends 403 and returns false otherwise. */
async function requireActiveSubscription(req: Request, res: Response): Promise<boolean> {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: "Authentication required" }); return false; }
  const user = await db
    .select({ subscriptionPlan: usersTable.subscriptionPlan, subscriptionStatus: usersTable.subscriptionStatus })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .then(r => r[0]);
  const isActive = user?.subscriptionStatus === "active" &&
    (user?.subscriptionPlan === "monthly" || user?.subscriptionPlan === "annual");
  if (!isActive) {
    res.status(403).json({ error: "An active subscription is required to access your story library." });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Editorial fallback stories for when taste profile is empty
// ---------------------------------------------------------------------------
const EDITORIAL_PICKS = ["story-1", "story-2", "story-3", "story-4", "story-5"];

// ---------------------------------------------------------------------------
// POST /save-story
// ---------------------------------------------------------------------------
router.post("/save-story", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Authentication required" }); return; }
  if (!(await requireActiveSubscription(req, res))) return;
  const userId = req.user.id;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  await libraryStore.addSaved(userId, storyId);
  res.json({ saved: true });
});

// ---------------------------------------------------------------------------
// DELETE /save-story
// ---------------------------------------------------------------------------
router.delete("/save-story", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Authentication required" }); return; }
  if (!(await requireActiveSubscription(req, res))) return;
  const userId = req.user.id;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  await libraryStore.removeSaved(userId, storyId);
  res.json({ saved: false });
});

// ---------------------------------------------------------------------------
// POST /update-progress
// ---------------------------------------------------------------------------
router.post("/update-progress", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId, audioProgressSeconds, sceneIndex } = req.body as {
    storyId: string;
    audioProgressSeconds: number;
    sceneIndex: number;
  };

  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  await progressStore.set(userId, storyId, {
    audioProgressSeconds: audioProgressSeconds ?? 0,
    sceneIndex: sceneIndex ?? 0,
    updatedAt: new Date().toISOString(),
    storyId,
  });

  res.json({ updated: true });
});

// ---------------------------------------------------------------------------
// GET /library
// ---------------------------------------------------------------------------
router.get("/library", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Authentication required" }); return; }

  // Non-subscribers (free/immersive) have no library storage
  const hasActiveSub = await requireActiveSubscription(req, res).catch(() => false);
  if (!hasActiveSub) return;

  const userId = req.user.id;
  const [savedIds, generatedRows] = await Promise.all([
    libraryStore.getSavedStoryIds(userId),
    libraryStore.getGeneratedStoryIds(userId),
  ]);

  // Fetch story objects for saved story IDs
  const savedStories = await Promise.all(
    savedIds.map((id) => storiesStore.get(id))
  );
  const saved = savedStories.filter(Boolean).map(normaliseStory) as Record<string, unknown>[];

  // Fetch story objects for generated/variation IDs
  const generatedStories = await Promise.all(
    generatedRows.map(async (r) => {
      const s = await storiesStore.get(r.storyId);
      return s ? { ...normaliseStory(s), _libType: r.type } : null;
    })
  );
  const allGenerated = generatedStories.filter(Boolean) as Array<Record<string, unknown>>;

  const generated = allGenerated.filter((s) => s._libType === "generated");
  const variations = allGenerated.filter((s) => s._libType === "variation");

  res.json({ saved, generated, variations });
});

// ---------------------------------------------------------------------------
// GET /progress — fetch stored position for a single story
// ---------------------------------------------------------------------------
router.get("/progress", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.query as { storyId?: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }
  const entry = await progressStore.get(userId, storyId);
  res.json(entry ?? null);
});

// ---------------------------------------------------------------------------
// DELETE /progress — mark story complete by removing its progress entry
// ---------------------------------------------------------------------------
router.delete("/progress", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }
  await progressStore.delete(userId, storyId);
  res.json({ deleted: true });
});

// ---------------------------------------------------------------------------
// DELETE /generated-story — delete a user-generated story
// ---------------------------------------------------------------------------
router.delete("/generated-story", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  // Remove from user's generated stories list
  await libraryStore.removeGenerated(userId, storyId);
  // Also remove progress and saved entry if present
  await Promise.all([
    progressStore.delete(userId, storyId),
    libraryStore.removeSaved(userId, storyId),
  ]).catch(() => {});

  res.json({ deleted: true });
});

// ---------------------------------------------------------------------------
// GET /continue-listening
// ---------------------------------------------------------------------------
router.get("/continue-listening", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const userProgressMap = await progressStore.getUserProgress(userId);

  // Only include stories with meaningful progress (> 5 seconds in)
  const inProgress = Object.values(userProgressMap)
    .filter((entry) => entry.audioProgressSeconds > 5)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Fetch story objects
  const storiesWithProgress = await Promise.all(
    inProgress.map(async (entry) => {
      const story = await storiesStore.get(entry.storyId);
      if (!story) return null;
      return { ...normaliseStory(story), progress: entry };
    })
  );

  res.json(storiesWithProgress.filter(Boolean));
});

// ---------------------------------------------------------------------------
// POST /update-taste
// ---------------------------------------------------------------------------
router.post("/update-taste", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { mood, intensity, voiceFeel, endingType, relationshipDynamic, event } = req.body as {
    mood?: string;
    intensity?: string;
    voiceFeel?: string;
    endingType?: string;
    relationshipDynamic?: string;
    event: "generated" | "replayed" | "saved" | "completed";
  };

  const weight = event === "saved" ? 3 : event === "completed" ? 2 : 1;
  const taste = await tasteStore.get(userId);

  if (mood) {
    taste.tasteProfile[mood] = (taste.tasteProfile[mood] ?? 0) + weight;
  }
  if (intensity) {
    taste.preferredIntensity[intensity] = (taste.preferredIntensity[intensity] ?? 0) + weight;
  }
  if (voiceFeel) {
    taste.preferredVoiceFeel[voiceFeel] = (taste.preferredVoiceFeel[voiceFeel] ?? 0) + weight;
  }
  if (endingType) {
    taste.preferredEndings[endingType] = (taste.preferredEndings[endingType] ?? 0) + weight;
  }
  if (relationshipDynamic) {
    taste.preferredRelationshipDynamics[relationshipDynamic] =
      (taste.preferredRelationshipDynamics[relationshipDynamic] ?? 0) + weight;
  }

  await tasteStore.upsert(userId, taste);
  res.json({ updated: true });
});

// ---------------------------------------------------------------------------
// trackGeneratedStory — called from generate.ts after successful generation
// ---------------------------------------------------------------------------
export async function trackGeneratedStory(
  userId: string,
  storyId: string,
  mood: string,
  intensity: string,
  voiceFeel: string,
  variantType?: string | null,
  experienceTags?: string[],
  casting?: { whoIsHe?: string; dynamic?: string; ending?: string },
): Promise<void> {
  if (!userId) return;

  // Persist to user library
  await libraryStore.addGenerated(userId, storyId, variantType);

  // Update taste profile
  const taste = await tasteStore.get(userId);
  taste.tasteProfile[mood] = (taste.tasteProfile[mood] ?? 0) + 1;
  taste.preferredIntensity[intensity] = (taste.preferredIntensity[intensity] ?? 0) + 1;
  taste.preferredVoiceFeel[voiceFeel] = (taste.preferredVoiceFeel[voiceFeel] ?? 0) + 1;

  // Save experience tags (StoryTagStudio selections)
  if (experienceTags && experienceTags.length > 0) {
    for (const tag of experienceTags) {
      taste.tasteProfile[tag] = (taste.tasteProfile[tag] ?? 0) + 1;
    }
  }

  // Save casting choices (archetype, power dynamic, ending)
  if (casting?.whoIsHe) {
    taste.preferredRelationshipDynamics[casting.whoIsHe] =
      (taste.preferredRelationshipDynamics[casting.whoIsHe] ?? 0) + 1;
  }
  if (casting?.dynamic) {
    taste.preferredRelationshipDynamics[casting.dynamic] =
      (taste.preferredRelationshipDynamics[casting.dynamic] ?? 0) + 1;
  }
  if (casting?.ending) {
    taste.preferredEndings[casting.ending] =
      (taste.preferredEndings[casting.ending] ?? 0) + 1;
  }

  await tasteStore.upsert(userId, taste);

  // Increment subscription usage counters (non-blocking — counter failure never stops the response)
  db.update(usersTable)
    .set({
      storiesGeneratedThisMonth: drizzleSql`${usersTable.storiesGeneratedThisMonth} + 1`,
      storiesGeneratedThisYear: drizzleSql`${usersTable.storiesGeneratedThisYear} + 1`,
    })
    .where(eq(usersTable.id, userId))
    .catch((err: unknown) => logger.error({ err, userId }, "[library] Failed to increment story counters"));
}

// ---------------------------------------------------------------------------
// GET /recommendations — personalised for the authenticated user
// ---------------------------------------------------------------------------
router.get("/recommendations", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const userId = req.user.id;
  const allStories = await storiesStore.getAll();
  const storyList = Object.values(allStories);

  const editorialFallback = EDITORIAL_PICKS
    .map((id) => allStories[id])
    .filter(Boolean);

  const taste = await tasteStore.get(userId);
  const hasProfile = Object.keys(taste.tasteProfile).length > 0;

  // Top mood by score
  const sortedMoods = Object.entries(taste.tasteProfile).sort(([, a], [, b]) => b - a);
  const topMood = sortedMoods[0]?.[0];

  // Recent mood from progress
  const userProgressMap = await progressStore.getUserProgress(userId);
  const mostRecent = Object.values(userProgressMap).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
  const recentMood = mostRecent
    ? (allStories[mostRecent.storyId]?.mood as string | undefined)
    : undefined;

  const matchMood = (mood: string) =>
    storyList.filter((s) => (s as Record<string, unknown>).mood === mood).slice(0, 8);

  const forYou = hasProfile && topMood ? matchMood(topMood) : editorialFallback;
  const becauseYouLiked = hasProfile && topMood ? matchMood(topMood).slice(0, 6) : [];
  const continueTheMood = recentMood
    ? matchMood(recentMood).slice(0, 6)
    : hasProfile
    ? forYou.slice(0, 4)
    : [];

  res.json({
    for_you: forYou,
    because_you_liked: becauseYouLiked,
    because_you_liked_mood: topMood ?? null,
    continue_the_mood: continueTheMood,
    has_taste_profile: hasProfile,
  });
});

export default router;
