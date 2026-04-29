# paulo-marcos-lucio.github.io

Site pessoal de Paulo Marcos Lucio · Eng. Java Pleno · Consultor em integrações regulatórias BR.

Vitrine da **Suíte de Referência Regulatória BR**: Pix Automático · DICT · Pix NFC · Open Finance Brasil · Open Insurance.

🔗 **Live:** https://paulo-marcos-lucio.github.io

## Stack

HTML semântico + CSS custom (sem framework) + JS mínimo (smooth scroll, reveal-on-scroll). Deploy via GitHub Pages, branch `main`, raiz do repo.

## Estrutura

- `index.html` — single page com hero, suíte (6 cards), pacotes, contato
- `styles.css` — dark theme, mobile-first, design system com custom properties
- `script.js` — IntersectionObserver para reveal, footer year auto
- `favicon.svg` — marca PM com gradient
- `og-image.svg` — preview social 1200×630
- `robots.txt` + `sitemap.xml` — SEO básico

## Desenvolvimento local

```bash
python -m http.server 8000
# ou
npx serve .
```

Abre em `http://localhost:8000`.

## Licença

MIT — código sob licença, conteúdo (textos pessoais, foto) reservado.
