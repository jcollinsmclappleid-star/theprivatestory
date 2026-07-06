/**
 * One-off: set email/password + story credits for a user (production DB).
 * Usage: DATABASE_URL=... tsx scripts/set-user-password.mts <email> <password> [credits]
 */
import { hashPassword } from "better-auth/crypto";
import { db, usersTable, baAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
const credits = Number(process.argv[4] ?? "0");

if (!email || !password || password.length < 8) {
  console.error("Usage: tsx scripts/set-user-password.mts <email> <password-min-8> [credits]");
  process.exit(1);
}

const [user] = await db
  .select({ id: usersTable.id, email: usersTable.email })
  .from(usersTable)
  .where(eq(usersTable.email, email))
  .limit(1);

if (!user) {
  console.error(`No user found for ${email}`);
  process.exit(1);
}

const hashed = await hashPassword(password);

const [account] = await db
  .select({ id: baAccountsTable.id })
  .from(baAccountsTable)
  .where(and(eq(baAccountsTable.userId, user.id), eq(baAccountsTable.providerId, "credential")))
  .limit(1);

// Match existing accounts in this project (accountId = user id, same as admin rows).
const accountId = user.id;

if (account) {
  await db
    .update(baAccountsTable)
    .set({ password: hashed, accountId, updatedAt: new Date() })
    .where(eq(baAccountsTable.id, account.id));
} else {
  await db.insert(baAccountsTable).values({
    id: crypto.randomUUID(),
    accountId,
    providerId: "credential",
    userId: user.id,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

if (Number.isInteger(credits) && credits > 0) {
  await db
    .update(usersTable)
    .set({ storyCreditsRemaining: credits })
    .where(eq(usersTable.id, user.id));
}

console.log(JSON.stringify({ ok: true, userId: user.id, email: user.email, storyCreditsRemaining: credits }, null, 2));
