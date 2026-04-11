# Overview

This project is a pnpm workspace monorepo using TypeScript, designed to build and deploy a sophisticated AI-powered custom audio story generation platform. The core business vision is to provide personalized romantic audio stories, offering a unique blend of AI creativity and user customization. The platform aims to capture market share in the digital entertainment and personalized content sectors by offering a premium, Netflix-meets-Calm aesthetic experience.

Key capabilities include:
- Generating full, personalized audio stories based on user input.
- Advanced AI pipeline for story planning, writing, quality control, rewriting, image prompt generation, and audio synthesis.
- A React-based Single Page Application (SPA) for user interaction, including a multi-step gift purchase funnel.
- Robust authentication using `better-auth` with email/password and Google OAuth.
- Comprehensive content safety measures, including multi-layered moderation and rate limiting.
- Admin functionalities for managing library content and user submissions.
- SEO-optimized landing pages with Server-Side Rendering (SSR) for discoverability.

The project emphasizes a modular architecture, leveraging pnpm workspaces for efficient dependency management and build processes.

# User Preferences

I prefer concise and direct communication. When making changes, please prioritize iterative development. Ask for confirmation before implementing major architectural changes or introducing new external dependencies.

# System Architecture

The project is structured as a pnpm workspace monorepo.

**Monorepo Tools & Core Technologies:**
- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

**Project Structure:**
- `artifacts/`: Contains deployable applications (e.g., `api-server`, `custom-audio-stories`).
- `lib/`: Houses shared libraries (`api-spec`, `api-client-react`, `api-zod`, `db`).
- `scripts/`: Utility scripts.

**TypeScript & Composite Projects:**
- All packages use `composite: true` and extend `tsconfig.base.json`.
- Root `tsconfig.json` defines project references for correct cross-package type checking.
- `emitDeclarationOnly` is used for type checking; `esbuild` handles JS bundling.

**UI/UX Decisions (Custom Audio Stories SPA):**
- Frontend is a React + Vite application with a premium dark UI (Netflix × Calm aesthetic).
- Features pages like Home, Browse, Search, Create, Gift, StoryDetail, SeriesList, SeriesDetail, Library.
- An 8-step multi-part builder for personalized romantic audio story gifts, including pricing and add-ons.
- Integrated audio player with scene-sync functionality.
- AuthModal component for sign-in/up, `useAuth` hook for authentication management.

**Technical Implementations & Feature Specifications:**

**API Server (`artifacts/api-server`):**
- **Core Functionality**: Serves SSR HTML, API endpoints, and the React SPA.
- **Request Routing Order**:
    1. Brand assets static (`public/brand/`)
    2. SSR router (for SEO routes)
    3. API router (`/api/*` endpoints)
    4. Client static (`public/client/`)
    5. SPA catch-all (`/.*`) serving `public/client/index.html`.
- **React SPA Build Output**: Vite builds to `artifacts/api-server/public/client/` to ensure correct serving by Express.
- **AI Generation Pipeline (`/api/generate-full-story`)**:
    1. `normaliseIntake()`: Validates and enriches user input.
    2. Request hash caching: Deduplication for repeat requests.
    3. `planStory()`: GPT-4o story architect using Story Bible pools.
    4. `writeStoryFromBrief()`: Mistral Large story writer, produces scenes with `emotionalShift`.
    5. `qcStory()`: 7-dimension quality evaluation.
    6. `rewriteStory()` / `rewriteStoryAsVariation()`: Targeted rewrites using Mistral Large.
    7. `buildImagePrompts()`: Cohesive image prompt generation.
    8. Parallel `generateAllImages()` (OpenAI) and `generateAudioFile()` (ElevenLabs).
- **Storage (`src/lib/storage.ts`)**: Database-backed persistence using Drizzle and PostgreSQL for user data, generated stories, library, progress, taste profiles, caches, and user presets.
    - Tables: `generated_stories`, `user_library`, `user_progress`, `user_taste`, `generated_cache`, `user_presets`, `name_submissions`, `series`, `content_blocks`.
- **Content Safety & Rate Limiting**:
    - **Input Moderation (4 layers)**: Prompt injection detection, keyword blocklist, OpenAI Moderation API, `PROHIBITED_CONTENT_BLOCK` in system prompts.
    - **Output Moderation (2 layers)**: OpenAI Moderation API, Mistral secondary QC.
    - **Rate Limiting**: Global (200 req/15 min) and Generation-specific (15 req/hour per user).
    - **Blocked-request audit log**: Structured logging and persistence to `content_blocks` table.
    - **Age gate**: Full-screen modal on first visit to `Create.tsx`.
- **Admin API (`/api/admin/*`)**: Protected by HMAC token for managing library stories, categories, name submissions, and performing regenerations.
- **Library Seed Integrity**: Tracks 40-story library state with invariants for total stories and DNA adjacency.
- **SEO Landing Pages**: 24 SSR HTML routes in `src/pages/seo/` for core, bedtime, romantic, intimate, genre/audience, and comparison clusters. Each page uses `SEOPage.tsx` and includes FAQPage + BreadcrumbList + WebPage JSON-LD.

**Database Layer (`lib/db`):**
- Uses Drizzle ORM with PostgreSQL.
- Exports Drizzle client and schema models.
- Drizzle Kit for migrations; `push` and `push-force` commands for development.

**API Specification & Codegen (`lib/api-spec`):**
- Owns `openapi.yaml` and `orval.config.ts`.
- Generates React Query hooks (`lib/api-client-react`) and Zod schemas (`lib/api-zod`).

**Authentication (`better-auth`):**
- Integrated into `lib/db/src/schema/auth.ts` (users, sessions, accounts, verifications tables).
- `artifacts/api-server/src/lib/auth.ts` configures `betterAuth()` with `drizzleAdapter`, email/password, and Google social provider.
- `authMiddleware.ts` populates `req.user` from session.

# External Dependencies

- **PostgreSQL**: Primary database for all persistent data.
- **OpenAI API**: Used for image generation and content moderation.
- **ElevenLabs API**: Used for audio file generation.
- **OpenRouter API**: Used to access Mistral Large for story writing, rewriting, and secondary output moderation.
- **Google OAuth**: Integrated for social login via `better-auth`.
- **`express-rate-limit`**: Middleware for API rate limiting.
- **`pino`**: Logging library.