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

function getDevBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.replace(/\/$/, "");
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return "http://localhost:8080";
}

/** Production/Vercel — accept any deployment host; fixes "Invalid origin" on sign-in. */
const PRODUCTION_AUTH_BASE = {
  allowedHosts: [
    "theprivatestory.com",
    "www.theprivatestory.com",
    "theprivatestory.vercel.app",
    "*.vercel.app",
    "localhost:*",
  ],
  fallback: (process.env.BETTER_AUTH_URL ?? "https://theprivatestory.vercel.app").replace(/\/$/, ""),
} as const;

function resolveAuthBaseURL() {
  if (process.env.NODE_ENV === "development") return getDevBaseURL();
  return PRODUCTION_AUTH_BASE;
}

function getStaticTrustedOrigins(): string[] {
  const origins = new Set<string>([
    "https://theprivatestory.com",
    "https://www.theprivatestory.com",
    "https://theprivatestory.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:8080",
  ]);
  const base = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");
  if (base) origins.add(base);
  if (process.env.SITE_URL) origins.add(process.env.SITE_URL.replace(/\/$/, ""));
  if (process.env.APP_URL) origins.add(process.env.APP_URL.replace(/\/$/, ""));
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.REPLIT_DEV_DOMAIN) origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  if (process.env.REPLIT_DOMAINS) {
    for (const d of process.env.REPLIT_DOMAINS.split(",")) {
      origins.add(`https://${d.trim()}`);
    }
  }
  const envExtra = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (envExtra) {
    for (const o of envExtra.split(",")) {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    }
  }
  return [...origins];
}

// Refuse to start in production with no secret or the insecure dev fallback.
// Gate on NODE_ENV so local development continues to work without a secret set.
if (process.env.NODE_ENV !== "development") {
  const _secret = process.env.BETTER_AUTH_SECRET;
  if (!_secret || _secret === "dev-secret-change-in-production") {
    throw new Error(
      "[auth] BETTER_AUTH_SECRET is not set or uses the insecure dev fallback. " +
      "Set a high-entropy secret in the environment before starting in production.",
    );
  }
}

export const auth = betterAuth({
  baseURL: resolveAuthBaseURL(),
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

  trustedOrigins: getStaticTrustedOrigins(),
});

export type Auth = typeof auth;
