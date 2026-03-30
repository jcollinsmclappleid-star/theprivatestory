import { Router } from "express";
import { db, storyReports, generatedStories } from "@workspace/db";
import { eq } from "drizzle-orm";
import { alertUserReport } from "../lib/adminNotify.js";
import { logger } from "../lib/logger.js";

const router = Router();

export const REPORT_REASON_CATEGORIES = [
  "Inappropriate content",
  "Content felt non-consensual or uncomfortable",
  "Story did not match the intended tone",
  "Other",
] as const;

export type ReportReasonCategory = (typeof REPORT_REASON_CATEGORIES)[number];

/**
 * POST /api/story-report
 *
 * Authenticated users report a story from their library. Stores a full record
 * to story_reports with the story's input snapshot and a brief output excerpt
 * for admin review. Fires an email alert to the support inbox.
 *
 * Body: { storyId, reasonCategory, reason, note? }
 */
router.post("/story-report", async (req, res) => {
  if (!req.isAuthenticated() || !req.user?.id) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const { storyId, reasonCategory, reason, note } = req.body as {
    storyId?: string;
    reasonCategory?: string;
    reason?: string;
    note?: string;
  };

  if (!storyId || !reasonCategory || !reason) {
    res.status(400).json({ error: "storyId, reasonCategory and reason are required." });
    return;
  }

  if (!REPORT_REASON_CATEGORIES.includes(reasonCategory as ReportReasonCategory)) {
    res.status(400).json({
      error: "Invalid reason category.",
      allowed: REPORT_REASON_CATEGORIES,
    });
    return;
  }

  const userId = req.user.id;

  try {
    // Fetch the story for metadata + input snapshot
    const [story] = await db
      .select({
        id: generatedStories.id,
        title: generatedStories.title,
        description: generatedStories.description,
        brief: generatedStories.brief,
        castingData: generatedStories.castingData,
      })
      .from(generatedStories)
      .where(eq(generatedStories.id, storyId))
      .limit(1);

    const storyTitle = story?.title ?? null;
    const inputSnapshot = story ? { brief: story.brief, castingData: story.castingData } : null;
    const outputExcerpt = story?.description ? String(story.description).slice(0, 500) : null;

    const [record] = await db
      .insert(storyReports)
      .values({
        userId,
        storyId,
        storyTitle,
        reason,
        reasonCategory,
        note: note?.trim().slice(0, 800) ?? null,
        inputSnapshot,
        outputExcerpt,
        status: "pending",
      })
      .returning();

    logger.info(
      { reportId: record.id, storyId, userId, reasonCategory },
      "[reports] Story report submitted",
    );

    alertUserReport({
      reportId: record.id,
      userId,
      storyId,
      storyTitle,
      reasonCategory,
      reason,
      note: note ?? null,
      createdAt: record.createdAt,
    });

    res.json({
      ok: true,
      message: "Thank you. Your report has been received and will be reviewed.",
    });
  } catch (err) {
    logger.error({ err, storyId, userId }, "[reports] Failed to save story report");
    res.status(500).json({ error: "Failed to submit report. Please try again." });
  }
});

/**
 * Legacy POST /api/reports — kept for backward compatibility (old user_reports table).
 * New story reports go to /api/story-report.
 */
router.post("/reports", async (req, res) => {
  res.status(410).json({
    error: "This endpoint has been superseded. Please use POST /api/story-report.",
  });
});

export default router;
