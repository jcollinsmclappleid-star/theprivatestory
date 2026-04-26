import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

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
        isAdmin: usersTable.isAdmin,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    const sessionEmail = (req.user as { email?: string }).email ?? "";
    const isAdmin =
      row?.isAdmin === true ||
      (!!ADMIN_EMAIL && sessionEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    res.json({
      user: {
        ...req.user,
        subscriptionPlan: row?.subscriptionPlan ?? "free",
        subscriptionStatus: row?.subscriptionStatus ?? null,
        addonStoriesRemaining: row?.addonStoriesRemaining ?? 0,
        isAdmin,
      },
    });
  } catch {
    res.json({ user: req.user });
  }
});

export default router;
