import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { db, usersTable, baSessionsTable, baAccountsTable, baVerificationsTable, baTwoFactorTable } from "@workspace/db";
import { sendEmail } from "./email.js";

const USER_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateUserCode(): string {
  let code = "TPS-";
  for (let i = 0; i < 6; i++) {
    code += USER_CODE_CHARS[Math.floor(Math.random() * USER_CODE_CHARS.length)];
  }
  return code;
}

function getBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return "http://localhost:8080";
}

function getTrustedOrigins(): string[] {
  const origins = new Set<string>();
  origins.add(getBaseURL());
  origins.add("https://theprivatestory.com");
  if (process.env.REPLIT_DEV_DOMAIN) {
    origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }
  if (process.env.REPLIT_DOMAINS) {
    for (const d of process.env.REPLIT_DOMAINS.split(",")) {
      origins.add(`https://${d.trim()}`);
    }
  }
  return [...origins];
}

export const auth = betterAuth({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: baSessionsTable,
      account: baAccountsTable,
      verification: baVerificationsTable,
      twoFactor: baTwoFactorTable,
    },
  }),

  plugins: [
    twoFactor({
      issuer: "My Private Story",
      totpOptions: {
        digits: 6,
        period: 30,
      },
    }),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your My Private Story password",
        text: `You requested a password reset.\n\nClick the link below to choose a new password:\n\n${url}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore it.`,
        html: `<p>You requested a password reset.</p><p><a href="${url}">Reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore it.</p>`,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const parts = (user.name ?? "").trim().split(/\s+/);
          const firstName = parts[0] ?? "";
          const lastName = parts.slice(1).join(" ") || null;
          const userCode = generateUserCode();
          return {
            data: {
              ...user,
              firstName,
              lastName: lastName,
              profileImageUrl: user.image ?? null,
              userCode,
            },
          };
        },
      },
    },
    session: {
      create: {
        /**
         * Stamp twoFactorVerifiedAt on sessions that are created as a direct
         * result of the user completing a TOTP or backup-code challenge. All
         * other session creation paths (normal sign-in, "enable 2FA" flow, etc.)
         * leave this field null so admin routes can distinguish them.
         *
         * The second argument is the current better-auth request context which
         * carries the endpoint path — we use a type-safe duck-type check because
         * the context type is not exported by the library.
         */
        before: async (session, ctx: unknown) => {
          const path = (ctx as { path?: string } | null)?.path ?? "";
          const isTotpVerification =
            path.endsWith("/two-factor/verify-totp") ||
            path.endsWith("/two-factor/verify-backup-code");
          return {
            data: {
              ...session,
              twoFactorVerifiedAt: isTotpVerification ? new Date() : null,
            },
          };
        },
      },
    },
  },

  session: {
    // Sessions expire after 30 days of absolute time for regular users.
    // Admin sessions are hard-expired at 2 hours of inactivity by authMiddleware,
    // so this value only controls the outer envelope (not reached in practice for admins).
    expiresIn: 60 * 60 * 24 * 30,
    // Refresh the session record (updatedAt) every 10 minutes of activity.
    // This must be shorter than the 2-hour admin idle threshold so that
    // authMiddleware's inactivity check based on session.updatedAt is accurate
    // within a 10-minute window. Without this, updatedAt could be stale,
    // making the admin inactivity check unreliable.
    updateAge: 10 * 60,
    // Sessions are considered "fresh" (eligible for re-confirmation prompts) for 24 h.
    freshAge: 60 * 60 * 24,
  },

  advanced: {
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
    },
  },

  trustedOrigins: getTrustedOrigins(),
});

export type Auth = typeof auth;
