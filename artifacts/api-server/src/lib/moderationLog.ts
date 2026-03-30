/**
 * moderationLog — helpers for logging moderation events and enforcing bans.
 *
 * Writes to the moderation_events table and increments blockedGenerationCount
 * on the user when generation is blocked. Fire-and-forget — never throws.
 */

import { db, moderationEvents, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { alertModerationEvent } from "./adminNotify.js";
import { logger } from "./logger.js";

export interface ModerationEventInput {
  userId?: string | null;
  storyId?: string | null;
  requestId?: string | null;
  eventType:
    | "input_blocked"
    | "output_flagged"
    | "output_blocked"
    | "scene_regenerated"
    | "severe_policy_violation";
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  flagsJson?: Record<string, unknown> | null;
  inputSnapshotJson?: Record<string, unknown> | null;
  outputExcerpt?: string | null;
  actionTaken:
    | "allow"
    | "regenerate_scene"
    | "regenerate_story"
    | "block"
    | "review_required";
}

/**
 * Log a moderation event to the DB and fire an email alert if severity is
 * high or critical. Also increments the user's blocked_generation_count when
 * the action taken is "block".
 *
 * This function is fire-and-forget — it never throws.
 */
export async function logModerationEvent(input: ModerationEventInput): Promise<void> {
  try {
    const [event] = await db
      .insert(moderationEvents)
      .values({
        userId: input.userId ?? null,
        storyId: input.storyId ?? null,
        requestId: input.requestId ?? null,
        eventType: input.eventType,
        severity: input.severity,
        reason: input.reason,
        flagsJson: input.flagsJson ?? null,
        inputSnapshotJson: input.inputSnapshotJson ?? null,
        outputExcerpt: input.outputExcerpt ? input.outputExcerpt.slice(0, 800) : null,
        actionTaken: input.actionTaken,
        emailSent: false,
      })
      .returning();

    if (!event) return;

    // Increment blocked count for the user when generation is actually blocked
    if (input.userId && input.actionTaken === "block") {
      await db
        .update(usersTable)
        .set({ blockedGenerationCount: sql`${usersTable.blockedGenerationCount} + 1` })
        .where(eq(usersTable.id, input.userId));
    }

    // Send email alert for high / critical severity events
    const shouldEmail = input.severity === "high" || input.severity === "critical";
    alertModerationEvent({
      eventId: event.id,
      userId: input.userId ?? null,
      storyId: input.storyId ?? null,
      eventType: input.eventType,
      severity: input.severity,
      reason: input.reason,
      actionTaken: input.actionTaken,
      createdAt: event.createdAt,
    });

    if (shouldEmail) {
      await db
        .update(moderationEvents)
        .set({ emailSent: true })
        .where(eq(moderationEvents.id, event.id));
    }
  } catch (err) {
    logger.error({ err }, "[moderationLog] Failed to log moderation event");
  }
}

/**
 * Returns true if the given user is banned. Use this in generation endpoints
 * before starting any expensive generation work.
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  try {
    const [user] = await db
      .select({ isBanned: usersTable.isBanned })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    return user?.isBanned ?? false;
  } catch {
    return false;
  }
}
