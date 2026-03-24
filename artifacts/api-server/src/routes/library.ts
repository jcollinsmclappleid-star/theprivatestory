import { Router, type Request, type Response } from "express";
import { usersStore, progressStore, storiesStore } from "../lib/storage.js";

const router = Router();

function getUserId(req: Request, res: Response): string | null {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return req.user.id;
}

// ---------------------------------------------------------------------------
// Editorial fallback stories for when taste profile is empty
// ---------------------------------------------------------------------------
const EDITORIAL_PICKS = ["story-1", "story-2", "story-3", "story-4", "story-5"];

// ---------------------------------------------------------------------------
// POST /save-story
// ---------------------------------------------------------------------------
router.post("/save-story", (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  const profile = usersStore.get(userId);
  if (!profile.savedStories.includes(storyId)) {
    profile.savedStories = [storyId, ...profile.savedStories];
    usersStore.set(userId, profile);
  }
  res.json({ saved: true });
});

// ---------------------------------------------------------------------------
// DELETE /save-story
// ---------------------------------------------------------------------------
router.delete("/save-story", (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  const profile = usersStore.get(userId);
  profile.savedStories = profile.savedStories.filter((id) => id !== storyId);
  usersStore.set(userId, profile);
  res.json({ saved: false });
});

// ---------------------------------------------------------------------------
// POST /update-progress
// ---------------------------------------------------------------------------
router.post("/update-progress", (req, res) => {
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

  progressStore.set(userId, storyId, {
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
router.get("/library", (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const profile = usersStore.get(userId);
  const allStories = storiesStore.getAll();

  const saved = profile.savedStories
    .map((id) => allStories[id])
    .filter(Boolean);

  const allGenerated = profile.generatedStories
    .map((id) => allStories[id])
    .filter(Boolean) as Array<Record<string, unknown>>;

  // Split: variations have variant_type, continuations have parent_story_id but no variant_type
  const generated = allGenerated.filter((s) => !s.variant_type);
  const variations = allGenerated.filter((s) => Boolean(s.variant_type));

  // Continued stories (parent_story_id set, no variant_type) show in Generated with "Continued" badge
  res.json({ saved, generated, variations });
});

// ---------------------------------------------------------------------------
// GET /progress — fetch stored position for a single story
// ---------------------------------------------------------------------------
router.get("/progress", (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.query as { storyId?: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }
  const entry = progressStore.get(userId, storyId);
  res.json(entry ?? null);
});

// ---------------------------------------------------------------------------
// DELETE /progress — mark story complete by removing its progress entry
// ---------------------------------------------------------------------------
router.delete("/progress", (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { storyId } = req.body as { storyId: string };
  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }
  progressStore.delete(userId, storyId);
  res.json({ deleted: true });
});

// ---------------------------------------------------------------------------
// GET /continue-listening
// ---------------------------------------------------------------------------
router.get("/continue-listening", (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const userProgress = progressStore.getUserProgress(userId);
  const allStories = storiesStore.getAll();

  // Only include stories with meaningful progress (> 5 seconds in)
  const inProgress = Object.values(userProgress)
    .filter((entry) => entry.audioProgressSeconds > 5)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((entry) => {
      const story = allStories[entry.storyId];
      if (!story) return null;
      return { ...story, progress: entry };
    })
    .filter(Boolean);

  res.json(inProgress);
});

// ---------------------------------------------------------------------------
// POST /update-taste
// ---------------------------------------------------------------------------
router.post("/update-taste", (req, res) => {
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
  const profile = usersStore.get(userId);

  if (mood) {
    profile.tasteProfile[mood] = (profile.tasteProfile[mood] ?? 0) + weight;
  }
  if (intensity) {
    profile.preferredIntensity[intensity] = (profile.preferredIntensity[intensity] ?? 0) + weight;
  }
  if (voiceFeel) {
    profile.preferredVoiceFeel[voiceFeel] = (profile.preferredVoiceFeel[voiceFeel] ?? 0) + weight;
  }
  if (endingType) {
    profile.preferredEndings[endingType] = (profile.preferredEndings[endingType] ?? 0) + weight;
  }
  if (relationshipDynamic) {
    if (!profile.preferredRelationshipDynamics) profile.preferredRelationshipDynamics = {};
    profile.preferredRelationshipDynamics[relationshipDynamic] = (profile.preferredRelationshipDynamics[relationshipDynamic] ?? 0) + weight;
  }

  usersStore.set(userId, profile);
  res.json({ updated: true });
});

// ---------------------------------------------------------------------------
// POST /update-taste/generated — called from generate-full-story route
// ---------------------------------------------------------------------------
export function trackGeneratedStory(userId: string, storyId: string, mood: string, intensity: string, voiceFeel: string): void {
  if (!userId) return;
  const profile = usersStore.get(userId);

  if (!profile.generatedStories.includes(storyId)) {
    profile.generatedStories = [storyId, ...profile.generatedStories];
  }
  profile.tasteProfile[mood] = (profile.tasteProfile[mood] ?? 0) + 1;
  profile.preferredIntensity[intensity] = (profile.preferredIntensity[intensity] ?? 0) + 1;
  profile.preferredVoiceFeel[voiceFeel] = (profile.preferredVoiceFeel[voiceFeel] ?? 0) + 1;

  usersStore.set(userId, profile);
}

// ---------------------------------------------------------------------------
// GET /recommendations/:userId
// ---------------------------------------------------------------------------
router.get("/recommendations/:userId", (req, res) => {
  const { userId } = req.params;
  const profile = usersStore.get(userId);
  const allStories = storiesStore.getAll();
  const storyList = Object.values(allStories);

  const hasProfile = Object.keys(profile.tasteProfile).length > 0;

  // Top mood by score
  const sortedMoods = Object.entries(profile.tasteProfile).sort(([, a], [, b]) => b - a);
  const topMood = sortedMoods[0]?.[0];

  // Recent mood from progress
  const userProgress = progressStore.getUserProgress(userId);
  const mostRecent = Object.values(userProgress).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
  const recentMood = mostRecent
    ? (allStories[mostRecent.storyId]?.mood as string | undefined)
    : undefined;

  const matchMood = (mood: string) =>
    storyList.filter((s) => (s as Record<string, unknown>).mood === mood).slice(0, 8);

  const editorialFallback = EDITORIAL_PICKS
    .map((id) => allStories[id])
    .filter(Boolean);

  const forYou = hasProfile && topMood ? matchMood(topMood) : editorialFallback;
  const becauseYouLiked = hasProfile && topMood ? matchMood(topMood).slice(0, 6) : [];
  const continueTheMood = recentMood ? matchMood(recentMood).slice(0, 6) : (hasProfile ? forYou.slice(0, 4) : []);

  res.json({
    for_you: forYou,
    because_you_liked: becauseYouLiked,
    because_you_liked_mood: topMood ?? null,
    continue_the_mood: continueTheMood,
    has_taste_profile: hasProfile,
  });
});

export default router;
