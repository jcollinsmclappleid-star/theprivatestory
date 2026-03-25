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

router.post("/taste", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

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

    if (incrementStreak) {
      const today = new Date().toISOString().slice(0, 10);
      if (!current.lastActiveDate) {
        current.streakDays = 1;
        current.lastActiveDate = today;
      } else if (current.lastActiveDate !== today) {
        const last = new Date(current.lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);
        current.streakDays = diffDays === 1 ? current.streakDays + 1 : 1;
        current.lastActiveDate = today;
      }
    }

    await tasteStore.upsert(userId, current);

    res.json({ ok: true, streakDays: current.streakDays });
  } catch {
    res.status(500).json({ error: "Failed to update taste profile" });
  }
});

export default router;
