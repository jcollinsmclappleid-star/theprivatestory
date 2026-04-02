import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { pendingPurchasesTable } from "@workspace/db/schema";
import { eq, sql as drizzleSql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { sendEmail } from "../lib/email.js";

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID;
const STRIPE_ADDON_PRICE_ID = process.env.STRIPE_ADDON_PRICE_ID;
const STRIPE_IMMERSIVE_PRICE_ID = process.env.STRIPE_IMMERSIVE_PRICE_ID;
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
// Supports both authenticated and guest (unauthenticated) checkout.
// Authenticated: credits applied immediately via webhook.
// Guest: a claimToken is generated, a pendingPurchase record is created, and
//   the token is embedded in the success URL so the user can claim after signup.
// ---------------------------------------------------------------------------
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment processing is not yet configured. Please contact support@theprivatestory.com." });
    return;
  }

  const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated());
  const userId = isAuthenticated ? (req.user?.id ?? null) : null;

  const { plan, email } = req.body as { plan: "monthly" | "annual" | "addon" | "immersive"; email?: string };
  if (!plan || !["monthly", "annual", "addon", "immersive"].includes(plan)) {
    res.status(400).json({ error: "Invalid plan. Choose monthly, annual, addon, or immersive." });
    return;
  }

  // Addon stories require an active subscription — always requires auth
  if (plan === "addon") {
    if (!userId) {
      res.status(401).json({ error: "Please sign in to purchase additional stories." });
      return;
    }
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    const hasActiveSub = user?.subscriptionStatus === "active" && user?.subscriptionPlan && user.subscriptionPlan !== "free";
    if (!hasActiveSub) {
      res.status(403).json({ error: "Additional stories are available to active subscribers only. Please subscribe to a monthly or annual plan first." });
      return;
    }
  }

  const priceId = plan === "monthly" ? STRIPE_MONTHLY_PRICE_ID
    : plan === "annual" ? STRIPE_ANNUAL_PRICE_ID
    : plan === "immersive" ? STRIPE_IMMERSIVE_PRICE_ID
    : STRIPE_ADDON_PRICE_ID;

  if (!priceId) {
    res.status(503).json({ error: "This plan is not yet available. Please contact support@theprivatestory.com." });
    return;
  }

  try {
    // ---- AUTHENTICATED FLOW ----
    if (userId) {
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
        line_items: [{ price: priceId, quantity: 1 }],
        mode: (plan === "addon" || plan === "immersive") ? "payment" : "subscription",
        success_url: `${SITE_URL}/me?checkout=success`,
        cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
        allow_promotion_codes: true,
        metadata: { userId, plan },
      };

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ url: session.url });
      return;
    }

    // ---- GUEST FLOW ----
    const guestEmail = (email ?? "").trim().toLowerCase();
    if (!guestEmail || !guestEmail.includes("@")) {
      res.status(400).json({ error: "Please provide a valid email address to continue." });
      return;
    }

    // Generate a secure claim token BEFORE creating the Stripe session so it can
    // be embedded directly in the success URL.
    const claimToken = randomUUID();

    // Create Stripe customer with email so they can recover if needed
    const customer = await stripe.customers.create({
      email: guestEmail,
      metadata: { guestCheckout: "true" },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day claim window

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      customer_email: undefined, // customer already set
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === "immersive" ? "payment" : "subscription",
      success_url: `${SITE_URL}/checkout/success?token=${claimToken}`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { guestToken: claimToken, plan, guestEmail },
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    // Create the pending purchase record
    await db.insert(pendingPurchasesTable).values({
      claimToken,
      stripeSessionId: stripeSession.id,
      stripeCustomerId: customer.id,
      customerEmail: guestEmail,
      plan: plan as "monthly" | "annual" | "immersive",
      confirmed: false,
      expiresAt,
    });

    logger.info({ guestEmail, plan, claimToken }, "[stripe] Guest checkout session created");
    res.json({ url: stripeSession.url });
  } catch (err) {
    logger.error({ err, userId, plan }, "[stripe] Failed to create checkout session");
    res.status(500).json({ error: "Failed to start checkout. Please try again or contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/stripe/pending-claim/:token
// Returns the status of a pending purchase by claim token.
// Public — used by the /checkout/success page to show appropriate state.
// ---------------------------------------------------------------------------
router.get("/pending-claim/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) {
    res.status(400).json({ error: "Token required." });
    return;
  }

  try {
    const [purchase] = await db
      .select({
        plan: pendingPurchasesTable.plan,
        confirmed: pendingPurchasesTable.confirmed,
        claimed: pendingPurchasesTable.claimed,
        customerEmail: pendingPurchasesTable.customerEmail,
        expiresAt: pendingPurchasesTable.expiresAt,
      })
      .from(pendingPurchasesTable)
      .where(eq(pendingPurchasesTable.claimToken, token));

    if (!purchase) {
      res.status(404).json({ error: "Purchase not found or token invalid." });
      return;
    }

    if (new Date() > purchase.expiresAt) {
      res.status(410).json({ error: "This claim link has expired. Please contact support@theprivatestory.com." });
      return;
    }

    res.json({
      plan: purchase.plan,
      confirmed: purchase.confirmed,
      claimed: purchase.claimed,
      customerEmail: purchase.customerEmail,
    });
  } catch (err) {
    logger.error({ err, token }, "[stripe] Failed to check pending claim");
    res.status(500).json({ error: "Failed to check purchase status." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/claim
// Requires auth. Applies a pending guest purchase to the authenticated user.
// ---------------------------------------------------------------------------
router.post("/claim", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { token } = req.body as { token: string };
  if (!token) {
    res.status(400).json({ error: "Claim token is required." });
    return;
  }

  try {
    const [purchase] = await db
      .select()
      .from(pendingPurchasesTable)
      .where(eq(pendingPurchasesTable.claimToken, token));

    if (!purchase) {
      res.status(404).json({ error: "Purchase not found or token invalid." });
      return;
    }

    if (purchase.claimed) {
      res.status(409).json({ error: "This purchase has already been claimed." });
      return;
    }

    if (new Date() > purchase.expiresAt) {
      res.status(410).json({ error: "This claim link has expired. Please contact support@theprivatestory.com." });
      return;
    }

    // If not yet confirmed by webhook, do a live check with Stripe
    if (!purchase.confirmed) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(purchase.stripeSessionId);
          if (session.payment_status === "paid" || session.status === "complete") {
            await db
              .update(pendingPurchasesTable)
              .set({ confirmed: true })
              .where(eq(pendingPurchasesTable.claimToken, token));
          } else {
            res.status(402).json({ error: "Payment not yet confirmed. Please try again in a moment." });
            return;
          }
        } catch {
          res.status(402).json({ error: "Payment not yet confirmed. Please try again in a moment." });
          return;
        }
      } else {
        res.status(402).json({ error: "Payment not yet confirmed. Please try again in a moment." });
        return;
      }
    }

    // Apply credits to user account
    const plan = purchase.plan;
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (plan === "immersive") {
      // Only set subscriptionPlan to "immersive" if user doesn't already have an active
      // monthly/annual subscription — immersive must never downgrade a paid plan.
      const hasActiveSub = user.subscriptionStatus === "active" &&
        (user.subscriptionPlan === "monthly" || user.subscriptionPlan === "annual");
      await db
        .update(usersTable)
        .set({
          ...(hasActiveSub ? {} : { subscriptionPlan: "immersive" }),
          addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1`,
          stripeCustomerId: user.stripeCustomerId ?? purchase.stripeCustomerId,
        })
        .where(eq(usersTable.id, userId));
      logger.info({ userId, hasActiveSub }, "[stripe-claim] Immersive entry credited");
    } else {
      const isMonthly = plan === "monthly";
      const renewDate = new Date();
      renewDate.setMonth(renewDate.getMonth() + (isMonthly ? 1 : 12));

      await db
        .update(usersTable)
        .set({
          subscriptionPlan: plan,
          subscriptionStatus: "active",
          subscriptionStartDate: new Date(),
          subscriptionRenewDate: renewDate,
          storiesGeneratedThisMonth: 0,
          storiesGeneratedThisYear: 0,
          stripeCustomerId: user.stripeCustomerId ?? purchase.stripeCustomerId,
          ...(purchase.stripeSubscriptionId ? { stripeSubscriptionId: purchase.stripeSubscriptionId } : {}),
        })
        .where(eq(usersTable.id, userId));
      logger.info({ userId, plan }, "[stripe-claim] Subscription activated via claim");
    }

    // Mark purchase as claimed
    await db
      .update(pendingPurchasesTable)
      .set({
        claimed: true,
        claimedByUserId: userId,
        claimedAt: new Date(),
      })
      .where(eq(pendingPurchasesTable.claimToken, token));

    res.json({ success: true, plan });
  } catch (err) {
    logger.error({ err, userId, token }, "[stripe] Failed to claim purchase");
    res.status(500).json({ error: "Failed to claim purchase. Please contact support@theprivatestory.com." });
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
// POST /api/stripe/cancel-subscription
// ---------------------------------------------------------------------------
router.post("/cancel-subscription", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment processing is not yet configured." });
    return;
  }

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    if (!user.stripeSubscriptionId) {
      res.status(400).json({ error: "No active subscription found." });
      return;
    }
    if (user.subscriptionStatus === "canceled") {
      res.status(400).json({ error: "Subscription is already canceled." });
      return;
    }
    if (user.subscriptionStatus === "canceling") {
      res.status(400).json({ error: "Cancellation is already scheduled." });
      return;
    }

    const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;

    await db.update(usersTable).set({
      subscriptionStatus: "canceling",
      subscriptionCancelAt: cancelAt,
    }).where(eq(usersTable.id, userId));

    logger.info({ userId, cancelAt }, "[stripe] Subscription cancellation scheduled");
    res.json({ success: true, cancelAt: cancelAt ? cancelAt.toISOString() : null });
  } catch (err) {
    logger.error({ err, userId }, "[stripe] Failed to cancel subscription");
    res.status(500).json({ error: "Failed to cancel subscription. Please contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/reactivate-subscription
// ---------------------------------------------------------------------------
router.post("/reactivate-subscription", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment processing is not yet configured." });
    return;
  }

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    if (!user?.stripeSubscriptionId) {
      res.status(400).json({ error: "No active subscription found." });
      return;
    }
    if (user.subscriptionStatus !== "canceling") {
      res.status(400).json({ error: "Subscription is not scheduled for cancellation." });
      return;
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await db.update(usersTable).set({
      subscriptionStatus: "active",
      subscriptionCancelAt: null,
    }).where(eq(usersTable.id, userId));

    logger.info({ userId }, "[stripe] Subscription reactivated");
    res.json({ success: true });
  } catch (err) {
    logger.error({ err, userId }, "[stripe] Failed to reactivate subscription");
    res.status(500).json({ error: "Failed to reactivate subscription. Please contact support@theprivatestory.com." });
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
        const guestToken = session.metadata?.guestToken;
        const plan = session.metadata?.plan as "monthly" | "annual" | "addon" | "immersive" | undefined;
        const guestEmail = session.metadata?.guestEmail;

        if (!plan) break;

        if (userId) {
          // Authenticated purchase — apply credits directly
          if (plan === "addon") {
            // Add-on story for active subscribers
            await db
              .update(usersTable)
              .set({ addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1` })
              .where(eq(usersTable.id, userId));
            logger.info({ userId, plan }, "[stripe-webhook] Addon story credited (+1)");
          } else if (plan === "immersive") {
            // One-time immersive entry: credit 1 story. Only set subscriptionPlan to "immersive"
            // if the user doesn't already have an active monthly/annual subscription —
            // immersive must never downgrade a paid plan.
            const immersiveUser = await db
              .select({ subscriptionPlan: usersTable.subscriptionPlan, subscriptionStatus: usersTable.subscriptionStatus })
              .from(usersTable)
              .where(eq(usersTable.id, userId))
              .then(r => r[0]);
            const hasActiveSub = immersiveUser?.subscriptionStatus === "active" &&
              (immersiveUser?.subscriptionPlan === "monthly" || immersiveUser?.subscriptionPlan === "annual");
            await db
              .update(usersTable)
              .set({
                ...(hasActiveSub ? {} : { subscriptionPlan: "immersive" }),
                addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1`,
              })
              .where(eq(usersTable.id, userId));
            logger.info({ userId, hasActiveSub }, "[stripe-webhook] Immersive entry activated");
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
        } else if (guestToken) {
          // Guest purchase — mark as confirmed so claim endpoint accepts it
          const stripeSubId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          await db
            .update(pendingPurchasesTable)
            .set({
              confirmed: true,
              ...(stripeSubId ? { stripeSubscriptionId: stripeSubId } : {}),
            })
            .where(eq(pendingPurchasesTable.claimToken, guestToken));
          logger.info({ guestToken, plan, guestEmail }, "[stripe-webhook] Guest purchase confirmed");

          // Send claim email to the guest
          if (guestEmail) {
            const claimUrl = `${SITE_URL}/checkout/success?token=${guestToken}`;
            const planLabel = plan === "immersive" ? "a single Immersive Story" : plan === "monthly" ? "a monthly subscription (5 stories/month)" : "an annual subscription (50 stories/year)";
            await sendEmail({
              to: guestEmail,
              subject: "Your My Private Story purchase is confirmed",
              text: `Your payment for ${planLabel} is confirmed.\n\nCreate your account to start listening:\n${claimUrl}\n\nThis link is valid for 30 days.\n\nIf you have any questions, please contact support@theprivatestory.com.`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
                  <p style="font-size:18px;font-weight:600;margin-bottom:8px">Your purchase is confirmed.</p>
                  <p style="color:#555;margin-bottom:24px">You've purchased ${planLabel}. Create your account below to access your story.</p>
                  <a href="${claimUrl}" style="display:inline-block;background:#c9a227;color:#fff;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:14px">Create your account</a>
                  <p style="color:#888;font-size:12px;margin-top:24px">This link is valid for 30 days. If you didn't make this purchase, please contact <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a>.</p>
                </div>
              `,
            });
          }
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

        const rawStatus = sub.status as string;
        const isCancelingAtPeriodEnd = sub.cancel_at_period_end === true;

        let resolvedStatus: "active" | "past_due" | "canceled" | "incomplete" | "trialing" | "canceling" | undefined;
        if (isCancelingAtPeriodEnd && rawStatus === "active") {
          resolvedStatus = "canceling";
        } else if (["active", "past_due", "canceled", "incomplete", "trialing"].includes(rawStatus)) {
          resolvedStatus = rawStatus as "active" | "past_due" | "canceled" | "incomplete" | "trialing";
        }

        const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;

        await db.update(usersTable).set({
          subscriptionStatus: resolvedStatus,
          subscriptionCancelAt: isCancelingAtPeriodEnd ? cancelAt : null,
        }).where(eq(usersTable.id, user.id));
        logger.info({ userId: user.id, status: resolvedStatus, cancelAt }, "[stripe-webhook] Subscription updated");
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

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!sub) break;
        if ((event.data.object as Stripe.Invoice).billing_reason !== "subscription_cycle") break;
        const user = await db.select()
          .from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub))
          .then(r => r[0]);
        if (!user || user.subscriptionPlan !== "monthly") break;
        const unused = Math.max(0, 5 - (user.storiesGeneratedThisMonth ?? 0));
        const newRollover = Math.min(10, (user.rolloverCredits ?? 0) + unused);
        const newRenewDate = new Date();
        newRenewDate.setMonth(newRenewDate.getMonth() + 1);
        await db.update(usersTable).set({
          storiesGeneratedThisMonth: 0,
          rolloverCredits: newRollover,
          subscriptionRenewDate: newRenewDate,
        }).where(eq(usersTable.id, user.id));
        logger.info({ userId: user.id, unused, newRollover }, "[stripe-webhook] Monthly renewal — rollover computed");
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
