import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type Plan = {
  amount: number;
  currency: string;
  display: string;
  interval: "month" | "year" | "one_time";
};

export type MonthlyPlan = Plan & { storyAllowance: number };
export type AnnualPlan = Plan & {
  storyAllowance: number;
  equivalentMonthlyDisplay: string;
  equivalentMonthlyAmount: number;
  savingsVsMonthlyDisplay: string;
  savingsVsMonthlyAmount: number;
};

export type PlansResponse = {
  monthly: MonthlyPlan;
  annual: AnnualPlan;
  addon: Plan;
  fetchedAt: number;
};

// Sensible fallback values used only as placeholderData while the real fetch is in-flight,
// or if the backend is unreachable. These match the current Stripe prices at time of writing
// — but the live response always overrides.
export const PRICING_FALLBACK: PlansResponse = {
  monthly: {
    amount: 2999,
    currency: "gbp",
    display: "£29.99",
    interval: "month",
    storyAllowance: 5,
  },
  annual: {
    amount: 23900,
    currency: "gbp",
    display: "£239",
    interval: "year",
    storyAllowance: 50,
    equivalentMonthlyAmount: 1992,
    equivalentMonthlyDisplay: "£19.92",
    savingsVsMonthlyAmount: 11988,
    savingsVsMonthlyDisplay: "£119.88",
  },
  addon: {
    amount: 399,
    currency: "gbp",
    display: "£3.99",
    interval: "one_time",
  },
  fetchedAt: 0,
};

async function fetchPlans(): Promise<PlansResponse> {
  const res = await fetch(`${API_BASE}/api/billing/plans`);
  if (!res.ok) throw new Error(`billing/plans ${res.status}`);
  return (await res.json()) as PlansResponse;
}

export function usePricing() {
  const query = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: fetchPlans,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: PRICING_FALLBACK,
  });
  // Always return real or fallback so callers never have to handle undefined
  const plans = query.data ?? PRICING_FALLBACK;
  return {
    plans,
    monthly: plans.monthly,
    annual: plans.annual,
    addon: plans.addon,
    isLoading: query.isLoading,
    isPlaceholder: query.isPlaceholderData,
  };
}
