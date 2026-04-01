import { useState, useEffect } from "react";
import { authClient } from "../lib/authClient";
import { registerAuthModalOpener } from "../hooks/useAuth";
import { Logo } from "./Logo";
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

interface AuthModalProps {
  onSuccess?: () => void;
}

type View = "signin" | "signup" | "forgot" | "forgot-sent";

export function AuthModal({ onSuccess }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registerAuthModalOpener((t) => {
      setView(t as View);
      setError(null);
      setEmail("");
      setPassword("");
      setName("");
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setError(null);
    setView("signin");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await authClient.signIn.email({ email, password, callbackURL: "/" });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? "Invalid email or password.");
    } else {
      close();
      onSuccess?.();
      window.location.reload();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await authClient.signUp.email({ email, password, name, callbackURL: "/" });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? "Could not create account. Please try again.");
    } else {
      close();
      onSuccess?.();
      window.location.reload();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/reset-password`,
      });
    } catch {
      // Intentionally swallowed — always show generic success for privacy
    }
    setLoading(false);
    setView("forgot-sent");
  };

  if (!open) return null;

  const tab = view === "signup" ? "signup" : "signin";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0e0e10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 gap-1.5">
            <Logo height={60} />
            <p className="text-xs text-muted-foreground/40 tracking-widest">
              Private · No social · No history shared
            </p>
          </div>

          {/* ── Forgot-password sent confirmation ── */}
          {view === "forgot-sent" ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle className="w-12 h-12 text-primary/70 mx-auto" />
              <p className="text-sm text-foreground font-medium">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                If that email is registered, you'll receive a reset link shortly.
              </p>
              <button
                onClick={() => { setView("signin"); setError(null); }}
                className="text-xs text-primary hover:underline mt-2"
              >
                Back to sign in
              </button>
            </div>
          ) : view === "forgot" ? (
            /* ── Forgot-password form ── */
            <div>
              <button
                onClick={() => { setView("signin"); setError(null); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>
              <p className="text-sm text-foreground font-medium mb-1">Reset your password</p>
              <p className="text-xs text-muted-foreground mb-5">
                Enter your email and we'll send you a link to choose a new password.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 py-2.5 px-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : "Send reset link"}
                </button>
              </form>
            </div>
          ) : (
            /* ── Sign-in / Sign-up ── */
            <>
              {/* Context heading */}
              <p className="text-center text-sm text-muted-foreground mb-4">
                {tab === "signin" ? "Enter your private library" : "Create your private account"}
              </p>

              {/* Tabs */}
              <div className="flex rounded-xl bg-white/5 p-1 mb-6">
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setView(t); setError(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      tab === t
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="space-y-3">
                {tab === "signup" && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={tab === "signup" ? "Password (min. 8 characters)" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Forgot password link — sign-in only */}
                {tab === "signin" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setView("forgot"); setError(null); }}
                      className="text-xs text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 py-2.5 px-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : tab === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Footer link */}
              <p className="text-center text-xs text-muted-foreground mt-5">
                {tab === "signin" ? (
                  <>
                    New here?{" "}
                    <button onClick={() => { setView("signup"); setError(null); }} className="text-primary hover:underline">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => { setView("signin"); setError(null); }} className="text-primary hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}

          <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
            Private, secure, immersive — your stories belong to you.
          </p>
        </div>
      </div>
    </div>
  );
}
