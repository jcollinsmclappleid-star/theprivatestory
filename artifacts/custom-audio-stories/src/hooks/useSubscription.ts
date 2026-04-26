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

let _cached: { plan: SubPlan; addonCredits: number; isAdmin: boolean; fetchedAt: number } | null = null;

export function clearSubscriptionCache() {
  _cached = null;
}

export function useSubscription(): SubscriptionState {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [plan, setPlan] = useState<SubPlan>("free");
  const [addonCredits, setAddonCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setPlan("free");
      setAddonCredits(0);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }
    if (_cached && Date.now() - _cached.fetchedAt < 5 * 60 * 1000) {
      setPlan(_cached.plan);
      setAddonCredits(_cached.addonCredits);
      setIsAdmin(_cached.isAdmin);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`${API_BASE}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user?: { subscriptionPlan?: SubPlan; addonStoriesRemaining?: number; isAdmin?: boolean } | null }) => {
        const p = data.user?.subscriptionPlan ?? "free";
        const a = data.user?.addonStoriesRemaining ?? 0;
        const admin = data.user?.isAdmin === true;
        _cached = { plan: p, addonCredits: a, isAdmin: admin, fetchedAt: Date.now() };
        setPlan(p);
        setAddonCredits(a);
        setIsAdmin(admin);
      })
      .catch(() => {
        setPlan("free");
        setAddonCredits(0);
        setIsAdmin(false);
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, authLoading]);

  const isPaid = plan === "monthly" || plan === "annual";
  return {
    plan,
    isPaid,
    isImmersive: plan === "immersive",
    isAdmin,
    hasFullAccess: isPaid || isAdmin,
    addonCredits,
    isLoading,
  };
}
