import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import {
  COUNTRY_CITIES,
  COUNTRY_CULTURAL_PREVIEW,
  COUNTRY_FLAGS,
} from "@/components/CastingRoom";

type CountryPickerModalProps = {
  open: boolean;
  selected: string;
  onSelect: (country: string) => void;
  onClose: () => void;
};

export function CountryPickerModal({ open, selected, onSelect, onClose }: CountryPickerModalProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const countries = useMemo(
    () =>
      Object.keys(COUNTRY_CITIES)
        .sort()
        .filter((c) => !search || c.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#0a0808] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#e879a0]">
                  Browse all countries
                </p>
                <p className="text-sm text-white/60">{Object.keys(COUNTRY_CITIES).length} destinations</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search countries…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#e879a0]/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {countries.map((c) => {
                const isSelected = selected === c;
                const preview = COUNTRY_CULTURAL_PREVIEW[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      isSelected ? "bg-[#e879a0]/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">{COUNTRY_FLAGS[c] ?? "🌍"}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm ${isSelected ? "text-[#e879a0]" : "text-white"}`}>
                          {c}
                        </p>
                        {preview && (
                          <p className="text-[11px] text-white/45 line-clamp-1 italic mt-0.5">{preview}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
