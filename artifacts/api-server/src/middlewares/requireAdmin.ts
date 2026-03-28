import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

/**
 * Derives the admin API key from the existing OPENROUTER_API_KEY secret via
 * HMAC-SHA256.  This means no additional plaintext secret lives in source or
 * env files — the key is computable only by anyone who already holds the
 * OPENROUTER_API_KEY.  Scripts can compute the same value with:
 *   node -e "const c=require('crypto');console.log(c.createHmac('sha256',process.env.OPENROUTER_API_KEY).update('private-story-admin-v1').digest('hex'))"
 */
function deriveAdminApiKey(): string {
  const base = process.env.OPENROUTER_API_KEY ?? "";
  if (!base) return "";
  return crypto.createHmac("sha256", base).update("private-story-admin-v1").digest("hex");
}

/** True if the request carries a valid HMAC-derived x-admin-token (script access). */
export function isTokenAdmin(req: any): boolean {
  if (!ADMIN_EMAIL) return false;
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token) return false;
  const derived = deriveAdminApiKey();
  if (!derived) return false;
  const tBuf = Buffer.from(token, "utf8");
  const dBuf = Buffer.from(derived, "utf8");
  if (tBuf.length !== dBuf.length) return false;
  return crypto.timingSafeEqual(tBuf, dBuf);
}

/** True if the request has a valid admin session (DB flag or ADMIN_EMAIL match). */
export function isSessionAdmin(req: any): boolean {
  const user = req.user as { email?: string; isAdmin?: boolean } | undefined;
  if (user?.isAdmin === true) return true;
  if (ADMIN_EMAIL && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  return false;
}

/** True if the request is from an admin (via session or HMAC token). */
export function isAdmin(req: any): boolean {
  return isSessionAdmin(req) || isTokenAdmin(req);
}

/**
 * Router-level middleware: blocks all admin routes unless the caller is a
 * verified admin. Session-based admins additionally must have completed a TOTP
 * or backup-code challenge during THIS session (twoFactorVerifiedAt !== null) —
 * checking enrollment alone is insufficient because a session created by the
 * "enable 2FA" flow or a compromised token would pass an enrollment-only check.
 * Token-based access (HMAC x-admin-token for scripts) bypasses the 2FA check
 * because the token is already derived from a high-entropy secret.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (isTokenAdmin(req)) {
    // Script access via HMAC token — already high-security, no 2FA check needed
    next();
    return;
  }
  if (!isSessionAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  // Session-based admin: require 2FA completion for THIS session.
  // twoFactorVerifiedAt is stamped by authMiddleware only when the session was
  // created via a TOTP/backup-code challenge — null means the session predates
  // or bypassed the 2FA flow.
  const user = req.user as { twoFactorVerifiedAt?: Date | null } | undefined;
  if (!user?.twoFactorVerifiedAt) {
    res.status(403).json({
      error: "Admin access requires two-factor authentication. Please log out and sign in with 2FA.",
      code: "ADMIN_2FA_REQUIRED",
    });
    return;
  }
  next();
}
