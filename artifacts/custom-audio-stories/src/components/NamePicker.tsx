import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, ChevronDown, ExternalLink } from "lucide-react";
import { NAMES } from "@/data/names";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  label?: string;
  note?: string;
  className?: string;
}

export function NamePicker({ value, onChange, placeholder = "Search names…", className = "" }: Props) {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setQuery(value);
  }, [open, value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSubmit(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAMES.slice(0, 50);
    const prefix: string[] = [];
    const substring: string[] = [];
    for (const n of NAMES) {
      const nl = n.toLowerCase();
      if (nl.startsWith(q)) prefix.push(n);
      else if (nl.includes(q)) substring.push(n);
      if (prefix.length + substring.length >= 50) break;
    }
    return [...prefix, ...substring].slice(0, 50);
  }, [query]);

  const handleSelect = (name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
    setShowSubmit(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  const handleSubmitName = async () => {
    const name = query.trim();
    if (!name || !/^[A-Za-z]{2,20}$/.test(name)) {
      setSubmitError("Names must be 2–20 letters only.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
      const res = await fetch(`${base}/api/names/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (res.ok || res.status === 409) {
        setSubmitted(true);
      } else {
        const j = await res.json().catch(() => ({}));
        setSubmitError(j.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayValue = value || "";
  const hasValue = displayValue.length > 0;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 w-full bg-card/40 border rounded-xl px-4 py-3 transition-all cursor-text ${
          open ? "border-primary/50 ring-1 ring-primary/20" : "border-border/40 hover:border-border/60"
        }`}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
      >
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          value={open ? query : displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true); setShowSubmit(false); setSubmitted(false); setSubmitError(""); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
        />
        {hasValue && !open ? (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); handleClear(); }}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No names match "{query}"</p>
            ) : (
              filtered.map(name => (
                <button
                  key={name}
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  onMouseDown={e => { e.preventDefault(); handleSelect(name); }}
                >
                  {name}
                </button>
              ))
            )}
          </div>

          {/* Request / submit — only visible to authenticated users */}
          {isAuthenticated && (
          <div className="border-t border-border/40 px-4 py-2.5">
            {!showSubmit ? (
              <button
                type="button"
                onClick={() => { setShowSubmit(true); setSubmitted(false); setSubmitError(""); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Can't find your name? Request it →
              </button>
            ) : submitted ? (
              <p className="text-xs text-green-400">
                Submitted. We'll review and add it within 48 hours if it meets our guidelines.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Request this name to be added:</p>
                <div className="flex gap-2">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Name to request…"
                    maxLength={20}
                    className="flex-1 bg-background/50 border border-border/40 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onMouseDown={e => { e.preventDefault(); handleSubmitName(); }}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Sending…" : "Request"}
                  </button>
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); setShowSubmit(false); }}
                    className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                <p className="text-xs text-muted-foreground/70">
                  We'll review your request within 48 hours.
                </p>
              </div>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
