import { Router, type Request, type Response, type NextFunction } from "express";
import { presetsStore } from "../lib/storage.js";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// ---------------------------------------------------------------------------
// GET /api/presets/my-usual
// Returns the authenticated user's saved "My Usual" form preset, or 404.
// ---------------------------------------------------------------------------
router.get("/my-usual", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const preset = await presetsStore.getByName(userId, "my-usual");
    if (!preset) {
      return res.status(404).json({ error: "No preset found" });
    }
    res.json(preset);
  } catch {
    res.status(500).json({ error: "Failed to load preset" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/presets/my-usual
// Creates or overwrites the "My Usual" form preset for the authenticated user.
// Body: { castingData: Record<string, unknown> }
// ---------------------------------------------------------------------------
router.post("/my-usual", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { castingData } = req.body as { castingData?: Record<string, unknown> };

  if (!castingData || typeof castingData !== "object" || Array.isArray(castingData)) {
    return res.status(400).json({ error: "castingData must be an object" });
  }

  try {
    const preset = await presetsStore.upsertByName(userId, "my-usual", castingData);
    res.json(preset);
  } catch {
    res.status(500).json({ error: "Failed to save preset" });
  }
});

export default router;
