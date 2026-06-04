import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { logger } from "../lib/logger.js";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const CACHE_TTL_MS = 5 * 60 * 1000;
const FAILURE_RETRY_MS = 30 * 1000;

export type PackPlan = {
  amount: number;
  currency: string;
  display: string;
  interval: "one_time";
  stories: number;
  perStoryDisplay: string;
  afterDark: boolean;
};

export type PlansResponse = {
  pack1: PackPlan;
  pack5: PackPlan;
  pack20: PackPlan;
  currency: "gbp" | "usd";
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

function buildPackPlan(amount: number, currency: string, stories: number, afterDark: boolean): PackPlan {
  const perStory = Math.round(amount / stories);
  return {
    amount,
    currency,
    display: formatCurrency(amount, currency),
    interval: "one_time",
    stories,
    perStoryDisplay: formatCurrency(perStory, currency),
    afterDark,
  };
}

function buildRegionPlans(
  pack1Amount: number,
  pack5Amount: number,
  pack20Amount: number,
  currency: "gbp" | "usd",
): PlansResponse {
  return {
    pack1: buildPackPlan(pack1Amount, currency, 1, false),
    pack5: buildPackPlan(pack5Amount, currency, 5, true),
    pack20: buildPackPlan(pack20Amount, currency, 20, true),
    currency,
    fetchedAt: Date.now(),
  };
}

async function fetchPriceAmount(stripe: Stripe, priceId: string): Promise<number> {
  const price = await stripe.prices.retrieve(priceId);
  if (typeof price.unit_amount !== "number") {
    throw new Error(`Stripe price ${priceId} has no unit_amount`);
  }
  return price.unit_amount;
}

const GBP_FALLBACK: RegionPlans = {
  gbp: buildRegionPlans(1200, 2900, 7900, "gbp"),
  usd: buildRegionPlans(1500, 3900, 9900, "usd"),
};

async function loadPlansFromStripe(): Promise<RegionPlans> {
  if (!STRIPE_SECRET_KEY) {
    logger.warn("STRIPE_SECRET_KEY not configured — using hardcoded pricing fallback");
    return GBP_FALLBACK;
  }

  const single_gbp = process.env.STRIPE_SINGLE_PRICE_ID;
  const five_gbp = process.env.STRIPE_FIVE_PACK_PRICE_ID;
  const coll_gbp = process.env.STRIPE_COLLECTION_PRICE_ID;

  if (!single_gbp || !five_gbp || !coll_gbp) {
    logger.warn("Pack price IDs not configured — using hardcoded pricing fallback");
    return GBP_FALLBACK;
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });

  const single_usd = process.env.STRIPE_SINGLE_PRICE_ID_USD;
  const five_usd = process.env.STRIPE_FIVE_PACK_PRICE_ID_USD;
  const coll_usd = process.env.STRIPE_COLLECTION_PRICE_ID_USD;
  const hasUsd = !!(single_usd && five_usd && coll_usd);

  const ids = [single_gbp, five_gbp, coll_gbp, ...(hasUsd ? [single_usd!, five_usd!, coll_usd!] : [])];
  const amounts = await Promise.all(ids.map((id) => fetchPriceAmount(stripe, id)));

  const gbp = buildRegionPlans(amounts[0], amounts[1], amounts[2], "gbp");
  const usd = hasUsd
    ? buildRegionPlans(amounts[3], amounts[4], amounts[5], "usd")
    : buildRegionPlans(1500, 3900, 9900, "usd");

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
