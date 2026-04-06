import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, Moon, Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center flex-1 text-center px-4 min-h-[70vh]"
    >
      <div className="max-w-md">
        <p className="font-display text-8xl font-bold text-primary mb-2 opacity-20 leading-none">404</p>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">This page doesn't exist.</h1>
        <p className="text-muted-foreground leading-relaxed mb-10">
          The story you were looking for has faded away — or was never here to begin with.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return home
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/40 text-foreground/70 font-semibold text-sm hover:border-primary/40 hover:text-primary transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Browse stories
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-2">Or go somewhere</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/create" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/20 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-all">
              <Sparkles className="w-3 h-3" />
              Create a story
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/20 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-all">
              Pricing
            </Link>
            <Link
              href="/after-dark"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(123,143,255,0.10)", border: "1px solid rgba(123,143,255,0.35)", color: "#9baeff" }}
            >
              <Moon className="w-3 h-3" />
              After Dark
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
