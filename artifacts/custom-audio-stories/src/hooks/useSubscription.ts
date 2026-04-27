import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SubPlan = "free" | "monthly" | "annual" | "immersive";

export interface SubscriptionState {
  plan: SubPlan;
  isPaid: boolean;
  isImmersive: boolean;
  isAdmin: boolean;
  hasFullAccess: boolean;
  addonCredits: number;
  isLoading: boolean;
}

let _cached: { plan: SubPlan; subscriptionStatus: string | null; addonCredits: number; isAdmin: boolean; fetchedAt: number } | null = null;

export function clearSubscriptionCache() {
  _cached = null;
}

export function useSubscription(): SubscriptionState {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [plan, setPlan] = useState<SubPlan>("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [addonCredits, setAddonCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setPlan("free");
      setSubscriptionStatus(null);
      setAddonCredits(0);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }
    if (_cached && Date.now() - _cached.fetchedAt < 5 * 60 * 1000) {
      setPlan(_cached.plan);
      setSubscriptionStatus(_cached.subscriptionStatus);
      setAddonCredits(_cached.addonCredits);
      setIsAdmin(_cached.isAdmin);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`${API_BASE}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user?: { subscriptionPlan?: SubPlan; subscriptionStatus?: string; addonStoriesRemaining?: number; isAdmin?: boolean } | null }) => {
        const p = data.user?.subscriptionPlan ?? "free";
        const s = data.user?.subscriptionStatus ?? null;
        const a = data.user?.addonStoriesRemaining ?? 0;
        const admin = data.user?.isAdmin === true;
        _cached = { plan: p, subscriptionStatus: s, addonCredits: a, isAdmin: admin, fetchedAt: Date.now() };
        setPlan(p);
        setSubscriptionStatus(s);
        setAddonCredits(a);
        setIsAdmin(admin);
      })
      .catch(() => {
        setPlan("free");
        setSubscriptionStatus(null);
        setAddonCredits(0);
        setIsAdmin(false);
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, authLoading]);

  const isPaid = (plan === "monthly" || plan === "annual") &&
    (subscriptionStatus === "active" || subscriptionStatus === "canceling");
  return {
    plan,
    isPaid,
    isImmersive: plan === "immersive",
    isAdmin,
    hasFullAccess: isPaid || isAdmin || plan === "immersive",
    addonCredits,
    isLoading,
  };
}
