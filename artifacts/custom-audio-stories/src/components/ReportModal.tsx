import { useState, useCallback } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REPORT_CATEGORIES = [
  { value: "csam", label: "This content involves a minor" },
  { value: "non-consent", label: "This content is non-consensual" },
  { value: "real-person", label: "This content involves a real person without consent" },
  { value: "harassment", label: "This content appears illegal or harmful" },
  { value: "other", label: "Other safety concern" },
];

interface ReportModalProps {
  storyId?: string;
  onClose: () => void;
}

export function ReportModal({ storyId, onClose }: ReportModalProps) {
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!category || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category, notes: notes.trim() || undefined, storyId }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }, [category, notes, storyId, submitting]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-[#0e0e10] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10">
        {done ? (
          <div className="text-center space-y-3">
            <div className="text-2xl">✓</div>
            <h3 className="font-display font-bold text-lg text-foreground">Report Received</h3>
            <p className="text-sm text-muted-foreground">
              Thank you. Our safety team will review this within 24 hours. Reports are anonymous and never shared.
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-foreground">Report Content</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Select a reason and we'll review this immediately. Reports are anonymous.
            </p>
            <div className="space-y-2 mb-4">
              {REPORT_CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <input
                    type="radio"
                    name="report-category"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{cat.label}</span>
                </label>
              ))}
            </div>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 mb-4"
              rows={2}
              placeholder="Additional details (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
            {error && (
              <p className="text-xs text-destructive mb-2 text-center">
                Submission failed. Please try again or email{" "}
                <a href="mailto:support@theprivatestory.com" className="underline">support@theprivatestory.com</a>.
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!category || submitting}
              className="w-full py-2.5 bg-destructive hover:bg-destructive/90 disabled:opacity-40 text-destructive-foreground rounded-full text-sm font-semibold transition-all"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
