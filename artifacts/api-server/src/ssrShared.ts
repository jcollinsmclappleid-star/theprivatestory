const SITE_URL = "https://theprivatestory.com";
const OG_IMAGE = "https://theprivatestory.com/opengraph.jpg";
const SITE_NAME = "The Private Story";
const LOGO_SVG_INLINE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iMTgwIiByeD0iMzYiIGZpbGw9IiNGRjNDMDAiLz4KPC9zdmc+Cg==";

export interface SsrShellOptions {
  title: string;
  description: string;
  canonical: string;
  h1: string;
  badge?: string;
  tagline: string;
  bodyHtml: string;
  schemas: object[];
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0b;color:#e8e6e3;font-family:Georgia,serif;line-height:1.7;font-size:17px}
a{color:#c9a227;text-decoration:none}
a:hover{text-decoration:underline}
nav{border-bottom:1px solid #222;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.logo{font-family:Georgia,serif;font-size:19px;font-weight:bold;color:#e8e6e3;letter-spacing:.03em}
nav ul{list-style:none;display:flex;gap:20px;flex-wrap:wrap}
nav ul li a{color:#a09080;font-size:14px}
nav ul li a:hover{color:#c9a227}
main{max-width:760px;margin:0 auto;padding:48px 24px 80px}
.badge{display:inline-block;padding:4px 14px;border-radius:999px;border:1px solid rgba(201,162,39,.35);background:rgba(201,162,39,.1);color:#c9a227;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:Georgia,serif;margin-bottom:20px}
h1{font-family:Georgia,serif;font-size:2.25rem;font-weight:bold;color:#e8e6e3;margin-bottom:20px;line-height:1.25}
.tagline{color:#a09080;font-size:1.15rem;margin-bottom:40px;line-height:1.6}
.cta-primary{display:inline-block;background:#c9a227;color:#0a0a0b;padding:12px 26px;border-radius:999px;font-weight:bold;font-size:14px;margin-bottom:48px}
.trust-bar{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:48px}
.trust-item{border:1px solid #1e1e1e;padding:14px;border-radius:12px}
.trust-item strong{display:block;font-size:14px;color:#e8e6e3;margin-bottom:2px}
.trust-item span{font-size:12px;color:#6b6055}
section{margin-bottom:48px}
h2{font-family:Georgia,serif;font-size:1.6rem;color:#e8e6e3;margin-bottom:18px;line-height:1.3}
h3{font-family:Georgia,serif;font-size:1.1rem;color:#c9a227;margin-bottom:6px}
p{color:#a09080;margin-bottom:16px;line-height:1.75}
.faq-item{border-top:1px solid #1e1e1e;padding:20px 0}
.faq-item:last-child{border-bottom:1px solid #1e1e1e}
.faq-q{font-family:Georgia,serif;font-weight:bold;color:#e8e6e3;margin-bottom:10px;font-size:1rem}
.faq-a{color:#a09080;font-size:.95rem;line-height:1.7}
footer{border-top:1px solid #1a1a1a;background:#050506;padding:48px 24px 32px}
.footer-inner{max-width:1200px;margin:0 auto}
.footer-cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:32px;margin-bottom:40px}
.footer-col h4{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#4a3f35;margin-bottom:14px;font-family:Georgia,serif}
.footer-col ul{list-style:none}
.footer-col ul li{margin-bottom:8px}
.footer-col ul li a{color:#6b6055;font-size:13px}
.footer-col ul li a:hover{color:#c9a227}
.footer-bottom{text-align:center;border-top:1px solid #111;padding-top:24px}
.footer-bottom .logo{font-size:16px;margin-bottom:10px;display:block}
.footer-legal{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-bottom:10px}
.footer-legal a{font-size:12px;color:#3a3530}
.footer-copy{font-size:11px;color:#2a2520}
@media(max-width:600px){h1{font-size:1.65rem}.trust-bar{grid-template-columns:1fr}}
`;

const FOOTER_HTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-cols">
      <div class="footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/browse">Browse stories</a></li>
          <li><a href="/create">Create your story</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/after-dark">After Dark</a></li>
          <li><a href="/drift">Drift — Bedtime</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/discover">Discover all types</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Personalised</h4>
        <ul>
          <li><a href="/personalised-audio-stories">Personalised audio stories</a></li>
          <li><a href="/private-audio-stories">Private audio stories</a></li>
          <li><a href="/create-your-own-audio-story">Create your own audio story</a></li>
          <li><a href="/ai-audio-story-generator">AI audio story generator</a></li>
          <li><a href="/bedtime-audio-stories">Bedtime audio stories</a></li>
          <li><a href="/relaxing-audio-stories">Relaxing audio stories</a></li>
          <li><a href="/sleep-audio-stories">Sleep audio stories</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Romantic</h4>
        <ul>
          <li><a href="/romantic-audio-stories">Romantic audio stories</a></li>
          <li><a href="/love-stories-audio">Love stories audio</a></li>
          <li><a href="/emotional-audio-stories">Emotional audio stories</a></li>
          <li><a href="/intimate-audio-stories">Intimate audio stories</a></li>
          <li><a href="/late-night-audio-stories">Late night audio stories</a></li>
          <li><a href="/slow-burn-audio-stories">Slow burn audio stories</a></li>
          <li><a href="/confident-energy-stories">Confident energy stories</a></li>
          <li><a href="/quiet-intensity-stories">Quiet intensity stories</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Genre</h4>
        <ul>
          <li><a href="/dark-romance-audio-stories">Dark romance audio stories</a></li>
          <li><a href="/forbidden-romance-audio-stories">Forbidden romance audio</a></li>
          <li><a href="/enemies-to-lovers-audio-stories">Enemies to lovers audio</a></li>
          <li><a href="/adult-audio-stories">Adult audio stories</a></li>
          <li><a href="/audio-stories-for-women">Audio stories for women</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Compare</h4>
        <ul>
          <li><a href="/audio-stories-vs-audiobooks">Audio stories vs audiobooks</a></li>
          <li><a href="/audio-stories-vs-podcasts">Audio stories vs podcasts</a></li>
          <li><a href="/best-audio-story-app-for-adults">Best audio story app</a></li>
          <li><a href="/alternatives-to-romance-audiobooks">Alternatives to romance audiobooks</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="logo">The Private Story</span>
      <p style="color:#4a3f35;font-size:12px;max-width:320px;margin:0 auto 16px">Stories written for the parts of you that nobody else gets to know.</p>
      <div class="footer-legal">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/content-policy">Content Policy</a>
        <a href="/refund-policy">Refund Policy</a>
      </div>
      <p class="footer-copy">What you listen to here stays here. Always. · Adults 18+ only. · Ianson System Ltd t/a The Private Story.</p>
    </div>
  </div>
</footer>
`;

export function ssrHtmlShell(opts: SsrShellOptions): string {
  const schemasHtml = opts.schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(opts.title)}</title>
  <meta name="description" content="${escHtml(opts.description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escHtml(opts.canonical)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${escHtml(opts.title)}" />
  <meta property="og:description" content="${escHtml(opts.description)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:url" content="${escHtml(opts.canonical)}" />
  <meta property="og:locale" content="en_GB" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@theprivatestory" />
  <meta name="twitter:title" content="${escHtml(opts.title)}" />
  <meta name="twitter:description" content="${escHtml(opts.description)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />

  <!-- Theme -->
  <meta name="theme-color" content="#c9a227" />

  <!-- Structured data -->
  ${schemasHtml}

  <link rel="icon" type="image/svg+xml" href="${LOGO_SVG_INLINE}" />
  <style>${CSS}</style>
</head>
<body>
  <nav aria-label="Site navigation">
    <a class="logo" href="/"><img src="${LOGO_SVG_INLINE}" width="28" height="28" alt="The Private Story" style="vertical-align:middle;border-radius:6px;margin-right:8px" />The Private Story</a>
    <ul>
      <li><a href="/create">Create your story</a></li>
      <li><a href="/pricing">Pricing</a></li>
      <li><a href="/how-it-works">How it works</a></li>
      <li><a href="/discover">Discover</a></li>
    </ul>
  </nav>

  <main>
    ${
      opts.h1
        ? `${opts.badge ? `<span class="badge">${escHtml(opts.badge)}</span>` : ""}
    <h1>${escHtml(opts.h1)}</h1>
    ${opts.tagline ? `<p class="tagline">${escHtml(opts.tagline)}</p>` : ""}`
        : ""
    }
    ${opts.bodyHtml}
  </main>

  ${FOOTER_HTML}
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
