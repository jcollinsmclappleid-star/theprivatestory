import { type Request, type Response, type NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { db, usersTable, baSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    // Base auth user fields (mirrors AuthUser from the API schema).
    // We inline these here rather than extending the generated type so there is no
    // dependency on a package that may not export the symbol under the same name.
    interface User {
      id: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
      // Admin / safety extensions
      isAdmin?: boolean;
      riskScore?: number;
      twoFactorEnabled?: boolean;
      /** Non-null only when the session was created via TOTP or backup-code verification. */
      twoFactorVerifiedAt?: Date | null;
    }

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User | undefined;
      /**
       * Set to true when an admin session has exceeded the inactivity threshold.
       * authMiddleware sets this and clears req.user so that non-admin routes
       * treat the request as unauthenticated. requireAdmin checks it and returns
       * 401 ADMIN_SESSION_EXPIRED specifically for admin-protected routes.
       */
      adminSessionExpired?: boolean;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

/** Admin sessions are hard-expired after 30 minutes of inactivity */
const ADMIN_SESSION_MAX_IDLE_MS = 30 * 60 * 1000;

/**
 * The ADMIN_EMAIL env var defines the email address that is treated as admin
 * even if the DB `isAdmin` flag is not set. Must be consistent with the check
 * in requireAdmin.ts (isSessionAdmin).
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

function isEmailAdmin(email: string | null | undefined): boolean {
  if (!ADMIN_EMAIL || !email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user?.id) {
      const u = session.user as Record<string, unknown>;

      // Look up the user's isAdmin, riskScore, deletedAt, 2FA status, and approved names from the DB
      let isAdmin = false;
      let riskScore = 0;
      let deletedAt: Date | null = null;
      let twoFactorEnabled = false;
      let twoFactorVerifiedAt: Date | null = null;
      try {
        const [dbUser] = await db
          .select({
            isAdmin: usersTable.isAdmin,
            riskScore: usersTable.riskScore,
            deletedAt: usersTable.deletedAt,
            twoFactorEnabled: usersTable.twoFactorEnabled,
          })
          .from(usersTable)
          .where(eq(usersTable.id, session.user.id))
          .limit(1);
        isAdmin = dbUser?.isAdmin ?? false;
        riskScore = dbUser?.riskScore ?? 0;
        deletedAt = dbUser?.deletedAt ?? null;
        twoFactorEnabled = dbUser?.twoFactorEnabled ?? false;

        // An "effective admin" is one with the DB isAdmin flag OR whose email
        // matches ADMIN_EMAIL. Both identities require 2FA and the idle check,
        // so we load twoFactorVerifiedAt for either.  Not doing so for email-based
        // admins would cause requireAdmin to always block them on the 2FA gate even
        // after a valid TOTP challenge.
        const effectiveAdmin = isAdmin || isEmailAdmin(session.user.email as string);

        if (effectiveAdmin) {
          const [baSession] = await db
            .select({ twoFactorVerifiedAt: baSessionsTable.twoFactorVerifiedAt })
            .from(baSessionsTable)
            .where(eq(baSessionsTable.token, session.session.token))
            .limit(1);
          twoFactorVerifiedAt = baSession?.twoFactorVerifiedAt ?? null;
        }
      } catch {
        // DB lookup failure — default to safe values
      }

      // Soft-deleted accounts are treated as unauthenticated
      if (deletedAt) {
        next();
        return;
      }

      // Admin sessions (by DB flag or email) are hard-expired after 30 minutes of
      // inactivity. session.session.updatedAt is refreshed by better-auth every
      // updateAge seconds (set to 10 min in auth.ts so this check is accurate
      // within a 10-minute window).
      // We do NOT respond with 401 here — instead we set req.adminSessionExpired = true
      // and leave req.user unset so that:
      //   • Non-admin routes treat the request as unauthenticated (no disruption).
      //   • requireAdmin checks the flag and returns 401 ADMIN_SESSION_EXPIRED
      //     specifically on admin-protected routes.
      const effectiveAdmin = isAdmin || isEmailAdmin(session.user.email as string);
      if (effectiveAdmin) {
        const lastActivity =
          session.session.updatedAt instanceof Date
            ? session.session.updatedAt
            : new Date(session.session.updatedAt as string);
        const idleMs = Date.now() - lastActivity.getTime();
        if (idleMs > ADMIN_SESSION_MAX_IDLE_MS) {
          req.adminSessionExpired = true;
          next();
          return;
        }
      }

      req.user = {
        id: session.user.id,
        email: (session.user.email as string) ?? null,
        firstName: (u.firstName as string) ?? null,
        lastName: (u.lastName as string) ?? null,
        profileImageUrl:
          (u.profileImageUrl as string) ?? (session.user.image as string) ?? null,
        isAdmin,
        riskScore,
        twoFactorEnabled,
        twoFactorVerifiedAt,
      };
    }
  } catch {
    // session read failure — treat as unauthenticated
  }

  next();
}
