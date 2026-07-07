import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { NAMES } from "@/data/names";
import { NameLibraryNote } from "@/components/NameLibraryNote";
import { Link } from "wouter";

function filterNames(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
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
  const trimmed = search.trim();

  if (value) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 mb-1.5">{label}</p>
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 mb-1.5">{label}</p>
      <p className="text-[11px] text-white/50 mb-2 leading-snug">{hint}</p>
      <div className="flex items-center gap-2 border border-white/15 rounded-xl px-3 py-2.5 bg-black/50 focus-within:border-[#e879a0]/55 focus-within:ring-1 focus-within:ring-[#e879a0]/25">
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
      <NameLibraryNote variant="express" />
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
      {trimmed.length >= 1 && suggestions.length === 0 && (
        <div className="mt-3 px-3 py-2.5 rounded-xl border border-white/12 bg-black/40">
          <p className="text-xs font-semibold text-white mb-1">&ldquo;{trimmed}&rdquo; isn&apos;t in our library yet.</p>
          <p className="text-[11px] text-white/50 mb-2 leading-snug">
            We add names within 48 hours — or skip and the narrator uses pronouns.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#e879a0] hover:text-[#f0a0bc]"
          >
            Request this name →
          </Link>
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

/** Character names on the express Make It Yours step — always visible, optional to fill. */
export function ExpressCharacterNames({
  listenerName,
  partnerName,
  onListenerName,
  onPartnerName,
  protagonistLabel = "Your character's name",
  partnerLabel = "Their name",
}: Props) {
  const hasNames = !!(listenerName || partnerName);

  return (
    <section
      className={`mb-6 rounded-2xl border overflow-hidden ${
        hasNames
          ? "border-[#e879a0]/45 bg-gradient-to-b from-[#e879a0]/12 to-black/40 shadow-[0_0_32px_rgba(232,121,160,0.12)]"
          : "border-[#e879a0]/30 bg-gradient-to-b from-[#e879a0]/08 to-black/35"
      }`}
    >
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Name your characters</p>
            <p className="text-[11px] text-white/55 mt-1 leading-snug">
              Optional — skip and the narrator uses &ldquo;you&rdquo; and pronouns. Many listeners personalise here.
            </p>
          </div>
          {!hasNames && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-[#e879a0]/40 text-[#e879a0]">
              Optional
            </span>
          )}
        </div>
      </div>
      <div className="px-4 pb-4 pt-3 space-y-4 border-t border-white/8 mt-3">
        <NameField
          label={protagonistLabel}
          hint="Search our library — nickname, pen name, or any first name you like."
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
    </section>
  );
}
