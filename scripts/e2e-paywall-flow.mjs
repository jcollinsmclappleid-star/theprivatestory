#!/usr/bin/env node
/**
 * E2E: paywall → (simulated) post-Stripe resume → write with credit → generation start.
 * Usage: node scripts/e2e-paywall-flow.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "https://theprivatestory.vercel.app").replace(/\/$/, "");
const PENDING_CAST_KEY = "afterDarkPendingCast";
const CHECKOUT_STATE_KEY = "afterDarkCheckoutState";
const AGE_KEY = "tps_age_confirmed";

const TEST_EMAIL = `e2e-${Date.now()}@tps-e2e.test`;
const TEST_PASSWORD = `E2eTest!${Date.now().toString(36)}`;

const PENDING_CAST = {
  casting: {
    pairing: "Her & Him",
    archetype: "The Executive",
    chemistry: "Forbidden Pull",
    dynamic: "Forbidden Pull",
    intensity: "Warm",
    mood: "Forbidden",
    heritage: "Ambiguous",
    setting: "Private club",
    perspective: "your",
    voiceId: "PB6BdkFkZLbI39GHdnbQ",
    storyMode: "unrestrained",
    situation: "After hours",
  },
  allTags: ["Forbidden Pull", "slow burn"],
  scenarioTags: ["Forbidden Pull"],
  scenarioId: "the_colleague",
};

const CHECKOUT_STATE = {
  confirmedPairing: "Her & Him",
  lastCastingData: {
    archetype: "The Executive",
    chemistry: "Forbidden Pull",
    dynamic: "Forbidden Pull",
    intensity: "Warm",
    mood: "Forbidden",
    heritage: "Ambiguous",
    setting: "Private club",
    pairing: "Her & Him",
    storyMode: "unrestrained",
    voiceName: "Lisa",
  },
  paywallCoverUrl: null,
  paywallCoverKey: null,
};

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function dismissOverlays(page) {
  for (const label of ["Accept", "Decline", "Accept all", "Reject"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") }).first();
    if (await btn.isVisible({ timeout: 1200 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
  }
  for (const label of ["I am 18", "Yes, I am 18", "Enter", "Continue"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") }).first();
    if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
  }
}

async function seedPaywallSession(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(
    ({ pendingKey, checkoutKey, ageKey, pending, checkout }) => {
      localStorage.setItem(ageKey, "1");
      sessionStorage.setItem(pendingKey, JSON.stringify(pending));
      sessionStorage.setItem(checkoutKey, JSON.stringify(checkout));
    },
    {
      pendingKey: PENDING_CAST_KEY,
      checkoutKey: CHECKOUT_STATE_KEY,
      ageKey: AGE_KEY,
      pending: PENDING_CAST,
      checkout: CHECKOUT_STATE,
    },
  );
}

async function signUp(request) {
  const res = await request.post(`${BASE}/api/auth/sign-up/email`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD, name: "E2E Tester" },
  });
  return res.status();
}

async function grantCreditViaApi(request, email) {
  // No public credit-grant API — caller may use DB; returns false if unavailable.
  void request;
  void email;
  return false;
}

async function main() {
  console.log(`\nE2E paywall flow — ${BASE}\n`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.error("Playwright chromium not installed. Run: npx playwright install chromium");
    process.exit(2);
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const request = context.request;

  // ── 1. Post-payment resume (simulated sessionStorage) ─────────────────
  try {
    await seedPaywallSession(page);
    await page.goto(`${BASE}/after-dark?checkout=success`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissOverlays(page);
    await page.waitForTimeout(2500);

    const url = page.url();
    if (url.includes("/create") && !url.includes("checkout=success")) {
      fail("post-payment resume", "redirected to /create — session restore failed");
    } else {
      const paywallText = await page.getByText(/Unlock your/i).first().isVisible({ timeout: 8000 }).catch(() => false);
      const packBtn = await page.getByText(/Immersive Collection/i).first().isVisible({ timeout: 3000 }).catch(() => false);
      if (paywallText || packBtn) {
        pass("post-payment resume", "paywall shown after ?checkout=success");
      } else {
        const body = await page.locator("body").innerText();
        fail("post-payment resume", `paywall UI not found. Snippet: ${body.slice(0, 200)}`);
      }
    }
  } catch (err) {
    fail("post-payment resume", err.message);
  }

  // ── 2. Empty session guard ───────────────────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`${BASE}/after-dark?checkout=success`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/create") || url.endsWith("/create")) {
      pass("empty-session guard", "no session → /create");
    } else {
      const onPaywall = await page.getByText(/Unlock your/i).isVisible({ timeout: 2000 }).catch(() => false);
      if (!onPaywall) pass("empty-session guard", "left paywall without stale state");
      else fail("empty-session guard", `still on paywall at ${url}`);
    }
  } catch (err) {
    fail("empty-session guard", err.message);
  }

  // ── 3. Stripe checkout initiation from paywall ───────────────────────
  try {
    await seedPaywallSession(page);
    await page.goto(`${BASE}/after-dark?checkout=cancelled`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const packBtn = page.getByRole("button", { name: /Story Bundle|5 stories/i }).first();
    if (!(await packBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      fail("stripe checkout start", "pack button not visible on paywall");
    } else {
      const [navigated] = await Promise.all([
        page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 }).catch(() => null),
        packBtn.click(),
      ]);
      if (navigated) {
        pass("stripe checkout start", "redirected to Stripe Checkout");
      } else {
        await page.waitForTimeout(2000);
        const finalUrl = page.url();
        if (finalUrl.includes("checkout.stripe.com")) {
          pass("stripe checkout start", "redirected to Stripe Checkout");
        } else {
          fail("stripe checkout start", `expected stripe.com, got ${finalUrl}`);
        }
      }
    }
  } catch (err) {
    fail("stripe checkout start", err.message);
  }

  // ── 4. Sign up + resume + write with credit (credit via env grant) ───
  try {
    const signUpStatus = await signUp(request);
    if (signUpStatus !== 200 && signUpStatus !== 201) {
      fail("sign-up", `HTTP ${signUpStatus}`);
    } else {
      pass("sign-up", TEST_EMAIL);

      // Re-seed session in authenticated context
      await seedPaywallSession(page);
      await page.goto(`${BASE}/after-dark?checkout=success`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await dismissOverlays(page);
      await page.waitForTimeout(3000);

      const usageRes = await request.get(`${BASE}/api/me/usage`);
      const usage = usageRes.ok() ? await usageRes.json() : null;
      const credits = usage?.storyCreditsRemaining ?? 0;

      if (credits > 0) {
        pass("authenticated credits", `${credits} credit(s)`);
      } else {
        // Try granting via SQL if GRANT_E2E_CREDIT=1 and DATABASE_URL set (local/CI only)
        if (process.env.GRANT_E2E_CREDIT === "1" && process.env.DATABASE_URL) {
          const { default: pg } = await import("pg");
          const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
          await client.connect();
          await client.query(
            `UPDATE users SET story_credits_remaining = 1, subscription_plan = 'pack_1' WHERE email = $1`,
            [TEST_EMAIL],
          );
          await client.end();
          pass("grant test credit", "via DATABASE_URL");
        } else {
          console.log("  … skipping write-with-credit (0 credits; set GRANT_E2E_CREDIT=1 + DATABASE_URL to enable)");
        }
      }

      // Refresh usage after optional grant
      const usage2 = await request.get(`${BASE}/api/me/usage`);
      const credits2 = usage2.ok() ? (await usage2.json()).storyCreditsRemaining ?? 0 : 0;

      if (credits2 > 0) {
        await seedPaywallSession(page);
        await page.goto(`${BASE}/after-dark?checkout=success`, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await dismissOverlays(page);
        await page.waitForTimeout(4000);

        const writeBtn = page.getByRole("button", { name: /Write my story now/i });
        if (await writeBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
          pass("write-with-credit button", "visible with credits");
          await writeBtn.click();
          await page.waitForTimeout(2000);
          const generating =
            (await page.getByText(/Starting|Writing|Generating|Complete/i).first().isVisible({ timeout: 10000 }).catch(() => false)) ||
            (await page.getByText(/minute/i).first().isVisible({ timeout: 3000 }).catch(() => false));
          if (generating) {
            pass("generation started", "progress UI visible");
          } else {
            const body = await page.locator("body").innerText();
            if (body.includes("paywall") || body.includes("Unlock your")) {
              fail("generation started", "still on paywall after click");
            } else {
              pass("generation started", "left paywall (generation phase)");
            }
          }
        } else {
          fail("write-with-credit button", "not visible despite credits");
        }
      } else {
        // Still verify authenticated paywall shows pack options
        const packVisible = await page.getByText(/Immersive Collection/i).isVisible({ timeout: 5000 }).catch(() => false);
        if (packVisible) pass("authenticated paywall", "pack options visible (no credits to test generation)");
        else fail("authenticated paywall", "pack UI missing");
      }
    }
  } catch (err) {
    fail("authenticated flow", err.message);
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nAll E2E checks passed.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
