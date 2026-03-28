import { Router } from "express";
import { db } from "@workspace/db";
import { nameSubmissions, usersTable } from "@workspace/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { validateNameFormat, isBlockedInput } from "../lib/contentBlocklist.js";
import { notifyAdmin } from "../lib/adminNotify.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

// Sub-router that enforces the full admin 2FA guard on every /admin/* name route.
// This mirrors the router.use(requireAdmin) pattern in admin.ts so the guard is
// applied consistently regardless of which router handles the request.
const adminRouter = Router();
adminRouter.use(requireAdmin);

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
  const user = req.user as { id?: string } | undefined;
  if (!user?.id) {
    return res.status(401).json({ error: "Sign in to request a name." });
  }

  const { name, nameType } = req.body ?? {};

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!nameType || !["listener", "partner"].includes(nameType)) {
    return res.status(400).json({ error: "nameType must be 'listener' or 'partner'." });
  }

  const trimmed = (name as string).trim();
  const type = nameType as "listener" | "partner";

  const nameFormatError = validateNameFormat(trimmed);
  if (nameFormatError) {
    return res.status(400).json({ error: nameFormatError });
  }
  if (trimmed.length > 15) {
    return res.status(400).json({ error: "Names must be 15 characters or fewer." });
  }

  if (!passesBlocklist(trimmed) || isBlockedInput(trimmed)) {
    return res.status(400).json({ error: "This name cannot be added." });
  }

  try {
    // One-pending-per-type: if user already has a pending submission of this nameType, reject
    const pendingForType = await db
      .select({ id: nameSubmissions.id })
      .from(nameSubmissions)
      .where(
        and(
          eq(nameSubmissions.submittedByUserId, user.id),
          eq(nameSubmissions.nameType, type),
          eq(nameSubmissions.status, "pending"),
        ),
      )
      .limit(1);

    if (pendingForType.length > 0) {
      return res.status(409).json({ error: "You already have a pending submission for this name type. Wait for it to be reviewed before submitting another." });
    }

    // Duplicate suppression: same user + same name + same type (any status) — silently accepted
    const existing = await db
      .select({ id: nameSubmissions.id })
      .from(nameSubmissions)
      .where(
        and(
          eq(nameSubmissions.submittedByUserId, user.id),
          eq(nameSubmissions.name, trimmed),
          eq(nameSubmissions.nameType, type),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return res.json({ ok: true, name: trimmed, status: "pending" });
    }

    if (!checkRateLimit(user.id)) {
      return res.status(429).json({
        error: "You can request up to 3 names per day. Please try again tomorrow.",
      });
    }

    await db.insert(nameSubmissions).values({
      name: trimmed,
      submittedByUserId: user.id,
      nameType: type,
      status: "pending",
    });

    return res.json({ ok: true, name: trimmed, status: "pending" });
  } catch (err) {
    console.error("Name submission error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});


// ---------------------------------------------------------------------------
// Admin routes — protected by requireAdmin (2FA session verification enforced)
// ---------------------------------------------------------------------------

// GET /admin/name-submissions — list PENDING submissions sorted by submitted_at
// (mounted at /api by app, so full path is /api/admin/name-submissions)
adminRouter.get("/name-submissions", async (req, res) => {
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
adminRouter.post("/name-submissions/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const { notes } = (req.body ?? {}) as { notes?: string };

  try {
    const [submission] = await db
      .select({ name: nameSubmissions.name, nameType: nameSubmissions.nameType, submittedByUserId: nameSubmissions.submittedByUserId })
      .from(nameSubmissions)
      .where(eq(nameSubmissions.id, id))
      .limit(1);
    if (!submission) return res.status(404).json({ error: "Submission not found." });

    await db
      .update(nameSubmissions)
      .set({ status: "approved", reviewedAt: new Date(), notes: notes ?? null })
      .where(eq(nameSubmissions.id, id));
    notifyAdmin("Name approved", {
      submissionId: id,
      name: submission.name,
      nameType: submission.nameType,
      userId: submission.submittedByUserId ?? "unknown",
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin approve name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// POST /admin/name-submissions/:id/reject — admin only
adminRouter.post("/name-submissions/:id/reject", async (req, res) => {
  const id = Number(req.params.id);
  const { notes } = (req.body ?? {}) as { notes?: string };

  try {
    const [submission] = await db
      .select({ name: nameSubmissions.name, nameType: nameSubmissions.nameType, submittedByUserId: nameSubmissions.submittedByUserId })
      .from(nameSubmissions)
      .where(eq(nameSubmissions.id, id))
      .limit(1);
    if (!submission) return res.status(404).json({ error: "Submission not found." });

    await db
      .update(nameSubmissions)
      .set({ status: "rejected", reviewedAt: new Date(), notes: notes ?? null })
      .where(eq(nameSubmissions.id, id));
    notifyAdmin("Name rejected", {
      submissionId: id,
      name: submission.name,
      nameType: submission.nameType,
      userId: submission.submittedByUserId ?? "unknown",
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin reject name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// PUT /admin/name-submissions/:id — approve or reject (single combined endpoint)
// On approval: writes the name to the submitting user's approvedListenerName or approvedPartnerName.
adminRouter.put("/name-submissions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = (req.body ?? {}) as { status?: string; notes?: string };

  if (!["approved", "rejected"].includes(status ?? "")) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
  }

  try {
    // Fetch the submission first so we know submittedByUserId and nameType
    const [submission] = await db
      .select({
        submittedByUserId: nameSubmissions.submittedByUserId,
        name: nameSubmissions.name,
        nameType: nameSubmissions.nameType,
      })
      .from(nameSubmissions)
      .where(eq(nameSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    await db
      .update(nameSubmissions)
      .set({ status: status as "approved" | "rejected", reviewedAt: new Date(), notes: notes ?? null })
      .where(eq(nameSubmissions.id, id));

    // On approval: write the name to the submitting user's profile field
    if (status === "approved" && submission.submittedByUserId) {
      const profileUpdate =
        submission.nameType === "partner"
          ? { approvedPartnerName: submission.name }
          : { approvedListenerName: submission.name };

      await db
        .update(usersTable)
        .set(profileUpdate)
        .where(eq(usersTable.id, submission.submittedByUserId));
    }

    notifyAdmin(`Name ${status}`, {
      submissionId: id,
      name: submission.name,
      nameType: submission.nameType,
      userId: submission.submittedByUserId ?? "unknown",
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Admin review name error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// Mount the admin sub-router under /admin so full paths become /api/admin/name-submissions/*
router.use("/admin", adminRouter);

export default router;
