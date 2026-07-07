import type { Request } from "express";

/** Test account with credits — used only when staging bypass is enabled. */
const DEFAULT_STAGING_USER_ID = "qFysTO4112Zx45CUhlIb2fy8Z0oje55d";

export function isStagingBypassEnabled(): boolean {
  if (process.env.STAGING_BYPASS_PAYWALL === "1") return true;
  return process.env.NODE_ENV === "development";
}

export function getStagingBypassUserId(): string | null {
  if (!isStagingBypassEnabled()) return null;
  const id = process.env.STAGING_BYPASS_USER_ID?.trim();
  return id || DEFAULT_STAGING_USER_ID;
}

export function resolveGenerationUserId(req: Pick<Request, "isAuthenticated" | "user">): string | null {
  if (req.isAuthenticated()) return String(req.user!.id);
  return getStagingBypassUserId();
}

export function isStagingBypassRequest(req: Pick<Request, "isAuthenticated">): boolean {
  return !req.isAuthenticated() && getStagingBypassUserId() !== null;
}
