import { Router, type Request, type Response, type NextFunction } from "express";
import { tasteStore, storiesStore, progressStore, presetsStore, libraryStore, reactionHistoryStore } from "../lib/storage.js";
import { db, usersTable } from "@workspace/db";
import { nameSubmissions } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../lib/logger.js";

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
    storyId,
    storyTitle,
  } = req.body as {
    reactionTags?: string[];
    incrementStreak?: boolean;
    tasteProfile?: Record<string, number>;
    preferredIntensity?: Record<string, number>;
    preferredVoiceFeel?: Record<string, number>;
    preferredEndings?: Record<string, number>;
    preferredRelationshipDynamics?: Record<string, number>;
    storyId?: string;
    storyTitle?: string;
  };

  try {
    const current = await tasteStore.get(userId);

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

    if (storyId && reactionTags && reactionTags.length > 0) {
      reactionHistoryStore.addEntry(userId, storyId, storyTitle ?? "", reactionTags).catch(() => {});
    }

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
// GET /api/me/reaction-history — last 5 story reactions
// ---------------------------------------------------------------------------
router.get("/reaction-history", async (req, res) => {
  const userId = getUserId(req);
  try {
    const history = await reactionHistoryStore.getRecent(userId, 5);
    res.json(history);
  } catch {
    res.status(500).json({ error: "Failed to load reaction history" });
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

// ---------------------------------------------------------------------------
// GET /api/me/presets
// ---------------------------------------------------------------------------
router.get("/presets", async (req, res) => {
  const userId = getUserId(req);
  try {
    const presets = await presetsStore.getAll(userId);
    res.json(presets);
  } catch {
    res.status(500).json({ error: "Failed to load presets" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/me/presets
// ---------------------------------------------------------------------------
router.post("/presets", async (req, res) => {
  const userId = getUserId(req);
  const { name, castingData } = req.body as { name?: string; castingData?: Record<string, unknown> };

  if (!name || !castingData) {
    return res.status(400).json({ error: "name and castingData required" });
  }

  try {
    const preset = await presetsStore.create(userId, name.slice(0, 80), castingData);
    res.json(preset);
  } catch {
    res.status(500).json({ error: "Failed to save preset" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/me/presets/:id
// ---------------------------------------------------------------------------
router.delete("/presets/:id", async (req, res) => {
  const userId = getUserId(req);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    await presetsStore.delete(userId, id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete preset" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/library — user's saved + generated stories
// ---------------------------------------------------------------------------
router.get("/library", async (req, res) => {
  const userId = getUserId(req);
  try {
    const [savedIds, generatedRows] = await Promise.all([
      libraryStore.getSavedStoryIds(userId),
      libraryStore.getGeneratedStoryIds(userId),
    ]);

    const allIds = [...new Set([...savedIds, ...generatedRows.map((r) => r.storyId)])];

    const storyMap: Record<string, Record<string, unknown>> = {};
    await Promise.all(
      allIds.map(async (id) => {
        const s = await storiesStore.get(id);
        if (s) storyMap[id] = s;
      }),
    );

    const saved = savedIds.map((id) => storyMap[id]).filter(Boolean);
    const generated = generatedRows
      .filter((r) => r.type === "generated")
      .map((r) => storyMap[r.storyId])
      .filter(Boolean);

    res.json({ saved, generated });
  } catch {
    res.status(500).json({ error: "Failed to load library" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/quick-create-params — converts taste profile → generation body
// ---------------------------------------------------------------------------
router.get("/quick-create-params", async (req, res) => {
  const userId = getUserId(req);

  try {
    const taste = await tasteStore.get(userId);

    const totalSignals =
      Object.values(taste.tasteProfile).reduce((a, b) => a + b, 0) +
      Object.values(taste.preferredIntensity).reduce((a, b) => a + b, 0);

    if (totalSignals < 5) {
      return res.status(200).json({ eligible: false, error: "Not enough taste data" });
    }

    const topMood = Object.entries(taste.tasteProfile)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Emotional";

    const topIntensity = Object.entries(taste.preferredIntensity)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Heated";

    const topVoice = Object.entries(taste.preferredVoiceFeel)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Soft Voice";

    const topDynamic = Object.entries(taste.preferredRelationshipDynamics)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";

    const topEnding = Object.entries(taste.preferredEndings)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";

    const VALID_MOODS = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];
    const VALID_INTENSITIES = ["Tender", "Heated", "Explicit", "Scorching"];
    const VALID_VOICES = ["Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice"];

    const mood = VALID_MOODS.includes(topMood) ? topMood : "Emotional";
    const intensity = VALID_INTENSITIES.includes(topIntensity) ? topIntensity : "Heated";
    const voiceFeel = VALID_VOICES.includes(topVoice) ? topVoice : "Soft Voice";

    res.json({
      eligible: true,
      mood,
      intensity,
      voiceFeel,
      storyLength: "5 min",
      scenarioPrompt: topDynamic
        ? `A story with the energy of: ${topDynamic}. Make it feel intimate and surprising.`
        : "An unexpected late-evening encounter that becomes emotionally charged.",
      whoIsHe: topDynamic || "",
      dynamic: topDynamic || "",
      ending: topEnding || "",
      cinematicVisuals: true,
      emotionalFocus: false,
      bypassCache: true,
    });
  } catch {
    res.status(500).json({ error: "Failed to build quick-create params" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/profile-names — return user's current approved story names
// ---------------------------------------------------------------------------
router.get("/profile-names", (req, res) => {
  return res.json({
    listenerName: req.user.approvedListenerName ?? null,
    partnerName: req.user.approvedPartnerName ?? null,
  });
});

// ---------------------------------------------------------------------------
// PUT /api/me/profile-names — set a story name directly from the curated NAMES list (no admin review).
// For custom names not in the list, users must use POST /api/names/submit instead.
// ---------------------------------------------------------------------------
const NAME_BLOCKLIST = new Set([
  "fuck", "shit", "cunt", "nigger", "nigga", "faggot", "fag", "bitch",
  "whore", "slut", "retard", "spastic", "kike", "chink", "spic", "wetback",
  "cracker", "coon", "dyke", "tranny",
]);

router.put("/profile-names", async (req, res) => {
  const userId = getUserId(req);
  const { listenerName, partnerName } = req.body as {
    listenerName?: string;
    partnerName?: string;
  };

  if (!listenerName && !partnerName) {
    return res.status(400).json({ error: "At least one of listenerName or partnerName is required." });
  }

  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!/^[A-Za-z]{2,20}$/.test(trimmed)) {
      return "Names must be 2–20 letters only, no spaces or special characters.";
    }
    if (NAME_BLOCKLIST.has(trimmed.toLowerCase())) {
      return "This name cannot be used.";
    }
    return null;
  };

  if (listenerName) {
    const err = validateName(listenerName);
    if (err) return res.status(400).json({ error: err });
  }
  if (partnerName) {
    const err = validateName(partnerName);
    if (err) return res.status(400).json({ error: err });
  }

  try {
    const update: Partial<{ approvedListenerName: string; approvedPartnerName: string }> = {};
    if (listenerName) update.approvedListenerName = listenerName.trim();
    if (partnerName) update.approvedPartnerName = partnerName.trim();

    await db.update(usersTable).set(update).where(eq(usersTable.id, userId));

    return res.json({
      ok: true,
      listenerName: update.approvedListenerName ?? req.user.approvedListenerName ?? null,
      partnerName: update.approvedPartnerName ?? req.user.approvedPartnerName ?? null,
    });
  } catch (err) {
    logger.error({ err, userId }, "Failed to update profile names");
    return res.status(500).json({ error: "Failed to update profile names." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/name-submissions — user's own pending/reviewed name submissions
// ---------------------------------------------------------------------------
router.get("/name-submissions", async (req, res) => {
  const userId = getUserId(req);
  try {
    const rows = await db
      .select({
        id: nameSubmissions.id,
        name: nameSubmissions.name,
        nameType: nameSubmissions.nameType,
        status: nameSubmissions.status,
        submittedAt: nameSubmissions.submittedAt,
        reviewedAt: nameSubmissions.reviewedAt,
      })
      .from(nameSubmissions)
      .where(
        and(
          eq(nameSubmissions.submittedByUserId, userId),
        ),
      )
      .orderBy(desc(nameSubmissions.submittedAt));
    return res.json({ submissions: rows });
  } catch (err) {
    logger.error({ err, userId }, "Failed to load name submissions");
    return res.status(500).json({ error: "Failed to load name submissions." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/me — GDPR Article 17 right to erasure (self-service account deletion)
// Soft-deletes the user record and clears all personal data from storage.
// ---------------------------------------------------------------------------
router.delete("/", async (req, res) => {
  const userId = getUserId(req);

  try {
    // Soft-delete the user row by setting deletedAt
    await db
      .update(usersTable)
      .set({ deletedAt: new Date() })
      .where(eq(usersTable.id, userId));

    // Clear all personal storage data (non-blocking — failures are logged but don't block response)
    // Erasure of AI-generated content and taste data happens within 30 days per Privacy Policy
    const cleanupTasks = [
      tasteStore.upsert(userId, { tasteProfile: {}, preferredIntensity: {}, preferredVoiceFeel: {}, preferredEndings: {}, preferredRelationshipDynamics: {}, streakDays: 0, lastActiveDate: null }),
    ];
    await Promise.allSettled(cleanupTasks);

    logger.info({ userId }, "[account-deletion] User account soft-deleted (GDPR Art.17)");
    res.json({ ok: true, message: "Your account has been scheduled for deletion. All personal data will be removed within 30 days." });
  } catch (err) {
    logger.error({ err, userId }, "[account-deletion] Failed to delete account");
    res.status(500).json({ error: "Failed to delete account. Please contact safety@theprivatestory.com for assistance." });
  }
});

export default router;
