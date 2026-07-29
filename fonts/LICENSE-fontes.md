# Fontes auto-hospedadas

As duas famílias tipográficas deste site são **auto-hospedadas** (nenhuma
requisição sai para `fonts.googleapis.com` ou `fonts.gstatic.com`). Isso evita
que o endereço IP do visitante — dado pessoal na LGPD, art. 5º, I — seja
transferido a um terceiro no exterior sem base legal (art. 33), e remove um
recurso render-blocking de origem cruzada.

Ambas são distribuídas sob a **SIL Open Font License, Version 1.1**
(<https://openfontlicense.org>), que permite uso, incorporação, redistribuição e
modificação, desde que a licença e a atribuição acompanhem os arquivos.

| Arquivo | Família | Copyright | Licença |
| --- | --- | --- | --- |
| `inter-variavel-latin.woff2` | **Inter** — <https://github.com/rsms/inter> | Copyright (c) 2016 The Inter Project Authors | SIL OFL 1.1 — [`OFL-Inter.txt`](OFL-Inter.txt) |
| `jetbrains-mono-variavel-latin.woff2` | **JetBrains Mono** — <https://github.com/JetBrains/JetBrainsMono> | Copyright 2020 The JetBrains Mono Project Authors | SIL OFL 1.1 — [`OFL-JetBrainsMono.txt`](OFL-JetBrainsMono.txt) |

## Detalhes técnicos

Os dois arquivos são as **fontes variáveis** (eixo `wght`) no subset **latin**,
tal como distribuídas pela API do Google Fonts — os mesmos bytes que o navegador
baixava antes, agora servidos pela própria origem:

- **Inter**: eixo `wght` 100–900 (declarado no CSS como `400 800`, faixa em uso).
- **JetBrains Mono**: eixo `wght` 400–800 (declarado como `400 800`).

Um único arquivo por família cobre **todos** os pesos usados na página
(400/500/600/700/800), o que elimina o *faux bold* que existia nos pesos 700 e
800 da JetBrains Mono — antes pedidos pelo CSS, mas nunca baixados.

Nenhum arquivo foi modificado; nomes de arquivo foram trocados apenas para
legibilidade, o que a OFL permite (a restrição da OFL é sobre o *nome reservado
da fonte*, não sobre o nome do arquivo).
