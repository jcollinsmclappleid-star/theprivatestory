import { useState, useCallback } from "react";
import { Flag, X } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REASON_CATEGORIES = [
  "Inappropriate content",
  "Content felt non-consensual or uncomfortable",
  "Story did not match the intended tone",
  "Other",
] as const;

interface Props {
  storyId: string;
  storyTitle?: string;
  onClose: () => void;
}

export function ReportStoryModal({ storyId, storyTitle, onClose }: Props) {
  const [reasonCategory, setReasonCategory] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = reasonCategory && reason.trim().length >= 5 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/story-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storyId,
          reasonCategory,
          reason: reason.trim(),
          note: note.trim() || undefined,
        }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, storyId, reasonCategory, reason, note]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-[#0e0e10] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10">
        {done ? (
          <div className="text-center space-y-3 py-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground">Report received</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you — our team will review this. Reports are completely anonymous and never
              affect story availability for other readers.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-full text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <h3
                  id="report-modal-title"
                  className="font-display font-bold text-lg text-foreground"
                >
                  Report story
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {storyTitle && (
              <p className="text-xs text-muted-foreground/70 mb-4 italic truncate">
                "{storyTitle}"
              </p>
            )}

            {/* Category */}
            <p className="text-xs font-medium text-muted-foreground mb-2">
              What's the issue?
            </p>
            <div className="space-y-1.5 mb-4">
              {REASON_CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border transition-colors ${
                    reasonCategory === cat
                      ? "border-primary/40 bg-primary/5 text-foreground"
                      : "border-white/5 bg-white/3 hover:bg-white/5 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-category"
                    value={cat}
                    checked={reasonCategory === cat}
                    onChange={() => setReasonCategory(cat)}
                    className="accent-primary w-3.5 h-3.5"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>

            {/* Reason text */}
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Tell us more <span className="text-destructive/60">*</span>
            </p>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/40 mb-3 transition-colors"
              rows={2}
              placeholder="Brief description of the concern…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={600}
            />

            {/* Optional extra note */}
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/40 mb-4 transition-colors"
              rows={2}
              placeholder="Additional context (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />

            {error && (
              <p className="text-xs text-destructive mb-3 text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 disabled:opacity-40 text-primary rounded-full text-sm font-semibold transition-all"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </button>
            <p className="text-center text-xs text-muted-foreground/50 mt-3">
              Reports are anonymous and reviewed privately.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
