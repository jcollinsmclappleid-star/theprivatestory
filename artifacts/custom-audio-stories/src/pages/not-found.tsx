import { motion } from "framer-motion";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center justify-center flex-1 text-center px-4 min-h-[60vh]"
    >
      <h1 className="text-8xl font-display font-bold text-primary mb-4 opacity-50">404</h1>
      <h2 className="text-3xl font-display font-semibold text-foreground mb-4">Silence.</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The story you're looking for doesn't exist or has faded away.
      </p>
      <Link 
        href="/"
        className="px-8 py-3 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
      >
        Return Home
      </Link>
    </motion.div>
  );
}
