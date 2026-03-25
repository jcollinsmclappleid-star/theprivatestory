import { Router, type Request, type Response, type NextFunction } from "express";
import { tasteStore, storiesStore, progressStore } from "../lib/storage.js";

const router = Router();

// Shared auth guard — all /api/me/* routes require authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

router.use(requireAuth);

function getUserId(req: Request): string {
  return req.user.id;
}

// ---------------------------------------------------------------------------
// GET /api/me/taste — full taste profile + streak
// ---------------------------------------------------------------------------
router.get("/taste", async (req, res) => {
  const userId = getUserId(req);

  try {
    const taste = await tasteStore.get(userId);
    res.json({
      tasteProfile: taste.tasteProfile,
      preferredIntensity: taste.preferredIntensity,
      preferredVoiceFeel: taste.preferredVoiceFeel,
      preferredEndings: taste.preferredEndings,
      preferredRelationshipDynamics: taste.preferredRelationshipDynamics,
      streakDays: taste.streakDays,
      lastActiveDate: taste.lastActiveDate,
    });
  } catch {
    res.status(500).json({ error: "Failed to load taste profile" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/me/taste — deep-merge increments across all taste dimensions
// ---------------------------------------------------------------------------
router.post("/taste", async (req, res) => {
  const userId = getUserId(req);

  const {
    reactionTags,
    incrementStreak,
    tasteProfile,
    preferredIntensity,
    preferredVoiceFeel,
    preferredEndings,
    preferredRelationshipDynamics,
  } = req.body as {
    reactionTags?: string[];
    incrementStreak?: boolean;
    tasteProfile?: Record<string, number>;
    preferredIntensity?: Record<string, number>;
    preferredVoiceFeel?: Record<string, number>;
    preferredEndings?: Record<string, number>;
    preferredRelationshipDynamics?: Record<string, number>;
  };

  try {
    const current = await tasteStore.get(userId);

    if (reactionTags && reactionTags.length > 0) {
      for (const tag of reactionTags) {
        current.tasteProfile[tag] = (current.tasteProfile[tag] ?? 0) + 1;
      }
    }

    if (tasteProfile) {
      for (const [key, val] of Object.entries(tasteProfile)) {
        current.tasteProfile[key] = (current.tasteProfile[key] ?? 0) + val;
      }
    }

    if (preferredIntensity) {
      for (const [key, val] of Object.entries(preferredIntensity)) {
        current.preferredIntensity[key] = (current.preferredIntensity[key] ?? 0) + val;
      }
    }

    if (preferredVoiceFeel) {
      for (const [key, val] of Object.entries(preferredVoiceFeel)) {
        current.preferredVoiceFeel[key] = (current.preferredVoiceFeel[key] ?? 0) + val;
      }
    }

    if (preferredEndings) {
      for (const [key, val] of Object.entries(preferredEndings)) {
        current.preferredEndings[key] = (current.preferredEndings[key] ?? 0) + val;
      }
    }

    if (preferredRelationshipDynamics) {
      for (const [key, val] of Object.entries(preferredRelationshipDynamics)) {
        current.preferredRelationshipDynamics[key] =
          (current.preferredRelationshipDynamics[key] ?? 0) + val;
      }
    }

    await tasteStore.upsert(userId, current);

    if (incrementStreak) {
      const { streakDays } = await tasteStore.incrementStreak(userId);
      return res.json({ ok: true, streakDays });
    }

    res.json({ ok: true, streakDays: current.streakDays });
  } catch {
    res.status(500).json({ error: "Failed to update taste profile" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/recommendations — multi-factor personalised recommendations
// ---------------------------------------------------------------------------
router.get("/recommendations", async (req, res) => {
  const userId = getUserId(req);

  try {
    const [taste, allStoriesMap] = await Promise.all([
      tasteStore.get(userId),
      storiesStore.getAll(),
    ]);

    const storyList = Object.values(allStoriesMap) as Array<Record<string, unknown>>;
    const hasProfile =
      Object.keys(taste.tasteProfile).length > 0 ||
      Object.keys(taste.preferredIntensity).length > 0;

    // Known story mood values — used to avoid confusing reaction labels with moods
    const KNOWN_MOODS = new Set([
      "Late Night", "Slow Burn", "Quick Fix", "Slow Burn", "Morning",
      "Passionate", "Tender", "Playful", "Intense", "Romantic", "Dark",
      "Fantasy", "Soft Dom", "After Dark",
    ]);

    // Collect all story moods from the library so we only promote keys that are real moods
    const libraryMoodSet = new Set(
      storyList
        .filter((s) => s.isLibraryStory === true && s.status === "published")
        .map((s) => s.mood as string | undefined)
        .filter(Boolean),
    ) as Set<string>;

    // Top tags (generic — used for scoring overlap)
    const topTags = Object.entries(taste.tasteProfile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([k]) => k);
    const topTagSet = new Set(topTags);

    // Top moods — restricted to keys that actually match a library story mood
    const topMoods = Object.entries(taste.tasteProfile)
      .filter(([k]) => KNOWN_MOODS.has(k) || libraryMoodSet.has(k))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([k]) => k);

    const topIntensity = Object.entries(taste.preferredIntensity)
      .sort(([, a], [, b]) => b - a)
      .map(([k]) => k)[0] ?? null;

    function scoreStory(story: Record<string, unknown>): number {
      let score = 0;
      const storyMood = story.mood as string | undefined;
      const storyTags = (story.recommendation_tags as string[] | undefined) ?? [];

      if (storyMood && taste.tasteProfile[storyMood]) {
        score += taste.tasteProfile[storyMood] * 3;
      }

      for (const tag of storyTags) {
        if (taste.tasteProfile[tag]) score += taste.tasteProfile[tag] * 2;
        if (topTagSet.has(tag)) score += 1;
      }

      const brief = story.brief as Record<string, unknown> | undefined;
      const storyDna = story.storyDna as Record<string, unknown> | undefined;
      const intensityVal = (brief?.intensity ?? storyDna?.intensity) as string | undefined;
      if (intensityVal && topIntensity && intensityVal === topIntensity) {
        score += taste.preferredIntensity[topIntensity] ?? 1;
      }

      return score;
    }

    const libraryStories = storyList.filter(
      (s) => s.isLibraryStory === true && s.status === "published",
    );

    const sorted = hasProfile
      ? [...libraryStories].sort((a, b) => scoreStory(b) - scoreStory(a))
      : libraryStories;

    const topMood = topMoods[0] ?? null;
    const forYou = sorted.slice(0, 8);
    const becauseYouLiked = hasProfile && topMood
      ? sorted.filter((s) => (s.mood as string | undefined) === topMood).slice(0, 6)
      : [];

    res.json({
      for_you: forYou,
      because_you_liked: becauseYouLiked,
      because_you_liked_mood: topMood,
      has_taste_profile: hasProfile,
    });
  } catch {
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/continue-listening
// ---------------------------------------------------------------------------
router.get("/continue-listening", async (req, res) => {
  const userId = getUserId(req);

  try {
    const userProgressMap = await progressStore.getUserProgress(userId);

    const inProgress = Object.values(userProgressMap)
      .filter((entry) => entry.audioProgressSeconds > 5)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const storiesWithProgress = await Promise.all(
      inProgress.map(async (entry) => {
        const story = await storiesStore.get(entry.storyId);
        if (!story) return null;
        return { ...story, progress: entry };
      }),
    );

    res.json(storiesWithProgress.filter(Boolean));
  } catch {
    res.status(500).json({ error: "Failed to load continue-listening" });
  }
});

export default router;
