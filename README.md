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
- `.well-known/security.txt` — canal de divulgação responsável (RFC 9116)
- `.nojekyll` — desliga o Jekyll, sem o qual `/.well-known/` não seria servido
- `_headers` — cabeçalhos prontos, **inertes no GitHub Pages** (ver abaixo)

## Postura de segurança e privacidade

Um site que vende adequação à LGPD não pode vazar o visitante para terceiros:

- **Zero requisições a terceiros.** Fontes e avatar são servidos pela própria
  origem. Nenhum IP de visitante — dado pessoal (LGPD, art. 5º, I) — é
  transferido ao exterior (art. 33) por carregar a página.
- **CSP restritiva** via `<meta http-equiv>`: `default-src 'none'` com allowlist
  mínima; sem `'unsafe-inline'` (nenhum `style=` ou `<script>` inline no HTML).
- **`Referrer-Policy: strict-origin-when-cross-origin`** via `<meta name="referrer">`.
- **Canal de reporte publicado** em `/.well-known/security.txt` (RFC 9116).

### O teto da plataforma, dito na cara

O GitHub Pages **não permite cabeçalhos de resposta**. E `<meta http-equiv>` só
vale para CSP e Referrer-Policy: o navegador **ignora** `X-Frame-Options`,
`X-Content-Type-Options` e a diretiva `frame-ancestors` quando vêm de metatag.
Eles estão conscientemente ausentes, em vez de declarados de forma inócua para
enganar scanner.

O efeito disso é mensurável. A [Sentinela](https://github.com/Paulo-Marcos-Lucio/sentinela)
avalia cabeçalho de resposta, como qualquer scanner externo, e o placar máximo
possível desta página **enquanto ela viver no GitHub Pages** é:

| Achado remanescente | Severidade | Custo na nota |
| --- | --- | --- |
| Sem proteção contra clickjacking | Média | −8 |
| `X-Content-Type-Options` ausente | Baixa | −3 |
| **Teto** | | **89 / B** |

Não existe truque de HTML que feche esses dois. Fechá-los exige um host que
emita cabeçalho — Cloudflare Pages ou Netlify leem o `_headers` deste repositório
como está, e o placar vai a 100 sem tocar em uma linha do site. É uma decisão de
hospedagem, não de código, e está registrada aqui para que ninguém precise
descobrir sozinho.

## Desenvolvimento local

```bash
python -m http.server 8000   # abre em http://localhost:8000
```

## Licença

MIT — código sob licença; conteúdo (textos pessoais, foto) reservado.
