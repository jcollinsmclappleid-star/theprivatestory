import { PENDING_CAST_KEY, type PendingAfterDarkCast } from "@/lib/storyReveal";

/** Saved when the user starts Stripe checkout from the After Dark paywall. */
export const AFTER_DARK_CHECKOUT_STATE_KEY = "afterDarkCheckoutState";

export type AfterDarkCheckoutState = {
  confirmedPairing?: string | null;
  lastCastingData?: Record<string, unknown> | null;
  paywallCoverUrl?: string | null;
  paywallCoverKey?: string | null;
};

export function hasPendingAfterDarkPaywall(): boolean {
  try {
    return !!sessionStorage.getItem(PENDING_CAST_KEY);
  } catch {
    return false;
  }
}

/** Where to send the user after credits are applied — resume paywall if a cast is waiting. */
export function getPostPurchaseRedirectPath(): string {
  return hasPendingAfterDarkPaywall()
    ? "/after-dark?checkout=success"
    : "/create";
}

export function readPendingAfterDarkCast(): PendingAfterDarkCast | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CAST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingAfterDarkCast;
  } catch {
    return null;
  }
}

export function readAfterDarkCheckoutState(): AfterDarkCheckoutState | null {
  try {
    const raw = sessionStorage.getItem(AFTER_DARK_CHECKOUT_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AfterDarkCheckoutState;
  } catch {
    return null;
  }
}
