import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { giftOrders } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router = Router();

export interface GiftOrderPayload {
  recipientType: string;
  occasion?: string;
  yourName: string;
  partnerName: string;
  nickname?: string;
  relationshipDetail?: string;
  specialMemory?: string;
  mood: string;
  setting: string;
  customSetting?: string;
  voicePreference: string;
  storyLength: string;
  addons?: string[];
  giftMessage?: string;
  basePrice: number;
  addonTotal: number;
  finalPrice: number;
}

const REQUIRED_FIELDS: (keyof GiftOrderPayload)[] = [
  "yourName",
  "partnerName",
  "mood",
  "setting",
  "voicePreference",
  "storyLength",
  "finalPrice",
];

function validatePayload(
  body: Partial<GiftOrderPayload>,
): string[] {
  return REQUIRED_FIELDS.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === "",
  );
}

router.post("/orders", async (req: Request, res: Response) => {
  const body = req.body as Partial<GiftOrderPayload>;

  const missing = validatePayload(body);
  if (missing.length > 0) {
    res.status(400).json({
      error: "Missing required fields",
      fields: missing,
    });
    return;
  }

  const userId = req.isAuthenticated() ? req.user.id : null;
  const id = crypto.randomUUID();

  try {
    await db.insert(giftOrders).values({
      id,
      userId,
      recipientType: body.recipientType ?? "",
      occasion: body.occasion ?? "",
      yourName: body.yourName!,
      partnerName: body.partnerName!,
      nickname: body.nickname ?? "",
      relationshipDetail: body.relationshipDetail ?? "",
      specialMemory: body.specialMemory ?? "",
      mood: body.mood!,
      setting: body.setting!,
      customSetting: body.customSetting ?? "",
      voicePreference: body.voicePreference!,
      storyLength: body.storyLength!,
      addons: (body.addons ?? []) as unknown[],
      giftMessage: body.giftMessage ?? "",
      basePrice: String(body.basePrice ?? 0),
      addonTotal: String(body.addonTotal ?? 0),
      finalPrice: String(body.finalPrice!),
      status: "pending_payment",
    });

    logger.info({ orderId: id, userId }, "Gift order created");

    res.status(201).json({ orderId: id, status: "pending_payment" });
  } catch (err) {
    logger.error({ err }, "Failed to create gift order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [order] = await db
      .select()
      .from(giftOrders)
      .where(eq(giftOrders.id, id));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (err) {
    logger.error({ err, orderId: id }, "Failed to fetch gift order");
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/orders/:id/checkout", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [order] = await db
      .select()
      .from(giftOrders)
      .where(eq(giftOrders.id, id));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({
      url: null,
      orderId: id,
      message: "Stripe not yet configured — checkout coming soon",
    });
  } catch (err) {
    logger.error({ err, orderId: id }, "Failed to initiate checkout");
    res.status(500).json({ error: "Failed to initiate checkout" });
  }
});

export default router;
