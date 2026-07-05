#!/usr/bin/env bash
# Upload secrets from .env.vercel.paste (or path arg) to Vercel.
# Usage: bash scripts/upload-vercel-secrets.sh [.env.vercel.paste] [production|preview|development|all]
set -euo pipefail

PASTE_FILE="${1:-.env.vercel.paste}"
SCOPE="jcollinsmclappleid-stars-projects"
TARGET="${2:-all}"

case "$TARGET" in
  production) ENVS="production" ;;
  preview)    ENVS="preview" ;;
  development) ENVS="development" ;;
  all)        ENVS="production preview development" ;;
  *) echo "Unknown target: $TARGET (use production, preview, development, or all)"; exit 1 ;;
esac

if [[ ! -f "$PASTE_FILE" ]]; then
  echo "Missing $PASTE_FILE"
  exit 1
fi

add_env() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" || "$value" == "PASTE_HERE" ]]; then
    echo "  ⊘ $name (skipped — empty)"
    return
  fi
  case "$name" in
    REPLIT_DATABASE_URL|NEON_DATABASE_URL) echo "  ⊘ $name (local migration only — not uploaded)"; return ;;
  esac
  for env in $ENVS; do
    printf '%s' "$value" | npx --yes vercel@54.20.0 env add "$name" "$env" --scope "$SCOPE" --force 2>/dev/null || \
      printf '%s' "$value" | npx --yes vercel@54.20.0 env add "$name" "$env" --scope "$SCOPE"
  done
  echo "  ✓ $name → $TARGET"
}

echo "Uploading secrets from $PASTE_FILE to Vercel ($TARGET)…"
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  [[ "$line" != *"="* ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  name="${name// /}"
  add_env "$name" "$value"
done < "$PASTE_FILE"
echo "Done. (No deploy run — add --prod deploy when ready.)"
