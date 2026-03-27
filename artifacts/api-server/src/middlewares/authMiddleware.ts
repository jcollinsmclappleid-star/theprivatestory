import { type Request, type Response, type NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { AuthUser } from "@workspace/api-zod";
import { auth } from "../lib/auth.js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends AuthUser {
      isAdmin?: boolean;
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

      // Look up the user's isAdmin flag from the DB
      let isAdmin = false;
      try {
        const [dbUser] = await db
          .select({ isAdmin: usersTable.isAdmin })
          .from(usersTable)
          .where(eq(usersTable.id, session.user.id))
          .limit(1);
        isAdmin = dbUser?.isAdmin ?? false;
      } catch {
        // DB lookup failure — default to false
      }

      req.user = {
        id: session.user.id,
        email: (session.user.email as string) ?? null,
        firstName: (u.firstName as string) ?? null,
        lastName: (u.lastName as string) ?? null,
        profileImageUrl:
          (u.profileImageUrl as string) ?? (session.user.image as string) ?? null,
        isAdmin,
      };
    }
  } catch {
    // session read failure — treat as unauthenticated
  }

  next();
}
