/**
 * Authenticated media routes — replace the unrestricted static-file middleware.
 *
 * Audio and image files contain personalised content. Serving them without
 * authentication means any party with a correct URL can download another
 * user's private story. These handlers enforce:
 *
 *   1. Valid session required (401 otherwise)
 *   2. Ownership check: ownerUserId === req.user.id OR isLibraryStory = true
 *   3. Path-traversal protection: filename must match a strict allowlist regex
 *   4. File presence check before streaming (404 if the file was never generated)
 *
 * Library stories (isLibraryStory = true) are shared content — all authenticated
 * users may access them regardless of ownerUserId.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { db, generatedStories } from "@workspace/db";
import { eq, or, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const router = Router();

// ---------------------------------------------------------------------------
// Filename allowlist — only hex/alphanumeric filenames are accepted.
// This prevents path-traversal attacks (e.g. ../../../../etc/passwd).
// ---------------------------------------------------------------------------
const AUDIO_FILENAME_RE = /^[\w\-]+\.mp3$/;
const IMAGE_FILENAME_RE = /^[\w\-]+\.(?:png|jpg|jpeg|webp)$/;

/** Shared ownership-check logic for both audio and image handlers. */
async function checkOwnership(
  req: Request,
  res: Response,
  mediaType: "audio" | "image",
  filename: string,
): Promise<boolean> {
  if (!req.isAuthenticated() || !req.user?.id) {
    res.status(401).json({ error: "Authentication required." });
    return false;
  }

  const userId = req.user.id;
  const urlPath = `/api/${mediaType === "audio" ? "audio" : "images"}/${filename}`;

  try {
    // Look up the story that owns this file.
    // Audio is stored in the `audio_url` column as the full /api/audio/... path.
    // Cover images are stored in the `images` JSONB column as { "cover": "/api/images/..." }.
    const [story] = await db
      .select({
        ownerUserId: generatedStories.ownerUserId,
        isLibraryStory: generatedStories.isLibraryStory,
      })
      .from(generatedStories)
      .where(
        mediaType === "audio"
          ? eq(generatedStories.audioUrl, urlPath)
          : sql`${generatedStories.images}->>'cover' = ${urlPath}`,
      )
      .limit(1);

    if (!story) {
      // File exists on disk but no story record claims it — deny access rather
      // than serving an orphaned file.
      res.status(404).json({ error: "Not found." });
      return false;
    }

    // Library stories are shared content — all authenticated users may access.
    if (story.isLibraryStory) return true;

    // Personal stories — owner only.
    if (story.ownerUserId === userId) return true;

    logger.warn(
      { userId, urlPath, ownerUserId: story.ownerUserId },
      "[media] Ownership check failed — forbidden",
    );
    res.status(403).json({ error: "Forbidden." });
    return false;
  } catch (err) {
    logger.error({ err, urlPath }, "[media] DB ownership check failed");
    res.status(500).json({ error: "An unexpected error occurred." });
    return false;
  }
}

// ---------------------------------------------------------------------------
// GET /audio/:filename
// ---------------------------------------------------------------------------
router.get("/audio/:filename", async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  if (!AUDIO_FILENAME_RE.test(filename)) {
    return res.status(400).json({ error: "Invalid filename." });
  }

  const allowed = await checkOwnership(req, res, "audio", filename);
  if (!allowed) return;

  const filePath = path.join(publicDir, "audio", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found." });
  }

  return res.sendFile(filePath);
});

// ---------------------------------------------------------------------------
// GET /images/:filename
// ---------------------------------------------------------------------------
router.get("/images/:filename", async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  if (!IMAGE_FILENAME_RE.test(filename)) {
    return res.status(400).json({ error: "Invalid filename." });
  }

  const allowed = await checkOwnership(req, res, "image", filename);
  if (!allowed) return;

  const filePath = path.join(publicDir, "images", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found." });
  }

  return res.sendFile(filePath);
});

export default router;
