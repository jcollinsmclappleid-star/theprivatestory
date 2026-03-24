import { Router, type IRouter } from "express";
import { mockStories, mockSeries } from "./mockData.js";
import { storiesStore } from "../lib/storage.js";

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
// Series routes (still mock for now)
// ---------------------------------------------------------------------------

router.get("/series", (_req, res) => {
  res.json(mockSeries);
});

router.get("/series/:id", (req, res) => {
  const series = mockSeries.find((s) => s.id === req.params.id);
  if (!series) {
    res.status(404).json({ error: "Series not found" });
    return;
  }
  res.json(series);
});

export default router;
