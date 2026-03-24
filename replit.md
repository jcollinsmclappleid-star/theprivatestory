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

- Pages: Home, Browse, Search, Create, StoryDetail, SeriesList, SeriesDetail, Library (coming Task #4)
- The Create page runs the full AI story generation pipeline with 7 loading phases
- Audio player with scene-sync (image changes as audio progresses) via `use-audio-player` Zustand store
- Connects to API server via generated React Query hooks from `@workspace/api-client-react`

### `artifacts/api-server` AI Generation Pipeline

The API server at `/api/generate-full-story` runs a fully hidden pipeline:

1. **normaliseIntake()** — validates and enriches raw user input before anything else
2. **Request hash caching** — deterministic hash(name+mood+intensity+length+scenario+...) checked against `data/generatedCache.json` for instant repeat-request returns
3. **planStory()** — hidden GPT-4o story architect with Story Bible pools (4 emotional arcs, 6 relationship dynamics, 5 conflict types, 5 ending types, 4 sensory palettes) for controlled variety. Returns brief with `recommendation_tags` and `quality_target`.
4. **writeStoryFromBrief()** — GPT-4o story writer producing scenes with `emotionalShift` per scene
5. **qcStory()** — 7-dimension quality evaluation (emotional_depth, specificity, pacing, scene_progression, originality, sensory_detail, ending_strength). Threshold 7.5 average, ending_strength >= 7
6. **rewriteStory()** — targeted rewrite (max one pass) using one of 5 strategies: rewrite_ending, increase_specificity, tighten_scene_flow, increase_vulnerability, rotate_dynamic_or_setting
7. **buildImagePrompts()** — cohesive image prompt generation for cover + all scenes
8. **Parallel**: generateAllImages() + generateAudioFile() — images via OpenAI, audio via ElevenLabs

Generated stories persisted to `artifacts/api-server/data/stories.json`. Cache entries in `data/generatedCache.json`.

### `artifacts/api-server/src/lib/storage.ts`

JSON file persistence layer for all server-side data. Files live at `artifacts/api-server/data/`:
- `stories.json` — all generated stories by ID
- `generatedCache.json` — request hash → story ID for deduplication
- `users.json` — taste profiles + saved/generated story IDs per userId (used in Task #4+)
- `progress.json` — listening progress per userId/storyId (used in Task #4+)

Exports: `storiesStore`, `usersStore`, `progressStore`, `generatedCacheStore` — each with typed get/set/getAll methods. Atomic writes via temp file + rename.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
