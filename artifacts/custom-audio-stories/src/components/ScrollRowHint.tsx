import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function useScrollOverflow(
  ref: React.RefObject<HTMLElement | null>,
  axis: "x" | "y",
) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (axis === "x") {
        const overflow = el.scrollWidth > el.clientWidth + 6;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
        setShow(overflow && !atEnd);
      } else {
        const overflow = el.scrollHeight > el.clientHeight + 6;
        const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
        setShow(overflow && !atEnd);
      }
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [ref, axis]);

  return show;
}

function HorizontalHint() {
  return (
    <p className="md:hidden flex items-center justify-center gap-1.5 mt-1.5 text-[10px] uppercase tracking-widest text-white/50 pointer-events-none">
      Swipe for more options
      <ChevronRight className="w-3 h-3 animate-pulse" aria-hidden />
    </p>
  );
}

function VerticalHint() {
  return (
    <p className="md:hidden flex items-center justify-center gap-1.5 mt-1.5 text-[10px] uppercase tracking-widest text-white/50 pointer-events-none">
      Scroll for more options
      <ChevronDown className="w-3 h-3 animate-pulse" aria-hidden />
    </p>
  );
}

type ScrollWrapProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

/** Horizontal scroll row with fade edge + swipe hint on mobile when content overflows. */
export function HorizontalScrollRow({ className = "", children, ...props }: ScrollWrapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const showHint = useScrollOverflow(ref, "x");

  return (
    <div className="relative">
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
      {showHint && (
        <div
          className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#120a14]/95 via-[#120a14]/40 to-transparent"
          aria-hidden
        />
      )}
      {showHint && <HorizontalHint />}
    </div>
  );
}

/** Vertical scroll column with scroll hint on mobile when content overflows. */
export function VerticalScrollCol({ className = "", children, ...props }: ScrollWrapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const showHint = useScrollOverflow(ref, "y");

  return (
    <div className="relative">
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
      {showHint && (
        <div
          className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#120a14]/95 to-transparent"
          aria-hidden
        />
      )}
      {showHint && <VerticalHint />}
    </div>
  );
}
