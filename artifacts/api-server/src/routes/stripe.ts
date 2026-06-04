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
const SITE_URL = process.env.SITE_URL ?? "https://theprivatestory.com";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@theprivatestory.com";

type PackPlan = "pack_1" | "pack_5" | "pack_24";
type LegacyPlan = "monthly" | "annual" | "addon" | "immersive";
type AnyPlan = PackPlan | LegacyPlan;

const PACK_CREDITS: Record<PackPlan, number> = {
  pack_1: 1,
  pack_5: 5,
  pack_24: 24,
};

function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });
}

function getCurrency(req: Request): "gbp" | "usd" {
  const c = (req.body?.currency as string ?? "").toLowerCase();
  return c === "usd" ? "usd" : "gbp";
}

/** Resolve the Stripe price ID for a credit pack and currency. */
function resolvePackPriceId(plan: PackPlan, currency: "gbp" | "usd"): string | null {
  if (currency === "usd") {
    const id =
      plan === "pack_1" ? process.env.STRIPE_SINGLE_PRICE_ID_USD :
      plan === "pack_5" ? process.env.STRIPE_FIVE_PACK_PRICE_ID_USD :
      process.env.STRIPE_COLLECTION_PRICE_ID_USD;
    if (id) return id;
  }
  const id =
    plan === "pack_1" ? process.env.STRIPE_SINGLE_PRICE_ID :
    plan === "pack_5" ? process.env.STRIPE_FIVE_PACK_PRICE_ID :
    process.env.STRIPE_COLLECTION_PRICE_ID;
  return id ?? null;
}

/** Resolve the Stripe price ID for legacy subscription plans. */
async function resolveLegacyPriceId(
  stripe: Stripe,
  plan: "monthly" | "annual",
  currency: "gbp" | "usd",
): Promise<string | null> {
  if (currency === "usd") {
    const usdId =
      plan === "monthly"
        ? (process.env.STRIPE_MONTHLY_PRICE_ID_USD ?? null)
        : (process.env.STRIPE_ANNUAL_PRICE_ID_USD ?? null);
    if (usdId) return usdId;
  }
  const fromEnv = plan === "monthly"
    ? (process.env.STRIPE_MONTHLY_PRICE_ID ?? null)
    : (process.env.STRIPE_ANNUAL_PRICE_ID ?? null);
  if (fromEnv) return fromEnv;

  try {
    const results = await stripe.prices.search({
      query: `metadata["tps_plan"]:"${plan}" AND active:"true"`,
      limit: 1,
    });
    if (results.data.length > 0) return results.data[0].id;
  } catch {
    // nothing
  }
  return null;
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
// ---------------------------------------------------------------------------
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment processing is not yet configured. Please contact support@theprivatestory.com." });
    return;
  }

  const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated());
  const userId = isAuthenticated ? (req.user?.id ?? null) : null;

  const { plan, returnPath, currency: rawCurrency } = req.body as { plan: AnyPlan; returnPath?: string; currency?: string };

  const validPlans: AnyPlan[] = ["pack_1", "pack_5", "pack_24", "monthly", "annual", "addon", "immersive"];
  if (!plan || !validPlans.includes(plan)) {
    res.status(400).json({ error: "Invalid plan." });
    return;
  }

  // New recurring/legacy purchases are no longer accepted — only credit packs.
  // Portal, cancellation, and reactivation routes remain for existing subscribers.
  const LEGACY_PURCHASE_PLANS = new Set(["monthly", "annual", "addon", "immersive"]);
  if (LEGACY_PURCHASE_PLANS.has(plan)) {
    res.status(410).json({ error: "Subscription plans are no longer available. Please choose a credit pack from the pricing page." });
    return;
  }

  const isValidReturnPath = typeof returnPath === "string" && returnPath.startsWith("/") && !returnPath.startsWith("//") && !/^\/[a-zA-Z][a-zA-Z0-9+-.]*:/.test(returnPath);
  const cancelUrl = isValidReturnPath ? `${SITE_URL}${returnPath}?checkout=cancelled` : `${SITE_URL}/pricing?checkout=cancelled`;

  const currency = (rawCurrency ?? "gbp").toLowerCase() === "usd" ? "usd" : "gbp";

  // --- Resolve price ID --- (only pack plans reach this point)
  const priceId: string | null = resolvePackPriceId(plan as PackPlan, currency);
  const mode: Stripe.Checkout.SessionCreateParams.Mode = "payment";

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
        if (user.email) {
          const existing = await stripe.customers.search({
            query: `email:"${user.email}" AND metadata["userId"]:"${userId}"`,
            limit: 1,
          });
          if (existing.data.length > 0) customerId = existing.data[0].id;
        }
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: { userId },
          });
          customerId = customer.id;
        }
        await db.update(usersTable).set({ stripeCustomerId: customerId }).where(eq(usersTable.id, userId));
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        success_url: `${SITE_URL}/purchase/confirmed`,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        metadata: { userId, plan },
      };

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ url: session.url });
      return;
    }

    // ---- GUEST FLOW ----
    const claimToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${SITE_URL}/purchase/confirmed?token=${claimToken}`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: { guestToken: claimToken, plan },
      customer_creation: "always",
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    await db.insert(pendingPurchasesTable).values({
      claimToken,
      stripeSessionId: stripeSession.id,
      plan: plan as "monthly" | "annual" | "immersive" | "pack_1" | "pack_5" | "pack_24",
      confirmed: false,
      expiresAt,
    });

    logger.info({ plan, claimToken }, "[stripe] Guest checkout session created");
    res.json({ url: stripeSession.url });
  } catch (err) {
    logger.error({ err, userId, plan }, "[stripe] Failed to create checkout session");
    res.status(500).json({ error: "Failed to start checkout. Please try again or contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/stripe/pending-claim/:token
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
            await db.update(pendingPurchasesTable).set({ confirmed: true }).where(eq(pendingPurchasesTable.claimToken, token));
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

    const plan = purchase.plan;
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Apply credits
    if (plan === "pack_1" || plan === "pack_5" || plan === "pack_24") {
      const credits = PACK_CREDITS[plan as PackPlan];
      await db.update(usersTable).set({
        subscriptionPlan: plan,
        storyCreditsRemaining: drizzleSql`${usersTable.storyCreditsRemaining} + ${credits}`,
        stripeCustomerId: user.stripeCustomerId ?? purchase.stripeCustomerId,
      }).where(eq(usersTable.id, userId));
      logger.info({ userId, plan, credits }, "[stripe-claim] Pack credits applied");
    } else if (plan === "immersive") {
      const hasActiveSub = user.subscriptionStatus === "active" &&
        (user.subscriptionPlan === "monthly" || user.subscriptionPlan === "annual");
      await db.update(usersTable).set({
        ...(hasActiveSub ? {} : { subscriptionPlan: "immersive" }),
        addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1`,
        stripeCustomerId: user.stripeCustomerId ?? purchase.stripeCustomerId,
      }).where(eq(usersTable.id, userId));
      logger.info({ userId, hasActiveSub }, "[stripe-claim] Immersive entry credited");
    } else {
      // Legacy monthly/annual
      const isMonthly = plan === "monthly";
      const renewDate = new Date();
      renewDate.setMonth(renewDate.getMonth() + (isMonthly ? 1 : 12));
      await db.update(usersTable).set({
        subscriptionPlan: plan,
        subscriptionStatus: "active",
        subscriptionStartDate: new Date(),
        subscriptionRenewDate: renewDate,
        storiesGeneratedThisMonth: 0,
        storiesGeneratedThisYear: 0,
        stripeCustomerId: user.stripeCustomerId ?? purchase.stripeCustomerId,
        ...(purchase.stripeSubscriptionId ? { stripeSubscriptionId: purchase.stripeSubscriptionId } : {}),
      }).where(eq(usersTable.id, userId));
      logger.info({ userId, plan }, "[stripe-claim] Subscription activated via claim");
    }

    await db.update(pendingPurchasesTable).set({
      claimed: true,
      claimedByUserId: userId,
      claimedAt: new Date(),
    }).where(eq(pendingPurchasesTable.claimToken, token));

    res.json({ success: true, plan });
  } catch (err) {
    logger.error({ err, userId, token }, "[stripe] Failed to claim purchase");
    res.status(500).json({ error: "Failed to claim purchase. Please contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/stripe/portal — Stripe Customer Portal (legacy subscribers only)
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
      res.status(400).json({ error: "No billing account found." });
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
// POST /api/stripe/cancel-subscription (legacy subscribers)
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
    if (!user) { res.status(404).json({ error: "User not found." }); return; }
    if (!user.stripeSubscriptionId) { res.status(400).json({ error: "No active subscription found." }); return; }
    if (user.subscriptionStatus === "canceled") { res.status(400).json({ error: "Subscription is already canceled." }); return; }
    if (user.subscriptionStatus === "canceling") { res.status(400).json({ error: "Cancellation is already scheduled." }); return; }

    const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
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
// POST /api/stripe/reactivate-subscription (legacy subscribers)
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
    if (!user?.stripeSubscriptionId) { res.status(400).json({ error: "No active subscription found." }); return; }
    if (user.subscriptionStatus !== "canceling") { res.status(400).json({ error: "Subscription is not scheduled for cancellation." }); return; }

    await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: false });
    await db.update(usersTable).set({ subscriptionStatus: "active", subscriptionCancelAt: null }).where(eq(usersTable.id, userId));

    logger.info({ userId }, "[stripe] Subscription reactivated");
    res.json({ success: true });
  } catch (err) {
    logger.error({ err, userId }, "[stripe] Failed to reactivate subscription");
    res.status(500).json({ error: "Failed to reactivate subscription. Please contact support@theprivatestory.com." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/webhook
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
        const plan = session.metadata?.plan as AnyPlan | undefined;
        if (!plan) break;

        const sessionCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer as Stripe.Customer | Stripe.DeletedCustomer | null)?.id ?? null;

        if (userId) {
          // --- Pack plan ---
          if (plan === "pack_1" || plan === "pack_5" || plan === "pack_24") {
            const credits = PACK_CREDITS[plan as PackPlan];
            await db.update(usersTable).set({
              subscriptionPlan: plan,
              storyCreditsRemaining: drizzleSql`${usersTable.storyCreditsRemaining} + ${credits}`,
              ...(sessionCustomerId ? { stripeCustomerId: sessionCustomerId } : {}),
            }).where(eq(usersTable.id, userId));
            logger.info({ userId, plan, credits }, "[stripe-webhook] Pack credits applied");
          } else if (plan === "addon") {
            await db.update(usersTable).set({
              addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1`,
              ...(sessionCustomerId ? { stripeCustomerId: sessionCustomerId } : {}),
            }).where(eq(usersTable.id, userId));
            logger.info({ userId }, "[stripe-webhook] Addon story credited (+1)");
          } else if (plan === "immersive") {
            const immersiveUser = await db
              .select({ subscriptionPlan: usersTable.subscriptionPlan, subscriptionStatus: usersTable.subscriptionStatus })
              .from(usersTable).where(eq(usersTable.id, userId)).then(r => r[0]);
            const hasActiveSub = immersiveUser?.subscriptionStatus === "active" &&
              (immersiveUser?.subscriptionPlan === "monthly" || immersiveUser?.subscriptionPlan === "annual");
            await db.update(usersTable).set({
              ...(hasActiveSub ? {} : { subscriptionPlan: "immersive" }),
              addonStoriesRemaining: drizzleSql`${usersTable.addonStoriesRemaining} + 1`,
              ...(sessionCustomerId ? { stripeCustomerId: sessionCustomerId } : {}),
            }).where(eq(usersTable.id, userId));
            logger.info({ userId, hasActiveSub }, "[stripe-webhook] Immersive entry activated");
          } else {
            // Legacy monthly/annual
            const isMonthly = plan === "monthly";
            const renewDate = new Date();
            renewDate.setMonth(renewDate.getMonth() + (isMonthly ? 1 : 12));
            await db.update(usersTable).set({
              subscriptionPlan: plan,
              subscriptionStatus: "active",
              stripeSubscriptionId: session.subscription as string ?? undefined,
              subscriptionStartDate: new Date(),
              subscriptionRenewDate: renewDate,
              storiesGeneratedThisMonth: 0,
              storiesGeneratedThisYear: 0,
              ...(sessionCustomerId ? { stripeCustomerId: sessionCustomerId } : {}),
            }).where(eq(usersTable.id, userId));
            logger.info({ userId, plan }, "[stripe-webhook] Legacy subscription activated");
          }
        } else if (guestToken) {
          const stripeSubId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          const guestEmail = session.customer_details?.email ?? session.customer_email ?? null;
          const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
          await db.update(pendingPurchasesTable).set({
            confirmed: true,
            ...(guestEmail ? { customerEmail: guestEmail } : {}),
            ...(stripeCustomerId ? { stripeCustomerId } : {}),
            ...(stripeSubId ? { stripeSubscriptionId: stripeSubId } : {}),
          }).where(eq(pendingPurchasesTable.claimToken, guestToken));
          logger.info({ guestToken, plan, guestEmail }, "[stripe-webhook] Guest purchase confirmed");

          if (guestEmail) {
            const claimUrl = `${SITE_URL}/purchase/confirmed?token=${guestToken}`;
            const planLabel =
              plan === "pack_1" ? "Your First Story (1 story credit)" :
              plan === "pack_5" ? "Five Private Stories (5 story credits)" :
              plan === "pack_24" ? "The Full Collection (24 story credits)" :
              plan === "immersive" ? "a single Immersive Story" :
              plan === "monthly" ? "a monthly subscription (5 stories/month)" :
              "an annual subscription (50 stories/year)";
            await sendEmail({
              to: guestEmail,
              subject: "Your The Private Story purchase is confirmed",
              text: `Your payment for ${planLabel} is confirmed.\n\nCreate your account to start listening:\n${claimUrl}\n\nThis link is valid for 30 days. Your credits never expire.\n\nIf you have any questions, please contact support@theprivatestory.com.`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
                  <p style="font-size:18px;font-weight:600;margin-bottom:8px">Your purchase is confirmed.</p>
                  <p style="color:#555;margin-bottom:24px">You've purchased ${planLabel}. Create your account below to access your stories. Your credits never expire.</p>
                  <a href="${claimUrl}" style="display:inline-block;background:#c9a227;color:#fff;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:14px">Create your account</a>
                  <p style="color:#888;font-size:12px;margin-top:24px">This link is valid for 30 days. If you didn't make this purchase, please contact <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a>.</p>
                </div>
              `,
            });
          }
        }

        // Purchase notification to support
        {
          const planLabel =
            plan === "pack_1" ? "Your First Story — £12/$15" :
            plan === "pack_5" ? "Five Private Stories — £39/$49" :
            plan === "pack_24" ? "The Full Collection — £99/$119" :
            plan === "immersive" ? "Single Story — £7.99" :
            plan === "addon"     ? "Add-on Story — £7.99" :
            plan === "monthly"   ? "Monthly Subscription — £29.99/month" :
            plan === "annual"    ? "Annual Subscription — £179/year" :
            plan;
          const who = session.metadata?.userId ?? session.metadata?.guestToken ?? "unknown";
          const guestEmail = session.customer_details?.email ?? session.customer_email ?? null;
          const text = [
            `New purchase on The Private Story`,
            ``,
            `Plan:     ${planLabel}`,
            `User ID:  ${who}${!session.metadata?.userId ? " (guest — awaiting account claim)" : ""}`,
            ...(guestEmail ? [`Email:    ${guestEmail}`] : []),
            `Time:     ${new Date().toISOString()}`,
            ``,
            `Review: ${SITE_URL}/admin`,
          ].join("\n");
          sendEmail({
            to: SUPPORT_EMAIL,
            subject: `[New Order] ${planLabel} — The Private Story`,
            text,
          }).catch((err) => {
            logger.warn({ err }, "[stripe-webhook] Failed to send purchase notification to support");
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await db.select().from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub.id)).then(r => r[0]);
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
        const user = await db.select().from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub.id)).then(r => r[0]);
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
        if (invoice.billing_reason !== "subscription_cycle") break;
        const user = await db.select().from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub)).then(r => r[0]);
        if (!user || user.subscriptionPlan !== "monthly") break;

        const invoiceId = invoice.id;
        if (invoiceId && user.lastProcessedInvoiceId === invoiceId) {
          logger.info({ userId: user.id, invoiceId }, "[stripe-webhook] invoice.paid already processed — skipping");
          break;
        }

        const now = new Date();
        const lazyResetFired = user.subscriptionRenewDate != null && user.subscriptionRenewDate > now;
        const sourceCount = lazyResetFired
          ? (user.lastPeriodStoriesCount ?? 0)
          : (user.storiesGeneratedThisMonth ?? 0);

        const unused = Math.max(0, 5 - sourceCount);
        const newRollover = Math.min(10, (user.rolloverCredits ?? 0) + unused);

        if (lazyResetFired) {
          await db.update(usersTable).set({
            rolloverCredits: newRollover,
            lastPeriodStoriesCount: 0,
            lastProcessedInvoiceId: invoiceId ?? null,
          }).where(eq(usersTable.id, user.id));
        } else {
          const newRenewDate = new Date();
          newRenewDate.setMonth(newRenewDate.getMonth() + 1);
          await db.update(usersTable).set({
            storiesGeneratedThisMonth: 0,
            rolloverCredits: newRollover,
            subscriptionRenewDate: newRenewDate,
            lastPeriodStoriesCount: 0,
            lastProcessedInvoiceId: invoiceId ?? null,
          }).where(eq(usersTable.id, user.id));
        }

        logger.info({ userId: user.id, sourceCount, unused, newRollover, lazyResetFired }, "[stripe-webhook] Monthly renewal — rollover computed");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!sub) break;
        const user = await db.select().from(usersTable)
          .where(eq(usersTable.stripeSubscriptionId, sub)).then(r => r[0]);
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
