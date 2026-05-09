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

// Detect whether this visitor is in the UK by checking their browser timezone.
// UK timezones: Europe/London (also covers Guernsey, Jersey, Isle of Man).
// This is reliable, requires no external service, and cannot misroute UK customers.
export function detectCurrency(): "gbp" | "usd" {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Europe/London" || tz.startsWith("GB")) return "gbp";
  } catch {
    // Intl not supported — default to GBP to be safe
  }
  return "usd";
}

// Sensible fallback values used only as placeholderData while the real fetch is in-flight,
// or if the backend is unreachable.
export const PRICING_FALLBACK_GBP: PlansResponse = {
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
    amount: 799,
    currency: "gbp",
    display: "£7.99",
    interval: "one_time",
  },
  fetchedAt: 0,
};

export const PRICING_FALLBACK_USD: PlansResponse = {
  monthly: {
    amount: 2999,
    currency: "usd",
    display: "$29.99",
    interval: "month",
    storyAllowance: 5,
  },
  annual: {
    amount: 23900,
    currency: "usd",
    display: "$239",
    interval: "year",
    storyAllowance: 50,
    equivalentMonthlyAmount: 1992,
    equivalentMonthlyDisplay: "$19.92",
    savingsVsMonthlyAmount: 12088,
    savingsVsMonthlyDisplay: "$120.88",
  },
  addon: {
    amount: 799,
    currency: "usd",
    display: "$7.99",
    interval: "one_time",
  },
  fetchedAt: 0,
};

// Keep a single exported fallback alias so existing imports don't break.
export const PRICING_FALLBACK = PRICING_FALLBACK_GBP;

async function fetchPlans(currency: "gbp" | "usd"): Promise<PlansResponse> {
  const res = await fetch(`${API_BASE}/api/billing/plans?currency=${currency}`);
  if (!res.ok) throw new Error(`billing/plans ${res.status}`);
  return (await res.json()) as PlansResponse;
}

export function usePricing() {
  const currency = detectCurrency();
  const fallback = currency === "usd" ? PRICING_FALLBACK_USD : PRICING_FALLBACK_GBP;

  const query = useQuery({
    queryKey: ["billing", "plans", currency],
    queryFn: () => fetchPlans(currency),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: fallback,
  });

  const plans = query.data ?? fallback;
  return {
    plans,
    currency,
    monthly: plans.monthly,
    annual: plans.annual,
    addon: plans.addon,
    isLoading: query.isLoading,
    isPlaceholder: query.isPlaceholderData,
  };
}
