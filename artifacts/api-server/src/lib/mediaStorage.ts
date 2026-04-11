/**
 * Persistent media storage for generated audio and image files.
 *
 * Generated media (user stories, library stories) is stored in Google Cloud
 * Storage (via Replit Object Storage) so it survives deployments and scales
 * across server instances. Static/brand assets committed to git (voice samples,
 * category images, cover images for library stories seeded at build time) are
 * still served from local disk — they are committed to the repo so they are
 * always present.
 *
 * Key design:
 *   - Upload: server saves bytes directly to GCS (no presigned URL needed for
 *     server-side generation).
 *   - Serve: media route checks local disk first (catches committed static
 *     files), then falls back to GCS streaming.
 *   - Filenames are the same as before (e.g. "audio-xxx.mp3", "cover-xxx.png")
 *     so DB paths like "/api/audio/..." remain unchanged.
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import type { Response } from "express";
import { objectStorageClient } from "./objectStorage.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AUDIO_GCS_PREFIX = "media/audio";
const IMAGE_GCS_PREFIX = "media/images";

function getBucket() {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
  return objectStorageClient.bucket(bucketId);
}

/** Save an audio buffer to GCS. */
export async function uploadAudioFile(filename: string, buffer: Buffer): Promise<void> {
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
 * Stream an audio file to an HTTP response.
 * Checks local disk first (covers committed static files), then GCS.
 * Sets appropriate Content-Type and cache headers.
 */
export async function streamAudioFile(filename: string, res: Response): Promise<boolean> {
  const localPath = path.resolve(__dirname, "../public/audio", filename);
  if (fs.existsSync(localPath)) {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.sendFile(localPath);
    return true;
  }

  try {
    const file = getBucket().file(`${AUDIO_GCS_PREFIX}/${filename}`);
    const [exists] = await file.exists();
    if (!exists) return false;

    const [metadata] = await file.getMetadata();
    const size = metadata.size;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    if (size) res.setHeader("Content-Length", String(size));
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
  const localPath = path.resolve(__dirname, "../public/images", filename);
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
