# Fontes auto-hospedadas

As quatro famílias tipográficas deste site são **auto-hospedadas** (nenhuma
requisição sai para `fonts.googleapis.com`, `fonts.gstatic.com` ou qualquer CDN).
Isso evita que o endereço IP do visitante — dado pessoal na LGPD, art. 5º, I —
seja transferido a um terceiro no exterior sem base legal (art. 33), e remove um
recurso render-blocking de origem cruzada.

Todas são distribuídas sob a **SIL Open Font License, Version 1.1**
(<https://openfontlicense.org>), que permite uso, incorporação, redistribuição e
modificação, desde que a licença e a atribuição acompanhem os arquivos.

| Arquivo | Família | Papel no site | Copyright | Licença |
| --- | --- | --- | --- | --- |
| `inter-variavel-latin.woff2` | **Inter** — <https://github.com/rsms/inter> | texto corrido | Copyright (c) 2016 The Inter Project Authors | SIL OFL 1.1 — [`OFL-Inter.txt`](OFL-Inter.txt) |
| `jetbrains-mono-variavel-latin.woff2` | **JetBrains Mono** — <https://github.com/JetBrains/JetBrainsMono> | rótulos, dados, terminais | Copyright 2020 The JetBrains Mono Project Authors | SIL OFL 1.1 — [`OFL-JetBrainsMono.txt`](OFL-JetBrainsMono.txt) |
| `league-gothic-variavel-latin.woff2` | **League Gothic** — <https://github.com/theleagueof/league-gothic> | display: títulos, números de destaque | Copyright 2010 The League Gothic Project Authors | SIL OFL 1.1 — [`OFL-LeagueGothic.txt`](OFL-LeagueGothic.txt) |
| `cormorant-garamond-500-italico-latin.woff2` | **Cormorant Garamond** — <https://github.com/CatharsisFonts/Cormorant> | legendas "de prancha" (Fig. I — …) | Copyright 2015 The Cormorant Project Authors | SIL OFL 1.1 — [`OFL-CormorantGaramond.txt`](OFL-CormorantGaramond.txt) |

## Detalhes técnicos

Todos os arquivos estão no subset **latin**. Inter e JetBrains Mono são os
mesmos bytes que a API do Google Fonts distribuía; League Gothic e Cormorant
Garamond são os arquivos tal como publicados pelo projeto Fontsource. Agora
todos são servidos pela própria origem.
Nenhum arquivo foi modificado; nomes de arquivo foram trocados apenas para
legibilidade, o que a OFL permite (a restrição da OFL é sobre o *nome reservado
da fonte*, não sobre o nome do arquivo).

- **Inter**: fonte variável, eixo `wght` 100–900 (declarado no CSS como
  `400 800`, faixa em uso).
- **JetBrains Mono**: fonte variável, eixo `wght` 400–800 (declarado como
  `400 800`). Um único arquivo variável por família cobre **todos** os pesos
  de texto usados na página (400/500/600/700/800), o que eliminou o *faux
  bold* que existia nos pesos 700 e 800 da JetBrains Mono — antes pedidos pelo
  CSS, mas nunca baixados.
- **League Gothic** (v2.001): fonte variável no eixo de **largura** `wdth`
  75–100 (declarado como `font-stretch: 75% 100%`), com **um único peso, 400**.
  Por isso todo elemento em League Gothic declara `font-weight: 400` e
  `font-synthesis: none` — sem isso, um `<h1>`/`<h2>` (peso 700 por padrão)
  sairia com negrito *sintético*, borrado pelo navegador. Arquivo baixado de
  `cdn.jsdelivr.net/fontsource/fonts/league-gothic:vf@latest/latin-wdth-normal.woff2`
  (18,6 KB). Observação honesta: o arquivo de licença do projeto
  (`OFL-LeagueGothic.txt`, do repositório google/fonts) diz *Copyright 2010*;
  a tabela `name` dentro da própria fonte v2.001 diz *Copyright 2020* — os dois
  se referem aos mesmos autores (The League Gothic Project Authors).
- **Cormorant Garamond**: arquivo **estático**, só o estilo itálico peso 500
  (o único usado: as legendas). Arquivo baixado de
  `cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond@latest/latin-500-italic.woff2`
  (23,9 KB).

O download foi feito **uma única vez**, na hora de montar o site; o navegador do
visitante nunca fala com esses endereços. Integridade conferida por SHA-256 no
momento da cópia:

| Arquivo | SHA-256 |
| --- | --- |
| `league-gothic-variavel-latin.woff2` | `2190db40de7988ba883bfbd59c31f7d9a1fc5c5923e634d31b4aa3eba0bbf3e0` |
| `cormorant-garamond-500-italico-latin.woff2` | `4fb55a7a6d564d428061fe12c82c896264bcc8b7f0b52840bf88e0db5b91256f` |

Nenhuma das quatro famílias tem o glifo de seta (`→`, `↗`): onde o texto usa
seta, o navegador desenha esse caractere com a fonte do sistema — comportamento
que o site já tinha antes, e que não muda nada de licença.
