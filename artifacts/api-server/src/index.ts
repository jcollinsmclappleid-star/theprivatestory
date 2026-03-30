import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Story generation pipelines (plan + write + images) can take up to 10 minutes.
// Raise the Node HTTP server timeouts so the connection is never dropped by the
// transport layer before the app-level timeout fires.
server.timeout = 0;               // disable idle socket timeout (keep-alive handled by proxy)
server.requestTimeout = 660_000;  // 11 min — slightly longer than the app-level 10 min guard
server.headersTimeout = 70_000;   // 70 s for initial headers (well above normal request start)
