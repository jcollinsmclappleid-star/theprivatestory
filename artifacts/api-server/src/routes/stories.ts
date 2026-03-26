import { Router, type IRouter } from "express";
import { mockStories, mockSeries } from "./mockData.js";
import { storiesStore, seriesStore } from "../lib/storage.js";

const router: IRouter = Router();

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

router.get("/series", async (_req, res) => {
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
