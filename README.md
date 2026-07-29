# paulo-marcos-lucio.github.io

Página profissional de **Paulo Marcos Lucio** — consultoria em **segurança de
aplicações web (AppSec)** no Brasil: diagnóstico e correção de vulnerabilidades,
hardening e adequação à LGPD, para PMEs e fintechs.

🔗 **Live:** https://paulo-marcos-lucio.github.io
🛡️ **Ferramenta em destaque:** [Sentinela](https://github.com/Paulo-Marcos-Lucio/sentinela) — diagnóstico não-intrusivo de segurança web.

## Stack

HTML semântico + CSS custom (sem framework) + JS mínimo (reveal-on-scroll, ano
dinâmico). Deploy via GitHub Pages, branch `main`, raiz do repo.

## Estrutura

- `index.html` — single page: hero, serviços, método, Sentinela, credibilidade, pacotes, contato
- `styles.css` — dark theme, mobile-first, design tokens (paleta de segurança teal/ciano)
- `script.js` — IntersectionObserver para reveal, chuva de binários em canvas, footer year auto
- `fonts/` — Inter e JetBrains Mono **auto-hospedadas** (SIL OFL 1.1, ver `fonts/LICENSE-fontes.md`)
- `favicon.svg` / `apple-touch-icon.png` / `og-image.svg` / `og-image.png` — identidade visual (escudo)
- `avatar.jpg` — foto de perfil, também auto-hospedada
- `robots.txt` + `sitemap.xml` — SEO básico

## Postura de segurança e privacidade

Um site que vende adequação à LGPD não pode vazar o visitante para terceiros:

- **Zero requisições a terceiros.** Fontes e avatar são servidos pela própria
  origem. Nenhum IP de visitante — dado pessoal (LGPD, art. 5º, I) — é
  transferido ao exterior (art. 33) por carregar a página.
- **CSP restritiva** via `<meta http-equiv>`: `default-src 'none'` com allowlist
  mínima; sem `'unsafe-inline'` (nenhum `style=` ou `<script>` inline no HTML).
- **`Referrer-Policy: strict-origin-when-cross-origin`** via `<meta name="referrer">`.

O GitHub Pages **não permite cabeçalhos de resposta**, então `X-Frame-Options`,
`X-Content-Type-Options` e a diretiva `frame-ancestors` não têm como ser
aplicados aqui — `<meta http-equiv>` os ignora. Estão conscientemente ausentes
em vez de declarados de forma inócua. Proteção contra clickjacking e
MIME-sniffing exigiria mover a hospedagem para um servidor/CDN próprio.

## Desenvolvimento local

```bash
python -m http.server 8000   # abre em http://localhost:8000
```

## Licença

MIT — código sob licença; conteúdo (textos pessoais, foto) reservado.
