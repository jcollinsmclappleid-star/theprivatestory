import { Router, type Request, type Response } from "express";
import { tasteStore } from "../lib/storage.js";

const router = Router();

function getUserId(req: Request, res: Response): string | null {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return req.user.id;
}

router.get("/taste", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  try {
    const taste = await tasteStore.get(userId);
    res.json({
      tasteProfile: taste.tasteProfile,
      streakDays: taste.streakDays,
      lastActiveDate: taste.lastActiveDate,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load taste profile" });
  }
});

router.post("/taste", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { reactionTags, incrementStreak } = req.body as {
    reactionTags?: string[];
    incrementStreak?: boolean;
  };

  try {
    if (reactionTags && reactionTags.length > 0) {
      await tasteStore.mergeReaction(userId, reactionTags);
    }
    if (incrementStreak) {
      const { streakDays } = await tasteStore.incrementStreak(userId);
      res.json({ ok: true, streakDays });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update taste profile" });
  }
});

export default router;
