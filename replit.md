# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/custom-audio-stories` (`@workspace/custom-audio-stories`)

React + Vite frontend for the Custom Audio Stories app. Premium dark UI (Netflix × Calm aesthetic).

- Pages: Home, Browse, Search, Create, Gift, StoryDetail, SeriesList, SeriesDetail, Library
- The Create page runs the full AI story generation pipeline with 7 loading phases
- Audio player with scene-sync (image changes as audio progresses) via `use-audio-player` Zustand store
- Connects to API server via generated React Query hooks from `@workspace/api-client-react`
- Auth: better-auth v1 with email+password + Google OAuth; `AuthModal` component (sign-in/up tabs) wired into Layout; `useAuth` hook with `openSignIn`/`openSignUp`/`logout`; `authClient.ts` uses `createAuthClient` from `better-auth/react`

### Gift Purchase Funnel

`/gift` — 8-step multi-part builder for personalised romantic audio story gifts:
- Steps: Who it's for → Mood → Personal details → Setting → Voice → Length (pricing) → Add-ons → Review
- Pricing: Short £9.99 / Standard £17.99 / Deluxe £24.99; 8 add-ons at £2.99–£14.99 each
- On submit: `POST /api/gift/orders` → orderId → confirmation screen
- `GiftFAQ` reusable accordion component (9 questions)
- Home page updated with gift positioning section, occasion tags, sample previews, trust strip, FAQ, gift CTA banners

### Auth (better-auth)

- `lib/db/src/schema/auth.ts` — `usersTable`, `baSessionsTable`, `baAccountsTable`, `baVerificationsTable`
- `artifacts/api-server/src/lib/auth.ts` — `betterAuth()` with drizzleAdapter, emailAndPassword, Google social provider
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — populates `req.user` from session
- `artifacts/api-server/src/app.ts` — `app.all("/api/auth{/*path}", toNodeHandler(auth))`
- `BETTER_AUTH_SECRET` is set in env. Google OAuth needs `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` from user.

### `artifacts/api-server` AI Generation Pipeline

The API server at `/api/generate-full-story` runs a fully hidden pipeline:

1. **normaliseIntake()** — validates and enriches raw user input before anything else
2. **Request hash caching** — deterministic hash(name+mood+intensity+length+scenario+...) checked against `data/generatedCache.json` for instant repeat-request returns
3. **planStory()** — hidden GPT-4o story architect with Story Bible pools (4 emotional arcs, 6 relationship dynamics, 5 conflict types, 5 ending types, 4 sensory palettes) for controlled variety. Returns brief with `recommendation_tags` and `quality_target`.
4. **writeStoryFromBrief()** — **Mistral Large** (`mistralai/mistral-large-2512` via OpenRouter) story writer producing scenes with `emotionalShift` per scene. Uses `OPENROUTER_API_KEY`. Mistral is used here because it allows explicit adult content between adults without over-refusals.
5. **qcStory()** — 7-dimension quality evaluation (emotional_depth, specificity, pacing, scene_progression, originality, sensory_detail, ending_strength). Threshold 7.5 average, ending_strength >= 7
6. **rewriteStory() / rewriteStoryAsVariation()** — targeted rewrite (max one pass) also via **Mistral Large** on OpenRouter; uses 5 strategies: rewrite_ending, increase_specificity, tighten_scene_flow, increase_vulnerability, rotate_dynamic_or_setting
7. **buildImagePrompts()** — cohesive image prompt generation for cover + all scenes
8. **Parallel**: generateAllImages() + generateAudioFile() — images via OpenAI, audio via ElevenLabs

Generated stories are persisted to the PostgreSQL `generated_stories` table. Deduplication cache in `generated_cache` table.

### `artifacts/api-server/src/lib/storage.ts`

Database-backed (Drizzle + PostgreSQL) persistence layer. All user-specific data is now stored in the DB (not JSON files).

Tables:
- `generated_stories` — AI-generated stories with scenes, audio, images, brief, QC data; keyed by story ID
- `user_library` — (userId, storyId, type: 'saved'|'generated'|'variation') with unique constraint per user+story
- `user_progress` — listening progress (audioProgressSeconds, sceneIndex) per userId/storyId PK
- `user_taste` — taste profile JSONB columns (tasteProfile, preferredIntensity, preferredVoiceFeel, preferredEndings, preferredRelationshipDynamics) per userId
- `generated_cache` — request hash → story ID for deduplication (survives restarts)

Exports (all async):
- `storiesStore` — `getAll()`, `get(id)`, `set(id, story)` — upsert-based
- `libraryStore` — `getSavedStoryIds`, `getGeneratedStoryIds`, `addSaved`, `removeSaved`, `addGenerated`
- `tasteStore` — `get(userId)`, `upsert(userId, taste)`
- `progressStore` — `get`, `set`, `delete`, `getUserProgress`
- `generatedCacheStore` — `get(hash)`, `set(hash, storyId)`
- `usersStore` — backwards-compat aggregated profile fetch (combines taste + library)

### Admin API & Library Seed Integrity

The API server exposes admin endpoints under `/api/admin/*` protected by an HMAC-derived token:

```bash
# Generate admin token (requires OPENROUTER_API_KEY in environment)
ADMIN_TOKEN=$(node -e "const c=require('crypto');console.log(c.createHmac('sha256',process.env.OPENROUTER_API_KEY).update('private-story-admin-v1').digest('hex'))")
# Use as: -H "X-Admin-Token: $ADMIN_TOKEN"
```

Key admin endpoints:
- `GET /api/admin/library` — list all library stories
- `GET /api/admin/categories` — list categories
- `POST /api/admin/generate-one-sync` — regenerate a single library story (body: `{categoryId, subthemeId}`)
- `DELETE /api/admin/story/:id` — delete a story by ID

**Library seed verification**: `artifacts/api-server/src/lib/library-seed-verification.json` tracks the 40-story library state. Key invariants:
- `totalStories: 40` — one published story per non-custom subtheme (10 categories × 4 subthemes each)
- `dnaAdjacencyViolations: 0` — no two alphabetically-adjacent stories share the same `story_dna.power_dynamic` + `story_dna.emotional_engine` combination
- DNA is stored in `generated_stories.story_dna` JSONB column; query: `story_dna->>'power_dynamic'`

After any reseed operation, run this to verify adjacency (alphabetical order matches the JSON):
```bash
psql "$DATABASE_URL" -t -A -c "SELECT story_dna->>'power_dynamic', story_dna->>'emotional_engine' FROM generated_stories WHERE id LIKE 'lib-%' AND is_library_story=true ORDER BY category_id, subtheme_id" | awk -F'|' 'prev==$1"|"$2{print "VIOLATION: " $0} {prev=$1"|"$2}'
```

**Library taxonomy** (frontend `Browse.tsx` ↔ backend `storyCategories.ts`):
The 10 SEO categories must match exactly between frontend and backend:
`forbidden_desire`, `dominant_surrendered`, `late_night`, `explicit_collection`, `slow_burn`, `emotional_desire`, `second_chance`, `dark_romance`, `historical_romance`, `first_time`

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
