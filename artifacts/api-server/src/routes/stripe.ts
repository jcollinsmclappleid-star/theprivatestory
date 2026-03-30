import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { db, usersTable } from "@workspace/db";
import { eq, sql as drizzleSql } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID;
const STRIPE_ADDON_PRICE_ID = process.env.STRIPE_ADDON_PRICE_ID;
const SITE_URL = process.env.SITE_URL ?? "https://theprivatestory.com";

function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });
}

function requireAuth(req: Request, res: Response): string | null {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  return req.user?.id ?? null;
}

// ---------------------------------------------------------------------------
// POST /api/stripe/create-checkout-session
// Creates a Stripe Checkout session for monthly, annual, or addon purchase.
// ---------------------------------------------------------------------------
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment processing is not yet configured. Please contact support@theprivatestory.com." });
    return;
  }

  const { plan } = req.body as { plan: "monthly" | "annual" | "addon" };
  if (!plan || !["monthly", "annual", "addon"].includes(plan)) {
    res.status(400).json({ error: "Invalid plan. Choose monthly, annual, or addon." });
    return;
  }

  const priceId = plan === "monthly" ? STRIPE_MONTHLY_PRICE_ID
    : plan === "annual" ? STRIPE_ANNUAL_PRICE_ID
    : STRIPE_ADDON_PRICE_ID;

  if (!priceId) {
    res.status(503).json({ error: "This plan is not yet available. Please contact support@theprivatestory.com." });
    return;
  }

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    let customerId = user.stripeCustomerId ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await db.update(usersTable).set({ stripeCustomerId: customerId }).where(eq(usersTable.id, userId));
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === "addon" ? "payment" : "subscription",
      success_url: `${SITE_URL}/me?checkout=success`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { userId, plan },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err, userId, plan }, "[stripe] Failed to create checkout session");
    res.status(500).json({ error: "Failed to start checkout. Please try again or contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/stripe/portal
// Creates a Stripe Customer Portal session for managing subscriptions.
// ---------------------------------------------------------------------------
router.get("/portal", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment processing is not yet configured." });
    return;
  }

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No billing account found. Please subscribe first." });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${SITE_URL}/me`,
    });
    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err, userId }, "[stripe] Failed to create portal session");
    res.status(500).json({ error: "Failed to open billing portal. Please contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/webhook
// Handles Stripe webhook events — raw body required (mounted in app.ts).
// ---------------------------------------------------------------------------
export async function stripeWebhookHandler(req: Request, res: Response) {
  const stripe = getStripe();
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: "Webhook not configured." });
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header." });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, "[stripe-webhook] Signature verification failed");
    res.status(400).json({ error: "Webhook signature verification failed." });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "monthly" | "annual" | "addon" | undefined;
        if (!userId || !plan) break;

        if (plan === "addon") {
          // Credit 1 addon story — increments the remaining addon counter
          await db
            .update(usersTable)
            .set({
              addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1`,
            })
            .where(eq(usersTable.id, userId));
          logger.info({ userId }, "[stripe-webhook] Addon story credited (+1)");
        } else {
          const isMonthly = plan === "monthly";
          const renewDate = new Date();
          renewDate.setMonth(renewDate.getMonth() + (isMonthly ? 1 : 12));

          await db
            .update(usersTable)
            .set({
              subscriptionPlan: plan,
              subscriptionStatus: "active",
              stripeSubscriptionId: session.subscription as string ?? undefined,
              subscriptionStartDate: new Date(),
              subscriptionRenewDate: renewDate,
              storiesGeneratedThisMonth: 0,
              storiesGeneratedThisYear: 0,
            })
            .where(eq(usersTable.id, userId));
          logger.info({ userId, plan }, "[stripe-webhook] Subscription activated");
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await db.select()
          .from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub.id))
          .then(r => r[0]);
        if (!user) break;

        const status = sub.status as string;
        await db.update(usersTable).set({
          subscriptionStatus: ["active", "past_due", "canceled", "incomplete", "trialing"].includes(status)
            ? (status as "active" | "past_due" | "canceled" | "incomplete" | "trialing")
            : undefined,
        }).where(eq(usersTable.id, user.id));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await db.select()
          .from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub.id))
          .then(r => r[0]);
        if (!user) break;

        await db.update(usersTable).set({
          subscriptionPlan: "free",
          subscriptionStatus: "canceled",
        }).where(eq(usersTable.id, user.id));
        logger.info({ userId: user.id }, "[stripe-webhook] Subscription canceled — reverted to free");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!sub) break;
        const user = await db.select()
          .from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub))
          .then(r => r[0]);
        if (!user) break;
        await db.update(usersTable).set({ subscriptionStatus: "past_due" }).where(eq(usersTable.id, user.id));
        logger.warn({ userId: user.id }, "[stripe-webhook] Invoice payment failed — subscription past_due");
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err, eventType: event.type }, "[stripe-webhook] Handler error");
    res.status(500).json({ error: "Webhook handler failed." });
  }
}

export default router;
