#!/usr/bin/env bash
# Start the full app locally: API + pre-built React client on http://localhost:8080
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/artifacts/api-server"

ENV_FILE="$ROOT/.env.local"
if [[ ! -f "$ENV_FILE" ]] && [[ ! -f "$ROOT/.env.vercel.paste" ]]; then
  echo "Missing env file. Copy .env.vercel.example → .env.local and add DATABASE_URL + API keys." >&2
  exit 1
fi

set -a
# Paste supplies API keys; .env.local overrides (e.g. local DATABASE_URL).
if [[ -f "$ROOT/.env.vercel.paste" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env.vercel.paste"
fi
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi
set +a

export NODE_ENV=development
export PORT=8080
export SKIP_VITE_BUILD=1
export DATABASE_URL="${DATABASE_URL:-${NEON_DATABASE_URL:-${REPLIT_DATABASE_URL:-}}}"
export BETTER_AUTH_URL="http://localhost:8080"
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-dev-secret-change-in-production}"
export SITE_URL="http://localhost:8080"
export APP_URL="http://localhost:8080"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL (or NEON_DATABASE_URL) must be set in $ENV_FILE" >&2
  exit 1
fi

if [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
  echo "Warning: DATABASE_URL points at localhost — generation needs your Neon URL." >&2
  if [[ -n "${NEON_DATABASE_URL:-}" ]]; then
    echo "  Using NEON_DATABASE_URL instead." >&2
    export DATABASE_URL="$NEON_DATABASE_URL"
  fi
fi

echo "Checking database connection…"
PG_PKG="$(find "$ROOT/node_modules/.pnpm" -path '*/pg@*/node_modules/pg/package.json' 2>/dev/null | head -1)"
if [[ -z "$PG_PKG" ]]; then
  echo "  (skip — run npm install at repo root if generation fails on DB)" >&2
else
  PG_DIR="$(dirname "$PG_PKG")"
  cd "$API_DIR"
  node -e "
const { Pool } = require('${PG_DIR}');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
pool.query('select 1')
  .then(() => { console.log('  ✓ Database reachable'); return pool.end(); })
  .catch((e) => { console.error('  ✗ Database connection failed:', e.code || e.message); process.exit(1); });
" || exit 1
fi

cd "$API_DIR"

if [[ ! -f dist/index.mjs ]]; then
  echo "Building API server (first run)…"
  node ./build.mjs
fi

echo ""
echo "  The Private Story — local"
echo "  Open: http://localhost:8080"
echo "  (Not :5173 — that is Vite-only and has no API)"
echo ""

exec node --enable-source-maps ./dist/index.mjs
