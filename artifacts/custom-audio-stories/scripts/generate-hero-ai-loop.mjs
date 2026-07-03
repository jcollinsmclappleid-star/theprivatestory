#!/usr/bin/env node
/**
 * Build a seamless hero loop by morphing between the original still and an
 * AI-generated motion keyframe (head turn / ribbon sway).
 *
 * Prereq: public/images/home-hero-frame-2.png (see generate-hero-ai-video.mjs
 * or Cursor image gen with the hero PNG as reference).
 *
 * Usage: node scripts/generate-hero-ai-loop.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images");
const FRAME1 = path.join(OUT_DIR, "home-hero-woman.png");
const FRAME2 = path.join(OUT_DIR, "home-hero-frame-2.png");

if (!fs.existsSync(FRAME2)) {
  console.error(
    "Missing home-hero-frame-2.png — run generate-hero-ai-video.mjs (Replicate) or add an AI keyframe beside the hero still.",
  );
  process.exit(1);
}

const SCALE =
  "scale=960:1280:force_original_aspect_ratio=decrease,pad=960:1280:(ow-iw)/2:(oh-ih)/2:color=0x0a0806,setsar=1";
const FILTER = [
  `[0:v]${SCALE}[a]`,
  `[1:v]${SCALE}[b]`,
  "[a][b]blend=all_expr='A*(0.5+0.5*sin(2*PI*T/5))+B*(0.5-0.5*sin(2*PI*T/5))'",
  "eq=brightness='0.035*sin(2*PI*t/3.1)':contrast=1.02:saturation=1.04",
  "format=yuv420p",
].join(",");

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const baseArgs = [
  "-y",
  "-loop",
  "1",
  "-framerate",
  "24",
  "-i",
  FRAME1,
  "-loop",
  "1",
  "-framerate",
  "24",
  "-i",
  FRAME2,
  "-t",
  "5",
  "-filter_complex",
  FILTER,
  "-an",
];

console.log("Generating AI morph home-hero-loop.webm …");
run([
  ...baseArgs,
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "30",
  "-row-mt",
  "1",
  path.join(OUT_DIR, "home-hero-loop.webm"),
]);

console.log("Generating AI morph home-hero-loop.mp4 …");
run([
  ...baseArgs,
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
  path.join(OUT_DIR, "home-hero-loop.mp4"),
]);

console.log("Done.");
