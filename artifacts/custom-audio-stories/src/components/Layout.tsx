import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Sparkles, Menu, X, LogIn, LogOut, User, Gift, Home, Library, BookOpen } from "lucide-react";
import { FloatingPlayer } from "./FloatingPlayer";
import { Logo } from "./Logo";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, openSignIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navItems = [
    { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Browse", href: "/browse", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Series", href: "/series", icon: <Library className="w-4 h-4" /> },
    { label: "My Library", href: "/library", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-36 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Logo height={136} />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location === item.href ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors p-2">
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/gift"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Create Your Story
            </Link>

            {!isLoading && (
              isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {user.profileImageUrl || user.image ? (
                    <img
                      src={(user.profileImageUrl || user.image) ?? ""}
                      alt={user.firstName ?? user.name ?? "User"}
                      className="w-8 h-8 rounded-full object-cover border border-border/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={openSignIn}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-36 left-0 right-0 z-30 md:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="mx-4 rounded-2xl bg-[#0e0e10] border border-white/10 shadow-2xl overflow-hidden">
          {/* Nav links */}
          <div className="py-3 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                  location === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Gift CTA */}
          <div className="px-4 pb-3">
            <Link
              href="/gift"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm"
            >
              <Gift className="w-4 h-4" />
              Create Your Story
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-4" />

          {/* Auth section */}
          <div className="px-4 py-3">
            {!isLoading && (
              isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.profileImageUrl || user.image ? (
                      <img
                        src={(user.profileImageUrl || user.image) ?? ""}
                        alt={user.firstName ?? user.name ?? "User"}
                        className="w-9 h-9 rounded-full object-cover border border-border/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.firstName ?? user.name ?? "Account"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { openSignIn(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Your Account
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Footer() {
  const footerLinks = [
    { label: "Home", href: "/" },
    { label: "Gift a Story", href: "/gift" },
    { label: "Browse", href: "/browse" },
    { label: "Series", href: "/series" },
    { label: "My Library", href: "/library" },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/50 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <Logo height={160} />
        </div>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          Immersive romantic audio stories crafted just for you.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-6">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </div>
        <p className="text-xs text-muted-foreground/50">Designed for private, immersive listening.</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/noise-texture.png)` }}
      />

      <AuthModal />
      <Navbar />
      <main className="pt-36 pb-24 min-h-screen flex flex-col">{children}</main>
      <Footer />
      <FloatingPlayer />
    </div>
  );
}
