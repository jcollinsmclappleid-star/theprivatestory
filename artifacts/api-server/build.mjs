import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm, cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  const workspaceRoot = path.resolve(artifactDir, "..", "..");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [
      path.resolve(artifactDir, "src/index.ts"),
      path.resolve(artifactDir, "src/app.ts"),
    ],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
    // Some of the packages below may not be imported or installed, but we're adding them in case they are in the future.
    // Examples of unbundleable packages:
    // - uses native modules and loads them dynamically (e.g. sharp)
    // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino relies on workers to handle logging, instead of externalizing it we use a plugin to handle it
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });

  // Copy pre-generated static assets (e.g. category images) into public/ so
  // the server can serve them at runtime.  The server's publicDir resolves to
  // artifacts/api-server/public/ (one level above dist/), NOT dist/public/.
  // public-static/ is committed to git and is the authoritative source for
  // these files; public/ is the runtime serving directory.
  const staticSrc = path.resolve(artifactDir, "public-static");
  if (existsSync(staticSrc)) {
    const staticDest = path.resolve(artifactDir, "public");
    await mkdir(staticDest, { recursive: true });
    await cp(staticSrc, staticDest, { recursive: true });
    console.log("Copied public-static → public");
  }

  // Build the React SPA (custom-audio-stories) unless we are in a dev-restart
  // loop (SKIP_VITE_BUILD=1 is exported by the dev script to keep restarts
  // fast). On Vercel we always rebuild from source — SKIP_VITE_BUILD must not
  // skip the client there or production serves stale index.html / JS hashes.
  const skipVite = process.env.SKIP_VITE_BUILD === "1" && !process.env.VERCEL;
  if (!skipVite) {
    const pnpmBin = "npx pnpm";
    console.log("Building React SPA (Vite)…");
    execSync(
      `${pnpmBin} --filter @workspace/custom-audio-stories run build`,
      {
        cwd: workspaceRoot,
        stdio: "inherit",
        env: { ...process.env, PORT: "3000", BASE_PATH: "/" },
      },
    );
    // Clean up any leftover dist/public/ in custom-audio-stories so Replit's
    // deployment infrastructure does not register a conflicting static handler
    // for that directory (which would intercept SSR routes before Express sees them).
    const staleDist = path.resolve(artifactDir, "..", "custom-audio-stories", "dist");
    if (existsSync(staleDist)) {
      await rm(staleDist, { recursive: true, force: true });
      console.log("Removed stale custom-audio-stories/dist/");
    }
    console.log("React SPA build complete → public/client/");
  } else {
    console.log("SKIP_VITE_BUILD=1 — skipping React SPA build (dev mode)");
  }

  // Act IV WebP variants (smaller hero carousel loads on mobile).
  const webpScript = path.resolve(artifactDir, "scripts/convertExpressAct4ToWebp.mjs");
  if (existsSync(webpScript)) {
    console.log("Generating Act IV WebP variants…");
    execSync("node ./scripts/convertExpressAct4ToWebp.mjs", {
      cwd: artifactDir,
      stdio: "inherit",
    });
  }

  // Vercel: bundle SPA into dist/public/client for the serverless function (SPA fallback).
  // Large images stay in repo /public/ and are served by the Vercel CDN before rewrites.
  if (process.env.VERCEL) {
    const clientSrc = path.resolve(artifactDir, "public/client");
    const clientDest = path.resolve(distDir, "public/client");
    if (existsSync(clientSrc)) {
      await mkdir(path.dirname(clientDest), { recursive: true });
      await cp(clientSrc, clientDest, { recursive: true });
      console.log("Vercel: copied public/client → dist/public/client");
    }

    const publicRoot = path.resolve(workspaceRoot, "public");
    const serverPublic = path.resolve(artifactDir, "public");
    if (existsSync(serverPublic)) {
      await cp(serverPublic, publicRoot, { recursive: true });
      console.log("Vercel: copied api-server/public → repo public/");
    }
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
