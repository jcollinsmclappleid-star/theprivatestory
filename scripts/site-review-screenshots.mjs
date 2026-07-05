#!/usr/bin/env node
/**
 * Capture live site screenshots for conversion review.
 * Usage: node scripts/site-review-screenshots.mjs [baseUrl]
 */
import { chromium, devices } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] ?? "https://theprivatestory.com";
const OUT = path.join(__dirname, "..", "screenshots", "site-review");

const PAGES = [
  { name: "01-home", path: "/" },
  { name: "02-three-doors", path: "/the-three-doors" },
  { name: "03-after-dark", path: "/after-dark" },
  { name: "04-create", path: "/create" },
  { name: "05-samples", path: "/samples" },
  { name: "06-pricing", path: "/pricing" },
  { name: "07-how-it-works", path: "/how-it-works" },
  { name: "08-quinn-alternative", path: "/quinn-alternative" },
];

async function dismissOverlays(page) {
  // Cookie banner — accept or decline so content is visible
  for (const label of ["Accept", "Decline", "Accept all", "Reject"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") }).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
  }
  // Age gate on samples/create — confirm if shown
  for (const label of ["I am 18", "Yes, I am 18", "Enter", "Continue"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") }).first();
    if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
  }
}

async function shot(page, filePath, fullPage = true) {
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.screenshot({ path: filePath, fullPage });
}

async function runViewport(browser, viewport, label, subdir) {
  const dir = path.join(OUT, subdir);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport,
    userAgent:
      label === "mobile"
        ? devices["iPhone 13"].userAgent
        : undefined,
    isMobile: label === "mobile",
  });
  const page = await context.newPage();

  for (const { name, path: p } of PAGES) {
    const url = `${BASE.replace(/\/$/, "")}${p}`;
    console.log(`[${label}] ${url}`);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await dismissOverlays(page);
      await shot(page, path.join(dir, `${name}-${label}.png`));
      // Hero-only crop for home
      if (p === "/") {
        await page.screenshot({
          path: path.join(dir, `${name}-hero-${label}.png`),
          clip: { x: 0, y: 0, width: viewport.width, height: Math.min(900, viewport.height) },
        });
      }
    } catch (err) {
      console.error(`  failed: ${err.message}`);
    }
  }
  await context.close();
}

const browser = await chromium.launch({ headless: true });
try {
  await runViewport(browser, { width: 1280, height: 900 }, "desktop", "desktop");
  await runViewport(browser, devices["iPhone 13"].viewport, "mobile", "mobile");
  console.log(`\nSaved to ${OUT}`);
} finally {
  await browser.close();
}
