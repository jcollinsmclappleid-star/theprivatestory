import { Link } from "wouter";

type Props = {
  variant?: "studio" | "express";
};

/** Shown under name search — matches full studio Casting Room copy. */
export function NameLibraryNote({ variant = "studio" }: Props) {
  const textClass =
    variant === "express"
      ? "text-[11px] text-white/45 mt-2 leading-snug"
      : "text-xs text-muted-foreground/55 mt-2 leading-snug";

  const linkClass =
    variant === "express"
      ? "text-[#e879a0]/90 underline underline-offset-2 hover:text-[#e879a0]"
      : "text-primary/90 underline underline-offset-2 hover:text-primary";

  return (
    <p className={textClass}>
      Can&apos;t see your name?{" "}
      <Link href="/contact" className={linkClass}>
        Email us
      </Link>{" "}
      to get it added.
    </p>
  );
}
