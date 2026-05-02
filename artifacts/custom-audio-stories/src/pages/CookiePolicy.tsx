import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

declare global {
  interface Window {
    __tpsOpenCookieBanner?: () => void;
  }
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-semibold text-foreground mt-10 mb-3">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>;
}

export default function CookiePolicy() {
  useSEO({
    title: "Cookie Policy — The Private Story",
    description:
      "How The Private Story uses cookies and similar technologies, and how you can control them. Strictly necessary cookies for sign-in and payments; optional analytics with consent.",
    canonical: "https://theprivatestory.com/cookie-policy",
  });

  const openBanner = () => {
    if (typeof window !== "undefined" && typeof window.__tpsOpenCookieBanner === "function") {
      window.__tpsOpenCookieBanner();
    }
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">Legal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: 2 May 2026</p>
      </header>

      <P>
        This Cookie Policy explains how Ianson System Ltd, trading as The Private Story
        (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;), uses cookies and similar
        technologies on <Link href="/" className="text-primary hover:underline">theprivatestory.com</Link>.
        It should be read alongside our{" "}
        <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
      </P>

      <H2>1. What are cookies?</H2>
      <P>
        Cookies are small text files placed on your device when you visit a website. They allow the site to
        remember your actions and preferences (such as being signed in) over time. We also use closely related
        technologies such as <em>localStorage</em> for the same purposes — references to &ldquo;cookies&rdquo; in
        this policy include those technologies.
      </P>

      <H2>2. Cookies we use</H2>

      <H3>2.1 Strictly necessary (always on)</H3>
      <P>
        These cookies are essential for the site to work. Without them, you cannot sign in, generate stories, or
        complete a payment. We do not need consent for these because they are strictly necessary to provide a
        service you have requested.
      </P>
      <div className="overflow-x-auto rounded-xl border border-border/40 mb-6">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-muted/30 text-left">
              <th className="px-3 py-2 font-semibold text-foreground">Cookie</th>
              <th className="px-3 py-2 font-semibold text-foreground">Set by</th>
              <th className="px-3 py-2 font-semibold text-foreground">Purpose</th>
              <th className="px-3 py-2 font-semibold text-foreground">Lifetime</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-xs">connect.sid</td>
              <td className="px-3 py-2">The Private Story</td>
              <td className="px-3 py-2">Maintains your authenticated session.</td>
              <td className="px-3 py-2">Session</td>
            </tr>
            <tr className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-xs">tps_age_verified</td>
              <td className="px-3 py-2">The Private Story</td>
              <td className="px-3 py-2">Remembers that you have confirmed you are 18 or over.</td>
              <td className="px-3 py-2">1 year</td>
            </tr>
            <tr className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-xs">tps_cookie_consent</td>
              <td className="px-3 py-2">The Private Story</td>
              <td className="px-3 py-2">Remembers your cookie choice so we don&rsquo;t ask again.</td>
              <td className="px-3 py-2">1 year</td>
            </tr>
            <tr className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-xs">__stripe_mid, __stripe_sid</td>
              <td className="px-3 py-2">Stripe</td>
              <td className="px-3 py-2">Fraud prevention during checkout. Set only when paying.</td>
              <td className="px-3 py-2">Session – 1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H3>2.2 Analytics (optional — consent required)</H3>
      <P>
        With your permission, we use <strong>Google Analytics 4</strong> to understand which pages people use most
        so we can improve them. We use Google&rsquo;s Consent Mode v2: until you accept, no analytics identifiers
        are stored in your browser. Once you accept, the following cookies may be set.
      </P>
      <div className="overflow-x-auto rounded-xl border border-border/40 mb-6">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-muted/30 text-left">
              <th className="px-3 py-2 font-semibold text-foreground">Cookie</th>
              <th className="px-3 py-2 font-semibold text-foreground">Set by</th>
              <th className="px-3 py-2 font-semibold text-foreground">Purpose</th>
              <th className="px-3 py-2 font-semibold text-foreground">Lifetime</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-xs">_ga</td>
              <td className="px-3 py-2">Google</td>
              <td className="px-3 py-2">Distinguishes unique visitors. IP anonymisation enabled.</td>
              <td className="px-3 py-2">2 years</td>
            </tr>
            <tr className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-xs">_ga_&lt;ID&gt;</td>
              <td className="px-3 py-2">Google</td>
              <td className="px-3 py-2">Persists session state for GA4.</td>
              <td className="px-3 py-2">2 years</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        We do <strong>not</strong> use advertising cookies, third-party trackers (such as Facebook, TikTok, or
        Hotjar), or cross-site behavioural advertising of any kind.
      </P>

      <H2>3. Manage your preferences</H2>
      <P>
        You can change or withdraw your consent at any time. Your choice is stored locally and is respected on
        every page.
      </P>
      <button
        type="button"
        onClick={openBanner}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors mb-6"
      >
        Manage cookie preferences
      </button>
      <P>
        You can also block or delete cookies in your browser settings. Note that disabling strictly necessary
        cookies will prevent sign-in, story generation, and checkout from working.
      </P>

      <H2>4. Changes to this policy</H2>
      <P>
        We may update this Cookie Policy from time to time. The &ldquo;Last updated&rdquo; date at the top
        reflects the most recent version. Material changes will be highlighted on the site or via email where
        appropriate.
      </P>

      <H2>5. Contact</H2>
      <P>
        Questions about cookies or this policy? Email{" "}
        <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">
          support@theprivatestory.com
        </a>
        . For the legal basis on which we process personal data, see our{" "}
        <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
      </P>
    </article>
  );
}
