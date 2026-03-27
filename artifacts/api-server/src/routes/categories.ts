import { Router } from "express";
import { STORY_CATEGORIES } from "../lib/storyCategories.js";

const router = Router();

router.get("/categories", (_req, res) => {
  const payload = STORY_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    mood: cat.mood,
    explicit_level: cat.explicit_level,
    subthemes: cat.subthemes.map((sub) => ({
      id: sub.id,
      name: sub.name,
      tags: sub.tags,
      intensity: sub.intensity,
      is_custom: sub.is_custom ?? false,
      custom_placeholder: sub.custom_placeholder ?? null,
    })),
  }));
  res.json(payload);
});

export default router;
