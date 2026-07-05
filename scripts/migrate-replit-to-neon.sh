#!/usr/bin/env bash
# One-time: copy all data from Replit Postgres → Neon.
#
# Prerequisites: pg_dump and psql (install via `brew install libpq` on macOS)
#
# Add to .env.vercel.paste (local only — do NOT upload to Vercel):
#   REPLIT_DATABASE_URL=postgresql://...   (from Replit Secrets → DATABASE_URL)
#   NEON_DATABASE_URL=postgresql://...     (optional; defaults to Neon project theprivatestory)
#
# Run: bash scripts/migrate-replit-to-neon.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASTE_FILE="${1:-$ROOT/.env.vercel.paste}"
DUMP_FILE="${TMPDIR:-/tmp}/theprivatestory-replit-dump.sql"

read_var() {
  local name="$1"
  local file="$2"
  grep -E "^${name}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- || true
}

if [[ ! -f "$PASTE_FILE" ]]; then
  echo "Missing $PASTE_FILE"
  exit 1
fi

REPLIT_URL="$(read_var REPLIT_DATABASE_URL "$PASTE_FILE")"
NEON_URL="$(read_var NEON_DATABASE_URL "$PASTE_FILE")"

if [[ -z "$REPLIT_URL" ]]; then
  echo "Add REPLIT_DATABASE_URL to $PASTE_FILE (copy DATABASE_URL from Replit Secrets)."
  exit 1
fi

if [[ -z "$NEON_URL" ]]; then
  echo "Add NEON_DATABASE_URL to $PASTE_FILE (Neon console → Connection string)."
  echo "  https://console.neon.tech/app/projects/blue-lake-16502692"
  exit 1
fi

for cmd in pg_dump psql; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing $cmd. Install: brew install libpq && brew link --force libpq"
    exit 1
  fi
done

echo "Exporting from Replit…"
pg_dump "$REPLIT_URL" \
  --no-owner --no-acl --clean --if-exists \
  --exclude-schema=neon \
  -f "$DUMP_FILE"

echo "Importing into Neon…"
psql "$NEON_URL" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"

echo "Verifying row counts…"
psql "$NEON_URL" -c "
  SELECT 'users' AS tbl, COUNT(*) FROM users
  UNION ALL SELECT 'generated_stories', COUNT(*) FROM generated_stories
  UNION ALL SELECT 'sessions', COUNT(*) FROM sessions;
"

rm -f "$DUMP_FILE"
echo "Migration complete."
