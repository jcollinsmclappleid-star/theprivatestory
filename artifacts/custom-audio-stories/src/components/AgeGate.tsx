import { useState } from "react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AgeGateProps {
  onVerified: () => void;
}

export function AgeGate({ onVerified }: AgeGateProps) {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!month || !day || !year) {
      setError("Please enter your complete date of birth.");
      return;
    }

    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);

    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
      setError("Please enter a valid date of birth.");
      return;
    }

    const dob = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hasBirthdayPassed) age--;

    if (age < 18) {
      setError("You must be 18 or older to access this platform.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/me/declare-age`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dateOfBirth: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` }),
      });

      if (res.ok) {
        onVerified();
      } else {
        setError("Failed to verify age. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full rounded-3xl bg-background border border-border/40 p-8 shadow-2xl"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Age Verification</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          The Private Story is for adults 18+. Please verify your age to continue.
        </p>

        <div className="space-y-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Date of Birth</p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                placeholder="MM"
                value={month}
                onChange={(e) => setMonth(e.target.value.slice(0, 2))}
                className="w-full bg-card/50 border border-border/40 rounded-xl px-3 py-3 text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Day</label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="DD"
                value={day}
                onChange={(e) => setDay(e.target.value.slice(0, 2))}
                className="w-full bg-card/50 border border-border/40 rounded-xl px-3 py-3 text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Year</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="YYYY"
                value={year}
                onChange={(e) => setYear(e.target.value.slice(0, 4))}
                className="w-full bg-card/50 border border-border/40 rounded-xl px-3 py-3 text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Verifying..." : "Continue"}
        </button>

        <p className="text-xs text-muted-foreground/50 mt-4 text-center">
          Your date of birth is stored securely and never shared.
        </p>
      </motion.div>
    </motion.div>
  );
}
