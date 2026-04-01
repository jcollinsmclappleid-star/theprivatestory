import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Current user endpoint — populated by authMiddleware
// Note: mounted at /api/me (not /api/auth/user, which better-auth owns)
router.get("/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    res.json({ user: null });
    return;
  }
  try {
    const userId = (req.user as { id: string }).id;
    const [row] = await db
      .select({
        subscriptionPlan: usersTable.subscriptionPlan,
        subscriptionStatus: usersTable.subscriptionStatus,
        addonStoriesRemaining: usersTable.addonStoriesRemaining,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    res.json({
      user: {
        ...req.user,
        subscriptionPlan: row?.subscriptionPlan ?? "free",
        subscriptionStatus: row?.subscriptionStatus ?? null,
        addonStoriesRemaining: row?.addonStoriesRemaining ?? 0,
      },
    });
  } catch {
    res.json({ user: req.user });
  }
});

export default router;
