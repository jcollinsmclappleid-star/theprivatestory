import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import {
  ALL_EXPRESS_SETTINGS,
  SETTING_GROUP_LABELS,
  type ExpressSettingOption,
  type SettingGroup,
} from "@/lib/expressSettings";

const BASE = import.meta.env.BASE_URL;

type SettingPickerModalProps = {
  open: boolean;
  selected: string;
  onSelect: (settingId: string) => void;
  onClose: () => void;
};

export function SettingPickerModal({ open, selected, onSelect, onClose }: SettingPickerModalProps) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<SettingGroup | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setGroup("all");
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

  const filtered = useMemo(() => {
    return ALL_EXPRESS_SETTINGS.filter((s) => {
      if (group !== "all" && s.group !== group) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return s.label.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    });
  }, [search, group]);

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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#0a0808] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#e879a0]">
                    Room & era
                  </p>
                  <p className="text-sm text-white/55">{ALL_EXPRESS_SETTINGS.length} worlds to choose from</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-full border border-white/10 text-white/60" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search settings…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#e879a0]/40"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                {(["all", "exclusive", "contemporary", "historical"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroup(g)}
                    className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      group === g
                        ? "border-[#e879a0]/60 bg-[#e879a0]/15 text-white"
                        : "border-white/12 text-white/55"
                    }`}
                  >
                    {g === "all" ? "All" : SETTING_GROUP_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((s) => (
                <SettingRow key={s.id} setting={s} selected={selected === s.id} onSelect={() => { onSelect(s.id); onClose(); }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SettingRow({
  setting,
  selected,
  onSelect,
}: {
  setting: ExpressSettingOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative overflow-hidden rounded-xl border text-left min-h-[88px] transition-all ${
        selected ? "border-[#e879a0]/50 ring-1 ring-[#e879a0]/30" : "border-white/10 hover:border-white/22"
      }`}
    >
      {setting.image && (
        <img src={`${BASE}${setting.image}`} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-70" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/25" />
      <div className="relative z-10 p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: setting.accent }}>
          {SETTING_GROUP_LABELS[setting.group]}
        </p>
        <p className="font-semibold text-white text-sm">{setting.label}</p>
        <p className="text-[10px] text-white/60 line-clamp-2 mt-0.5">{setting.sub}</p>
      </div>
    </button>
  );
}
