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
import { streamAudioFile, streamImageFile } from "../lib/mediaStorage.js";

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
  const urlPath = `/api/${mediaType === "audio" ? "audio" : "images"}/${filename}`;

  try {
    // Look up the story that owns this file.
    // Audio is stored in the `audio_url` column as the full /api/audio/... path.
    // Images are stored in the `images` JSONB column as:
    //   { "cover": "/api/images/cover-xxx.png", "scenes": ["/api/images/scene-xxx.png", ...] }
    // We must match either the cover field OR any entry in the scenes array.
    const [story] = await db
      .select({
        ownerUserId: generatedStories.ownerUserId,
        isLibraryStory: generatedStories.isLibraryStory,
      })
      .from(generatedStories)
      .where(
        mediaType === "audio"
          ? eq(generatedStories.audioUrl, urlPath)
          : sql`(
              ${generatedStories.images}->>'cover' = ${urlPath}
              OR
              ${generatedStories.images}->'scenes' @> jsonb_build_array(${urlPath}::text)
            )`,
      )
      .limit(1);

    if (!story) {
      // File exists on disk but no story record claims it — deny access rather
      // than serving an orphaned file.
      res.status(404).json({ error: "Not found." });
      return false;
    }

    // Library stories (images only) are public content — serve without auth.
    // Audio for library stories still requires authentication to prevent scraping.
    if (story.isLibraryStory && mediaType === "image") return true;

    // Sample story audio is publicly accessible for conversion/preview purposes.
    const SAMPLE_AUDIO_FILENAMES = [
      "audio-lib-dd2_02-1775048422711.mp3",
      "audio-b46f97f830345edb4687ed19b7a28ad1.mp3",
      "audio-fc49bea83789fbfdf8b98e5042316d77.mp3", // Gold Light, Cold Metal (After Dark sample)
    ];
    if (story.isLibraryStory && mediaType === "audio" && SAMPLE_AUDIO_FILENAMES.includes(filename)) return true;

    // All other access requires a valid session.
    if (!req.isAuthenticated() || !req.user?.id) {
      res.status(401).json({ error: "Authentication required." });
      return false;
    }

    const userId = req.user.id;

    // Library audio — any authenticated user may access.
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
// GET /ambient/:filename — serve local ambient sound loops (no auth required)
// ---------------------------------------------------------------------------
const VALID_AMBIENT = new Set([
  "rain", "city_night", "train", "firelight", "ocean", "quiet_room",
]);

router.get("/ambient/:filename", (req: Request, res: Response) => {
  const raw = req.params.filename.replace(/\.mp3$/i, "");
  if (!VALID_AMBIENT.has(raw)) {
    return res.status(400).json({ error: "Invalid ambient ID" });
  }
  const filePath = path.join(publicDir, "ambient", `${raw}.mp3`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Ambient file not found" });
  }
  res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 days
  res.setHeader("Content-Type", "audio/mpeg");
  return res.sendFile(filePath);
});

// ---------------------------------------------------------------------------
// GET /voice-samples/:voiceId — serve fixed voice samples (no auth required)
// ---------------------------------------------------------------------------
router.get("/voice-samples/:voiceId", (req: Request, res: Response) => {
  const { voiceId } = req.params;
  // Whitelist of valid voice IDs to prevent path traversal
  const validVoiceIds = [
    "FA6HhUjVbervLw2rNl8M", // Clara (Soothing)
    "tQ4MEZFJOzsahSEEZtHK", // Maya (Close)
    "aTxZrSrp47xsP6Ot4Kgd", // Kayla (Expressive)
    "AeRdCCKzvd23BpJoofzx", // Nathaniel (Assured)
    "n1PvBOwxb8X6m7tahp2h", // Deep
    "jfIS2w2yJi0grJZPyEsk", // Heavy
  ];

  if (!validVoiceIds.includes(voiceId)) {
    return res.status(400).json({ error: "Invalid voice ID" });
  }

  const filePath = path.join(publicDir, "voice-samples", `${voiceId}.mp3`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Voice sample not found. Sample must be pre-generated." });
  }

  res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 days
  return res.sendFile(filePath);
});

// ---------------------------------------------------------------------------
// GET /audio/:filename
// ---------------------------------------------------------------------------

/**
 * Hardcoded sample story audio — always public, no auth or DB check.
 * These filenames are committed to the list explicitly so any addition requires
 * a deliberate code change (no wildcard bypass).
 */
const SAMPLE_AUDIO_FILENAMES = new Set([
  "audio-b46f97f830345edb4687ed19b7a28ad1.mp3", // Story A – The Ring in the Mirror (Clara)
  "audio-fc49bea83789fbfdf8b98e5042316d77.mp3", // Story B – Gold Light, Cold Metal (Kayla)
  "audio-lib-dd2_02-1775048422711.mp3",          // homepage ambient sample
]);

router.get("/audio/:filename", async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  if (!AUDIO_FILENAME_RE.test(filename)) {
    return res.status(400).json({ error: "Invalid filename." });
  }

  // Sample audio is publicly accessible for preview — bypass DB ownership check.
  if (SAMPLE_AUDIO_FILENAMES.has(filename)) {
    const found = await streamAudioFile(filename, res, req);
    if (!found) return res.status(404).json({ error: "File not found." });
    return;
  }

  const allowed = await checkOwnership(req, res, "audio", filename);
  if (!allowed) return;

  const found = await streamAudioFile(filename, res, req);
  if (!found) return res.status(404).json({ error: "File not found." });
});

// ---------------------------------------------------------------------------
// GET /images/:filename
// ---------------------------------------------------------------------------

/** Hardcoded sample story cover images — always public, no auth or DB check. */
const SAMPLE_COVER_FILENAMES = new Set([
  "cover-daa5ffac36e215afb98fc54761355b53.png", // Story A – The Ring in the Mirror
  "cover-fc49bea83789fbfdf8b98e5042316d77.png", // Story B – Gold Light, Cold Metal
]);

router.get("/images/:filename", async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  if (!IMAGE_FILENAME_RE.test(filename)) {
    return res.status(400).json({ error: "Invalid filename." });
  }

  // Category images and hardcoded sample covers are public assets — serve without auth.
  if (
    /^category-[a-z0-9_]+-[a-z0-9_]+\.(?:png|webp)$/.test(filename) ||
    /^category-[a-z0-9_]+\.(?:png|webp)$/.test(filename) ||
    /^express-act4-[a-z0-9-]+\.(?:png|webp)$/.test(filename) ||
    SAMPLE_COVER_FILENAMES.has(filename)
  ) {
    const found = await streamImageFile(filename, res);
    if (!found) return res.status(404).json({ error: "File not found." });
    return;
  }

  const allowed = await checkOwnership(req, res, "image", filename);
  if (!allowed) return;

  const found = await streamImageFile(filename, res);
  if (!found) return res.status(404).json({ error: "File not found." });
});

export default router;
