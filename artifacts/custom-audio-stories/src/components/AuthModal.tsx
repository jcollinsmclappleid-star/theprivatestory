import { useState, useEffect } from "react";
import { authClient } from "../lib/authClient";
import { registerAuthModalOpener } from "../hooks/useAuth";
import { Logo } from "./Logo";
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AuthModalProps {
  onSuccess?: () => void;
}

export function AuthModal({ onSuccess }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registerAuthModalOpener((t) => {
      setTab(t);
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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  if (!open) return null;

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

          {/* Context heading */}
          <p className="text-center text-sm text-muted-foreground mb-4">
            {tab === "signin" ? "Enter your private library" : "Create your private account"}
          </p>

          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
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

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-sm font-medium text-foreground disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-white/10" />
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

            {error && (
              <div className="flex items-start gap-2 py-2.5 px-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
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
                <button onClick={() => { setTab("signup"); setError(null); }} className="text-primary hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => { setTab("signin"); setError(null); }} className="text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-[11px] text-muted-foreground/50 mt-3">
            Private, secure, immersive — your stories belong to you.
          </p>
        </div>
      </div>
    </div>
  );
}
