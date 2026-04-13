import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/authClient";
import { LogoFull } from "@/components/Logo";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { openSignIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) setError("This reset link is invalid or has expired. Please request a new one.");
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) {
        setError(res.error.message ?? "This link is invalid or has expired. Please request a new reset link.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="p-8">
          <div className="flex flex-col items-center mb-8 gap-1.5">
            <LogoFull height={100} className="mx-auto" />
            <p className="text-xs text-muted-foreground/40 tracking-widest">
              Private · No social · No history shared
            </p>
          </div>

          {done ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle className="w-12 h-12 text-primary/70 mx-auto" />
              <p className="text-base text-foreground font-medium">Password updated</p>
              <p className="text-sm text-muted-foreground">
                Your password has been updated. You can now sign in.
              </p>
              <button
                onClick={() => { navigate("/"); setTimeout(openSignIn, 100); }}
                className="mt-3 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                Sign in
              </button>
            </div>
          ) : (
            <>
              <p className="text-base text-foreground font-medium mb-1">Choose a new password</p>
              <p className="text-sm text-muted-foreground mb-6">
                Enter a new password for your account. It must be at least 8 characters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 py-2.5 px-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
