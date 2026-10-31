/* Guardião — “apagar do código não apaga do histórico”. Palco = DEMONSTRAÇÃO rotulada; números reais só de
   ctx.dados. Entropia = critério do Guardião (core/entropy.py): Shannon + Miller-Madow ÷ log2|alfabeto|,
   limiar FRACAO_MINIMA 0,80. Valores de demo montados por partes: nunca o literal inteiro no fonte. */
const LIMIAR = 0.8;
const BITS = Math.log2(64);
const V = {
  ak: 'AKIA' + 'IOSFODNN7' + 'EXAMPLE',
  sk: 'wJalrXUtnFEMI' + '/K7MDENG/' + 'bPxRfiCY' + 'EXAMPLEKEY',
  ph: 'your-' + 'api-key-here',
  sha: 'b4ffde65f46336ab' + '88eb53be808477a3936bae11',
};
const T = {
  ak: { achado: 1, formato: 1, regra: 'aws-access-key-id', v: 'vAk' },
  sk: { achado: 1, regra: 'aws-secret-access-key', v: 'vSk' },
  ph: { regra: 'placeholder', v: 'vPh' },
  sha: { regra: 'SHA-1', v: 'vSha' },
};
// git log fictício: hash, autor, arquivo, hunk, tokens com veredito, linhas
const C = [
  ['9c1e7a4', 'dev-b', 'config/settings.py', '@@ -1,5 +1,6 @@', [], [['+', 'import os'], [' ', 'DEBUG = False'],
    [' ', 'AWS_REGION = "sa-east-1"'], ['-', 'AWS_ACCESS_KEY_ID = "', 'ak', '"'], ['-', 'AWS_SECRET_ACCESS_KEY = "', 'sk', '"'],
    ['+', 'AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]'], ['+', 'AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]'],
    [' ', 'BACKUP_BUCKET = "nightly-backup"']]],
  ['5f2d0b8', 'dev-a', 'README.md', '@@ -8,0 +9,2 @@', ['ph'], [['+', '## Setup'], ['+', 'export API_KEY="', 'ph', '"']]],
  ['e07b3c1', 'dev-c', 'report/csv_export.py', '@@ -0,0 +1,3 @@', [], [['+', 'import csv'], ['+', 'def export(rows, f):'],
    ['+', '    csv.writer(f).writerows(rows)']]],
  ['3a9f6d2', 'dev-a', '.github/workflows/ci.yml', '@@ -9 +9 @@', ['sha'], [['-', '  - uses: actions/checkout@v4'],
    ['+', '  - uses: actions/checkout@', 'sha']]],
  ['b81c4e5', 'dev-b', 'config/settings.py', '@@ -1,2 +1,5 @@', ['ak', 'sk'], [[' ', 'DEBUG = False'], [' ', 'AWS_REGION = "sa-east-1"'],
    ['+', 'AWS_ACCESS_KEY_ID = "', 'ak', '"'], ['+', 'AWS_SECRET_ACCESS_KEY = "', 'sk', '"'], ['+', 'BACKUP_BUCKET = "nightly-backup"']]],
  ['47d2a90', 'dev-c', 'config/settings.py', '@@ -0,0 +1,2 @@', [], [['+', 'DEBUG = False'], ['+', 'AWS_REGION = "sa-east-1"']]],
  ['0e6b3f7', 'dev-a', 'app.py', '@@ -0,0 +1 @@', [], [['+', 'print("ok")']]],
].map(([h, a, f, hk, v, L]) => ({ h, a, f, hk, v, L }));

const TXT = {
  pt: {
    frente: 'Segredos', demo: 'demonstração · chave de exemplo da documentação oficial',
    tese: 'Apagar do código não apaga do histórico.',
    desc: ['Scanner de segredos vazados no código ', ['b', 'e no histórico Git'], ' — entropia normalizada, baseline, SARIF e hook de pre-commit. Recall ', ['b', '{r}'], ' no corpus, {f} falso-positivo.'],
    kR: 'recall no corpus', kF: 'falso-positivo no corpus',
    bench: ['Não acredite na minha palavra: o ', ['a', 'benchmark honesto'], ' contra gitleaks e trufflehog — versões e commits fixados, reproduzível — ', ['b', 'diz onde eles são mais enxutos que eu'], '.'],
    novaAba: '(abre em nova aba)', btn: '▸ Varrer o histórico', btn2: '↻ Varrer de novo', parar: '■ Interromper',
    pronto: 'Pronto: {n} commits, do HEAD à raiz.', lendo: 'lendo {h} · {ref}',
    ev0: 'Varredura iniciada: {n} commits.',
    evHead: 'HEAD: árvore limpa — a chave foi apagada do código.',
    evFim: 'Concluído: HEAD limpo; no histórico, {a} achados e {i} falsos-positivos evitados.', evInt: 'Varredura interrompida em {ref}.',
    diff: 'diff do commit', limpo: 'limpo', apagou: 'apagou a chave', ign: 'ignorado', alta: 'alta',
    notaHead: ['O HEAD apagou as duas linhas, mas o histórico guarda o arquivo inteiro: ', ['c', 'git show HEAD~1:config/settings.py'], ' ainda devolve a chave.'],
    vida: 'A chave viveu de {de} a {ate} — e segue no histórico.', lente: 'Lente de entropia',
    lenteIdle: 'A lente acende quando o Guardião passa por um valor suspeito.', lenteNada: 'Nada suspeito neste commit.',
    lenteHead: 'Na árvore do HEAD não há valor suspeito: a chave mora no histórico.',
    legenda: 'barra = surpresa do caractere (−log₂ p) · traço = a média = entropia de Shannon',
    bitsC: 'bits/caractere', car: '{n} caracteres', norm: 'normalizada', lim: 'limiar', formato: 'regra de formato',
    vSk: 'acima do limiar: compatível com cadeia aleatória', vAk: 'pego pelo formato da chave AWS — aqui a entropia não decide',
    vPh: 'placeholder · baixa entropia', vSha: 'SHA-1 de commit (pin): entropia alta, mas é estrutura de hash',
    real: 'O Guardião real reconhece esta chave de documentação e a descarta; aqui ela faz o papel de uma chave vazada.',
    oculto: 'trecho ocultado', soHead: 'Só o HEAD', parcial: 'parcial', soHeadR: '“nenhum segredo encontrado no que foi analisado”',
    todo: 'Todo o histórico', achL: 'achados', resumo: 'achados · {i} falsos-positivos evitados',
    rec: 'Revogue/rotacione a credencial AGORA (o histórico Git é público mesmo após remoção), remova do código e injete via variável de ambiente ou cofre de segredos.',
    metade: 'Achar é metade; git filter-repo e a rotação são trabalho separado.',
    proTag: 'Pro = escopo + serviço', voce: 'Você roda:', voceT: 'a busca de segredos no repositório que aponta.', acresc: 'A Pro acrescenta:',
    proL: ['a organização inteira e todo o histórico Git (não só o HEAD)', 'a triagem que adjudica cada achado como real ou falso-positivo', 'o plano de rotação por provedor com reteste que prova que a credencial saiu de circulação', 'o laudo de evidência LGPD'],
    msg: ['fix: tira a credencial do settings', 'docs: exemplo de configuração no README', 'feat: exporta relatório em CSV', 'ci: fixa actions/checkout por SHA', 'feat: backup noturno no S3', 'refactor: separa a camada de config', 'primeiro commit'],
  },
  en: {
    frente: 'Secrets', demo: 'demonstration · example key from the official documentation',
    tese: 'Deleting it from the code doesn’t delete it from history.',
    desc: ['Leaked-secrets scanner for your code ', ['b', 'and Git history'], ' — normalized entropy, baseline, SARIF, and a pre-commit hook. Recall ', ['b', '{r}'], ' on the corpus, {f} false positives.'],
    kR: 'recall on the corpus', kF: 'false positives on the corpus',
    bench: ['Don’t take my word for it: the ', ['a', 'honest benchmark'], ' against gitleaks and trufflehog — pinned versions and commits, reproducible — ', ['b', 'says where they’re leaner than me'], '.'],
    novaAba: '(opens in a new tab)', btn: '▸ Scan the history', btn2: '↻ Scan again', parar: '■ Stop',
    pronto: 'Ready: {n} commits, from HEAD to the root.', lendo: 'reading {h} · {ref}',
    ev0: 'Scan started: {n} commits.',
    evHead: 'HEAD: clean tree — the key was deleted from the code.',
    evFim: 'Done: HEAD clean; in the history, {a} findings and {i} false positives avoided.', evInt: 'Scan stopped at {ref}.',
    diff: 'commit diff', limpo: 'clean', apagou: 'deleted the key', ign: 'ignored', alta: 'high',
    notaHead: ['HEAD deleted both lines, but history keeps the whole file: ', ['c', 'git show HEAD~1:config/settings.py'], ' still returns the key.'],
    vida: 'The key lived from {de} to {ate} — and it is still in the history.', lente: 'Entropy lens',
    lenteIdle: 'The lens lights up when Guardião passes over a suspicious value.', lenteNada: 'Nothing suspicious in this commit.',
    lenteHead: 'HEAD’s tree holds no suspicious value: the key lives in the history.',
    legenda: 'bar = the character’s surprisal (−log₂ p) · line = the mean = Shannon entropy',
    bitsC: 'bits/character', car: '{n} characters', norm: 'normalized', lim: 'threshold', formato: 'format rule',
    vSk: 'above the threshold: consistent with a random string', vAk: 'caught by the AWS key format — entropy doesn’t decide here',
    vPh: 'placeholder · low entropy', vSha: 'commit SHA-1 (pin): high entropy, but it is hash structure',
    real: 'The real Guardião recognizes this documentation key and discards it; here it stands in for a leaked key.',
    oculto: 'redacted', soHead: 'HEAD only', parcial: 'partial', soHeadR: '“no secret found in what was analyzed”',
    todo: 'Full history', achL: 'findings', resumo: 'findings · {i} false positives avoided',
    rec: 'Revoke/rotate the credential NOW (Git history stays public even after removal), remove it from the code and inject it via an environment variable or a secrets vault.',
    metade: 'Finding is half the job; git filter-repo and rotation are separate work.',
    proTag: 'Pro = scope + service', voce: 'You run:', voceT: 'the secrets search on the repository you point at.', acresc: 'Pro adds:',
    proL: ['the entire organization and full Git history (not just HEAD)', 'the triage that adjudicates each finding as real or false positive', 'the per-provider rotation plan with a retest proving the credential is out of circulation', 'the LGPD evidence report'],
    msg: ['fix: move the credential out of settings', 'docs: configuration example in the README', 'feat: export report as CSV', 'ci: pin actions/checkout by SHA', 'feat: nightly backup to S3', 'refactor: split out the config layer', 'initial commit'],
  },
};

const el = (tag, cls, txt, ...filhos) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  e.append(...filhos);
  return e;
};
const mudo = (e) => (e.setAttribute('aria-hidden', 'true'), e);
const botao = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; };
const f = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null ? v[k] : m));
const ref = (i) => (i ? 'HEAD~' + i : 'HEAD');
const NF = {};
const nf = (l, d) => NF[l + d] || (NF[l + d] = new Intl.NumberFormat(l === 'en' ? 'en' : 'pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }));

const contar = (s) => { const c = {}; for (const ch of s) c[ch] = (c[ch] || 0) + 1; return c; };
function shannon(s) {
  const c = contar(s);
  let h = 0;
  for (const k in c) h -= (c[k] / s.length) * Math.log2(c[k] / s.length);
  return h;
}
const corr = (s) => (s ? shannon(s) + (new Set(s).size - 1) / (2 * s.length * Math.LN2) : 0);
function alfa(s) {
  const u = [...new Set(s)].join('');
  if (/^[0-9a-f]*$/i.test(u)) return 16;
  if (/^([a-z]*|[A-Z]*)$/.test(u)) return 26;
  if (/^([a-z0-9]*|[A-Z0-9]*)$/.test(u)) return 36;
  return /^[a-z]*$/i.test(u) ? 52 : 64;
}
function numerar(c) {
  let n = +/\+(\d+)/.exec(c.hk)[1];
  return c.L.map(([s]) => (s === '-' ? '' : n++));
}
const LOC = {}, ONDE = {};
C.forEach((c, i) => { const ns = numerar(c); c.L.forEach((l, j) => { if (c.v.includes(l[2])) { LOC[l[2]] = c.f + ':' + ns[j]; ONDE[l[2]] = i; } }); });

function planejar(i) {
  const c = C[i], p = [{ k: 'mover', d: 300 }];
  c.L.forEach((l, j) => {
    p.push({ k: 'linha', d: 70, j });
    if (c.v.includes(l[2])) p.push({ k: 'ler', d: Math.max(800, V[l[2]].length * 26), tok: l[2], j });
  });
  p.push({ k: 'fim', d: c.L.some((l) => l[0] === '-' && l[2]) ? 1400 : c.v.length ? 550 : 200 });
  return p;
}

export function montar(raiz, ctx) {
  ctx = ctx || {};
  const G = (ctx.dados && ctx.dados.suite && ctx.dados.suite.guardiao) || {};
  let lang = ctx.idioma === 'en' ? 'en' : 'pt';
  let reduzido = !!ctx.reduzido, pausado = !!ctx.pausado, visivel = true, raf = 0, antes = 0, plano = [];
  const ui = {};
  const est = { fase: 'ocioso', i: -1, vistos: new Set(), lidos: new Set(), sel: 0, tok: null, st: ['pronto'] };
  const iAch = C.findIndex((c) => c.v.some((x) => T[x].achado));
  const iRem = C.findIndex((c) => c.L.some((l) => l[0] === '-' && T[l[2]] && T[l[2]].achado));
  const nAch = Object.values(T).filter((x) => x.achado).length, nIgn = Object.keys(T).length - nAch;
  const tokFinal = C[iAch].v.find((x) => !T[x].formato) || C[iAch].v[0];
  const nHead = /* visto por um scan só do HEAD */ Object.keys(T).filter((x) => T[x].achado && C.flatMap((c) => c.L).reduce((n, l) => n + (l[2] === x) * (l[0] === '+' ? 1 : l[0] === '-' ? -1 : 0), 0) > 0).length;
  const t = (k) => TXT[lang][k];
  const n0 = (x) => nf(lang, 0).format(x), n2 = (x) => nf(lang, 2).format(x);
  const recall = () => (G.recall == null ? '—' : String(G.recall).replace(/\d+/g, (m) => n0(+m)));
  const fps = () => (typeof G.falsos_positivos === 'number' ? n0(G.falsos_positivos) : '—');
  const caixa = el('div', 'xg-raiz');
  const vivo = el('p', 'sr-only');
  vivo.setAttribute('aria-live', 'polite');
  raiz.append(caixa);

  function rico(pai, partes, v) {
    for (const p of partes) {
      if (typeof p === 'string') pai.append(f(p, v));
      else if (p[0] !== 'a') pai.append(el(p[0] === 'b' ? 'strong' : 'code', p[0] === 'c' ? 'xg-code' : null, f(p[1], v)));
      else {
        const a = el('a', 'xg-link', p[1], mudo(el('span', null, ' ↗')), el('span', 'sr-only', ' ' + t('novaAba')));
        Object.assign(a, { href: 'https://github.com/' + G.repo + '/blob/main/BENCHMARK.md', target: '_blank', rel: 'noopener' });
        pai.append(a);
      }
    }
    return pai;
  }
  const caixaH = (titulo, ...extra) => el('div', 'xg-caixa-h', null, el('h4', 'xg-h4', titulo), ...extra);
  const dupla = (tag, cls, v, rot, cr) => el(tag, cls, null, el('b', null, v), el('span', cr, rot));
  const chip = (d) => el('span', 'chip ' + (d.achado ? 'sev-high' : 'sev-ok'), t(d.achado ? 'alta' : 'ign'));
  const falar = (m) => { vivo.textContent = m; };

  function construir() {
    caixa.replaceChildren();
    vivo.textContent = '';
    ui.btn = botao('btn btn-holo xg-btn', '', () => (est.fase === 'varrendo' ? interromper() : iniciar()));
    ui.st = el('p', 'xg-st');
    ui.ptx = el('span');
    ui.pbar = mudo(el('span', 'xg-pbar'));
    ui.cursor = mudo(el('span', 'xg-cursor'));
    ui.rows = C.map((c, i) => {
      const badge = el('span', 'xg-badge');
      const b = botao('xg-commit', null, () => escolher(i));
      b.append(mudo(el('span', 'xg-no')), el('span', 'xg-l1', null, el('span', 'xg-ref', ref(i)), el('span', 'xg-hash', c.h), badge),
        el('span', 'xg-l2', null, el('span', 'xg-msg', t('msg')[i]), el('span', 'xg-autor', c.a)));
      return { li: el('li', 'xg-li', null, b), b, badge };
    });
    const ol = el('ol', 'xg-log', null, ...ui.rows.map((r) => r.li));
    ui.vida = el('p', 'xg-vida');
    ui.meta = el('p', 'xg-meta');
    ui.arq = el('p', 'xg-arq');
    ui.cod = el('div', 'xg-cod');
    ui.feixe = mudo(el('span', 'xg-feixe'));
    ui.lnome = el('span', 'xg-lnome');
    ui.lsel = el('div', 'xg-lsel');
    ui.lcorpo = el('div', 'xg-lente-c');
    ui.res = el('div', 'xg-res');
    const demo = el('section', 'xg-demo', null, el('span', 'rotulo-demo', t('demo')),
      el('div', 'xg-barra', null, ui.btn, el('code', 'xg-cmd', '$ guardiao scan . --git-history'), ui.st,
        el('div', 'xg-prog', null, ui.pbar, ui.ptx)),
      el('div', 'xg-palco', null,
        el('div', 'xg-caixa', null, caixaH('git log · ' + n0(C.length) + ' commits'), el('div', 'xg-trilho', null, ui.cursor, ol), ui.vida),
        el('div', 'xg-caixa', null, caixaH(t('diff')), ui.meta, ui.arq, ui.cod)),
      el('div', 'xg-caixa xg-lente', null, caixaH(t('lente'), ui.lnome, ui.lsel), ui.lcorpo), ui.res);
    demo.setAttribute('aria-label', t('demo'));
    const pro = el('aside', 'xg-pro', null,
      el('div', null, null, el('h4', 'xg-pro-t', 'Guardião · Pro'), el('span', 'xg-pro-tag', t('proTag')),
        el('p', 'xg-pro-p', null, el('strong', null, t('voce')), ' ' + t('voceT'))),
      el('div', null, null, el('p', 'xg-pro-p xg-pro-a', t('acresc')), el('ul', 'xg-pro-l', null, ...t('proL').map((x) => el('li', null, x)))));
    caixa.append(el('article', 'painel xg-painel', null,
      el('header', 'painel-h xg-cab', null, el('h3', 'painel-t', 'Guardião', el('span', 'chip sev-holo', t('frente'))),
        el('span', 'painel-id', [G.repo, G.linguagem, G.licenca].filter(Boolean).join(' · '))),
      el('div', 'painel-c xg-corpo', null,
        el('div', 'xg-topo', null, el('div', null, null, el('p', 'voz xg-tese', t('tese')), rico(el('p', 'xg-desc'), t('desc'), { r: recall(), f: fps() })),
          el('div', 'xg-kpis', null, dupla('div', 'xg-kpi', recall(), t('kR')), dupla('div', 'xg-kpi', fps(), t('kF')), rico(el('p', 'xg-bench'), t('bench')))),
        demo, pro)), vivo);
    medir();
    pintarTudo();
    if (est.fase === 'varrendo') progresso(plano[est.seg], est.ts / plano[est.seg].d);
  }

  function pintarTudo() { pintarBarra(); pintarLog(); pintarDiff(); pintarLente(); pintarRes(); posCursor(); }
  function pintarBarra() {
    ui.btn.textContent = t(est.fase === 'varrendo' ? 'parar' : est.fase === 'fim' ? 'btn2' : 'btn');
    ui.st.textContent = f(t(est.st[0]), { n: n0(C.length), ...est.st[1] });
    pintarProg();
  }
  function pintarProg() {
    ui.pbar.style.setProperty('--p', est.vistos.size / C.length);
    ui.ptx.textContent = n0(est.vistos.size) + '/' + n0(C.length);
  }
  const selo = (i, v = C[i].v) => (i === iRem ? el('span', 'chip sev-info', t('apagou')) : !v.length ? el('span', 'chip sev-ok', t('limpo'))
    : T[v[0]].achado ? el('span', 'chip sev-high', t('alta') + ' · ' + n0(v.length)) : chip(T[v[0]]));
  function pintarLog() {
    const vida = C[iAch].v.some((x) => est.lidos.has(x));
    ui.rows.forEach((r, i) => {
      const sel = i === est.sel, cl = r.li.classList;
      r.b.setAttribute('aria-current', String(sel));
      cl.toggle('xg-visto', est.vistos.has(i));
      cl.toggle('xg-sel', sel);
      cl.toggle('xg-v-sup', vida && i > iRem + 1 && i <= iAch);
      cl.toggle('xg-v-inf', vida && i > iRem && i < iAch);
      cl.toggle('xg-alvo', vida && i === iAch);
      r.badge.replaceChildren(...(est.vistos.has(i) ? [selo(i)] : []));
    });
    ui.vida.textContent = vida ? f(t('vida'), { de: ref(iAch), ate: ref(iRem + 1) }) : '';
  }
  function anotacao(tk) {
    const d = T[tk];
    return d.achado
      ? el('div', 'xg-nota xg-n-alta', null, chip(d), el('code', 'xg-regra', d.regra), el('span', null, 'CWE-798'), el('span', null, t('oculto') + ': ' + V[tk].slice(0, 4) + '…' + V[tk].slice(-4)))
      : el('div', 'xg-nota xg-n-ok', null, chip(d), el('span', null, t(d.v)));
  }
  const notaHead = () => rico(el('p', 'xg-nota xg-n-info'), t('notaHead'));
  function revelar(tk, ln) {
    const sp = ui.tks[tk];
    sp.classList.add(T[tk].achado ? 'xg-alvo' : 'xg-ign');
    sp.classList.toggle('xg-foco', tk === est.tok);
    ln.after(anotacao(tk));
  }
  function pintarDiff() {
    const i = est.sel, c = C[i], ns = numerar(c), varrendo = est.fase === 'varrendo' && i === est.i && !est.vistos.has(i);
    ui.meta.replaceChildren(el('span', 'xg-mh', 'commit ' + c.h + ' (' + ref(i) + ') · ' + c.a), el('span', 'xg-msgd', t('msg')[i]));
    ui.arq.replaceChildren(el('span', null, c.f), el('span', null, c.hk));
    ui.cod.classList.toggle('xg-varrendo', varrendo);
    ui.cod.replaceChildren(ui.feixe);
    ui.linhas = [];
    ui.tks = {};
    c.L.forEach(([s, a, tk, b], j) => {
      const tx = el('span', 'xg-tx', a);
      const ln = el('div', 'xg-ln' + (s === '+' ? ' xg-mais' : s === '-' ? ' xg-menos' : ''), null, el('span', 'xg-num', ns[j]), el('span', 'xg-sig', s === '-' ? '−' : s.trim()), tx);
      ln.classList.toggle('xg-lida', varrendo && j <= est.linha);
      ui.cod.append(ln);
      ui.linhas.push(ln);
      if (!tk) return;
      tx.append((ui.tks[tk] = el('span', 'xg-tk', V[tk])), b || '');
      if (c.v.includes(tk) && est.lidos.has(tk)) revelar(tk, ln);
    });
    if (i === iRem && est.vistos.has(i)) ui.cod.append(notaHead());
    medirLinhas();
  }
  function lendoTok() {
    const sg = est.fase === 'varrendo' && est.sel === est.i && plano[est.seg];
    return sg && sg.k === 'ler' && !est.lidos.has(sg.tok) ? sg.tok : null;
  }
  function pintarLente() {
    const c = C[est.sel], lendo = lendoTok(), lidos = c.v.filter((x) => est.lidos.has(x));
    const tk = lendo || (lidos.includes(est.tok) ? est.tok : lidos.find((x) => !T[x].formato) || lidos[0]);
    ui.lsel.replaceChildren();
    ui.lcorpo.replaceChildren();
    ui.lv = null;
    ui.km = -1;
    ui.lnome.textContent = tk ? T[tk].regra + ' · ' + LOC[tk] + ' · ' + ref(est.sel) : '';
    if (!tk) return ui.lcorpo.append(el('p', 'xg-vazio', t(!est.vistos.has(est.sel) ? 'lenteIdle' : est.sel === iRem ? 'lenteHead' : 'lenteNada')));
    est.tok = tk;
    if (lidos.length > 1 && !lendo) {
      for (const x of lidos) {
        const b = botao('xg-tb', T[x].regra, () => escolherTok(x));
        b.setAttribute('aria-pressed', String(x === tk));
        ui.lsel.append(b);
        if (x === tk && ui.focarTok) b.focus();
      }
    }
    ui.focarTok = false;
    const formato = T[tk].formato;
    const lv = { H: el('b'), car: el('span', 'xg-un'), N: el('b'), calc: el('span', 'xg-un'), v: el('div', 'xg-ver') };
    lv.cells = mudo(el('div', 'xg-celulas', null, ...[...V[tk]].map((ch, j) => {
      const cel = el('span', 'xg-cel', null, el('span', null, null, el('i')), el('b', null, ch));
      cel.style.setProperty('--n', j);
      return cel;
    })));
    lv.g = el('span', 'xg-gauge' + (formato ? ' xg-sem-lim' : ''), null, el('span', 'xg-lim', formato ? t('formato') : t('lim') + ' ' + n2(LIMIAR)));
    lv.g.style.setProperty('--lim', LIMIAR);
    ui.lcorpo.append(lv.cells, el('p', 'xg-leg', t('legenda')),
      el('div', 'xg-leit', null, el('div', 'xg-g', null, el('span', 'xg-gl', 'Shannon H'), lv.H, lv.car), el('div', 'xg-g', null, el('span', 'xg-gl', t('norm')), lv.N, lv.g, lv.calc), lv.v));
    if (T[tk].achado) ui.lcorpo.append(el('p', 'xg-real', t('real')));
    ui.lv = lv;
    leitura();
  }
  function leitura() {
    const lv = ui.lv, s = V[est.tok], lendo = lendoTok() === est.tok;
    const m = lendo ? Math.max(1, Math.min(s.length, Math.ceil(est.k))) : s.length, p = s.slice(0, m), cont = contar(p), A = alfa(p), hc = corr(p), nv = Math.min(1, hc / Math.log2(A));
    [...p].forEach((ch, j) => lv.cells.children[j].style.setProperty('--s', (Math.log2(m / cont[ch]) / BITS).toFixed(3)));
    lv.cells.style.setProperty('--h', (shannon(p) / BITS).toFixed(3));
    if (lendo) lv.cells.style.setProperty('--k', est.k.toFixed(2));
    lv.H.textContent = n2(shannon(p));
    lv.car.textContent = t('bitsC') + ' · ' + f(t('car'), { n: (lendo ? n0(m) + '/' : '') + n0(s.length) });
    lv.N.textContent = n2(nv);
    lv.calc.textContent = n2(hc) + ' ÷ log₂ ' + n0(A);
    lv.g.style.setProperty('--v', nv.toFixed(3));
    lv.v.replaceChildren(...(lendo ? [] : [chip(T[est.tok]), el('span', 'xg-vtx', t(T[est.tok].v))]));
  }
  function pintarRes() {
    if (est.fase !== 'fim') return ui.res.replaceChildren();
    ui.res.replaceChildren(
      el('div', 'xg-res-c', null, el('h4', 'xg-hd', t('soHead')), dupla('p', 'xg-big', n0(nHead), t('achL'), 'xg-un'),
        el('p', 'xg-rl', null, el('span', 'chip sev-info', t('parcial')), el('span', null, t('soHeadR')))),
      el('div', 'xg-res-c xg-r-hist', null, el('h4', 'xg-hd', t('todo')), dupla('p', 'xg-big', n0(nAch), f(t('resumo'), { i: n0(nIgn) }), 'xg-un'),
        el('ul', 'xg-rlist', null, ...Object.keys(T).map((x) => {
          const d = T[x], i = ONDE[x];
          return el('li', 'xg-rl', null, chip(d), el('code', 'xg-regra', d.achado ? d.regra : V[x].length > 20 ? V[x].slice(0, 8) + '…' : V[x]),
            el('span', null, (d.achado ? LOC[x] + ' · ' + C[i].h : t(d.v)) + ' · ' + ref(i)));
        }))),
      el('p', 'xg-rec', null, el('strong', null, t('rec')), ' ' + t('metade')));
  }

  const caixas = (a) => (a || []).map((e) => [e.offsetTop, e.offsetHeight]);
  function medir() { ui.rt = caixas(ui.rows.map((r) => r.li)); medirLinhas(); }
  function medirLinhas() { ui.lt = caixas(ui.linhas); }
  function cursorEm(y, h) {
    est.cy = y;
    est.ch = h;
    ui.cursor.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
    ui.cursor.style.height = h.toFixed(1) + 'px';
  }
  function posCursor() { const r = ui.rt && ui.rt[est.sel]; if (r) cursorEm(r[0], r[1]); }

  const rodando = () => est.fase === 'varrendo' && !pausado && visivel && !reduzido;
  function ligar() { if (!raf && rodando()) { antes = 0; raf = requestAnimationFrame(quadro); } }
  function desligar() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function quadro(agora) {
    raf = 0;
    if (!rodando()) return;
    avancar(antes ? Math.min(64, agora - antes) : 16);
    antes = agora;
    if (rodando()) raf = requestAnimationFrame(quadro);
  }
  function avancar(dt) {
    est.ts += dt;
    for (;;) {
      const sg = plano[est.seg];
      if (est.ts < sg.d) return progresso(sg, est.ts / sg.d);
      est.ts -= sg.d;
      sair(sg);
      if (++est.seg < plano.length) { entrar(plano[est.seg]); continue; }
      if (est.i + 1 >= C.length) return finalizar(true);
      const resto = est.ts;
      passo(est.i + 1);
      est.ts = resto;
    }
  }
  function passo(i) {
    Object.assign(est, { i, sel: i, seg: 0, ts: 0, linha: -1, k: 0, y0: est.cy, h0: est.ch, st: ['lendo', { h: C[i].h, ref: ref(i) }] });
    plano = planejar(i);
    pintarBarra();
    pintarLog();
    pintarDiff();
    pintarLente();
    entrar(plano[0]);
  }
  function entrar(sg) {
    if (sg.k === 'linha') { est.linha = sg.j; ui.linhas[sg.j].classList.add('xg-lida'); }
    else if (sg.k === 'ler') { est.tok = sg.tok; est.k = 0; pintarLente(); }
    else if (sg.k === 'fim') {
      const i = est.i, v = C[i].v;
      est.vistos.add(i);
      ui.cod.classList.remove('xg-varrendo');
      if (i === iRem) ui.cod.append(notaHead());
      pintarLog();
      pintarProg();
      if (!v.length) pintarLente();
      if (i === iRem) falar(t('evHead'));
      else if (v.length) falar(ref(i) + ': ' + t(T[v[0]].achado ? 'alta' : 'ign') + ' · ' + v.map((x) => T[x].regra).join(', '));
    }
  }
  function sair(sg) {
    if (sg.k === 'mover') posCursor();
    if (sg.k !== 'ler') return;
    est.lidos.add(sg.tok);
    est.k = V[sg.tok].length;
    revelar(sg.tok, ui.linhas[sg.j]);
    medirLinhas();
    pintarLente();
    if (T[sg.tok].achado) pintarLog();
  }
  function progresso(sg, p) {
    if (sg.k === 'mover') {
      const r = ui.rt[est.i] || [0, 0], e = 1 - Math.pow(1 - p, 3);
      return cursorEm(est.y0 + (r[0] - est.y0) * e, est.h0 + (r[1] - est.h0) * e);
    }
    const l = ui.lt[sg.j];
    if (sg.k === 'fim' || !l) return;
    ui.feixe.style.transform = 'translateY(' + (l[0] + l[1] * (sg.k === 'ler' ? 1 : p) - 30).toFixed(1) + 'px)';
    if (sg.k !== 'ler' || !ui.lv) return;
    est.k = p * V[sg.tok].length;
    ui.lv.cells.style.setProperty('--k', est.k.toFixed(2));
    const m = Math.ceil(est.k);
    if (m === ui.km) return;
    ui.km = m;
    leitura();
  }

  function iniciar() {
    est.vistos.clear();
    est.lidos.clear();
    est.tok = null;
    if (reduzido || pausado) return finalizar(true);
    est.fase = 'varrendo';
    falar(f(t('ev0'), { n: n0(C.length) }));
    passo(0);
    pintarRes();
    ligar();
  }
  function finalizar(anunciar) {
    desligar();
    C.forEach((c, i) => { est.vistos.add(i); c.v.forEach((x) => est.lidos.add(x)); });
    Object.assign(est, { fase: 'fim', i: -1, sel: iAch, tok: tokFinal, k: 0, st: ['evFim', { a: n0(nAch), i: n0(nIgn) }] });
    pintarTudo();
    if (anunciar) falar(ui.st.textContent);
  }
  function interromper() {
    if (est.fase !== 'varrendo') return;
    desligar();
    const r = ref(est.i);
    Object.assign(est, { fase: 'ocioso', i: -1, st: ['evInt', { ref: r }] });
    falar(f(t('evInt'), { ref: r }));
    pintarTudo();
  }
  function escolher(j) {
    interromper();
    est.sel = j;
    if (!C[j].v.includes(est.tok)) est.tok = null;
    pintarLog();
    pintarDiff();
    pintarLente();
    posCursor();
  }
  function escolherTok(x) {
    est.tok = x;
    for (const k in ui.tks) ui.tks[k].classList.toggle('xg-foco', k === x);
    ui.focarTok = true;
    pintarLente();
  }

  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => { visivel = es[es.length - 1].isIntersecting; if (visivel) ligar(); else desligar(); }) : null;
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { medir(); if (est.fase !== 'varrendo') posCursor(); }) : null;
  construir();
  if (reduzido) finalizar(false);
  if (io) io.observe(caixa);
  if (ro) ro.observe(caixa);

  return {
    pausar(b) { pausado = !!b; if (pausado) desligar(); else ligar(); },
    idioma(l) { lang = l === 'en' ? 'en' : 'pt'; construir(); },
    reduzir(b) { reduzido = !!b; if (reduzido && est.fase !== 'fim') finalizar(false); else ligar(); },
    destruir() { desligar(); if (io) io.disconnect(); if (ro) ro.disconnect(); caixa.remove(); },
  };
}
