import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

/**
 * Token-based admin access for scripts (CI, data export, etc.).
 * Set ADMIN_SCRIPT_KEY to a high-entropy random secret (e.g. openssl rand -hex 32).
 * Send as `x-admin-token` header. Disabled (returns false) if the env var is unset.
 *
 * This replaces the previous OPENROUTER_API_KEY-derived approach so the admin
 * token is a dedicated, independently rotatable secret rather than being
 * entangled with the AI gateway credential.
 */
export function isTokenAdmin(req: any): boolean {
  const scriptKey = process.env.ADMIN_SCRIPT_KEY ?? "";
  if (!scriptKey) return false;
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token) return false;
  const tBuf = Buffer.from(token, "utf8");
  const kBuf = Buffer.from(scriptKey, "utf8");
  if (tBuf.length !== kBuf.length) return false;
  return crypto.timingSafeEqual(tBuf, kBuf);
}

/** True if the request has a valid admin session (DB flag or ADMIN_EMAIL match). */
export function isSessionAdmin(req: any): boolean {
  const user = req.user as { email?: string; isAdmin?: boolean } | undefined;
  if (user?.isAdmin === true) return true;
  if (ADMIN_EMAIL && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  return false;
}

/** True if the request is from an admin (via session or script token). */
export function isAdmin(req: any): boolean {
  return isSessionAdmin(req) || isTokenAdmin(req);
}

/**
 * Router-level middleware: blocks all admin routes unless the caller is a
 * verified admin. Session-based admins additionally must have completed a TOTP
 * or backup-code challenge during THIS session (twoFactorVerifiedAt !== null) —
 * checking enrollment alone is insufficient because a session created by the
 * "enable 2FA" flow or a compromised token would pass an enrollment-only check.
 *
 * Script access via ADMIN_SCRIPT_KEY bypasses the 2FA check because the key is
 * a dedicated high-entropy secret, independently rotatable from the session.
 *
 * Exported for use by any router that gates admin functionality (admin.ts, names.ts).
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (isTokenAdmin(req)) {
    next();
    return;
  }

  // authMiddleware sets adminSessionExpired when it detects an idle admin session
  // but intentionally does NOT respond so that non-admin routes remain usable.
  // We surface the 401 here, scoped only to admin-protected routes.
  if ((req as any).adminSessionExpired) {
    res.status(401).json({
      error: "Admin session expired due to inactivity. Please log in again.",
      code: "ADMIN_SESSION_EXPIRED",
    });
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
