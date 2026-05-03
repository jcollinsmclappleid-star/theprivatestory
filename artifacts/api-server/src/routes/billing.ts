import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { logger } from "../lib/logger.js";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID;
const STRIPE_ADDON_PRICE_ID = process.env.STRIPE_ADDON_PRICE_ID;

const MONTHLY_STORY_ALLOWANCE = 5;
const ANNUAL_STORY_ALLOWANCE = 50;

const CACHE_TTL_MS = 5 * 60 * 1000;
const FAILURE_RETRY_MS = 30 * 1000;

type PlanShape = {
  amount: number;
  currency: string;
  display: string;
  interval: "month" | "year" | "one_time";
};

type PlansResponse = {
  monthly: PlanShape & { storyAllowance: number };
  annual: PlanShape & {
    storyAllowance: number;
    equivalentMonthlyDisplay: string;
    equivalentMonthlyAmount: number;
    savingsVsMonthlyDisplay: string;
    savingsVsMonthlyAmount: number;
  };
  addon: PlanShape;
  fetchedAt: number;
};

let cache: { data: PlansResponse; expiresAt: number } | null = null;
let lastFailureAt = 0;
let inflight: Promise<PlansResponse> | null = null;

function formatGBP(amount: number, currency: string): string {
  if (currency.toLowerCase() !== "gbp") {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
  const major = amount / 100;
  return Number.isInteger(major) ? `£${major}` : `£${major.toFixed(2)}`;
}

async function fetchPrice(stripe: Stripe, priceId: string): Promise<PlanShape> {
  const price = await stripe.prices.retrieve(priceId);
  if (typeof price.unit_amount !== "number") {
    throw new Error(`Stripe price ${priceId} has no unit_amount`);
  }
  const intervalRaw = price.recurring?.interval;
  const interval: PlanShape["interval"] =
    intervalRaw === "month" ? "month" : intervalRaw === "year" ? "year" : "one_time";
  return {
    amount: price.unit_amount,
    currency: price.currency,
    display: formatGBP(price.unit_amount, price.currency),
    interval,
  };
}

async function loadPlansFromStripe(): Promise<PlansResponse> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_ANNUAL_PRICE_ID || !STRIPE_ADDON_PRICE_ID) {
    throw new Error("Stripe price IDs not configured");
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });

  const [monthly, annual, addon] = await Promise.all([
    fetchPrice(stripe, STRIPE_MONTHLY_PRICE_ID),
    fetchPrice(stripe, STRIPE_ANNUAL_PRICE_ID),
    fetchPrice(stripe, STRIPE_ADDON_PRICE_ID),
  ]);

  // Annual derived figures
  const equivalentMonthlyAmount = Math.round(annual.amount / 12);
  const annualMonthlyEquivalentTotal = monthly.amount * 12;
  const savingsVsMonthlyAmount = Math.max(0, annualMonthlyEquivalentTotal - annual.amount);

  return {
    monthly: { ...monthly, storyAllowance: MONTHLY_STORY_ALLOWANCE },
    annual: {
      ...annual,
      storyAllowance: ANNUAL_STORY_ALLOWANCE,
      equivalentMonthlyAmount,
      equivalentMonthlyDisplay: formatGBP(equivalentMonthlyAmount, annual.currency),
      savingsVsMonthlyAmount,
      savingsVsMonthlyDisplay: formatGBP(savingsVsMonthlyAmount, annual.currency),
    },
    addon,
    fetchedAt: Date.now(),
  };
}

async function getPlans(): Promise<PlansResponse> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.data;
  // De-dupe concurrent refreshes
  if (inflight) return inflight;
  // Avoid hammering Stripe on persistent failure — back off briefly
  if (!cache && now - lastFailureAt < FAILURE_RETRY_MS && lastFailureAt !== 0) {
    throw new Error("billing-temporarily-unavailable");
  }
  inflight = (async () => {
    try {
      const fresh = await loadPlansFromStripe();
      cache = { data: fresh, expiresAt: Date.now() + CACHE_TTL_MS };
      return fresh;
    } catch (err) {
      lastFailureAt = Date.now();
      logger.warn({ err }, "billing.getPlans failed");
      if (cache) {
        // serve last-good even if stale
        return cache.data;
      }
      throw err;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

router.get("/plans", async (_req: Request, res: Response) => {
  try {
    const data = await getPlans();
    // 5 minute browser cache; serve stale up to 1 hour while we revalidate.
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json(data);
  } catch (err) {
    logger.error({ err }, "GET /api/billing/plans failed");
    res.status(503).json({ error: "Pricing temporarily unavailable. Please try again shortly." });
  }
});

export default router;
