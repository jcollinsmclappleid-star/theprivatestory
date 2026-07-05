/**
 * Persistent media storage for generated audio and image files.
 *
 * Generated media (user stories, library stories) is stored in Google Cloud
 * Storage so it survives deployments and scales across server instances.
 * Static/brand assets committed to git (voice samples, category images, cover
 * images for library stories seeded at build time) are still served from local
 * disk — they are committed to the repo so they are always present.
 *
 * Key design:
 *   - Upload: server saves bytes directly to GCS (no presigned URL needed for
 *     server-side generation).
 *   - Serve: media route checks local disk first (catches committed static
 *     files), then falls back to GCS streaming.
 *   - Filenames are the same as before (e.g. "audio-xxx.mp3", "cover-xxx.png")
 *     so DB paths like "/api/audio/..." remain unchanged.
 *   - GCS audio streaming implements HTTP range requests (206 Partial Content)
 *     so the browser <audio> element can determine duration and seek correctly.
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import type { Request, Response } from "express";
import { objectStorageClient } from "./objectStorage.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_AUDIO_DIR = path.resolve(__dirname, "../../public/audio");
const PUBLIC_IMAGES_DIR = path.resolve(__dirname, "../../public/images");
const AUDIO_GCS_PREFIX = "media/audio";
const IMAGE_GCS_PREFIX = "media/images";

function getBucket() {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
  return objectStorageClient.bucket(bucketId);
}

/** Save an audio buffer to GCS. Optionally mirror to public/audio when LOCAL_AUDIO_MIRROR=1 (dev QA). */
export async function uploadAudioFile(filename: string, buffer: Buffer): Promise<void> {
  if (process.env.LOCAL_AUDIO_MIRROR === "1") {
    const localPath = path.join(PUBLIC_AUDIO_DIR, filename);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buffer);
    logger.info({ filename, localPath }, "[mediaStorage] audio mirrored to local disk");
  }
  if (process.env.SKIP_GCS_UPLOAD === "1") {
    logger.info({ filename }, "[mediaStorage] SKIP_GCS_UPLOAD=1 — local mirror only");
    return;
  }
  const file = getBucket().file(`${AUDIO_GCS_PREFIX}/${filename}`);
  await file.save(buffer, {
    metadata: { contentType: "audio/mpeg" },
    resumable: false,
  });
  logger.info({ filename }, "[mediaStorage] audio uploaded to GCS");
}

/** Save an image buffer to GCS. */
export async function uploadImageFile(filename: string, buffer: Buffer): Promise<void> {
  const file = getBucket().file(`${IMAGE_GCS_PREFIX}/${filename}`);
  await file.save(buffer, {
    metadata: { contentType: "image/png" },
    resumable: false,
  });
  logger.info({ filename }, "[mediaStorage] image uploaded to GCS");
}

/**
 * Delete an audio file from GCS. Best-effort — missing files are silently
 * ignored (treated as already-deleted). Used by the account-purge job to
 * remove orphan media when a user's stories are deleted.
 */
export async function deleteAudioFile(filename: string): Promise<void> {
  try {
    const file = getBucket().file(`${AUDIO_GCS_PREFIX}/${filename}`);
    await file.delete({ ignoreNotFound: true });
  } catch (err) {
    logger.warn({ err, filename }, "[mediaStorage] failed to delete audio from GCS");
  }
}

/**
 * Delete an image file from GCS. Best-effort — missing files are silently
 * ignored. Used by the account-purge job.
 */
export async function deleteImageFile(filename: string): Promise<void> {
  try {
    const file = getBucket().file(`${IMAGE_GCS_PREFIX}/${filename}`);
    await file.delete({ ignoreNotFound: true });
  } catch (err) {
    logger.warn({ err, filename }, "[mediaStorage] failed to delete image from GCS");
  }
}

/**
 * Stream an audio file to an HTTP response.
 * Checks local disk first (covers committed static files), then GCS.
 * Implements HTTP range requests (206 Partial Content) for GCS files so the
 * browser <audio> element can read duration metadata and seek correctly.
 */
export async function streamAudioFile(
  filename: string,
  res: Response,
  req: Request,
): Promise<boolean> {
  const localPath = path.join(PUBLIC_AUDIO_DIR, filename);
  if (fs.existsSync(localPath)) {
    // Express sendFile handles range requests automatically.
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Accept-Ranges", "bytes");
    res.sendFile(localPath);
    return true;
  }

  try {
    const file = getBucket().file(`${AUDIO_GCS_PREFIX}/${filename}`);
    const [exists] = await file.exists();
    if (!exists) return false;

    const [metadata] = await file.getMetadata();
    const totalSize = Number(metadata.size ?? 0);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Accept-Ranges", "bytes");

    const rangeHeader = req.headers.range;

    if (rangeHeader && totalSize > 0) {
      // Parse "bytes=start-end" (end is optional, defaults to last byte)
      const match = rangeHeader.match(/^bytes=(\d+)-(\d*)$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        const chunkSize = end - start + 1;

        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
        res.setHeader("Content-Length", String(chunkSize));
        file.createReadStream({ start, end }).pipe(res);
        return true;
      }
    }

    // No Range header — serve the full file.
    if (totalSize > 0) res.setHeader("Content-Length", String(totalSize));
    file.createReadStream().pipe(res);
    return true;
  } catch (err) {
    logger.error({ err, filename }, "[mediaStorage] error streaming audio from GCS");
    return false;
  }
}

/**
 * Stream an image file to an HTTP response.
 * Checks local disk first (covers committed static files), then GCS.
 */
export async function streamImageFile(filename: string, res: Response): Promise<boolean> {
  const localPath = path.join(PUBLIC_IMAGES_DIR, filename);
  if (fs.existsSync(localPath)) {
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.sendFile(localPath);
    return true;
  }

  try {
    const file = getBucket().file(`${IMAGE_GCS_PREFIX}/${filename}`);
    const [exists] = await file.exists();
    if (!exists) return false;

    const [metadata] = await file.getMetadata();
    const size = metadata.size;
    const ct = (metadata.contentType as string | undefined) ?? "image/png";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "private, max-age=86400");
    if (size) res.setHeader("Content-Length", String(size));
    file.createReadStream().pipe(res);
    return true;
  } catch (err) {
    logger.error({ err, filename }, "[mediaStorage] error streaming image from GCS");
    return false;
  }
}
