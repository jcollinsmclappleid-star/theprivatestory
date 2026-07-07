/**
 * Persistent media storage for generated audio and image files.
 *
 * Generated media is stored in Vercel Blob (production) or Google Cloud Storage
 * (Replit / hosts with a service account). Static assets committed to git are
 * still served from local disk.
 *
 * DB paths stay `/api/audio/...` and `/api/images/...` — the media route streams
 * from local disk, then Blob, then GCS.
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Readable } from "stream";
import type { Request, Response } from "express";
import { del, get, head, put } from "@vercel/blob";
import { objectStorageClient } from "./objectStorage.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_AUDIO_DIR = path.resolve(__dirname, "../../public/audio");
const PUBLIC_IMAGES_DIR = path.resolve(__dirname, "../../public/images");
const AUDIO_OBJECT_PREFIX = "media/audio";
const IMAGE_OBJECT_PREFIX = "media/images";

const PLACEHOLDER_BUCKET_IDS = new Set([
  "DEFAULT_OBJECT_STORAGE_BUCKET_ID",
  "PASTE_HERE",
]);

function hasGcsCredentials(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim() ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  );
}

function resolveGcsBucketId(): string | null {
  const raw = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID?.trim();
  if (raw && !PLACEHOLDER_BUCKET_IDS.has(raw)) return raw;

  const paths = process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "";
  const match = paths.match(/\/(replit-objstore-[a-f0-9-]+)/i);
  return match?.[1] ?? null;
}

function shouldUseVercelBlob(): boolean {
  if (process.env.SKIP_GCS_UPLOAD === "1") return false;
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  return false;
}

function shouldUseGcs(): boolean {
  if (process.env.SKIP_GCS_UPLOAD === "1") return false;
  if (shouldUseVercelBlob()) return false;
  return hasGcsCredentials() && !!resolveGcsBucketId();
}

function getBucket() {
  const bucketId = resolveGcsBucketId();
  if (!bucketId) {
    throw new Error(
      "Object storage not configured: set BLOB_READ_WRITE_TOKEN (Vercel) or DEFAULT_OBJECT_STORAGE_BUCKET_ID + GCS credentials",
    );
  }
  return objectStorageClient.bucket(bucketId);
}

async function blobExists(pathname: string): Promise<boolean> {
  try {
    await head(pathname);
    return true;
  } catch {
    return false;
  }
}

function pipeWebStream(
  webStream: ReadableStream<Uint8Array>,
  res: Response,
  headers: Headers,
  fallbackContentType: string,
  fallbackSize: number,
): void {
  res.setHeader("Content-Type", headers.get("content-type") ?? fallbackContentType);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.setHeader("Accept-Ranges", "bytes");

  const contentRange = headers.get("content-range");
  const contentLength = headers.get("content-length");
  if (contentRange) {
    res.status(206);
    res.setHeader("Content-Range", contentRange);
    if (contentLength) res.setHeader("Content-Length", contentLength);
  } else if (fallbackSize > 0) {
    res.setHeader("Content-Length", String(fallbackSize));
  }

  Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
}

/** Save an audio buffer. Optionally mirror to public/audio when LOCAL_AUDIO_MIRROR=1 (dev QA). */
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

  if (shouldUseVercelBlob()) {
    await put(`${AUDIO_OBJECT_PREFIX}/${filename}`, buffer, {
      access: "private",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
    });
    logger.info({ filename }, "[mediaStorage] audio uploaded to Vercel Blob");
    return;
  }

  const file = getBucket().file(`${AUDIO_OBJECT_PREFIX}/${filename}`);
  await file.save(buffer, {
    metadata: { contentType: "audio/mpeg" },
    resumable: false,
  });
  logger.info({ filename }, "[mediaStorage] audio uploaded to GCS");
}

/** Save an image buffer. */
export async function uploadImageFile(filename: string, buffer: Buffer): Promise<void> {
  if (shouldUseVercelBlob()) {
    await put(`${IMAGE_OBJECT_PREFIX}/${filename}`, buffer, {
      access: "private",
      contentType: "image/png",
      addRandomSuffix: false,
    });
    logger.info({ filename }, "[mediaStorage] image uploaded to Vercel Blob");
    return;
  }

  const file = getBucket().file(`${IMAGE_OBJECT_PREFIX}/${filename}`);
  await file.save(buffer, {
    metadata: { contentType: "image/png" },
    resumable: false,
  });
  logger.info({ filename }, "[mediaStorage] image uploaded to GCS");
}

/** Best-effort delete — missing files are ignored. */
export async function deleteAudioFile(filename: string): Promise<void> {
  if (shouldUseVercelBlob()) {
    try {
      await del(`${AUDIO_OBJECT_PREFIX}/${filename}`);
    } catch (err) {
      logger.warn({ err, filename }, "[mediaStorage] failed to delete audio from Blob");
    }
    return;
  }
  if (!shouldUseGcs()) return;

  try {
    const file = getBucket().file(`${AUDIO_OBJECT_PREFIX}/${filename}`);
    await file.delete({ ignoreNotFound: true });
  } catch (err) {
    logger.warn({ err, filename }, "[mediaStorage] failed to delete audio from GCS");
  }
}

/** Best-effort delete — missing files are ignored. */
export async function deleteImageFile(filename: string): Promise<void> {
  if (shouldUseVercelBlob()) {
    try {
      await del(`${IMAGE_OBJECT_PREFIX}/${filename}`);
    } catch (err) {
      logger.warn({ err, filename }, "[mediaStorage] failed to delete image from Blob");
    }
    return;
  }
  if (!shouldUseGcs()) return;

  try {
    const file = getBucket().file(`${IMAGE_OBJECT_PREFIX}/${filename}`);
    await file.delete({ ignoreNotFound: true });
  } catch (err) {
    logger.warn({ err, filename }, "[mediaStorage] failed to delete image from GCS");
  }
}

async function streamAudioFromBlob(
  filename: string,
  res: Response,
  req: Request,
): Promise<boolean> {
  const pathname = `${AUDIO_OBJECT_PREFIX}/${filename}`;
  if (!(await blobExists(pathname))) return false;

  try {
    const rangeHeader = req.headers.range;
    const fetchHeaders: Record<string, string> = {};
    if (typeof rangeHeader === "string") fetchHeaders.Range = rangeHeader;

    const result = await get(pathname, {
      access: "private",
      headers: fetchHeaders,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return false;

    pipeWebStream(
      result.stream,
      res,
      result.headers,
      result.blob.contentType ?? "audio/mpeg",
      result.blob.size ?? 0,
    );
    return true;
  } catch (err) {
    logger.error({ err, filename }, "[mediaStorage] error streaming audio from Blob");
    return false;
  }
}

/**
 * Stream an audio file to an HTTP response.
 * Checks local disk first, then Blob, then GCS.
 */
export async function streamAudioFile(
  filename: string,
  res: Response,
  req: Request,
): Promise<boolean> {
  const localPath = path.join(PUBLIC_AUDIO_DIR, filename);
  if (fs.existsSync(localPath)) {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Accept-Ranges", "bytes");
    res.sendFile(localPath);
    return true;
  }

  if (shouldUseVercelBlob()) {
    const streamed = await streamAudioFromBlob(filename, res, req);
    if (streamed) return true;
  }

  if (!shouldUseGcs()) return false;

  try {
    const file = getBucket().file(`${AUDIO_OBJECT_PREFIX}/${filename}`);
    const [exists] = await file.exists();
    if (!exists) return false;

    const [metadata] = await file.getMetadata();
    const totalSize = Number(metadata.size ?? 0);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Accept-Ranges", "bytes");

    const rangeHeader = req.headers.range;

    if (rangeHeader && totalSize > 0) {
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

    if (totalSize > 0) res.setHeader("Content-Length", String(totalSize));
    file.createReadStream().pipe(res);
    return true;
  } catch (err) {
    logger.error({ err, filename }, "[mediaStorage] error streaming audio from GCS");
    return false;
  }
}

async function streamImageFromBlob(filename: string, res: Response): Promise<boolean> {
  const pathname = `${IMAGE_OBJECT_PREFIX}/${filename}`;
  if (!(await blobExists(pathname))) return false;

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return false;

    res.setHeader("Content-Type", result.blob.contentType ?? "image/png");
    res.setHeader("Cache-Control", "private, max-age=86400");
    if (result.blob.size) res.setHeader("Content-Length", String(result.blob.size));
    Readable.fromWeb(result.stream as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
    return true;
  } catch (err) {
    logger.error({ err, filename }, "[mediaStorage] error streaming image from Blob");
    return false;
  }
}

/**
 * Stream an image file to an HTTP response.
 * Checks local disk first, then Blob, then GCS.
 */
export async function streamImageFile(filename: string, res: Response): Promise<boolean> {
  const localPath = path.join(PUBLIC_IMAGES_DIR, filename);
  if (fs.existsSync(localPath)) {
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.sendFile(localPath);
    return true;
  }

  if (shouldUseVercelBlob()) {
    const streamed = await streamImageFromBlob(filename, res);
    if (streamed) return true;
  }

  if (!shouldUseGcs()) return false;

  try {
    const file = getBucket().file(`${IMAGE_OBJECT_PREFIX}/${filename}`);
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
