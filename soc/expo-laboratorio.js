/* expo-laboratorio · "vulnerável → exploit → corrigido" — frente de CORREÇÃO (OWASP Top 10:2025).
   Cada falha é uma DEMONSTRAÇÃO didática (código do lab real, rotulada): o payload viaja até o código
   vulnerável e a saída montada acende a injeção; do lado corrigido o MESMO payload fica inerte e o
   teste fica verde. Números reais só de ctx.dados (suite.laboratorio). Contrato: CONTRATO.md. */

const VID = ['sqli', 'xss', 'idor', 'crypto'];
const KIND = { sqli: 'sql', xss: 'html', idor: 'idor', crypto: 'crypto' };
const META = {
  sqli: { cat: 'A05', cwe: 'CWE-89', sev: 'crit' },
  xss: { cat: 'A05', cwe: 'CWE-79', sev: 'high' },
  idor: { cat: 'A01', cwe: 'CWE-639', sev: 'high' },
  crypto: { cat: 'A04', cwe: 'CWE-916', sev: 'med' },
};
/* Código Java real do lab (idêntico nos dois idiomas) + a palavra "contaminada" a destacar. */
const CODE = {
  sqli: {
    tv: 'nome', tf: 'nome',
    v: ['String sql = "SELECT id, nome, preco FROM produtos WHERE nome = \'" + nome + "\'";',
      'return jdbc.queryForList(sql);'],
    f: ['String sql = "SELECT id, nome, preco FROM produtos WHERE nome = ?";',
      'return jdbc.queryForList(sql, nome);'],
  },
  xss: {
    tv: 'q', tf: 'q',
    v: ['return "<p>Voce buscou: " + q + "</p>";'],
    f: ['return "<p>Voce buscou: " + HtmlUtils.htmlEscape(q) + "</p>";'],
  },
  idor: {
    tv: 'id', tf: 'usuario',
    v: ['Nota nota = notas.get(id);', 'return ResponseEntity.ok(nota);'],
    f: ['Nota nota = notas.get(id);', 'if (!nota.dono().equals(usuario))',
      '    return status(FORBIDDEN).build();', 'return ResponseEntity.ok(nota);'],
  },
  crypto: {
    tv: 'senha', tf: 'senha',
    v: ['MessageDigest md = MessageDigest.getInstance("MD5");', 'return hex(md.digest(bytes(senha)));'],
    f: ['return new BCryptPasswordEncoder().encode(senha);'],
  },
};
/* Saídas montadas das injeções (segmento, injetado?). Valores = fixtures do lab (demonstração). */
const MONT = {
  sqli: [['SELECT id, nome, preco FROM produtos WHERE nome = ', 0], ["'Notebook", 0], ["' OR '1'='1", 1], ["'", 0]],
  xss: [['<p>Voce buscou: ', 0], ['<script>alert(1)</script>', 1], ['</p>', 0]],
};
const PAY = { sqli: "Notebook' OR '1'='1", xss: '<script>alert(1)</script>', idor: 'id 1 · X-Usuario: bob', crypto: '123456' };
const ROWS = [['Notebook', 4500], ['Mouse', 120], ['Teclado', 250]]; // 3 produtos semeados no lab (demonstração)
const MD5 = 'e10adc3949ba59abbe56e057f20f883e';                       // md5("123456") — público, verificável
const BCR = '$2a$10$N9qo8uLOickgx2ZMRZo…';                            // esquema bcrypt (truncado, ilustrativo)
const KW = new Set('String var return public new if else final void boolean true false null this byte int long Map List Nota MessageDigest HtmlUtils ResponseEntity BCryptPasswordEncoder'.split(' '));
const TRAVEL = 560, INJ = 300, LEAK = 460, NEU = 460, GRN = 320;
const m1 = TRAVEL, m2 = m1 + INJ, m3 = m2 + LEAK, m4 = m3 + NEU, TOTAL = m4 + GRN;

const TXT = {
  pt: {
    loc: 'pt-BR', frente: 'Correção',
    tese: 'Ler sobre a falha é uma coisa; ver o exploit passar — e a correção barrá-lo — é outra.',
    demo: 'demonstração · lab vulnerável de propósito',
    desc: ['{v} vulnerabilidades em {c} categorias do OWASP Top 10:2025 (A01, A04 e A05) — com destaque para ',
      ['b', 'injeção'], ' — cada uma no par ', ['b', 'vulnerável → exploit → corrigido'],
      ', com teste automatizado provando que o lado corrigido ', ['b', 'corrige de verdade'], '.'],
    kV: 'vulnerabilidades no lab', kC: 'categorias OWASP · A01 · A04 · A05', stack: 'stack',
    gh: 'Ver no GitHub', aba: ' (abre em nova aba)',
    sel: 'Escolha a falha de demonstração', names: { sqli: 'SQL injection', xss: 'XSS refletido', idor: 'IDOR · acesso quebrado', crypto: 'Falha criptográfica' },
    step: ['vulnerável', 'exploit', 'corrigido'],
    run: '▸ Rodar o exploit', runb: '↻ Rodar de novo', stop: '■ Ir ao fim',
    est: { idle: 'pronto', playing: 'exploit em curso', done: 'exploit provado · correção provada', paused: 'pausado' },
    entrada: 'entrada do atacante', payL: 'payload',
    mont: { sql: 'query SQL montada', html: 'HTML montado', idor: 'requisição → resposta', crypto: 'hash gerado' },
    vazou: 'o payload virou código', boundL: 'ligado como valor', inerteL: 'inerte',
    capV: { sqli: 'A entrada vira parte do comando SQL.', xss: 'A entrada volta crua dentro do HTML.', idor: 'Devolve a nota pelo id, sem conferir o dono.', crypto: 'Hash rápido e sem sal: senha igual, hash igual.' },
    capF: { sqli: 'A entrada é parâmetro ligado — valor, nunca código.', xss: 'Codificação de saída: `<` vira `&lt;`.', idor: 'Autorização por dono do recurso antes de responder.', crypto: 'BCrypt: sal por senha, lento, com fator de custo.' },
    leak: { sqli: 'vazou {n} linhas — a tabela inteira', xss: 'script refletido — executa no navegador', idor: 'vazou {n} nota alheia — dados da Alice', crypto: 'hash público — senha revelada' },
    inert: { sqli: 'literal inerte', xss: 'texto inerte', idor: '403 Forbidden', crypto: 'salgado · irreversível' },
    green: { sqli: '0 linhas', xss: 'texto inerte', idor: '403 barrado', crypto: 'resistente' },
    greenT: 'teste verde',
    note: { sqli: 'O mesmo payload vira um valor literal: a busca procura um produto com esse nome exato — e não acha nenhum.', xss: 'O mesmo `<script>` chega como texto: aparece na tela, o navegador não executa.', idor: 'A mesma requisição do Bob pela nota da Alice: a checagem de dono devolve 403.', crypto: 'A mesma senha: cada hash sai único e irreversível — rainbow table não serve.' },
    rec: 'Cada par tem um teste que dispara o exploit real: ele passa no lado vulnerável e é barrado no corrigido. Teste verde = a correção corrige de verdade.',
    voz: 'Diagnóstico sem correção é só susto; aqui a correção vem provada por teste.',
    proTag: 'Pro = serviço', proT: 'Laboratório · Pro', voce: 'Você roda:', voceT: 'o laboratório aberto — {v} vulnerabilidades vulnerável→corrigido, com teste.', acresc: 'A Pro acrescenta:',
    proL: ['o workshop ao vivo com o seu time', 'cada falha do lab mapeada para o código real do cliente', 'a transferência de método — o porquê de cada correção, não só o patch'],
    anunc: '{nome}. No lado vulnerável, {leak}. No corrigido, {green} — teste verde.',
  },
  en: {
    loc: 'en', frente: 'Remediation',
    tese: 'Reading about the flaw is one thing; watching the exploit succeed — and the fix block it — is another.',
    demo: 'demonstration · lab vulnerable on purpose',
    desc: ['{v} vulnerabilities across {c} categories of the OWASP Top 10:2025 (A01, A04 and A05) — spotlighting ',
      ['b', 'injection'], ' — each one paired ', ['b', 'vulnerable → exploit → fixed'],
      ', with an automated test proving the fixed side ', ['b', 'actually fixes it'], '.'],
    kV: 'vulnerabilities in the lab', kC: 'OWASP categories · A01 · A04 · A05', stack: 'stack',
    gh: 'View on GitHub', aba: ' (opens in a new tab)',
    sel: 'Pick a demonstration flaw', names: { sqli: 'SQL injection', xss: 'Reflected XSS', idor: 'IDOR · broken access', crypto: 'Cryptographic failure' },
    step: ['vulnerable', 'exploit', 'fixed'],
    run: '▸ Run the exploit', runb: '↻ Run again', stop: '■ Skip to end',
    est: { idle: 'ready', playing: 'exploit running', done: 'exploit proven · fix proven', paused: 'paused' },
    entrada: 'attacker input', payL: 'payload',
    mont: { sql: 'assembled SQL query', html: 'assembled HTML', idor: 'request → response', crypto: 'generated hash' },
    vazou: 'the payload became code', boundL: 'bound as a value', inerteL: 'inert',
    capV: { sqli: 'User input becomes part of the SQL command.', xss: 'Input is reflected raw inside the HTML.', idor: 'Returns the note by id, without checking the owner.', crypto: 'Fast, unsalted hash: same password, same hash.' },
    capF: { sqli: 'Input is a bound parameter — a value, never code.', xss: 'Output encoding: `<` becomes `&lt;`.', idor: 'Ownership authorization before responding.', crypto: 'BCrypt: per-password salt, slow, with a cost factor.' },
    leak: { sqli: 'leaked {n} rows — the whole table', xss: 'reflected script — runs in the browser', idor: 'leaked {n} other user’s note — Alice’s data', crypto: 'public hash — password recovered' },
    inert: { sqli: 'inert literal', xss: 'inert text', idor: '403 Forbidden', crypto: 'salted · irreversible' },
    green: { sqli: '0 rows', xss: 'inert text', idor: '403 blocked', crypto: 'resistant' },
    greenT: 'test green',
    note: { sqli: 'The same payload is now a literal value: the search looks for a product with that exact name — and finds none.', xss: 'The same `<script>` arrives as text: it shows on screen, the browser doesn’t run it.', idor: 'Bob’s same request for Alice’s note: the ownership check returns 403.', crypto: 'The same password: each hash comes out unique and irreversible — a rainbow table is useless.' },
    rec: 'Each pair has a test that fires the real exploit: it passes on the vulnerable side and is blocked on the fixed one. Green test = the fix actually fixes it.',
    voz: 'A diagnosis without a fix is just a scare; here the fix comes proven by a test.',
    proTag: 'Pro = service', proT: 'OWASP Lab · Pro', voce: 'You run:', voceT: 'the open lab — {v} vulnerabilities, vulnerable→fixed, with tests.', acresc: 'Pro adds:',
    proL: ['a live workshop with your team', 'each lab flaw mapped to the client’s real code', 'a method transfer — the why behind each fix, not just the patch'],
    anunc: '{nome}. On the vulnerable side, {leak}. On the fixed side, {green} — test green.',
  },
};

/* ---------- helpers DOM (createElement + textContent, nada de innerHTML) ---------- */
const el = (tag, cls, txt, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; e.append(...kids); return e; };
const mudo = (e) => (e.setAttribute('aria-hidden', 'true'), e);
const botao = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };
const f = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null ? v[k] : m));
// parágrafo com trechos ricos: string | ['b',txt] (negrito) | ['c',txt] (código)
const rico = (pai, partes, v) => { for (const p of partes) pai.append(typeof p === 'string' ? f(p, v) : el(p[0] === 'b' ? 'strong' : 'code', p[0] === 'c' ? 'xl-code' : null, f(p[1], v))); return pai; };
// texto com `código` inline por craseamento
const frag = (pai, s) => { String(s).split('`').forEach((seg, i) => pai.append(i % 2 ? el('code', 'xl-code', seg) : seg)); return pai; };

// uma linha de código Java com coloração leve; `taint` = identificador contaminado a destacar
function codeLine(s, taint) {
  const line = el('div', 'xl-cl');
  const re = /("(?:[^"\\]|\\.)*"|\/\/.*$|[A-Za-z_]\w*|\d+|\s+|[^\sA-Za-z0-9]+)/g;
  let m;
  while ((m = re.exec(s))) {
    const tk = m[0];
    if (/^\s+$/.test(tk)) { line.append(tk); continue; }
    let cls = 'xl-id';
    if (tk[0] === '"') cls = 'xl-s';
    else if (tk.startsWith('//')) cls = 'xl-cm';
    else if (/^\d+$/.test(tk)) cls = 'xl-nu';
    else if (/^[A-Za-z_]/.test(tk)) cls = KW.has(tk) ? 'xl-kw' : (taint && tk === taint) ? 'xl-tt' : (s[re.lastIndex] === '(') ? 'xl-fn' : 'xl-id';
    else if (tk === '?') cls = 'xl-ph';
    else cls = 'xl-op';
    line.append(el('span', cls, tk));
  }
  return line;
}
const codeBlock = (lines, taint) => { const b = el('div', 'xl-code-b'); lines.forEach((l) => b.append(codeLine(l, taint))); return b; };

export function montar(raiz, ctx) {
  ctx = ctx || {};
  const LAB = (ctx.dados && ctx.dados.suite && ctx.dados.suite.laboratorio) || {};
  const REPO = LAB.repo || 'Paulo-Marcos-Lucio/laboratorio-owasp';
  const NVULN = LAB.vulnerabilidades != null ? LAB.vulnerabilidades : 8;
  const NCAT = Array.isArray(LAB.categorias) ? LAB.categorias.length : 3;
  let lang = ctx.idioma === 'en' ? 'en' : 'pt';
  let reduzido = !!ctx.reduzido, pausado = !!ctx.pausado, visivel = true, raf = 0, antes = 0;
  const est = { vid: 'sqli', fase: 'idle', t: 0 };
  const ui = { picks: [] };
  const t = (k) => TXT[lang][k];
  const NF = {};
  const nf = (x) => (NF[lang] || (NF[lang] = new Intl.NumberFormat(TXT[lang].loc))).format(x);
  const BRL = {};
  const brl = (x) => (BRL[lang] || (BRL[lang] = new Intl.NumberFormat(TXT[lang].loc, { style: 'currency', currency: 'BRL' }))).format(x);

  const caixa = el('div', 'xl-raiz');
  const vivo = el('p', 'sr-only');
  vivo.setAttribute('aria-live', 'polite');
  raiz.append(caixa);

  /* ---------- topo: tese + copy | KPIs reais + GitHub ---------- */
  const dupla = (val, rot) => el('div', 'xl-kpi', null, el('b', null, val), el('span', null, rot));
  function linkGH() {
    const a = el('a', 'btn xl-gh', t('gh'), mudo(el('span', null, ' ↗')), el('span', 'sr-only', t('aba')));
    a.href = 'https://github.com/' + REPO; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }

  /* ---------- seletor de falhas (botões aria-pressed, teclado por setas) ---------- */
  function montarSeletor() {
    const grupo = el('div', 'xl-sel');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', t('sel'));
    ui.picks = VID.map((vid, i) => {
      const meta = META[vid];
      const b = botao('xl-pick', null, () => escolher(i, false));
      b.setAttribute('aria-pressed', String(vid === est.vid));
      b.tabIndex = vid === est.vid ? 0 : -1;
      b.dataset.i = i;
      b.append(
        el('span', 'xl-pick-cat', meta.cat),
        el('span', 'xl-pick-n', TXT[lang].names[vid]),
        el('span', 'chip sev-' + meta.sev, meta.cwe));
      grupo.append(b);
      return b;
    });
    grupo.addEventListener('keydown', (ev) => {
      const cur = ui.picks.findIndex((p) => p === document.activeElement);
      if (cur < 0) return;
      const n = VID.length, nx = { ArrowRight: (cur + 1) % n, ArrowLeft: (cur - 1 + n) % n, Home: 0, End: n - 1 }[ev.key];
      if (nx === undefined) return;
      ev.preventDefault();
      escolher(nx, true);
    });
    return grupo;
  }

  function escolher(i, focar) {
    est.vid = VID[i];
    ui.picks.forEach((p, j) => { p.setAttribute('aria-pressed', String(j === i)); p.tabIndex = j === i ? 0 : -1; });
    if (focar) ui.picks[i].focus();
    renderPalco();
    play();
  }

  /* ---------- palco: 3 etapas lado a lado para a falha ativa ---------- */
  function etapa(n, tipo, ...kids) {
    const head = el('div', 'xl-et-h', null, el('span', 'xl-et-n', String(n)), el('span', 'xl-et-t', TXT[lang].step[n - 1]));
    return el('section', 'xl-et xl-et-' + tipo, null, head, ...kids);
  }

  // coluna 2 (exploit) — o payload viaja e a saída montada acende a injeção
  function colExploit(vid) {
    const kind = KIND[vid], L = TXT[lang];
    const pay = el('div', 'xl-pay', null, mudo(el('span', 'xl-pay-k', L.payL)), el('code', 'xl-pay-v', PAY[vid]));
    const entrada = el('div', 'xl-entry', null, el('span', 'xl-entry-k', L.entrada), pay);
    const wire = mudo(el('div', 'xl-wire', null, el('span', 'xl-wire-l'), el('span', 'xl-pkt')));
    const montLabel = el('div', 'xl-mont-h', L.mont[kind]);
    const mont = el('div', 'xl-mont');

    if (kind === 'sql' || kind === 'html') {
      const line = el('code', 'xl-mont-q');
      MONT[vid].forEach(([seg, inj]) => line.append(el('span', inj ? 'xl-mi' : 'xl-mp', seg)));
      mont.append(line);
    } else if (kind === 'idor') {
      mont.append(
        el('code', 'xl-req', 'GET /a01/idor/vulneravel/1', mudo(el('span', 'xl-req-h', '  ·  X-Usuario: bob'))),
        jsonResp([['id', '1', 0], ['dono', '"alice"', 1], ['texto', '"Dados bancarios da Alice"', 1]]));
    } else {
      mont.append(el('code', 'xl-hash', null,
        el('span', 'xl-fn', 'md5'), el('span', 'xl-op', '('), el('span', 'xl-s', '"123456"'), el('span', 'xl-op', ') = '),
        el('span', 'xl-mi', MD5)));
    }

    const leak = el('div', 'xl-leak', null,
      el('span', 'chip sev-' + META[vid].sev, f(L.leak[vid], { n: nf(vid === 'idor' ? 1 : 3) })));
    if (kind === 'sql') {
      const rows = el('ul', 'xl-rows');
      ROWS.forEach(([nome, preco]) => rows.append(
        el('li', null, null, el('span', 'xl-rn', nome), el('span', 'xl-rp', brl(preco)))));
      leak.append(rows);
    }
    return etapa(2, 'exp', entrada, wire, montLabel, mont, frag(el('p', 'xl-cap'), L.capV[vid]), leak);
  }

  function jsonResp(fields) {
    const box = el('code', 'xl-json');
    box.append(el('span', 'xl-op', '{ '));
    fields.forEach(([k, v, leak], i) => {
      box.append(el('span', 'xl-jk', '"' + k + '"'), el('span', 'xl-op', ': '), el('span', leak ? 'xl-mi' : 'xl-jv', v));
      if (i < fields.length - 1) box.append(el('span', 'xl-op', ', '));
    });
    box.append(el('span', 'xl-op', ' }'));
    return box;
  }

  // coluna 3 (corrigido) — o MESMO payload fica inerte; teste verde
  function colFix(vid) {
    const kind = KIND[vid], L = TXT[lang];
    const res = el('div', 'xl-fixres');
    if (kind === 'sql') {
      res.append(el('div', 'xl-bind', null, el('span', 'xl-ph', '?'), mudo(el('span', 'xl-arrow', ' ◂ ')),
        el('code', 'xl-inert', '"' + PAY[vid] + '"'), el('span', 'xl-bind-k', L.boundL)));
    } else if (kind === 'html') {
      res.append(el('code', 'xl-inert xl-inert-b', '<p>Voce buscou: &lt;script&gt;alert(1)&lt;/script&gt;</p>'));
    } else if (kind === 'idor') {
      res.append(el('div', 'xl-403', null, el('span', 'xl-403-c', '403'), el('span', 'xl-403-t', 'Forbidden')));
    } else {
      res.append(el('code', 'xl-inert xl-inert-b', BCR), el('span', 'xl-bind-k', t('inert').crypto));
    }
    const green = el('div', 'xl-green', null, mudo(el('span', 'xl-chk', '✓')),
      el('span', 'xl-green-v', TXT[lang].green[vid]), el('span', 'xl-green-t', t('greenT')));
    return etapa(3, 'fix', codeBlock(CODE[vid].f, kind === 'idor' ? CODE[vid].tf : null), res,
      frag(el('p', 'xl-cap'), L.capF[vid]), green);
  }

  function renderPalco() {
    const vid = est.vid;
    ui.palco.replaceChildren();
    ui.btnRun = botao('btn btn-holo xl-run', '', () => (est.fase === 'playing' ? finalizar(true) : play()));
    ui.pbar = mudo(el('span', 'xl-pbar'));
    ui.stTxt = el('span', 'xl-st-t');
    const barra = el('div', 'xl-barra', null, ui.btnRun,
      el('p', 'xl-st', null, el('span', 'xl-st-d'), ui.stTxt), el('span', 'xl-prog', null, ui.pbar));
    ui.ex = colExploit(vid);
    ui.steps = el('div', 'xl-steps', null,
      etapa(1, 'vul', codeBlock(CODE[vid].v, CODE[vid].tv), frag(el('p', 'xl-cap'), TXT[lang].capV[vid])),
      ui.ex, colFix(vid));
    ui.stage = el('div', 'xl-stage', null, barra, ui.steps, frag(el('p', 'xl-note'), TXT[lang].note[vid]));
    ui.palco.append(ui.stage);
    medir();
  }

  function construir() {
    caixa.replaceChildren();
    const kpis = el('div', 'xl-kpis', null, dupla(nf(NVULN), t('kV')), dupla(nf(NCAT), t('kC')));
    const topo = el('div', 'xl-topo', null,
      el('div', null, null,
        el('p', 'voz xl-tese', t('tese')),
        rico(el('p', 'xl-desc'), t('desc'), { v: nf(NVULN), c: nf(NCAT) }),
        el('p', 'xl-stack', null, el('span', 'xl-stack-k', t('stack') + ': '), el('span', 'xl-stack-v', LAB.stack || 'Spring Boot'))),
      el('div', 'xl-lado', null, kpis, linkGH()));

    const demo = el('section', 'xl-demo');
    demo.setAttribute('aria-label', t('demo'));
    demo.append(el('span', 'rotulo-demo', t('demo')), montarSeletor());
    ui.palco = el('div', 'xl-palco');
    demo.append(ui.palco);
    renderPalco();
    demo.append(frag(el('p', 'xl-rec'), t('rec')), el('p', 'voz xl-voz', t('voz')));

    const pro = el('aside', 'xl-pro', null,
      el('div', null, null, el('h4', 'xl-pro-t', t('proT')), el('span', 'xl-pro-tag', t('proTag')),
        el('p', 'xl-pro-p', null, el('strong', null, t('voce')), ' ' + f(t('voceT'), { v: nf(NVULN) }))),
      el('div', null, null, el('p', 'xl-pro-p xl-pro-a', t('acresc')),
        el('ul', 'xl-pro-l', null, ...t('proL').map((x) => el('li', null, x)))));

    caixa.append(el('article', 'painel xl-painel', null,
      el('header', 'painel-h xl-cab', null,
        el('h3', 'painel-t', 'Laboratório OWASP', el('span', 'chip sev-holo', t('frente'))),
        el('span', 'painel-id', REPO + [LAB.linguagem, LAB.licenca].filter(Boolean).map((x) => ' · ' + x).join(''))),
      el('div', 'painel-c xl-corpo', null, topo, demo, pro)), vivo);
  }

  /* ---------- medição única (sem getBoundingClientRect em laço) ---------- */
  function medir() { /* o cometa viaja por --p em CSS (distância fixa); nada a medir por quadro */ }

  /* ---------- motor da animação ---------- */
  const rodando = () => est.fase === 'playing' && !pausado && visivel && !reduzido;
  function ligar() { if (!raf && rodando()) { antes = 0; raf = requestAnimationFrame(quadro); } }
  function desligar() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function quadro(ag) {
    raf = 0;
    if (!rodando()) return;
    est.t += antes ? Math.min(64, ag - antes) : 16;
    antes = ag;
    if (est.t >= TOTAL) return finalizar(true);
    paint();
    if (rodando()) raf = requestAnimationFrame(quadro);
  }
  function play() {
    est.fase = 'playing';
    est.t = 0;
    antes = 0;
    if (reduzido) return finalizar(false);
    vivo.textContent = '';
    paint();
    ligar();
  }
  function finalizar(anunciar) {
    desligar();
    est.fase = 'done';
    est.t = TOTAL;
    paint();
    if (anunciar) vivo.textContent = f(t('anunc'), {
      nome: TXT[lang].names[est.vid],
      leak: f(TXT[lang].leak[est.vid], { n: nf(est.vid === 'idor' ? 1 : 3) }).replace(/`/g, ''),
      green: TXT[lang].green[est.vid],
    });
  }
  function paint() {
    if (!ui.stage) return;
    const done = est.fase === 'done';
    const tt = done ? TOTAL : est.t;
    const p = Math.min(1, tt / TRAVEL);
    ui.ex.style.setProperty('--p', done ? '1' : p.toFixed(3));
    ui.stage.classList.toggle('xl-reduced', reduzido);
    ui.stage.classList.toggle('xl-tr', !done && !reduzido && tt < TRAVEL);
    ui.stage.classList.toggle('xl-s-inj', done || tt >= m1);
    ui.stage.classList.toggle('xl-s-leak', done || tt >= m2);
    ui.stage.classList.toggle('xl-s-neu', done || tt >= m3);
    ui.stage.classList.toggle('xl-s-grn', done || tt >= m4);
    if (ui.pbar) ui.pbar.style.setProperty('--p', (done ? 1 : tt / TOTAL).toFixed(3));
    estado();
  }
  function estado() {
    if (!ui.btnRun) return;
    const run = est.fase === 'playing';
    ui.btnRun.textContent = run ? t('stop') : est.fase === 'done' ? t('runb') : t('run');
    ui.stTxt.textContent = run && pausado ? t('est').paused : t('est')[est.fase];
    ui.stage.classList.toggle('xl-live', run && !pausado);
  }

  const io = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((es) => { visivel = es[es.length - 1].isIntersecting; if (visivel) ligar(); else desligar(); }) : null;

  construir();
  if (reduzido) finalizar(false); else play();
  if (io) io.observe(caixa);

  return {
    pausar(b) { pausado = !!b; if (pausado) desligar(); else ligar(); estado(); },
    idioma(l) { lang = l === 'en' ? 'en' : 'pt'; construir(); if (reduzido) finalizar(false); else play(); },
    reduzir(b) { reduzido = !!b; if (reduzido) finalizar(false); else play(); },
    destruir() { desligar(); if (io) io.disconnect(); caixa.remove(); },
  };
}
