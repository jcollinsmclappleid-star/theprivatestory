import { Router } from "express";
import { db, contentBlocks } from "@workspace/db";
import crypto from "crypto";
import { sendEmail, SAFETY_EMAIL } from "../lib/email.js";

const router = Router();

/**
 * POST /api/safety-report
 *
 * Public endpoint. Authenticated or anonymous users can submit a safety concern.
 * Creates a content_blocks entry with blockSource="user-report" so it appears
 * in the admin moderation queue. Also logs the submission for audit purposes.
 *
 * Body: { description: string, contentId?: string, category: string }
 */
router.post("/safety-report", async (req, res) => {
  const { description, contentId, category } = req.body as {
    description?: string;
    contentId?: string;
    category?: string;
  };

  if (!description || typeof description !== "string" || description.trim().length < 5) {
    res.status(400).json({ error: "description is required (min 5 characters)" });
    return;
  }
  if (!category || typeof category !== "string") {
    res.status(400).json({ error: "category is required" });
    return;
  }

  const ALLOWED_CATEGORIES = [
    "csam",
    "non-consent",
    "real-person",
    "bestiality",
    "spam",
    "harassment",
    "other",
  ];
  if (!ALLOWED_CATEGORIES.includes(category)) {
    res.status(400).json({ error: "invalid category", allowed: ALLOWED_CATEGORIES });
    return;
  }

  const user = req.user as { id?: string; email?: string } | undefined;
  const userId = user?.id ?? null;
  const sessionId = (req.sessionID as string | undefined) ?? null;

  // Hash description so we don't store raw report text in safety-adjacent logs
  const inputHash = crypto
    .createHash("sha256")
    .update(description.trim().toLowerCase())
    .digest("hex");

  const reportSummary = [
    `Category: ${category}`,
    contentId ? `Content ID: ${contentId}` : null,
    `Report: ${description.trim().slice(0, 500)}`,
  ]
    .filter(Boolean)
    .join(" | ");

  try {
    const [record] = await db
      .insert(contentBlocks)
      .values({
        userId,
        sessionId,
        blockSource: "user-report",
        blockReason: reportSummary.slice(0, 1000),
        inputHash,
      })
      .returning({ id: contentBlocks.id });

    console.log(
      `[safety-report] Filed: id=${record.id} category=${category} userId=${userId ?? "anon"}`,
    );

    // Notify the safety team via email
    await sendEmail({
      to: SAFETY_EMAIL,
      subject: `[Safety Report] ${category} — ID #${record.id}`,
      text: [
        `A safety report has been submitted on The Private Story.`,
        ``,
        `Report ID: ${record.id}`,
        `Category: ${category}`,
        contentId ? `Content ID: ${contentId}` : null,
        `User ID: ${userId ?? "anonymous"}`,
        ``,
        `Report description:`,
        description.trim(),
        ``,
        `Review in admin: /admin (Moderation tab)`,
      ]
        .filter((l) => l !== null)
        .join("\n"),
    });

    res.json({
      ok: true,
      message:
        "Thank you. Your report has been logged and will be reviewed by our safety team. If you have additional information, contact " +
        SAFETY_EMAIL,
      reportId: record.id,
    });
  } catch (err) {
    console.error("[safety-report] DB error", err);
    res.status(500).json({ error: "Failed to submit report. Please contact " + SAFETY_EMAIL });
  }
});

/**
 * GET /api/safety-report/categories
 * Returns the list of allowed report categories for the frontend form.
 */
router.get("/safety-report/categories", (_req, res) => {
  res.json({
    categories: [
      { id: "csam", label: "Content involving a minor" },
      { id: "non-consent", label: "Non-consensual scenario depicted approvingly" },
      { id: "real-person", label: "Real, identifiable person in sexual content" },
      { id: "bestiality", label: "Sexual content involving animals" },
      { id: "harassment", label: "Harassment or threats targeting a person" },
      { id: "other", label: "Other safety concern" },
    ],
    contactEmail: process.env.SAFETY_EMAIL ?? "safety@theprivatestory.com",
  });
});

export default router;
