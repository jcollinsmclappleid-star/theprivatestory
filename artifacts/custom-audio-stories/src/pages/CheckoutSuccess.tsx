import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSearch, useLocation } from "wouter";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface PurchaseInfo {
  plan: "monthly" | "annual" | "immersive";
  confirmed: boolean;
  claimed: boolean;
  customerEmail: string | null;
}

function planLabel(plan: string): string {
  if (plan === "monthly") return "Monthly plan — 5 stories / month";
  if (plan === "annual") return "Annual plan — 50 stories / year";
  return "Single Immersive Story";
}

function planEmoji(plan: string): string {
  if (plan === "monthly") return "Monthly";
  if (plan === "annual") return "Annual";
  return "Immersive Story";
}

export default function CheckoutSuccess() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading, openSignUp, openSignIn } = useAuth();

  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<"idle" | "claiming" | "claimed" | "error">("idle");
  const [claimError, setClaimError] = useState<string | null>(null);
  const claimedRef = useRef(false);

  // Step 1: Fetch purchase info from token
  useEffect(() => {
    if (!token) {
      setFetchError("Invalid or missing purchase token. Please check your email for the claim link.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 15; // 30 seconds of polling
    let timer: ReturnType<typeof setTimeout>;

    const checkPurchase = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stripe/pending-claim/${encodeURIComponent(token)}`);
        if (res.status === 404) {
          setFetchError("Purchase not found. Please check your email for the correct link.");
          return;
        }
        if (res.status === 410) {
          setFetchError("This claim link has expired. Please contact support@theprivatestory.com.");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch purchase");
        }
        const data: PurchaseInfo = await res.json();
        setPurchase(data);

        // If not yet confirmed by webhook, poll
        if (!data.confirmed && attempts < maxAttempts) {
          attempts++;
          timer = setTimeout(checkPurchase, 2000);
        }
      } catch {
        if (attempts < maxAttempts) {
          attempts++;
          timer = setTimeout(checkPurchase, 2000);
        } else {
          setFetchError("Could not confirm your purchase. Please contact support@theprivatestory.com.");
        }
      }
    };

    checkPurchase();
    return () => clearTimeout(timer);
  }, [token]);

  // Step 2: Auto-claim once authenticated + purchase is confirmed
  useEffect(() => {
    if (!purchase?.confirmed || !isAuthenticated || claimedRef.current || purchase.claimed) return;
    if (claimState === "claiming" || claimState === "claimed") return;

    claimedRef.current = true;
    setClaimState("claiming");

    fetch(`${API_BASE}/api/stripe/claim`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.status === 409) {
          // Already claimed — still consider success
          setClaimState("claimed");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to claim purchase");
        }
        setClaimState("claimed");
      })
      .catch((err: Error) => {
        claimedRef.current = false;
        setClaimState("error");
        setClaimError(err.message ?? "Could not claim your purchase. Please contact support@theprivatestory.com.");
      });
  }, [purchase, isAuthenticated, token, claimState]);

  // Step 3: Redirect after successful claim
  useEffect(() => {
    if (claimState !== "claimed") return;
    const timer = setTimeout(() => {
      navigate("/create");
    }, 2500);
    return () => clearTimeout(timer);
  }, [claimState, navigate]);

  // --- Render states ---

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-semibold mb-2">Invalid link</p>
          <p className="text-muted-foreground text-sm">Please use the link from your confirmation email, or contact support@theprivatestory.com.</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-semibold mb-2">Something went wrong</p>
          <p className="text-muted-foreground text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  // Still loading initial purchase data
  if (!purchase) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground text-sm">Confirming your purchase…</p>
        </div>
      </div>
    );
  }

  // Purchase confirmed + claimed + redirect pending
  if (claimState === "claimed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">You're all set.</h1>
          <p className="text-muted-foreground text-sm mb-6">Your {planEmoji(purchase.plan)} has been added to your account. Taking you to create your first story…</p>
          <Loader2 className="w-4 h-4 text-primary mx-auto animate-spin" />
        </div>
      </motion.div>
    );
  }

  // Payment not yet confirmed — still polling
  if (!purchase.confirmed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-foreground font-semibold mb-2">Processing your payment…</p>
          <p className="text-muted-foreground text-sm">This usually takes a few seconds. Please don't close this page.</p>
        </div>
      </div>
    );
  }

  // Payment confirmed — show account creation prompt
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-md">
        {/* Success badge */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 mb-8">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">Payment confirmed</p>
            <p className="text-xs text-green-400/70 mt-0.5">{planLabel(purchase.plan)}</p>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-card/40 border border-border/40 rounded-3xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your purchase is waiting. Create your account to access your {purchase.plan === "immersive" ? "story" : "subscription"} and start listening.
          </p>

          {claimState === "claiming" || authLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Applying your purchase…</span>
            </div>
          ) : claimState === "error" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-left">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{claimError}</p>
              </div>
              <button
                onClick={() => { claimedRef.current = false; setClaimState("idle"); setClaimError(null); }}
                className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Applying your purchase…</span>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={openSignUp}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-glow"
              >
                <Sparkles className="w-4 h-4" />
                Get started
              </button>
              <button
                onClick={openSignIn}
                className="w-full px-6 py-3 rounded-full border border-border/50 text-foreground/70 font-medium text-sm hover:border-primary/40 hover:text-foreground transition-colors"
              >
                I already have an account — sign in
              </button>
              {purchase.customerEmail && (
                <p className="text-xs text-muted-foreground/50 pt-2">
                  A confirmation was sent to {purchase.customerEmail}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          Having trouble? Contact <a href="mailto:support@theprivatestory.com" className="underline hover:text-muted-foreground">support@theprivatestory.com</a>
        </p>
      </div>
    </motion.div>
  );
}
