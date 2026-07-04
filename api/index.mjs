import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(__dirname, "../artifacts/api-server/dist/app.mjs");

if (!existsSync(appPath)) {
  throw new Error(
    `Express bundle not found at ${appPath}. Ensure vercel-build ran and includeFiles bundles artifacts/api-server/dist/.`,
  );
}

let app;
try {
  ({ default: app } = await import(pathToFileURL(appPath).href));
} catch (err) {
  console.error("[api/index] Failed to load Express app:", err);
  throw err;
}

export default app;
