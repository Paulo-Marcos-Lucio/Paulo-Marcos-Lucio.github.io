(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     abismo.js — "O Abismo de Argos": o fundo vivo do site.

     Argos Panóptes é o vigia de cem olhos da mitologia grega — Hermes, que o
     matou, é chamado de Argeiphóntes em Homero. Aqui ele não morreu: virou
     código. O corpo é ASCII/binário; os olhos são nítidos e seguem o ponteiro.
     É a metáfora do trabalho: o que está exposto, alguém vê.

     PIPELINE (WebGL2, 3 passes por quadro):
       1. CENA  — um fragmento por CÉLULA de texto (cols × linhas, ~10–20 mil).
                  A arte (objeto CENA, abaixo) decide para cada célula o glifo,
                  o brilho, a tinta (posição na paleta) e a emissão (brilho
                  difuso de fundo). Sai numa textura RGBA8:
                  R = índice do glifo / 255 · G = brilho · B = tinta · A = emissão
       2. TELA  — um fragmento por PIXEL: busca a célula, desenha o glifo do
                  atlas na cor da paleta, soma a emissão suavizada, a lanterna,
                  vinheta, scanline e grão.
       3. OLHOS — quads instanciados com alpha blending: olhos nítidos em
                  meio-tom ("o corpo é código; os olhos são de verdade").
     O custo pesado (formas, ruído) roda por célula, não por pixel; a main
     thread só atualiza uniforms e o estado dos olhos.

     CONTRATO COM O HTML
       <canvas id="abismo" aria-hidden="true">  fundo fixo, pointer-events:none
       [data-abismo-veu]    retângulos onde o fundo escurece (contraste WCAG)
       [data-abismo-pausa]  botão de pausa (WCAG 2.2.2) — nasce hidden
       .btn-wa, .wa-fab, [data-abismo-foco]  CTAs que atraem o olhar
       html[data-lang]      idioma atual (pt|en), escrito por i18n.js

     CSP: nada aqui fere script-src/style-src 'self' — shaders são strings,
     atlas e mensagens nascem em canvas/arrays, estilo só via CSSOM, nenhuma
     requisição de rede (connect-src 'none'); textura de cena, se houver, é
     imagem da própria origem (img-src 'self').

     ACESSIBILIDADE
       prefers-reduced-motion → um quadro estático (olhos abertos, de frente).
       Botão de pausa congela tudo (WCAG 2.2.2). Nada pisca: o glitch é
       DESLOCAMENTO de faixa e mudança global de brilho é sempre lenta (2.3.1).
     ═══════════════════════════════════════════════════════════════════════════ */

  var canvasInicial = document.getElementById('abismo');
  if (!canvasInicial) return;

  var html = document.documentElement;
  function consulta(q) {
    try { return window.matchMedia(q); } catch (e) { return { matches: false }; }
  }
  var MQ_REDUZIDO = consulta('(prefers-reduced-motion: reduce)');
  var TOQUE = consulta('(pointer: coarse)').matches && !consulta('(hover: hover)').matches;
  function idioma() { return html.getAttribute('data-lang') === 'en' ? 'en' : 'pt'; }
  function agora() { return performance.now() / 1000; }
  function aleat(a, b) { return a + Math.random() * (b - a); }
  function limitar(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ───────────────────────────── textos (PT/EN) ───────────────────────────── */
  var TXT = {
    pt: {
      pausar: 'Pausar animação', retomar: 'Retomar animação',
      pausarAria: 'Pausar as animações do fundo', retomarAria: 'Retomar as animações do fundo',
      tituloOculto: '◉ ainda te vejo…',
      camadas: ['SUPERFÍCIE', 'I · O LIMBO', 'II · A GARGANTA', 'III · O ERMO', 'IV · O ECLIPSE'],
      sussurro: 'AINDA ESTOU AQUI',
      // Ficção decorativa: aparecem quando a lanterna (o cursor) "decodifica" o binário.
      mensagens: ['MEMENTO MORI', 'NADA SE ESCONDE', 'EU VEJO O QUE ESTÁ EXPOSTO', 'SEU .ENV ESTÁ ABERTO?',
        '0xDEADBEEF', '/ETC/SHADOW', 'ACESSO NEGADO', 'ELE NUNCA DORME', 'TODO SEGREDO VAZA',
        'DROP TABLE ALMAS;', 'RM -RF /ESPERANÇA', 'ARGOS VÊ', '403 · 404 · 500', 'QUEM VIGIA O VIGIA?'],
      console: [
        'ARGOS ABRIU UM OLHO.',
        'Você abriu o DevTools — é exatamente por aqui que um diagnóstico começa.',
        'Este site não grava cookies, não chama terceiros e a CSP mora no <head>. Confira na aba Network.',
        'Achou algo exposto aqui? Divulgação responsável: /.well-known/security.txt',
        'Quer esse olhar no seu sistema? contatopml26@gmail.com · https://wa.me/5512991478991'
      ]
    },
    en: {
      pausar: 'Pause animation', retomar: 'Resume animation',
      pausarAria: 'Pause the background animations', retomarAria: 'Resume the background animations',
      tituloOculto: '◉ still watching you…',
      camadas: ['SURFACE', 'I · THE LIMBO', 'II · THE GULLET', 'III · THE WASTE', 'IV · THE ECLIPSE'],
      sussurro: 'I AM STILL HERE',
      mensagens: ['MEMENTO MORI', 'NOTHING STAYS HIDDEN', 'I SEE WHAT IS EXPOSED', 'IS YOUR .ENV OPEN?',
        '0xDEADBEEF', '/ETC/SHADOW', 'ACCESS DENIED', 'IT NEVER SLEEPS', 'EVERY SECRET LEAKS',
        'DROP TABLE SOULS;', 'RM -RF /HOPE', 'ARGOS SEES', '403 · 404 · 500', 'WHO WATCHES THE WATCHER?'],
      console: [
        'ARGOS OPENED AN EYE.',
        'You opened DevTools — that is exactly where a diagnosis begins.',
        'This site sets no cookies, calls no third parties, and its CSP lives in the <head>. Check the Network tab.',
        'Found something exposed here? Responsible disclosure: /.well-known/security.txt',
        'Want this gaze on your system? contatopml26@gmail.com · https://wa.me/5512991478991'
      ]
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     CENA — o plug-in de arte. ══ CENA: início ══

     glsl: define  vec4 cena(vec2 p, vec2 cel)
       p   = centro da célula em px CSS do viewport (y para baixo)
       cel = índice da célula (coluna, linha a partir do TOPO)
       retorna vec4(glifo, brilho 0..1, tinta 0..1, emissão 0..1)
     Uniforms disponíveis (px CSS do viewport, y para baixo):
       uRes, uCel (tamanho da célula), uGrade (cols, linhas), uTempo (s),
       uPonteiro (x, y, presença 0..1, velocidade px/s), uLanterna (x, y, raio),
       uLuz (0..1), uRolagem (scrollY), uHeroi (x, y, w, h do hero no viewport),
       uAncora (px) + uEscala (px por unidade) = referencial da criatura,
       uDespertar (0..1), uOcio (0 ativo → 1 dormindo), uFuria (easter egg 0..1),
       uOnda (clique: x, y, t0, força), uGlitch, uVeus[8]/uNVeus,
       uOlhos[32]/uNOlhos (x, y, raio px, abertura — para escavar órbitas),
       uTex0/uTex1 + uTexInfo (x = tex0 pronta, y = tex1 pronta), uSemente.
     Helpers: hash11/hash21/hash22, ruido, fbm, rot, sdCirculo, sdElipse,
       sdCapsula, sdCaixa, smin, lanterna(p), veu(p), rampa(d), binario(cel, taxa),
       rampaBinaria(d, cel), hachura(ang), fundoAbismo(p, cel), glifoMsg(linha, col).
     Glifos: G_* (ver CABECALHO_CENA). Paleta (tinta): 0 preto-sangue → 0,5
       sangue → 0,72 vermelho vivo → 0,88 brasa → 1 osso incandescente.

     layout(ctx) → { ancora: {x, y} em px do DOCUMENTO, escala: px/unidade,
       olhos: [{x, y, rx, ry, ang, tipo, peso}] em unidades da criatura,
       sussurro: {x, y} em unidades }  — ctx: {W, H, heroi: {x, y, w, h} (documento),
       estreito: bool, toque: bool}
       tipo: 0 = principal (pupila redonda) · 1 = fenda (bicho) · 2 = menor ·
             3 = olho de rosto do mar (só abre sob a lanterna)
       peso: 0..1 — quão "rápido/atento" o olho é (principais ~1).
     texturas: { tex0: 'arquivo.png', tex1: ... } opcionais (mesma origem).
     ═══════════════════════════════════════════════════════════════════════════ */
  var CENA = {
    // relevo esculpido offline (gerador/gerar_mascara.py): normal+altura e borda+traço+cavidade
    texturas: { tex0: 'mascara-n.png', tex1: 'mascara-m.png', tex2: 'rosto-n.png', tex3: 'rosto-m.png' },

    glsl: [
      // ── constantes: as MESMAS do gerador/gerar_mascara.py e do layout abaixo
      'const vec2 MASC_O = vec2(-1.30, -1.30);',
      'const vec2 MASC_T = vec2(2.60, 2.86);',
      'const vec2 ECL_C = vec2(0.0, -0.05);',
      'const float ECL_R = 1.20;',
      'const float MAR_H = 1.45, MAR_D = 0.9, MAR_Z0 = 0.55, MAR_G = 1.5, MAR_FH = 0.66, MAR_FW = 0.70, MAR_PASSO = 1.08;',
      // leitura do relevo esculpido offline: x = distância à borda (un, <0 dentro), y = altura (un),
      // z = classe de traço (0 nada, 1..4 = direção do fio), w = cavidade (<0 vinco); n = normal
      'vec4 relevo(vec2 m, out vec3 n) {',
      '  vec2 uv = (m - MASC_O) / MASC_T;',
      '  if (uv.x < 0.003 || uv.y < 0.003 || uv.x > 0.997 || uv.y > 0.997) { n = vec3(0.0, 0.0, 1.0); return vec4(1.0, 0.0, 0.0, 0.0); }',
      // textura ainda chegando: um casco liso no lugar (some sem salto quando a textura chega)
      '  if (uTexInfo.x < 0.5 || uTexInfo.y < 0.5) {',
      '    n = normalize(vec3(m.x * 0.45, (m.y - 0.1) * 0.3, 1.0));',
      '    return vec4(sdElipse(m - vec2(0.0, 0.08), vec2(0.95, 1.30)), 0.1, 0.0, 0.0);',
      '  }',
      '  vec4 a = texture(uTex0, uv);',
      '  vec4 b = texture(uTex1, uv);',
      '  ivec2 ts = textureSize(uTex1, 0);',
      '  float cls = floor(texelFetch(uTex1, min(ivec2(uv * vec2(ts)), ts - 1), 0).g * 255.0 / 40.0 + 0.5);',
      '  n.xy = (a.xy * 2.0 - 1.0) * 2.4;',
      '  n = normalize(vec3(n.xy, sqrt(max(1.0 - dot(a.xy * 2.0 - 1.0, a.xy * 2.0 - 1.0), 0.02))));',
      '  return vec4((b.r - 0.5) * 0.5, a.b * 0.46, cls, (b.b - 0.5) / 9.0);',
      '}',
      // ouro batido: células de Voronoi grosseiras; cada "martelada" inclina a normal para o seu fundo
      'vec2 martelo(vec2 u) {',
      '  vec2 q = u * 7.5, i = floor(q), f = fract(q);',
      '  float best = 9.0; vec2 bv = vec2(0.0);',
      '  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {',
      '    vec2 g = vec2(float(x), float(y));',
      '    vec2 r = g + hash22(i + g) - f;',
      '    float d = dot(r, r);',
      '    if (d < best) { best = d; bv = r; }',
      '  }',
      '  return bv;',
      '}',
      // lanterna como lâmpada na frente do relevo: x = difusa, y = especular (já atenuadas)
      'vec2 lampada(vec3 P, vec3 n, float metal) {',
      '  vec2 lu = (uLanterna.xy - uAncora) / uEscala;',
      '  float R = max(uLanterna.z / uEscala, 0.05);',
      '  vec3 L = vec3(lu, 0.75) - P;',
      '  float att = uLuz * exp(-dot(L.xy, L.xy) / (R * R) * 1.5);',
      '  L = normalize(L);',
      '  float dif = max(dot(n, L), 0.0) * att;',
      '  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 24.0) * att * metal;',
      '  return vec2(dif, spec);',
      '}',
      // tom → glifo: "a luz revela o código" — sombra é retícula de meio-tom (gravura impressa),
      // onde a luz bate o metal vira binário, e o brilho máximo vira @
      'float glifoTom(float t, vec2 cel) {',
      '  if (t < 0.08) return G_ESPACO;',
      '  if (t < 0.14) return G_MEIOTOM1;',
      '  if (t < 0.21) return G_MEIOTOM2;',
      '  if (t < 0.29) return G_MEIOTOM3;',
      '  if (t < 0.38) return G_MEIOTOM4;',
      '  if (t < 0.64) return binario(cel, 0.35);',
      '  if (t < 0.84) return G_HASH;',
      '  return G_ARROBA;',
      '}',
      // pontilhado ordenado (Bayer 4×4) na grade de células
      'float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }',
      'float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a) + 0.03125; }',
      // O ouro da máscara é a imagem CODIFICADA em binário: a rampa " ·:10" com pontilhado ordenado
      // (como as gravuras 1-bit do Hermes) — o 0 e o 1 não são sorteados, eles carregam o tom.
      // Uma onda lenta de "recodificação" desce pela máscara trocando 1↔0 (vida sem piscar).
      'float glifoMascara(float t, vec2 cel) {',
      '  float lv = clamp(t / 0.55, 0.0, 0.999) * 4.0;',
      '  float k = floor(lv) + step(bayer4(cel), fract(lv));',
      '  if (k < 0.5) return G_ESPACO;',
      '  if (k < 1.5) return G_PONTO_MEIO;',
      '  if (k < 2.5) return G_DOIS_PONTOS;',
      '  return k < 3.5 ? G_1 : G_0;',
      '}',
      'float brilhoMascara(float t) { return clamp(0.35 + 0.65 * t / 0.55, 0.0, 1.0); }',
      'float brilhoTom(float t) { return 0.08 + 0.92 * pow(clamp(t, 0.0, 1.0), 0.7); }',
      // luz de túmulo: brasa do eclipse vindo de cima (planos voltados ao alto viram binário, os de
      // frente ficam em meio-tom, os de baixo somem) + contraluz do anel em TODA a borda
      'float luzForma(vec3 n) {',
      '  float k = pow(max(dot(n, normalize(vec3(0.42, -0.65, 0.60))), 0.0), 1.7);',
      '  float f = pow(max(dot(n, normalize(vec3(-0.70, -0.45, 0.55))), 0.0), 2.0);',
      '  float rim = pow(clamp(1.0 - n.z, 0.0, 1.0), 1.6) * (0.25 + 0.75 * clamp(0.4 - n.y + 0.3 * n.x, 0.0, 1.0));',
      '  return 0.46 * k + 0.14 * f + 0.55 * rim;',
      '}',
      'float angDif(float a) { return mod(a + PI, 2.0 * PI) - PI; }',
      // meia-largura da célula medida na PERPENDICULAR de uma linha de ângulo a (raio, contorno)
      'float meiaCel(float a, vec2 cu) { return 0.5 * (cu.x * abs(sin(a)) + cu.y * abs(cos(a))); }',
      // Argos recebe o fundo já pintado (abismo + camada da descida) e desenha por cima
      'vec4 cenaArgos(vec2 p, vec2 cel, vec4 c) {',
      '  float E = max(uEscala, 1.0);',
      '  vec2 u = (p - uAncora) / E;',
      '  vec2 cu = uCel / E;',
      '  float vivo = (0.55 + 0.45 * uDespertar) * (1.0 - 0.4 * uOcio) + uFuria * 0.6;',
      // ── 1. eclipse: poço negro, cromosfera e coroa de raios de gravura (Hermes)
      '  vec2 ue = u - ECL_C;',
      '  float r = length(ue);',
      '  float ang = atan(ue.y, ue.x);',
      '  if (r < ECL_R + 3.4) {',
      '    c.y *= mix(0.25, 1.0, smoothstep(ECL_R, ECL_R + 2.4, r));',
      '    float nR = 44.0, gira = uTempo * 0.010;',
      '    float fase = (ang / (2.0 * PI)) * nR - gira;',
      '    float k = floor(fase + 0.5);',
      '    float aR = (k + gira) / nR * 2.0 * PI;',
      '    float hk = hash11(mod(k, nR) * 1.7 + 3.0);',
      '    float comp = ECL_R + 0.30 + 0.7 * hk + (mod(k, 4.0) < 0.5 ? 1.9 : 0.0);',
      '    if (abs(sin(ang - aR)) * r < meiaCel(aR, cu) * 0.95 && r > ECL_R + 0.06 && r < comp) {',
      '      float f = smoothstep(comp, ECL_R + 0.1, r);',
      '      float longo = mod(k, 4.0) < 0.5 ? 1.0 : 0.0;',
      '      float pac = step(fract(r * 1.4 - uTempo * 0.3 + hk * 7.0), 0.18) * longo;',
      '      float g = longo > 0.5 ? binario(cel, 3.0) : G_PONTO_MEIO;',
      '      c = vec4(g, max(c.y, (0.18 + 0.36 * f + 0.45 * pac) * vivo), 0.56 + 0.3 * f + 0.1 * pac, c.w);',
      '    }',
      '    if (r >= ECL_R) c.z = max(c.z, 0.62);',
      '    c.w = max(c.w, exp(-(r - ECL_R) * 1.7) * step(ECL_R, r) * 0.95 * vivo);',
      // o anel (cromosfera) é a fonte de luz da cena: um anel de ZEROS incandescentes (o vazio, a
      // morte, o bit apagado) com franja de "o" e ":" por fora; a emissão máxima vira o halo suave
      '    float mc = meiaCel(ang + PI * 0.5, cu);',
      '    float dAnel = abs(r - ECL_R) - mc;',
      '    if (dAnel < 0.0) c = vec4(G_0, 0.8 + 0.2 * uDespertar, 0.98, 1.0);',
      '    else if (dAnel < mc * 2.0 && r > ECL_R) c = vec4(G_o, max(c.y, 0.82 * vivo), 0.92, 1.0 * vivo);',
      '    else if (dAnel < mc * 4.0 && r > ECL_R) c = vec4(G_DOIS_PONTOS, max(c.y, 0.6 * vivo), 0.84, 0.9 * vivo);',
      '    else if (r < ECL_R) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '  }',
      // ── 2. mar de máscaras adormecidas (Berserk): fileiras em perspectiva, as da frente tapam as de trás
      '  float pe = uHeroi.y + uHeroi.w;',
      '  if (u.y > MAR_H + 0.01 && p.y < pe + 80.0) {',
      '    float zc = MAR_D / (u.y - MAR_H);',
      '    float jEst = floor(log(zc / MAR_Z0) / log(MAR_G));',
      '    float achou = 0.0;',
      '    vec4 rv = vec4(1.0); vec3 nm = vec3(0.0, 0.0, 1.0); vec2 mm = vec2(0.0);',
      '    for (int q = -4; q <= 1; q++) {',
      '      float j = jEst + float(q);',
      '      if (j < 0.0) continue;',
      '      float zj = MAR_Z0 * pow(MAR_G, j);',
      '      float yj = MAR_H + MAR_D / zj;',
      '      float hj = MAR_FH / zj, wj = MAR_FW / zj;',
      '      float passo = wj * MAR_PASSO;',
      '      float desl = fract(j * 0.618034);',
      '      float i = floor(u.x / passo - desl + 0.5);',
      '      float xc = (i + desl) * passo;',
      '      float yc = yj + (fract(i * 0.754877 + j * 0.56984) - 0.5) * 0.16 * hj;',
      '      vec2 m = vec2((u.x - xc) / wj * 2.6, (u.y - yc) / hj * 2.86 + 0.13);',
      '      vec3 n0; vec4 r0 = relevo(m, n0);',
      '      if (r0.x < 0.0) { achou = r0.x < -0.07 ? 1.0 : 0.5; rv = r0; nm = n0; mm = m; if (achou > 0.75) break; }',
      '    }',
      '    float neb = smoothstep(7.0, 1.4, zc) * smoothstep(pe + 80.0, pe - 160.0, p.y);',
      '    if (achou > 0.75) {',
      '      vec2 ls = lampada(vec3(u, rv.y * 0.25), nm, 0.5);',
      '      float oc = clamp(1.0 + rv.w * 22.0, 0.0, 1.0);',
      '      float t = (0.12 * nm.z + luzForma(nm) * 0.7 + max(rv.w, 0.0) * 6.0) * oc * oc;',
      '      t *= 1.0 - 0.6 * smoothstep(0.25, 0.65, nm.y);',
      '      t = t * neb + 0.5 * ls.x + 0.6 * ls.y;',
      '      c = vec4(glifoMascara(t, cel), brilhoMascara(t) * (0.4 + 0.4 * neb), 0.32 + 0.5 * t, 0.0);',
      // olhos dos mortos: costura "-" no escuro; sob a lanterna abrem em brasa (o tipo 3 faz o mesmo, nítido)
      '      vec2 me = vec2(abs(mm.x) - 0.40, mm.y + 0.12) / vec2(0.21, 0.10);',
      '      float Lz = max(lanterna(p), uFuria);',
      '      if (dot(me, me) < 1.0) {',
      '        if (Lz > 0.3) c = vec4(Lz > 0.6 ? G_0 : G_o, 0.55 + 0.45 * Lz, 0.95, 0.35 * Lz);',
      '        else c = vec4(G_LH, 0.18 + 0.3 * neb, 0.6, 0.0);',
      '      }',
      '    } else {',
      '      c.y *= achou > 0.25 ? 0.0 : 0.45;',
      '    }',
      '  }',
      // ── 3/4. braços (atrás da máscara) e feixes de raios binários que as mãos seguram.
      // A mão k é o olho da palma uOlhos[3+k] (o layout em JS decide onde fica em cada tela);
      // uOlhos[3+k].z == 0 desliga o braço.
      '  float dBraco = 9.0; vec3 nBraco = vec3(0.0, 0.0, 1.0); float eixoB = 0.0;',
      '  float feixe = 0.0; float angFx = 0.0; float pacote = 0.0; float rFx = 9.0;',
      '  for (int k = 0; k < 6; k++) {',
      '    if (3 + k >= uNOlhos) break;',
      '    vec4 o = uOlhos[3 + k];',
      '    if (o.z < 0.5) continue;',
      '    float fk = float(k);',
      '    float lado = k < 3 ? -1.0 : 1.0;',
      '    float kk = mod(fk, 3.0);',
      '    vec2 Hd = (o.xy - uAncora) / E;',
      '    vec2 S = vec2(lado * 0.50, -0.42 + 0.36 * kk);',
      '    vec2 dedos = normalize(vec2(lado * 0.38, -1.0));',
      '    vec2 Wr = Hd - dedos * 0.17;',
      '    vec2 dd = Wr - S;',
      '    float Ld = length(dd);',
      '    vec2 dn = dd / max(Ld, 1e-4);',
      '    vec2 pp = vec2(-dn.y, dn.x);',
      '    float dobra = (kk < 0.5 ? -0.20 : (kk < 1.5 ? 0.14 : 0.22)) * lado;',
      '    vec2 Ec = S + dd * 0.52 + pp * dobra * Ld;',
      // feixe: leque de raios saindo da mão (longo para fora) e um tufo curto para trás
      '    vec2 v = u - Hd;',
      '    float rv2 = length(v);',
      '    if (rv2 > 0.17) {',
      '      float av = atan(v.y, v.x);',
      '      float eixo = atan(dn.y, dn.x) + lado * (kk < 0.5 ? -0.55 : (kk < 1.5 ? 0.25 : 0.6));',
      '      for (int s = 0; s < 2; s++) {',
      '        float alfa = s == 0 ? 0.32 : 0.22;',
      '        float nr = s == 0 ? 9.0 : 6.0;',
      '        float phi = angDif(av - eixo - (s == 0 ? 0.0 : PI));',
      '        if (abs(phi) < alfa * 1.12) {',
      '          float st = (phi / alfa * 0.5 + 0.5) * (nr - 1.0);',
      '          float ii = clamp(floor(st + 0.5), 0.0, nr - 1.0);',
      '          float hh = hash11(ii * 7.13 + fk * 31.7 + float(s) * 3.1);',
      '          float phii = (ii / (nr - 1.0) * 2.0 - 1.0) * alfa + (hh - 0.5) * alfa / nr;',
      '          float aRaio = eixo + phii + (s == 0 ? 0.0 : PI);',
      '          float compR = s == 0 ? 1.4 + 2.8 * hh : 0.4 + 0.8 * hh;',
      '          if (abs(sin(av - aRaio)) * rv2 < meiaCel(aRaio, cu) * 0.9 && rv2 < compR) {',
      '            float f = exp(-rv2 * 0.6) * smoothstep(compR, compR * 0.5, rv2) * smoothstep(0.17, 0.45, rv2);',
      '            if (f > feixe) {',
      '              feixe = f; angFx = aRaio; rFx = rv2;',
      '              pacote = step(fract(rv2 * 1.1 - uTempo * (0.35 + 0.4 * hh) + hh * 5.0), 0.14);',
      '            }',
      '          }',
      '        }',
      '      }',
      '    }',
      // braço: dois segmentos afunilados (ombro→cotovelo→punho) com volume de músculo
      '    for (int sg = 0; sg < 2; sg++) {',
      '      vec2 a = sg == 0 ? S : Ec, b = sg == 0 ? Ec : Wr;',
      '      vec2 pa = u - a, ba = b - a;',
      '      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);',
      '      vec2 qd = pa - ba * h;',
      '      float ra = sg == 0 ? mix(0.12, 0.085, h) + 0.03 * sin(PI * h) : mix(0.085, 0.06, h) + 0.02 * sin(PI * min(h * 1.4, 1.0));',
      '      float d = length(qd) - ra;',
      '      if (d < dBraco) {',
      '        dBraco = d;',
      '        float sd = clamp(length(qd) / ra, 0.0, 1.0) * sign(ba.x * pa.y - ba.y * pa.x);',
      '        vec2 perp = normalize(vec2(-ba.y, ba.x));',
      '        nBraco = vec3(perp * sd, sqrt(max(1.0 - sd * sd, 0.0)));',
      '        eixoB = atan(ba.y, ba.x);',
      '      }',
      '    }',
      // mão aberta, palma para nós: palma + quatro dedos em leque + polegar (o olho mora na palma)
      '    vec2 hl = rot(-atan(dedos.y, dedos.x)) * (u - Hd);',
      '    float dm = sdElipse(hl - vec2(0.04, 0.0), vec2(0.18, 0.155));',
      '    for (int df = 0; df < 5; df++) {',
      '      float fa = df == 4 ? -1.3 * lado : (float(df) - 1.5) * 0.42;',
      '      float fl = df == 4 ? 0.19 : 0.30 - abs(float(df) - 1.3) * 0.045;',
      '      vec2 b0 = vec2(0.15 * cos(fa), 0.12 * sin(fa));',
      '      vec2 b1 = b0 + vec2(cos(fa), sin(fa)) * fl;',
      '      dm = min(dm, sdCapsula(hl, b0, b1 + vec2(-sin(fa), cos(fa)) * 0.04 * lado, 0.034));',
      '    }',
      '    if (dm < dBraco) { dBraco = dm; nBraco = normalize(vec3(rot(atan(dedos.y, dedos.x)) * hl * 2.4, 1.0)); eixoB = atan(dedos.y, dedos.x); }',
      '  }',
      '  if (feixe > 0.0) {',
      '    float b = (0.22 + 0.6 * feixe) * vivo;',
      '    c = vec4(pacote > 0.5 ? binario(cel, 9.0) : G_PONTO_MEIO, max(c.y, b * (pacote > 0.5 ? 1.6 : 1.0)), 0.62 + 0.28 * feixe + 0.1 * pacote, max(c.w, 0.25 * exp(-rFx * 4.0)));',
      '  }',
      '  if (dBraco < 0.0) {',
      '    vec2 ls = lampada(vec3(u, 0.12), nBraco, 0.35);',
      // membro em contraluz: corpo na penumbra, só a borda de cima pega a brasa do eclipse
      '    float t = 0.06 * nBraco.z + luzForma(nBraco) * 0.65;',
      '    t *= 1.0 - 0.6 * smoothstep(0.25, 0.7, nBraco.y);',
      '    t += 0.55 * ls.x + 0.6 * ls.y;',
      '    c = vec4(glifoMascara(t, cel), brilhoMascara(t) * (0.45 + 0.3 * vivo), 0.38 + 0.4 * t + 0.2 * ls.y, 0.0);',
      '  }',
      // ── 5. a máscara: relevo de ouro batido em binário, recortado pelo eclipse, re-iluminado pela lanterna
      '  if (abs(u.x) < 1.32 && u.y > -1.32 && u.y < 1.58) {',
      '    vec3 n; vec4 rv = relevo(u, n);',
      '    float aN = atan(n.y, n.x);',
      '    if (rv.x < 0.0) {',
      '      vec2 mt = martelo(u);',
      '      float liso = rv.z > 0.5 ? 0.35 : 1.0;',
      '      vec3 nn = normalize(vec3(n.xy + mt * 0.22 * liso, n.z));',
      '      vec2 ls = lampada(vec3(u, rv.y), nn, 1.0);',
      '      float brilhoE = pow(max(dot(nn, normalize(vec3(0.42, -0.65, 1.60))), 0.0), 30.0);',
      // ouro num túmulo escuro: reflete o brilho vermelho do eclipse em toda superfície voltada
      // para a frente (tom-base), cristas e planos voltados à luz acendem, recessos (órbita, narina,
      // boca, vão sob a sobrancelha) caem no preto — é a oclusão que desenha o rosto
      '      float oclu = clamp(1.0 + rv.w * 26.0, 0.0, 1.0);',
      '      float t = 0.20 * n.z + luzForma(nn) * 0.75 + 0.45 * brilhoE + max(rv.w, 0.0) * 8.0;',
      '      t *= 1.0 - 0.35 * smoothstep(-0.2, 1.3, u.y);',
      '      t *= 1.0 - 0.6 * smoothstep(0.25, 0.65, n.y);',
      '      t *= oclu * oclu;',
      '      t += 0.5 * ls.x + 0.7 * ls.y;',
      '      float g = glifoMascara(t, cel);',
      '      float fio = rv.z > 0.5 ? 1.0 : 0.0;',
      '      if (fio > 0.5) { g = rv.z < 1.5 ? G_LH : (rv.z < 2.5 ? G_LD2 : (rv.z < 3.5 ? G_LV : G_LD1)); t = max(t, 0.34); }',
      '      float glint = max(ls.y, brilhoE * oclu * 0.8);',
      '      if (glint > 0.72) g = G_ARROBA;',
      '      float varre = 1.0 - smoothstep(0.0, 0.035, abs(fract(uTempo * 0.07 - u.y * 0.22) - 0.5) - 0.465);',
      '      if (varre > 0.5 && (g == G_1 || g == G_0)) g = g == G_1 ? G_0 : G_1;',
      '      float tinta = 0.40 + 0.55 * clamp(t, 0.0, 1.0) + 0.25 * glint + 0.08 * varre;',
      '      c = vec4(g, brilhoMascara(t) + 0.12 * varre, clamp(tinta, 0.0, 1.0), 0.05 * glint);',
      // rebites da aba (a máscara original é furada na borda para ser costurada no rosto do morto)
      '      if (rv.x > -0.08 && rv.x < -0.035 && fract(atan(u.y - 0.1, u.x) * 7.0) < 0.16) c = vec4(G_o, max(c.y, 0.4 * vivo + 0.3 * ls.x), 0.72, 0.0);',
      '    }',
      // contorno em contraluz: o eclipse acende a borda da máscara (mais forte em cima)
      '    if (abs(rv.x) < meiaCel(aN + PI * 0.5, cu) * 1.1) {',
      '      float cima = clamp(0.45 - n.y * 0.8 + 0.25 * (-u.y), 0.0, 1.0);',
      '      c = vec4(cima > 0.5 ? G_MEIOTOM3 : G_MEIOTOM2, (0.35 + 0.45 * cima) * vivo, 0.66 + 0.14 * cima, 0.2 * cima * vivo);',
      '    }',
      '  }',
      // ── 6. órbitas e costuras: olho aberto afunda num poço escuro; fechado é costurado "-x-x-"
      '  for (int i = 0; i < 9; i++) {',
      '    if (i >= uNOlhos) break;',
      '    vec4 o = uOlhos[i];',
      '    if (o.z < 0.5) continue;',
      '    vec2 d = p - o.xy;',
      '    if (i == 2) d = vec2(d.y, -d.x);',
      '    vec2 e = d / vec2(o.z, o.z * 0.44);',
      '    float de = length(e);',
      '    float poco = i < 3 ? 1.0 : clamp(o.w * 1.5, 0.0, 1.0);',
      '    if (de < 1.45) c.y *= mix(1.0, 0.05 + 0.95 * smoothstep(0.95, 1.45, de), poco);',
      '  }',
      // ── 7. brasas subindo do mar (cinza viva, devagar; nunca piscam — só sobem)
      '  if (u.y > -1.2 && u.y < MAR_H + 1.6) {',
      '    float gx = floor(u.x / 0.16);',
      '    float hb = hash11(gx * 3.71 + 1.3);',
      '    if (hb < 0.5) {',
      '      float vel = 0.06 + 0.09 * hash11(gx * 1.93 + 7.0);',
      '      float py = MAR_H + 1.5 - mod(uTempo * vel + hb * 9.0, 2.9);',
      '      float px = (gx + 0.5 + 0.28 * sin(uTempo * 0.6 + hb * 40.0)) * 0.16;',
      '      if (abs(u.x - px) < cu.x * 0.5 && abs(u.y - py) < cu.y * 0.5) {',
      '        float vida = smoothstep(MAR_H + 1.5, MAR_H + 1.0, py) * smoothstep(-1.2, -0.2, py);',
      '        c = vec4(hb < 0.1 ? G_ASTERISCO : G_PONTO_MEIO, max(c.y, 0.55 * vida), 0.9, max(c.w, 0.2 * vida));',
      '      }',
      '    }',
      '  }',
      '  return c;',
      '}',
      // ══ CAMADAS: início (gerado por abismo-build/ferramentas/camadas.py) ══
      // ═══ CAMADAS DA DESCIDA ═══
      // Abaixo do hero o site é uma descida: cada faixa de seções é uma camada do abismo, com o seu
      // cenário (fixo na tela, com paralaxe própria) e as suas criaturas (presas às seções).
      // I  — O Limbo dos Rostos: campo de rostos deitados de nariz em ponta, céu de rostos, sol rubro
      // II — A Garganta: túnel de tentáculos que converge para uma luz, vórtice no alto, olhos no escuro
      // III — O Ermo: planície morta, agulhas de sombra longa, chuva de meteoros em brasa
      // IV — O Eclipse: céu em sangue e a multidão de cabeças voltadas para o sol negro
      'float tomCelula(float t, vec2 cel) { return glifoMascara(t, cel); }',
      'vec4 carne(float t, vec2 cel, float k) {',
      '  t = clamp(t, 0.0, 1.0);',
      '  return vec4(glifoMascara(t, cel), (0.16 + 0.84 * clamp(t / 0.55, 0.0, 1.0)) * k, 0.34 + 0.5 * t, 0.0);',
      '}',
      // ── I. O Limbo dos Rostos ──────────────────────────────────────────────────────
      // Campo de rostos em perspectiva no referencial da TELA, usando o mesmo relevo esculpido da máscara
      // do Argos (normal + cavidade): é o relevo que faz um rosto ler como rosto em 8x14 px.
      // hz = horizonte (px) · D = profundidade (px) · z0/G = 1ª fileira e razão · W0 = largura (px) na z = 1
      // L = direção da luz principal · cone > 0 = altura do nariz em cone espetado (Limbo), 0 = sem cone
      // devolve a célula pintada em c e 1/0 em achou
      'vec4 campoRostos(vec2 p, vec2 cel, vec4 c, float hz, float D, float z0, float G, float W0, vec3 L, float cone, out float achou) {',
      '  achou = 0.0;',
      '  float v = p.y - hz;',
      '  if (v < 1.0) return c;',
      '  float Lz = lanterna(p);',
      '  float zc = D / v;',
      '  float jEst = floor(log(max(zc, 1e-4) / z0) / log(G));',
      '  for (int q = -5; q <= 1; q++) {',
      '    float jj = jEst + float(q);',
      '    if (jj < 0.0) continue;',
      '    float zj = z0 * pow(G, jj);',
      '    float yj = hz + D / zj;',
      '    float wj = W0 / zj, hj = wj * 0.62;',
      '    float passo = wj * 1.12;',
      '    float desl = fract(jj * 0.618034);',
      '    float i = floor(p.x / passo - desl + 0.5);',
      '    float hi = hash11(i * 3.1 + jj * 7.3);',
      '    float xc = (i + desl) * passo + (hi - 0.5) * passo * 0.2;',
      '    float yc = yj + (hash11(i * 1.7 + jj) - 0.5) * hj * 0.25;',
      '    vec2 m = vec2((p.x - xc) / wj * 2.6, (p.y - yc) / hj * 2.86 + 0.13);',
      '    float neb = smoothstep(9.0, 0.5, zj);',
      // o nariz em cone: sai da ponta do nariz e passa da testa, espetado contra o céu
      '    if (cone > 0.0) {',
      '      float alt = cone * (0.8 + 0.4 * hi);',
      '      float topo = -1.25 - alt;',
      '      float f = clamp((m.y - topo) / (0.32 - topo), 0.0, 1.0);',
      '      float lw = 0.2 * f;',
      '      if (abs(m.x) < lw && m.y > topo && m.y < 0.32) {',
      '        float ex = 0.6 * uCel.x / wj * 2.6;',
      '        float t;',
      '        if (m.x < 0.0 && m.x < -lw + ex * 1.8) t = 0.62;              // quina acesa',
      '        else t = m.x < 0.0 ? 0.3 : 0.03;',
      '        t = t * (0.3 + 0.7 * neb) + 0.45 * Lz * step(m.x, 0.0);',
      '        float g = (m.x < 0.0 && m.x < -lw + ex * 1.8) ? hachura(atan(-(alt + 1.57) * hj / 2.86, 0.2 * wj / 2.6)) : glifoMascara(t, cel);',
      '        c = vec4(g, brilhoMascara(t) * (0.35 + 0.6 * neb), 0.34 + 0.55 * t, 0.0);',
      '        achou = 1.0; return c;',
      '      }',
      '    }',
      '    vec3 n; vec4 rv = relevo(m, n);',
      '    if (rv.x < 0.0) {',
      '      float oc = clamp(1.0 + rv.w * 22.0, 0.0, 1.0);',
      '      float dif = pow(max(dot(n, normalize(L)), 0.0), 1.6);',
      '      float rim = pow(clamp(1.0 - n.z, 0.0, 1.0), 1.6) * clamp(0.4 - n.y, 0.0, 1.0);',
      '      float t = (0.08 * n.z + 0.55 * dif + 0.4 * rim + max(rv.w, 0.0) * 6.0) * oc * oc;',
      '      t = t * (0.25 + 0.75 * neb) + 0.5 * Lz * n.z;',
      '      float g = glifoMascara(t, cel);',
      // os traços esculpidos do relevo (sobrancelha, pálpebra, nariz, boca): é o que faz ler "rosto"
      '      if (rv.z > 0.5 && neb > 0.25) { g = rv.z < 1.5 ? G_LH : (rv.z < 2.5 ? G_LD2 : (rv.z < 3.5 ? G_LV : G_LD1)); t = max(t, 0.36); }',
      '      c = vec4(g, brilhoMascara(t) * (0.35 + 0.55 * neb), 0.32 + 0.55 * t, 0.0);',
      // contorno: a borda do rosto pega a luz (separa um rosto do de trás)
      '      float mc = 0.6 * uCel.y / hj * 2.86;',
      '      if (rv.x > -mc * 0.5 && n.y < 0.3) c = vec4(hachura(atan(n.y, n.x) + PI * 0.5), (0.3 + 0.5 * clamp(0.3 - n.y, 0.0, 1.0)) * (0.4 + 0.6 * neb), 0.6, 0.04);',
      // olhos fechados: costura no escuro; sob a lanterna abrem em brasa
      '      vec2 me = vec2(abs(m.x) - 0.40, m.y + 0.12) / vec2(0.21, 0.10);',
      '      if (dot(me, me) < 1.0) {',
      '        if (Lz > 0.3) c = vec4(Lz > 0.6 ? G_0 : G_o, 0.55 + 0.45 * Lz, 0.95, 0.35 * Lz);',
      '        else c = vec4(G_LH, 0.2 + 0.35 * neb, 0.62, 0.0);',
      '      }',
      '      achou = 1.0; return c;',
      '    }',
      '  }',
      '  return c;',
      '}',
      'vec4 camadaRostos(vec2 p, vec2 cel, vec4 c) {',
      '  float S = min(uRes.x, uRes.y);',
      '  float rol = uRolCam.x;',
      '  float hz = uLimbo1.x;                          // a mesma conta do JS (geometriaLimbo)',
      '  float Lz = lanterna(p);',
      '  vec2 sc = vec2(uRes.x * 0.07, uRes.y * 0.10);',
      '  float rs = S * 0.05;',
      '  vec2 dsv = p - sc; float ds = length(dsv);',
      '  c.w = max(c.w, 0.75 * exp(-ds / (S * 0.18)));',
      '  if (ds < S * 0.6) c.z = max(c.z, 0.74);',
      '  if (p.y < hz) {',
      // céu de rostos: cabeças comprimidas, mais densas no alto, afundando na névoa do horizonte
      '    vec2 g = vec2(p.x + uTempo * 2.5, p.y * 1.25 + rol * 0.03) / (S * 0.075);',
      '    vec2 gi = floor(g); vec2 gf = fract(g) - 0.5;',
      '    vec2 m = (gf - (hash22(gi) - 0.5) * 0.25) / vec2(0.47, 0.42);',
      '    float dm = length(m);',
      '    float alto = smoothstep(hz, hz * 0.1, p.y);',
      '    c.y *= 0.35;',
      '    if (dm < 1.0) {',
      '      float t = (0.05 + 0.24 * (1.0 - dm * dm) * (0.7 - 0.3 * m.y)) * alto;',
      '      vec2 ol = vec2(abs(m.x) - 0.34, m.y + 0.02);',
      '      if (length(ol / vec2(0.17, 0.12)) < 1.0) t *= 0.15;',
      '      if (abs(m.x) < 0.2 && abs(m.y - 0.48) < 0.09) t *= 0.2;',
      '      t += 0.3 * Lz * (1.0 - dm);',
      '      c = vec4(glifoMascara(t, cel), 0.1 + 0.9 * t, 0.36 + 0.5 * t, c.w);',
      '    }',
      '  } else {',
      '    float achou;',
      '    c.y *= 0.2;',
      '    if (uTexInfo.z > 0.5) {',
      // alta definição: a célula vira janela (glifo 255) e o passo de gravura pinta o rosto
      '      vec4 fz;',
      '      if (limboGeo(p, uLimbo1, uLimbo2, uTex2, 0.55 * uCel.x, fz).w > 0.5) c = vec4(255.0, 0.3, 0.6, 0.0);',
      '    } else c = campoRostos(p, cel, c, hz, uRes.y * 0.08, 0.13, 1.45, S * 0.062, vec3(-0.6, -0.55, 0.6), 1.3, achou);',
      '    c.w = max(c.w, 0.3 * exp(-abs(p.y - hz) / (S * 0.05)));',
      '    c.z = max(c.z, 0.6);',
      '  }',
      // o sol rubro: núcleo incandescente, anel e raios finos de gravura
      '  if (ds < rs * 6.0) {',
      '    float a = atan(dsv.y, dsv.x);',
      '    float nR = 28.0;',
      '    float k = floor(a / (2.0 * PI) * nR + 0.5);',
      '    float aR = k / nR * 2.0 * PI;',
      '    float comp = rs * (1.5 + 3.5 * hash11(k + 4.0)) * (mod(k, 2.0) < 0.5 ? 1.0 : 0.6);',
      '    if (abs(sin(a - aR)) * ds < meiaCel(aR, uCel) * 0.8 && ds > rs * 1.12 && ds < comp)',
      '      c = vec4(G_PONTO_MEIO, 0.3 + 0.6 * smoothstep(comp, rs, ds), 0.86, max(c.w, 0.4));',
      '    if (ds < rs) c = vec4(ds < rs * 0.55 ? G_ARROBA : (ds < rs * 0.8 ? G_HASH : G_0), 1.0, 1.0 - 0.1 * ds / rs, 1.0);',
      '    else if (ds < rs * 1.12) c = vec4(G_o, 0.9, 0.86, 1.0);',
      '  }',
      '  return c;',
      '}',
      // ── II. A Garganta ─────────────────────────────────────────────────────────────
      // três cortinas de tentáculos pendurados (longe, meio, perto) abrem um túnel para uma brasa
      // distante; cada tubo é escuro, recortado pela luz do fundo na borda que dá para o túnel
      'vec4 camadaGarganta(vec2 p, vec2 cel, vec4 c) {',
      '  float S = min(uRes.x, uRes.y);',
      '  vec2 vp = vec2(uRes.x * 0.5, uRes.y * 0.66);',
      '  float Lz = lanterna(p);',
      '  float dv = length((p - vp) / vec2(1.25, 1.0)) / S;',
      // o fundo do túnel: brasa em redemoinho, mais quente perto da luz
      '  float brasa = exp(-dv * 2.6);',
      '  c.w = max(c.w, 0.8 * brasa);',
      '  c.z = max(c.z, 0.6 + 0.3 * brasa);',
      '  float sw = fbm(vec2(atan(p.y - vp.y, p.x - vp.x) * 2.0, log(dv + 0.02) * 3.0 - uTempo * 0.08));',
      '  c = vec4(sw > 0.55 ? hachura(atan(p.y - vp.y, p.x - vp.x) + PI * 0.5) : glifoMascara(0.1 * brasa, cel), (0.05 + 0.4 * brasa) * smoothstep(0.4, 0.7, sw), 0.62 + 0.3 * brasa, c.w);',
      // a luz lá no fim, com três vultos parados dentro dela
      '  vec2 dl = (p - vp) / uCel;',
      '  if (abs(dl.y) < 1.6 && abs(dl.x) < 4.5) {',
      '    bool vulto = abs(dl.y + 0.3) < 1.0 && (abs(dl.x + 1.0) < 0.5 || abs(dl.x) < 0.5 || abs(dl.x - 1.5) < 0.5);',
      '    c = vulto ? vec4(G_PIPE, 0.12, 0.3, 0.6) : vec4(abs(dl.x) < 2.5 ? G_ARROBA : G_HASH, 1.0, 1.0, 1.0);',
      '  }',
      '  float rol = uRolCam.y;',
      '  for (int L = 0; L < 3; L++) {',
      '    float fL = float(L);',
      '    float sp = S * (0.045 + 0.05 * fL);                     // perto = tubos mais grossos',
      '    float abre = S * (0.08 + 0.26 * fL);                    // o túnel: cada cortina abre mais',
      '    float y = p.y + rol * (0.05 + 0.08 * fL) + uTempo * (2.0 + fL);',
      '    float i0 = floor(p.x / sp);',
      '    for (int di = -1; di <= 1; di++) {',
      '      float i = i0 + float(di);',
      '      float h = hash11(i * 7.13 + fL * 31.0);',
      '      if (h < 0.2) continue;',
      '      float xc = (i + 0.5) * sp + sp * 0.55 * sin(y / (sp * (2.2 + 2.0 * h)) + h * 6.28 + uTempo * 0.15 * (1.0 + h))',
      '               + (vp.x - (i + 0.5) * sp) * 0.12 * smoothstep(0.0, uRes.y, p.y);',
      '      float w = sp * (0.2 + 0.16 * h) * (0.75 + 0.25 * sin(y / (sp * 1.3) + h * 9.0));',
      '      float dx = p.x - xc;',
      '      if (abs(dx) > w) continue;',
      // o vão do túnel: nenhuma cortina passa por dentro da sua abertura
      '      if (length((vec2(xc, p.y) - vp) / vec2(1.3, 1.0)) < abre * (0.85 + 0.3 * h)) continue;',
      '      float nx = dx / w;',
      '      float nz = sqrt(max(1.0 - nx * nx, 0.0));',
      '      float lado = sign(vp.x - xc);',
      '      float rim = pow(max(nx * lado, 0.0), 3.0);',
      '      float t = (0.04 + 0.1 * nz + 0.55 * rim * (0.5 + 0.5 * brasa)) * (0.55 + 0.25 * fL) + 0.45 * Lz * nz;',
      '      float anel = fract(y / (w * 1.1 + 2.0) + h * 3.0);',
      '      float g = anel < 0.14 && t < 0.4 ? G_LH : glifoMascara(t, cel);',
      '      if (nx * lado > 0.72) { g = G_LV; t = max(t, 0.42 * (0.6 + 0.4 * brasa)); }',
      '      if (L == 2 && nx * lado < -0.3 && abs(fract(y / (w * 2.2) + h) - 0.5) < 0.1) g = G_o;   // ventosas',
      '      c = vec4(g, 0.08 + 0.9 * clamp(t / 0.55, 0.0, 1.0), 0.32 + 0.45 * t + 0.1 * fL, c.w * (1.0 - nz));',
      '    }',
      '  }',
      // o ralo no alto à esquerda: um olho de furacão em brasa
      '  vec2 vo = vec2(uRes.x * 0.22, uRes.y * 0.14);',
      '  vec2 dvo = p - vo;',
      '  float rv = length(dvo / vec2(1.3, 1.0)) / S;',
      '  if (rv < 0.26) {',
      '    float av = atan(dvo.y, dvo.x);',
      '    float sp2 = fract((av / (2.0 * PI)) * 4.0 + log(rv + 0.01) * 1.6 - uTempo * 0.06);',
      '    float f = smoothstep(0.26, 0.05, rv);',
      '    c.w = max(c.w, 0.6 * f);',
      '    if (rv < 0.05) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '    else if (sp2 < 0.5) c = vec4(hachura(av + PI * 0.5 + 1.0), (0.15 + 0.55 * f) * (1.0 - sp2), 0.62 + 0.3 * f, c.w);',
      '    if (rv > 0.05 && rv < 0.058) c = vec4(G_0, 0.85, 0.92, 0.8);',
      '  }',
      // olhos no escuro: pares vermelhos nas bordas, cada um pisca no seu tempo
      '  vec2 ge = p / (S * 0.07);',
      '  vec2 gi = floor(ge);',
      '  float he = hash21(gi + 11.0);',
      '  float borda = max(smoothstep(0.3, 0.05, p.x / uRes.x), smoothstep(0.7, 0.95, p.x / uRes.x));',
      '  borda = max(borda, smoothstep(0.7, 0.95, p.y / uRes.y));',
      '  if (he < 0.3 * borda) {',
      '    vec2 cen = (gi + 0.5 + (hash22(gi) - 0.5) * 0.4) * S * 0.07;',
      '    vec2 o = p - cen;',
      '    float ab = step(0.05, fract(uTempo * (0.07 + 0.05 * he) + he * 9.0));',
      '    float sep = uCel.x * (1.0 + floor(he * 6.0));',
      '    if (abs(o.y) < uCel.y * 0.5 && (abs(o.x - sep) < uCel.x * 0.5 || abs(o.x + sep) < uCel.x * 0.5))',
      '      c = vec4(ab > 0.5 ? G_BULLET : G_MENOS, 1.0, 0.76, 0.6);',
      '  }',
      '  return c;',
      '}',
      // ── III. O Ermo ────────────────────────────────────────────────────────────────
      'vec4 camadaErmo(vec2 p, vec2 cel, vec4 c) {',
      '  float S = min(uRes.x, uRes.y);',
      '  float hz = uRes.y * 0.56 - clamp(uRolCam.z * 0.03, 0.0, uRes.y * 0.08);',
      '  float Lz = lanterna(p);',
      '  c.y *= 0.45;',
      '  if (p.y < hz) {',
      // céu de fumaça em faixas horizontais, sépia de brasa
      '    float n = fbm(vec2(p.x / (S * 0.9) + uTempo * 0.006, p.y / (S * 0.16)));',
      '    float t = smoothstep(0.42, 0.85, n) * (0.25 + 0.35 * smoothstep(hz, 0.0, p.y));',
      '    if (t > 0.04) c = vec4(glifoMascara(t * 0.9 + 0.3 * Lz, cel), 0.08 + 0.4 * t, 0.62 + 0.25 * t, max(c.w, 0.25 * t));',
      '    c.w = max(c.w, 0.18 * smoothstep(hz - S * 0.3, hz, p.y));',
      '    c.z = max(c.z, 0.7);',
      // chuva de meteoros: riscos em brasa descendo da direita para a esquerda
      '    vec2 dir = normalize(vec2(-1.0, 0.42));',
      '    vec2 perp = vec2(-dir.y, dir.x);',
      '    for (int m = 0; m < 7; m++) {',
      '      float fm = float(m);',
      '      float hm = hash11(fm * 7.31 + 2.0);',
      '      float per = 6.0 + 7.0 * hm;',
      '      float ciclo = floor((uTempo + hm * per) / per);',
      '      float fase = fract((uTempo + hm * per) / per);',
      '      float hc = hash11(ciclo * 3.3 + fm);',
      '      vec2 o0 = vec2(uRes.x * (0.45 + 0.6 * hc), -uRes.y * 0.05 + uRes.y * 0.25 * hash11(ciclo + fm * 5.0));',
      '      vec2 cab = o0 + dir * fase * uRes.x * 0.7;',
      '      vec2 q = p - cab;',
      '      float along = -dot(q, dir);',
      '      float lat = dot(q, perp);',
      '      float cauda = S * (0.12 + 0.18 * hc);',
      '      if (along > -uCel.x && along < cauda && abs(lat) < uCel.y * (0.6 + 0.6 * (1.0 - along / cauda))) {',
      '        float k = 1.0 - along / cauda;',
      '        float g = along < uCel.x ? G_ARROBA : (k > 0.7 ? G_HASH : (k > 0.4 ? G_ASTERISCO : (k > 0.2 ? G_DOIS_PONTOS : G_PONTO_MEIO)));',
      '        float vida = smoothstep(0.0, 0.08, fase) * smoothstep(1.0, 0.8, fase);',
      '        c = vec4(g, (0.3 + 0.7 * k) * vida, 0.82 + 0.16 * k, max(c.w, 0.6 * k * vida));',
      '      }',
      '    }',
      '  } else {',
      // a planície: chão liso, riscado rente, sumindo no escuro
      '    float v = p.y - hz;',
      '    float linha = fract(log(v + 4.0) * 7.0 - uRolCam.z * 0.0004);',
      '    if (linha < 0.1) c = vec4(G_LH, 0.06 + 0.06 * smoothstep(0.0, uRes.y * 0.4, v), 0.45, c.w);',
      '    else c.y *= 0.5;',
      '  }',
      // as agulhas: cones finos fincados no chão, cada uma arrastando uma sombra comprida em L
      '  for (int k = 0; k < 4; k++) {',
      '    float fk = float(k);',
      '    float hk = hash11(fk * 9.7 + 1.0);',
      '    float x0 = uRes.x * (0.06 + 0.13 * fk + 0.05 * hk);',
      '    float esc = 1.0 + 0.9 * fk;                         // as da frente são maiores',
      '    float base = hz + S * 0.035 * esc;',
      '    float alt = S * (0.16 + 0.11 * fk + 0.05 * hk);',
      '    float lb = S * 0.018 * esc;',
      '    float yy = base - p.y;',
      '    if (yy > 0.0 && yy < alt) {',
      '      float lw = lb * pow(1.0 - yy / alt, 1.6);',
      '      float dx = p.x - x0;',
      '      if (abs(dx) < lw + uCel.x * 0.3) {',
      '        float t = dx < 0.0 ? 0.28 + 0.2 * (1.0 - yy / alt) : 0.05;',
      '        if (abs(abs(dx) - lw) < uCel.x * 0.6 && dx < 0.0) t = 0.55;',
      '        c = vec4(glifoMascara(t + 0.4 * Lz, cel), 0.15 + 0.6 * t, 0.62 + 0.3 * t, 0.0);',
      '      }',
      '    }',
      // sombra: corre para a esquerda rente ao chão e depois desce na direção de quem olha
      '    float sx = x0 - S * 0.5 * esc;',
      '    if (abs(p.y - base) < S * 0.008 * esc + uCel.y * 0.5 && p.x < x0 && p.x > sx) c.y *= 0.05;',
      '    if (abs(p.x - sx) < S * 0.008 * esc + uCel.x * 0.5 && p.y > base && p.y < base + S * 0.3 * esc) c.y *= 0.05;',
      '  }',
      '  return c;',
      '}',
      // ── IV. O Eclipse ──────────────────────────────────────────────────────────────
      'vec4 camadaEclipse(vec2 p, vec2 cel, vec4 c) {',
      '  float S = min(uRes.x, uRes.y);',
      '  float Lz = lanterna(p);',
      // céu de sangue em retícula de cartaz
      '  float ceu = smoothstep(uRes.y * 0.95, 0.0, p.y);',
      '  c.w = max(c.w, 0.35 * ceu);',
      '  c.z = max(c.z, 0.62);',
      '  float tc = 0.05 + 0.2 * ceu;',
      '  c = vec4(glifoMascara(tc * (0.7 + 0.6 * hash21(cel + floor(uTempo * 0.5))), cel), 0.06 + 0.22 * ceu, 0.6 + 0.12 * ceu, c.w);',
      // a multidão: rostos apinhados virados para o alto, acesos pelo sol negro lá em cima
      '  float topo = uRes.y * 0.70;',
      '  if (p.y > topo) {',
      '    float achou;',
      '    c.y *= 0.25;',
      '    c = campoRostos(p, cel, c, topo, uRes.y * 0.055, 0.16, 1.4, S * 0.075, vec3(0.0, -0.85, 0.5), 0.0, achou);',
      '  }',
      '  return c;',
      '}',
      // escolhe a camada da célula: a camada nova SOBE do fundo da tela, numa costura de brasas
      'vec4 fundoCamadas(vec2 p, vec2 cel) {',
      '  vec4 c = fundoAbismo(p, cel);',
      '  float cam = uCamada.x;',
      '  if (uCamada.z > 0.0) {',
      '    float lim = (1.0 - uCamada.z) * (uRes.y + 220.0) - 110.0;',
      '    float rr = (ruido(cel * 0.11 + 3.0) - 0.5) * 140.0 + (hash21(cel) - 0.5) * 30.0;',
      '    float dd = p.y + rr - lim;',
      '    if (dd > 0.0) cam = uCamada.y;',
      '    if (abs(dd) < 9.0) return vec4(binario(cel, 6.0), 0.75, 0.86, 0.5);',
      '  }',
      '  if (cam < 0.5) return c;',
      '  if (cam < 1.5) return camadaRostos(p, cel, c);',
      '  if (cam < 2.5) return camadaGarganta(p, cel, c);',
      '  if (cam < 3.5) return camadaErmo(p, cel, c);',
      '  return camadaEclipse(p, cel, c);',
      '}',
      // ═══ CRIATURAS DO PURGATÓRIO ═══
      // Cada criatura mora numa seção; o layout (JS) mede o DOM e passa âncora + escala. u = unidades
      // da criatura. Os olhos de verdade (nítidos, que seguem você) são desenhados no passo 3; aqui
      // fica o corpo de código e o poço escuro onde cada olho se encaixa.
      'float capsulaN(vec2 u, vec2 a, vec2 b, float ra, float rb, out float nx, out float ang) {',
      '  ang = atan(b.y - a.y, b.x - a.x);',
      '  vec2 pa = u - a, ba = b - a;',
      '  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);',
      '  vec2 q = pa - ba * h;',
      '  float r = mix(ra, rb, h);',
      '  float d = length(q);',
      '  nx = clamp(d / max(r, 1e-4), 0.0, 1.0) * sign(ba.x * pa.y - ba.y * pa.x);',
      '  return d - r;',
      '}',
      // osso/carne em cilindro: claro no lado de cima, escuro embaixo; o fio da borda acende
      // ang = direção do eixo (as bordas viram traço de gravura ao longo dele); ang < -8 = sem traço
      'vec4 cilindro(float nx, float ang, vec2 cel, float k, float tinta) {',
      '  float nz = sqrt(max(1.0 - nx * nx, 0.0));',
      '  if (ang > -8.0 && nx < -0.7) return vec4(hachura(ang), 0.75 * k, tinta + 0.35, 0.05);',
      '  if (ang > -8.0 && nx > 0.82) return vec4(hachura(ang), 0.3 * k, tinta + 0.1, 0.0);',
      '  float t = (0.04 + 0.3 * nz * (0.65 - 0.35 * nx)) * k;',
      '  return vec4(glifoMascara(t, cel), 0.12 + 0.75 * clamp(t / 0.55, 0.0, 1.0), tinta + 0.3 * t, 0.0);',
      '}',
      // 1 — O Vigia da Clareira: um olho imenso em dobras de carne sobre a pergunta, e dois braços
      // de osso que saem das bordas da tela e cravam as garras em volta do título.  B.z = meia largura
      // do cabeçalho (un), B.w = meia largura da tela (un)
      'vec4 criVigia(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  float Lz = lanterna(p);',
      '  vec2 e = u / vec2(0.62, 0.30);',
      '  float de = length(e);',
      '  if (de < 3.0) {',
      '    float ang = atan(e.y, e.x);',
      '    float rug = de + 0.07 * sin(ang * 7.0 + B.y * 6.0) + 0.05 * ruido(u * 5.0 + B.y);',
      '    float anel = fract(rug * 2.1 + uTempo * 0.03);',
      '    if (de > 1.05) {',
      '      float vivoD = smoothstep(3.0, 1.2, de);',
      '      float crista = smoothstep(0.0, 0.3, anel) * smoothstep(1.0, 0.5, anel);',
      '      float t = (0.1 + 0.5 * crista * (0.75 - 0.25 * sin(ang))) * vivoD + 0.35 * Lz * crista;',
      '      float g = anel < 0.16 ? hachura(ang + PI * 0.5) : glifoMascara(t, cel);',
      '      c = vec4(g, (0.12 + 0.75 * t) * vivoD, 0.4 + 0.45 * t, max(c.w, 0.08 * vivoD));',
      '    } else c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '  }',
      '  float hw = B.z, bd = B.w;',
      '  for (int s = 0; s < 2; s++) {',
      '    float lado = s == 0 ? -1.0 : 1.0;',
      '    vec2 v = vec2(u.x * lado, u.y);',
      '    vec2 Sh = vec2(bd + 0.5, 2.8);',
      '    vec2 El = vec2(max(bd - 0.45, hw + 0.55), 1.35 + 0.05 * sin(uTempo * 0.5 + lado));',
      '    vec2 Wr = vec2(hw + 0.25, 0.3);',
      '    float nx, ax; float d;',
      '    d = capsulaN(v, Sh, El, 0.13, 0.10, nx, ax);',
      '    if (d < 0.0) c = cilindro(nx, ax, cel, 1.0, 0.36);',
      '    d = capsulaN(v, El, Wr, 0.10, 0.075, nx, ax);',
      '    if (d < 0.0) c = cilindro(nx, ax, cel, 1.0, 0.36);',
      '    if (length(v - El) < 0.15) c = cilindro(clamp(length(v - El) / 0.15, 0.0, 1.0), -9.0, cel, 1.2, 0.4);',
      // mão: dorso + quatro dedos longos que se curvam para dentro e para baixo, com garra
      '    if (length(v - Wr) < 0.17) c = cilindro(length(v - Wr) / 0.17, -9.0, cel, 1.1, 0.4);',
      '    for (int f = 0; f < 4; f++) {',
      '      float ff = float(f);',
      '      vec2 d1 = normalize(vec2(-1.0, -0.75 + 0.32 * ff));',
      '      vec2 b0 = Wr + d1 * 0.1;',
      '      float l1 = 0.42 - 0.04 * abs(ff - 1.5);',
      '      vec2 b1 = b0 + d1 * l1;',
      '      vec2 d2 = normalize(d1 + vec2(0.15, 0.9 + 0.08 * sin(uTempo * 0.7 + ff + lado)));',
      '      vec2 b2 = b1 + d2 * (0.34 - 0.03 * ff);',
      '      d = capsulaN(v, b0, b1, 0.042, 0.035, nx, ax);',
      '      if (d < 0.0) c = cilindro(nx, ax, cel, 1.0, 0.38);',
      '      d = capsulaN(v, b1, b2, 0.035, 0.006, nx, ax);',
      '      if (d < 0.0) { c = cilindro(nx, ax, cel, 1.3, 0.5); if (length(v - b2) < 0.09) c = vec4(G_ADAGA, 0.85, 0.95, 0.1); }',
      '    }',
      '  }',
      '  return c;',
      '}',
      // 2 — A Lágrima: um bulbo de carne pendurado num caule, com um olho de fenda e tentáculos
      // que balançam embaixo
      'vec4 criLagrima(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  float Lz = lanterna(p);',
      '  if (u.y < -0.45 && u.y > -7.0) {',
      '    float xc = 0.06 * sin(u.y * 1.6 + uTempo * 0.45 + B.y) * min(-u.y, 3.0);',
      '    if (abs(u.x - xc) < 0.06) c = vec4(binario(cel, 2.0), 0.3 * smoothstep(-7.0, -1.0, u.y), 0.5, c.w);',
      '  }',
      '  vec2 m = (u - vec2(0.0, 0.05)) / vec2(0.82, 0.68);',
      '  float dm = length(m);',
      '  if (dm < 1.0) {',
      '    vec3 n = normalize(vec3(m, sqrt(max(1.0 - dm * dm, 0.0)) + 0.1));',
      '    float t = 0.14 + 0.6 * max(dot(n, normalize(vec3(-0.5, -0.6, 0.6))), 0.0) + 0.4 * Lz * n.z;',
      '    float veia = smoothstep(0.52, 0.5, abs(ruido(u * 4.0 + B.y * 3.0) - 0.5) + 0.48);',
      '    c = carne(t, cel, 1.0);',
      '    if (veia > 0.5 && t > 0.12) c = vec4(G_TIL, 0.75, 0.72, 0.0);',
      '    if (dm > 0.88) c = vec4(hachura(atan(m.y * 0.68, m.x * 0.82) + PI * 0.5), 0.8, 0.8, 0.08);',
      '    vec2 o = u / vec2(0.52, 0.27);',
      '    if (length(o) < 1.0) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '    else if (length(o) < 1.25) c = vec4(hachura(atan(o.y, o.x) + PI * 0.5), 0.35, 0.5, 0.0);',
      '  }',
      '  for (int i = 0; i < 6; i++) {',
      '    float fi = float(i);',
      '    float x0 = -0.5 + 0.2 * fi;',
      '    float y0 = 0.55 - 0.15 * abs(fi - 2.5) / 2.5;',
      '    float len = 1.4 + 1.5 * hash11(fi * 3.7 + B.y);',
      '    float yy = u.y - y0;',
      '    if (yy > 0.0 && yy < len) {',
      '      float xc = x0 + 0.16 * sin(yy * 2.3 - uTempo * 1.0 + fi * 1.3) * yy / len * 1.6;',
      '      float w = 0.07 * (1.0 - yy / len) + 0.012;',
      '      if (abs(u.x - xc) < w + 0.02) {',
      '        float t = 0.4 + 0.35 * (1.0 - yy / len) + 0.3 * Lz;',
      '        c = vec4(abs(u.x - xc) < w * 0.5 ? G_LV : G_PONTO_MEIO, 0.2 + 0.6 * t, 0.42 + 0.4 * t, 0.0);',
      '      }',
      '    }',
      '  }',
      '  return c;',
      '}',
      // 3 — A Boca: uma mandíbula que sai da borda esquerda da tela e respira, abrindo e fechando
      'vec4 criBoca(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  if (u.x < -0.2 || u.x > 2.4 || abs(u.y) > 1.3) return c;',
      '  float Lz = lanterna(p);',
      '  float L = 1.75;',
      '  float h = 0.3 + 0.13 * sin(uTempo * 0.55 + B.y) + 0.05 * sin(uTempo * 1.7);',
      '  float xx = clamp(u.x / L, 0.0, 1.0);',
      '  float arco = sqrt(max(1.0 - xx * xx, 0.0));',
      '  float yU = -h * arco, yL = h * 0.85 * arco;',
      '  float pele = sdElipse(u - vec2(0.0, 0.0), vec2(L + 0.45, h + 0.62));',
      '  if (pele < 0.0) {',
      '    float rug = ruido(vec2(u.x * 3.0, u.y * 9.0) + B.y);',
      '    float t = 0.16 + 0.4 * smoothstep(-0.05, -0.45, pele) * rug + 0.3 * Lz;',
      '    if (pele > -0.07) { c = vec4(hachura(atan(u.y, u.x * 0.3) + PI * 0.5), 0.7, 0.76, 0.06); return c; }',
      '    c = vec4(rug > 0.6 ? G_LH : glifoMascara(t, cel), 0.15 + 0.6 * t, 0.36 + 0.4 * t, 0.0);',
      // lábios
      '    if (abs(u.y - yU) < 0.07 || abs(u.y - yL) < 0.07) c = vec4(G_LH, 0.9, 0.8, 0.12);',
      '    if (u.y > yU && u.y < yL && u.x < L) {',
      // goela: escuro, com o binário da língua lá no fundo
      '      c = vec4(binario(cel, 3.0), 0.07 + 0.08 * smoothstep(0.0, L, u.x), 0.5, 0.0);',
      '      float tw = 0.17;',
      '      float i = floor(u.x / tw);',
      '      float fx = fract(u.x / tw) - 0.5;',
      '      float ch = (1.0 - (i * tw / L) * (i * tw / L) * 0.7);',
      '      float lt = (0.2 + 0.12 * hash11(i + B.y * 9.0)) * ch;',
      '      float lb = (0.16 + 0.1 * hash11(i * 3.0 + 2.0)) * ch;',
      '      if (u.y - yU < lt * (1.0 - 2.0 * abs(fx)) && u.x < L * 0.93) c = vec4(abs(fx) < 0.12 ? G_LV : (fx < 0.0 ? G_LD2 : G_LD1), 0.85, 0.96, 0.05);',
      '      if (yL - u.y < lb * (1.0 - 2.0 * abs(fx)) && u.x < L * 0.9) c = vec4(abs(fx) < 0.12 ? G_LV : (fx < 0.0 ? G_LD1 : G_LD2), 0.8, 0.94, 0.05);',
      '    }',
      '  }',
      // baba de sangue escorrendo do lábio de baixo
      '  for (int k = 0; k < 2; k++) {',
      '    float x0 = 0.5 + 0.55 * float(k);',
      '    float yb = h * 0.85 * sqrt(max(1.0 - (x0 / L) * (x0 / L), 0.0));',
      '    float len = 0.25 + 0.35 * (0.5 + 0.5 * sin(uTempo * 0.4 + float(k) * 2.0));',
      '    if (abs(u.x - x0) < 0.035 && u.y > yb && u.y < yb + len) c = vec4(u.y > yb + len - 0.08 ? G_BULLET : G_LV, 0.9, 0.74, 0.2);',
      '  }',
      '  return c;',
      '}',
      // 4 — A Espinha: uma centopeia de vértebras deitada ao lado do método; cada segmento tem um
      // olho (um por passo do engajamento) e as patas não param de andar
      'float espinhaY(float x) { return 0.32 * sin(x * 1.5 + 0.6); }',
      'vec4 criEspinha(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  if (abs(u.x) > 2.3 || abs(u.y) > 1.3) return c;',
      '  float Lz = lanterna(p);',
      '  float k0 = floor((u.x + 1.5) / 0.6 + 0.5);',
      '  for (int dk = -1; dk <= 1; dk++) {',
      '    float k = clamp(k0 + float(dk), 0.0, 5.0);',
      '    vec2 sc = vec2(-1.5 + 0.6 * k, espinhaY(-1.5 + 0.6 * k));',
      '    vec2 q = u - sc;',
      // patas: dois pares por segmento, juntas dobradas, passo alternado
      '    for (int s = 0; s < 2; s++) {',
      '      float lado = s == 0 ? -1.0 : 1.0;',
      '      float fase = sin(uTempo * 2.4 + k * 1.3 + lado);',
      '      vec2 j0 = vec2(0.0, lado * 0.16);',
      '      vec2 j1 = j0 + vec2(0.18 * fase, lado * 0.32);',
      '      vec2 j2 = j1 + vec2(-0.12 + 0.08 * fase, lado * 0.28);',
      '      float nx, ax;',
      '      if (capsulaN(q, j0, j1, 0.022, 0.018, nx, ax) < 0.0 || capsulaN(q, j1, j2, 0.018, 0.004, nx, ax) < 0.0)',
      '        c = vec4(hachura(atan(j1.y - j0.y, j1.x - j0.x)), 0.42 + 0.3 * Lz, 0.5, 0.0);',
      '    }',
      '  }',
      '  for (int dk = -1; dk <= 1; dk++) {',
      '    float k = clamp(k0 + float(dk), 0.0, 5.0);',
      '    vec2 sc = vec2(-1.5 + 0.6 * k, espinhaY(-1.5 + 0.6 * k));',
      '    vec2 q = (u - sc) / vec2(k < 0.5 ? 0.26 : 0.31, k < 0.5 ? 0.22 : 0.24);',
      '    float dq = length(q);',
      '    if (dq < 1.0) {',
      '      vec3 n = normalize(vec3(q, sqrt(max(1.0 - dq * dq, 0.0))));',
      '      float t = 0.08 + 0.55 * max(dot(n, normalize(vec3(-0.4, -0.7, 0.6))), 0.0) + 0.35 * Lz * n.z;',
      '      c = carne(t, cel, 1.0);',
      '      if (dq > 0.82) c = vec4(hachura(atan(q.y, q.x) + PI * 0.5), 0.75, 0.78, 0.06);   // o aro da vértebra',
      '      if (k > 0.5 && length(q / vec2(0.62, 0.42)) < 1.0) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);   // órbita',
      '      if (k < 0.5) {',
      // cabeça: duas pinças em gancho
      '        for (int s = 0; s < 2; s++) {',
      '          float lado = s == 0 ? -1.0 : 1.0;',
      '          float nx, ax;',
      '          vec2 a0 = sc + vec2(-0.18, lado * 0.1), a1 = sc + vec2(-0.42, lado * 0.16), a2 = sc + vec2(-0.5, lado * 0.02);',
      '          if (capsulaN(u, a0, a1, 0.04, 0.03, nx, ax) < 0.0 || capsulaN(u, a1, a2, 0.03, 0.004, nx, ax) < 0.0) c = vec4(G_ADAGA, 0.8, 0.9, 0.05);',
      '        }',
      '      }',
      '      break;',
      '    }',
      '  }',
      // as pinças ficam fora do disco da cabeça: testa de novo
      '  vec2 sc0 = vec2(-1.5, espinhaY(-1.5));',
      '  for (int s = 0; s < 2; s++) {',
      '    float lado = s == 0 ? -1.0 : 1.0;',
      '    float nx, ax;',
      '    float ab = 0.05 * sin(uTempo * 1.3);',
      '    vec2 a0 = sc0 + vec2(-0.2, lado * 0.1), a1 = sc0 + vec2(-0.46, lado * (0.2 + ab)), a2 = sc0 + vec2(-0.56, lado * 0.03);',
      '    if (capsulaN(u, a0, a1, 0.045, 0.03, nx, ax) < 0.0 || capsulaN(u, a1, a2, 0.03, 0.004, nx, ax) < 0.0) c = vec4(G_ADAGA, 0.8, 0.9, 0.05);',
      '  }',
      '  return c;',
      '}',
      // 5 — A Mariposa: asas de pó de código com ocelos que são olhos de verdade
      'vec4 criMariposa(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  if (abs(u.x) > 2.0 || u.y < -1.5 || u.y > 1.6) return c;',
      '  float Lz = lanterna(p);',
      '  float bate = 0.94 + 0.06 * sin(uTempo * 1.7 + B.y);',
      '  vec2 v = vec2(abs(u.x) / bate, u.y);',
      // asa de cima e asa de baixo
      '  vec2 w1 = rot(0.45) * (v - vec2(0.92, -0.3));',
      '  vec2 w2 = rot(-0.5) * (v - vec2(0.62, 0.5));',
      '  float d1 = length(w1 / vec2(0.85, 0.52));',
      '  float d2 = length(w2 / vec2(0.55, 0.38));',
      '  float d = min(d1, d2);',
      '  if (d < 1.0) {',
      '    vec2 raiz = v - vec2(0.12, 0.0);',
      '    float ar = atan(raiz.y, raiz.x);',
      '    float nerv = abs(fract(ar * 3.2 / PI + 0.5) - 0.5);',
      '    float po = fbm(v * 4.0 + B.y);',
      '    float t = 0.16 + 0.45 * po * (1.0 - d * 0.5) + 0.3 * Lz;',
      '    c = vec4(nerv < 0.06 ? hachura(ar) : glifoMascara(t, cel), 0.15 + 0.6 * t, 0.36 + 0.45 * t, 0.04);',
      '    if (d > 0.86) {                                                  // a borda da asa, acesa',
      '      vec2 w = d1 < d2 ? w1 / vec2(0.85, 0.52) : w2 / vec2(0.55, 0.38);',
      '      c = vec4(hachura(atan(w.y, w.x) + PI * 0.5 + (d1 < d2 ? -0.45 : 0.5)), 0.8, 0.8, 0.08);',
      '    }',
      // ocelos: anéis concêntricos em volta do olho
      '    float ro = length((v - vec2(0.98, -0.32)) / vec2(1.0, 0.8));',
      '    if (ro < 0.48) {',
      '      if (ro < 0.27) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '      else if (ro < 0.33) c = vec4(G_0, 0.85, 0.9, 0.3);',
      '      else if (ro < 0.4) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '      else c = vec4(G_DOIS_PONTOS, 0.6, 0.75, 0.1);',
      '    }',
      '    float r2 = length(v - vec2(0.66, 0.55));',
      '    if (r2 < 0.14) c = vec4(r2 < 0.07 ? G_BULLET : G_o, 0.7, 0.8, 0.1);',
      '  }',
      // corpo: tórax peludo, abdômen em anéis, cabeça e antenas plumosas
      '  vec2 tq = u / vec2(0.15, 0.4);',
      '  vec2 aq = (u - vec2(0.0, 0.68)) / vec2(0.11, 0.5);',
      '  if (length(tq) < 1.0) c = vec4(hash21(cel + floor(uTempo)) < 0.5 ? G_LV : G_BARRA_QUEBRADA, 0.35 + 0.3 * Lz, 0.5, 0.0);',
      '  if (length(aq) < 1.0) c = vec4(fract(aq.y * 3.0) < 0.25 ? G_LH : G_MEIOTOM3, 0.4, 0.55, 0.0);',
      '  if (length(u - vec2(0.0, -0.5)) < 0.13) c = vec4(G_MEIOTOM4, 0.45, 0.5, 0.0);',
      '  for (int s = 0; s < 2; s++) {',
      '    float lado = s == 0 ? -1.0 : 1.0;',
      '    float nx, ax;',
      '    vec2 a0 = vec2(0.04 * lado, -0.58), a1 = vec2(0.3 * lado, -1.0), a2 = vec2(0.62 * lado, -1.18);',
      '    if (capsulaN(u, a0, a1, 0.012, 0.012, nx, ax) < 0.0 || capsulaN(u, a1, a2, 0.012, 0.03, nx, ax) < 0.0) c = vec4(lado > 0.0 ? G_LD1 : G_LD2, 0.55, 0.65, 0.0);',
      '  }',
      '  return c;',
      '}',
      // 6 — O Ninho: uma massa de carne que brota da borda direita da tela, coberta de olhos
      'const vec3 NINHO_0 = vec3(-0.55, -0.45, 0.20), NINHO_1 = vec3(-0.9, 0.05, 0.17), NINHO_2 = vec3(-0.4, 0.22, 0.24),',
      '  NINHO_3 = vec3(-0.75, 0.62, 0.13), NINHO_4 = vec3(-0.2, -0.75, 0.12), NINHO_5 = vec3(-1.1, -0.42, 0.10), NINHO_6 = vec3(-0.22, 0.78, 0.14);',
      'vec3 ninhoOlho(int i) {',
      '  return i == 0 ? NINHO_0 : (i == 1 ? NINHO_1 : (i == 2 ? NINHO_2 : (i == 3 ? NINHO_3 : (i == 4 ? NINHO_4 : (i == 5 ? NINHO_5 : NINHO_6)))));',
      '}',
      'vec4 criNinho(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  if (u.x < -3.6 || u.y < -1.8 || u.y > 1.8) return c;',
      '  float Lz = lanterna(p);',
      // tentáculos que tateiam para dentro da página
      '  for (int i = 0; i < 4; i++) {',
      '    float fi = float(i);',
      '    float y0 = -0.9 + 0.6 * fi;',
      '    float x = -u.x - 0.9;',
      '    float len = 1.3 + 0.9 * hash11(fi + B.y * 3.0);',
      '    if (x > 0.0 && x < len) {',
      '      float yc = y0 + 0.22 * sin(x * 3.0 - uTempo * 0.9 + fi * 1.7) * x / len;',
      '      float w = 0.1 * (1.0 - x / len) + 0.012;',
      '      if (abs(u.y - yc) < w) {',
      '        float nx = (u.y - yc) / w;',
      '        c = cilindro(nx, 0.0, cel, 0.9, 0.36);',
      '        if (nx > 0.2 && abs(fract(x * 4.0) - 0.5) < 0.14) c = vec4(G_o, 0.6, 0.7, 0.0);',
      '      }',
      '    }',
      '  }',
      '  float rr = length((u - vec2(-0.45, 0.0)) / vec2(1.0, 1.15));',
      '  float borda = 1.0 + 0.28 * (fbm(u * 1.7 + vec2(B.y, uTempo * 0.04)) - 0.5);',
      '  if (rr < borda) {',
      '    vec3 n = normalize(vec3(u.x + 0.45, u.y, 0.7));',
      '    float bolha = ruido(u * 6.0 + B.y);',
      '    float t = 0.07 + 0.38 * max(dot(n, normalize(vec3(-0.6, -0.5, 0.6))), 0.0) + 0.2 * bolha + 0.35 * Lz;',
      '    c = carne(t, cel, 1.0);',
      '    if (bolha > 0.72) c = vec4(G_o, 0.5, 0.6, 0.0);',
      '    for (int i = 0; i < 7; i++) {',
      '      vec3 o = ninhoOlho(i);',
      '      vec2 q = (u - o.xy) / vec2(o.z, o.z * 0.5);',
      '      float dq = length(q);',
      '      if (dq < 1.15) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '      else if (dq < 1.5) c = vec4(hachura(atan(q.y, q.x) + PI * 0.5), 0.5, 0.6, 0.05);',
      '    }',
      '  }',
      '  return c;',
      '}',
      // 7 — O Andarilho do Ermo: rosto pálido entre cabelos negros, capa até o chão e uma cruz de
      // luz fraca no peito
      'vec4 criAndarilho(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  if (abs(u.x) > 2.2 || u.y < -1.0) return c;',
      '  float Lz = lanterna(p);',
      // capa: ombros largos que descem até sumir
      '  if (u.y > 0.5) {',
      '    float w = 0.42 + 0.78 * smoothstep(0.45, 1.3, u.y) + 0.05 * (u.y - 1.3);',
      '    float dx = abs(u.x) - w;',
      '    if (dx < 0.0) {',
      '      float t = 0.04 + 0.05 * ruido(u * 3.0 + B.y);',
      '      c = vec4(glifoMascara(t + 0.25 * Lz, cel), 0.08 + 0.3 * Lz, 0.4, 0.0);',
      '      if (dx > -0.08) c = vec4(G_LV, 0.35 * smoothstep(9.0, 1.0, u.y), 0.66, 0.05);',
      '      float pulso = 0.5 + 0.5 * sin(uTempo * 0.9 + B.y);',
      '      bool cruz = (abs(u.x) < 0.07 && u.y > 1.15 && u.y < 6.0) || (abs(u.y - 2.15) < 0.07 && abs(u.x) < 0.8);',
      '      if (cruz) c = vec4(abs(u.x) < 0.07 ? G_LV : G_LH, 0.4 + 0.25 * pulso, 0.74, 0.25 + 0.2 * pulso);',
      '    }',
      '  }',
      // cabeça: cabelo em cortina e franja irregular sobre a testa
      '  vec2 h = (u - vec2(0.0, -0.08)) / vec2(0.5, 0.62);',
      '  vec2 f = u / vec2(0.34, 0.45);',
      '  float dh = length(h), df = length(f);',
      '  float folga = uTexInfo.z > 0.5 ? 0.7 * uCel.x / max(B.z, 1.0) : 0.0;   // B.z = escala: meia célula de folga',
      '  if (dh < 1.0 + folga || df < 1.0) {',
      '    float franja = -0.1 + 0.07 * sin(u.x * 38.0 + B.y) + 0.03 * sin(uTempo * 0.6 + u.x * 7.0);',
      '    if (uTexInfo.z > 0.5) {',
      '      c = vec4(255.0, 0.3, 0.9, 0.0);                     // cabeça inteira em gravura (passo de alta definição)',
      '    } else if (df < 1.0 && u.y > franja) {',
      // rosto pálido iluminado pela esquerda; o lado direito afunda na sombra
      '      float t = clamp(0.62 - 0.55 * (u.x / 0.34) - 0.25 * (u.y / 0.45), 0.05, 0.85) + 0.3 * Lz;',
      '      c = vec4(glifoMascara(t, cel), 0.2 + 0.75 * clamp(t / 0.6, 0.0, 1.0), 0.88 + 0.1 * t, 0.06);',
      '      vec2 ol = vec2(abs(u.x) - 0.13, u.y - 0.02);',
      '      if (length(ol / vec2(0.1, 0.06)) < 1.0) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '      if (abs(u.x + 0.02) < 0.03 && u.y > 0.05 && u.y < 0.2) c = vec4(G_LV, 0.25, 0.5, 0.0);',
      '      if (abs(u.y - 0.29) < 0.03 && abs(u.x) < 0.09) c = vec4(G_LH, 0.7, 0.74, 0.1);',
      '    } else {',
      '      float fio = fract(u.x * 18.0 + 0.2 * sin(u.y * 6.0 + uTempo * 0.5));',
      '      c = vec4(fio < 0.4 ? G_LV : G_ESPACO, 0.12 + 0.1 * (1.0 - dh), 0.4, 0.0);',
      '    }',
      '  }',
      '  if (abs(u.x) < 0.12 && u.y > 0.4 && u.y < 0.6) c = vec4(G_MEIOTOM1, 0.12, 0.4, 0.0);   // pescoço',
      '  return c;',
      '}',
      // 8 — O fundo: o sol negro de coroa branca e a mão que se ergue de uma torre para tocá-lo; o olho
      // mora na palma — é o último olhar do abismo, voltado para o botão de contato
      'vec4 criEclipse(vec2 u, vec2 p, vec2 cel, vec4 c, vec4 B) {',
      '  float r = length(u);',
      '  float ang = atan(u.y, u.x);',
      '  float cu = uCel.x / max(B.z, 1.0);',
      '  if (r < 3.4) {',
      '    c.w = max(c.w, 0.95 * exp(-(r - 1.0) * 1.3) * step(1.0, r));',
      '    c.z = max(c.z, mix(1.0, 0.62, clamp((r - 1.0) / 2.0, 0.0, 1.0)));',
      '    float nR = 64.0;',
      '    float k = floor(ang / (2.0 * PI) * nR + 0.5);',
      '    float aR = k / nR * 2.0 * PI;',
      '    float comp = 1.25 + 1.6 * hash11(k + 9.0);',
      '    if (abs(sin(ang - aR)) * r < cu * 0.6 && r > 1.12 && r < comp)',
      '      c = vec4(G_PONTO_MEIO, 0.3 + 0.5 * smoothstep(comp, 1.1, r), 0.9, c.w);',
      '    if (r < 1.0) c = vec4(G_ESPACO, 0.0, 0.1, 0.0);',
      '    else if (r < 1.07) c = vec4(G_0, 1.0, 1.0, 1.0);',
      '    else if (r < 1.16) c = vec4(G_o, 0.9, 0.96, 1.0);',
      '  }',
      // torre: sobe da multidão e afina até o punho
      '  float topoMultidao = uRes.y * 0.74 + (ruido(cel * 0.2) - 0.5) * 30.0;',
      '  if (u.y > 2.35 && p.y < topoMultidao) {',
      '    float w = 0.2 + 0.07 * (u.y - 2.35) + 0.25 * smoothstep(5.0, 9.0, u.y);',
      '    float dx = abs(u.x) - w;',
      '    if (dx < 0.0) {',
      '      c = vec4(glifoMascara(0.04, cel), 0.05, 0.4, 0.0);',
      '      if (dx > -0.07) c = vec4(G_LV, 0.55 * exp(-(u.y - 2.35) * 0.22), 0.8, 0.1);',
      '    }',
      '  }',
      // mão aberta: palma, quatro dedos esticados para o disco e o polegar
      '  vec2 pm = (u - vec2(0.0, 1.95)) / vec2(0.42, 0.5);',
      '  float dm = length(pm);',
      '  float dedo = 9.0;',
      '  for (int f = 0; f < 4; f++) {',
      '    float ff = float(f);',
      '    float x0 = -0.27 + 0.18 * ff;',
      '    float topo = ff == 1.0 ? 1.02 : (ff == 2.0 ? 1.12 : (ff == 0.0 ? 1.3 : 1.42));',
      '    dedo = min(dedo, sdCapsula(u, vec2(x0, 1.6), vec2(x0 * 1.25, topo), 0.065));',
      '  }',
      '  dedo = min(dedo, sdCapsula(u, vec2(0.36, 2.0), vec2(0.62, 1.58), 0.07));',
      '  dedo = min(dedo, sdCapsula(u, vec2(0.0, 2.2), vec2(0.0, 2.5), 0.2));',
      '  if (dm < 1.0 || dedo < 0.0) {',
      '    float borda = dm < 1.0 ? smoothstep(0.82, 1.0, dm) : smoothstep(-0.03, 0.0, dedo);',
      '    c = vec4(borda > 0.5 ? G_LV : glifoMascara(0.06, cel), 0.08 + 0.6 * borda, 0.5 + 0.4 * borda, 0.1 * borda);',
      '    vec2 o = (u - vec2(0.0, 1.95)) / vec2(0.34, 0.17);',
      '    if (length(o) < 1.0) c = vec4(G_ESPACO, 0.0, 0.2, 0.0);',
      '  }',
      '  return c;',
      '}',
      'vec4 criaturas(vec2 p, vec2 cel, vec4 c) {',
      '  for (int i = 0; i < 6; i++) {',
      '    if (i >= uNCri) break;',
      '    vec4 A = uCriA[i], B = uCriB[i];',
      '    if (B.x < 0.01) continue;',
      '    vec2 u = (p - A.xy) / max(A.z, 1.0);',
      '    vec4 antes = c;',
      '    vec4 d;',
      '    float tp = A.w;',
      '    if (tp < 1.5) d = criVigia(u, p, cel, c, B);',
      '    else if (tp < 2.5) d = criLagrima(u, p, cel, c, B);',
      '    else if (tp < 3.5) d = criBoca(u, p, cel, c, B);',
      '    else if (tp < 4.5) d = criEspinha(u, p, cel, c, B);',
      '    else if (tp < 5.5) d = criMariposa(u, p, cel, c, B);',
      '    else if (tp < 6.5) d = criNinho(u, p, cel, c, B);',
      '    else if (tp < 7.5) d = criAndarilho(u, p, cel, c, B);',
      '    else d = criEclipse(u, p, cel, c, B);',
      // surgir: a criatura se materializa célula a célula, com uma franja de brasa
      '    float lim = B.x * 1.25 - 0.1;',
      '    float hh = hash21(cel * 1.71 + B.y * 13.0);',
      // as criaturas são a figura, o cenário é o fundo: corpo um degrau mais aceso que a camada
      '    if (d != antes) d.y = min(1.0, d.y * 1.45 + 0.04);',
      '    if (hh < lim) c = d;',
      '    else if (hh < lim + 0.08 && d != antes) c = vec4(binario(cel, 8.0), 0.7, 0.86, 0.3);',
      '  }',
      '  return c;',
      '}',
      // O sangue dos olhos corre em BARRAMENTO: trilhas de um fio só, verticais, que dobram a 45° como
      // as de uma placa de circuito; pacotes claros descem por elas e uma gota pende da ponta
      'vec4 sangue(vec2 p, vec2 cel, vec4 c) {',
      '  for (int i = 0; i < 16; i++) {',
      '    if (i >= uNSang) break;',
      '    vec4 s = uSangA[i], sb = uSangB[i];',
      '    if (sb.x < 0.02) continue;',
      '    float y0 = s.y + s.z * 0.2;',
      '    float maxL = sb.z;',
      '    if (p.y < y0 - uCel.y || p.y > y0 + maxL + 60.0 || abs(p.x - s.x) > s.z * 1.1 + uCel.x * 6.0) continue;',
      '    float cresce = min(maxL, max(0.0, uTempo - s.w) * 26.0);',
      '    for (int k = 0; k < 4; k++) {',
      '      float fk = float(k);',
      '      float h = hash11(sb.y * 13.1 + fk * 7.7);',
      '      float x0 = s.x + (fk / 3.0 - 0.5) * s.z * 1.05 + (h - 0.5) * s.z * 0.2;',
      '      x0 = (floor(x0 / uCel.x) + 0.5) * uCel.x;',
      '      float L = cresce * (0.4 + 0.6 * hash11(h * 31.0 + 1.0));',
      '      float d1 = L * (0.2 + 0.35 * h);',
      '      float nd = floor(1.0 + 3.0 * hash11(h * 5.3));',
      '      float sx = (h < 0.5 ? -1.0 : 1.0);',
      '      float x1 = x0 + sx * nd * uCel.x;',
      '      float yD = y0 + d1, yD2 = yD + nd * uCel.y;',
      '      float along = p.y - y0;',
      '      bool vert1 = abs(p.x - x0) < uCel.x * 0.5 && p.y >= y0 && p.y < min(yD, y0 + L);',
      '      float td = (p.y - yD) / max(nd * uCel.y, 1.0);',
      '      bool diag = L > d1 && td >= 0.0 && td < 1.0 && abs(p.x - (x0 + sx * nd * uCel.x * (floor(td * nd) + 0.5) / nd)) < uCel.x * 0.5;',
      '      bool vert2 = L > d1 + nd * uCel.y && abs(p.x - x1) < uCel.x * 0.5 && p.y >= yD2 && p.y < y0 + L;',
      '      float pac = step(fract(along / (uCel.y * 7.0) - uTempo * 0.8 - h * 3.0), 0.15);',
      '      float vivo = sb.x;',
      '      if (vert1 || vert2) c = vec4(pac > 0.5 ? binario(cel, 5.0) : G_LV, (0.62 + 0.38 * pac) * vivo, 0.74 + 0.18 * pac, max(c.w, 0.2 * vivo));',
      '      if (diag) c = vec4(sx > 0.0 ? G_LD2 : G_LD1, 0.7 * vivo, 0.76, max(c.w, 0.2 * vivo));',
      // a gota: incha na ponta, cai e se perde
      '      float xp = L > d1 + nd * uCel.y ? x1 : x0;',
      '      float yp = y0 + L;',
      '      if (L > uCel.y && abs(p.x - xp) < uCel.x * 0.5) {',
      '        if (abs(p.y - yp) < uCel.y * 0.5) c = vec4(G_BULLET, 0.95 * vivo, 0.78, 0.35 * vivo);',
      '        float queda = mod(uTempo * 0.5 + h * 7.0, 1.0);',
      '        float yq = yp + queda * 140.0;',
      '        if (abs(p.y - yq) < uCel.y * 0.5 && queda > 0.15) c = vec4(G_PONTO_MEIO, 0.8 * (1.0 - queda) * vivo, 0.76, 0.0);',
      '      }',
      '    }',
      '  }',
      '  return c;',
      '}',
      'vec4 cena(vec2 p, vec2 cel) {',
      '  vec4 c = fundoCamadas(p, cel);',
      // Argos só é calculado enquanto o hero está por perto (custo zero no resto da descida)
      '  if (uEscala > 0.0 && (p.y - uAncora.y) / uEscala < 4.4) c = cenaArgos(p, cel, c);',
      '  c = criaturas(p, cel, c);',
      '  c = sangue(p, cel, c);',
      '  return c;',
      '}'
      // ══ CAMADAS: fim ══
    ].join('\n'),

    /* Composição: a máscara mora na coluna da direita (desktop) ou no topo (celular), com os
       olhos SEMPRE acima do cartão/texto — por isso o layout mede o DOM do hero em vez de
       supor proporções (o tema pode mudar a altura do título e o cartão sobe junto).
       Olhos: 0–1 principais · 2 terceiro olho (vertical) · 3–8 palmas (= mãos dos braços;
       rx 0 desliga o braço) · 9+ olhos do mar de máscaras (tipo 3, abrem sob a lanterna). */
    layout: function (ctx) {
      var W = ctx.W, H = ctx.H, hr = ctx.heroi;
      function caixa(sel) {
        var el = document.querySelector(sel);
        if (!el) return null;
        var r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return null;
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
      }
      var copia = caixa('#top .hero-copy'), cartao = caixa('#top .hero-card');
      // a legenda de prancha ("Fig. I — Argos…") fica entre a máscara e o card: a boca
      // encosta nela, não no card — senão o queixo passa por baixo do texto da legenda
      var prancha = caixa('#top .hero-prancha');
      var esc, ax, ay, maos;
      if (!ctx.estreito) {
        var dirTexto = copia ? copia.x + copia.w : hr.x + hr.w * 0.55;
        ax = cartao ? cartao.x + cartao.w / 2 : (dirTexto + hr.x + hr.w) / 2;
        var teto = hr.y + 6;                                       // o hero começa colado no cabeçalho
        var topoCartao = prancha ? prancha.y : (cartao ? cartao.y : hr.y + H * 0.48);
        // A boca (u.y = 0,70) encosta no topo do cartão: o rosto inteiro fica à mostra (3º olho,
        // sobrancelhas, olhos, nariz, bigode, boca) e a testa é cortada pelo cabeçalho — maior que
        // a tela. Limites: 3º olho (topo em u.y = -0,79) abaixo do teto; olho esquerdo (canto em
        // u.x = -0,60) longe da coluna de texto.
        esc = limitar(Math.min((ax - dirTexto - 50) / 0.60, (topoCartao - 14 - teto) / 1.49, H * 0.36), 120, 380);
        ay = topoCartao - 14 - 0.70 * esc;
        var L = -ax / esc, R = (W - ax) / esc, T = (hr.y - ay) / esc, B = (H - ay) / esc;
        var mx = copia ? copia.x : hr.x + 40;                      // margem esquerda livre: 0..mx
        var topoTexto = copia ? copia.y : hr.y + 96;
        var folgaDir = R > 2.0;                                    // à direita só cabe mão em tela larga
        maos = [
          // sup-esq: a mão atravessa a faixa livre ACIMA do texto (entre o cabeçalho e o selo)
          { x: ((copia ? copia.x + copia.w * 0.62 : ax - esc * 2) - ax) / esc, y: ((hr.y + topoTexto) / 2 - 4 - ay) / esc },
          { x: (mx * 0.5 - ax) / esc, y: ((copia ? copia.y + copia.h * 0.36 : ay + esc) - ay) / esc },  // margem esquerda
          { x: (mx * 0.55 - ax) / esc, y: Math.min(B - 0.6, ((copia ? copia.y + copia.h * 0.66 : ay + 2 * esc) - ay) / esc) },
          // à direita só há braço quando há tela para a mão (1920+); senão o lado direito fica
          // para o arco do eclipse e a coroa — braço sem mão vira massa e tapa a luz
          folgaDir ? { x: R - 0.32, y: T + 0.18 } : { x: 0, y: 0, off: 1 },
          folgaDir ? { x: R - 0.26, y: 0.45 } : { x: 0, y: 0, off: 1 },
          folgaDir ? { x: R - 0.36, y: Math.min(B - 0.3, 1.45) } : { x: 0, y: 0, off: 1 }
        ];
      } else {
        ax = hr.x + hr.w / 2;
        var espaco = copia ? copia.y - hr.y : W * 0.7;
        esc = limitar(Math.min(W * 0.40, (espaco - 40) / 0.78), 80, 250);
        ay = hr.y + 8 + 0.78 * esc;
        maos = [
          { x: -1.42, y: -0.62 }, { x: -1.5, y: 0.55 }, { x: 0, y: 0, off: 1 },
          { x: 1.42, y: -0.62 }, { x: 1.5, y: 0.55 }, { x: 0, y: 0, off: 1 }
        ];
      }
      var olhos = [
        { x: -0.40, y: -0.12, rx: 0.165, ry: 0.072, ang: 0, tipo: 0, peso: 1 },
        { x: 0.40, y: -0.12, rx: 0.165, ry: 0.072, ang: 0, tipo: 0, peso: 1 },
        { x: 0.0, y: -0.665, rx: 0.115, ry: 0.05, ang: -Math.PI / 2, tipo: 1, peso: 0.85 }
      ];
      for (var k = 0; k < 6; k++) {
        var m = maos[k];
        olhos.push(m.off ? { x: 0, y: 0, rx: 0, ry: 0, tipo: 2, peso: 0.4 }
          : { x: m.x, y: m.y, rx: 0.10, ry: 0.044, ang: 0, tipo: k % 2 ? 1 : 2, peso: 0.55 });
      }
      // mar: as mesmas contas do GLSL (MAR_*). Os rostos das fileiras da frente ganham olhos nítidos.
      var MH = 1.45, MD = 0.9, MZ0 = 0.55, MG = 1.5, MFH = 0.66, MFW = 0.70, MP = 1.08;
      var baixo = (hr.y + hr.h - ay) / esc;
      var xMin = -ax / esc - 0.2, xMax = (W - ax) / esc + 0.2;
      for (var j = 1; j <= 7 && olhos.length < 60; j++) {
        var zj = MZ0 * Math.pow(MG, j), yj = MH + MD / zj, hj = MFH / zj, wj = MFW / zj, passo = wj * MP;
        if (yj > baixo + 0.1) continue;
        var desl = (j * 0.618034) % 1;
        for (var i = Math.ceil(xMin / passo - desl); (i + desl) * passo < xMax && olhos.length < 60; i++) {
          var xc = (i + desl) * passo;
          var fr = (i * 0.754877 + j * 0.56984) % 1; if (fr < 0) fr += 1;
          var yc = yj + (fr - 0.5) * 0.16 * hj;
          if (Math.abs(xc) < 0.9 && yc < 1.4) continue;             // atrás da barba: ninguém vê
          for (var s = -1; s <= 1; s += 2) {
            olhos.push({ x: xc + s * 0.40 * wj / 2.6, y: yc + (-0.12 - 0.13) * hj / 2.86,
              rx: 0.17 * wj / 2.6, ry: 0.17 * wj / 2.6 * 0.42, ang: 0, tipo: 3, peso: 0.3 });
          }
        }
      }
      // o sussurro do ócio sai da boca selada da máscara (a linha dos lábios, u.y ≈ 0,64)
      return { ancora: { x: ax, y: ay }, escala: esc, olhos: olhos, sussurro: { x: 0, y: 0.645 } };
    },

    /* Fronteiras das camadas (topo de cada seção, px do DOCUMENTO): ao passar por cada uma,
       a camada seguinte sobe do fundo da tela. I rostos · II garganta · III ermo · IV eclipse */
    camadas: function () {
      var sels = ['.provoke-head', '#metodo', '#pro', '#pacotes'], ys = [];
      for (var i = 0; i < sels.length; i++) {
        var el = document.querySelector(sels[i]);
        el = el && el.closest ? el.closest('section') : null;
        if (!el) return [];
        ys.push(el.getBoundingClientRect().top + window.scrollY);
      }
      return ys;
    },

    /* Criaturas do purgatório: cada uma mede a sua seção e se encaixa no espaço livre (margem,
       sobra à direita do cabeçalho, vão entre seções) — nunca sobre o texto. Tela estreita fica
       só com as que cabem. Unidades: escala px por unidade; olhos em unidades da criatura.
       tipo: 1 vigia · 2 lágrima · 3 boca · 4 espinha · 5 mariposa · 6 ninho · 7 andarilho · 8 eclipse
       gatilho = retângulo (documento) cuja entrada na tela faz a criatura surgir.
       ext = caixa da criatura em unidades (para só mandar à GPU quem está na tela). */
    criaturas: function (ctx) {
      var W = ctx.W, H = ctx.H, largo = !ctx.estreito, lista = [];
      function caixa(el) {
        if (!el) return null;
        var r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return null;
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
      }
      function q(sel) { return caixa(document.querySelector(sel)); }
      function secao(sel) { var el = document.querySelector(sel); return caixa(el && el.closest ? el.closest('section') : null); }
      function olho(x, y, rx, ry, tipo, sangra, comp) {
        return { x: x, y: y, rx: rx, ry: ry, ang: 0, tipo: tipo, peso: 1, sangra: !!sangra, comp: comp || 0 };
      }
      var E, sobra;

      // 1 — O Vigia: olho sobre "Responda com sinceridade", braços das bordas cravando o título
      var ph = q('.provoke-head'), pg = q('.provoke-grid'), ps = secao('.provoke-head');
      if (ph && ps) {
        E = limitar((ph.y - ps.y) * 0.85, 46, 118);
        var y1 = ph.y - 0.42 * E, hw = ph.w / 2 / E;
        lista.push({ tipo: 1, x: ph.x + ph.w / 2, y: y1, escala: E, p1: hw, p2: W / 2 / E, gatilho: ps,
          ext: [-W / 2 / E - 1, -1.2, W / 2 / E + 1, 3.1],
          olhos: [olho(0, 0, 0.55, 0.24, 0, true, Math.max(160, (pg ? pg.y : ph.y + ph.h) - y1 + 40)),
            olho(-(hw + 0.25), 0.3, 0.1, 0.045, 2), olho(hw + 0.25, 0.3, 0.1, 0.045, 2)] });
      }

      // 2 — A Lágrima: pendurada à direita do cabeçalho dos serviços (no celular, no canto)
      var sh = q('#servicos .section-header'), sg = q('#servicos .svc-grid'), ss = secao('#servicos .section-header');
      if (sh && sg && ss) {
        sobra = sg.x + sg.w - (sh.x + sh.w);
        var x2, y2;
        if (largo && sobra > 200) { E = limitar(Math.min(sobra * 0.3, sh.h * 0.42), 46, 115); x2 = sh.x + sh.w + sobra * 0.55; y2 = sh.y + sh.h * 0.4; }
        else { E = 30; x2 = W - 44; y2 = sh.y + 8; }
        lista.push({ tipo: 2, x: x2, y: y2, escala: E, p1: 0, p2: 0, gatilho: ss, ext: [-1.3, -7.2, 1.3, 3.8],
          olhos: [olho(0, 0, 0.42, 0.2, 1, true, Math.max(140, sg.y - y2 + 30))] });
        // 3 — A Boca: mandíbula na margem esquerda, na altura dos cards
        if (largo && sg.x > 110) {
          E = limitar(sg.x * 0.78, 60, 170);
          lista.push({ tipo: 3, x: 0, y: sg.y + sg.h * 0.5, escala: E, p1: 0, p2: 0, gatilho: ss, ext: [-0.3, -1.4, 2.5, 1.5], olhos: [] });
        }
      }

      // 4 — A Espinha: ao lado do método; um olho por vértebra, um por passo
      var mh = q('#metodo .section-header'), mst = q('#metodo .steps'), ms = secao('#metodo .section-header');
      if (largo && mh && mst && ms) {
        sobra = mst.x + mst.w - (mh.x + mh.w);
        if (sobra > 240) {
          E = limitar(Math.min(sobra * 0.27, mh.h * 0.42), 40, 105);
          var ol4 = [];
          for (var k = 1; k <= 5; k++) {
            var xk = -1.5 + 0.6 * k;
            ol4.push(olho(xk, 0.32 * Math.sin(xk * 1.5 + 0.6), 0.17, 0.075, 2, k === 2 || k === 4, 130));
          }
          lista.push({ tipo: 4, x: mh.x + mh.w + sobra * 0.52, y: mh.y + mh.h * 0.5, escala: E, p1: 0, p2: 0, gatilho: ms, ext: [-2.4, -1.4, 2.4, 1.5], olhos: ol4 });
        }
      }

      // 5 — A Mariposa: ao lado do cabeçalho das ferramentas; os ocelos das asas olham
      var th = q('#ferramentas .section-header'), tg = q('#ferramentas .suite-grid'), ts = secao('#ferramentas .section-header');
      if (largo && th && tg && ts) {
        sobra = tg.x + tg.w - (th.x + th.w);
        if (sobra > 240) {
          E = limitar(sobra * 0.24, 50, 110);
          lista.push({ tipo: 5, x: th.x + th.w + sobra * 0.5, y: th.y + E * 1.6, escala: E, p1: 0, p2: 0, gatilho: ts, ext: [-2.1, -1.6, 2.1, 1.7],
            olhos: [olho(-0.95, -0.32, 0.25, 0.12, 0, true, 170), olho(0.95, -0.32, 0.25, 0.12, 0, true, 170)] });
        }
      }

      // 6 — O Ninho: massa de olhos brotando da borda direita, na Edição Pro
      var rh = q('#pro .section-header'), rg = q('#pro .suite-grid'), rs = secao('#pro .section-header');
      if (rh && rg && rs) {
        var margemD = W - (rg.x + rg.w);
        var x6 = W, y6 = rh.y + rh.h * 0.45;
        if (largo && margemD > 110) E = limitar(margemD * 0.75, 60, 150);
        else { E = 40; x6 = W + 12; y6 = rh.y - 18; }
        var N6 = [[-0.55, -0.45, 0.20], [-0.9, 0.05, 0.17], [-0.4, 0.22, 0.24], [-0.75, 0.62, 0.13], [-0.2, -0.75, 0.12], [-1.1, -0.42, 0.10], [-0.22, 0.78, 0.14]];
        var ol6 = [];
        for (var n = 0; n < N6.length; n++) ol6.push(olho(N6[n][0], N6[n][1], N6[n][2], N6[n][2] * 0.45, n % 3 === 1 ? 1 : (n % 3 === 2 ? 2 : 0), n === 0 || n === 2 || n === 3, 150));
        lista.push({ tipo: 6, x: x6, y: y6, escala: E, p1: 0, p2: 0, gatilho: rs, ext: [-3.7, -1.9, 0.3, 1.9], olhos: ol6 });
      }

      // 7 — O Andarilho do Ermo: ao lado de "Autoridade"; chora em barramento
      var cr = document.querySelector('.cred'), cs = cr && cr.closest ? cr.closest('section') : null;
      var chd = cs ? caixa(cs.querySelector('.section-header')) : null, crc = caixa(cr);
      if (largo && chd && crc) {
        sobra = crc.x + crc.w - (chd.x + chd.w);
        if (sobra > 220) {
          E = limitar(Math.min(sobra * 0.5, H * 0.24), 60, 190);
          lista.push({ tipo: 7, x: chd.x + chd.w + sobra * 0.55, y: chd.y + E * 0.9, escala: E, p1: E, p2: 0, gatilho: caixa(cs), ext: [-2.3, -1.1, 2.3, 9],
            olhos: [olho(-0.13, 0.02, 0.085, 0.04, 2, true, 90), olho(0.13, 0.02, 0.085, 0.04, 2, true, 90)] });
        }
      }

      // 8 — O fundo: o eclipse no vão entre os pacotes e o card do contato (opaco), e a mão que sobe para tocá-lo
      var ct = q('#contato .cta-inner'), pk = document.querySelector('#pacotes .container');
      var ult = pk ? caixa(pk.lastElementChild) : null, cts = secao('#contato .cta-title');
      if (ct && ult && cts) {
        var topo = ult.y + ult.h, vao = ct.y - topo;
        var R = Math.min((vao - 14) / 3.61, 110);
        if (R >= 18) {
          var y8 = topo + 8 + 1.16 * R + Math.max(0, vao - 14 - 3.61 * R) * 0.5;
          lista.push({ tipo: 8, x: W / 2, y: y8, escala: R, p1: R, p2: 0, gatilho: cts, ext: [-3.5, -3.5, 3.5, 60],
            olhos: [olho(0, 1.95, 0.3, 0.14, 0, true, 300)] });
        }
      }
      return lista;
    }
  };
  /* ══ CENA: fim ══ */

  /* ───────────────────────────── atlas de glifos ─────────────────────────────
     0..94   ASCII 32..126 (índice = código − 32)
     95..123 extras latinos/pontuação (para mensagens em PT com acento)
     124..127 sombras ░▒▓█ desenhadas em retícula Bayer (independe da fonte)
     128..131 pontos de meio-tom, do menor ao maior
     132..137 linhas de gravura que se CONECTAM entre células: ─ │ ╱ ╲ ┼ ╳      */
  var EXTRAS = '·•†‡¤°ø¦¬«»×÷±§¶ÁÉÍÓÚÃÕÇÂÊÔÀÜ';
  var I_EXTRAS = 95, I_PROC = 124, ATLAS_COLS = 16, ATLAS_LINHAS = 9;
  function indiceGlifo(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 32 && c <= 126) return c - 32;
    var k = EXTRAS.indexOf(ch);
    if (k < 0) k = EXTRAS.indexOf(ch.toUpperCase());
    return k >= 0 ? I_EXTRAS + k : 0;
  }
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  function desenharAtlas(tw, th) {
    var cv = document.createElement('canvas');
    cv.width = tw * ATLAS_COLS; cv.height = th * ATLAS_LINHAS;
    var g = cv.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    var fs = Math.max(6, Math.round(th * 0.8));
    g.font = '600 ' + fs + 'px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
    var i, x, y;
    for (i = 0; i < I_PROC; i++) {
      var ch = i < I_EXTRAS ? String.fromCharCode(32 + i) : EXTRAS.charAt(i - I_EXTRAS);
      x = (i % ATLAS_COLS) * tw; y = Math.floor(i / ATLAS_COLS) * th;
      g.save(); g.beginPath(); g.rect(x, y, tw, th); g.clip();
      g.fillText(ch, x + tw / 2, y + th / 2 + th * 0.04);
      g.restore();
    }
    // sombras em retícula ordenada (Bayer 4×4): 25%, 50%, 75%, 100%
    var niveis = [4, 8, 12, 16];
    for (var s = 0; s < 4; s++) {
      x = ((I_PROC + s) % ATLAS_COLS) * tw; y = Math.floor((I_PROC + s) / ATLAS_COLS) * th;
      for (var py = 0; py < th; py++) for (var px = 0; px < tw; px++) {
        if (BAYER[(py & 3) * 4 + (px & 3)] < niveis[s]) g.fillRect(x + px, y + py, 1, 1);
      }
    }
    // pontos de meio-tom
    var raios = [0.13, 0.22, 0.32, 0.44];
    for (s = 0; s < 4; s++) {
      i = I_PROC + 4 + s; x = (i % ATLAS_COLS) * tw; y = Math.floor(i / ATLAS_COLS) * th;
      g.beginPath(); g.arc(x + tw / 2, y + th / 2, Math.max(0.6, tw * raios[s]), 0, Math.PI * 2); g.fill();
    }
    // linhas de gravura (atravessam a célula de ponta a ponta para emendar com a vizinha)
    var esp = Math.max(1, Math.round(Math.min(tw, th) * 0.11));
    var linhas = [
      [[0, 0.5, 1, 0.5]], [[0.5, 0, 0.5, 1]], [[0, 1, 1, 0]], [[0, 0, 1, 1]],
      [[0, 0.5, 1, 0.5], [0.5, 0, 0.5, 1]], [[0, 1, 1, 0], [0, 0, 1, 1]]
    ];
    g.lineWidth = esp; g.lineCap = 'butt';
    for (s = 0; s < linhas.length; s++) {
      i = I_PROC + 8 + s; x = (i % ATLAS_COLS) * tw; y = Math.floor(i / ATLAS_COLS) * th;
      g.save(); g.beginPath(); g.rect(x, y, tw, th); g.clip();
      for (var k = 0; k < linhas[s].length; k++) {
        var L = linhas[s][k];
        g.beginPath(); g.moveTo(x + L[0] * tw, y + L[1] * th); g.lineTo(x + L[2] * tw, y + L[3] * th); g.stroke();
      }
      g.restore();
    }
    return cv;
  }

  /* ───────────────────────────── shaders ───────────────────────────── */
  var VS_TELA = [
    '#version 300 es',
    'void main() {',
    '  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));',
    '  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var CABECALHO_CENA = [
    '#version 300 es',
    'precision highp float;',
    'precision highp int;',
    'uniform vec2 uRes; uniform vec2 uCel; uniform vec2 uGrade; uniform float uTempo;',
    'uniform vec4 uPonteiro; uniform vec3 uLanterna; uniform float uLuz; uniform float uRolagem;',
    'uniform vec4 uHeroi; uniform vec2 uAncora; uniform float uEscala;',
    'uniform float uDespertar; uniform float uOcio; uniform float uFuria;',
    'uniform vec4 uOnda; uniform vec4 uGlitch;',
    'uniform vec4 uVeus[8]; uniform int uNVeus;',
    'uniform vec4 uOlhos[32]; uniform int uNOlhos;',
    'uniform highp sampler2D uMsg; uniform vec2 uMsgTam;',
    'uniform vec4 uSussurro;',
    'uniform sampler2D uTex0; uniform sampler2D uTex1; uniform vec4 uTexInfo;',
    // relevo de alta definição dos rostos (rosto-n/rosto-m) e a geometria do campo do Limbo
    'uniform sampler2D uTex2; uniform sampler2D uTex3; uniform vec4 uLimbo1; uniform vec4 uLimbo2;',
    'uniform float uSemente;',
    // camadas da descida: x = camada de cima, y = a que sobe do fundo, z = quanto já subiu (0..1);
    // uRolCam = px já descidos dentro de cada camada (paralaxe própria de cada cenário)
    'uniform vec4 uCamada; uniform vec4 uRolCam;',
    // criaturas visíveis: A = (x, y no viewport, escala px, tipo) · B = (presença, semente, p1, p2)
    'uniform vec4 uCriA[6]; uniform vec4 uCriB[6]; uniform int uNCri;',
    // olhos que sangram: A = (x, y, raio px, instante em que abriu) · B = (intensidade, semente, comprimento px, 0)
    'uniform vec4 uSangA[16]; uniform vec4 uSangB[16]; uniform int uNSang;',
    'out vec4 saida;',
    '#define PI 3.14159265',
    'const float G_ESPACO = 0.0, G_EXCL = 1.0, G_ASPAS = 2.0, G_HASH = 3.0, G_PERCENT = 5.0, G_APOST = 7.0,',
    '  G_ASTERISCO = 10.0, G_MAIS = 11.0, G_VIRGULA = 12.0, G_MENOS = 13.0, G_PONTO = 14.0, G_BARRA = 15.0,',
    '  G_0 = 16.0, G_1 = 17.0, G_DOIS_PONTOS = 26.0, G_PONTO_VIRG = 27.0, G_MENOR = 28.0, G_IGUAL = 29.0,',
    '  G_MAIOR = 30.0, G_ARROBA = 32.0, G_CONTRABARRA = 60.0, G_SUBLINHADO = 63.0, G_CRASE = 64.0,',
    '  G_o = 79.0, G_x = 88.0, G_PIPE = 92.0, G_TIL = 94.0,',
    '  G_PONTO_MEIO = 95.0, G_BULLET = 96.0, G_ADAGA = 97.0, G_ADAGA2 = 98.0, G_OLHO = 99.0, G_GRAU = 100.0,',
    '  G_O_CORTADO = 101.0, G_BARRA_QUEBRADA = 102.0, G_NEG = 103.0, G_VEZES = 106.0, G_PARAGRAFO = 110.0,',
    '  G_SOMBRA1 = 124.0, G_SOMBRA2 = 125.0, G_SOMBRA3 = 126.0, G_BLOCO = 127.0,',
    '  G_MEIOTOM1 = 128.0, G_MEIOTOM2 = 129.0, G_MEIOTOM3 = 130.0, G_MEIOTOM4 = 131.0,',
    '  G_LH = 132.0, G_LV = 133.0, G_LD1 = 134.0, G_LD2 = 135.0, G_LCRUZ = 136.0, G_LXIS = 137.0;',
    // hashes sem seno (Dave Hoskins): estáveis em qualquer GPU
    'float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }',
    'float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }',
    'float ruido(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * ruido(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }',
    'mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }',
    'float sdCirculo(vec2 p, float r) { return length(p) - r; }',
    'float sdElipse(vec2 p, vec2 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-5); }',
    'float sdCapsula(vec2 p, vec2 a, vec2 b, float r) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }',
    'float sdCaixa(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }',
    'float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }',
    'float lanterna(vec2 p) { float d = length(p - uLanterna.xy); return uLuz * (1.0 - smoothstep(uLanterna.z * 0.2, uLanterna.z, d)); }',
    'float veu(vec2 p) {',
    '  float v = 1.0;',
    '  for (int i = 0; i < 8; i++) {',
    '    if (i >= uNVeus) break;',
    '    vec4 r = uVeus[i];',
    '    vec2 d = abs(p - (r.xy + r.zw * 0.5)) - r.zw * 0.5;',
    '    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);',
    '    v = min(v, smoothstep(-4.0, 36.0, dist));',
    '  }',
    '  return v;',
    '}',
    // mensagens: cada linha da textura = [comprimento, glifo, glifo, ...]
    'float glifoMsg(float linha, float coluna) {',
    '  int y = int(mod(linha, max(uMsgTam.y - 1.0, 1.0)));',   // a última linha é do sussurro: fora do sorteio
    '  float n = floor(texelFetch(uMsg, ivec2(0, y), 0).r * 255.0 + 0.5);',
    '  if (n < 1.0) return G_ESPACO;',
    '  int x = 1 + int(mod(coluna, n));',
    '  return floor(texelFetch(uMsg, ivec2(x, y), 0).r * 255.0 + 0.5);',
    '}',
    'float rampa(float d) {',
    '  if (d < 0.06) return G_ESPACO; if (d < 0.14) return G_PONTO; if (d < 0.22) return G_PONTO_MEIO;',
    '  if (d < 0.30) return G_DOIS_PONTOS; if (d < 0.38) return G_MENOS; if (d < 0.46) return G_IGUAL;',
    '  if (d < 0.54) return G_MAIS; if (d < 0.62) return G_ASTERISCO; if (d < 0.72) return G_PERCENT;',
    '  if (d < 0.84) return G_HASH; return G_ARROBA;',
    '}',
    'float binario(vec2 cel, float taxa) { return hash21(cel * 1.13 + floor(uTempo * taxa + hash21(cel) * 7.0) * 13.7) < 0.5 ? G_0 : G_1; }',
    'float rampaBinaria(float d, vec2 cel) { if (d < 0.07) return G_ESPACO; if (d < 0.17) return G_PONTO_MEIO; return binario(cel, 1.6); }',
    // linha de gravura pela direção (radianos, referencial y para baixo)
    'float hachura(float ang) {',
    '  float a = mod(ang + PI / 8.0, PI);',
    '  float k = floor(a / (PI / 4.0));',
    '  return k < 0.5 ? G_LH : (k < 1.5 ? G_LD2 : (k < 2.5 ? G_LV : G_LD1));',
    '}',
    // o abismo padrão: tecido binário quase apagado + chuva + decodificação sob a lanterna
    'vec4 fundoAbismo(vec2 p, vec2 cel) {',
    '  float h = hash21(cel * 1.37 + uSemente);',
    '  float g = binario(cel, 0.35 + h * 0.9);',
    '  float b = 0.03 + 0.045 * h;',
    '  float tinta = 0.30 + 0.14 * h;',
    '  float sc = hash11(cel.x * 3.17 + uSemente * 1.3);',
    '  float vel = mix(2.0, 8.5, hash11(cel.x * 1.91 + 4.0));',
    '  float comp = mix(5.0, 24.0, hash11(cel.x * 7.7 + 1.0));',
    '  float ciclo = uGrade.y + comp + mix(8.0, 70.0, sc);',
    '  float cab = mod(uTempo * vel + sc * ciclo, ciclo);',
    '  float d = cab - cel.y;',
    '  if (d >= 0.0 && d < comp) {',
    '    float k = 1.0 - d / comp;',
    '    b = max(b, 0.07 + 0.36 * pow(k, 1.8));',
    '    tinta = mix(0.40, 0.60, k);',
    '    g = binario(cel, 10.0);',
    '    if (d < 1.0) { b = 0.72; tinta = 0.93; }',
    '  }',
    '  float L = max(lanterna(p), uFuria * 0.85);',
    '  if (L > 0.015) {',
    '    float dir = hash11(cel.y * 9.1) < 0.5 ? 1.0 : -1.0;',
    '    float desl = floor(uTempo * (0.4 + hash11(cel.y * 3.3)) * dir) + floor(hash11(cel.y * 5.7) * 97.0);',
    '    float gm = glifoMsg(cel.y + floor(uSemente * 7.0), cel.x + desl);',
    '    float limiar = 0.12 + 0.7 * hash21(cel * 0.71 + 3.1);',
    '    if (mod(cel.y, 2.0) < 1.0 && gm > 0.5 && L > limiar) { g = gm; tinta = mix(tinta, 0.9, L); }',
    '    b += L * 0.5 * (0.6 + 0.4 * h);',
    '  }',
    '  return vec4(g, b, tinta, 0.0);',
    '}',
    ''
  ].join('\n');

  /* Geometria do campo do Limbo: a MESMA no passo de células (decide em que células a gravura
     entra — o glifo 255 é a "janela") e no passo de gravura (desenha o rosto pixel a pixel).
     L1 = (horizonte px, profundidade px, z0, razão) · L2 = (meia-largura px na z = 1, nariz).
     Devolve w: 0 nada · 1 rosto · 2 nariz em cone; xy = coordenada no relevo (rosto: x -1..1,
     y -1,15..1,15 · cone: x -1..1 na largura, y 0..1 da base ao bico); z = profundidade;
     f = (centro x px, meia-largura px, meia-altura px, semente). dilata (px) só no passo de
     células: a célula vira janela se a borda passar perto do centro dela. */
  var LIMBO_GEO = [
    'vec4 limboGeo(vec2 p, vec4 L1, vec4 L2, sampler2D rn, float dilata, out vec4 f) {',
    '  f = vec4(0.0);',
    '  float v = p.y - L1.x;',
    '  if (v < 1.0) return vec4(0.0);',
    '  float jEst = floor(log(max(L1.y / v, 1e-4) / L1.z) / log(L1.w));',
    '  for (int q = -5; q <= 1; q++) {',
    '    float jj = jEst + float(q);',
    '    if (jj < 0.0) continue;',
    '    float zj = L1.z * pow(L1.w, jj);',
    '    float yj = L1.x + L1.y / zj;',
    '    float wj = L2.x / zj, hj = wj * 0.55;',
    '    float passo = wj * 2.12;',
    '    float desl = fract(jj * 0.618034);',
    '    float i = floor(p.x / passo - desl + 0.5);',
    '    float hi = hash11(i * 3.1 + jj * 7.3);',
    '    float xc = (i + desl) * passo + (hi - 0.5) * passo * 0.12;',
    '    float yc = yj + (hash11(i * 1.7 + jj) - 0.5) * hj * 0.3;',
    '    f = vec4(xc, wj, hj, hi);',
    '    if (L2.y > 0.0) {',
    '      float yb = yc + 0.17 * hj / 1.15;',
    '      float alt = L2.y * hj * (0.85 + 0.5 * hi);',
    '      float hw = 0.075 * wj;',
    '      float s = (yb - p.y) / alt;',
    '      if (s >= 0.0 && s <= 1.0 && abs(p.x - xc) < hw * (1.0 - s) + dilata) return vec4((p.x - xc) / max(hw * (1.0 - s), 1e-3), s, zj, 2.0);',
    '    }',
    '    vec2 t = vec2((p.x - xc) / wj, (p.y - yc) / hj * 1.15);',
    '    vec2 uv = vec2(t.x * 0.5 + 0.5, (t.y + 1.15) / 2.3);',
    '    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {',
    '      if (texture(rn, uv).b > 0.004 || (dilata > 0.0 && length(t / vec2(0.8, 1.04)) < 1.0 + dilata / wj)) return vec4(t, zj, 1.0);',
    '    }',
    '  }',
    '  return vec4(0.0);',
    '}',
    ''
  ].join('\n');

  /* Passo de GRAVURA (alta definição): só pinta os pixels das células marcadas com o glifo 255
     (rostos do Limbo e o rosto do Andarilho); tudo o mais segue em ASCII. É gravura de cédula:
     linhas finas e claras que contornam a forma — o relevo empurra a linha (ela "sobe" pela
     maçã, afunda no vinco), a luz engrossa a linha, a sombra a apaga. O cone do nariz é riscado
     no sentido do comprimento, convergindo para o bico. */
  var FS_HD = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D uCena; uniform sampler2D uRN; uniform sampler2D uRM;',
    'uniform vec2 uResPx; uniform vec2 uCelPx; uniform vec2 uGrade; uniform float uDpr; uniform float uTempo;',
    'uniform vec3 uLanterna; uniform float uLuz; uniform vec3 uFundo;',
    'uniform vec4 uLimbo1; uniform vec4 uLimbo2; uniform vec4 uAnd;',
    'uniform vec4 uVeus[8]; uniform int uNVeus;',
    'out vec4 saida;',
    'float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }',
    'float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    LIMBO_GEO,
    'vec3 paleta(float t) {',
    '  vec3 c0 = vec3(0.090, 0.008, 0.016), c1 = vec3(0.340, 0.024, 0.055), c2 = vec3(0.700, 0.051, 0.137);',
    '  vec3 c3 = vec3(1.000, 0.188, 0.260), c4 = vec3(1.000, 0.540, 0.470), c5 = vec3(1.000, 0.945, 0.918);',
    '  if (t < 0.25) return mix(c0, c1, t / 0.25);',
    '  if (t < 0.50) return mix(c1, c2, (t - 0.25) / 0.25);',
    '  if (t < 0.72) return mix(c2, c3, (t - 0.50) / 0.22);',
    '  if (t < 0.88) return mix(c3, c4, (t - 0.72) / 0.16);',
    '  return mix(c4, c5, (t - 0.88) / 0.12);',
    '}',
    'float veuPx(vec2 p) {',
    '  float v = 1.0;',
    '  for (int i = 0; i < 8; i++) {',
    '    if (i >= uNVeus) break;',
    '    vec4 r = uVeus[i];',
    '    vec2 d = abs(p - (r.xy + r.zw * 0.5)) - r.zw * 0.5;',
    '    v = min(v, smoothstep(-4.0, 36.0, length(max(d, 0.0)) + min(max(d.x, d.y), 0.0)));',
    '  }',
    '  return v;',
    '}',
    // linha de buril: fase -> cobertura com antisserrilhado; larg 0..1 (metade do período)
    'float buril(float fase, float larg) {',
    '  float f = abs(fract(fase) - 0.5) * 2.0;',
    '  float aa = clamp(fwidth(fase) * 1.6, 0.02, 0.5);',
    '  return 1.0 - smoothstep(larg - aa, larg + aa, f);',
    '}',
    // tom de um ponto do relevo: luz principal, oclusão, cavidade, brilho e lanterna
    'float tomRelevo(vec2 uv, vec3 L, float lz, out float h, out float fio) {',
    '  vec4 a = texture(uRN, uv); vec4 b = texture(uRM, uv);',
    '  vec2 nxy = a.xy * 2.0 - 1.0;',
    '  vec3 n = normalize(vec3(nxy, sqrt(max(1.0 - dot(nxy, nxy), 0.02))));',
    '  h = a.b; fio = b.b;',
    '  float dif = max(dot(n, L), 0.0);',
    '  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 22.0);',
    '  float cav = clamp(1.0 + (b.r - 0.5) * 3.2, 0.1, 1.3);',
    '  float t = (0.03 + 0.92 * pow(dif, 1.35)) * b.g * cav + 0.35 * spec * b.g;',
    '  return t + lz * (0.25 + 0.6 * n.z);',
    '}',
    'void main() {',
    '  vec2 pd = vec2(gl_FragCoord.x, uResPx.y - gl_FragCoord.y);',
    '  vec2 cel = floor(pd / uCelPx);',
    '  vec4 c = texelFetch(uCena, ivec2(int(cel.x), int(uGrade.y - 1.0 - cel.y)), 0);',
    '  if (floor(c.r * 255.0 + 0.5) < 254.5) discard;',
    '  vec2 p = pd / uDpr;',
    '  float lz = uLuz * exp(-pow(length(p - uLanterna.xy) / (uLanterna.z * 0.75), 2.0));',
    '  vec3 col = uFundo;',
    '  float h, fio;',
    // o Andarilho: rosto de pé, luz pela esquerda, metade direita afundando na sombra
    '  vec2 ua = (p - uAnd.xy) / max(uAnd.z, 1.0);',
    '  vec2 ta = (ua - vec2(0.0, 0.062)) / 0.419;',
    '  vec2 hc = (ua - vec2(0.0, -0.08)) / vec2(0.5, 0.62);',
    '  if (uAnd.w > 0.01 && length(hc) < 1.12) {',
    '    vec2 uv = vec2(ta.x * 0.5 + 0.5, (ta.y + 1.15) / 2.3);',
    // franja irregular sobre a testa (a mesma conta do passo de células, semente 0,326)
    '    float franja = -0.1 + 0.07 * sin(ua.x * 38.0 + 0.326) + 0.03 * sin(uTempo * 0.6 + ua.x * 7.0);',
    '    bool rosto = abs(ta.x) < 1.0 && abs(ta.y) < 1.15 && texture(uRN, uv).b > 0.004 && ua.y > franja;',
    '    if (!rosto && length(hc) < 1.0) {',
    // cabelo: fios finos e escuros que caem em cortina, acesos de leve pela esquerda
    '      float fase = ua.x * uAnd.z / (2.1 / uDpr * uDpr) * uDpr / 2.1 + 0.35 * sin(ua.y * 9.0 + uTempo * 0.5 + ua.x * 3.0);',
    '      float luzC = clamp(0.35 - ua.x * 0.6 - ua.y * 0.25, 0.04, 0.5) * smoothstep(1.0, 0.75, length(hc));',
    '      col += paleta(0.3 + 0.3 * luzC) * buril(fase, 0.35) * (0.25 + luzC);',
    '    }',
    '    if (rosto) {',
    '      float t = tomRelevo(uv, normalize(vec3(-0.8, -0.25, 0.55)), lz, h, fio);',
    '      t *= 1.0 - 0.55 * smoothstep(-0.1, 0.7, ta.x);',
    '      float esp = 2.4 * uDpr;',
    '      float fase = pd.y / esp + h * uAnd.z * 0.42 * 0.5 / (esp / uDpr) - ta.x * ta.x * 1.5;',
    '      float lin = buril(fase, clamp(t * 0.95, 0.0, 0.95)) * (1.0 - 0.75 * fio);',
    '      col += paleta(0.62 + 0.36 * clamp(t, 0.0, 1.0)) * lin * (0.35 + 0.75 * t);',
    '    }',
    '  } else {',
    '    vec4 f;',
    '    vec4 gr = limboGeo(p, uLimbo1, uLimbo2, uRN, 0.0, f);',
    '    float neb = smoothstep(1.4, 0.1, gr.z);',
    '    vec3 L = normalize(vec3(-0.55, -0.6, 0.6));',
    '    float esp = 3.0 * uDpr;',
    '    if (gr.w > 1.5) {',
    // o cone: face esquerda ao sol, direita em breu, aresta acesa; riscado ao longo do comprimento
    '      float u = gr.x;',
    '      float t = u < 0.0 ? 0.42 + 0.45 * smoothstep(-0.2, -0.95, u) : 0.04 + 0.08 * (1.0 - u);',
    '      t = t * (0.3 + 0.7 * neb) + lz * 0.6;',
    '      float lin = buril(u * f.y * 0.075 * (1.0 - gr.y) * 2.0 / esp * uDpr, clamp(t, 0.0, 0.95));',
    '      if (u < -0.88) lin = 1.0;',
    '      col += paleta(0.5 + 0.45 * clamp(t, 0.0, 1.0)) * lin * (0.3 + 0.75 * t) * (0.3 + 0.7 * neb);',
    '    } else if (gr.w > 0.5) {',
    '      vec2 uv = vec2(gr.x * 0.5 + 0.5, (gr.y + 1.15) / 2.3);',
    '      float t = tomRelevo(uv, L, lz, h, fio) * (0.25 + 0.75 * neb);',
    // linhas horizontais de cédula, empurradas pelo relevo (sobem pela maçã, afundam no vinco)
    '      float fase = pd.y / esp + h * f.z * 0.55 / (esp / uDpr) + gr.x * gr.x * 2.2 * (f.z / 60.0);',
    '      float lin = buril(fase, clamp(t * 0.95, 0.0, 0.95)) * (1.0 - 0.7 * fio);',
    // sob a lanterna os olhos do morto se entreabrem: uma brasa na fresta da pálpebra
    '      vec2 e = vec2(abs(gr.x) - 0.31, gr.y + 0.105) / vec2(0.11, 0.025);',
    '      float olho = (1.0 - smoothstep(0.7, 1.0, length(e))) * smoothstep(0.25, 0.6, lz);',
    '      col += paleta(0.45 + 0.5 * clamp(t, 0.0, 1.0)) * lin * (0.3 + 0.8 * t) * (0.35 + 0.65 * neb);',
    '      col = mix(col, vec3(1.0, 0.35, 0.22) * (0.6 + 0.4 * h21(floor(pd * 0.5) + floor(uTempo * 8.0))), olho);',
    '    }',
    '  }',
    // mesmo acabamento do passo de tela: véu de contraste, vinheta, scanline e grão
    '  col *= mix(0.05, 1.0, veuPx(p));',                    // gravura é mais clara que o ASCII: véu mais fundo
    '  vec2 q = p / (uResPx / uDpr) - 0.5;',
    '  col *= mix(0.42, 1.0, smoothstep(0.98, 0.22, length(q * vec2(1.0, 1.18))));',
    '  col *= 1.0 - 0.055 * step(0.5, fract(gl_FragCoord.y * 0.5));',
    '  col += (h21(pd + fract(uTempo * 7.31) * 113.0) - 0.5) * 0.022;',
    '  saida = vec4(max(col, 0.0), 1.0);',
    '}'
  ].join('\n');

  var PRINCIPAL_CENA = [
    '',
    'vec4 aplicarSussurro(vec4 c, vec2 cel) {',
    '  if (uSussurro.z < 0.01) return c;',
    '  vec2 alvo = floor(uSussurro.xy / uCel);',
    '  float n = floor(texelFetch(uMsg, ivec2(0, int(uMsgTam.y) - 1), 0).r * 255.0 + 0.5);',
    '  float i0 = alvo.x - floor(n * 0.5);',
    '  if (cel.y == alvo.y && cel.x >= i0 && cel.x < i0 + n) {',
    '    float k = cel.x - i0;',
    '    float g = floor(texelFetch(uMsg, ivec2(1 + int(k), int(uMsgTam.y) - 1), 0).r * 255.0 + 0.5);',
    '    float revela = smoothstep(0.0, 1.0, uSussurro.z * 1.6 - hash21(cel) * 0.6);',
    '    if (g > 0.5 && revela > 0.05) return vec4(g, max(c.y, 0.75 * revela), 0.9, 0.15 * revela);',
    '  }',
    '  return c;',
    '}',
    'void main() {',
    '  vec2 ij = floor(gl_FragCoord.xy);',
    '  vec2 cel = vec2(ij.x, uGrade.y - 1.0 - ij.y);',
    '  vec2 p0 = (cel + 0.5) * uCel;',
    // glitch: uma faixa de linhas desliza na horizontal (deslocamento, nunca flash)
    '  if (uGlitch.w > 0.5 && cel.y >= uGlitch.x && cel.y <= uGlitch.y) cel.x = mod(cel.x + uGlitch.z, uGrade.x);',
    '  vec2 p = (cel + 0.5) * uCel;',
    // onda do clique: o tecido ondula a partir do ponto clicado
    '  if (uOnda.w > 0.0) {',
    '    float t = uTempo - uOnda.z;',
    '    vec2 dv = p - uOnda.xy; float dist = length(dv);',
    '    float faixa = exp(-pow((dist - t * 820.0) / 70.0, 2.0)) * exp(-t * 2.0);',
    '    p += dv / max(dist, 1.0) * faixa * 30.0 * uOnda.w;',
    '  }',
    '  vec4 c = cena(p, cel);',
    '  c = aplicarSussurro(c, cel);',
    '  float v = veu(p0);',
    '  c.y *= mix(0.15, 1.0, v);',
    '  c.z = mix(min(c.z, 0.6), c.z, v);',
    '  c.w *= mix(0.12, 1.0, v);',
    '  saida = vec4(clamp(c.x, 0.0, 255.0) / 255.0, clamp(c.y, 0.0, 1.0), clamp(c.z, 0.0, 1.0), clamp(c.w, 0.0, 1.0));',
    '}'
  ].join('\n');

  var FS_TELA = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D uCena; uniform sampler2D uAtlas;',
    'uniform vec2 uResPx; uniform vec2 uCelPx; uniform vec2 uGrade; uniform float uDpr;',
    'uniform vec3 uLanterna; uniform float uLuz; uniform float uTempo; uniform float uAberracao;',
    'uniform vec3 uFundo;',
    'uniform vec4 uVeus[8]; uniform int uNVeus;',
    'out vec4 saida;',
    'vec3 paleta(float t) {',
    '  vec3 c0 = vec3(0.090, 0.008, 0.016), c1 = vec3(0.340, 0.024, 0.055), c2 = vec3(0.700, 0.051, 0.137);',
    '  vec3 c3 = vec3(1.000, 0.188, 0.260), c4 = vec3(1.000, 0.540, 0.470), c5 = vec3(1.000, 0.945, 0.918);',
    '  if (t < 0.25) return mix(c0, c1, t / 0.25);',
    '  if (t < 0.50) return mix(c1, c2, (t - 0.25) / 0.25);',
    '  if (t < 0.72) return mix(c2, c3, (t - 0.50) / 0.22);',
    '  if (t < 0.88) return mix(c3, c4, (t - 0.72) / 0.16);',
    '  return mix(c4, c5, (t - 0.88) / 0.12);',
    '}',
    'float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'float veuPx(vec2 p) {',
    '  float v = 1.0;',
    '  for (int i = 0; i < 8; i++) {',
    '    if (i >= uNVeus) break;',
    '    vec4 r = uVeus[i];',
    '    vec2 d = abs(p - (r.xy + r.zw * 0.5)) - r.zw * 0.5;',
    '    v = min(v, smoothstep(-4.0, 36.0, length(max(d, 0.0)) + min(max(d.x, d.y), 0.0)));',
    '  }',
    '  return v;',
    '}',
    'void main() {',
    '  vec2 pd = vec2(gl_FragCoord.x, uResPx.y - gl_FragCoord.y);',
    '  vec2 cel = floor(pd / uCelPx);',
    '  vec4 c = texelFetch(uCena, ivec2(int(cel.x), int(uGrade.y - 1.0 - cel.y)), 0);',
    '  float g = floor(c.r * 255.0 + 0.5);',
    '  vec2 f = (pd - cel * uCelPx) / uCelPx;',
    '  vec2 tile = vec2(mod(g, 16.0), floor(g / 16.0));',
    '  float cob = g > 250.0 ? 0.0 : texture(uAtlas, (tile + f) / vec2(16.0, 9.0)).r;',
    '  vec2 fq = clamp(f + vec2(uAberracao * uDpr / uCelPx.x, 0.0), 0.0, 1.0);',
    '  float cobQ = g > 250.0 ? 0.0 : texture(uAtlas, (tile + fq) / vec2(16.0, 9.0)).r;',
    '  vec2 p = pd / uDpr;',
    '  vec2 uvC = vec2(pd.x / uCelPx.x / uGrade.x, 1.0 - pd.y / uCelPx.y / uGrade.y);',
    '  vec4 suave = texture(uCena, uvC);',
    '  vec3 fundo = uFundo + paleta(suave.b) * suave.a * 0.42;',
    '  float dl = length(p - uLanterna.xy);',
    '  float L = uLuz * exp(-pow(dl / (uLanterna.z * 0.8), 2.0));',
    '  fundo += vec3(0.16, 0.012, 0.024) * L * 0.4 * veuPx(p);',
    '  vec3 cor = paleta(c.b) * c.g;',
    '  vec3 franja = paleta(min(c.b, 0.55)) * c.g;',
    '  vec3 col = mix(fundo, franja, cobQ * 0.55);',
    '  col = mix(col, cor, cob);',
    '  vec2 q = p / (uResPx / uDpr) - 0.5;',
    '  col *= mix(0.42, 1.0, smoothstep(0.98, 0.22, length(q * vec2(1.0, 1.18))));',
    '  col *= 1.0 - 0.055 * step(0.5, fract(gl_FragCoord.y * 0.5));',
    '  col += (h21(pd + fract(uTempo * 7.31) * 113.0) - 0.5) * 0.022;',
    '  saida = vec4(max(col, 0.0), 1.0);',
    '}'
  ].join('\n');

  var VS_OLHO = [
    '#version 300 es',
    'in vec2 aCanto;',
    'in vec4 aA;', // centro.xy (px CSS), raio.xy (px CSS)
    'in vec4 aB;', // ângulo, abertura, pupila.xy (-1..1)
    'in vec4 aC;', // dilatação, tipo, semente, visibilidade
    'uniform vec2 uRes;',
    'out vec2 vLocal; out vec4 vA; out vec4 vB; out vec4 vC;',
    'void main() {',
    '  vec2 loc = aCanto * vec2(1.35, 2.6);',
    '  vec2 q = loc * aA.zw;',
    '  float c = cos(aB.x), s = sin(aB.x);',
    '  vec2 px = aA.xy + vec2(c * q.x - s * q.y, s * q.x + c * q.y);',
    '  gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);',
    '  vLocal = loc; vA = aA; vB = aB; vC = aC;',
    '}'
  ].join('\n');

  var FS_OLHO = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 vLocal; in vec4 vA; in vec4 vB; in vec4 vC;',
    'uniform float uTempo; uniform float uDpr;',
    'out vec4 saida;',
    'float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'float rn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y); }',
    // retícula de meio-tom a 45° (px de dispositivo): tom 1 = claro, 0 = escuro
    'float pontos(vec2 pd, float tom, float passo) {',
    '  vec2 q = mat2(0.7071, 0.7071, -0.7071, 0.7071) * pd / passo;',
    '  vec2 f = fract(q) - 0.5;',
    '  float r = sqrt(clamp(1.0 - tom, 0.0, 1.0)) * 0.66;',
    '  float aa = 1.2 / passo;',
    '  return 1.0 - smoothstep(r - aa, r + aa, length(f));',
    '}',
    'void main() {',
    '  vec2 R = vA.zw;',
    '  vec2 q = vLocal * R;',
    '  float x = vLocal.x;',
    '  float ab = clamp(vB.y, 0.0, 1.25);',
    '  float tipo = vC.y; float semente = vC.z; float vis = vC.w;',
    '  float px1 = 0.9 / uDpr;',
    '  float w = clamp(1.0 - x * x, 0.0, 1.0);',
    '  float yTop = -R.y * ab * pow(w, 0.72);',
    '  float yBot = R.y * ab * 0.8 * pow(w, 0.9);',
    '  float dentro = smoothstep(yTop - px1, yTop + px1, q.y) * (1.0 - smoothstep(yBot - px1, yBot + px1, q.y)) * step(abs(x), 1.0);',
    '  vec3 osso = vec3(0.93, 0.85, 0.82), sangue = vec3(0.45, 0.03, 0.06), negro = vec3(0.035, 0.0, 0.008);',
    '  float pequeno = step(R.x, 9.0);',
    // esclera: sombreada junto às pálpebras e nos cantos, impressa em meio-tom
    '  float prof = clamp(min(q.y - yTop, yBot - q.y) / max(R.y * max(ab, 0.05), 1.0), 0.0, 1.0);',
    '  float tom = 0.18 + 0.7 * smoothstep(0.0, 0.85, prof) * (1.0 - 0.5 * x * x);',
    '  float ponto = pontos(gl_FragCoord.xy, tom, max(2.6, 3.1 * uDpr));',
    '  vec3 col = mix(osso, sangue * 0.55, mix(ponto, 1.0 - tom, pequeno));',
    '  float veia = smoothstep(0.78, 0.95, rn(q * 0.3 / max(R.x / 40.0, 0.4) + semente * 11.0)) * smoothstep(0.3, 0.95, abs(x));',
    '  col = mix(col, vec3(0.78, 0.07, 0.11), veia * 0.75);',
    // íris
    '  vec2 ci = vec2(vB.z * R.x * 0.44, vB.w * R.y * 0.42);',
    '  float ri = R.x * 0.40;',
    '  vec2 dq = q - ci; float di = length(dq);',
    '  float iris = 1.0 - smoothstep(ri - px1, ri + px1, di);',
    '  float angI = atan(dq.y, dq.x);',
    '  float fibra = 0.5 + 0.5 * sin(angI * 34.0 + rn(vec2(angI * 5.0, di * 0.2 + semente * 3.0)) * 7.0);',
    '  float radial = di / max(ri, 1e-3);',
    '  vec3 corIris = mix(vec3(1.0, 0.42, 0.26), vec3(0.52, 0.02, 0.06), smoothstep(0.15, 1.0, radial));',
    '  corIris *= 0.62 + 0.5 * fibra;',
    '  corIris = mix(corIris, negro, smoothstep(0.8, 1.0, radial) * 0.85);',
    '  corIris *= 1.0 - 0.55 * smoothstep(R.y * 0.6 * max(ab, 0.05), 0.0, q.y - yTop);',
    '  col = mix(col, corIris, iris);',
    // pupila: redonda; tipo 1 = fenda vertical
    '  float dil = clamp(vC.x + 0.025 * sin(uTempo * 1.3 + semente * 17.0), 0.0, 1.0);',
    '  float dp = (tipo > 0.5 && tipo < 1.5)',
    '    ? length(dq / vec2(mix(0.16, 0.5, dil), 1.0)) - ri * 0.9',
    '    : di - ri * mix(0.24, 0.62, dil);',
    '  float pupila = 1.0 - smoothstep(-px1, px1, dp);',
    '  col = mix(col, negro, pupila);',
    // reflexos: presos ao olho (a luz vem do eclipse), não à pupila
    '  float refl = 1.0 - smoothstep(ri * 0.14 - px1, ri * 0.14 + px1, length(q - ci - vec2(-0.34, -0.36) * ri));',
    '  float refl2 = 1.0 - smoothstep(ri * 0.06 - px1, ri * 0.06 + px1, length(q - ci - vec2(0.3, 0.24) * ri));',
    '  col = mix(col, vec3(1.0, 0.96, 0.93), max(refl, refl2 * 0.7) * iris * (1.0 - pequeno * 0.5));',
    // contorno das pálpebras (a de cima mais grossa); fechado vira uma costura
    '  float espT = max(px1 * 1.6, R.y * 0.09), espB = max(px1 * 1.1, R.y * 0.05);',
    '  float bordaT = (1.0 - smoothstep(espT * 0.5, espT, abs(q.y - yTop))) * step(abs(x), 1.02);',
    '  float bordaB = (1.0 - smoothstep(espB * 0.5, espB, abs(q.y - yBot))) * step(abs(x), 1.0) * smoothstep(0.02, 0.2, ab);',
    '  float cilio = 0.0;',
    '  if (abs(x) < 0.92) {',
    '    float kx = fract(x * 7.0 + 0.5) - 0.5;',
    '    float dy = (yTop - q.y) / max(R.y * 0.42, 2.0);',
    '    cilio = step(0.0, dy) * step(dy, 1.0) * (1.0 - smoothstep(0.05, 0.12, abs(kx + dy * 0.25 * sign(x))));',
    '  }',
    '  float contorno = max(max(bordaT, bordaB), cilio * (1.0 - pequeno));',
    // costura (máscara mortuária): fechado, a linha preta da pálpebra vira um corte vermelho
    // costurado com pontos em X cor de osso — o fio é tão "real" quanto o olho. Some ao abrir.
    '  float fechado = 1.0 - smoothstep(0.03, 0.22, ab);',
    '  float passo = max(R.x * 0.30, 7.0 * px1);',
    '  float kx = q.x - (floor(q.x / passo) + 0.5) * passo;',
    '  float hX = max(R.y * 0.5, 3.0 * px1);',
    '  float corte = (1.0 - smoothstep(px1 * 0.7, px1 * 1.7, abs(q.y))) * step(abs(x), 0.98);',
    '  float xis = (1.0 - smoothstep(px1 * 0.5, px1 * 1.5, abs(abs(kx) * hX / (passo * 0.3) - abs(q.y)))) * step(abs(q.y), hX) * step(abs(x), 0.9);',
    '  contorno *= 1.0 - fechado;',
    '  float alfaCost = max(corte * 0.85, xis) * fechado;',
    '  vec3 corCost = mix(vec3(0.66, 0.05, 0.09), vec3(0.93, 0.84, 0.79), xis);',
    // brilho vermelho em volta da abertura (o olho "emite")
    '  float dBorda = max(max(yTop - q.y, q.y - yBot), (abs(x) - 1.0) * R.x);',
    '  float glow = exp(-pow(max(dBorda, 0.0) / max(R.y * 1.1, 3.0), 2.0)) * (0.22 + 0.4 * dil) * smoothstep(0.0, 0.25, ab);',
    '  vec3 corFinal = mix(mix(col, negro, contorno), corCost, alfaCost);',
    '  float alfa = max(max(dentro, contorno * 0.95), alfaCost);',
    '  vec3 saidaCor = mix(vec3(0.85, 0.06, 0.11), corFinal, alfa);',
    '  float alfaFinal = max(alfa, glow * 0.55);',
    '  saida = vec4(saidaCor * vis, alfaFinal * clamp(vis * 1.4, 0.0, 1.0));',
    '}'
  ].join('\n');

  /* ───────────────────────────── estado global ───────────────────────────── */
  var canvas = canvasInicial;
  var gl = null;
  var P = {};                 // programas
  var T = {};                 // texturas/framebuffer
  var modo = 'iniciando';     // pleno | estatico | pausado | fallback | desligado
  var qualidade = 0;          // 0 (máxima) .. 3
  var dpr = 1, tw = 8, th = 14, cols = 1, linhas = 1, W = 0, H = 0, alturaMantida = 0, larguraMantida = 0;
  var heroi = null, heroiDoc = { x: 0, y: 0, w: 0, h: 0 };
  var lay = null;             // resultado de CENA.layout (âncora em px do documento)
  var veus = [];              // [{el, x, y(doc), w, h}]
  var olhos = [];
  var MAX_OLHOS = 128;
  var dadosOlhos = new Float32Array(MAX_OLHOS * 12);
  var NUNCA = -1e9;          // instante "ainda não aconteceu" (o relógio começa em 0 no carregamento)
  var cris = [];              // criaturas das camadas (CENA.criaturas), com presença viva
  var fronteiras = [];        // topo (documento) de cada camada da descida
  var t0 = agora(), tUlt = 0, tQuadroUlt = 0, rafId = 0, rodando = false;
  var semente = Math.random() * 100;
  var erros = [];

  var ponteiro = { x: -9999, y: -9999, ativo: false, ultimoMov: -99, vel: 0, presente: false };
  var lant = { x: -9999, y: -9999, luz: 0 };
  var foco = null;            // elemento CTA sob o ponteiro/foco
  var despertar = { iniciado: false, t: 0 };
  var ultimoInput = agora();
  var dormindo = false, sobressalto = -99;
  var onda = { x: 0, y: 0, t: -99, forca: 0 };
  var glitch = { prox: 0, fim: 0, y0: 0, y1: 0, desl: 0 };
  var furia = { t: -99 };
  var retorno = -99;          // instante em que a aba voltou a ficar visível
  var pausadoPeloUsuario = false;
  var botaoPausa = document.querySelector('[data-abismo-pausa]');
  var tituloGuardado = null;
  var fpsEma = 60, intervaloEma = 1 / 60, lentoDesde = -1, rapidoDesde = -1, ultimaTrocaQ = 0;

  function lerPausaSalva() {
    try { return localStorage.getItem('abismo-pausa') === '1'; } catch (e) { return false; }
  }
  function gravarPausa(v) {
    try { if (v) localStorage.setItem('abismo-pausa', '1'); else localStorage.removeItem('abismo-pausa'); } catch (e) { /* modo privado: segue sem persistir */ }
  }

  /* ───────────────────────────── WebGL: utilitários ───────────────────────────── */
  function compilar(tipo, src) {
    var sh = gl.createShader(tipo);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('shader: ' + log);
    }
    return sh;
  }
  function programa(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compilar(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compilar(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    var cache = {};
    return {
      p: p,
      u: function (nome) {
        if (!(nome in cache)) cache[nome] = gl.getUniformLocation(p, nome);
        return cache[nome];
      }
    };
  }
  function texturaVazia(filtro) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtro);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtro);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /* ───────────────────────────── mensagens → textura ───────────────────────────── */
  var MSG_LARG = 128;
  function textoParaLinha(texto, buf, linha) {
    var unid = texto + '   ·   ';
    var n = Math.min(unid.length, MSG_LARG - 1);
    buf[linha * MSG_LARG] = n;
    for (var i = 0; i < n; i++) buf[linha * MSG_LARG + 1 + i] = indiceGlifo(unid.charAt(i));
  }
  function enviarMensagens() {
    if (!gl) return;
    var t = TXT[idioma()];
    var nLinhas = t.mensagens.length + 1;           // a última linha é o sussurro
    var buf = new Uint8Array(MSG_LARG * nLinhas);
    for (var i = 0; i < t.mensagens.length; i++) textoParaLinha(t.mensagens[i], buf, i);
    // sussurro: sem separador, comprimento exato
    var s = t.sussurro, base = (nLinhas - 1) * MSG_LARG;
    buf[base] = Math.min(s.length, MSG_LARG - 1);
    for (var k = 0; k < buf[base]; k++) buf[base + 1 + k] = indiceGlifo(s.charAt(k));
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, T.msg);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, MSG_LARG, nLinhas, 0, gl.RED, gl.UNSIGNED_BYTE, buf);
    T.msgTam = [MSG_LARG, nLinhas];
  }

  /* ───────────────────────────── dimensionamento ───────────────────────────── */
  var CELULA_Q = [1, 1, 1.25, 1.5];
  var DPR_Q = [2, 1.25, 1, 1];
  function dimensionar(forcar) {
    var w = window.innerWidth, h = window.innerHeight;
    // Barra de endereço do celular encolhe/estica a altura: mantém o canvas na
    // maior altura vista para a mesma largura (sem realocar a cada rolagem).
    if (w !== larguraMantida) { larguraMantida = w; alturaMantida = h; }
    else if (h > alturaMantida) alturaMantida = h;
    else if (!forcar && w === W && h <= alturaMantida && h >= alturaMantida - 180) { H = h; return false; }
    W = w; H = h;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_Q[qualidade]);
    var tetoPx = qualidade === 0 ? 8.5e6 : 3.2e6;
    if (W * alturaMantida * dpr * dpr > tetoPx) dpr = Math.max(1, Math.sqrt(tetoPx / (W * alturaMantida)));
    var base = W < 600 ? [7, 12] : (W >= 2200 ? [9, 16] : [8, 14]);
    tw = Math.max(5, Math.round(base[0] * CELULA_Q[qualidade] * dpr));
    th = Math.max(8, Math.round(base[1] * CELULA_Q[qualidade] * dpr));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(alturaMantida * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = alturaMantida + 'px';
    cols = Math.ceil(canvas.width / tw);
    linhas = Math.ceil(canvas.height / th);
    if (gl) {
      gl.bindTexture(gl.TEXTURE_2D, T.cena);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, linhas, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.cena, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      var atlas = desenharAtlas(tw, th);
      gl.bindTexture(gl.TEXTURE_2D, T.atlas);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    }
    medirLayout();
    return true;
  }

  function retanguloDoc(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
  }
  function medirLayout() {
    heroi = document.getElementById('top') || document.querySelector('.hero');
    var rh = heroi ? retanguloDoc(heroi) : { x: 0, y: 0, w: W, h: H };
    heroiDoc = rh;
    try {
      lay = CENA.layout({ W: W, H: H, heroi: rh, estreito: W < 920, toque: TOQUE });
    } catch (e) { erros.push('layout: ' + e.message); lay = null; }
    // criaturas: a presença sobrevive à remedição (redimensionar não as faz surgir de novo)
    var antigas = {};
    for (var a = 0; a < cris.length; a++) antigas[cris[a].tipo] = cris[a];
    try { cris = CENA.criaturas ? CENA.criaturas({ W: W, H: H, estreito: W < 920, toque: TOQUE }) : []; }
    catch (e) { erros.push('criaturas: ' + e.message); cris = []; }
    for (var c = 0; c < cris.length; c++) {
      var velha = antigas[cris[c].tipo];
      cris[c].pres = velha ? velha.pres : 0; cris[c].visto = velha ? velha.visto : false;
      cris[c].tAbre = velha ? velha.tAbre : NUNCA;
    }
    try { fronteiras = CENA.camadas ? CENA.camadas() : []; } catch (e) { fronteiras = []; }
    // véus: todos os da página; a cada quadro só os que estão na tela vão para a GPU (até 8)
    veus = [];
    var els = document.querySelectorAll('[data-abismo-veu]');
    for (var i = 0; i < els.length && veus.length < 48; i++) {
      var r = retanguloDoc(els[i]);
      if (r.w > 0 && r.h > 0) veus.push(r);
    }
    montarOlhos();
  }

  /* ───────────────────────────── olhos ───────────────────────────── */
  function montarOlhos() {
    var antigos = olhos;
    olhos = [];
    if (!lay || !lay.olhos) return;
    var lista = lay.olhos.slice(0, 64);
    for (var c = 0; c < cris.length; c++) {
      var oc = cris[c].olhos || [];
      for (var k = 0; k < oc.length; k++) { oc[k].cri = c; lista.push(oc[k]); }
    }
    for (var i = 0; i < lista.length && i < MAX_OLHOS; i++) {
      var d = lista[i];
      var a = antigos[i];
      olhos.push({
        ux: d.x, uy: d.y, rx: d.rx, ry: d.ry, ang: d.ang || 0, tipo: d.tipo || 0, peso: d.peso == null ? 0.6 : d.peso,
        // estado vivo (herdado se o layout só mudou de tamanho)
        abre: a ? a.abre : 0, pupX: a ? a.pupX : 0, pupY: a ? a.pupY : 0, dil: a ? a.dil : 0.35,
        sacX: 0, sacY: 0, proxSac: agora() + aleat(0.3, 2.0),
        proxPisca: agora() + aleat(2.0, 7.0), piscaIni: -99,
        atraso: aleat(0, 0.35) + (1 - (d.peso == null ? 0.6 : d.peso)) * 0.25,
        semente: Math.random() * 10, cx: 0, cy: 0, vis: 1,
        cri: d.cri == null ? -1 : d.cri, sangra: !!d.sangra, comp: d.comp || 0,
        tAbriu: a && a.cri === d.cri ? a.tAbriu : NUNCA
      });
    }
  }

  function ancoraViewport() {
    if (!lay) return { x: -9999, y: -9999 };
    return { x: lay.ancora.x - window.scrollX, y: lay.ancora.y - window.scrollY };
  }

  function dentroDeVeu(x, y) {
    var sy = window.scrollY;
    for (var i = 0; i < veus.length; i++) {
      var r = veus[i];
      if (x > r.x && x < r.x + r.w && y > r.y - sy && y < r.y - sy + r.h) return true;
    }
    return false;
  }

  function atualizarOlhos(t, dt) {
    if (!lay) return;
    var an = ancoraViewport(), esc = lay.escala;
    var acordado = despertar.iniciado;
    var furiaK = furiaNivel(t);
    var ocioso = (t - ultimoInput) > 12;
    var alvo = null;
    if (furiaK > 0.3 && ponteiro.presente) alvo = { x: ponteiro.x, y: ponteiro.y };
    else if (foco) { var rf = foco.getBoundingClientRect(); alvo = { x: rf.left + rf.width / 2, y: rf.top + rf.height / 2 }; }
    else if (ponteiro.presente && !ocioso && (t - retorno) > 1.2) alvo = { x: ponteiro.x, y: ponteiro.y };
    var piscaGeral = (t - sobressalto) < 0.2;

    for (var i = 0; i < olhos.length; i++) {
      var o = olhos[i];
      var cr = o.cri >= 0 ? cris[o.cri] : null;
      var e = cr ? cr.escala : esc;
      if (cr) { o.cx = cr.x - window.scrollX + o.ux * e; o.cy = cr.y - window.scrollY + o.uy * e; }
      else { o.cx = an.x + o.ux * esc; o.cy = an.y + o.uy * esc; }
      var rxPx = o.rx * e;
      // alvo do olhar → deslocamento da pupila no referencial do olho
      var ox = 0, oy = 0;
      if (alvo) {
        var dx = alvo.x - o.cx, dy = alvo.y - o.cy, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var k = dist / (dist + 140 + rxPx * 2);
        ox = dx / dist * k; oy = dy / dist * k;
        if (o.ang) { var c = Math.cos(-o.ang), s = Math.sin(-o.ang); var nx = c * ox - s * oy; oy = s * ox + c * oy; ox = nx; }
      }
      // sacadas: o olho nunca fica parado de verdade
      if (t > o.proxSac) {
        var amp = alvo ? 0.07 : 0.22;
        o.sacX = aleat(-amp, amp); o.sacY = aleat(-amp, amp) * 0.6;
        o.proxSac = t + aleat(alvo ? 0.5 : 0.9, alvo ? 2.2 : 3.2);
      }
      var rapidez = 4 + o.peso * 14;
      var a = 1 - Math.exp(-dt * rapidez / (1 + o.atraso * 3));
      o.pupX += (limitar(ox + o.sacX, -1, 1) - o.pupX) * a;
      o.pupY += (limitar(oy + o.sacY, -1, 1) - o.pupY) * a;

      // abertura: despertar em cascata, piscadas, sono, sobressalto, fúria
      var alvoAbre = 1;
      if (!acordado) alvoAbre = 0;
      else {
        var atrasoCascata = 0.12 + i * 0.07 + (1 - o.peso) * 0.35;
        var tc = t - despertar.t - atrasoCascata;
        alvoAbre = tc < 0 ? 0 : (tc < 0.35 ? 1.12 * (tc / 0.35) : (tc < 0.6 ? 1.12 - 0.12 * ((tc - 0.35) / 0.25) : 1));
      }
      if (cr) {
        // olho de criatura: só abre depois que ela termina de surgir, em cascata, e fica
        // cravado em você (abre de novo do mesmo jeito se a página for remedida)
        var tcr = cr.tAbre === NUNCA ? -1 : t - cr.tAbre - o.atraso * 0.8;
        if (acordado) alvoAbre = (tcr < 0 ? 0 : (tcr < 0.35 ? 1.12 * (tcr / 0.35) : (tcr < 0.6 ? 1.12 - 0.12 * ((tcr - 0.35) / 0.25) : 1)));
      }
      if (dormindo) alvoAbre = 0;
      if (furiaK > 0) alvoAbre = Math.max(alvoAbre, 1 + 0.18 * furiaK);
      if (o.tipo === 3) {
        // olho de rosto do mar: só abre sob a lanterna (ou na fúria)
        var dlx = lant.x - o.cx, dly = lant.y - o.cy, dl = Math.sqrt(dlx * dlx + dly * dly);
        var raio = TOQUE ? 160 : 230;
        var luzAqui = lant.luz * (1 - limitar((dl - raio * 0.35) / (raio * 0.75), 0, 1));
        alvoAbre = Math.min(alvoAbre, Math.max(luzAqui * 1.1, furiaK));
      }
      if (t > o.proxPisca && acordado && !dormindo) {
        o.piscaIni = t;
        o.proxPisca = t + (o.peso > 0.8 ? aleat(3.5, 9) : aleat(2.2, 7)) * (Math.random() < 0.15 ? 0.15 : 1);
      }
      var tp = t - o.piscaIni;
      var pisca = tp < 0.07 ? tp / 0.07 : (tp < 0.19 ? 1 - (tp - 0.07) / 0.12 : 0);
      if (piscaGeral) pisca = Math.max(pisca, 1 - (t - sobressalto) / 0.2);
      var velAbre = dormindo ? 0.9 : (alvoAbre > o.abre ? 9 : 14);
      o.abre += (alvoAbre - o.abre) * (1 - Math.exp(-dt * velAbre));
      var abreFinal = o.abre * (1 - pisca);
      if (o.sangra && o.tAbriu === NUNCA && o.abre > 0.6) o.tAbriu = t;

      // pupila: dilata no CTA e na fúria, contrai no susto
      var alvoDil = 0.34 + (foco ? 0.4 : 0) + furiaK * 0.5 - ((t - sobressalto) < 0.6 ? 0.25 : 0);
      o.dil += (limitar(alvoDil, 0.05, 1) - o.dil) * (1 - Math.exp(-dt * 5));

      // visibilidade: escurece sob véu de texto; some longe da tela
      var vis = dentroDeVeu(o.cx, o.cy) ? 0.28 : 1;
      if (o.tipo === 3) vis *= 0.85;
      if (cr) vis *= limitar(cr.pres * 1.4 - 0.4, 0, 1);
      o.vis += (vis - o.vis) * (1 - Math.exp(-dt * 6));

      var b = i * 12;
      dadosOlhos[b] = o.cx; dadosOlhos[b + 1] = o.cy;
      dadosOlhos[b + 2] = rxPx; dadosOlhos[b + 3] = o.ry * e;
      dadosOlhos[b + 4] = o.ang; dadosOlhos[b + 5] = abreFinal;
      dadosOlhos[b + 6] = o.pupX; dadosOlhos[b + 7] = o.pupY;
      dadosOlhos[b + 8] = o.dil; dadosOlhos[b + 9] = o.tipo;
      dadosOlhos[b + 10] = o.semente; dadosOlhos[b + 11] = o.vis;
    }
  }

  function furiaNivel(t) {
    var d = t - furia.t;
    if (d < 0 || d > 4.6) return 0;
    if (d < 0.7) return d / 0.7;
    if (d < 3.0) return 1;
    return 1 - (d - 3.0) / 1.6;
  }

  /* ───────────────────────────── WebGL: montagem ───────────────────────────── */
  function iniciarGL() {
    gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power'
    });
    if (!gl) throw new Error('sem WebGL2');
    // Renderizador por software (SwiftShader, llvmpipe, WARP...): começa no
    // degrau mais leve em vez de descobrir isso travando a página.
    try {
      var info = gl.getExtension('WEBGL_debug_renderer_info');
      var rend = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      if (/swiftshader|llvmpipe|softpipe|software|basic render|warp/i.test(rend)) { qualidade = 3; erros.push('renderizador por software: ' + rend.slice(0, 80)); }
    } catch (e) { /* sem a extensão: segue na qualidade normal */ }
    P.cena = programa(VS_TELA, CABECALHO_CENA + '\n' + LIMBO_GEO + '\n' + CENA.glsl + '\n' + PRINCIPAL_CENA);
    P.hd = programa(VS_TELA, FS_HD);
    P.tela = programa(VS_TELA, FS_TELA);
    P.olho = programa(VS_OLHO, FS_OLHO);

    T.cena = texturaVazia(gl.LINEAR);
    T.fb = gl.createFramebuffer();
    T.atlas = texturaVazia(gl.NEAREST);
    T.msg = texturaVazia(gl.NEAREST);
    T.tex = [texturaVazia(gl.LINEAR), texturaVazia(gl.LINEAR), texturaVazia(gl.LINEAR), texturaVazia(gl.LINEAR)];
    T.texPronta = [0, 0, 0, 0];
    for (var k = 0; k < 4; k++) {
      gl.bindTexture(gl.TEXTURE_2D, T.tex[k]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    }
    carregarTexturas();

    T.vaoTela = gl.createVertexArray();
    // olhos: quad (2 triângulos) + atributos por instância
    T.vaoOlho = gl.createVertexArray();
    gl.bindVertexArray(T.vaoOlho);
    var quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    var locCanto = gl.getAttribLocation(P.olho.p, 'aCanto');
    gl.enableVertexAttribArray(locCanto);
    gl.vertexAttribPointer(locCanto, 2, gl.FLOAT, false, 0, 0);
    T.bufOlhos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, T.bufOlhos);
    gl.bufferData(gl.ARRAY_BUFFER, dadosOlhos.byteLength, gl.DYNAMIC_DRAW);
    ['aA', 'aB', 'aC'].forEach(function (nome, idx) {
      var loc = gl.getAttribLocation(P.olho.p, nome);
      if (loc < 0) return;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 48, idx * 16);
      gl.vertexAttribDivisor(loc, 1);
    });
    gl.bindVertexArray(null);

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      erros.push('contexto WebGL perdido');
      parar();
      iniciarFallback2D('contexto WebGL perdido');
    }, false);
  }

  function carregarTexturas() {
    ['tex0', 'tex1', 'tex2', 'tex3'].forEach(function (nome, k) {
      var arq = CENA.texturas && CENA.texturas[nome];
      if (!arq) return;
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        if (!gl) return;
        gl.bindTexture(gl.TEXTURE_2D, T.tex[k]);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
        T.texPronta[k] = 1;
        if (modo !== 'pleno') desenharQuadro(agora());
      };
      img.onerror = function () { erros.push('textura não carregou: ' + arq); };
      img.src = arq;
    });
  }

  /* ───────────────────────────── render ───────────────────────────── */
  function u2(prog, nome, a, b) { gl.uniform2f(prog.u(nome), a, b); }
  function u1(prog, nome, a) { gl.uniform1f(prog.u(nome), a); }

  var veusBuf = new Float32Array(32), olhosBuf = new Float32Array(128);
  function prepararVeus() {
    var sy = window.scrollY, n = 0;
    for (var i = 0; i < veus.length && n < 8; i++) {
      var r = veus[i], y = r.y - sy;
      if (y > H + 40 || y + r.h < -40) continue;
      veusBuf[n * 4] = r.x - window.scrollX; veusBuf[n * 4 + 1] = y; veusBuf[n * 4 + 2] = r.w; veusBuf[n * 4 + 3] = r.h;
      n++;
    }
    return n;
  }

  /* Criaturas surgem quando a sua seção entra na tela (≥ 22% da altura) e não somem mais. */
  function atualizarCriaturas(t, dt) {
    var sy = window.scrollY;
    for (var i = 0; i < cris.length; i++) {
      var cr = cris[i], g = cr.gatilho;
      if (!cr.visto && g) {
        var dentro = Math.min(g.y + g.h, sy + H) - Math.max(g.y, sy);
        if (dentro > H * 0.22 || dentro > g.h * 0.6) cr.visto = true;
      }
      if (cr.visto && cr.pres < 1) cr.pres = Math.min(1, cr.pres + dt / 1.7);
      if (cr.pres >= 0.8 && cr.tAbre === NUNCA) cr.tAbre = t;
    }
  }

  /* Qual camada está na tela: passar pela fronteira k faz a camada k subir do fundo ao longo
     de 0,9 tela de rolagem. Devolve [de cima, a que sobe, quanto subiu]. */
  var camadaBuf = [0, 0, 0], rolCam = new Float32Array(4);
  function estadoCamadas() {
    var sy = window.scrollY, ref = sy + H * 0.75;
    camadaBuf[0] = 0; camadaBuf[1] = 0; camadaBuf[2] = 0;
    if (window.__abismo && window.__abismo.camadaFixa != null) {   // depuração: uma camada só
      camadaBuf[0] = camadaBuf[1] = window.__abismo.camadaFixa; return camadaBuf;
    }
    for (var k = 0; k < fronteiras.length; k++) {
      var m = limitar((ref - fronteiras[k]) / (H * 0.9), 0, 1);
      rolCam[k] = Math.max(0, sy + H - fronteiras[k]);
      if (m >= 1) { camadaBuf[0] = k + 1; camadaBuf[1] = k + 1; continue; }
      if (m > 0 && camadaBuf[2] === 0) { camadaBuf[1] = k + 1; camadaBuf[2] = m; }
    }
    if (camadaBuf[2] === 0) camadaBuf[1] = camadaBuf[0];
    return camadaBuf;
  }

  /* Campo do Limbo: horizonte sobe devagar ao descer; rostos grandes e poucos na frente (é
     onde a gravura mostra o detalhe). [horizonte, profundidade, z0, razão, meia-largura z=1, nariz] */
  var limboBuf = [0, 0, 0, 0, 0, 0];
  function geometriaLimbo() {
    var S = Math.min(W, H), rol = rolCam[0] || 0;
    limboBuf[0] = limitar(H * 0.40 - rol * 0.04, H * 0.22, H * 0.46);
    limboBuf[1] = H * 0.06; limboBuf[2] = 0.11; limboBuf[3] = 1.5;
    limboBuf[4] = S * (W < 600 ? 0.05 : 0.036); limboBuf[5] = 1.5;
    return limboBuf;
  }

  var criA = new Float32Array(24), criB = new Float32Array(24), sangA = new Float32Array(64), sangB = new Float32Array(64);
  function prepararCriaturas() {
    var n = 0, sx = window.scrollX, sy = window.scrollY;
    for (var i = 0; i < cris.length && n < 6; i++) {
      var cr = cris[i];
      cr.naTela = false;
      if (cr.pres < 0.01) continue;
      var x = cr.x - sx, y = cr.y - sy, e = cr.escala, ex = cr.ext;
      if (x + ex[2] * e < -40 || x + ex[0] * e > W + 40 || y + ex[3] * e < -40 || y + ex[1] * e > H + 40) continue;
      cr.naTela = true;
      criA[n * 4] = x; criA[n * 4 + 1] = y; criA[n * 4 + 2] = e; criA[n * 4 + 3] = cr.tipo;
      criB[n * 4] = cr.pres; criB[n * 4 + 1] = (cr.tipo * 0.618034) % 1; criB[n * 4 + 2] = cr.p1; criB[n * 4 + 3] = cr.p2;
      n++;
    }
    return n;
  }
  function prepararSangue() {
    var n = 0;
    for (var i = 0; i < olhos.length && n < 16; i++) {
      var o = olhos[i];
      if (!o.sangra || o.tAbriu === NUNCA || o.cri < 0) continue;
      var cr = cris[o.cri];
      if (!cr || !cr.naTela) continue;
      var rx = o.rx * cr.escala;
      sangA[n * 4] = o.cx; sangA[n * 4 + 1] = o.cy; sangA[n * 4 + 2] = rx; sangA[n * 4 + 3] = o.tAbriu - t0;
      sangB[n * 4] = cr.pres; sangB[n * 4 + 1] = o.semente; sangB[n * 4 + 2] = o.comp; sangB[n * 4 + 3] = 0;
      n++;
    }
    return n;
  }

  var quadrosDesenhados = 0;
  function desenharQuadro(t) {
    if (!gl || gl.isContextLost()) return;
    quadrosDesenhados++;
    var tempo = t - t0;
    var an = ancoraViewport();
    var nVeus = prepararVeus();
    var nOlhos = Math.min(olhos.length, 32);
    for (var i = 0; i < nOlhos; i++) {
      olhosBuf[i * 4] = dadosOlhos[i * 12]; olhosBuf[i * 4 + 1] = dadosOlhos[i * 12 + 1];
      olhosBuf[i * 4 + 2] = dadosOlhos[i * 12 + 2]; olhosBuf[i * 4 + 3] = dadosOlhos[i * 12 + 5];
    }
    // hero no viewport a partir do retângulo em cache (sem forçar layout a cada quadro)
    var rh = { left: heroiDoc.x - window.scrollX, top: heroiDoc.y - window.scrollY, width: heroiDoc.w, height: heroiDoc.h };
    var celCss = [tw / dpr, th / dpr];
    var furiaK = furiaNivel(t);
    var ocio = dormindo ? 1 : limitar(((t - ultimoInput) - 12) / 33, 0, 1);
    var raioLant = (TOQUE ? 160 : 230) * (1 + furiaK * 1.6);

    // ── passo 1: cena por célula
    gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
    gl.viewport(0, 0, cols, linhas);
    var pc = P.cena;
    gl.useProgram(pc.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, T.msg);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, T.tex[0]);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, T.tex[1]);
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, T.tex[2]);
    gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, T.tex[3]);
    gl.uniform1i(pc.u('uMsg'), 2); gl.uniform1i(pc.u('uTex0'), 3); gl.uniform1i(pc.u('uTex1'), 4);
    gl.uniform1i(pc.u('uTex2'), 5); gl.uniform1i(pc.u('uTex3'), 6);
    u2(pc, 'uRes', W, H); u2(pc, 'uCel', celCss[0], celCss[1]); u2(pc, 'uGrade', cols, linhas);
    u1(pc, 'uTempo', tempo);
    gl.uniform4f(pc.u('uPonteiro'), ponteiro.x, ponteiro.y, ponteiro.presente ? 1 : 0, ponteiro.vel);
    gl.uniform3f(pc.u('uLanterna'), lant.x, lant.y, raioLant);
    u1(pc, 'uLuz', lant.luz);
    u1(pc, 'uRolagem', window.scrollY);
    gl.uniform4f(pc.u('uHeroi'), rh.left, rh.top, rh.width, rh.height);
    u2(pc, 'uAncora', an.x, an.y);
    u1(pc, 'uEscala', lay ? lay.escala : 0);
    u1(pc, 'uDespertar', despertar.iniciado ? limitar((t - despertar.t) / 1.2, 0, 1) : 0);
    u1(pc, 'uOcio', ocio);
    u1(pc, 'uFuria', furiaK);
    gl.uniform4f(pc.u('uOnda'), onda.x, onda.y, onda.t - t0, (t - onda.t) < 2.5 ? onda.forca : 0);
    var gAtivo = t < glitch.fim ? 1 : 0;
    gl.uniform4f(pc.u('uGlitch'), glitch.y0, glitch.y1, glitch.desl, gAtivo);
    gl.uniform4fv(pc.u('uVeus'), veusBuf); gl.uniform1i(pc.u('uNVeus'), nVeus);
    gl.uniform4fv(pc.u('uOlhos'), olhosBuf); gl.uniform1i(pc.u('uNOlhos'), nOlhos);
    u2(pc, 'uMsgTam', T.msgTam[0], T.msgTam[1]);
    var sus = lay && lay.sussurro ? lay.sussurro : { x: 0, y: 1.4 };
    var intensSus = (!dormindo && ocio > 0 && ocio < 1) ? limitar(ocio * 2.2, 0, 1) : 0;
    gl.uniform4f(pc.u('uSussurro'), an.x + sus.x * (lay ? lay.escala : 0), an.y + sus.y * (lay ? lay.escala : 0), intensSus, 0);
    var hdPronto = T.texPronta[2] && T.texPronta[3] ? 1 : 0;
    gl.uniform4f(pc.u('uTexInfo'), T.texPronta[0], T.texPronta[1], hdPronto, 0);
    var lb = geometriaLimbo();
    gl.uniform4f(pc.u('uLimbo1'), lb[0], lb[1], lb[2], lb[3]); gl.uniform4f(pc.u('uLimbo2'), lb[4], lb[5], 0, 0);
    u1(pc, 'uSemente', semente);
    var cb = estadoCamadas();
    gl.uniform4f(pc.u('uCamada'), cb[0], cb[1], cb[2], 0);
    gl.uniform4fv(pc.u('uRolCam'), rolCam);
    var nCri = prepararCriaturas();
    gl.uniform4fv(pc.u('uCriA'), criA); gl.uniform4fv(pc.u('uCriB'), criB); gl.uniform1i(pc.u('uNCri'), nCri);
    var nSang = prepararSangue();
    gl.uniform4fv(pc.u('uSangA'), sangA); gl.uniform4fv(pc.u('uSangB'), sangB); gl.uniform1i(pc.u('uNSang'), nSang);
    gl.bindVertexArray(T.vaoTela);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ── passo 2: tela
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    var pt = P.tela;
    gl.useProgram(pt.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T.cena);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T.atlas);
    gl.uniform1i(pt.u('uCena'), 0); gl.uniform1i(pt.u('uAtlas'), 1);
    u2(pt, 'uResPx', canvas.width, canvas.height); u2(pt, 'uCelPx', tw, th); u2(pt, 'uGrade', cols, linhas);
    u1(pt, 'uDpr', dpr);
    gl.uniform3f(pt.u('uLanterna'), lant.x, lant.y, raioLant);
    u1(pt, 'uLuz', lant.luz); u1(pt, 'uTempo', tempo); u1(pt, 'uAberracao', 0.7);
    gl.uniform3f(pt.u('uFundo'), 0.031, 0.016, 0.02);
    gl.uniform4fv(pt.u('uVeus'), veusBuf); gl.uniform1i(pt.u('uNVeus'), nVeus);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ── passo 2b: gravura dos rostos (só quando o Limbo ou o Andarilho estão na tela)
    var and = null;
    for (var a = 0; a < cris.length; a++) if (cris[a].tipo === 7 && cris[a].naTela) and = cris[a];
    if (hdPronto && (cb[0] === 1 || cb[1] === 1 || and)) {
      var ph = P.hd;
      gl.useProgram(ph.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T.cena);
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, T.tex[2]);
      gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, T.tex[3]);
      gl.uniform1i(ph.u('uCena'), 0); gl.uniform1i(ph.u('uRN'), 5); gl.uniform1i(ph.u('uRM'), 6);
      u2(ph, 'uResPx', canvas.width, canvas.height); u2(ph, 'uCelPx', tw, th); u2(ph, 'uGrade', cols, linhas);
      u1(ph, 'uDpr', dpr); u1(ph, 'uTempo', tempo);
      gl.uniform3f(ph.u('uLanterna'), lant.x, lant.y, raioLant); u1(ph, 'uLuz', lant.luz);
      gl.uniform3f(ph.u('uFundo'), 0.031, 0.016, 0.02);
      gl.uniform4f(ph.u('uLimbo1'), lb[0], lb[1], lb[2], lb[3]); gl.uniform4f(ph.u('uLimbo2'), lb[4], lb[5], 0, 0);
      if (and) gl.uniform4f(ph.u('uAnd'), and.x - window.scrollX, and.y - window.scrollY, and.escala, and.pres);
      else gl.uniform4f(ph.u('uAnd'), 0, 0, 1, 0);
      gl.uniform4fv(ph.u('uVeus'), veusBuf); gl.uniform1i(ph.u('uNVeus'), nVeus);
      gl.bindVertexArray(T.vaoTela);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // ── passo 3: olhos
    if (olhos.length) {
      var po = P.olho;
      gl.useProgram(po.p);
      u2(po, 'uRes', W, H); u1(po, 'uTempo', tempo); u1(po, 'uDpr', dpr);
      gl.bindVertexArray(T.vaoOlho);
      gl.bindBuffer(gl.ARRAY_BUFFER, T.bufOlhos);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, dadosOlhos.subarray(0, olhos.length * 12));
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, olhos.length);
      gl.disable(gl.BLEND);
    }
    gl.bindVertexArray(null);
  }

  /* ───────────────────────────── laço, ócio, qualidade ───────────────────────────── */
  function intervaloAlvo() {
    if (dormindo) return 1 / 20;
    if (TOQUE || qualidade >= 2) return 1 / 30;
    if (qualidade >= 3) return 1 / 20;
    return 1 / 60;
  }

  function quadro(ms) {
    if (!rodando) return;
    rafId = requestAnimationFrame(quadro);
    var t = ms / 1000;
    var alvo = intervaloAlvo();
    if (tQuadroUlt && t - tQuadroUlt < alvo * 0.92) return;
    var dt = tQuadroUlt ? Math.min(t - tQuadroUlt, 0.1) : 1 / 60;
    if (tQuadroUlt) adaptarQualidade(t, t - tQuadroUlt, alvo);
    tQuadroUlt = t;
    passo(agora(), dt);
  }

  function passo(t, dt) {
    // despertar automático: quem não mexe o mouse também vê os olhos abrirem
    if (!despertar.iniciado && (t - t0) > (TOQUE ? 1.4 : 3.2)) acordar(t);
    // ócio → olhar de frente; sono profundo → olhos se fecham
    var parado = t - ultimoInput;
    if (!dormindo && parado > 45 && despertar.iniciado) dormindo = true;
    // lanterna segue o ponteiro com um leve atraso (peso de lamparina)
    var k = 1 - Math.exp(-dt * 16);
    if (ponteiro.presente) {
      if (lant.x < -9000) { lant.x = ponteiro.x; lant.y = ponteiro.y; }
      lant.x += (ponteiro.x - lant.x) * k; lant.y += (ponteiro.y - lant.y) * k;
    }
    var semMover = t - ponteiro.ultimoMov;
    var alvoLuz = !ponteiro.presente ? 0 : (semMover < (TOQUE ? 2.5 : 5) ? 1 : 0.22);
    if (dormindo) alvoLuz = 0;
    lant.luz += (alvoLuz - lant.luz) * (1 - Math.exp(-dt * (alvoLuz > lant.luz ? 6 : 1.2)));
    ponteiro.vel *= Math.exp(-dt * 6);
    // glitch ocasional (só deslocamento)
    if (t > glitch.prox) {
      glitch.fim = t + aleat(0.11, 0.24);
      glitch.y0 = Math.floor(Math.random() * linhas);
      glitch.y1 = glitch.y0 + Math.floor(aleat(0, 3.99));
      glitch.desl = (Math.random() < 0.5 ? -1 : 1) * Math.floor(aleat(2, 10));
      glitch.prox = t + aleat(6, 15);
    }
    atualizarCriaturas(t, dt);
    atualizarOlhos(t, dt);
    desenharQuadro(t);
  }

  var lentosSeguidos = 0, inicioLaco = 0;
  function adaptarQualidade(t, intervalo, alvo) {
    if (document.hidden) return;
    // Aquecimento: os primeiros quadros pagam compilação de shader, carga de
    // fonte e layout — não dizem nada sobre a máquina. Só o caso catastrófico
    // (abaixo) conta nesse período.
    var aquecendo = (t - inicioLaco) < 2.5;
    // Média ponderada pelo TEMPO (não pelo nº de quadros): com quadros de 1 s,
    // uma média por quadro levaria dezenas de segundos para reagir. Um engasgo
    // isolado (> 1 s: aba em segundo plano, depurador) não entra na média.
    if (intervalo < 1 && !aquecendo) {
      var peso = 1 - Math.exp(-intervalo / 0.6);
      intervaloEma += (intervalo - intervaloEma) * peso;
      fpsEma = 1 / Math.max(intervaloEma, 1e-3);
    }
    // Freio de emergência: três quadros SEGUIDOS acima de 200 ms = máquina sem
    // fôlego (GPU por software, 4K numa integrada). Desce dois degraus de uma
    // vez; no último degrau, congela num quadro estático para não travar a página.
    if (intervalo > 0.2 && (!aquecendo || intervalo > 1)) {
      if (++lentosSeguidos >= 3) {
        lentosSeguidos = 0;
        if (qualidade >= 3) { modoLeve('quadros acima de 200 ms mesmo na qualidade mínima'); return; }
        qualidade = Math.min(3, qualidade + 2); ultimaTrocaQ = t; lentoDesde = -1; intervaloEma = alvo;
        dimensionar(true);
        return;
      }
    } else lentosSeguidos = 0;
    if (aquecendo) return;
    if (intervaloEma > alvo * 1.45) {
      if (lentoDesde < 0) lentoDesde = t;
      rapidoDesde = -1;
      if (t - lentoDesde > 1.6 && qualidade < 3 && t - ultimaTrocaQ > 2) {
        qualidade++; ultimaTrocaQ = t; lentoDesde = -1; intervaloEma = alvo;
        dimensionar(true);
      }
    } else if (intervaloEma < alvo * 1.05 && qualidade > 0) {
      lentoDesde = -1;
      if (rapidoDesde < 0) rapidoDesde = t;
      if (t - rapidoDesde > 12 && t - ultimaTrocaQ > 20) {
        qualidade--; ultimaTrocaQ = t; rapidoDesde = -1;
        dimensionar(true);
      }
    } else { lentoDesde = -1; }
  }

  function iniciarLaco() {
    if (rodando) return;
    rodando = true; tQuadroUlt = 0; inicioLaco = agora();
    rafId = requestAnimationFrame(quadro);
  }
  function parar() {
    rodando = false;
    cancelAnimationFrame(rafId);
  }

  /* Quadro estático (reduced-motion e pausa): olhos abertos, de frente, sem
     lanterna nem glitch. É o retrato de Argos olhando para quem chegou. */
  function quadroEstatico() {
    if (!gl) return;
    var t = agora();
    despertar.iniciado = true; despertar.t = t - 10;
    dormindo = false;
    lant.luz = 0;
    glitch.fim = 0;
    var salvoPresente = ponteiro.presente, salvoFoco = foco;
    ponteiro.presente = false; foco = null;
    for (var i = 0; i < olhos.length; i++) {
      var o = olhos[i];
      o.abre = o.tipo === 3 ? 0 : 1; o.pupX = 0; o.pupY = 0; o.sacX = 0; o.sacY = 0; o.dil = 0.34;
      o.proxPisca = t + 999; o.piscaIni = -99; o.proxSac = t + 999;
    }
    sobressalto = -99;
    for (var c = 0; c < cris.length; c++) { cris[c].visto = true; cris[c].pres = 1; cris[c].tAbre = t - 30; }
    for (var j = 0; j < olhos.length; j++) if (olhos[j].sangra) olhos[j].tAbriu = t - 30;
    atualizarOlhos(t, 2);   // dt grande: tudo converge de uma vez para o retrato
    desenharQuadro(t);
    ponteiro.presente = salvoPresente; foco = salvoFoco;
  }

  function modoLeve(motivo) {
    erros.push('modo leve: ' + motivo);
    parar();
    modo = 'leve';
    mostrarPausa(false);
    quadroEstatico();
  }

  function acordar(t) {
    if (despertar.iniciado) return;
    despertar.iniciado = true;
    despertar.t = t;
  }

  /* ───────────────────────────── entrada ───────────────────────────── */
  var SELETOR_FOCO = '.btn-wa, .wa-fab, [data-abismo-foco]';
  var SELETOR_INTERATIVO = 'a, button, input, select, textarea, label, summary, [role="button"], [tabindex]';

  function registrarInput(t) {
    ultimoInput = t;
    if (dormindo) { dormindo = false; sobressalto = t; }
    if (modo === 'pleno') acordar(t);
  }

  function ligarEntrada() {
    window.addEventListener('pointermove', function (e) {
      var t = agora();
      if (ponteiro.presente) {
        var dx = e.clientX - ponteiro.x, dy = e.clientY - ponteiro.y;
        var dtm = Math.max(t - ponteiro.ultimoMov, 1 / 240);
        ponteiro.vel = Math.min(Math.sqrt(dx * dx + dy * dy) / dtm, 6000);
      }
      ponteiro.x = e.clientX; ponteiro.y = e.clientY;
      ponteiro.presente = true; ponteiro.ultimoMov = t;
      registrarInput(t);
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) {
      var t = agora();
      ponteiro.x = e.clientX; ponteiro.y = e.clientY; ponteiro.presente = true; ponteiro.ultimoMov = t;
      registrarInput(t);
      var alvo = e.target && e.target.closest ? e.target.closest(SELETOR_INTERATIVO) : null;
      if (!alvo && modo === 'pleno') {
        onda.x = e.clientX; onda.y = e.clientY; onda.t = t; onda.forca = 1;
        sobressalto = t;                       // os olhos se encolhem com o "toque"
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { ponteiro.presente = false; }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { ponteiro.presente = false; }, { passive: true });
    // Fundo parado (pausa / reduced-motion): a rolagem redesenha o quadro estático da nova
    // profundidade — no máximo a cada 120 ms enquanto rola (a rolagem suave dispara eventos sem
    // parar; só "esperar parar" deixava o fundo congelado na camada antiga) e uma última vez no fim.
    var tmRolagem = 0, ultimoEstatico = 0;
    function redesenharParado() {
      if (!gl || modo === 'pleno') return;
      ultimoEstatico = agora();
      quadroEstatico();
    }
    window.addEventListener('scroll', function () {
      registrarInput(agora());
      if (gl && modo !== 'pleno') {
        clearTimeout(tmRolagem);
        tmRolagem = setTimeout(redesenharParado, 140);
        if (agora() - ultimoEstatico > 0.12) requestAnimationFrame(redesenharParado);
      }
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(SELETOR_FOCO) : null;
      if (el) foco = el;
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(SELETOR_FOCO) : null;
      if (el && el === foco && !(e.relatedTarget && el.contains(e.relatedTarget))) foco = null;
    }, { passive: true });
    document.addEventListener('focusin', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(SELETOR_FOCO) : null;
      foco = el || null;
      registrarInput(agora());
    });
    document.addEventListener('focusout', function () { foco = null; });

    // Easter egg: digitar "argos" (ou o código Konami) desperta a fúria do vigia.
    var buffer = '', konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], kIdx = 0;
    document.addEventListener('keydown', function (e) {
      var t = agora();
      registrarInput(t);
      var k = e.key || '';
      kIdx = (k === konami[kIdx] || k.toLowerCase() === konami[kIdx]) ? kIdx + 1 : (k === konami[0] ? 1 : 0);
      if (k.length === 1) buffer = (buffer + k.toLowerCase()).slice(-8);
      if (kIdx === konami.length || /argos$/.test(buffer)) {
        kIdx = 0; buffer = '';
        if (modo === 'pleno') { furia.t = t; acordar(t); }
      }
    });
  }

  /* ───────────────────────────── visibilidade e título ───────────────────────────── */
  function ligarVisibilidade() {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        tituloGuardado = document.title;
        document.title = TXT[idioma()].tituloOculto;
        parar();
      } else {
        if (tituloGuardado !== null && (document.title === TXT.pt.tituloOculto || document.title === TXT.en.tituloOculto)) {
          document.title = tituloGuardado;
        }
        tituloGuardado = null;
        var t = agora();
        retorno = t;
        // voltou: todos os olhos abrem de uma vez, olhando para você
        dormindo = false; ultimoInput = t;
        if (modo === 'pleno') {
          for (var i = 0; i < olhos.length; i++) { olhos[i].abre = 1.15; olhos[i].pupX *= 0.2; olhos[i].pupY *= 0.2; }
          iniciarLaco();
        }
      }
    });
  }

  /* ───────────────────────────── pausa (WCAG 2.2.2) ───────────────────────────── */
  function rotularPausa() {
    if (!botaoPausa) return;
    var t = TXT[idioma()];
    var pausado = modo === 'pausado';
    var txt = botaoPausa.querySelector('.abismo-pausa-txt');
    if (txt) txt.textContent = pausado ? t.retomar : t.pausar;
    botaoPausa.setAttribute('aria-pressed', pausado ? 'true' : 'false');
    botaoPausa.setAttribute('aria-label', pausado ? t.retomarAria : t.pausarAria);
    botaoPausa.setAttribute('title', pausado ? t.retomar : t.pausar);
    botaoPausa.setAttribute('data-estado', pausado ? 'pausado' : 'ativo');
  }
  function mostrarPausa(visivel) {
    if (!botaoPausa) return;
    if (visivel) botaoPausa.removeAttribute('hidden'); else botaoPausa.setAttribute('hidden', '');
  }
  function aplicarPausa(pausar) {
    if (modo === 'fallback') { fallback.pausar(pausar); gravarPausa(pausar); rotularPausa(); return; }
    if (pausar) {
      parar();
      modo = 'pausado';
      quadroEstatico();
    } else {
      modo = 'pleno';
      t0 = agora() - 30; // não reencena o despertar; os olhos já estão abertos
      iniciarLaco();
    }
    gravarPausa(pausar);
    rotularPausa();
  }
  if (botaoPausa) {
    botaoPausa.addEventListener('click', function () {
      pausadoPeloUsuario = !(modo === 'pausado' || (modo === 'fallback' && fallback.pausado));
      aplicarPausa(pausadoPeloUsuario);
    });
  }

  /* ───────────────────────────── fallback 2D ─────────────────────────────
     Sem WebGL2 (ou se o contexto cair): a chuva de binários vermelha antiga,
     num canvas NOVO (um canvas que já teve contexto WebGL não aceita 2D).  */
  var fallback = { pausado: false, pausar: function () { } };
  function iniciarFallback2D(motivo) {
    modo = 'fallback';
    if (motivo) erros.push('fallback: ' + motivo);
    var novo = document.createElement('canvas');
    novo.id = 'abismo';
    novo.setAttribute('aria-hidden', 'true');
    canvas.parentNode.replaceChild(novo, canvas);
    canvas = novo; gl = null;
    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) { modo = 'desligado'; mostrarPausa(false); return; }
    var D = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, fs = 16, n = 0, gotas = [], vels = [];
    function reset() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * D); canvas.height = Math.floor(h * D);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(D, 0, 0, D, 0, 0);
      fs = w < 600 ? 13 : 16; n = Math.ceil(w / fs);
      gotas = []; vels = [];
      for (var i = 0; i < n; i++) { gotas.push(Math.random() * h / fs); vels.push(0.4 + Math.random() * 0.7); }
    }
    reset();
    var ultimo = 0, ativo = false, id = 0;
    function desenhar(ms) {
      if (!ativo) return;
      id = requestAnimationFrame(desenhar);
      if (ms - ultimo < 1000 / 30) return;
      ultimo = ms;
      ctx.fillStyle = 'rgba(8, 4, 5, 0.10)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '600 ' + fs + 'px "JetBrains Mono", monospace';
      for (var i = 0; i < n; i++) {
        var y = gotas[i] * fs;
        ctx.fillStyle = Math.random() < 0.03 ? 'rgba(244, 234, 231, 0.40)' : 'rgba(227, 23, 46, ' + (0.22 + Math.random() * 0.24) + ')';
        ctx.fillText(Math.random() < 0.5 ? '0' : '1', i * fs, y);
        gotas[i] += vels[i];
        if (y > h && Math.random() > 0.975) { gotas[i] = Math.random() * -20; vels[i] = 0.4 + Math.random() * 0.7; }
      }
    }
    function ligar() { if (ativo || fallback.pausado || MQ_REDUZIDO.matches || document.hidden) return; ativo = true; id = requestAnimationFrame(desenhar); }
    function desligar() { ativo = false; cancelAnimationFrame(id); }
    fallback.pausar = function (v) { fallback.pausado = v; if (v) desligar(); else ligar(); };
    fallback.pausado = lerPausaSalva();
    window.addEventListener('resize', function () { reset(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) desligar(); else ligar(); });
    if (MQ_REDUZIDO.matches) { mostrarPausa(false); return; }
    mostrarPausa(true); rotularPausa();
    ligar();
  }

  /* ───────────────────────────── sonda da descida ─────────────────────────────
     DOM puro (vale também no fallback 2D): a marca desce pelo trilho na proporção da rolagem e
     diz o nome da camada atual e uma "profundidade" — ficção de ambientação, não medida. */
  var sonda = document.querySelector('.abismo-sonda');
  var sondaMarca = sonda && sonda.querySelector('.sonda-marca');
  var sondaCam = sonda && sonda.querySelector('.sonda-camada');
  var sondaProf = sonda && sonda.querySelector('.sonda-prof');
  var sondaPend = false;
  function atualizarSonda() {
    sondaPend = false;
    if (!sonda || !sondaMarca) return;
    var fr = fronteiras.length ? fronteiras : (CENA.camadas ? CENA.camadas() : []);
    var alt = document.documentElement.scrollHeight - window.innerHeight;
    var f = alt > 0 ? limitar(window.scrollY / alt, 0, 1) : 0;
    var ref = window.scrollY + window.innerHeight * 0.5, cam = 0;
    for (var k = 0; k < fr.length; k++) if (ref >= fr[k]) cam = k + 1;
    sondaMarca.style.transform = 'translateY(' + (f * sonda.clientHeight).toFixed(1) + 'px)';
    var nomes = TXT[idioma()].camadas;
    if (sondaCam) sondaCam.textContent = nomes[Math.min(cam, nomes.length - 1)];
    if (sondaProf) sondaProf.textContent = '−' + String(Math.round(window.scrollY * 0.66)).replace(/\B(?=(\d{3})+(?!\d))/g, idioma() === 'en' ? ',' : '.') + ' m';
  }
  function pedirSonda() { if (!sondaPend) { sondaPend = true; requestAnimationFrame(atualizarSonda); } }
  if (sonda) {
    sonda.removeAttribute('hidden');
    window.addEventListener('scroll', pedirSonda, { passive: true });
    window.addEventListener('resize', pedirSonda);
    if (window.MutationObserver) new MutationObserver(pedirSonda).observe(html, { attributes: true, attributeFilter: ['data-lang'] });
    pedirSonda();
  }

  /* ───────────────────────────── console (para quem abre o DevTools) ───────────────────────────── */
  function recadoNoConsole() {
    try {
      var t = TXT[idioma()].console;
      var arte = [
        '                 _.--""""""--._',
        '             .-"   1 0 1 1 0    "-.',
        '          .\'  0  .-""""""""-.  1   \'.',
        '         /  1  .\'   .----.   \'.  0  \\',
        '        ;  0  /    /  ()  \\    \\  1  ;',
        '        |  1 |    |  (())  |    | 0  |',
        '        ;  0  \\    \\  ()  /    /  1  ;',
        '         \\  1  \'.   \'----\'   .\'  0  /',
        '          \'.  0  \'-........-\'  1  .\'',
        '             \'-.   0 1 1 0 1    .-\'',
        '                 \'--........--\''
      ].join('\n');
      console.log('%c' + arte, 'color:#e3172e;font-family:monospace;font-size:11px;line-height:1.15');
      console.log('%c' + t[0], 'color:#ff3b4e;font:700 15px monospace;letter-spacing:.12em');
      console.log('%c' + t.slice(1).join('\n'), 'color:#dccbc7;font:12px/1.6 monospace');
    } catch (e) { /* console indisponível: sem problema */ }
  }

  /* ───────────────────────────── idioma ───────────────────────────── */
  function ligarIdioma() {
    if (!window.MutationObserver) return;
    new MutationObserver(function () {
      rotularPausa();
      if (gl) { enviarMensagens(); if (modo !== 'pleno') desenharQuadro(agora()); }
    }).observe(html, { attributes: true, attributeFilter: ['data-lang'] });
  }

  /* ───────────────────────────── layout vivo ───────────────────────────── */
  function ligarLayout() {
    var tm = 0;
    window.addEventListener('resize', function () {
      clearTimeout(tm);
      tm = setTimeout(function () {
        if (!gl) return;
        dimensionar(false); medirLayout();
        if (modo !== 'pleno') quadroEstatico();
      }, 140);
    });
    if (window.ResizeObserver && heroi) {
      var ro = new ResizeObserver(function () { if (gl) { medirLayout(); if (modo !== 'pleno') quadroEstatico(); } });
      ro.observe(heroi);
      ro.observe(document.body);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { if (gl) { medirLayout(); if (modo !== 'pleno') quadroEstatico(); } });
    }
    if (MQ_REDUZIDO.addEventListener) {
      MQ_REDUZIDO.addEventListener('change', function () {
        if (!gl || modo === 'leve') return;
        if (MQ_REDUZIDO.matches) { parar(); modo = 'estatico'; mostrarPausa(false); quadroEstatico(); }
        else if (!lerPausaSalva()) { modo = 'pleno'; mostrarPausa(true); rotularPausa(); iniciarLaco(); }
        else { modo = 'pausado'; mostrarPausa(true); rotularPausa(); quadroEstatico(); }
      });
    }
  }

  /* ───────────────────────────── depuração (window.__abismo) ───────────────────────────── */
  window.__abismo = {
    versao: 1,
    estado: function () {
      return {
        modo: modo, webgl: !!gl, qualidade: qualidade, fps: Math.round(fpsEma), quadros: quadrosDesenhados,
        dpr: dpr, celula: [+(tw / dpr).toFixed(2), +(th / dpr).toFixed(2)], grade: [cols, linhas],
        olhos: olhos.length, acordado: despertar.iniciado, dormindo: dormindo,
        luz: +lant.luz.toFixed(2), furia: +furiaNivel(agora()).toFixed(2), idioma: idioma(), erros: erros.slice(0, 10),
        ancora: lay ? [Math.round(lay.ancora.x), Math.round(lay.ancora.y)] : null,
        escala: lay ? Math.round(lay.escala) : 0,
        camada: estadoCamadas().slice(), fronteiras: fronteiras.map(Math.round),
        olhosCri: olhos.filter(function (o) { return o.cri >= 0; }).slice(0, 6).map(function (o) { return [o.cri, +o.abre.toFixed(2), +o.vis.toFixed(2), Math.round(o.cx), Math.round(o.cy)]; }),
        criaturas: cris.map(function (c) { return { tipo: c.tipo, x: Math.round(c.x), y: Math.round(c.y), escala: Math.round(c.escala), pres: +c.pres.toFixed(2), naTela: !!c.naTela }; })
      };
    },
    pausar: function (v) { aplicarPausa(!!v); },
    // Mede o custo real de GPU por quadro (ms): desenha n quadros forçando
    // sincronização com readPixels de 1 pixel. Só para diagnóstico/harness.
    medirGPU: function (n) {
      if (!gl) return null;
      n = n || 20;
      var px = new Uint8Array(4), t = agora(), a = performance.now();
      for (var i = 0; i < n; i++) {
        atualizarOlhos(t + i / 60, 1 / 60);
        desenharQuadro(t + i / 60);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      }
      return +((performance.now() - a) / n).toFixed(2);
    },
    furia: function () { furia.t = agora(); acordar(agora()); },
    camadaFixa: null,
    // depuração/harness: todas as criaturas já surgidas e de olhos abertos
    revelar: function () {
      var t = agora();
      for (var c = 0; c < cris.length; c++) { cris[c].visto = true; cris[c].pres = 1; cris[c].tAbre = t - 3; }
    }
  };

  /* ───────────────────────────── partida ───────────────────────────── */
  function partir() {
    try {
      iniciarGL();
      dimensionar(true);
      enviarMensagens();
      ligarEntrada();
      ligarVisibilidade();
      ligarIdioma();
      ligarLayout();
      recadoNoConsole();
      if (MQ_REDUZIDO.matches) {
        modo = 'estatico'; mostrarPausa(false); quadroEstatico();
      } else if (lerPausaSalva()) {
        modo = 'pausado'; mostrarPausa(true); rotularPausa(); quadroEstatico();
      } else {
        modo = 'pleno'; mostrarPausa(true); rotularPausa(); iniciarLaco();
      }
    } catch (e) {
      erros.push(String(e && e.message || e));
      try { console.warn('abismo: WebGL indisponível, usando a chuva 2D —', e && e.message); } catch (e2) { /* nada */ }
      parar();
      iniciarFallback2D(String(e && e.message || e));
      ligarVisibilidadeSoTitulo();
      ligarIdioma();
      recadoNoConsole();
    }
  }
  function ligarVisibilidadeSoTitulo() {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { tituloGuardado = document.title; document.title = TXT[idioma()].tituloOculto; }
      else if (tituloGuardado !== null) { document.title = tituloGuardado; tituloGuardado = null; }
    });
  }

  // A fonte mono precisa estar carregada antes de desenhar o atlas de glifos.
  if (document.fonts && document.fonts.load) {
    Promise.race([
      document.fonts.load('600 16px "JetBrains Mono"'),
      new Promise(function (r) { setTimeout(r, 1500); })
    ]).then(partir, partir);
  } else {
    partir();
  }
})();
