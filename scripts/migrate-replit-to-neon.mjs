#!/usr/bin/env node
/**
 * Copy all public tables from Replit Postgres → Neon (Vercel target).
 * Reads REPLIT_DATABASE_URL + NEON_DATABASE_URL from .env.vercel.paste or .env.vercel.example
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "lib/db/package.json"));
const pg = require("pg");

function readVar(name, files) {
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      if (line.startsWith("#") || !line.includes("=")) continue;
      const eq = line.indexOf("=");
      const k = line.slice(0, eq).trim();
      if (k === name) return line.slice(eq + 1).trim();
    }
  }
  return process.env[name] ?? "";
}

const envFiles = [
  path.join(root, ".env.vercel.paste"),
  path.join(root, ".env.vercel.example"),
];

const sourceUrl = readVar("REPLIT_DATABASE_URL", envFiles);
let targetUrl = readVar("NEON_DATABASE_URL", envFiles);

if (!sourceUrl) {
  console.error("Missing REPLIT_DATABASE_URL in .env.vercel.paste or .env.vercel.example");
  process.exit(1);
}

if (!targetUrl) {
  console.error("Missing NEON_DATABASE_URL — add Neon connection string to .env.vercel.paste");
  process.exit(1);
}

const { Client } = pg;

async function main() {
  const source = new Client({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
  const target = new Client({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

  await source.connect();
  await target.connect();
  console.log("Connected to source and target.");

  const { rows: tables } = await source.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  if (tables.length === 0) {
    console.log("No tables in source.");
    process.exit(0);
  }

  const names = tables.map((r) => r.tablename);
  console.log(`Found ${names.length} tables.`);

  // Clear target (schema already exists from drizzle push)
  await target.query(`TRUNCATE ${names.map((n) => `"${n}"`).join(", ")} RESTART IDENTITY CASCADE`);
  console.log("Truncated target tables.");

  const { rows: fkRows } = await source.query(`
    SELECT tc.table_name AS child, ccu.table_name AS parent
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      AND tc.table_name != ccu.table_name
  `);

  const deps = new Map(names.map((n) => [n, new Set()]));
  for (const { child, parent } of fkRows) {
    if (deps.has(child) && deps.has(parent)) deps.get(child).add(parent);
  }

  const sorted = [];
  const pending = new Set(names);
  while (pending.size > 0) {
    const ready = [...pending].filter((t) => [...deps.get(t)].every((p) => !pending.has(p)));
    if (ready.length === 0) {
      sorted.push(...pending);
      break;
    }
    ready.sort();
    for (const t of ready) {
      sorted.push(t);
      pending.delete(t);
    }
  }

  let totalRows = 0;
  for (const table of sorted) {
    const { rows } = await source.query(`SELECT * FROM "${table}"`);
    if (rows.length === 0) {
      console.log(`  ${table}: 0 rows`);
      continue;
    }

    const { rows: colMeta } = await source.query(
      `SELECT column_name, data_type, udt_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [table],
    );
    const jsonCols = new Set(
      colMeta.filter((c) => c.data_type === "json" || c.data_type === "jsonb" || c.udt_name === "json" || c.udt_name === "jsonb").map((c) => c.column_name),
    );

    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const BATCH = 100;

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const placeholders = batch
        .map(
          (_, bi) =>
            `(${cols.map((_, ci) => `$${bi * cols.length + ci + 1}`).join(", ")})`,
        )
        .join(", ");
      const values = batch.flatMap((row) =>
        cols.map((c) => {
          const v = row[c];
          if (v !== null && jsonCols.has(c) && typeof v === "object") return JSON.stringify(v);
          return v;
        }),
      );
      await target.query(
        `INSERT INTO "${table}" (${colList}) VALUES ${placeholders}`,
        values,
      );
    }

    totalRows += rows.length;
    console.log(`  ${table}: ${rows.length} rows`);
  }

  // Fix sequences
  for (const table of names) {
    const { rows: seqRows } = await target.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       AND column_default LIKE 'nextval(%'`,
      [table],
    );
    for (const { column_name } of seqRows) {
      await target.query(`
        SELECT setval(
          pg_get_serial_sequence('"${table}"', '${column_name}'),
          COALESCE((SELECT MAX("${column_name}") FROM "${table}"), 1),
          (SELECT MAX("${column_name}") IS NOT NULL FROM "${table}")
        )
      `);
    }
  }

  const { rows: verify } = await target.query(`
    SELECT 'users' AS tbl, COUNT(*)::int AS n FROM users
    UNION ALL SELECT 'generated_stories', COUNT(*)::int FROM generated_stories
    UNION ALL SELECT 'sessions', COUNT(*)::int FROM sessions
  `);

  console.log("\nVerification:");
  for (const r of verify) console.log(`  ${r.tbl}: ${r.n}`);
  console.log(`\nDone. ${totalRows} total rows copied.`);

  await source.end();
  await target.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
