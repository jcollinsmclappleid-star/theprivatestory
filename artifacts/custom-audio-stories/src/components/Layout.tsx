import { Link, useLocation } from "wouter";
import { Search, Sparkles, Menu } from "lucide-react";
import { FloatingPlayer } from "./FloatingPlayer";

function Navbar() {
  const [location] = useLocation();
  
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Series", href: "/series" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-xl font-bold tracking-wider text-foreground flex items-center gap-2">
            <span className="text-primary">C</span>ustom Audio Stories
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${location === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors p-2">
            <Search className="w-5 h-5" />
          </Link>
          <Link 
            href="/create" 
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            Create Story
          </Link>
          <button className="md:hidden text-foreground p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">
          <span className="text-primary">C</span>ustom Audio Stories
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Immersive, cinematic audio experiences crafted for your quietest moments.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      {/* Cinematic noise texture overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-20 mix-blend-overlay" 
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/noise-texture.png)` }}
      />
      
      <Navbar />
      <main className="pt-16 pb-24 min-h-screen flex flex-col">{children}</main>
      <Footer />
      <FloatingPlayer />
    </div>
  );
}
