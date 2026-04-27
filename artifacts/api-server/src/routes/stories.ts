import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { mockStories, mockSeries } from "./mockData.js";
import { storiesStore, seriesStore } from "../lib/storage.js";

const router: IRouter = Router();

/**
 * Verify the requesting user has an active subscription (or is an admin).
 * Returns true if access is granted; false if the response has already been sent with 401/403.
 */
async function requireActiveSubscription(req: Request, res: Response): Promise<boolean> {
  if (!req.isAuthenticated?.()) {
    res.status(401).json({ error: "Sign in to access the collection.", code: "UNAUTHENTICATED" });
    return false;
  }
  const userId = (req.user as { id?: string })?.id;
  if (!userId) {
    res.status(401).json({ error: "Sign in to access the collection.", code: "UNAUTHENTICATED" });
    return false;
  }
  const [user] = await db.select({
    subscriptionStatus: usersTable.subscriptionStatus,
    subscriptionPlan: usersTable.subscriptionPlan,
    isAdmin: usersTable.isAdmin,
  }).from(usersTable).where(eq(usersTable.id, userId));

  if (user?.isAdmin) return true;
  const hasPaidPlan = user?.subscriptionPlan && user.subscriptionPlan !== "free";
  // Immersive is a one-time purchase with no ongoing subscription status — grant access unconditionally
  const hasPaidStatus = user?.subscriptionPlan === "immersive" || user?.subscriptionStatus === "active" || user?.subscriptionStatus === "canceling";
  if (!(hasPaidPlan && hasPaidStatus)) {
    res.status(403).json({ error: "A subscription is required to access the collection. Visit our pricing page to subscribe.", code: "SUBSCRIPTION_REQUIRED" });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Normalise a stored DB story into the public Story shape
// ---------------------------------------------------------------------------

function dbStoryToPublic(s: Record<string, unknown>) {
  const images = (s.images ?? {}) as Record<string, unknown>;
  const coverImage =
    (images.cover as string) ||
    (images.coverImage as string) ||
    "";

  const tags =
    (s.recommendation_tags as string[] | undefined) ??
    (s.tags as string[] | undefined) ??
    [];

  return {
    id: s.id as string,
    title: (s.title as string) || "Untitled",
    description: (s.description as string) || "",
    mood: (s.mood as string) || "",
    tags,
    duration: (s.duration as string) || "15-25 min",
    coverImage,
    audioUrl: (s.audioUrl as string) || undefined,
    isPremium: false,
    isNew: true,
    categoryId: s.categoryId,
    subthemeId: s.subthemeId,
  };
}

// ---------------------------------------------------------------------------
// GET /stories — published library stories, falling back to mock data
// ---------------------------------------------------------------------------

router.get("/stories", async (req, res) => {
  if (!await requireActiveSubscription(req, res)) return;

  const { mood, search, category } = req.query as {
    mood?: string;
    search?: string;
    category?: string;
  };

  try {
    const libraryStories = await storiesStore.getLibraryStories("published");

    if (libraryStories.length > 0) {
      let results = libraryStories.map(dbStoryToPublic);

      if (mood && mood !== "All") {
        results = results.filter(
          (s) => s.mood.toLowerCase() === mood.toLowerCase()
        );
      }
      if (category) {
        results = results.filter(
          (s) => (s.categoryId as string | undefined) === category
        );
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      res.json(results);
      return;
    }
  } catch {
    // DB error — fall through to mock data
  }

  // ── Fallback: mock data ───────────────────────────────────────────────────
  let stories = [...mockStories];
  if (mood && mood !== "All") {
    stories = stories.filter(
      (s) => s.mood.toLowerCase() === mood.toLowerCase()
    );
  }
  if (search) {
    const q = search.toLowerCase();
    stories = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  res.json(stories);
});

// ---------------------------------------------------------------------------
// GET /stories/:id — check DB first, then mock data
// ---------------------------------------------------------------------------

router.get("/stories/:id", async (req, res) => {
  if (!await requireActiveSubscription(req, res)) return;

  try {
    const dbStory = await storiesStore.get(req.params.id);
    if (dbStory) {
      res.json(dbStory);
      return;
    }
  } catch {
    // fall through
  }

  const story = mockStories.find((s) => s.id === req.params.id);
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(story);
});

// ---------------------------------------------------------------------------
// Series routes — DB-backed with mock fallback
// ---------------------------------------------------------------------------

router.get("/series", async (req, res) => {
  if (!await requireActiveSubscription(req, res)) return;

  try {
    const dbSeries = await seriesStore.getAll();
    const published = dbSeries.filter((s) => s.status === "published");
    if (published.length > 0) {
      res.json(published.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        mood: s.mood,
        coverImage: s.coverImage,
        episodeCount: s.episodeCount,
        tags: (s.tags as string[]) ?? [],
      })));
      return;
    }
  } catch {
    // fall through to mock
  }
  res.json(mockSeries);
});

router.get("/series/:id", async (req, res) => {
  if (!await requireActiveSubscription(req, res)) return;

  try {
    const dbSeries = await seriesStore.get(req.params.id);
    if (dbSeries) {
      const episodes = await seriesStore.getEpisodes(req.params.id);
      res.json({
        id: dbSeries.id,
        title: dbSeries.title,
        description: dbSeries.description,
        mood: dbSeries.mood,
        coverImage: dbSeries.coverImage,
        episodeCount: dbSeries.episodeCount,
        tags: (dbSeries.tags as string[]) ?? [],
        episodes: episodes.map((ep) => ({
          id: ep.id as string,
          episodeNumber: ep.seriesEpisode as number,
          title: ep.title as string,
          description: ep.description as string,
          duration: ep.duration as string,
          coverImage: (ep.images as Record<string, unknown>)?.cover ?? "",
          isLocked: false,
        })),
      });
      return;
    }
  } catch {
    // fall through
  }
  const series = mockSeries.find((s) => s.id === req.params.id);
  if (!series) {
    res.status(404).json({ error: "Series not found" });
    return;
  }
  res.json(series);
});

export default router;
