import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { logger } from "../lib/logger.js";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID;
const STRIPE_ADDON_PRICE_ID = process.env.STRIPE_ADDON_PRICE_ID;
const STRIPE_MONTHLY_PRICE_ID_USD = process.env.STRIPE_MONTHLY_PRICE_ID_USD;
const STRIPE_ANNUAL_PRICE_ID_USD = process.env.STRIPE_ANNUAL_PRICE_ID_USD;
const STRIPE_ADDON_PRICE_ID_USD = process.env.STRIPE_ADDON_PRICE_ID_USD;

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

type RegionPlans = {
  gbp: PlansResponse;
  usd: PlansResponse;
};

let cache: { data: RegionPlans; expiresAt: number } | null = null;
let lastFailureAt = 0;
let inflight: Promise<RegionPlans> | null = null;

function formatCurrency(amount: number, currency: string): string {
  const major = amount / 100;
  switch (currency.toLowerCase()) {
    case "gbp":
      return Number.isInteger(major) ? `£${major}` : `£${major.toFixed(2)}`;
    case "usd":
      return Number.isInteger(major) ? `$${major}` : `$${major.toFixed(2)}`;
    default:
      return `${major.toFixed(2)} ${currency.toUpperCase()}`;
  }
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
    display: formatCurrency(price.unit_amount, price.currency),
    interval,
  };
}

function buildPlansResponse(
  monthly: PlanShape,
  annual: PlanShape,
  addon: PlanShape,
): PlansResponse {
  const equivalentMonthlyAmount = Math.round(annual.amount / 12);
  const annualMonthlyEquivalentTotal = monthly.amount * 12;
  const savingsVsMonthlyAmount = Math.max(0, annualMonthlyEquivalentTotal - annual.amount);
  return {
    monthly: { ...monthly, storyAllowance: MONTHLY_STORY_ALLOWANCE },
    annual: {
      ...annual,
      storyAllowance: ANNUAL_STORY_ALLOWANCE,
      equivalentMonthlyAmount,
      equivalentMonthlyDisplay: formatCurrency(equivalentMonthlyAmount, annual.currency),
      savingsVsMonthlyAmount,
      savingsVsMonthlyDisplay: formatCurrency(savingsVsMonthlyAmount, annual.currency),
    },
    addon,
    fetchedAt: Date.now(),
  };
}

async function loadPlansFromStripe(): Promise<RegionPlans> {
  if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_ANNUAL_PRICE_ID || !STRIPE_ADDON_PRICE_ID) {
    throw new Error("GBP Stripe price IDs not configured");
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });

  const hasUsd = STRIPE_MONTHLY_PRICE_ID_USD && STRIPE_ANNUAL_PRICE_ID_USD && STRIPE_ADDON_PRICE_ID_USD;

  const priceIds = [
    STRIPE_MONTHLY_PRICE_ID,
    STRIPE_ANNUAL_PRICE_ID,
    STRIPE_ADDON_PRICE_ID,
    ...(hasUsd ? [STRIPE_MONTHLY_PRICE_ID_USD!, STRIPE_ANNUAL_PRICE_ID_USD!, STRIPE_ADDON_PRICE_ID_USD!] : []),
  ];

  const prices = await Promise.all(priceIds.map((id) => fetchPrice(stripe, id)));

  const gbp = buildPlansResponse(prices[0], prices[1], prices[2]);
  const usd = hasUsd
    ? buildPlansResponse(prices[3], prices[4], prices[5])
    : gbp;

  return { gbp, usd };
}

async function getPlans(): Promise<RegionPlans> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.data;
  if (inflight) return inflight;
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
      if (cache) return cache.data;
      throw err;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

// GET /api/billing/plans?currency=gbp|usd
// Returns prices for the requested currency. Defaults to GBP.
router.get("/plans", async (req: Request, res: Response) => {
  try {
    const data = await getPlans();
    const currency = (req.query.currency as string ?? "gbp").toLowerCase();
    const plans = currency === "usd" ? data.usd : data.gbp;
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json(plans);
  } catch (err) {
    logger.error({ err }, "GET /api/billing/plans failed");
    res.status(503).json({ error: "Pricing temporarily unavailable. Please try again shortly." });
  }
});

export default router;
