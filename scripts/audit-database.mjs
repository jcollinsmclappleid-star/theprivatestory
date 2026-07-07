#!/usr/bin/env node
/** Read-only DB schema audit — compares live Postgres to Drizzle-defined tables. */
import pg from "pg";

const EXPECTED_TABLES = [
  "sessions",
  "users",
  "ba_sessions",
  "ba_accounts",
  "ba_verifications",
  "ba_two_factor",
  "pending_purchases",
  "series",
  "generated_stories",
  "user_library",
  "user_progress",
  "user_taste",
  "generated_cache",
  "user_presets",
  "user_reaction_history",
  "name_submissions",
  "generation_jobs",
  "conversations",
  "messages",
  "gift_orders",
  "content_blocks",
  "csam_reports",
  "user_reports",
  "admin_audit_log",
  "story_reports",
  "moderation_events",
  "consent_log",
];

const CRITICAL_COLUMNS = {
  users: [
    "id",
    "email",
    "story_credits_remaining",
    "subscription_plan",
    "stripe_customer_id",
    "is_admin",
    "deleted_at",
  ],
  pending_purchases: [
    "claim_token",
    "stripe_session_id",
    "plan",
    "confirmed",
    "claimed",
    "expires_at",
  ],
  generated_stories: ["id", "owner_user_id", "audio_url", "casting_data"],
  generation_jobs: ["id", "user_id", "status"],
  ba_sessions: ["id", "token", "user_id"],
  ba_accounts: ["id", "user_id", "provider_id"],
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(2);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  const { rows: tables } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  const live = new Set(tables.map((r) => r.table_name));

  const missing = EXPECTED_TABLES.filter((t) => !live.has(t));
  const extra = [...live].filter((t) => !EXPECTED_TABLES.includes(t)).sort();

  console.log("\n=== Database audit ===\n");
  console.log(`Live tables: ${live.size}`);
  console.log(`Expected (Drizzle): ${EXPECTED_TABLES.length}`);

  if (missing.length) {
    console.log("\n✗ Missing tables:");
    for (const t of missing) console.log(`  - ${t}`);
  } else {
    console.log("\n✓ All expected tables present");
  }

  if (extra.length) {
    console.log("\n· Extra tables (legacy / not in schema index):");
    for (const t of extra) console.log(`  - ${t}`);
  }

  console.log("\n=== Critical columns ===\n");
  let colOk = true;
  for (const [table, cols] of Object.entries(CRITICAL_COLUMNS)) {
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [table],
    );
    const have = new Set(rows.map((r) => r.column_name));
    const missingCols = cols.filter((c) => !have.has(c));
    if (missingCols.length) {
      colOk = false;
      console.log(`✗ ${table}: missing ${missingCols.join(", ")}`);
    } else {
      console.log(`✓ ${table}`);
    }
  }

  console.log("\n=== Row counts (sanity) ===\n");
  for (const t of ["users", "pending_purchases", "generated_stories", "generation_jobs", "ba_sessions"]) {
    if (!live.has(t)) continue;
    const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM "${t}"`);
    console.log(`  ${t}: ${rows[0].n}`);
  }

  const { rows: ver } = await client.query("SELECT version()");
  console.log(`\nPostgres: ${ver[0].version.split(" ")[0]} ${ver[0].version.split(" ")[1]}`);

  await client.end();

  const ok = missing.length === 0 && colOk;
  console.log(ok ? "\n✓ Database schema looks complete.\n" : "\n✗ Schema gaps found — run drizzle push.\n");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
