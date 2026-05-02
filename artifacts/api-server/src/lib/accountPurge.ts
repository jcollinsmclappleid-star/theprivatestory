import { and, eq, lt, sql } from "drizzle-orm";
import {
  adminAuditLog,
  baAccountsTable,
  baSessionsTable,
  baTwoFactorTable,
  generatedStories,
  generationJobs,
  giftOrders,
  moderationEvents,
  nameSubmissions,
  series,
  storyReports,
  userLibrary,
  userPresets,
  userProgress,
  userReactionHistory,
  userTaste,
  usersTable,
  db,
} from "@workspace/db";
import { logger } from "./logger.js";
import { deleteAudioFile, deleteImageFile } from "./mediaStorage.js";

/**
 * Hard-purge cut-off. Soft-deleted users older than this are anonymised.
 * 30 days — well within the 90-day promise in the Privacy Policy.
 */
const PURGE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Email marker pattern used to identify already-purged users. Stored in
 * `users.email` after anonymisation. Choosing a pattern (vs. NULL) keeps the
 * row addressable for audit and prevents the unique-constraint surprise that
 * NULL would create if we ever switched databases.
 */
const PURGED_EMAIL = (userId: string) => `purged-${userId}@deleted.local`;
const PURGED_EMAIL_PATTERN = "purged-%@deleted.local";

/**
 * Extract a filename from a media URL of the form `/api/audio/foo.mp3` or
 * `/api/images/bar.png`. Returns null if it doesn't match — we never delete
 * arbitrary URLs (could be a remote image).
 */
function extractMediaFilename(value: unknown, prefix: "audio" | "images"): string | null {
  if (typeof value !== "string") return null;
  const m = value.match(new RegExp(`/api/${prefix}/([^/?#]+)`));
  return m ? m[1] : null;
}

/** Recursively walk a JSON value and collect strings that look like image paths. */
function collectImagePaths(value: unknown, out: Set<string>): void {
  if (value == null) return;
  if (typeof value === "string") {
    const f = extractMediaFilename(value, "images");
    if (f) out.add(f);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectImagePaths(v, out);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectImagePaths(v, out);
  }
}

/**
 * Best-effort cleanup of GCS objects owned by this user before their DB rows
 * are deleted. Runs OUTSIDE the DB transaction (object-storage failures must
 * never roll back the DB purge — orphan media is recoverable, identifiable
 * data on disk is not). Failures are logged and swallowed.
 */
async function purgeUserMedia(userId: string): Promise<void> {
  const audioFilenames = new Set<string>();
  const imageFilenames = new Set<string>();

  try {
    const stories = await db
      .select({ audioUrl: generatedStories.audioUrl, images: generatedStories.images })
      .from(generatedStories)
      .where(eq(generatedStories.ownerUserId, userId));
    for (const s of stories) {
      const a = extractMediaFilename(s.audioUrl, "audio");
      if (a) audioFilenames.add(a);
      collectImagePaths(s.images, imageFilenames);
    }

    const seriesRows = await db
      .select({ coverImage: series.coverImage })
      .from(series)
      .where(eq(series.ownerUserId, userId));
    for (const r of seriesRows) {
      const i = extractMediaFilename(r.coverImage, "images");
      if (i) imageFilenames.add(i);
    }
  } catch (err) {
    logger.warn({ err, userId }, "[account-purge] media enumeration failed; skipping GCS cleanup");
    return;
  }

  for (const f of audioFilenames) await deleteAudioFile(f);
  for (const f of imageFilenames) await deleteImageFile(f);

  if (audioFilenames.size + imageFilenames.size > 0) {
    logger.info(
      { userId, audio: audioFilenames.size, images: imageFilenames.size },
      "[account-purge] Deleted user media from GCS",
    );
  }
}

/**
 * Purge a single user's data:
 *   1. Delete every cascade-eligible row owned by the user.
 *   2. NULL out every set-null FK pointing at the user (audit log,
 *      moderation, gift orders, story reports, name submissions) so the
 *      anonymised user row carries no residual personal linkage.
 *   3. Anonymise the user row in place — wipe every PII column. We CANNOT
 *      delete the user row because consent_log uses onDelete: "restrict"
 *      (legal hold per GDPR Recital 64 + UK Online Safety Act).
 *
 * Wrapped in a single transaction so partial failures roll back cleanly —
 * either the user is fully purged or the next sweep retries them.
 *
 * Idempotent: re-running on an already-anonymised user is safe (deletes are
 * no-ops, NULLs stay NULL, the email marker is rewritten to itself).
 */
export async function purgeOneUser(userId: string): Promise<void> {
  // GCS cleanup is best-effort and runs OUTSIDE the transaction so an object-
  // storage outage doesn't block DB purge.
  await purgeUserMedia(userId);

  await db.transaction(async (tx) => {
    // 1. Cascade child data — every table with onDelete: cascade is also
    //    deleted explicitly so failures surface in logs.
    await tx.delete(generatedStories).where(eq(generatedStories.ownerUserId, userId));
    await tx.delete(series).where(eq(series.ownerUserId, userId));
    await tx.delete(userLibrary).where(eq(userLibrary.userId, userId));
    await tx.delete(userProgress).where(eq(userProgress.userId, userId));
    await tx.delete(userTaste).where(eq(userTaste.userId, userId));
    await tx.delete(userPresets).where(eq(userPresets.userId, userId));
    await tx.delete(userReactionHistory).where(eq(userReactionHistory.userId, userId));
    await tx.delete(generationJobs).where(eq(generationJobs.userId, userId));
    await tx.delete(baSessionsTable).where(eq(baSessionsTable.userId, userId));
    await tx.delete(baAccountsTable).where(eq(baAccountsTable.userId, userId));
    await tx.delete(baTwoFactorTable).where(eq(baTwoFactorTable.userId, userId));

    // 2. Sever every set-null FK. The retained record (e.g. an admin-audit
    //    entry from a moderation action) survives, but the user-id pointer
    //    is wiped so the record cannot be linked back to a person.
    await tx.update(adminAuditLog).set({ actorUserId: null }).where(eq(adminAuditLog.actorUserId, userId));
    await tx.update(giftOrders).set({ userId: null }).where(eq(giftOrders.userId, userId));
    await tx.update(nameSubmissions).set({ submittedByUserId: null }).where(eq(nameSubmissions.submittedByUserId, userId));
    await tx.update(storyReports).set({ userId: null }).where(eq(storyReports.userId, userId));
    await tx.update(moderationEvents).set({ userId: null }).where(eq(moderationEvents.userId, userId));

    // 3. Anonymise the user row in place. consent_log keeps a legal-hold
    //    pointer to users.id, so we cannot DELETE the row.
    await tx
      .update(usersTable)
      .set({
        name: "",
        email: PURGED_EMAIL(userId),
        emailVerified: false,
        image: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        approvedListenerName: null,
        approvedPartnerName: null,
        // Stripe IDs link to billing-side PII; clear from our DB.
        // Stripe-side records persist for the 7-year HMRC retention window.
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        bannedReason: null,
        userCode: null,
      })
      .where(eq(usersTable.id, userId));
  });
}

/**
 * Daily account-purge sweep. Anonymises every user whose deletedAt is older
 * than PURGE_AFTER_MS and whose email is not already a `purged-…@deleted.local`
 * marker. Returns the number of users purged this run.
 *
 * GDPR Article 17 (Right to Erasure) — Privacy Policy promises personal data
 * is removed "as soon as reasonably practicable, and within 90 days at the
 * latest" of an account-deletion request. This job runs daily on a 30-day
 * cut-off, comfortably inside that 90-day window.
 */
export async function runAccountPurge(): Promise<{ purgedCount: number }> {
  const cutoff = new Date(Date.now() - PURGE_AFTER_MS);
  let purgedCount = 0;

  try {
    // Candidates: soft-deleted before cutoff AND not already anonymised.
    // The marker for "already purged" is an email matching `purged-%@deleted.local`.
    // We require email IS NOT NULL AND NOT LIKE marker so we re-purge any user
    // whose email was ever wiped to a non-marker value, but skip true purged rows.
    const candidates = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        and(
          lt(usersTable.deletedAt, cutoff),
          sql`${usersTable.email} IS NOT NULL`,
          sql`${usersTable.email} NOT LIKE ${PURGED_EMAIL_PATTERN}`,
        ),
      );

    for (const { id } of candidates) {
      try {
        await purgeOneUser(id);
        purgedCount++;
        logger.info({ userId: id }, "[account-purge] User account anonymised");
      } catch (err) {
        logger.error({ err, userId: id }, "[account-purge] Failed to purge one user");
      }
    }

    if (purgedCount > 0) {
      logger.info({ purgedCount, cutoff }, "[account-purge] Completed daily purge sweep");
    }
  } catch (err) {
    logger.error({ err }, "[account-purge] Sweep failed");
  }

  return { purgedCount };
}
