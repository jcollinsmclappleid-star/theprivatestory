import { motion } from "framer-motion";

const STORAGE_KEY = "tps_age_confirmed";

export function hasConfirmedAge(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function confirmAge(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

interface AgeGateProps {
  onConfirmed: () => void;
}

export function AgeGate({ onConfirmed }: AgeGateProps) {
  const handleConfirm = () => {
    confirmAge();
    onConfirmed();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 22 }}
        className="max-w-sm w-full rounded-3xl bg-background border border-border/40 p-8 shadow-2xl text-center"
      >
        <img src="/images/logo.png" alt="The Private Story" className="h-12 mx-auto mb-6" />
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-4">The Private Story</p>

        <h1 className="font-display text-2xl font-bold text-foreground mb-3">
          Age confirmation
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          You must be 18 or older to use this service.
        </p>

        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all mb-3"
        >
          I'm 18 or older
        </button>

        <p className="text-xs text-muted-foreground/40">
          By continuing you confirm you are of legal age in your jurisdiction.
        </p>
      </motion.div>
    </motion.div>
  );
}
