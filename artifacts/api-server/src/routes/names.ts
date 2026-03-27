import { Router } from "express";
import { db } from "@workspace/db";
import { nameSubmissions } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Rate-limit tracking (in-memory, per-user). Max 3 per day.
const submissionCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = submissionCounts.get(userId);
  if (!entry || entry.resetAt < now) {
    submissionCounts.set(userId, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

// POST /api/names/submit — authenticated users only
router.post("/api/names/submit", async (req, res) => {
  const user = req.user as { id?: string } | undefined;
  if (!user?.id) {
    return res.status(401).json({ error: "Sign in to request a name." });
  }

  const { name } = req.body ?? {};

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name is required." });
  }

  const trimmed = (name as string).trim();

  if (!/^[A-Za-z]{2,20}$/.test(trimmed)) {
    return res.status(400).json({
      error: "Names must be 2–20 letters only, no spaces or special characters.",
    });
  }

  if (!checkRateLimit(user.id)) {
    return res.status(429).json({
      error: "You can request up to 3 names per day. Please try again tomorrow.",
    });
  }

  try {
    // Check for duplicate (any status) — silently accept per spec
    const existing = await db
      .select({ id: nameSubmissions.id })
      .from(nameSubmissions)
      .where(eq(nameSubmissions.name, trimmed))
      .limit(1);

    if (existing.length > 0) {
      return res.json({ ok: true, name: trimmed });
    }

    await db.insert(nameSubmissions).values({
      name: trimmed,
      submittedByUserId: user.id,
      status: "pending",
    });

    return res.json({ ok: true, name: trimmed });
  } catch (err) {
    console.error("Name submission error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

// GET /api/admin/name-submissions — list all submissions (admin only)
router.get("/api/admin/name-submissions", async (req, res) => {
  const user = req.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const rows = await db
      .select()
      .from(nameSubmissions)
      .orderBy(desc(nameSubmissions.createdAt));
    return res.json({ submissions: rows });
  } catch (err) {
    console.error("Admin list names error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// PUT /api/admin/name-submissions/:id — approve or reject (admin only)
router.put("/api/admin/name-submissions/:id", async (req, res) => {
  const user = req.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = Number(req.params.id);
  const { status } = (req.body ?? {}) as { status?: string };

  if (!["approved", "rejected"].includes(status ?? "")) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
  }

  try {
    await db
      .update(nameSubmissions)
      .set({ status: status!, reviewedAt: new Date() })
      .where(eq(nameSubmissions.id, id));

    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin review name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
