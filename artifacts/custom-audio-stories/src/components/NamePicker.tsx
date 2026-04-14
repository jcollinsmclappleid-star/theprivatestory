import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { NAMES } from "@/data/names";

interface Props {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  label?: string;
  note?: string;
  className?: string;
}

export function NamePicker({ value, onChange, placeholder = "Search names…", className = "" }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setQuery(value);
  }, [open, value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
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
  }, [query, allNames]);

  const handleSelect = (name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    inputRef.current?.focus();
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
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
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

          {/* Can't find a name? Users can submit custom names via their profile page. */}
          <div className="border-t border-border/40 px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground/60">Can't find your name? Submit it via your <a href="/me" className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">profile page</a>.</p>
          </div>
        </div>
      )}
    </div>
  );
}
