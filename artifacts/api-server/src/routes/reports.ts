import { Router } from "express";
import { db, userReports } from "@workspace/db";
import { sendEmail, SAFETY_EMAIL } from "../lib/email.js";

const router = Router();

const ALLOWED_CATEGORIES = [
  "csam",
  "non-consent",
  "real-person",
  "bestiality",
  "harassment",
  "other",
] as const;

/**
 * POST /api/reports
 *
 * Frictionless user report endpoint. Anonymous or authenticated users can
 * report any story. Stores to the dedicated user_reports table and fires an
 * email to the safety team.
 *
 * Body: { category, notes?, storyId?, generationSessionId? }
 */
router.post("/reports", async (req, res) => {
  const { category, notes, storyId, generationSessionId } = req.body as {
    category?: string;
    notes?: string;
    storyId?: string;
    generationSessionId?: string;
  };

  if (!category || !ALLOWED_CATEGORIES.includes(category as (typeof ALLOWED_CATEGORIES)[number])) {
    res.status(400).json({
      error: "invalid category",
      allowed: ALLOWED_CATEGORIES,
    });
    return;
  }

  const user = req.user as { id?: string; email?: string } | undefined;
  const userId = user?.id ?? null;
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    null;

  try {
    const [record] = await db
      .insert(userReports)
      .values({
        userId,
        storyId: storyId ?? null,
        generationSessionId: generationSessionId ?? null,
        category,
        notes: notes?.trim().slice(0, 2000) ?? null,
        ipAddress: ip,
      })
      .returning({ id: userReports.id });

    console.log(
      `[reports] Filed: id=${record.id} category=${category} storyId=${storyId ?? "n/a"} user=${userId ?? "anon"}`,
    );

    const bodyLines = [
      `A safety report has been submitted on The Private Story.`,
      ``,
      `Report ID: ${record.id}`,
      `Category: ${category}`,
      storyId ? `Story ID: ${storyId}` : null,
      generationSessionId ? `Generation session: ${generationSessionId}` : null,
      `User: ${userId ?? "anonymous"}`,
      `IP: ${ip ?? "unknown"}`,
      ``,
      notes?.trim() ? `Notes: ${notes.trim()}` : null,
      ``,
      `Review in admin: /admin (Moderation tab)`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    await sendEmail({
      to: SAFETY_EMAIL,
      subject: `[Safety Report] ${category} — Report #${record.id}`,
      text: bodyLines,
    });

    res.json({
      ok: true,
      message:
        "Thank you. Your report has been received and our safety team will review it within 24 hours. Reports are anonymous.",
      reportId: record.id,
    });
  } catch (err) {
    console.error("[reports] DB error", err);
    res.status(500).json({
      error: "Failed to submit report. Please contact " + SAFETY_EMAIL,
    });
  }
});

export default router;
