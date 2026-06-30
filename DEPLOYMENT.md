# Deployment & Migration Notes

## Project overview

pnpm monorepo. The API server (`artifacts/api-server`) is a Node/Express app that:
- Serves the React SPA as static files from `artifacts/api-server/public/client/`
- Serves SSR HTML to crawlers for SEO pages
- Handles all `/api/*` routes (auth, story generation, payments, audio, images)

The React frontend (`artifacts/custom-audio-stories`) is a Vite/React app that builds **into** the API server's public directory, not its own dist.

---

## Build process — critical to understand

### Two separate build steps

**Step 1: Frontend (Vite)**
```bash
pnpm --filter @workspace/custom-audio-stories run build
# Output: artifacts/api-server/public/client/
```

**Step 2: API server (esbuild)**
```bash
pnpm --filter @workspace/api-server run build
# Output: artifacts/api-server/dist/index.mjs
# Also copies artifacts/api-server/public-static/ → artifacts/api-server/public/
```

The API server's `build.mjs` runs both steps by default. Set `SKIP_VITE_BUILD=1` to skip Step 1 and only run esbuild.

### Why the built frontend is committed to git

`artifacts/api-server/public/client/` is tracked in git. This is intentional.

**Reason**: Running a full Vite build on every deploy caused 3–5 minutes of production downtime per restart (confirmed to have suppressed Google Search Console impressions). By committing the pre-built client, production deploys only run esbuild (~10 seconds), so restarts take ~15 seconds instead of 5 minutes.

**The rule**: Whenever frontend source files change, rebuild and commit `public/client/` before deploying.

```bash
# After any change to artifacts/custom-audio-stories/src/
pnpm --filter @workspace/custom-audio-stories run build
git add artifacts/api-server/public/client/
git commit -m "Rebuild frontend"
# Then deploy
```

Do not deploy frontend source changes without first committing the rebuilt output — production will serve the stale pre-built version otherwise.

---

## Migrating to Vercel

### Recommended Vercel configuration

Vercel should build and deploy the **API server only** (it contains everything). The React frontend is pre-built into `public/client/` already.

**Build command:**
```bash
pnpm --filter @workspace/api-server run build
```
With `SKIP_VITE_BUILD=1` set as an environment variable (so only esbuild runs, not Vite — the client is already pre-built in the repo).

**Output directory:** Not applicable — this is a Node server, not a static site.

**Framework preset:** Other (Node.js server)

**Start command:**
```bash
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

**Node version:** 24

### Environment variables needed

All of these must be set in Vercel's environment settings:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon, Supabase, or other Postgres) |
| `OPENAI_API_KEY` | Story images + moderation |
| `ELEVENLABS_API_KEY` | Audio narration |
| `OPENROUTER_API_KEY` | Mistral Large for story writing |
| `RESEND_API_KEY` | Transactional email |
| `RESEND_DOMAIN_KEY` | Resend domain verification |
| `STRIPE_SECRET_KEY` | Payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation |
| `STRIPE_MONTHLY_PRICE_ID` | Monthly plan price ID |
| `STRIPE_ANNUAL_PRICE_ID` | Annual plan price ID |
| `STRIPE_IMMERSIVE_PRICE_ID` | One-time immersive pack price ID |
| `GOOGLE_CLIENT_ID` | Google OAuth (better-auth) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (better-auth) |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | GCS bucket for audio/image storage |
| `PRIVATE_OBJECT_DIR` | GCS private object path prefix |
| `PUBLIC_OBJECT_SEARCH_PATHS` | GCS public object search paths |
| `ADMIN_SCRIPT_KEY` | HMAC key for admin API endpoints |
| `SKIP_VITE_BUILD` | Set to `1` — frontend is pre-built in repo |

### Database

Currently PostgreSQL via Replit's managed Postgres. On migration:
1. Export the Replit database (pg_dump)
2. Import to your new Postgres provider
3. Update `DATABASE_URL`
4. The schema is managed by Drizzle — run `pnpm --filter @workspace/db run push` after pointing to the new DB to verify schema is in sync

### Static audio and image assets

Audio files and generated story images are stored in Google Cloud Storage. The GCS bucket and credentials need to stay the same or be migrated — the bucket name is in `DEFAULT_OBJECT_STORAGE_BUCKET_ID`. GCS access uses Replit's connector SDK currently; on migration you will need to provide a GCS service account JSON key directly via `GOOGLE_APPLICATION_CREDENTIALS` or equivalent.

### CORS and domain

The API server has CORS configured for `theprivatestory.com`. If the domain stays the same, no changes needed. Check `artifacts/api-server/src/app.ts` for the CORS origin list if the domain changes.

### Stripe webhooks

Update the Stripe webhook endpoint in the Stripe dashboard from the Replit deployment URL to the new Vercel URL. Regenerate `STRIPE_WEBHOOK_SECRET` after adding the new endpoint.

### Auth (better-auth)

`better-auth` needs `BETTER_AUTH_URL` set to the production domain. Check `artifacts/api-server/src/lib/auth.ts` for the base URL configuration and update accordingly.

Google OAuth credentials in Google Cloud Console must have the new Vercel domain added to the authorised redirect URIs.

---

## Local development

```bash
# Install dependencies
pnpm install

# Push DB schema (first time or after schema changes)
pnpm --filter @workspace/db run push

# Start API server (builds esbuild + serves everything)
pnpm --filter @workspace/api-server run dev

# Start frontend dev server (hot reload, proxies API to api-server)
pnpm --filter @workspace/custom-audio-stories run dev
```

The dev script (`run dev`) always runs esbuild but skips Vite (`SKIP_VITE_BUILD=1`), so the frontend dev server handles hot reload separately.
