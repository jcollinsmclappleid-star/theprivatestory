import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, CheckCircle2, Mail, CreditCard, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type NameType = "listener" | "partner";

export default function Contact() {
  const [nameType, setNameType] = useState<NameType>("listener");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/me/name-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          nameType,
          notes: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit your request. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">Contact</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          We're a small team and we read everything. Expect a response within one business day.
        </p>

        {/* General Enquiries */}
        <div className="glass-panel rounded-2xl p-5 mb-4 flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">General enquiries</p>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              Questions about the platform, how stories work, your account, or anything else — we're here.
            </p>
            <a
              href="mailto:support@theprivatestory.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              support@theprivatestory.com
            </a>
          </div>
        </div>

        {/* Billing */}
        <div className="glass-panel rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Billing &amp; subscriptions</p>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              Payment queries, subscription changes, refunds, or anything to do with your plan — include your account email and we'll sort it promptly.
            </p>
            <a
              href="mailto:support@theprivatestory.com?subject=Billing enquiry"
              className="text-sm text-primary hover:underline font-medium"
            >
              support@theprivatestory.com
            </a>
          </div>
        </div>

        {/* Name Request */}
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Request a name</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Don't see your name — or your love interest's — in the Creation Room?
          Submit a request below and we'll add it within 48 hours.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Request received</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Thank you — we'll add your name to the Creation Room within 48 hours.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                This name is for
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNameType("listener")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    nameType === "listener"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  Me (listener)
                </button>
                <button
                  type="button"
                  onClick={() => setNameType("partner")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    nameType === "partner"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  Love interest
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value.replace(/[^A-Za-z\-' ]/g, "").slice(0, 20))}
                placeholder={nameType === "listener" ? "Your name…" : "Their name…"}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-card/60 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Anything else? <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 300))}
                placeholder="e.g. a note about pronunciation, gender, or origin…"
                rows={3}
                maxLength={300}
                className="w-full px-4 py-3 rounded-xl bg-card/60 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              <p className="text-right text-[10px] text-muted-foreground/50 mt-1">{message.length}/300</p>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>

            <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
              Accepted names are added within 48 hours. We read every request.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
