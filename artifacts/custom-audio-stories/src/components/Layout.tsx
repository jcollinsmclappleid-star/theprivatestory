import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, Sparkles, Menu, X, LogIn, LogOut, User, Home, Library, BookOpen, Settings, Moon } from "lucide-react";
import { FloatingPlayer } from "./FloatingPlayer";
import { Logo } from "./Logo";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../hooks/useAuth";
import { useAudioPlayer } from "@/store/use-audio-player";
import { StoryReactionOverlay } from "./StoryReactionOverlay";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useStreak(isAuthenticated: boolean) {
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.streakDays) setStreakDays(data.streakDays); })
      .catch(() => {});
  }, [isAuthenticated]);

  return { streakDays, setStreakDays };
}

function StoryLifecycleManager({
  isAuthenticated,
  onStreakIncrement,
}: {
  isAuthenticated: boolean;
  onStreakIncrement: (days: number) => void;
}) {
  const { currentStory, progress, isPlaying } = useAudioPlayer();
  const [reactionVisible, setReactionVisible] = useState(false);
  const lastStoryId = useRef<string | null>(null);
  const lastStreakFiredDate = useRef<string>("");
  const wasPlaying = useRef<boolean>(false);
  const reactionFiredForStory = useRef<string | null>(null);

  // Fire streak increment on every play-start transition (false → true).
  // Client skips if already fired today (to avoid session chatter); the server
  // also deduplicates by calendar date so cross-midnight plays are handled correctly.
  useEffect(() => {
    if (!isAuthenticated || !currentStory) return;
    const playStarted = isPlaying && !wasPlaying.current;
    wasPlaying.current = isPlaying;
    if (!playStarted) return;

    const today = new Date().toISOString().slice(0, 10);
    if (lastStreakFiredDate.current === today) return;
    lastStreakFiredDate.current = today;

    fetch(`${API_BASE}/api/me/taste`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ incrementStreak: true }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.streakDays) onStreakIncrement(data.streakDays); })
      .catch(() => {});
  }, [isPlaying, currentStory?.id, isAuthenticated]);

  useEffect(() => {
    if (!currentStory) return;
    if (!isAuthenticated) return;
    if (reactionFiredForStory.current === currentStory.id) return;

    if (progress >= 0.97) {
      reactionFiredForStory.current = currentStory.id;
      setReactionVisible(true);
    }
  }, [progress, currentStory?.id, isAuthenticated]);

  useEffect(() => {
    if (currentStory?.id !== lastStoryId.current) {
      lastStoryId.current = currentStory?.id ?? null;
      setReactionVisible(false);
    }
  }, [currentStory?.id]);

  return (
    <StoryReactionOverlay
      visible={reactionVisible}
      storyMood={currentStory?.mood}
      storyTags={[
        ...((currentStory as Record<string, unknown> | undefined)?.tags as string[] ?? []),
        ...((currentStory as Record<string, unknown> | undefined)?.recommendation_tags as string[] ?? []),
      ]}
      onDismiss={() => setReactionVisible(false)}
    />
  );
}

function Navbar({ streakDays }: { streakDays: number }) {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, openSignIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL ?? "";
  const isAdmin = !!user && !!adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase();

  const navItems = [
    { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Browse", href: "/browse", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Series", href: "/series", icon: <Library className="w-4 h-4" /> },
    { label: "My Library", href: "/library", icon: <BookOpen className="w-4 h-4" /> },
    ...(isAdmin ? [{ label: "Admin", href: "/admin", icon: <Settings className="w-4 h-4" /> }] : []),
  ];

  const isAfterDark = location === "/after-dark";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Logo height={80} />
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
              <Link
                href="/after-dark"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isAfterDark ? "text-[#c0392b]" : "text-muted-foreground/70 hover:text-[#c0392b]"}`}
              >
                <Moon className="w-3.5 h-3.5" />
                After Dark
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden lg:block text-[10px] text-muted-foreground/30 tracking-widest">
              Private · No social · No history shared
            </p>
            <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors p-2">
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/create"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Write My Story
            </Link>

            {!isLoading && (
              isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {streakDays >= 2 && (
                    <span
                      className="hidden md:inline text-[10px] font-semibold tracking-wide px-2 py-1 rounded-full border border-primary/30 bg-primary/8"
                      style={{ color: "#c9a227" }}
                      title={`${streakDays} evenings in a row`}
                    >
                      {streakDays} evenings
                    </span>
                  )}
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
        className={`fixed top-24 left-0 right-0 z-30 md:hidden transition-all duration-300 ease-in-out ${
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

          {/* After Dark mobile link */}
          <div className="px-2 pb-1">
            <Link
              href="/after-dark"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isAfterDark ? "bg-[#c0392b]/10 text-[#c0392b]" : "text-muted-foreground hover:text-[#c0392b] hover:bg-[#c0392b]/5"
              }`}
            >
              <Moon className="w-4 h-4" />
              After Dark
            </Link>
          </div>

          {/* Create CTA */}
          <div className="px-4 pb-3">
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Write My Story
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
                  Enter your private library
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
          <Logo height={80} />
        </div>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          Stories written for the parts of you that nobody else gets to know.
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
        <p className="text-xs text-muted-foreground/50">What you listen to here stays here. Always.</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { streakDays, setStreakDays } = useStreak(isAuthenticated);

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/noise-texture.png)` }}
      />

      <AuthModal />
      <Navbar streakDays={streakDays} />
      <StoryLifecycleManager
        isAuthenticated={isAuthenticated}
        onStreakIncrement={setStreakDays}
      />
      <main className="pt-24 pb-24 min-h-screen flex flex-col">{children}</main>
      <Footer />
      <FloatingPlayer />
    </div>
  );
}
