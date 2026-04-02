import { useState, useEffect, useRef, lazy, Suspense } from "react";
const ReportModal = lazy(() => import("./ReportModal").then((m) => ({ default: m.ReportModal })));
import { Link, useLocation } from "wouter";
import { Search, Sparkles, Menu, X, LogIn, LogOut, User, Home, BookOpen, Settings, Moon } from "lucide-react";
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
      storyId={currentStory?.id}
      storyTitle={currentStory?.title}
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
    { label: "How It Works", href: "/how-it-works", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Browse", href: "/browse", icon: <BookOpen className="w-4 h-4" /> },
    { label: "My Library", href: isAuthenticated ? "/me" : "/library", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Pricing", href: "/pricing", icon: <BookOpen className="w-4 h-4" /> },
    ...(isAdmin ? [{ label: "Admin", href: "/admin", icon: <Settings className="w-4 h-4" /> }] : []),
  ];

  const isAfterDark = location === "/after-dark";
  const isDrift = location === "/drift";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-32 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Logo height={128} />
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
                The Private Story - 'After Dark'
              </Link>
              <Link
                href="/drift"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isDrift ? "text-[#6366f1]" : "text-muted-foreground/70 hover:text-[#6366f1]"}`}
              >
                <Moon className="w-3.5 h-3.5 opacity-60" />
                Drift - Bedtime Stories
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
              Begin your story
            </Link>

            {!isLoading && (
              isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <Link href="/me" className="flex-shrink-0">
                    {user.profileImageUrl || user.image ? (
                      <img
                        src={(user.profileImageUrl || user.image) ?? ""}
                        alt={user.firstName ?? user.name ?? "User"}
                        className="w-8 h-8 rounded-full object-cover border border-border/40 hover:border-primary/50 transition-colors"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:border-primary/60 transition-colors">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </Link>
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
        className={`fixed top-32 left-0 right-0 z-30 md:hidden transition-all duration-300 ease-in-out ${
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

          {/* After Dark + Drift mobile links */}
          <div className="px-2 pb-1 space-y-0.5">
            <Link
              href="/after-dark"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isAfterDark ? "bg-[#c0392b]/10 text-[#c0392b]" : "text-muted-foreground hover:text-[#c0392b] hover:bg-[#c0392b]/5"
              }`}
            >
              <Moon className="w-4 h-4" />
              The Private Story - 'After Dark'
            </Link>
            <Link
              href="/drift"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isDrift ? "bg-[#6366f1]/10 text-[#6366f1]" : "text-muted-foreground hover:text-[#6366f1] hover:bg-[#6366f1]/5"
              }`}
            >
              <Moon className="w-4 h-4 opacity-60" />
              Drift - Bedtime Stories
            </Link>
          </div>

          {/* Create CTA */}
          <div className="px-4 pb-3">
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Begin your story
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

function FooterColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">{heading}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-xs text-muted-foreground/70 hover:text-primary transition-colors leading-relaxed">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  const [reportOpen, setReportOpen] = useState(false);

  const legalLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Content Policy", href: "/content-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/50 pt-14 pb-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

          <FooterColumn heading="Navigate" links={[
            { label: "Home", href: "/" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Browse stories", href: "/browse" },
            { label: "Create your story", href: "/create" },
            { label: "Pricing", href: "/pricing" },
            { label: "After Dark", href: "/after-dark" },
            { label: "Drift — Bedtime", href: "/drift" },
            { label: "My library", href: "/library" },
            { label: "About", href: "/about" },
            { label: "Discover all types", href: "/discover" },
          ]} />

          <FooterColumn heading="Personalised" links={[
            { label: "Personalised audio stories", href: "/personalised-audio-stories" },
            { label: "Private audio stories", href: "/private-audio-stories" },
            { label: "Create your own audio story", href: "/create-your-own-audio-story" },
            { label: "AI audio story generator", href: "/ai-audio-story-generator" },
            { label: "Bedtime audio stories", href: "/bedtime-audio-stories" },
            { label: "Relaxing audio stories", href: "/relaxing-audio-stories" },
            { label: "Sleep audio stories", href: "/sleep-audio-stories" },
          ]} />

          <FooterColumn heading="Romantic" links={[
            { label: "Romantic audio stories", href: "/romantic-audio-stories" },
            { label: "Love stories audio", href: "/love-stories-audio" },
            { label: "Emotional audio stories", href: "/emotional-audio-stories" },
            { label: "Intimate audio stories", href: "/intimate-audio-stories" },
            { label: "Late night audio stories", href: "/late-night-audio-stories" },
            { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
            { label: "Confident energy stories", href: "/confident-energy-stories" },
            { label: "Quiet intensity stories", href: "/quiet-intensity-stories" },
          ]} />

          <FooterColumn heading="Genre" links={[
            { label: "Dark romance audio stories", href: "/dark-romance-audio-stories" },
            { label: "Forbidden romance audio", href: "/forbidden-romance-audio-stories" },
            { label: "Enemies to lovers audio", href: "/enemies-to-lovers-audio-stories" },
            { label: "Adult audio stories", href: "/adult-audio-stories" },
            { label: "Audio stories for women", href: "/audio-stories-for-women" },
          ]} />

          <FooterColumn heading="Compare" links={[
            { label: "Audio stories vs audiobooks", href: "/audio-stories-vs-audiobooks" },
            { label: "Audio stories vs podcasts", href: "/audio-stories-vs-podcasts" },
            { label: "Best audio story app", href: "/best-audio-story-app-for-adults" },
            { label: "Alternatives to romance audiobooks", href: "/alternatives-to-romance-audiobooks" },
          ]} />

        </div>

        <div className="border-t border-border/20 pt-8 flex flex-col items-center text-center">
          <div className="mb-3">
            <Logo height={60} />
          </div>
          <p className="text-muted-foreground text-xs max-w-sm mb-5">
            Stories written for the parts of you that nobody else gets to know.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/50 mb-3">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setReportOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Report a concern
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/30">What you listen to here stays here. Always. · Adults 18+ only. · Ianson System Ltd t/a The Private Story.</p>
        </div>
      </div>
      {reportOpen && (
        <Suspense fallback={null}>
          <ReportModal onClose={() => setReportOpen(false)} />
        </Suspense>
      )}
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

      <Navbar streakDays={streakDays} />
      <StoryLifecycleManager
        isAuthenticated={isAuthenticated}
        onStreakIncrement={setStreakDays}
      />
      <main className="pt-32 pb-24 min-h-screen flex flex-col">{children}</main>
      <Footer />
      <FloatingPlayer />
    </div>
  );
}
