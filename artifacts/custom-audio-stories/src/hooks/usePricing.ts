import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const CURRENCY_CACHE_KEY = "tps_currency";
const CURRENCY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

// Fast synchronous guess from browser timezone — used as initial value only.
function detectCurrencyFromTimezone(): "gbp" | "usd" {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Europe/London" || tz.startsWith("GB")) return "gbp";
  } catch {
    // ignore
  }
  return "usd";
}

// Read a previously cached currency result (avoids flicker on repeat visits).
function readCurrencyCache(): "gbp" | "usd" | null {
  try {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
    if (!raw) return null;
    const { value, expiresAt } = JSON.parse(raw) as { value: "gbp" | "usd"; expiresAt: number };
    if (Date.now() < expiresAt) return value;
  } catch {
    // ignore
  }
  return null;
}

function writeCurrencyCache(value: "gbp" | "usd"): void {
  try {
    localStorage.setItem(
      CURRENCY_CACHE_KEY,
      JSON.stringify({ value, expiresAt: Date.now() + CURRENCY_CACHE_TTL_MS }),
    );
  } catch {
    // ignore
  }
}

// Best initial synchronous guess: cached result > timezone fallback.
function getInitialCurrency(): "gbp" | "usd" {
  return readCurrencyCache() ?? detectCurrencyFromTimezone();
}

// Async IP-based detection via ipapi.co — no API key required, 1 k req/day free.
// Returns the detected currency or null if the request fails.
async function detectCurrencyFromIP(): Promise<"gbp" | "usd" | null> {
  try {
    const res = await fetch("https://ipapi.co/country_code/", {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const code = (await res.text()).trim().toUpperCase();
    return code === "GB" ? "gbp" : "usd";
  } catch {
    return null;
  }
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
    amount: 17900,
    currency: "gbp",
    display: "£179",
    interval: "year",
    storyAllowance: 50,
    equivalentMonthlyAmount: 1492,
    equivalentMonthlyDisplay: "£14.92",
    savingsVsMonthlyAmount: 18088,
    savingsVsMonthlyDisplay: "£180.88",
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
    amount: 22900,
    currency: "usd",
    display: "$229",
    interval: "year",
    storyAllowance: 50,
    equivalentMonthlyAmount: 1908,
    equivalentMonthlyDisplay: "$19.08",
    savingsVsMonthlyAmount: 13088,
    savingsVsMonthlyDisplay: "$130.88",
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

// Keep the synchronous export for any callers that still use it directly.
export function detectCurrency(): "gbp" | "usd" {
  return getInitialCurrency();
}

async function fetchPlans(currency: "gbp" | "usd"): Promise<PlansResponse> {
  const res = await fetch(`${API_BASE}/api/billing/plans?currency=${currency}`);
  if (!res.ok) throw new Error(`billing/plans ${res.status}`);
  return (await res.json()) as PlansResponse;
}

export function usePricing() {
  const [currency, setCurrency] = useState<"gbp" | "usd">(getInitialCurrency);

  // On mount: run the IP-based check. If it differs from the initial guess, update
  // currency (which changes the queryKey and triggers a fresh fetch of the right prices).
  useEffect(() => {
    detectCurrencyFromIP().then((detected) => {
      if (detected) {
        writeCurrencyCache(detected);
        setCurrency(detected);
      }
    });
  }, []);

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
