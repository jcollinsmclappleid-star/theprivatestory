import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Legacy Replit Auth sessions table — kept for backward compat but no longer used
export const sessionsTable = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table — shared by all auth providers
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // better-auth standard fields
  name: text("name").notNull().default(""),
  email: varchar("email").unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // App-specific profile fields
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  isAdmin: boolean("is_admin").notNull().default(false),
  // 2FA — required for admin accounts
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  // Safety & compliance fields
  ageDeclarationAt: timestamp("age_declaration_at", { withTimezone: true }),
  riskScore: integer("risk_score").notNull().default(0),
  riskFlags: integer("risk_flags").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  // Approved story names — sourced from the curated NAMES list or admin-approved custom submissions.
  // These are read by generation endpoints and never accepted from request bodies.
  approvedListenerName: varchar("approved_listener_name", { length: 20 }),
  approvedPartnerName: varchar("approved_partner_name", { length: 20 }),
});

// better-auth sessions
export const baSessionsTable = pgTable("ba_sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // Set to the timestamp when the user completed TOTP/backup-code verification during this session.
  // Null means the session was created without a 2FA challenge (e.g. normal login for non-2FA users,
  // or the "enable 2FA" session created by better-auth itself). Admin routes require this to be non-null.
  twoFactorVerifiedAt: timestamp("two_factor_verified_at", { withTimezone: true }),
});

// better-auth accounts (OAuth providers + email/password credential)
export const baAccountsTable = pgTable("ba_accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

// better-auth verifications (email verification, password reset tokens)
export const baVerificationsTable = pgTable("ba_verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// better-auth two-factor authentication data (TOTP secrets + backup codes)
export const baTwoFactorTable = pgTable("ba_two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
