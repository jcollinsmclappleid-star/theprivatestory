import { Router, type IRouter } from "express";
import { mockStories, mockSeries } from "./mockData.js";

const router: IRouter = Router();

router.get("/stories", (req, res) => {
  const { mood, search } = req.query as { mood?: string; search?: string };
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

router.get("/stories/:id", (req, res) => {
  const story = mockStories.find((s) => s.id === req.params.id);
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(story);
});

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
