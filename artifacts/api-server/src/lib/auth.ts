import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, usersTable, baSessionsTable, baAccountsTable, baVerificationsTable } from "@workspace/db";
import { sendEmail } from "./email.js";

function getBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return "http://localhost:8080";
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
    },
  }),

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
          return {
            data: {
              ...user,
              firstName,
              lastName: lastName,
              profileImageUrl: user.image ?? null,
            },
          };
        },
      },
    },
  },

  advanced: {
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
    },
  },

  trustedOrigins: [getBaseURL()],
});

export type Auth = typeof auth;
