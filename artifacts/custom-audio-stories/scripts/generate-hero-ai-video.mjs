#!/usr/bin/env node
/**
 * Generate a true image-to-video hero loop via Replicate (Wan 2.5 i2v fast).
 *
 * Requires: REPLICATE_API_TOKEN
 * Get one at https://replicate.com/account/api-tokens (~$0.05–0.11 per 5s clip)
 *
 * Usage:
 *   REPLICATE_API_TOKEN=r8_… node scripts/generate-hero-ai-video.mjs
 *
 * Output:
 *   public/images/home-hero-loop-raw.mp4  (from Replicate)
 *   public/images/home-hero-loop.webm     (optimised for web)
 *   public/images/home-hero-loop.mp4      (Safari fallback)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images");
const SRC = path.join(OUT_DIR, "home-hero-woman.png");
const MODEL = "wan-video/wan-2.5-i2v-fast";

const PROMPT =
  "Cinematic slow motion. The woman turns her head toward the camera with quiet anticipation. Black fabric straps in her hands sway gently forward. Warm candlelight flickers. The seated man remains still. Subtle breathing. Premium film still, smooth natural motion, no camera shake.";

const NEGATIVE =
  "blurry, distorted face, extra limbs, smile, cartoon, low quality, watermark, text, jump cut";

const token = process.env.REPLICATE_API_TOKEN;
if (!token) {
  console.error("Set REPLICATE_API_TOKEN (https://replicate.com/account/api-tokens)");
  process.exit(1);
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function replicateFetch(pathname, options = {}) {
  const res = await fetch(`https://api.replicate.com/v1${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait",
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.detail || body.error || `Replicate ${res.status}`);
  }
  return body;
}

async function main() {
  console.log(`Uploading ${SRC} …`);
  const imageData = fs.readFileSync(SRC);
  const blob = new Blob([imageData], { type: "image/png" });

  const uploadRes = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: (() => {
      const form = new FormData();
      form.append("content", blob, "home-hero-woman.png");
      return form;
    })(),
  });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(uploadBody.detail || "File upload failed");
  }
  const imageUrl = uploadBody.urls?.get || uploadBody.url;
  console.log("Image uploaded.");

  console.log(`Running ${MODEL} (5s, 720p) …`);
  const prediction = await replicateFetch("/predictions", {
    method: "POST",
    body: JSON.stringify({
      version: await resolveLatestVersion(MODEL),
      input: {
        image: imageUrl,
        prompt: PROMPT,
        negative_prompt: NEGATIVE,
        duration: 5,
        resolution: "720p",
        enable_prompt_expansion: true,
      },
    }),
  });

  let result = prediction;
  while (result.status === "starting" || result.status === "processing") {
    await sleep(4000);
    result = await replicateFetch(`/predictions/${prediction.id}`);
    process.stdout.write(".");
  }
  console.log("");

  if (result.status !== "succeeded") {
    throw new Error(result.error || `Prediction ${result.status}`);
  }

  const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
  if (!videoUrl) throw new Error("No video URL in output");

  const rawPath = path.join(OUT_DIR, "home-hero-loop-raw.mp4");
  console.log("Downloading raw clip …");
  const videoRes = await fetch(videoUrl);
  fs.writeFileSync(rawPath, Buffer.from(await videoRes.arrayBuffer()));

  const webmPath = path.join(OUT_DIR, "home-hero-loop.webm");
  const mp4Path = path.join(OUT_DIR, "home-hero-loop.mp4");

  console.log("Optimising for web …");
  runFfmpeg([
    "-y",
    "-i",
    rawPath,
    "-an",
    "-vf",
    "scale=960:1280:force_original_aspect_ratio=increase,crop=960:1280,setsar=1,format=yuv420p",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "30",
    "-row-mt",
    "1",
    webmPath,
  ]);

  runFfmpeg([
    "-y",
    "-i",
    rawPath,
    "-an",
    "-vf",
    "scale=960:1280:force_original_aspect_ratio=increase,crop=960:1280,setsar=1,format=yuv420p",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "26",
    "-preset",
    "slow",
    "-movflags",
    "+faststart",
    mp4Path,
  ]);

  console.log("Done.");
  console.log(`  ${webmPath}`);
  console.log(`  ${mp4Path}`);
}

async function resolveLatestVersion(model) {
  const res = await fetch(`https://api.replicate.com/v1/models/${model}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail || "Could not resolve model version");
  return body.latest_version?.id;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
