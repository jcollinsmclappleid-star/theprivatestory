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
      approvedListenerName?: string | null;
      approvedPartnerName?: string | null;
    }

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

/** Admin sessions are hard-expired after 30 minutes of inactivity */
const ADMIN_SESSION_MAX_IDLE_MS = 30 * 60 * 1000;

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
      let approvedListenerName: string | null = null;
      let approvedPartnerName: string | null = null;
      let twoFactorEnabled = false;
      let twoFactorVerifiedAt: Date | null = null;
      try {
        const [dbUser] = await db
          .select({
            isAdmin: usersTable.isAdmin,
            riskScore: usersTable.riskScore,
            deletedAt: usersTable.deletedAt,
            approvedListenerName: usersTable.approvedListenerName,
            approvedPartnerName: usersTable.approvedPartnerName,
            twoFactorEnabled: usersTable.twoFactorEnabled,
          })
          .from(usersTable)
          .where(eq(usersTable.id, session.user.id))
          .limit(1);
        isAdmin = dbUser?.isAdmin ?? false;
        riskScore = dbUser?.riskScore ?? 0;
        deletedAt = dbUser?.deletedAt ?? null;
        approvedListenerName = dbUser?.approvedListenerName ?? null;
        approvedPartnerName = dbUser?.approvedPartnerName ?? null;
        twoFactorEnabled = dbUser?.twoFactorEnabled ?? false;

        // For admin accounts, look up whether this specific session was created
        // via a TOTP or backup-code challenge (twoFactorVerifiedAt is stamped
        // by auth.ts databaseHooks.session.create.before only on those paths).
        if (isAdmin) {
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

      // Admin sessions are hard-expired after 30 minutes of inactivity.
      // session.session.updatedAt is refreshed by better-auth on every request,
      // so this is effectively an inactivity timeout.
      // Return 401 (not 403) so the client can distinguish "session expired, please
      // re-authenticate" from "insufficient privileges" (which is 403).
      if (isAdmin) {
        const lastActivity =
          session.session.updatedAt instanceof Date
            ? session.session.updatedAt
            : new Date(session.session.updatedAt as string);
        const idleMs = Date.now() - lastActivity.getTime();
        if (idleMs > ADMIN_SESSION_MAX_IDLE_MS) {
          res.status(401).json({
            error: "Admin session expired. Please log in again.",
            code: "ADMIN_SESSION_EXPIRED",
          });
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
        approvedListenerName,
        approvedPartnerName,
      };
    }
  } catch {
    // session read failure — treat as unauthenticated
  }

  next();
}
