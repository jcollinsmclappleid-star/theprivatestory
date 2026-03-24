import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

// Current user endpoint — populated by authMiddleware
// Note: mounted at /api/me (not /api/auth/user, which better-auth owns)
router.get("/me", (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.json({ user: null });
    return;
  }
  res.json({ user: req.user });
});

export default router;
