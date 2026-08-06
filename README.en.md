<p align="right"><a href="README.md">🇧🇷 Ler em Português</a></p>

# paulo-marcos-lucio.github.io

Professional page for **Paulo Marcos Lucio** — **web application security
(AppSec)** consulting in Brazil: vulnerability diagnosis and remediation,
hardening, and LGPD compliance, for SMBs and fintechs.

🔗 **Live:** https://paulo-marcos-lucio.github.io
🛡️ **Featured tool:** [Sentinela](https://github.com/Paulo-Marcos-Lucio/sentinela) ("Sentinel") — non-intrusive web security diagnostic.

## Stack

Semantic HTML + custom CSS (no framework) + minimal JS (reveal-on-scroll,
dynamic year, PT/EN language toggle). Deployed via GitHub Pages, `main`
branch, repo root.

## Structure

- `index.html` — single page: hero, services, method, Sentinela, credibility, packages, contact
- `styles.css` — dark theme, mobile-first, design tokens (teal/cyan security palette)
- `script.js` — IntersectionObserver for reveal, binary rain on canvas, auto footer year
- `i18n.js` — client-side PT/EN language toggle (see below)
- `fonts/` — Inter and JetBrains Mono **self-hosted** (SIL OFL 1.1, see `fonts/LICENSE-fontes.md`)
- `favicon.svg` / `apple-touch-icon.png` / `og-image.svg` / `og-image.png` — visual identity (shield)
- `avatar.jpg` — profile photo, also self-hosted
- `robots.txt` + `sitemap.xml` — basic SEO
- `.well-known/security.txt` — responsible disclosure channel (RFC 9116)
- `.nojekyll` — turns off Jekyll, without which `/.well-known/` wouldn't be served
- `_headers` — ready-to-use headers, **inert on GitHub Pages** (see below)

## Language toggle (PT/EN)

The page ships in Portuguese — the site's native language and primary
audience — with an **EN button** in the header that translates the visible
text client-side, no page reload, no separate URL. `i18n.js` captures each
element's original Portuguese on first render (so there's no hand-duplicated
Portuguese dictionary to drift out of sync with the HTML), keeps only an
English dictionary, and swaps `<title>`/meta description/OG/Twitter/JSON-LD
along with the visible copy. The choice persists in `localStorage`. Because
the swap runs client-side, a crawler that doesn't execute JS always indexes
the Portuguese version — that's expected and fine, since Portuguese is the
page's canonical language.

## Security and privacy posture

A site that sells LGPD compliance can't leak its visitors to third parties:

- **Zero third-party requests.** Fonts and avatar are served from the same origin. No visitor IP — personal data under LGPD, art. 5 I — is transferred abroad (art. 33) just by loading the page.
- **Restrictive CSP** via `<meta http-equiv>`: `default-src 'none'` with a minimal allowlist; no `'unsafe-inline'` (no inline `style=` or `<script>` in the HTML).
- **`Referrer-Policy: strict-origin-when-cross-origin`** via `<meta name="referrer">`.
- **Published disclosure channel** at `/.well-known/security.txt` (RFC 9116).

### The platform's ceiling, said out loud

GitHub Pages **doesn't allow response headers**. And `<meta http-equiv>` only
works for CSP and Referrer-Policy: the browser **ignores** `X-Frame-Options`,
`X-Content-Type-Options`, and the `frame-ancestors` directive when they come
from a meta tag. They're consciously absent, rather than declared harmlessly
just to fool a scanner.

The effect is measurable. [Sentinela](https://github.com/Paulo-Marcos-Lucio/sentinela)
evaluates response headers, like any external scanner, and the maximum
possible score for this page **for as long as it lives on GitHub Pages** is:

| Remaining finding | Severity | Score cost |
| --- | --- | --- |
| No clickjacking protection | Medium | −8 |
| Missing `X-Content-Type-Options` | Low | −3 |
| **Ceiling** | | **89 / B** |

There's no HTML trick that closes those two. Closing them requires a host
that emits headers — Cloudflare Pages or Netlify read this repository's
`_headers` as-is, and the score goes to 100 without touching a single line
of the site. It's a hosting decision, not a code one, and it's documented
here so no one has to discover it alone.

## Local development

```bash
python -m http.server 8000   # opens at http://localhost:8000
```

## License

MIT — code is licensed; content (personal text, photo) reserved.
