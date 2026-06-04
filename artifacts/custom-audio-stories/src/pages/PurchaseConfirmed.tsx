import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSearch, useLocation } from "wouter";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, Lock, BookOpen, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Logo } from "@/components/Logo";

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

function planName(plan: string): string {
  if (plan === "monthly") return "Monthly subscription";
  if (plan === "annual") return "Annual subscription";
  return "Immersive Story";
}

// ---------------------------------------------------------------------------
// Minimal branded shell — no nav, no footer (clean for conversion tracking)
// ---------------------------------------------------------------------------
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border/20">
        <Link href="/">
          <Logo height={44} />
        </Link>
        <span className="text-xs text-muted-foreground/40 tracking-widest uppercase">Private · Secure</span>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {children}
      </main>
      <footer className="px-6 py-4 text-center border-t border-border/20">
        <p className="text-xs text-muted-foreground/30">
          Questions?{" "}
          <a href="mailto:support@theprivatestory.com" className="underline hover:text-muted-foreground/60 transition-colors">
            support@theprivatestory.com
          </a>
        </p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Authenticated subscription confirmation (no token)
// Subscription is already applied by webhook — just show thank-you
// ---------------------------------------------------------------------------
function SubscriptionConfirmed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md text-center"
    >
      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">Welcome to The Private Story</p>
      <h1 className="font-display text-3xl font-bold text-foreground mb-3 leading-tight">
        You're in.
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Your subscription is active. Every story you create from here is private, personalised, and yours alone.
      </p>

      <div className="glass-panel rounded-2xl p-5 mb-8 border-primary/20 bg-primary/5 text-left space-y-3">
        {[
          "Your stories are saved privately to your account",
          "After Dark is unlocked — stories that go further",
          "Every story is written from scratch, just for you",
        ].map((line) => (
          <div key={line} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground/80">{line}</span>
          </div>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">Where would you like to start?</p>

      <div className="w-full space-y-3">
        <Link
          href="/create"
          className="flex items-center gap-3 w-full bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_0_24px_-4px_rgba(201,162,39,0.4)]"
        >
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold leading-tight">Create your story</p>
            <p className="text-xs font-normal opacity-75 mt-0.5">Personalised from scratch — your cast, your world</p>
          </div>
        </Link>

        <Link
          href="/after-dark"
          className="flex items-center gap-3 w-full bg-[#e879a0]/10 border border-[#e879a0]/30 text-[#e879a0] px-6 py-4 rounded-2xl font-semibold text-sm hover:bg-[#e879a0]/18 hover:border-[#e879a0]/50 transition-all hover:scale-[1.02]"
        >
          <Moon className="w-5 h-5 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold leading-tight">After Dark</p>
            <p className="text-xs font-normal opacity-75 mt-0.5">Stories that go further — now unlocked for you</p>
          </div>
        </Link>

        <Link
          href="/library"
          className="flex items-center gap-3 w-full bg-card/40 border border-border/40 text-foreground/80 px-6 py-4 rounded-2xl font-semibold text-sm hover:bg-card/60 hover:border-border/60 hover:text-foreground transition-all hover:scale-[1.02]"
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold leading-tight">Browse the library</p>
            <p className="text-xs font-normal opacity-60 mt-0.5">Explore all available stories in your collection</p>
          </div>
        </Link>
      </div>

      <p className="mt-6 text-xs text-muted-foreground/40">
        A confirmation has been sent to your email. You can manage your subscription from your{" "}
        <Link href="/me" className="underline hover:text-muted-foreground/60 transition-colors">account page</Link>.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Guest token flow — poll for webhook confirmation, then prompt account creation
// ---------------------------------------------------------------------------
function GuestTokenFlow({ token }: { token: string }) {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading, openSignUp, openSignIn } = useAuth();

  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<"idle" | "claiming" | "claimed" | "error">("idle");
  const [claimError, setClaimError] = useState<string | null>(null);
  const claimedRef = useRef(false);

  // Step 1: Poll for purchase confirmation from webhook
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;
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
        if (!res.ok) throw new Error("Failed to fetch purchase");

        const data: PurchaseInfo = await res.json();
        setPurchase(data);

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

  // Step 2: Auto-claim once authenticated + purchase confirmed
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
        if (res.status === 409) { setClaimState("claimed"); return; }
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
    const timer = setTimeout(() => navigate("/create"), 2500);
    return () => clearTimeout(timer);
  }, [claimState, navigate]);

  if (fetchError) {
    return (
      <div className="w-full max-w-md text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <p className="text-foreground font-semibold mb-2">Something went wrong</p>
        <p className="text-muted-foreground text-sm">{fetchError}</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="w-full max-w-md text-center">
        <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground text-sm">Confirming your purchase…</p>
      </div>
    );
  }

  if (claimState === "claimed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">You're all set.</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Your {planName(purchase.plan)} has been added to your account. Taking you to create your first story…
        </p>
        <Loader2 className="w-4 h-4 text-primary mx-auto animate-spin" />
      </motion.div>
    );
  }

  if (!purchase.confirmed) {
    return (
      <div className="w-full max-w-md text-center">
        <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-foreground font-semibold mb-2">Processing your payment…</p>
        <p className="text-muted-foreground text-sm">This usually takes a few seconds. Please don't close this page.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 mb-8">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-400">Payment confirmed</p>
          <p className="text-xs text-green-400/70 mt-0.5">{planLabel(purchase.plan)}</p>
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Create your account</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Your purchase is waiting. Create your account to access your subscription and start listening.
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
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Authenticated pack flow — live-check verify (does NOT depend on webhook)
// Credits are applied exactly once via the shared idempotent server path.
// ---------------------------------------------------------------------------
function AuthVerifyFlow({ sessionId }: { sessionId: string }) {
  const [, navigate] = useLocation();
  const [state, setState] = useState<"verifying" | "done" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stripe/verify-session`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        // 402 = payment not yet settled on Stripe's side; retry a few times.
        if (res.status === 402 && attempts < maxAttempts) {
          attempts++;
          if (!cancelled) setTimeout(verify, 2000);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Could not confirm your purchase.");
        }

        if (!cancelled) setState("done");
      } catch (err) {
        if (attempts < maxAttempts) {
          attempts++;
          if (!cancelled) setTimeout(verify, 2000);
          return;
        }
        if (!cancelled) {
          setState("error");
          setErrorMsg(
            (err as Error).message ??
              "Could not confirm your purchase. Please contact support@theprivatestory.com.",
          );
        }
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Redirect to create once credits are applied.
  useEffect(() => {
    if (state !== "done") return;
    const timer = setTimeout(() => navigate("/create"), 2500);
    return () => clearTimeout(timer);
  }, [state, navigate]);

  if (state === "error") {
    return (
      <div className="w-full max-w-md text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <p className="text-foreground font-semibold mb-2">We couldn't confirm your purchase</p>
        <p className="text-muted-foreground text-sm mb-6">{errorMsg}</p>
        <button
          onClick={() => { startedRef.current = false; setState("verifying"); setErrorMsg(null); }}
          className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state === "verifying") {
    return (
      <div className="w-full max-w-md text-center">
        <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-foreground font-semibold mb-2">Confirming your purchase…</p>
        <p className="text-muted-foreground text-sm">This usually takes a few seconds. Please don't close this page.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md text-center"
    >
      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">You're all set.</h1>
      <p className="text-muted-foreground text-sm mb-4">
        Your credits have been added to your account. Taking you to create your story…
      </p>
      <Loader2 className="w-4 h-4 text-primary mx-auto animate-spin" />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function PurchaseConfirmed() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";
  const sessionId = params.get("session_id") ?? "";

  return (
    <Shell>
      {token ? (
        <GuestTokenFlow token={token} />
      ) : sessionId ? (
        <AuthVerifyFlow sessionId={sessionId} />
      ) : (
        <SubscriptionConfirmed />
      )}
    </Shell>
  );
}
