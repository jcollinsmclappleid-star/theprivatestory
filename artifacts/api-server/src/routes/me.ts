import { Router, type Request, type Response, type NextFunction } from "express";
import Stripe from "stripe";
import { tasteStore, storiesStore, progressStore, presetsStore, libraryStore, reactionHistoryStore } from "../lib/storage.js";
import { db, usersTable } from "@workspace/db";
import { nameSubmissions, consentLog } from "@workspace/db/schema";
import { eq, and, desc, sql as drizzleSql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { validateNameFormat, isBlockedInput } from "../lib/contentBlocklist.js";
import { VALID_EXPERIENCE_TAGS } from "../lib/validTags.js";
import { canonicalizeIntensity } from "@workspace/intensity";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

// ---------------------------------------------------------------------------
// Canonical allowlists for taste profile dimensions.
// Keys outside these sets are silently dropped — never stored or acted upon.
// Must be kept in sync with the equivalent constants in generate.ts.
// ---------------------------------------------------------------------------
const VALID_TASTE_INTENSITIES = new Set([
  "Subtle", "Warm", "Elevated", "Intense",
]);
const VALID_TASTE_VOICES = new Set([
  // Current voice IDs
  "RILOU7YmBhvwJGDGjNmP", // Jane (Audio Story)
  "tQ4MEZFJOzsahSEEZtHK", // Ivanna (Soft Intimate)
  "FA6HhUjVbervLw2rNl8M", // Ophelia Rose (Calm Bedtime)
  "AeRdCCKzvd23BpJoofzx", // Nathaniel (British Suspense)
  "n1PvBOwxb8X6m7tahp2h", // Michael C. Vincent (Cinematic Male)
  "jfIS2w2yJi0grJZPyEsk", // Oliver Silk (Deep Gravel)
  // Legacy region values — kept for backward compatibility with stored taste profiles
  "UK Voice", "US Voice",
  "Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice",
]);
const VALID_TASTE_ENDINGS = new Set([
  "Left wanting more", "Fully satisfied", "Tender afterglow",
  "Unresolved and open", "A promise of more",
  "Something shifts between you", "He says the thing he's been holding back",
]);
const VALID_TASTE_DYNAMICS = new Set([
  "They pursue, I decide", "Equal desire, equal intensity", "I take what I want",
  "Dominant and yielding", "Forbidden desire", "Adoration and surrender",
  "He pursues, I decide", "He's completely in control", "I'm completely in control",
  "We've been circling this for months", "He's patient until he isn't",
  "I dare him to follow through",
]);

/** Clamp an increment value: must be a positive finite number, max 10 per call. */
function clampIncrement(val: unknown): number | null {
  if (typeof val !== "number" || !isFinite(val) || val <= 0) return null;
  return Math.min(Math.round(val), 10);
}

/** Filter a client-supplied Record to only allowed keys, clamping values. */
function filterDimension(
  raw: Record<string, unknown>,
  allowed: Set<string>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!allowed.has(key)) continue;
    const clamped = clampIncrement(val);
    if (clamped !== null) out[key] = clamped;
  }
  return out;
}

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

/** Returns true if the authenticated user has an active monthly/annual subscription. */
async function isActiveSubscriber(userId: string): Promise<boolean> {
  const user = await db
    .select({ subscriptionPlan: usersTable.subscriptionPlan, subscriptionStatus: usersTable.subscriptionStatus })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .then(r => r[0]);
  return user?.subscriptionStatus === "active" &&
    (user?.subscriptionPlan === "monthly" || user?.subscriptionPlan === "annual");
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
// Subscription plan helpers
// ---------------------------------------------------------------------------

const PLAN_LIMITS: Record<string, { period: "month" | "year"; limit: number }> = {
  free: { period: "month", limit: 0 },
  monthly: { period: "month", limit: 5 },
  annual: { period: "year", limit: 50 },
};

const PACK_PLANS_SET = new Set(["pack_1", "pack_5", "pack_20"]);

/** Returns the user's current usage stats. */
export async function getOrResetUsage(userId: string): Promise<{
  plan: string;
  used: number;
  limit: number;
  renewDate: string | null;
  canGenerate: boolean;
  storiesRemaining: number;
  rolloverCredits: number;
  addonStoriesRemaining: number;
  storyCreditsRemaining: number;
  subscriptionStatus: string | null;
  cancelAt: string | null;
}> {
  const [user] = await db
    .select({
      subscriptionPlan: usersTable.subscriptionPlan,
      storiesGeneratedThisMonth: usersTable.storiesGeneratedThisMonth,
      storiesGeneratedThisYear: usersTable.storiesGeneratedThisYear,
      subscriptionRenewDate: usersTable.subscriptionRenewDate,
      subscriptionStatus: usersTable.subscriptionStatus,
      subscriptionCancelAt: usersTable.subscriptionCancelAt,
      rolloverCredits: usersTable.rolloverCredits,
      addonStoriesRemaining: usersTable.addonStoriesRemaining,
      storyCreditsRemaining: usersTable.storyCreditsRemaining,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    return { plan: "free", used: 0, limit: 0, renewDate: null, canGenerate: false, storiesRemaining: 0, rolloverCredits: 0, addonStoriesRemaining: 0, storyCreditsRemaining: 0, subscriptionStatus: null, cancelAt: null };
  }

  const plan = user.subscriptionPlan ?? "free";
  const addonStoriesRemaining = user.addonStoriesRemaining ?? 0;
  const storyCreditsRemaining = user.storyCreditsRemaining ?? 0;

  // Pack plan model: credits never expire, no period concept
  if (PACK_PLANS_SET.has(plan)) {
    return {
      plan,
      used: 0,
      limit: 0,
      renewDate: null,
      canGenerate: storyCreditsRemaining > 0,
      storiesRemaining: storyCreditsRemaining,
      rolloverCredits: 0,
      addonStoriesRemaining,
      storyCreditsRemaining,
      subscriptionStatus: null,
      cancelAt: null,
    };
  }

  const planConfig = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const renewDate = user.subscriptionRenewDate;
  const rolloverCredits = user.rolloverCredits ?? 0;

  let used = planConfig.period === "year"
    ? (user.storiesGeneratedThisYear ?? 0)
    : (user.storiesGeneratedThisMonth ?? 0);

  // When the renewal period has passed, treat usage as 0 for display purposes but do NOT write to DB.
  if (renewDate && plan !== "free" && new Date() > renewDate) {
    used = 0;
  }

  const planRemaining = Math.max(0, planConfig.limit - used);
  const storiesRemaining = planRemaining + rolloverCredits;
  const canGenerate = (plan !== "free" && (used < planConfig.limit || rolloverCredits > 0)) || addonStoriesRemaining > 0;

  return {
    plan,
    used,
    limit: planConfig.limit,
    renewDate: renewDate ? renewDate.toISOString() : null,
    canGenerate,
    storiesRemaining,
    rolloverCredits,
    addonStoriesRemaining,
    storyCreditsRemaining,
    subscriptionStatus: user.subscriptionStatus ?? null,
    cancelAt: user.subscriptionCancelAt ? user.subscriptionCancelAt.toISOString() : null,
  };
}

// ---------------------------------------------------------------------------
// GET /api/me/usage — current subscription plan + usage
// ---------------------------------------------------------------------------
router.get("/usage", async (req, res) => {
  const userId = getUserId(req);
  try {
    const usage = await getOrResetUsage(userId);
    res.json(usage);
  } catch (err) {
    logger.error({ err, userId }, "Failed to load usage");
    res.status(500).json({ error: "Failed to load usage" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/debug — Check admin status (temporary)
// ---------------------------------------------------------------------------
router.get("/debug", async (req, res) => {
  const userId = getUserId(req);
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        isAdmin: usersTable.isAdmin,
        subscriptionPlan: usersTable.subscriptionPlan,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    logger.error({ err, userId }, "Failed to load debug info");
    res.status(500).json({ error: "Failed to load debug info" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/me/debug/set-admin — Set admin status (temporary)
// ---------------------------------------------------------------------------
router.post("/debug/set-admin", async (req, res) => {
  const userId = getUserId(req);
  try {
    await db
      .update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.id, userId));

    res.json({ ok: true, message: "Admin status set to true" });
  } catch (err) {
    logger.error({ err, userId }, "Failed to set admin status");
    res.status(500).json({ error: "Failed to set admin status" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/me/export — GDPR Article 15 data export (download all personal data)
// ---------------------------------------------------------------------------
router.get("/export", async (req, res) => {
  const userId = getUserId(req);

  try {
    const [userRow] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const [taste, progressMap, savedIds, generatedRows, presets, consentHistory] = await Promise.all([
      tasteStore.get(userId),
      progressStore.getUserProgress(userId),
      libraryStore.getSavedStoryIds(userId),
      libraryStore.getGeneratedStoryIds(userId),
      presetsStore.getAll(userId),
      db.select().from(consentLog).where(eq(consentLog.userId, userId)),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: {
        id: userRow?.id,
        email: userRow?.email,
        name: userRow?.name,
        firstName: userRow?.firstName,
        lastName: userRow?.lastName,
        createdAt: userRow?.createdAt,
        subscriptionPlan: userRow?.subscriptionPlan,
        termsAcceptedAt: userRow?.termsAcceptedAt,
        ageDeclarationAt: userRow?.ageDeclarationAt,
      },
      consentHistory: consentHistory.map((r) => ({
        consentType: r.consentType,
        termsVersion: r.termsVersion,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
      })),
      tasteProfile: taste,
      listeningProgress: Object.values(progressMap),
      savedStoryIds: savedIds,
      generatedStoryIds: generatedRows.map((r) => r.storyId),
      castingPresets: presets,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="private-story-data-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (err) {
    logger.error({ err, userId }, "Failed to export user data");
    res.status(500).json({ error: "Failed to export data. Please contact support@theprivatestory.com." });
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
      const safe = filterDimension(tasteProfile as Record<string, unknown>, VALID_EXPERIENCE_TAGS);
      for (const [key, val] of Object.entries(safe)) {
        current.tasteProfile[key] = (current.tasteProfile[key] ?? 0) + val;
      }
    }

    if (preferredIntensity) {
      for (const [key, val] of Object.entries(preferredIntensity as Record<string, unknown>)) {
        const canonical = canonicalizeIntensity(String(key));
        const n = clampIncrement(val);
        if (n > 0) {
          current.preferredIntensity[canonical] = (current.preferredIntensity[canonical] ?? 0) + n;
        }
      }
    }

    if (preferredVoiceFeel) {
      const safe = filterDimension(preferredVoiceFeel as Record<string, unknown>, VALID_TASTE_VOICES);
      for (const [key, val] of Object.entries(safe)) {
        current.preferredVoiceFeel[key] = (current.preferredVoiceFeel[key] ?? 0) + val;
      }
    }

    if (preferredEndings) {
      const safe = filterDimension(preferredEndings as Record<string, unknown>, VALID_TASTE_ENDINGS);
      for (const [key, val] of Object.entries(safe)) {
        current.preferredEndings[key] = (current.preferredEndings[key] ?? 0) + val;
      }
    }

    if (preferredRelationshipDynamics) {
      const safe = filterDimension(preferredRelationshipDynamics as Record<string, unknown>, VALID_TASTE_DYNAMICS);
      for (const [key, val] of Object.entries(safe)) {
        current.preferredRelationshipDynamics[key] =
          (current.preferredRelationshipDynamics[key] ?? 0) + val;
      }
    }

    await tasteStore.upsert(userId, current);

    // Only record reaction tags that are on the canonical tag allowlist
    const safeReactionTags = (reactionTags ?? []).filter(t => VALID_EXPERIENCE_TAGS.has(t));
    if (storyId && safeReactionTags.length > 0) {
      reactionHistoryStore.addEntry(userId, storyId, storyTitle ?? "", safeReactionTags).catch(() => {});
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
    // Non-subscribers have no persisted library progress
    if (!(await isActiveSubscriber(userId))) {
      res.json([]);
      return;
    }

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
// GET /api/me/library — user's saved + generated stories (active subscribers only)
// ---------------------------------------------------------------------------
router.get("/library", async (req, res) => {
  const userId = getUserId(req);
  try {
    // Non-subscribers (free/immersive) have no library storage
    if (!(await isActiveSubscriber(userId))) {
      res.json({ saved: [], generated: [] });
      return;
    }

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
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Elevated";

    const topVoice = Object.entries(taste.preferredVoiceFeel)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "UK Voice";

    const topDynamic = Object.entries(taste.preferredRelationshipDynamics)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";

    const topEnding = Object.entries(taste.preferredEndings)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";

    const VALID_MOODS = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];
    const VALID_VOICE_IDS = ["RILOU7YmBhvwJGDGjNmP", "tQ4MEZFJOzsahSEEZtHK", "FA6HhUjVbervLw2rNl8M", "AeRdCCKzvd23BpJoofzx", "n1PvBOwxb8X6m7tahp2h", "jfIS2w2yJi0grJZPyEsk"];
    const LEGACY_VOICE_MAP: Record<string, string> = { "UK Voice": "RILOU7YmBhvwJGDGjNmP", "US Voice": "RILOU7YmBhvwJGDGjNmP", "Soft Voice": "RILOU7YmBhvwJGDGjNmP", "Deep Voice": "RILOU7YmBhvwJGDGjNmP", "Breathy Voice": "RILOU7YmBhvwJGDGjNmP", "Confident Voice": "RILOU7YmBhvwJGDGjNmP" };

    const mood = VALID_MOODS.includes(topMood) ? topMood : "Emotional";
    const intensity = canonicalizeIntensity(topIntensity, "Elevated");
    const voiceFeel = VALID_VOICE_IDS.includes(topVoice) ? topVoice : (LEGACY_VOICE_MAP[topVoice] ?? "RILOU7YmBhvwJGDGjNmP");

    res.json({
      eligible: true,
      mood,
      intensity,
      voiceFeel,
      storyLength: "10 min",
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
// POST /api/me/name-submissions — submit a custom name for admin review.
// Only admin approval writes the name to the user profile.
// ---------------------------------------------------------------------------
const NAME_BLOCKLIST = new Set([
  "fuck", "shit", "cunt", "nigger", "nigga", "faggot", "fag", "bitch",
  "whore", "slut", "retard", "spastic", "kike", "chink", "spic", "wetback",
  "cracker", "coon", "dyke", "tranny",
]);

const submissionCounts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = submissionCounts.get(userId);
  if (!entry || entry.resetAt < now) {
    submissionCounts.set(userId, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

router.post("/name-submissions", async (req, res) => {
  const userId = getUserId(req);
  const { name, nameType } = req.body ?? {};

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!nameType || !["listener", "partner"].includes(nameType)) {
    return res.status(400).json({ error: "nameType must be 'listener' or 'partner'." });
  }

  const trimmed = (name as string).trim();
  const type = nameType as "listener" | "partner";

  const nameFormatError = validateNameFormat(trimmed);
  if (nameFormatError) {
    return res.status(400).json({ error: nameFormatError });
  }
  if (trimmed.length > 15) {
    return res.status(400).json({ error: "Names must be 15 characters or fewer." });
  }
  if (NAME_BLOCKLIST.has(trimmed.toLowerCase()) || isBlockedInput(trimmed)) {
    return res.status(400).json({ error: "This name cannot be used." });
  }

  try {
    // One-pending-per-type: if user already has a pending submission of this nameType, reject
    const pendingForType = await db
      .select({ id: nameSubmissions.id })
      .from(nameSubmissions)
      .where(
        and(
          eq(nameSubmissions.submittedByUserId, userId),
          eq(nameSubmissions.nameType, type),
          eq(nameSubmissions.status, "pending"),
        ),
      )
      .limit(1);

    if (pendingForType.length > 0) {
      return res.status(409).json({ error: "You already have a pending submission for this name type. Wait for it to be reviewed before submitting another." });
    }

    // Duplicate suppression: same user + same name + same type (any status)
    const existing = await db
      .select({ id: nameSubmissions.id, status: nameSubmissions.status })
      .from(nameSubmissions)
      .where(
        and(
          eq(nameSubmissions.submittedByUserId, userId),
          eq(nameSubmissions.name, trimmed),
          eq(nameSubmissions.nameType, type),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return res.json({ ok: true, name: trimmed, status: existing[0].status });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: "You can request up to 3 names per day. Please try again tomorrow." });
    }

    await db.insert(nameSubmissions).values({
      name: trimmed,
      submittedByUserId: userId,
      nameType: type,
      status: "pending",
    });

    return res.json({ ok: true, name: trimmed, status: "pending" });
  } catch (err) {
    logger.error({ err, userId }, "Failed to create name submission");
    return res.status(500).json({ error: "Server error. Please try again." });
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
// PATCH /api/me/accept-terms — record terms + age declaration acceptance
// ---------------------------------------------------------------------------
router.patch("/accept-terms", async (req, res) => {
  const userId = getUserId(req);
  const ipAddress = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? null;
  const userAgent = req.headers["user-agent"] ?? null;
  try {
    await db
      .update(usersTable)
      .set({ termsAcceptedAt: new Date(), ageDeclarationAt: new Date() })
      .where(eq(usersTable.id, userId));

    await db.insert(consentLog).values([
      {
        userId,
        consentType: "terms_accepted",
        termsVersion: "v1",
        ipAddress,
        userAgent,
      },
      {
        userId,
        consentType: "age_declaration",
        termsVersion: "v1",
        ipAddress,
        userAgent,
      },
    ]);

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err, userId }, "[accept-terms] Failed to record acceptance");
    res.status(500).json({ error: "Failed to record acceptance. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/me — GDPR Article 17 right to erasure (self-service account deletion)
// Soft-deletes the user record and clears all personal data from storage.
// If an active recurring Stripe subscription exists it is cancelled immediately
// before the soft-delete proceeds; the request is blocked if cancellation fails.
// ---------------------------------------------------------------------------
router.delete("/", async (req, res) => {
  const userId = getUserId(req);

  try {
    // Fetch subscription state to enforce the "cancel first" rule.
    const [userRow] = await db
      .select({
        email: usersTable.email,
        stripeCustomerId: usersTable.stripeCustomerId,
        stripeSubscriptionId: usersTable.stripeSubscriptionId,
        subscriptionStatus: usersTable.subscriptionStatus,
        subscriptionPlan: usersTable.subscriptionPlan,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    // Active recurring: subscription ID not required here — we may need the email
    // fallback for accounts where stripeSubscriptionId was never persisted correctly.
    const hasActiveRecurring =
      userRow?.subscriptionStatus === "active" &&
      (userRow?.subscriptionPlan === "monthly" || userRow?.subscriptionPlan === "annual");

    if (hasActiveRecurring) {
      const stripe = getStripe();
      if (!stripe) {
        res.status(503).json({ error: "Payment processing is unavailable. Please cancel your subscription manually before deleting your account, or contact support@theprivatestory.com." });
        return;
      }

      let cancelled = false;

      // Primary path: cancel by stored subscription ID
      if (userRow.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(userRow.stripeSubscriptionId);
          cancelled = true;
          logger.info({ userId, stripeSubscriptionId: userRow.stripeSubscriptionId }, "[account-deletion] Subscription cancelled via stored ID");
        } catch (stripeErr) {
          logger.warn({ err: stripeErr, userId }, "[account-deletion] Direct cancel failed — trying email fallback");
        }
      }

      // Email fallback: handles accounts where the stored customer/subscription ID
      // is an orphan or was never saved correctly.
      if (!cancelled && userRow.email) {
        try {
          const customers = await stripe.customers.search({
            query: `email:"${userRow.email}" AND metadata["userId"]:"${userId}"`,
            limit: 5,
          });
          for (const cust of customers.data) {
            const subs = await stripe.subscriptions.list({ customer: cust.id, status: "active", limit: 5 });
            if (subs.data.length > 0) {
              const sub = subs.data[0];
              await stripe.subscriptions.cancel(sub.id);
              // Correct the stored IDs while we're here
              await db.update(usersTable).set({
                stripeCustomerId: cust.id,
                stripeSubscriptionId: sub.id,
              }).where(eq(usersTable.id, userId));
              cancelled = true;
              logger.info({ userId, customerId: cust.id, subId: sub.id }, "[account-deletion] Subscription cancelled via email fallback");
              break;
            }
          }
        } catch (fallbackErr) {
          logger.error({ err: fallbackErr, userId }, "[account-deletion] Email fallback also failed");
        }
      }

      if (!cancelled) {
        logger.error({ userId }, "[account-deletion] Stripe cancellation failed — blocking deletion");
        res.status(500).json({ error: "We couldn't cancel your subscription automatically. Please cancel it from your profile first, then delete your account. Contact support@theprivatestory.com if you need help." });
        return;
      }

      await db.update(usersTable).set({
        subscriptionStatus: "canceled",
        subscriptionCancelAt: new Date(),
      }).where(eq(usersTable.id, userId));
    }

    // Soft-delete the user row by setting deletedAt
    await db
      .update(usersTable)
      .set({ deletedAt: new Date() })
      .where(eq(usersTable.id, userId));

    // Clear all personal storage data (non-blocking — failures are logged but don't block response)
    // Hard purge of cascade-eligible data + anonymisation of the user row
    // happens via the daily runAccountPurge job (lib/accountPurge.ts) — currently
    // 30 days after deletedAt is set, well within the 90-day promise in the Privacy Policy.
    const cleanupTasks = [
      tasteStore.upsert(userId, { tasteProfile: {}, preferredIntensity: {}, preferredVoiceFeel: {}, preferredEndings: {}, preferredRelationshipDynamics: {}, streakDays: 0, lastActiveDate: null }),
    ];
    await Promise.allSettled(cleanupTasks);

    logger.info({ userId }, "[account-deletion] User account soft-deleted (GDPR Art.17)");
    res.json({ ok: true, message: "Your account has been scheduled for deletion. Your personal data will be removed as soon as reasonably practicable, and within 90 days at the latest. Billing and tax records are retained for 7 years as required by UK HMRC regulations." });
  } catch (err) {
    logger.error({ err, userId }, "[account-deletion] Failed to delete account");
    res.status(500).json({ error: "Failed to delete account. Please contact support@theprivatestory.com for assistance." });
  }
});

export default router;
