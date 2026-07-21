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
- `script.js` — IntersectionObserver para reveal, footer year auto
- `favicon.svg` / `og-image.svg` — identidade visual (escudo)
- `robots.txt` + `sitemap.xml` — SEO básico

## Desenvolvimento local

```bash
python -m http.server 8000   # abre em http://localhost:8000
```

## Licença

MIT — código sob licença; conteúdo (textos pessoais, foto) reservado.
