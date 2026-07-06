/** Verify email/password against DB hash (no network). */
import { verifyPassword } from "better-auth/crypto";
import { db, usersTable, baAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
if (!email || !password) {
  console.error("Usage: tsx scripts/verify-user-login.mts <email> <password>");
  process.exit(1);
}

const [row] = await db
  .select({
    userId: usersTable.id,
    credits: usersTable.storyCreditsRemaining,
    hash: baAccountsTable.password,
  })
  .from(usersTable)
  .innerJoin(
    baAccountsTable,
    and(eq(baAccountsTable.userId, usersTable.id), eq(baAccountsTable.providerId, "credential")),
  )
  .where(eq(usersTable.email, email))
  .limit(1);

if (!row?.hash) {
  console.log(JSON.stringify({ found: false }));
  process.exit(1);
}

const valid = await verifyPassword({ hash: row.hash, password });
console.log(JSON.stringify({ found: true, userId: row.userId, credits: row.credits, passwordValid: valid }));
