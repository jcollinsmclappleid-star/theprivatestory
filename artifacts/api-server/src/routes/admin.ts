import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger.js";
import { db } from "@workspace/db";
import { generatedStories, contentBlocks, csamReports, userReports, usersTable, adminAuditLog, storyReports, moderationEvents } from "@workspace/db/schema";
import { eq, and, sql, isNull, isNotNull, desc, or, ilike } from "drizzle-orm";
import { writeAuditLog } from "../lib/auditLog.js";
import { notifyAdmin, alertModerationEvent } from "../lib/adminNotify.js";
import { isAdmin, requireAdmin, requireAdminIdentity } from "../middlewares/requireAdmin.js";
import { generateAudioFile } from "./generate.js";

const router: IRouter = Router();

// Re-export requireAdmin so any code that imports it from this module continues to work.
export { requireAdmin } from "../middlewares/requireAdmin.js";

// ---------------------------------------------------------------------------
// 2FA setup/status routes — exempt from the 2FA gate (requireAdminIdentity only).
// These must be registered BEFORE router.use(requireAdmin) to avoid the
// chicken-and-egg deadlock where a first-time admin can't set up 2FA because
// 2FA isn't set up yet.
//
// They still require admin identity (isAdmin DB flag or ADMIN_EMAIL match)
// and reject expired sessions; they simply don't enforce twoFactorVerifiedAt.
// ---------------------------------------------------------------------------

/**
 * GET /admin/2fa/status
 * Returns the 2FA enrollment state and whether this session was verified via TOTP.
 * Frontend uses this to show setup prompts or session re-authentication prompts.
 *
 * Setup flow (via existing better-auth endpoints):
 *   1. POST /api/auth/two-factor/enable  { password }  → { totpURI, backupCodes }
 *   2. Admin scans QR code with authenticator app (generated client-side — secret never sent externally)
 *   3. POST /api/auth/two-factor/verify-totp  { code }  → confirms enrollment
 *   4. On next login, TOTP is required before admin routes are accessible.
 */
router.get("/2fa/status", requireAdminIdentity, (req, res) => {
  const user = req.user as {
    twoFactorEnabled?: boolean;
    twoFactorVerifiedAt?: Date | null;
  } | undefined;
  res.json({
    twoFactorEnabled: user?.twoFactorEnabled ?? false,
    twoFactorVerifiedThisSession: !!(user?.twoFactorVerifiedAt),
    setupEndpoint: "/api/auth/two-factor/enable",
    verifyEndpoint: "/api/auth/two-factor/verify-totp",
  });
});

// Apply full admin 2FA enforcement to every subsequent route on this router
router.use(requireAdmin);

// ---------------------------------------------------------------------------
// CSAM / Content Moderation Routes
// ---------------------------------------------------------------------------

/** Returns user-submitted safety reports from the dedicated user_reports table. */
async function getUserReports() {
  return db
    .select()
    .from(userReports)
    .orderBy(desc(userReports.createdAt))
    .limit(200);
}

/** /api/admin/reports — canonical user-submitted reports endpoint. */
router.get("/reports", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    res.json(await getUserReports());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ---------------------------------------------------------------------------
// Shared moderation handler functions (used by both canonical + alias routes)
// ---------------------------------------------------------------------------

async function handleGetFlaggedContent(req: any, res: any) {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    const rows = await db
      .select()
      .from(contentBlocks)
      .where(isNull(contentBlocks.deletedAt))
      .orderBy(desc(contentBlocks.createdAt))
      .limit(200);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch flagged content" });
  }
}

async function handlePostCsamReport(req: any, res: any) {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { contentBlockId, reportedTo, notes } = req.body as {
    contentBlockId: string;
    reportedTo: "ncmec" | "iwf" | "other";
    notes?: string;
  };
  if (!contentBlockId || !reportedTo) {
    res.status(400).json({ error: "contentBlockId and reportedTo are required" });
    return;
  }
  const adminUser = req.user as { id?: string; email?: string } | undefined;
  const adminUserId = adminUser?.id ?? adminUser?.email ?? "unknown";
  try {
    const [inserted] = await db
      .insert(csamReports)
      .values({ contentBlockId: String(contentBlockId), reportedTo, adminUserId, notes: notes ?? null })
      .returning();
    notifyAdmin("CSAM report filed", { contentBlockId, reportedTo, adminUserId });
    res.json({ ok: true, report: inserted });
  } catch {
    res.status(500).json({ error: "Failed to create CSAM report" });
  }
}

/** Returns recent flagged content events (content_blocks) for admin review. */
router.get("/moderation/flagged", handleGetFlaggedContent);

/** Returns CSAM reports that have been filed. */
router.get("/moderation/csam-reports", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(csamReports)
      .orderBy(desc(csamReports.reportedAt))
      .limit(200);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch CSAM reports" });
  }
});

/** Creates a CSAM report entry — records that an admin has manually reported
 *  a flagged content event to NCMEC or IWF. */
router.post("/moderation/csam-report", handlePostCsamReport);

// ---------------------------------------------------------------------------
// Route aliases — shared handlers with canonical /moderation/* routes above
// ---------------------------------------------------------------------------
router.get("/flagged-content", handleGetFlaggedContent);
router.post("/csam-report", handlePostCsamReport);

// ---------------------------------------------------------------------------
// User risk-score management (manual admin override)
// ---------------------------------------------------------------------------

/**
 * PATCH /admin/users/:userId/risk
 * Manually set a user's risk score and optionally append a note to riskFlags.
 * Fires an admin notification so the action is auditable outside the DB.
 */
router.patch("/users/:userId/risk", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { userId } = req.params;
  const { score, reason } = req.body as { score?: unknown; reason?: unknown };
  const newScore = Number(score);
  if (!Number.isInteger(newScore) || newScore < 0 || newScore > 100) {
    res.status(400).json({ error: "score must be an integer 0–100" });
    return;
  }
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ riskScore: newScore })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id, riskScore: usersTable.riskScore });
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const adminUser = req.user as { id?: string; email?: string } | undefined;
    writeAuditLog(adminUser?.id, adminUser?.email, "risk_score_change", "user", userId, {
      newScore,
      reason: String(reason ?? ""),
    });
    notifyAdmin("User risk score updated", {
      targetUserId: userId,
      newScore,
      reason: String(reason ?? ""),
      adminId: adminUser?.id ?? adminUser?.email ?? "unknown",
    });
    res.json({ ok: true, userId, riskScore: newScore });
  } catch {
    res.status(500).json({ error: "Failed to update risk score" });
  }
});

// ---------------------------------------------------------------------------
// Content-block disposition (dismiss / escalate a flagged content entry)
// ---------------------------------------------------------------------------

/**
 * DELETE /admin/moderation/flagged/:id
 * Soft-deletes a content_blocks entry (sets deletedAt), recording that an
 * admin reviewed and dismissed it. Fires an admin notification for the audit log.
 */
router.delete("/moderation/flagged/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const rawId = req.params.id;
  const blockId = Number(rawId);
  if (!Number.isInteger(blockId) || blockId <= 0) {
    res.status(400).json({ error: "Invalid content block id" });
    return;
  }
  const { reason } = req.body as { reason?: unknown };
  try {
    const [disposed] = await db
      .update(contentBlocks)
      .set({ deletedAt: new Date() })
      .where(and(eq(contentBlocks.id, blockId), isNull(contentBlocks.deletedAt)))
      .returning({ id: contentBlocks.id });
    if (!disposed) {
      res.status(404).json({ error: "Content block not found or already disposed" });
      return;
    }
    const adminUser = req.user as { id?: string; email?: string } | undefined;
    writeAuditLog(adminUser?.id, adminUser?.email, "content_block_dispositioned", "content_block", String(blockId), {
      disposition: "dismissed",
      reason: String(reason ?? ""),
    });
    notifyAdmin("Content block disposed", {
      contentBlockId: blockId,
      disposition: "dismissed",
      reason: String(reason ?? ""),
      adminId: adminUser?.id ?? adminUser?.email ?? "unknown",
    });
    res.json({ ok: true, id: blockId, disposed: true });
  } catch {
    res.status(500).json({ error: "Failed to dispose content block" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/audit-log — last 200 admin audit log entries, newest first
// ---------------------------------------------------------------------------

/**
 * Returns the last 200 rows of admin_audit_log for display in the Admin UI.
 * The table is append-only; rows are never deleted.
 * Access is gate-kept by requireAdmin (includes 2FA session check).
 */
router.get("/audit-log", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(adminAuditLog)
      .orderBy(desc(adminAuditLog.createdAt))
      .limit(200);
    res.json({ entries: rows });
  } catch {
    res.status(500).json({ error: "Failed to load audit log" });
  }
});

// ===========================================================================
// MODERATION SYSTEM — Story Reports + Moderation Events + User Bans
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /admin/story-reports — list all user-submitted story reports
// ---------------------------------------------------------------------------
router.get("/story-reports", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    const { status, limit = "100", offset = "0" } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: storyReports.id,
        userId: storyReports.userId,
        userCode: usersTable.userCode,
        storyId: storyReports.storyId,
        storyTitle: storyReports.storyTitle,
        reason: storyReports.reason,
        reasonCategory: storyReports.reasonCategory,
        note: storyReports.note,
        inputSnapshot: storyReports.inputSnapshot,
        outputExcerpt: storyReports.outputExcerpt,
        status: storyReports.status,
        adminNotes: storyReports.adminNotes,
        actionTaken: storyReports.actionTaken,
        reviewedBy: storyReports.reviewedBy,
        reviewedAt: storyReports.reviewedAt,
        auditFlagged: storyReports.auditFlagged,
        auditFlaggedAt: storyReports.auditFlaggedAt,
        auditNote: storyReports.auditNote,
        createdAt: storyReports.createdAt,
        updatedAt: storyReports.updatedAt,
      })
      .from(storyReports)
      .leftJoin(usersTable, eq(storyReports.userId, usersTable.id))
      .where(status ? eq(storyReports.status, status) : undefined)
      .orderBy(desc(storyReports.createdAt))
      .limit(Math.min(parseInt(limit, 10) || 100, 500))
      .offset(parseInt(offset, 10) || 0);
    res.json({ reports: rows, count: rows.length });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to fetch story reports");
    res.status(500).json({ error: "Failed to fetch story reports" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/story-reports/:id — single report with full detail
// ---------------------------------------------------------------------------
router.get("/story-reports/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [report] = await db
      .select()
      .from(storyReports)
      .where(eq(storyReports.id, id))
      .limit(1);
    if (!report) { res.status(404).json({ error: "Not found" }); return; }

    // Fetch linked moderation events
    const events = report.storyId
      ? await db
          .select()
          .from(moderationEvents)
          .where(eq(moderationEvents.storyId, report.storyId))
          .orderBy(desc(moderationEvents.createdAt))
          .limit(20)
      : [];

    res.json({ report, events });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to fetch story report");
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /admin/story-reports/:id — update status / admin notes / action taken
// ---------------------------------------------------------------------------
const VALID_STATUSES = ["pending", "reviewed", "action_taken", "closed"] as const;
const VALID_ACTIONS = [
  "No issue found",
  "Story removed",
  "Story regenerated",
  "User warned",
  "User restricted",
  "Closed with no further action",
] as const;

router.patch("/story-reports/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, adminNotes, actionTaken } = req.body as {
    status?: string;
    adminNotes?: string;
    actionTaken?: string;
  };

  if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    res.status(400).json({ error: "Invalid status", allowed: VALID_STATUSES });
    return;
  }
  if (actionTaken && !VALID_ACTIONS.includes(actionTaken as (typeof VALID_ACTIONS)[number])) {
    res.status(400).json({ error: "Invalid action", allowed: VALID_ACTIONS });
    return;
  }

  try {
    const adminUser = req.user as { id?: string; email?: string } | undefined;
    const updates: Partial<typeof storyReports.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes.slice(0, 2000);
    if (actionTaken) updates.actionTaken = actionTaken;
    if (status && status !== "pending") {
      updates.reviewedBy = adminUser?.email ?? adminUser?.id ?? "admin";
      updates.reviewedAt = new Date();
    }

    const [updated] = await db
      .update(storyReports)
      .set(updates)
      .where(eq(storyReports.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ok: true, report: updated });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to update story report");
    res.status(500).json({ error: "Failed to update report" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/story-reports/:id/add-to-audit — flag a report for the audit folder
// ---------------------------------------------------------------------------
router.post("/story-reports/:id/add-to-audit", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { note = "" } = req.body as { note?: string };
  try {
    const adminUser = req.user as { id?: string; email?: string } | undefined;
    const [updated] = await db
      .update(storyReports)
      .set({ auditFlagged: true, auditFlaggedAt: new Date(), auditNote: note.trim().slice(0, 1000) || null, updatedAt: new Date() })
      .where(eq(storyReports.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    writeAuditLog(adminUser?.id, adminUser?.email, "moderation_reviewed", "story_report", id.toString(), { note: note.trim() || null });
    res.json({ ok: true, report: updated });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to flag story report for audit");
    res.status(500).json({ error: "Failed to flag for audit" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/moderation-events — filterable log of auto-moderation events
// ---------------------------------------------------------------------------
router.get("/moderation-events", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    const {
      severity,
      eventType,
      userId,
      storyId,
      limit = "100",
      offset = "0",
    } = req.query as Record<string, string>;

    const filters = [];
    if (severity) filters.push(eq(moderationEvents.severity, severity));
    if (eventType) filters.push(eq(moderationEvents.eventType, eventType));
    if (userId) filters.push(eq(moderationEvents.userId, userId));
    if (storyId) filters.push(eq(moderationEvents.storyId, storyId));

    const rows = await db
      .select({
        id: moderationEvents.id,
        userId: moderationEvents.userId,
        userCode: usersTable.userCode,
        storyId: moderationEvents.storyId,
        requestId: moderationEvents.requestId,
        eventType: moderationEvents.eventType,
        severity: moderationEvents.severity,
        reason: moderationEvents.reason,
        flagsJson: moderationEvents.flagsJson,
        inputSnapshotJson: moderationEvents.inputSnapshotJson,
        outputExcerpt: moderationEvents.outputExcerpt,
        actionTaken: moderationEvents.actionTaken,
        emailSent: moderationEvents.emailSent,
        linkedReportId: moderationEvents.linkedReportId,
        auditFlagged: moderationEvents.auditFlagged,
        auditFlaggedAt: moderationEvents.auditFlaggedAt,
        auditNote: moderationEvents.auditNote,
        adminNotes: moderationEvents.adminNotes,
        createdAt: moderationEvents.createdAt,
      })
      .from(moderationEvents)
      .leftJoin(usersTable, eq(moderationEvents.userId, usersTable.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(moderationEvents.createdAt))
      .limit(Math.min(parseInt(limit, 10) || 100, 500))
      .offset(parseInt(offset, 10) || 0);

    res.json({ events: rows, count: rows.length });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to fetch moderation events");
    res.status(500).json({ error: "Failed to fetch moderation events" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/moderation-events/:id — single moderation event with full detail
// ---------------------------------------------------------------------------
router.get("/moderation-events/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [event] = await db
      .select()
      .from(moderationEvents)
      .where(eq(moderationEvents.id, id))
      .limit(1);
    if (!event) { res.status(404).json({ error: "Not found" }); return; }

    // Fetch linked story report if any
    const linkedReport = event.linkedReportId
      ? await db
          .select()
          .from(storyReports)
          .where(eq(storyReports.id, event.linkedReportId))
          .limit(1)
      : [];

    res.json({ event, linkedReport: linkedReport[0] ?? null });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to fetch moderation event");
    res.status(500).json({ error: "Failed to fetch moderation event" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/moderation-events/:id/add-to-audit — flag an event for the audit folder
// ---------------------------------------------------------------------------
router.post("/moderation-events/:id/add-to-audit", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { note = "" } = req.body as { note?: string };
  try {
    const adminUser = req.user as { id?: string; email?: string } | undefined;
    const [updated] = await db
      .update(moderationEvents)
      .set({ auditFlagged: true, auditFlaggedAt: new Date(), auditNote: note.trim().slice(0, 1000) || null })
      .where(eq(moderationEvents.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    writeAuditLog(adminUser?.id, adminUser?.email, "moderation_reviewed", "moderation_event", id.toString(), { note: note.trim() || null });
    res.json({ ok: true, event: updated });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to flag moderation event for audit");
    res.status(500).json({ error: "Failed to flag for audit" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /admin/moderation-events/:id — save admin notes on an auto-moderation event
// ---------------------------------------------------------------------------
router.patch("/moderation-events/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { adminNotes } = req.body as { adminNotes?: string };
  try {
    const [updated] = await db
      .update(moderationEvents)
      .set({ adminNotes: (adminNotes ?? "").slice(0, 2000) })
      .where(eq(moderationEvents.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ok: true, event: updated });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to update moderation event");
    res.status(500).json({ error: "Failed to update" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/users/:userId/moderation-profile — user risk / block summary
// ---------------------------------------------------------------------------
router.get("/users/:userId/moderation-profile", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { userId } = req.params;
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        isBanned: usersTable.isBanned,
        bannedAt: usersTable.bannedAt,
        bannedReason: usersTable.bannedReason,
        blockedGenerationCount: usersTable.blockedGenerationCount,
        riskScore: usersTable.riskScore,
        createdAt: usersTable.createdAt,
        deletedAt: usersTable.deletedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const reports = await db
      .select({ id: storyReports.id, reasonCategory: storyReports.reasonCategory, status: storyReports.status, createdAt: storyReports.createdAt })
      .from(storyReports)
      .where(eq(storyReports.userId, userId))
      .orderBy(desc(storyReports.createdAt))
      .limit(20);

    const recentEvents = await db
      .select({ id: moderationEvents.id, eventType: moderationEvents.eventType, severity: moderationEvents.severity, reason: moderationEvents.reason, createdAt: moderationEvents.createdAt })
      .from(moderationEvents)
      .where(eq(moderationEvents.userId, userId))
      .orderBy(desc(moderationEvents.createdAt))
      .limit(20);

    res.json({ user, reports, recentEvents });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to fetch user moderation profile");
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/users/:userId/ban — ban a user (remove access)
// ---------------------------------------------------------------------------
router.post("/users/:userId/ban", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { userId } = req.params;
  const { reason } = req.body as { reason?: string };

  if (!reason?.trim()) {
    res.status(400).json({ error: "A reason is required to ban a user." });
    return;
  }

  const adminUser = req.user as { id?: string; email?: string } | undefined;

  try {
    const [updated] = await db
      .update(usersTable)
      .set({
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason.trim().slice(0, 500),
        bannedByAdminId: adminUser?.id ?? adminUser?.email ?? "admin",
      })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id, email: usersTable.email });

    if (!updated) { res.status(404).json({ error: "User not found" }); return; }

    writeAuditLog(adminUser?.id, adminUser?.email, "risk_score_change", "user", userId, {
      action: "ban",
      reason: reason.trim(),
    });

    logger.warn({ userId, adminId: adminUser?.id, reason }, "[admin] User banned");
    res.json({ ok: true, userId, banned: true });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to ban user");
    res.status(500).json({ error: "Failed to ban user" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/stats — platform health & usage statistics
// ---------------------------------------------------------------------------
router.get("/stats", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsersResult,
      activeUsersResult,
      bannedUsersResult,
      monthlyPlanResult,
      annualPlanResult,
      freePlanResult,
      totalStoriesResult,
      storiesTodayResult,
      storiesThisWeekResult,
      storiesThisMonthResult,
      pendingModResult,
      totalModerationResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(isNull(usersTable.deletedAt)),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(isNull(usersTable.deletedAt), sql`${usersTable.createdAt} >= ${thirtyDaysAgo}`)),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.isBanned, true), isNull(usersTable.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.subscriptionPlan, "monthly"), isNull(usersTable.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.subscriptionPlan, "annual"), isNull(usersTable.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.subscriptionPlan, "free"), isNull(usersTable.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(generatedStories).where(isNotNull(generatedStories.ownerUserId)),
      db.select({ count: sql<number>`count(*)::int` }).from(generatedStories).where(and(sql`${generatedStories.createdAt} >= ${startOfToday}`, isNotNull(generatedStories.ownerUserId))),
      db.select({ count: sql<number>`count(*)::int` }).from(generatedStories).where(and(sql`${generatedStories.createdAt} >= ${startOfWeek}`, isNotNull(generatedStories.ownerUserId))),
      db.select({ count: sql<number>`count(*)::int` }).from(generatedStories).where(and(sql`${generatedStories.createdAt} >= ${startOfMonth}`, isNotNull(generatedStories.ownerUserId))),
      db.select({ count: sql<number>`count(*)::int` }).from(storyReports).where(eq(storyReports.status, "pending")),
      db.select({ count: sql<number>`count(*)::int` }).from(moderationEvents).where(sql`${moderationEvents.createdAt} >= ${thirtyDaysAgo}`),
    ]);

    res.json({
      users: {
        total: totalUsersResult[0]?.count ?? 0,
        active: activeUsersResult[0]?.count ?? 0,
        banned: bannedUsersResult[0]?.count ?? 0,
        byPlan: {
          free: freePlanResult[0]?.count ?? 0,
          monthly: monthlyPlanResult[0]?.count ?? 0,
          annual: annualPlanResult[0]?.count ?? 0,
        },
      },
      stories: {
        total: totalStoriesResult[0]?.count ?? 0,
        today: storiesTodayResult[0]?.count ?? 0,
        thisWeek: storiesThisWeekResult[0]?.count ?? 0,
        thisMonth: storiesThisMonthResult[0]?.count ?? 0,
      },
      moderation: {
        pendingReports: pendingModResult[0]?.count ?? 0,
        eventsLast30Days: totalModerationResult[0]?.count ?? 0,
      },
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "[admin/stats] Failed to load stats");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/users/:userId/unban — restore a banned user's access
// ---------------------------------------------------------------------------
router.post("/users/:userId/unban", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { userId } = req.params;
  const adminUser = req.user as { id?: string; email?: string } | undefined;

  try {
    const [updated] = await db
      .update(usersTable)
      .set({ isBanned: false, bannedAt: null, bannedReason: null, bannedByAdminId: null })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id, email: usersTable.email });

    if (!updated) { res.status(404).json({ error: "User not found" }); return; }

    writeAuditLog(adminUser?.id, adminUser?.email, "risk_score_change", "user", userId, {
      action: "unban",
    });

    logger.info({ userId, adminId: adminUser?.id }, "[admin] User unbanned");
    res.json({ ok: true, userId, banned: false });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to unban user");
    res.status(500).json({ error: "Failed to unban user" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/setup-stripe-webhook
// Registers the Stripe webhook endpoint for this deployment. Safe to call
// multiple times — Stripe deduplicates by URL. Requires admin auth.
// ---------------------------------------------------------------------------
router.post("/setup-stripe-webhook", requireAdmin, async (req: Request, res: Response) => {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const SITE_URL = process.env.SITE_URL ?? "https://theprivatestory.com";

  if (!STRIPE_SECRET_KEY) {
    res.status(503).json({ error: "STRIPE_SECRET_KEY not configured." });
    return;
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });

    const webhookUrl = `${SITE_URL}/api/stripe/webhook`;

    const existing = await stripe.webhookEndpoints.list({ limit: 100 });
    const alreadyExists = existing.data.find(w => w.url === webhookUrl);

    if (alreadyExists) {
      res.json({
        ok: true,
        message: "Webhook already registered.",
        id: alreadyExists.id,
        url: alreadyExists.url,
        status: alreadyExists.status,
      });
      return;
    }

    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        "checkout.session.completed",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_failed",
      ],
      description: "My Private Story — production webhook",
    });

    logger.info({ webhookId: webhook.id, url: webhookUrl }, "[admin] Stripe webhook registered");
    res.json({
      ok: true,
      message: "Webhook registered successfully.",
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret,
    });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to register Stripe webhook");
    res.status(500).json({ error: "Failed to register webhook." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/users/search?q=... — search users by email or name
// ---------------------------------------------------------------------------
router.get("/users/search", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const q = ((req.query.q as string) ?? "").trim();
  if (!q || q.length < 2) { res.json({ users: [] }); return; }
  try {
    const rows = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        subscriptionPlan: usersTable.subscriptionPlan,
        subscriptionStatus: usersTable.subscriptionStatus,
        addonStoriesRemaining: usersTable.addonStoriesRemaining,
        isBanned: usersTable.isBanned,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(
        and(
          isNull(usersTable.deletedAt),
          or(
            ilike(usersTable.email, `%${q}%`),
            ilike(usersTable.name, `%${q}%`),
          ),
        ),
      )
      .limit(20);
    res.json({ users: rows });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to search users");
    res.status(500).json({ error: "Search failed" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/users/:userId/add-credits — grant story credits to a user
// ---------------------------------------------------------------------------
router.post("/users/:userId/add-credits", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const { userId } = req.params;
  const amount = Number(req.body?.amount);
  if (!Number.isInteger(amount) || amount < 1 || amount > 500) {
    res.status(400).json({ error: "amount must be an integer between 1 and 500" });
    return;
  }
  const adminUser = req.user as { id?: string; email?: string } | undefined;
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ addonStoriesRemaining: sql`${usersTable.addonStoriesRemaining} + ${amount}` })
      .where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        addonStoriesRemaining: usersTable.addonStoriesRemaining,
      });
    if (!updated) { res.status(404).json({ error: "User not found" }); return; }
    writeAuditLog(adminUser?.id, adminUser?.email, "risk_score_change", "user", userId, {
      action: "add_credits",
      amount,
      newTotal: updated.addonStoriesRemaining,
    });
    logger.info({ userId, adminId: adminUser?.id, amount }, "[admin] Story credits granted");
    res.json({ ok: true, userId, email: updated.email, addonStoriesRemaining: updated.addonStoriesRemaining });
  } catch (err) {
    logger.error({ err }, "[admin] Failed to add credits");
    res.status(500).json({ error: "Failed to add credits" });
  }
});

/**
 * POST /api/admin/fix-sample-audio
 * One-time migration: regenerate audio for the two hardcoded sample stories
 * if their audio files are missing from GCS.  Safe to call repeatedly.
 */
router.post("/fix-sample-audio", requireAdmin, async (req: Request, res: Response) => {
  const SAMPLES: Array<{
    storyId: string;
    audioCacheKey: string;
    voiceFeel: string;
    pairing: string;
    label: string;
  }> = [
    {
      storyId: "b46f97f830345edb4687ed19b7a28ad1",
      audioCacheKey: "b46f97f830345edb4687ed19b7a28ad1",
      voiceFeel: "Soothing",
      pairing: "Her & Him",
      label: "Story A – The Ring in the Mirror (Clara)",
    },
    {
      storyId: "0adf3133018146a8d7f7fa5bde57d752",
      audioCacheKey: "fc49bea83789fbfdf8b98e5042316d77",
      voiceFeel: "Expressive",
      pairing: "Her & Him",
      label: "Story B – Gold Light, Cold Metal (Kayla)",
    },
  ];

  const results: Array<{ label: string; status: string; url?: string; durationSeconds?: number }> = [];

  for (const sample of SAMPLES) {
    const filename = `audio-${sample.audioCacheKey}.mp3`;
    try {
      // Check if file already in GCS
      const { objectStorageClient } = await import("../lib/objectStorage.js");
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) { results.push({ label: sample.label, status: "error: bucket not set" }); continue; }
      const file = objectStorageClient.bucket(bucketId).file(`media/audio/${filename}`);
      const [exists] = await file.exists();
      if (exists) { results.push({ label: sample.label, status: "already_in_gcs", url: `/api/audio/${filename}` }); continue; }

      // Fetch scene text from DB
      const rows = await db
        .select({ scenes: generatedStories.scenes })
        .from(generatedStories)
        .where(eq(generatedStories.id, sample.storyId))
        .limit(1);

      if (!rows[0] || !rows[0].scenes) {
        results.push({ label: sample.label, status: "error: story not found in DB" });
        continue;
      }

      type Scene = { text: string; [k: string]: unknown };
      const scenes = rows[0].scenes as Scene[];
      logger.info({ label: sample.label, sceneCount: scenes.length }, "[admin] Regenerating sample audio");

      const { url, durationSeconds } = await generateAudioFile(
        scenes as Parameters<typeof generateAudioFile>[0],
        sample.voiceFeel,
        sample.audioCacheKey,
        sample.pairing,
      );
      results.push({ label: sample.label, status: "generated", url, durationSeconds });
    } catch (err) {
      logger.error({ err, label: sample.label }, "[admin] fix-sample-audio failed for story");
      results.push({ label: sample.label, status: `error: ${(err as Error).message}` });
    }
  }

  res.json({ ok: true, results });
});

export default router;

