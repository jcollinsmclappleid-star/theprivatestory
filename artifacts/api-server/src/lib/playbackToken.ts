import crypto from "crypto";

const TTL_MS = Number(process.env.PLAYBACK_TOKEN_TTL_MS ?? 60 * 60 * 1000);

function signingSecret(): string {
  return (
    process.env.PLAYBACK_TOKEN_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET ||
    "dev-secret-change-in-production"
  );
}

/** HMAC-signed query params so guests can stream their just-generated media for ~1 hour. */
export function signProtectedMediaUrl(urlPath: string): string {
  if (!urlPath.startsWith("/api/audio/") && !urlPath.startsWith("/api/images/")) {
    return urlPath;
  }
  const base = urlPath.split("?")[0]!;
  const exp = Date.now() + TTL_MS;
  const sig = crypto.createHmac("sha256", signingSecret()).update(`${base}:${exp}`).digest("hex");
  return `${base}?playback=${exp}&sig=${sig}`;
}

export function verifyProtectedMediaToken(urlPath: string, exp: string, sig: string): boolean {
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || Date.now() > expNum) return false;
  const expected = crypto
    .createHmac("sha256", signingSecret())
    .update(`${urlPath}:${expNum}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
