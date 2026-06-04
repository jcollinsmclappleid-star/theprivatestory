import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const CURRENCY_CACHE_KEY = "tps_currency";
const CURRENCY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type PackPlan = {
  amount: number;
  currency: string;
  display: string;
  interval: "one_time";
  stories: number;
  perStoryDisplay: string;
  afterDark: boolean;
};

export type PlansResponse = {
  pack1: PackPlan;
  pack5: PackPlan;
  pack24: PackPlan;
  currency: "gbp" | "usd";
  fetchedAt: number;
};

function detectCurrencyFromTimezone(): "gbp" | "usd" {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Europe/London" || tz.startsWith("GB")) return "gbp";
  } catch {
    // ignore
  }
  return "usd";
}

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

function getInitialCurrency(): "gbp" | "usd" {
  return readCurrencyCache() ?? detectCurrencyFromTimezone();
}

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

export const PRICING_FALLBACK_GBP: PlansResponse = {
  pack1: { amount: 1200, currency: "gbp", display: "£12", interval: "one_time", stories: 1, perStoryDisplay: "£12", afterDark: false },
  pack5: { amount: 3900, currency: "gbp", display: "£39", interval: "one_time", stories: 5, perStoryDisplay: "£7.80", afterDark: true },
  pack24: { amount: 9900, currency: "gbp", display: "£99", interval: "one_time", stories: 24, perStoryDisplay: "£4.13", afterDark: true },
  currency: "gbp",
  fetchedAt: 0,
};

export const PRICING_FALLBACK_USD: PlansResponse = {
  pack1: { amount: 1500, currency: "usd", display: "$15", interval: "one_time", stories: 1, perStoryDisplay: "$15", afterDark: false },
  pack5: { amount: 4900, currency: "usd", display: "$49", interval: "one_time", stories: 5, perStoryDisplay: "$9.80", afterDark: true },
  pack24: { amount: 11900, currency: "usd", display: "$119", interval: "one_time", stories: 24, perStoryDisplay: "$4.96", afterDark: true },
  currency: "usd",
  fetchedAt: 0,
};

export const PRICING_FALLBACK = PRICING_FALLBACK_GBP;

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
    pack1: plans.pack1,
    pack5: plans.pack5,
    pack24: plans.pack24,
    isLoading: query.isLoading,
    isPlaceholder: query.isPlaceholderData,
  };
}
