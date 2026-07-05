import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import {
  SITUATIONS,
  SITUATION_CATEGORIES,
  type SituationDisplay,
} from "@/data/situations";
import { interpolateHomeSituation } from "@/lib/homeBriefUtils";

type SituationFullListModalProps = {
  open: boolean;
  pairing: string;
  selectedId: string;
  onSelect: (id: string, label: string) => void;
  onClose: () => void;
  /** Override interpolation (e.g. Casting Room pronouns). */
  previewForSituation?: (sit: SituationDisplay) => string;
};

function eligible(pairing: string, category?: string): SituationDisplay[] {
  return SITUATIONS.filter((s) => {
    if (category && s.category !== category) return false;
    if (!s.allowedPairings?.length) return true;
    return s.allowedPairings.includes(pairing);
  });
}

export function SituationFullListModal({
  open,
  pairing,
  selectedId,
  onSelect,
  onClose,
  previewForSituation,
}: SituationFullListModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setCategory("all");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const pool = useMemo(() => eligible(pairing, category === "all" ? undefined : category), [pairing, category]);

  const filtered = useMemo(() => {
    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        interpolateHomeSituation(s, pairing).toLowerCase().includes(q),
    );
  }, [pool, search, pairing]);

  const excerpt = (sit: SituationDisplay) =>
    previewForSituation ? previewForSituation(sit) : interpolateHomeSituation(sit, pairing);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[#050203]/95 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#0a0808] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90">
                    Every situation
                  </p>
                  <p className="text-sm text-white/55">
                    {pool.length} for your pairing · scroll or search
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full border border-white/10 text-white/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Search situations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x scrollbar-brand">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    category === "all"
                      ? "border-primary/60 bg-primary/15 text-white"
                      : "border-white/12 text-white/55"
                  }`}
                >
                  All
                </button>
                {SITUATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                      category === cat
                        ? "border-primary/60 bg-primary/15 text-white"
                        : "border-white/12 text-white/55"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2 scrollbar-brand">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-white/45 py-8">No situations match your search.</p>
              ) : (
                filtered.map((sit) => {
                  const selected = selectedId === sit.id;
                  return (
                    <button
                      key={sit.id}
                      type="button"
                      onClick={() => {
                        onSelect(sit.id, sit.label);
                        onClose();
                      }}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                        selected
                          ? "border-primary/45 bg-primary/[0.08]"
                          : "border-white/10 bg-white/[0.02] hover:border-primary/25"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary/75">
                          {sit.label}
                        </p>
                        <span className="text-[9px] text-white/40 flex-shrink-0">{sit.category}</span>
                      </div>
                      <p className="text-[13px] text-white/80 leading-snug italic line-clamp-2">
                        &ldquo;{excerpt(sit)}&rdquo;
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
