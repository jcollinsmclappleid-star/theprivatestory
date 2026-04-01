import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SubPlan = "free" | "monthly" | "annual";

export interface SubscriptionState {
  plan: SubPlan;
  isPaid: boolean;
  addonCredits: number;
  isLoading: boolean;
}

let _cached: { plan: SubPlan; addonCredits: number; fetchedAt: number } | null = null;

export function clearSubscriptionCache() {
  _cached = null;
}

export function useSubscription(): SubscriptionState {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [plan, setPlan] = useState<SubPlan>("free");
  const [addonCredits, setAddonCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setPlan("free");
      setAddonCredits(0);
      setIsLoading(false);
      return;
    }
    if (_cached && Date.now() - _cached.fetchedAt < 5 * 60 * 1000) {
      setPlan(_cached.plan);
      setAddonCredits(_cached.addonCredits);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`${API_BASE}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user?: { subscriptionPlan?: SubPlan; addonStoriesRemaining?: number } | null }) => {
        const p = data.user?.subscriptionPlan ?? "free";
        const a = data.user?.addonStoriesRemaining ?? 0;
        _cached = { plan: p, addonCredits: a, fetchedAt: Date.now() };
        setPlan(p);
        setAddonCredits(a);
      })
      .catch(() => {
        setPlan("free");
        setAddonCredits(0);
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, authLoading]);

  return {
    plan,
    isPaid: plan === "monthly" || plan === "annual",
    addonCredits,
    isLoading,
  };
}
