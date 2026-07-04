import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { NAMES } from "@/data/names";

const POPULAR = ["Emma", "Sophia", "Olivia", "James", "Alexander", "Lucas", "Charlotte", "Amelia"];

function filterNames(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR;
  return NAMES.filter((n) => n.toLowerCase().startsWith(q)).slice(0, limit);
}

type FieldProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (name: string) => void;
};

function NameField({ label, hint, value, onChange }: FieldProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(() => filterNames(search), [search]);

  if (value) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5">{label}</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#e879a0]/40 bg-[#e879a0]/10">
          <span className="text-sm font-semibold text-white flex-1">{value}</span>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearch("");
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5">{label}</p>
      <p className="text-[11px] text-white/45 mb-2 leading-snug">{hint}</p>
      <div className="flex items-center gap-2 border border-white/12 rounded-xl px-3 py-2.5 bg-black/40 focus-within:border-[#e879a0]/45">
        <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a first name…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onChange(name);
                setSearch("");
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 text-white/80 hover:border-[#e879a0]/50 hover:text-white transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Props = {
  listenerName: string;
  partnerName: string;
  onListenerName: (name: string) => void;
  onPartnerName: (name: string) => void;
  protagonistLabel?: string;
  partnerLabel?: string;
};

/** Optional character names on the express desires step — skip = addressed as "you". */
export function ExpressCharacterNames({
  listenerName,
  partnerName,
  onListenerName,
  onPartnerName,
  protagonistLabel = "Your character's name",
  partnerLabel = "Their name",
}: Props) {
  const [open, setOpen] = useState(!!listenerName || !!partnerName);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mb-5 rounded-xl border border-white/12 bg-black/30 overflow-hidden group"
    >
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-2 hover:bg-white/[0.03]">
        <div>
          <p className="text-sm font-semibold text-white/90">Name your characters</p>
          <p className="text-[11px] text-white/45 mt-0.5">
            Optional — skip and the narrator uses &ldquo;you&rdquo; and pronouns
          </p>
        </div>
        <span className="text-xs text-white/35 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/8">
        <NameField
          label={protagonistLabel}
          hint="Any first name — nickname, pen name, anything you like."
          value={listenerName}
          onChange={onListenerName}
        />
        <NameField
          label={partnerLabel}
          hint="What the narrator calls your love interest in the story."
          value={partnerName}
          onChange={onPartnerName}
        />
      </div>
    </details>
  );
}
