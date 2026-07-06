#!/usr/bin/env bash
# One-time: configure Vercel env for theprivatestory (non-secret configs + DATABASE_URL).
set -euo pipefail
SCOPE="jcollinsmclappleid-stars-projects"
ENVS="production preview development"

add_env() {
  local name="$1"
  local value="$2"
  for env in $ENVS; do
    printf '%s' "$value" | npx --yes vercel@54.20.0 env add "$name" "$env" --scope "$SCOPE" --force 2>/dev/null || \
      printf '%s' "$value" | npx --yes vercel@54.20.0 env add "$name" "$env" --scope "$SCOPE"
  done
  echo "  ✓ $name"
}

# Neon DATABASE_URL — passed as first argument (never commit this file with a real URL)
if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 '<DATABASE_URL>'"
  exit 1
fi

echo "Adding Vercel environment variables…"
add_env "DATABASE_URL" "$1"
add_env "BETTER_AUTH_URL" "https://theprivatestory.vercel.app"
add_env "BETTER_AUTH_SECRET" "6755e0eb33dc17459611d077cae39120dafad6d899ca327913919399b3dbf76f"
add_env "SITE_URL" "https://theprivatestory.vercel.app"
add_env "APP_URL" "https://theprivatestory.vercel.app"
add_env "NODE_ENV" "production"
# Do not set SKIP_VITE_BUILD on Vercel — build.mjs always runs Vite when VERCEL=1.
add_env "ADMIN_EMAIL" "Jcollinsmclappleid@gmail.com"
add_env "VITE_ADMIN_EMAIL" "Jcollinsmclappleid@gmail.com"
add_env "STRIPE_ADDON_PRICE_ID" "price_1TV8O0Dv8IzJrrwIAUqcBVLP"
add_env "STRIPE_ADDON_PRICE_ID_USD" "price_1TV8OXDv8IzJrrwI521Jioe1"
add_env "STRIPE_ANNUAL_PRICE_ID" "price_1TZyy2Dv8IzJrrwI6ljswsSw"
add_env "STRIPE_ANNUAL_PRICE_ID_USD" "price_1TZz0jDv8IzJrrwIgpUHCn44"
add_env "STRIPE_COLLECTION_PRICE_ID" "price_1TeRTjDv8IzJrrwI0LpymEFS"
add_env "STRIPE_COLLECTION_PRICE_ID_USD" "price_1TeRUJDv8IzJrrwIfV66ltSd"
add_env "STRIPE_FIVE_PACK_PRICE_ID" "price_1TeROoDv8IzJrrwI3mRVLCG3"
add_env "STRIPE_FIVE_PACK_PRICE_ID_USD" "price_1TeRRWDv8IzJrrwIwajeciMI"
add_env "STRIPE_IMMERSIVE_PRICE_ID" "price_1THYxXDv8IzJrrwIwzmLd5kJ"
add_env "STRIPE_MONTHLY_PRICE_ID" "price_1THSrLDv8IzJrrwIlYgcIJ1C"
add_env "STRIPE_MONTHLY_PRICE_ID_USD" "price_1TV8IUDv8IzJrrwIKwv9XuiW"
add_env "STRIPE_SINGLE_PRICE_ID" "price_1TeRIBDv8IzJrrwIvh7cHStf"
add_env "STRIPE_SINGLE_PRICE_ID_USD" "price_1TeRIBDv8IzJrrwIKrmGIaJt"
echo "Done. Paste remaining secrets in Vercel dashboard (see .env.vercel.example)."
