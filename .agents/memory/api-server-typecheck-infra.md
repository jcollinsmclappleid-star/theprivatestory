---
name: api-server typecheck vs runtime build
description: Why standalone tsc on api-server shows errors but the server runs fine
---

Running `tsc --noEmit` on the `api-server` package in isolation reports many errors
(missing `@workspace/db` exports, "output file has not been built" TS6305, etc).
These are NOT regressions and NOT from feature code.

**Why:** The api-server runtime is built by esbuild (`build.mjs`), which transpiles
per-file with no cross-package type-checking — that is the authoritative path the
dev workflow uses, and it boots fine. Real type-checking is `pnpm run typecheck`,
which runs `typecheck:libs` (`tsc --build`) FIRST to emit the shared lib `.d.ts`
outputs. As of this writing `typecheck:libs` itself fails on pre-existing errors in
the lib packages (`api-zod` duplicate re-exports, missing `node`/`react` type defs,
`integrations-openai-ai-server` internals). Because those `.d.ts` files never get
emitted, any downstream `tsc` on api-server cascades into "missing export / not
built" noise.

**How to apply:** To verify api-server edits compile, restart the workflow and
confirm the esbuild "Done in …ms" + "Server listening" log lines. Do not treat
standalone-`tsc` lib-resolution errors as your regression unless they point at your
own edited lines.
