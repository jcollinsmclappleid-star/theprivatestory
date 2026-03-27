import { Router } from "express";
import { db } from "@workspace/db";
import { nameSubmissions } from "@workspace/db/schema";
import { and, eq, desc } from "drizzle-orm";

const router = Router();

// Rate-limit tracking (in-memory, per-user). Max 3 submissions per 24 hours.
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

// Minimal blocklist — common offensive/slur terms that must not be added as character names.
const BLOCKLIST = new Set([
  "fuck", "shit", "cunt", "nigger", "nigga", "faggot", "fag", "bitch",
  "whore", "slut", "retard", "spastic", "kike", "chink", "spic", "wetback",
  "cracker", "coon", "dyke", "tranny",
]);

function passesBlocklist(name: string): boolean {
  return !BLOCKLIST.has(name.toLowerCase());
}

// POST /names/submit — authenticated users only
// (mounted at /api by app, so full path is /api/names/submit)
router.post("/names/submit", async (req, res) => {
  // TODO: tighten to active subscribers once payment model is defined
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

  if (!passesBlocklist(trimmed)) {
    return res.status(400).json({ error: "This name cannot be added." });
  }

  try {
    // Duplicate suppression: same user + same name (any status) — checked BEFORE rate limit
    // so duplicate requests are always silently accepted regardless of quota
    const existing = await db
      .select({ id: nameSubmissions.id })
      .from(nameSubmissions)
      .where(
        and(
          eq(nameSubmissions.submittedByUserId, user.id),
          eq(nameSubmissions.name, trimmed),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return res.json({ ok: true, name: trimmed });
    }

    if (!checkRateLimit(user.id)) {
      return res.status(429).json({
        error: "You can request up to 3 names per day. Please try again tomorrow.",
      });
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

// GET /admin/name-submissions — list PENDING submissions sorted by submitted_at (admin only)
// (mounted at /api by app, so full path is /api/admin/name-submissions)
router.get("/admin/name-submissions", async (req, res) => {
  const user = req.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const rows = await db
      .select()
      .from(nameSubmissions)
      .where(eq(nameSubmissions.status, "pending"))
      .orderBy(desc(nameSubmissions.submittedAt));
    return res.json({ submissions: rows });
  } catch (err) {
    console.error("Admin list names error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// POST /admin/name-submissions/:id/approve — admin only
router.post("/admin/name-submissions/:id/approve", async (req, res) => {
  const user = req.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = Number(req.params.id);
  const { notes } = (req.body ?? {}) as { notes?: string };

  try {
    await db
      .update(nameSubmissions)
      .set({ status: "approved", reviewedAt: new Date(), notes: notes ?? null })
      .where(eq(nameSubmissions.id, id));
    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin approve name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// POST /admin/name-submissions/:id/reject — admin only
router.post("/admin/name-submissions/:id/reject", async (req, res) => {
  const user = req.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = Number(req.params.id);
  const { notes } = (req.body ?? {}) as { notes?: string };

  try {
    await db
      .update(nameSubmissions)
      .set({ status: "rejected", reviewedAt: new Date(), notes: notes ?? null })
      .where(eq(nameSubmissions.id, id));
    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin reject name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// PUT /admin/name-submissions/:id — approve or reject (single combined endpoint)
router.put("/admin/name-submissions/:id", async (req, res) => {
  const user = req.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = Number(req.params.id);
  const { status, notes } = (req.body ?? {}) as { status?: string; notes?: string };

  if (!["approved", "rejected"].includes(status ?? "")) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
  }

  try {
    await db
      .update(nameSubmissions)
      .set({ status: status as "approved" | "rejected", reviewedAt: new Date(), notes: notes ?? null })
      .where(eq(nameSubmissions.id, id));
    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin review name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
