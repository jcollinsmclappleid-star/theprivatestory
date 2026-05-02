/**
 * Manual integration test for runAccountPurge / purgeOneUser.
 *
 * Creates a synthetic soft-deleted user with related rows in EVERY user-
 * referencing table, sets deletedAt to 31 days ago, runs the purge sweep,
 * and asserts:
 *   - all cascade-eligible child rows for that user are gone
 *   - all set-null FKs pointing at the user have been NULLed
 *   - the user row is anonymised (PII fields cleared, email = purged marker)
 *   - the user row itself is preserved (consent_log legal hold)
 *   - re-running the sweep is a strict no-op for that user
 *   - purgeOneUser is itself idempotent on an already-anonymised user
 *
 * Run with:
 *   pnpm --filter @workspace/api-server exec tsx scripts/test-account-purge.ts
 */
import { eq, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  generatedStories,
  series,
  userLibrary,
  userProgress,
  userTaste,
  userPresets,
  userReactionHistory,
  generationJobs,
  baSessionsTable,
  baAccountsTable,
  baTwoFactorTable,
  consentLog,
  adminAuditLog,
  giftOrders,
  nameSubmissions,
  storyReports,
  moderationEvents,
} from "@workspace/db";
import { runAccountPurge, purgeOneUser } from "../src/lib/accountPurge.js";

const TEST_PREFIX = "purge-test-";
const TEST_ID = `${TEST_PREFIX}${Date.now()}`;
const PURGED_EMAIL = `purged-${TEST_ID}@deleted.local`;

function pass(msg: string) { console.log(`  \u2713 ${msg}`); }
function fail(msg: string): never { console.error(`  \u2717 ${msg}`); throw new Error(msg); }

async function setUp(): Promise<void> {
  console.log(`\n[setup] Creating synthetic soft-deleted user ${TEST_ID}…`);

  await db.insert(usersTable).values({
    id: TEST_ID,
    name: "Test User",
    email: `${TEST_ID}@example.test`,
    emailVerified: true,
    firstName: "Test",
    lastName: "User",
    profileImageUrl: "https://example.test/avatar.png",
    image: "https://example.test/avatar.png",
    approvedListenerName: "Sophie",
    approvedPartnerName: "Jamie",
    stripeCustomerId: "cus_test_xxx",
    stripeSubscriptionId: "sub_test_xxx",
    userCode: "TPSTEST",
    bannedReason: "test reason",
    deletedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
  });

  // ── Cascade tables ─────────────────────────────────────────────
  await db.insert(generatedStories).values({
    id: `story_${TEST_ID}`,
    ownerUserId: TEST_ID,
    title: "Test Story",
    audioUrl: `/api/audio/test-${TEST_ID}.mp3`,
    images: { hero: `/api/images/hero-${TEST_ID}.png` },
  });
  await db.insert(series).values({
    id: `series_${TEST_ID}`,
    ownerUserId: TEST_ID,
    title: "Test Series",
    coverImage: `/api/images/cover-${TEST_ID}.png`,
  });
  await db.insert(userLibrary).values({ userId: TEST_ID, storyId: `story_${TEST_ID}`, type: "saved" });
  await db.insert(userProgress).values({ userId: TEST_ID, storyId: `story_${TEST_ID}`, audioProgressSeconds: 42 });
  await db.insert(userTaste).values({ userId: TEST_ID, tasteProfile: { test: true } });
  await db.insert(userPresets).values({ userId: TEST_ID, name: "test-preset", castingData: {} });
  await db.insert(userReactionHistory).values({ userId: TEST_ID, storyId: `story_${TEST_ID}`, storyTitle: "Test Story" });
  await db.insert(generationJobs).values({ id: `job_${TEST_ID}`, userId: TEST_ID, status: "completed" });
  await db.insert(baSessionsTable).values({
    id: `sess_${TEST_ID}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    token: `tok_${TEST_ID}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: TEST_ID,
  });
  await db.insert(baAccountsTable).values({
    id: `acct_${TEST_ID}`,
    accountId: `${TEST_ID}-aid`,
    providerId: "credential",
    userId: TEST_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(baTwoFactorTable).values({
    id: `tf_${TEST_ID}`,
    secret: "test-secret",
    backupCodes: "[]",
    userId: TEST_ID,
  });

  // ── Set-null FK tables (must be NULLed, not deleted) ────────────
  await db.insert(adminAuditLog).values({
    actorUserId: TEST_ID,
    action: "moderation_reviewed",
    targetType: "user",
    targetId: TEST_ID,
  });
  await db.insert(giftOrders).values({
    id: `gift_${TEST_ID}`,
    userId: TEST_ID,
    stripeSessionId: `sess_${TEST_ID}`,
  });
  await db.insert(nameSubmissions).values({
    name: `Testname${Date.now()}`,
    submittedByUserId: TEST_ID,
    nameType: "listener",
  });
  await db.insert(storyReports).values({
    userId: TEST_ID,
    storyId: `story_${TEST_ID}`,
    reason: "test",
    reasonCategory: "test_category",
  });
  await db.insert(moderationEvents).values({
    userId: TEST_ID,
    storyId: `story_${TEST_ID}`,
    eventType: "test_event",
    reason: "test reason",
  });

  // ── Legal-hold table that MUST survive ──────────────────────────
  await db.insert(consentLog).values({
    userId: TEST_ID,
    consentType: "terms_accepted",
    termsVersion: "test-1.0",
    ipAddress: "127.0.0.1",
    userAgent: "purge-test",
  });

  pass("Test user + child rows seeded across all 17 user-referencing tables");
}

async function assertCascadeRowsGone(userId: string, label: string): Promise<void> {
  const checks: Array<[string, Promise<unknown[]>]> = [
    ["generated_stories",     db.select({ id: generatedStories.id }).from(generatedStories).where(eq(generatedStories.ownerUserId, userId))],
    ["series",                db.select({ id: series.id }).from(series).where(eq(series.ownerUserId, userId))],
    ["user_library",          db.select({ id: userLibrary.id }).from(userLibrary).where(eq(userLibrary.userId, userId))],
    ["user_progress",         db.select({ userId: userProgress.userId }).from(userProgress).where(eq(userProgress.userId, userId))],
    ["user_taste",            db.select({ userId: userTaste.userId }).from(userTaste).where(eq(userTaste.userId, userId))],
    ["user_presets",          db.select({ id: userPresets.id }).from(userPresets).where(eq(userPresets.userId, userId))],
    ["user_reaction_history", db.select({ id: userReactionHistory.id }).from(userReactionHistory).where(eq(userReactionHistory.userId, userId))],
    ["generation_jobs",       db.select({ id: generationJobs.id }).from(generationJobs).where(eq(generationJobs.userId, userId))],
    ["ba_sessions",           db.select({ id: baSessionsTable.id }).from(baSessionsTable).where(eq(baSessionsTable.userId, userId))],
    ["ba_accounts",           db.select({ id: baAccountsTable.id }).from(baAccountsTable).where(eq(baAccountsTable.userId, userId))],
    ["ba_two_factor",         db.select({ id: baTwoFactorTable.id }).from(baTwoFactorTable).where(eq(baTwoFactorTable.userId, userId))],
  ];
  for (const [table, q] of checks) {
    const rows = await q;
    if (rows.length !== 0) fail(`${label}: ${table} still has ${rows.length} row(s) for ${userId}`);
  }
  pass(`${label}: all 11 cascade tables empty for ${userId}`);
}

async function assertSetNullFksSevered(userId: string, label: string): Promise<void> {
  const stillLinked: string[] = [];
  if ((await db.select().from(adminAuditLog).where(eq(adminAuditLog.actorUserId, userId))).length) stillLinked.push("admin_audit_log");
  if ((await db.select().from(giftOrders).where(eq(giftOrders.userId, userId))).length) stillLinked.push("gift_orders");
  if ((await db.select().from(nameSubmissions).where(eq(nameSubmissions.submittedByUserId, userId))).length) stillLinked.push("name_submissions");
  if ((await db.select().from(storyReports).where(eq(storyReports.userId, userId))).length) stillLinked.push("story_reports");
  if ((await db.select().from(moderationEvents).where(eq(moderationEvents.userId, userId))).length) stillLinked.push("moderation_events");
  if (stillLinked.length) fail(`${label}: set-null FKs not severed: ${stillLinked.join(", ")}`);
  pass(`${label}: all 5 set-null FKs severed (admin_audit_log, gift_orders, name_submissions, story_reports, moderation_events)`);
}

async function assertUserAnonymised(userId: string): Promise<void> {
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!u) fail("User row was deleted (should have been preserved for consent_log legal hold)");
  if (u.email !== PURGED_EMAIL) fail(`email marker wrong: ${u.email}`);
  if (u.name !== "") fail(`name not cleared: ${JSON.stringify(u.name)}`);
  if (u.emailVerified !== false) fail(`emailVerified not reset`);
  if (u.firstName !== null) fail(`firstName not null`);
  if (u.lastName !== null) fail(`lastName not null`);
  if (u.profileImageUrl !== null) fail(`profileImageUrl not null`);
  if (u.image !== null) fail(`image not null`);
  if (u.approvedListenerName !== null) fail(`approvedListenerName not null`);
  if (u.approvedPartnerName !== null) fail(`approvedPartnerName not null`);
  if (u.stripeCustomerId !== null) fail(`stripeCustomerId not null`);
  if (u.stripeSubscriptionId !== null) fail(`stripeSubscriptionId not null`);
  if (u.userCode !== null) fail(`userCode not null`);
  if (u.bannedReason !== null) fail(`bannedReason not null`);
  if (u.deletedAt === null) fail(`deletedAt should remain set`);
  pass("User row anonymised: PII cleared, email = purged marker, user.id preserved");
}

async function assertConsentLogPreserved(userId: string): Promise<void> {
  const rows = await db.select().from(consentLog).where(eq(consentLog.userId, userId));
  if (rows.length === 0) fail(`consent_log entries for ${userId} were destroyed (legal hold violation)`);
  pass(`consent_log preserved (${rows.length} row(s)) — legal hold honoured`);
}

async function tearDown(): Promise<void> {
  // consent_log uses onDelete: "restrict" — clear it before the user row.
  await db.delete(consentLog).where(eq(consentLog.userId, TEST_ID));
  // Set-null FK tables: rows survive, just unlinked. Wipe ours by id.
  await db.delete(giftOrders).where(eq(giftOrders.id, `gift_${TEST_ID}`));
  await db.delete(nameSubmissions).where(sql`name LIKE 'Testname%' AND submitted_by_user_id IS NULL`);
  await db.delete(storyReports).where(sql`reason_category = 'test_category' AND user_id IS NULL`);
  await db.delete(moderationEvents).where(sql`event_type = 'test_event' AND user_id IS NULL`);
  await db.delete(adminAuditLog).where(sql`target_id = ${TEST_ID} AND actor_user_id IS NULL`);
  await db.delete(usersTable).where(eq(usersTable.id, TEST_ID));
  pass("Cleaned up test fixtures");
}

async function main() {
  let setupDone = false;
  try {
    await setUp();
    setupDone = true;

    console.log("\n[test 1] runAccountPurge() picks up the soft-deleted user");
    const { purgedCount } = await runAccountPurge();
    if (purgedCount < 1) fail(`runAccountPurge purged 0 users — expected at least 1`);
    pass(`runAccountPurge purged ${purgedCount} user(s) (test user included)`);

    await assertCascadeRowsGone(TEST_ID, "after sweep");
    await assertSetNullFksSevered(TEST_ID, "after sweep");
    await assertUserAnonymised(TEST_ID);
    await assertConsentLogPreserved(TEST_ID);

    console.log("\n[test 2] Re-running the sweep is a strict no-op for our fixture");
    const beforeMarker = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, TEST_ID));
    const { purgedCount: second } = await runAccountPurge();
    const afterMarker = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, TEST_ID));
    if (afterMarker[0]?.email !== beforeMarker[0]?.email) fail("email marker changed on second sweep");
    pass(`Second sweep purged ${second} additional user(s); our fixture's marker is unchanged`);

    console.log("\n[test 3] purgeOneUser() is itself idempotent");
    await purgeOneUser(TEST_ID);
    await assertUserAnonymised(TEST_ID);
    await assertConsentLogPreserved(TEST_ID);
    pass("purgeOneUser ran cleanly on already-anonymised user");

    await tearDown();

    console.log("\n\u2705 All purge-job assertions passed.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n\u274C Test failed:", err);
    if (setupDone) {
      try { await tearDown(); } catch (cleanupErr) { console.error("[teardown error]", cleanupErr); }
    }
    process.exit(1);
  }
}

main();
