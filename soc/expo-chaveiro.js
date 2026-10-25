/* expo-chaveiro · "o token que mente" — autenticação (JWT). O token de DEMONSTRAÇÃO é gerado aqui, no
   navegador, com crypto.subtle (HMAC-SHA256) e base64url feito à mão: nada vai para a rede, nenhum segredo real.
   O token é vulnerável DE PROPÓSITO. Os 6 ACHADOS são a saída REAL do Chaveiro sobre este mesmo token
   (`chaveiro inspect - -f json`): só o segredo é confirmado aqui, pela quebra real no navegador; os demais
   são leitura passiva que depende do verificador. alg:none e confusão RS→HS NÃO são achados deste token —
   são PoCs para o visitante testar no verificador DELE. Números reais só de ctx.dados. Contrato: CONTRATO.md. */

const SEGREDO = 'sec' + 'ret';            // segredo fraco de dicionário do token de demonstração
const DICT = ['123456', 'password', '123456789', 'qwerty', 'admin', 'welcome', 'letmein',
  SEGREDO, 'changeme', 'iloveyou', 'dragon', 'monkey', 'senha', 'segredo', 'key']; // dicionário de demonstração; a real é testada de verdade
const FIND = ['secret', 'jku', 'kid', 'alg', 'aud', 'exp'];  // os 6 ACHADOS reais da ferramenta, em ordem de severidade
const POC = ['none', 'confusion'];                           // 2 PoCs — não são achados deste token, fora da contagem
const SEV = { secret: 'crit', jku: 'high', kid: 'high', alg: 'low', aud: 'low', exp: 'info' };
const CID = { secret: 'hmac-secret-weak-confirmado', jku: 'header-jku', kid: 'header-kid-injection',
  alg: 'alg-hmac-advisory', aud: 'claim-no-aud', exp: 'claim-expired' };
const MARCA = { secret: ['sig'], jku: ['jku'], kid: ['kid'], alg: ['alg'], aud: [], exp: ['exp'], none: ['alg'], confusion: ['alg'] };
const CONFIRMA = { secret: true };        // o único achado comprovado AGORA no navegador (os outros dependem do verificador)
const STEP = 500, SCAN = 230, TAIL = 440, END = (FIND.length - 1) * STEP + SCAN + TAIL;

const TXT = {
  pt: {
    loc: 'pt-BR', nome: 'Chaveiro', frente: 'Autenticação', tese: 'O token que mente.',
    demo: 'demonstração', demoStage: 'demonstração · token gerado aqui, no seu navegador',
    lead: ['Auditor de tokens JWT/JWS — ', ['c', 'alg:none'], ', confusão de algoritmo, brute de segredo HMAC, ',
      ['c', 'jku'], '/', ['c', 'kid'], ' SSRF + ', ['b', 'validação de referência'], '.'],
    kV: 'vetores JWT no corpus', ic: 'IC95 {a}–{b}%', kF: 'falso-positivo em {l} tokens legítimos',
    fonte: 'README · bench de {d}', gh: 'Ver no GitHub', aba: ' (abre em nova aba)',
    espec: 'Token de demonstração · HS256', hL: 'cabeçalho', pL: 'payload', sL: 'assinatura',
    decH: 'cabeçalho decodificado', decP: 'payload decodificado',
    gerando: 'gerando o token no navegador…',
    semcripto: 'crypto.subtle indisponível: o cálculo exige um contexto seguro (HTTPS ou localhost).',
    cmd: 'echo "$TOKEN" | chaveiro inspect -', btn: '▸ Auditar o token', btn2: '↻ Auditar de novo', parar: '■ Interromper',
    escopo: ['O corpus do Chaveiro cobre ', ['b', '{v}'], ' vetores; aqui a ferramenta emite ', ['b', '{n}'], ' achados neste token.'],
    est: { idle: 'pronto', auditando: 'auditando o token', fim: 'auditoria concluída', pausado: 'pausado' },
    aguarda: 'na fila', lendo: 'testando…', pocT: 'Provas de conceito — teste no SEU verificador', pocBadge: 'PoC',
    sevRot: { crit: 'Crítica', high: 'Alta', med: 'Média', low: 'Baixa', info: 'Info' },
    a: {
      secret: ['segredo HMAC fraco — confirmado offline', 'assinatura'], jku: ['cabeçalho jku — URL de conjunto de chaves', 'cabeçalho · jku'],
      kid: ['kid com caracteres perigosos', 'cabeçalho · kid'], alg: ['HMAC HS256 — verifique segredo e confusão', 'cabeçalho · alg'],
      aud: ['sem aud (audience)', 'payload'], exp: ['token expirado', 'payload · exp'],
    },
    p: { none: ['alg:none', 'cabeçalho'], confusion: ['confusão RS256 → HS256', 'cabeçalho'] },
    x: {
      secret: 'Segredo achado na tentativa {n} de {total}: `{word}`. Com HS256, um segredo de dicionário cai offline em milissegundos — e aqui ele caiu de verdade, no seu navegador.',
      jku: 'O `jku` aponta para `{host}`, fora do emissor `{iss}`: um verificador que busca a chave nesse host do atacante aceita a assinatura dele. O Chaveiro sinaliza o vetor; confirmá-lo é checar o verificador.',
      kid: 'O `kid` é um caminho: `{kid}`. Um verificador que resolve o `kid` como arquivo no disco pode ser levado a uma chave arbitrária. Vetor sinalizado — a confirmação é no seu verificador.',
      alg: 'O token usa HS256 (segredo compartilhado). Verifique se o segredo é forte e único; e se o verificador também aceita `RS*`, a confusão RS→HS vira caminho de forja (a PoC está abaixo).',
      aud: 'O payload não traz `aud`. Sem amarrar o destinatário, o mesmo token vale em qualquer serviço que confie no emissor — valide `aud` no verificador.',
      exp: 'O `exp` expirou {rel} (em {data}). Um verificador correto rejeitaria este token; sem validar o `exp` — ou sem `exp` algum —, ele vale para sempre.',
      none: 'Troco o `alg` para `none` e apago a assinatura: um verificador que confia no cabeçalho aceitaria o token sem chave nenhuma. Esta PoC é gerada aqui pela demonstração (a CLI pública não forja `alg:none`); teste-a no SEU verificador.',
      confusion: 'O emissor assina em RS256; se o verificador usar a chave pública como segredo HMAC, eu assino em HS256 com essa chave — que é pública. Teste no SEU verificador.',
    },
    pocCmd: { none: 'gerada aqui pela demonstração', confusion: ['A ferramenta gera com ', ['c', 'chaveiro forge-confusion - --public-key chave.pub']] },
    forj: 'forjado aqui', vazio: '∅ sem assinatura', pub: 'chave pública (SPKI) como segredo', assHS: 'assinatura HS256',
    tent: 'tentativa {n}/{total}', real: 'cálculo real · HMAC-SHA256 no navegador',
    fecho: [['b', '{n} achados'], ' · ', ['b', '{c} confirmado aqui'], ' (o segredo, quebrado no seu navegador); os demais dependem do verificador.'],
    rec: 'Fixe o algoritmo no verificador e rejeite `none`; valide `iss`, `aud` e `exp`; use segredo forte e aleatório (≥ 256 bits) ou chaves assimétricas com allowlist de `kid`/`jku`.',
    voz: 'Um token diz quem você é; a segurança mora em quem decide se ele fala a verdade.',
    proTag: 'Pro = escopo + serviço', proT: 'Chaveiro · Pro', voce: 'Você roda:', voceT: 'a auditoria de um token JWT, 100% offline.', acresc: 'A Pro acrescenta:',
    proL: ['a auditoria do emissor e do verificador do sistema inteiro', 'a análise do JWKS que você me entrega',
      'o enquadramento de conformidade FAPI / Open Finance Brasil', 'o laudo datado — de quem escreveu emissor e verificador em finanças reguladas'],
  },
  en: {
    loc: 'en', nome: 'Chaveiro', frente: 'Authentication', tese: 'The token that lies.',
    demo: 'demonstration', demoStage: 'demonstration · token generated here, in your browser',
    lead: ['JWT/JWS token auditor — ', ['c', 'alg:none'], ', algorithm confusion, HMAC secret brute-forcing, ',
      ['c', 'jku'], '/', ['c', 'kid'], ' SSRF + a ', ['b', 'validation reference'], '.'],
    kV: 'JWT vectors on the corpus', ic: '95% CI {a}–{b}%', kF: 'false positives in {l} legit tokens',
    fonte: 'README · bench of {d}', gh: 'View on GitHub', aba: ' (opens in a new tab)',
    espec: 'Demonstration token · HS256', hL: 'header', pL: 'payload', sL: 'signature',
    decH: 'decoded header', decP: 'decoded payload',
    gerando: 'generating the token in the browser…',
    semcripto: 'crypto.subtle unavailable: the computation needs a secure context (HTTPS or localhost).',
    cmd: 'echo "$TOKEN" | chaveiro inspect -', btn: '▸ Audit the token', btn2: '↻ Audit again', parar: '■ Stop',
    escopo: ['The Chaveiro corpus covers ', ['b', '{v}'], ' vectors; here the tool emits ', ['b', '{n}'], ' findings on this token.'],
    est: { idle: 'ready', auditando: 'auditing the token', fim: 'audit complete', pausado: 'paused' },
    aguarda: 'queued', lendo: 'testing…', pocT: 'Proofs of concept — test on YOUR verifier', pocBadge: 'PoC',
    sevRot: { crit: 'Critical', high: 'High', med: 'Medium', low: 'Low', info: 'Info' },
    a: {
      secret: ['weak HMAC secret — confirmed offline', 'signature'], jku: ['jku header — key-set URL', 'header · jku'],
      kid: ['kid with dangerous characters', 'header · kid'], alg: ['HMAC HS256 — check secret and confusion', 'header · alg'],
      aud: ['no aud (audience)', 'payload'], exp: ['expired token', 'payload · exp'],
    },
    p: { none: ['alg:none', 'header'], confusion: ['RS256 → HS256 confusion', 'header'] },
    x: {
      secret: 'Secret found on attempt {n} of {total}: `{word}`. With HS256, a dictionary secret falls offline in milliseconds — and here it actually fell, in your browser.',
      jku: 'The `jku` points to `{host}`, outside the issuer `{iss}`: a verifier that fetches the key from the attacker’s host accepts their signature. The Chaveiro flags the vector; confirming it means checking the verifier.',
      kid: 'The `kid` is a path: `{kid}`. A verifier that resolves `kid` to a file on disk can be steered to an arbitrary key. Vector flagged — confirmation is on your verifier.',
      alg: 'The token uses HS256 (shared secret). Check that the secret is strong and unique; and if the verifier also accepts `RS*`, RS→HS confusion becomes a forgery path (PoC below).',
      aud: 'The payload has no `aud`. Without binding the audience, the same token is valid in any service that trusts the issuer — validate `aud` in the verifier.',
      exp: 'The `exp` expired {rel} (on {data}). A correct verifier would reject this token; without validating `exp` — or with no `exp` at all —, it is valid forever.',
      none: 'I switch `alg` to `none` and drop the signature: a verifier that trusts the header would accept the token with no key at all. This PoC is generated here by the demonstration (the public CLI does not forge `alg:none`); test it on YOUR verifier.',
      confusion: 'The issuer signs with RS256; if the verifier uses the public key as the HMAC secret, I sign HS256 with that key — which is public. Test on YOUR verifier.',
    },
    pocCmd: { none: 'generated here by the demonstration', confusion: ['The tool generates it with ', ['c', 'chaveiro forge-confusion - --public-key key.pub']] },
    forj: 'forged here', vazio: '∅ no signature', pub: 'public key (SPKI) as the secret', assHS: 'HS256 signature',
    tent: 'attempt {n}/{total}', real: 'real computation · HMAC-SHA256 in the browser',
    fecho: [['b', '{n} findings'], ' · ', ['b', '{c} confirmed here'], ' (the secret, cracked in your browser); the rest depend on the verifier.'],
    rec: 'Pin the algorithm in the verifier and reject `none`; validate `iss`, `aud` and `exp`; use a strong random secret (≥ 256 bits) or asymmetric keys with a `kid`/`jku` allowlist.',
    voz: 'A token says who you are; security lives in who decides whether it tells the truth.',
    proTag: 'Pro = scope + service', proT: 'Chaveiro · Pro', voce: 'You run:', voceT: 'the audit of a single JWT token, 100% offline.', acresc: 'Pro adds:',
    proL: ['an audit of your entire system’s issuer and verifier', 'analysis of the JWKS you hand me',
      'FAPI / Open Finance Brasil compliance framing', 'a dated report — from someone who has written issuers and verifiers in regulated finance'],
  },
};

/* ---------- DOM + base64url + HMAC (tudo local) ---------- */
const el = (tag, cls, txt, ...filhos) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  e.append(...filhos);
  return e;
};
const mudo = (e) => (e.setAttribute('aria-hidden', 'true'), e);
const botao = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };
const f = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null ? v[k] : m));
const pad = (n) => String(n).padStart(2, '0');
const frag = (pai, s) => { s.split('`').forEach((seg, i) => pai.append(i % 2 ? el('code', 'xc-code', seg) : seg)); return pai; };

const ENC = new TextEncoder();
const b64 = (bytes) => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const b64url = (bytes) => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const j64 = (o) => b64url(ENC.encode(JSON.stringify(o)));
async function hmac(secret, msg) {
  const k = await crypto.subtle.importKey('raw', ENC.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, ENC.encode(msg)));
}

export function montar(raiz, ctx) {
  ctx = ctx || {};
  const CH = (ctx.dados && ctx.dados.suite && ctx.dados.suite.chaveiro) || {};
  const REPO = CH.repo || 'Paulo-Marcos-Lucio/chaveiro';
  let lang = ctx.idioma === 'en' ? 'en' : 'pt';
  let reduzido = !!ctx.reduzido, pausado = !!ctx.pausado, visivel = true, raf = 0, antes = 0;
  let R = null, erro = false;                       // R = resultado do cálculo (token + forjas + brute)
  const est = { fase: 'idle', t: 0, revel: 0, ativo: null };
  const ui = {}, campo = {};
  const t = (k) => TXT[lang][k];
  const NF = {};
  const nf = (x) => (NF[lang] || (NF[lang] = new Intl.NumberFormat(TXT[lang].loc))).format(x);
  const grp = (s) => String(s).replace(/\d+/g, (m) => nf(+m));   // formata só os dígitos, preserva a barra de "22/22"

  const caixa = el('div', 'xc-raiz');
  const vivo = el('p', 'sr-only');
  vivo.setAttribute('aria-live', 'polite');
  raiz.append(caixa);

  /* ---------- cálculo: gera o token e as forjas uma única vez ---------- */
  const agora = Math.floor(Date.now() / 1000);
  const iat = agora - 90 * 60, exp = agora + -60 * 60;     // emitido há 90 min, expirou há ~60 min
  const header = { alg: 'HS256', typ: 'JWT', kid: '../../../../dev/null', jku: 'https://jwks.attacker.example/keys.json' };
  const payload = { iss: 'https://auth.example.com', sub: '42', name: 'Ana Desenvolvedora', role: 'admin', iat, exp };
  const issHost = 'auth.example.com', jkuHost = 'jwks.attacker.example';

  async function calcular() {
    if (!(window.crypto && crypto.subtle)) { erro = true; return; }
    const h64 = j64(header), p64 = j64(payload), si = h64 + '.' + p64;
    const sig = b64url(await hmac(SEGREDO, si));
    const none = { h64: j64({ alg: 'none', typ: 'JWT' }), p64 };          // forja alg:none, assinatura vazia
    let pub = '', sigc = '';
    try {                                                                 // confusão RS256→HS256 com chave pública REAL
      const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
      pub = b64(new Uint8Array(await crypto.subtle.exportKey('spki', kp.publicKey)));
      sigc = b64url(await hmac(pub, j64({ alg: 'HS256', typ: 'JWT' }) + '.' + p64));
    } catch (e) { pub = ''; }
    let achou = -1;                                                       // brute REAL: para na primeira que bate
    for (let i = 0; i < DICT.length; i++) { if (b64url(await hmac(DICT[i], si)) === sig) { achou = i; break; } }
    R = { h64, p64, sig, none, pub, sigc, achou, nTent: achou < 0 ? DICT.length : achou + 1 };
  }
  const confirmados = () => FIND.filter((id) => CONFIRMA[id] && R && (id !== 'secret' || R.achou >= 0)).length;

  /* ---------- helpers de construção ---------- */
  function rico(pai, partes, v) {
    for (const p of partes) {
      if (typeof p === 'string') pai.append(f(p, v));
      else pai.append(el(p[0] === 'b' ? 'strong' : 'code', p[0] === 'c' ? 'xc-code' : null, f(p[1], v)));
    }
    return pai;
  }
  const planoRico = (partes, v) => partes.map((p) => (typeof p === 'string' ? f(p, v) : f(p[1], v))).join('');
  function linkGH() {
    const a = el('a', 'btn xc-gh', t('gh'), mudo(el('span', null, ' ↗')), el('span', 'sr-only', t('aba')));
    a.href = 'https://github.com/' + REPO; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }
  const dmy = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '—' : new Intl.DateTimeFormat(TXT[lang].loc, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(d);
  };
  function modKpi(v, rot, fonte) {
    return el('div', 'mod-kpi', null, el('span', 'mod-kpi-v', v), el('span', 'mod-kpi-r', rot), el('span', 'mod-kpi-f', fonte));
  }
  // token colorido em 3 partes (cabeçalho --holo, payload --synapse-lift, assinatura --ink-mid)
  function tokenDOM(h64, p64, sig, guardar) {
    const jh = el('span', 'xc-jh', h64), jp = el('span', 'xc-jp', p64);
    const js = sig ? el('span', 'xc-js', sig) : el('span', 'xc-jv0', t('vazio'));
    if (guardar) { campo.alg = jh; campo.sig = js; }
    return el('code', 'xc-jwt', null, jh, el('span', 'xc-jd', '.'), jp, el('span', 'xc-jd', '.'), js);
  }
  // JSON plano, fiel aos bytes do token: números crus (um timestamp não se agrupa), chaves na cor do bloco
  function jsonDOM(obj, accent, marcar) {
    const box = el('div', 'xc-json');
    box.append(el('span', 'xc-jbr', '{'));
    const ks = Object.keys(obj);
    ks.forEach((k, i) => {
      const val = obj[k], num = typeof val === 'number';
      const vEl = num ? el('span', 'xc-jn', String(val)) : el('span', 'xc-jv', '"' + val + '"');
      const line = el('div', 'xc-kv', null, el('span', 'xc-jk ' + accent, '"' + k + '"'), el('span', 'xc-jc', ': '), vEl);
      if (i < ks.length - 1) line.append(el('span', 'xc-jc', ','));
      box.append(line);
      if (marcar && marcar.includes(k)) campo[k] = line;
    });
    box.append(el('span', 'xc-jbr', '}'));
    return box;
  }

  function construir() {
    caixa.replaceChildren();
    for (const k in campo) delete campo[k];
    vivo.textContent = '';
    const pronto = !!R && !erro;
    const vet = CH.vetores ? grp(CH.vetores) : '—';
    const ic = Array.isArray(CH.ic95) ? f(t('ic'), { a: nf(CH.ic95[0]), b: nf(CH.ic95[1]) }) : '';
    const fonteStr = f(t('fonte'), { d: CH.medido_em ? dmy(CH.medido_em) : '—' });

    /* CABEÇALHO ÚNICO (soc.css · .mod-*) — tese (a voz) + lead | KPIs reais com fonte/data + GitHub */
    const eyebrow = el('p', 'mod-eyebrow', null, el('span', null, t('nome') + ' · ' + t('frente')), el('span', 'rotulo-demo', t('demo')));
    const kpis = el('div', 'mod-kpis', null,
      modKpi(vet, t('kV') + (ic ? ' · ' + ic : ''), fonteStr),
      modKpi(CH.falsos_positivos != null ? nf(CH.falsos_positivos) : '—',
        CH.legitimos != null ? f(t('kF'), { l: nf(CH.legitimos) }) : t('kF').replace(' {l} ', ' '), fonteStr));
    const cab = el('header', 'mod-cab', null,
      el('div', null, null, eyebrow, el('h3', 'mod-tese', t('tese')), rico(el('p', 'mod-lead'), t('lead'))),
      el('div', 'mod-lado', null, kpis, el('div', 'mod-acoes', null, linkGH())));

    /* palco de demonstração (o miolo é meu) */
    const demo = el('section', 'xc-demo');
    demo.setAttribute('aria-label', t('demoStage'));
    demo.append(el('span', 'rotulo-demo', t('demoStage')));

    // specimen do token
    const leg = el('div', 'xc-leg', null,
      el('span', 'xc-sw xc-sw-h', t('hL')), el('span', 'xc-sw xc-sw-p', t('pL')), el('span', 'xc-sw xc-sw-s', t('sL')));
    const espec = el('div', 'xc-espec', null,
      el('div', 'xc-espec-h', null, el('span', 'xc-espec-t', t('espec')), leg),
      pronto ? tokenDOM(R.h64, R.p64, R.sig, true)
        : el('p', 'xc-aguarde', erro ? t('semcripto') : t('gerando')));
    demo.append(espec);

    // decodificado
    if (pronto) {
      demo.append(el('div', 'xc-dec', null,
        el('div', 'xc-dcard xc-d-h', null, el('h4', 'xc-dh', t('decH')), jsonDOM(header, 'xc-ah', ['alg', 'kid', 'jku'])),
        el('div', 'xc-dcard xc-d-p', null, el('h4', 'xc-dh', t('decP')), jsonDOM(payload, 'xc-ap', ['exp']))));
    }

    // barra de auditoria
    ui.btn = botao('btn btn-holo xc-run', '', () => (est.fase === 'auditando' ? interromper() : iniciar()));
    ui.btn.disabled = !pronto;
    ui.st = el('span', 'xc-est-t');
    ui.pbar = mudo(el('span', 'xc-pbar'));
    ui.ptx = el('span', 'xc-ptx');
    const barra = el('div', 'xc-barra', null, ui.btn, el('code', 'xc-cmd', t('cmd')),
      el('p', 'xc-est', null, ui.st), el('div', 'xc-prog', null, ui.pbar, ui.ptx));
    demo.append(barra, rico(el('p', 'xc-escopo'), t('escopo'), { v: vet, n: nf(FIND.length) }));

    // linhas da bateria (os 6 achados reais)
    ui.linhas = FIND.map((id, i) => montarLinha(id, i, pronto));
    ui.feixe = mudo(el('span', 'xc-feixe'));
    const ol = el('div', 'xc-trilho', null, ui.feixe, el('ol', 'xc-testes', null, ...ui.linhas.map((o) => o.li)));
    demo.append(ol);

    // PoCs (fora da contagem) + resumo + recomendação (aparecem no fim)
    ui.poc = el('div', 'xc-poc');
    ui.res = el('div', 'xc-res');
    demo.append(ui.poc, ui.res);

    /* FAIXA PRO ÚNICA (soc.css · .pro-*) — copy do site */
    const pro = el('aside', 'pro-faixa', null,
      el('div', null, null, el('p', 'pro-nome', t('proT')), el('p', 'pro-def', t('proTag')),
        el('p', 'pro-voce', null, el('strong', null, t('voce')), ' ' + t('voceT'))),
      el('div', null, null, el('p', 'pro-t', t('acresc')),
        el('ul', 'pro-lista', null, ...t('proL').map((x) => el('li', null, x)))));
    pro.setAttribute('aria-label', t('nome') + ' Pro');

    caixa.append(cab, demo, pro, vivo);
    medir();
    paint();
  }

  function montarLinha(id, i, pronto) {
    const sev = SEV[id], meta = TXT[lang].a[id];
    const li = el('li', 'xc-linha xc-pend');
    const btn = botao('xc-lb', null, () => alvo(id));
    btn.disabled = true; btn.dataset.id = id;
    btn.setAttribute('aria-pressed', 'false');
    const chip = el('span', 'chip sev-' + sev, TXT[lang].sevRot[sev]);
    const esp = el('span', 'xc-esp', t('aguarda'));
    const l1 = el('span', 'xc-l1', null, mudo(el('span', 'xc-vaz', '···')), chip,
      el('span', 'xc-nome', meta[0]), el('code', 'xc-cid', CID[id]), el('span', 'xc-loc', meta[1]), esp);
    btn.append(el('span', 'xc-n', pad(i + 1)), l1);
    const xp = frag(el('p', 'xc-x'), f(TXT[lang].x[id], {
      n: pronto ? nf(R.nTent) : '', total: nf(DICT.length), word: SEGREDO,
      kid: header.kid, host: jkuHost, iss: issHost,
      rel: pronto ? relExp() : '', data: pronto ? dataExp() : '',
    }));
    const evid = el('div', 'xc-evid');
    if (pronto && id === 'secret') encherSecret(evid);
    li.append(btn, xp, evid);
    return { id, li, btn, chip, esp, set: setLinha(id, li, btn, esp) };
  }

  function encherSecret(evid) {
    const grade = el('div', 'xc-dict');
    DICT.forEach((w, j) => {
      const cls = R.achou < 0 ? 'xc-w-no' : j < R.achou ? 'xc-w-no' : j === R.achou ? 'xc-w-hit' : 'xc-w-skip';
      grade.append(el('span', 'xc-w ' + cls, (j === R.achou ? '✓ ' : '') + w));
    });
    evid.append(grade, el('div', 'xc-dict-m', null,
      el('span', 'xc-etag xc-hit', f(t('tent'), { n: nf(R.nTent), total: nf(DICT.length) })),
      el('span', 'xc-real', t('real'))));
  }

  // PoCs: alg:none e confusão RS→HS — não são achados deste token, são artefatos para o visitante testar
  function pocDOM(id) {
    const meta = TXT[lang].p[id];
    const card = el('div', 'xc-pcard');
    const topo = el('div', 'xc-ptopo', null,
      el('span', 'chip sev-holo', t('pocBadge')), el('span', 'xc-nome', meta[0]), el('span', 'xc-loc', meta[1]));
    card.append(topo, frag(el('p', 'xc-x xc-px'), TXT[lang].x[id]));
    const evid = el('div', 'xc-evid xc-pevid');
    if (id === 'none') {
      evid.append(el('span', 'xc-etag', t('forj')), tokenDOM(R.none.h64, R.none.p64, '', false));
    } else if (id === 'confusion' && R.pub) {
      evid.append(el('span', 'xc-etag', t('pub')), el('code', 'xc-eval', R.pub.slice(0, 32) + '…'),
        el('span', 'xc-etag', t('assHS')), el('code', 'xc-eval', R.sigc.slice(0, 24) + '…'));
    }
    const cmd = TXT[lang].pocCmd[id];
    const cmdP = el('p', 'xc-pcmd');
    if (typeof cmd === 'string') cmdP.append(el('span', 'xc-cmdrot', cmd));
    else rico(cmdP, cmd);
    card.append(evid, cmdP);
    return card;
  }

  /* ---------- datas do exp (Intl, em UTC) ---------- */
  const emExp = new Date(exp * 1000), valido = !isNaN(emExp);
  const dataExp = () => (valido ? new Intl.DateTimeFormat(TXT[lang].loc, { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' }).format(emExp) + ' UTC' : '—');
  const relExp = () => {
    if (!valido) return '—';
    const s = (exp * 1000 - Date.now()) / 1000, r = new Intl.RelativeTimeFormat(TXT[lang].loc, { numeric: 'auto' });
    return Math.abs(s) < 3600 ? r.format(Math.round(s / 60), 'minute') : Math.abs(s) < 172800 ? r.format(Math.round(s / 3600), 'hour') : r.format(Math.round(s / 86400), 'day');
  };

  /* ---------- pintura do estado ---------- */
  function setLinha(id, li, btn, esp) {
    return (st) => {
      ['xc-pend', 'xc-lendo', 'xc-feito'].forEach((c, j) => li.classList.toggle(c, j === st));
      btn.disabled = st < 2;
      esp.textContent = st === 1 ? t('lendo') : st === 0 ? t('aguarda') : '';
    };
  }
  function paint() {
    if (!R || erro) { estado(); return; }
    const done = est.fase === 'fim';
    let rev = 0, ativoVis = -1;
    ui.linhas.forEach((o, i) => {
      const st = est.fase === 'idle' ? 0 : done ? 2 : est.t < i * STEP ? 0 : est.t < i * STEP + SCAN ? 1 : 2;
      if (st === 2) rev++;
      if (st === 1) ativoVis = i;
      o.set(st);
    });
    est.revel = rev;
    // feixe sobre a linha em leitura
    if (ui.linhas[0]) {
      const alvoI = ativoVis >= 0 ? ativoVis : -1;
      ui.feixe.classList.toggle('xc-on', alvoI >= 0 && est.fase === 'auditando');
      if (alvoI >= 0 && ui.lt && ui.lt[alvoI]) ui.feixe.style.transform = 'translateY(' + ui.lt[alvoI][0].toFixed(1) + 'px)';
    }
    ui.pbar.style.setProperty('--p', rev / FIND.length);
    ui.ptx.textContent = nf(rev) + '/' + nf(FIND.length);
    pintarFim(done);
    aplicarAtivo();
    estado();
  }
  function estado() {
    if (erro) { ui.st && (ui.st.textContent = t('semcripto')); return; }
    const fa = est.fase, rod = fa === 'auditando';
    ui.btn.textContent = t(rod ? 'parar' : fa === 'fim' ? 'btn2' : 'btn');
    ui.st.textContent = pausado ? t('est').pausado : t('est')[fa];
    caixa.classList.toggle('xc-roda', rod && !pausado);
  }
  function pintarFim(done) {
    if (!done) { ui.poc.replaceChildren(); ui.res.replaceChildren(); return; }
    if (ui.res.childElementCount) return;
    ui.poc.append(el('p', 'xc-poc-t', t('pocT')), el('div', 'xc-pgrade', null, ...POC.map((id) => pocDOM(id))));
    ui.res.append(rico(el('p', 'xc-resumo'), t('fecho'), { n: nf(FIND.length), c: nf(confirmados()) }), frag(el('p', 'xc-rec'), t('rec')));
  }
  function aplicarAtivo() {
    for (const k in campo) campo[k].classList.remove('xc-hot');
    ui.linhas.forEach((o) => o.btn.setAttribute('aria-pressed', String(o.id === est.ativo)));
    ui.linhas.forEach((o) => o.li.classList.toggle('xc-sel', o.id === est.ativo));
    if (est.ativo) for (const fkey of MARCA[est.ativo]) if (campo[fkey]) campo[fkey].classList.add('xc-hot');
  }

  /* ---------- medição (sem getBoundingClientRect em laço) ---------- */
  function medir() { ui.lt = ui.linhas ? ui.linhas.map((o) => [o.li.offsetTop, o.li.offsetHeight]) : []; }

  /* ---------- motor do replay ---------- */
  const rodando = () => est.fase === 'auditando' && !pausado && visivel && !reduzido;
  function ligar() { if (!raf && rodando()) { antes = 0; raf = requestAnimationFrame(quadro); } }
  function desligar() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function quadro(ag) {
    raf = 0;
    if (!rodando()) return;
    est.t += antes ? Math.min(64, ag - antes) : 16;
    antes = ag;
    if (est.t >= END) return finalizar(true);
    paint();
    if (rodando()) raf = requestAnimationFrame(quadro);
  }
  function iniciar() {
    if (!R || erro) return;
    est.ativo = null;
    if (reduzido) return finalizar(true);
    est.fase = 'auditando';
    est.t = 0;
    antes = 0;
    paint();
    ligar();
  }
  function finalizar(anunciar) {
    desligar();
    est.fase = 'fim';
    est.t = END;
    paint();
    if (anunciar) vivo.textContent = planoRico(t('fecho'), { n: nf(FIND.length), c: nf(confirmados()) });
  }
  function interromper() {
    if (est.fase !== 'auditando') return;
    desligar();
    est.fase = 'idle';
    est.t = 0;
    paint();
  }
  function alvo(id) {
    est.ativo = est.ativo === id ? null : id;
    aplicarAtivo();
  }

  /* ---------- teclado na lista de testes ---------- */
  function navegar(ev) {
    const b = ev.target.closest('.xc-lb');
    if (!b) return;
    if (ev.key === 'Escape') { est.ativo = null; aplicarAtivo(); return; }
    const liberados = ui.linhas.map((o) => o.btn).filter((x) => !x.disabled), j = liberados.indexOf(b);
    if (j < 0) return;
    const alvoB = liberados[{ ArrowDown: j + 1, ArrowUp: j - 1, Home: 0, End: liberados.length - 1 }[ev.key]];
    if (alvoB) { ev.preventDefault(); alvoB.focus(); }
  }

  const io = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((es) => { visivel = es[es.length - 1].isIntersecting; if (visivel) ligar(); else desligar(); }) : null;
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => medir()) : null;

  caixa.addEventListener('keydown', navegar);
  construir();
  (async () => {
    try { await calcular(); } catch (e) { erro = true; console.error('[expo-chaveiro]', e); }
    construir();
    if (reduzido && R && !erro) finalizar(false);
  })();
  if (io) io.observe(caixa);
  if (ro) ro.observe(caixa);

  return {
    pausar(b) { pausado = !!b; if (pausado) desligar(); else ligar(); estado(); },
    idioma(l) { lang = l === 'en' ? 'en' : 'pt'; construir(); },
    reduzir(b) { reduzido = !!b; if (reduzido) { if (R && !erro) finalizar(false); } else ligar(); },
    frescor() { },     // o palco é cálculo local sob demanda, não telemetria 'ao vivo' — o frescor não o afeta
    destruir() { desligar(); if (io) io.disconnect(); if (ro) ro.disconnect(); caixa.remove(); },
  };
}
