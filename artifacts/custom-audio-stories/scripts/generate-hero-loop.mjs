#!/usr/bin/env node
/**
 * Generate a seamless 4s hero portrait loop (WebM + MP4) from the still PNG.
 * Uses ffmpeg-static — no system ffmpeg required.
 *
 * Usage: node scripts/generate-hero-loop.mjs
 */

import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "images", "home-hero-woman.png");
const OUT_DIR = path.join(ROOT, "public", "images");

const FILTER =
  "scale=2400:-1,zoompan=z='1.06+0.05*sin(2*PI*on/96)':x='iw/2-(iw/zoom/2)+28*sin(2*PI*on/96)':y='ih/2-(ih/zoom/2)+18*cos(2*PI*on/96)':d=96:s=960x1280:fps=24,format=yuv420p,eq=brightness='0.04*sin(2*PI*t/3.2)':contrast=1.02:saturation=1.05";

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Generating home-hero-loop.webm …");
run([
  "-y", "-loop", "1", "-i", SRC, "-t", "4",
  "-vf", FILTER, "-an",
  "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-row-mt", "1",
  path.join(OUT_DIR, "home-hero-loop.webm"),
]);

console.log("Generating home-hero-loop.mp4 …");
run([
  "-y", "-loop", "1", "-i", SRC, "-t", "4",
  "-vf", FILTER, "-an",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", "-preset", "slow",
  "-movflags", "+faststart",
  path.join(OUT_DIR, "home-hero-loop.mp4"),
]);

console.log("Done.");
