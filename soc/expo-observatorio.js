/* expo-observatorio · "a deriva" — 100% dado real (série pública). Linha = spark (amostra); faixa = mín–máx de
   todas as leituras. Ponto do meio não tem data no dado: só as pontas do eixo X são datadas. */

const TXT = {
  pt: {
    loc: 'pt-BR',
    sobre: 'Vigilância · Observatório da Superfície',
    tit: 'A deriva',
    tese: 'Um relatório tirado num dia só diz como o alvo estava naquele dia. O que interessa é a deriva — e ela só aparece medindo todo dia e comparando.',
    lead: ['Leitura passiva e contínua de cabeçalhos, TLS, DNS e Certificate Transparency num punhado de alvos próprios e de referência, ', 'guardada como série temporal', '. Roda sozinho no GitHub Actions, público.'],
    selo: 'dado real · série pública do repositório',
    ult: 'última coleta',
    gh: 'Ver no GitHub', aba: ' (abre em nova aba)',
    k: ['coletas', 'leituras', 'alvos', 'instantâneos de mudança', 'taxa conclusiva'],
    kn: [(d) => `agenda de hora em hora · desde ${d}`, () => 'uma por alvo, por coleta', (d, p, r) => `${p} próprio · ${r} de referência`, () => 'guardados só quando algo muda', () => 'ok ÷ (ok + inconclusivo)'],
    gt: 'Nota de postura por alvo', gid: 'escala 0–10 · dados/serie.jsonl',
    lgl: 'Alvos: cada botão liga ou desliga a linha',
    cls: { proprio: 'próprio', referencia: 'referência' },
    delta: 'mudou na última coleta',
    ordem: 'ordem de coleta', faixa: 'mín–máx',
    vale: (v) => `mínimo registrado: ${v}`,
    vale2: (n) => `fora da amostra de ${n} pontos`,
    casa: 'meu site',
    cap: (n) => `Linha: amostra de ${n} pontos por alvo, da primeira à última coleta; os pontos do meio não carregam data. Faixa (mín–máx): a menor e a maior nota de todas as leituras.`,
    aviso: 'A nota de 0 a 10 mede postura de cabeçalho observável de fora — não é uma avaliação de segurança da organização. Serve para ver a deriva de um mesmo alvo; comparar alvos pela nota é usar o instrumento fora do que ele mede.',
    casat: (v) => `Meu site fica em ${v} por limite da hospedagem: o GitHub Pages não deixa configurar cabeçalho de resposta — e a nota reflete isso.`,
    sl: 'percorrer a série (setas, Home, End)',
    pt: (i, n) => `ponto ${i} de ${n}`,
    vazio: 'Nenhum alvo ligado — ative um na legenda.',
    vt: 'Ver como tabela', ot: 'Ocultar tabela',
    th: ['Alvo', 'Classe', 'Nota atual', 'Mín.', 'Máx.', 'Leituras'],
    mt: 'Sondas na última coleta',
    mid: (a, b, c) => `${a}/${b} conclusivas · ${c} puladas`,
    so: { porta80: 'porta 80', cabecalhos: 'cabeçalhos', tls: 'TLS', security_txt: 'security.txt', dns: 'DNS', transparencia_certificados: 'CT' },
    st: { ok: 'ok', inconclusivo: 'inconclusivo', pulada: 'pulada' },
    sx: { ok: 'mediu', inconclusivo: 'tentou e não conseguiu medir', pulada: 'não houve tentativa nesta coleta' },
    frase: 'Inconclusivo significa que a sonda não conseguiu medir — não é o mesmo que ausente.',
    ct: 'CT (Transparência de Certificados) é sonda diária: só roda na coleta completa.',
    hist: 'Na série inteira',
    taxa: (p) => `${p} conclusiva = ok ÷ (ok + inconclusivo). Pulada fica fora da conta: não houve tentativa.`,
    voz: 'Não medir e medir-e-não-achar são fatos diferentes.',
    dt: 'Diário de mudanças', did: (n) => `${n} registros · diario/`,
    ucm: 'No instantâneo da última coleta, mudaram:',
    oq: (s) => s,
    rg: 'Régua de admissão',
    rgt: 'Só entra alvo próprio ou com programa público de divulgação.',
    rgd: 'Nenhum alvo é observado sem política pública que autorize a observação.',
    rgl: 'Regras de engajamento',
  },
  en: {
    loc: 'en',
    sobre: 'Surveillance · Surface Observatory',
    tit: 'The drift',
    tese: 'A report taken on a single day only says how the target looked that day. What matters is the drift — and it only shows up by measuring every day and comparing.',
    lead: ['Passive, continuous reading of headers, TLS, DNS, and Certificate Transparency across a handful of my own and reference targets, ', 'kept as a time series', '. Runs on its own in GitHub Actions, public.'],
    selo: 'real data · the repository’s public series',
    ult: 'last collection',
    gh: 'View on GitHub', aba: ' (opens in a new tab)',
    k: ['collections', 'readings', 'targets', 'change snapshots', 'conclusive rate'],
    kn: [(d) => `scheduled hourly · since ${d}`, () => 'one per target, per collection', (d, p, r) => `${p} own · ${r} reference`, () => 'kept only when something changes', () => 'ok ÷ (ok + inconclusive)'],
    gt: 'Posture score per target', gid: '0–10 scale · dados/serie.jsonl',
    lgl: 'Targets: each button turns its line on or off',
    cls: { proprio: 'own', referencia: 'reference' },
    delta: 'changed in the last collection',
    ordem: 'collection order', faixa: 'min–max',
    vale: (v) => `lowest recorded: ${v}`,
    vale2: (n) => `outside the ${n}-point sample`,
    casa: 'my site',
    cap: (n) => `Line: a ${n}-point sample per target, from the first to the latest collection; the points in between carry no date. Range (min–max): the lowest and highest score across all readings.`,
    aviso: 'The 0–10 score measures header posture observable from outside — it is not an assessment of the organization’s security. It exists to show the drift of one target; comparing targets by score is using the instrument outside what it measures.',
    casat: (v) => `My site sits at ${v} because of a hosting limit: GitHub Pages doesn’t let you set response headers — and the score reflects that.`,
    sl: 'scrub the series (arrows, Home, End)',
    pt: (i, n) => `point ${i} of ${n}`,
    vazio: 'No target on — turn one on in the legend.',
    vt: 'View as table', ot: 'Hide table',
    th: ['Target', 'Class', 'Current score', 'Min', 'Max', 'Readings'],
    mt: 'Probes in the latest collection',
    mid: (a, b, c) => `${a}/${b} conclusive · ${c} skipped`,
    so: { porta80: 'port 80', cabecalhos: 'headers', tls: 'TLS', security_txt: 'security.txt', dns: 'DNS', transparencia_certificados: 'CT' },
    st: { ok: 'ok', inconclusivo: 'inconclusive', pulada: 'skipped' },
    sx: { ok: 'measured', inconclusivo: 'tried and couldn’t measure', pulada: 'not attempted in this collection' },
    frase: 'Inconclusive means the probe couldn’t measure — it is not the same as absent.',
    ct: 'CT (Certificate Transparency) is a daily probe: it only runs in the full collection.',
    hist: 'Across the whole series',
    taxa: (p) => `${p} conclusive = ok ÷ (ok + inconclusive). Skipped stays out of the count: nothing was attempted.`,
    voz: 'Not measuring and measuring-and-not-finding are different facts.',
    dt: 'Change log', did: (n) => `${n} entries · diario/`,
    ucm: 'In the latest collection’s snapshot, these changed:',
    // o dado vem em PT; só a forma muda
    oq: (s) => (s === 'mudou de valor' ? 'changed value' : s.startsWith('mudou de política') ? 'changed policy (the set of directives/tokens, not just the order)' : s),
    rg: 'Admission rule',
    rgt: 'Only targets I own or ones with a public disclosure program get in.',
    rgd: 'No target is observed without a public policy that authorizes the observation.',
    rgl: 'Rules of engagement',
  },
};

// cor (ver .css) + traço seguem a ENTIDADE, nunca a posição
const SLOT = ['owasp.org', 'www.cloudflare.com', 'github.com', 'www.mozilla.org', 'web.dev', 'paulo-marcos-lucio.github.io'];
const TRACO = ['10 5', '10 4 2 4', '5 4', '1 5', '10 4 2 4 2 4', ''];
const SONDAS = ['porta80', 'cabecalhos', 'tls', 'security_txt', 'dns', 'transparencia_certificados'];
const CHIP = { ok: 'sev-ok', inconclusivo: 'sev-med xo-inc', pulada: 'xo-pul' };
const EST = ['ok', 'inconclusivo', 'pulada'];
const DUR = 1700;

const el = (t, c, p, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; if (p) p.append(e); return e; };
const sv = (t, a, p) => { const e = document.createElementNS('http://www.w3.org/2000/svg', t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.append(e); return e; };
const oc = (e) => (e.setAttribute('aria-hidden', 'true'), e);

export function montar(raiz, ctx) {
  const D = ctx.dados || {}, O = D.observatorio || {}, SER = O.serie || {}, SO = O.sondas || {};
  const repo = 'https://github.com/' + (((D.suite || {}).observatorio || {}).repo || 'Paulo-Marcos-Lucio/observatorio-da-superficie');
  let T = TXT[ctx.idioma === 'en' ? 'en' : 'pt'];
  let pausado = !!ctx.pausado, reduzido = !!ctx.reduzido, vis = false, p = reduzido ? 1 : 0, raf = 0, ult = 0;
  let larg = 0, idx = -1, fL = null, fP = null, G = null;
  const U = 'xo' + Math.random().toString(36).slice(2, 7), FN = [];
  const on = (f) => { FN.push(f); f(); };
  const tx = (e, f) => (on(() => { e.textContent = f(T); }), e);
  const nf = (n, o) => new Intl.NumberFormat(T.loc, o).format(n);
  const n1 = (v) => (v == null ? '—' : nf(v, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  const pc = (v) => nf(v, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const INI = new Date(O.inicio), FIM = new Date(O.ultima);
  const dtf = (o) => new Intl.DateTimeFormat(T.loc, { timeZone: 'UTC', ...o });
  const dpt = (d, ano) => {
    if (isNaN(d)) return '—';
    const q = {};
    for (const x of dtf({ day: 'numeric', month: 'short', year: ano ? 'numeric' : undefined }).formatToParts(d)) q[x.type] = x.value;
    return [q.day, q.month.replace('.', ''), q.year].filter(Boolean).join(' ');
  };
  const rel = (d) => {
    const s = Math.max(0, (Date.now() - d) / 1e3), r = new Intl.RelativeTimeFormat(T.loc, { numeric: 'auto' });
    return s < 3600 ? r.format(-Math.round(s / 60), 'minute') : s < 172800 ? r.format(-Math.round(s / 3600), 'hour') : r.format(-Math.round(s / 86400), 'day');
  };
  const link = (a, href) => { a.href = href; a.target = '_blank'; a.rel = 'noopener'; tx(el('span', 'sr-only', a), (T) => T.aba); };

  /* ---- séries: cor pela entidade; ordem de exibição = nota atual (espelha a vertical do gráfico) ---- */
  const S = Object.keys(SER).map((h) => ({ ...SER[h], h, k: SLOT.indexOf(h), d: [] }));
  for (const s of S) if (s.k < 0) s.k = [0, 1, 2, 3, 4, 5].find((i) => !S.some((o) => o.k === i)) ?? 0;
  S.sort((a, b) => (b.nota_atual ?? -1) - (a.nota_atual ?? -1));
  const N = Math.max(2, ...S.map((s) => (s.spark || []).length));
  const val = (s, i) => { const a = s.spark || []; return a.length ? a[Math.round((i * (a.length - 1)) / (N - 1))] : null; };
  const nP = S.filter((s) => s.classe === 'proprio').length, nR = S.length - nP;
  const casa = S.find((s) => s.classe === 'proprio');
  const mud = new Set(O.ultima_coleta_mudaram || []);
  const DET = O.detalhes || [];
  const cont = { ok: 0, inconclusivo: 0, pulada: 0 };
  for (const s of S) for (const k of SONDAS) { const st = (s.sondas_atuais || {})[k]; if (st in cont) cont[st]++; }
  const cls = (s) => T.cls[s.classe] || s.classe || '';

  raiz.textContent = '';
  const R = el('div', 'xo-raiz', raiz);
  R.classList.toggle('xo-red', reduzido);
  R.classList.toggle('xo-p', pausado);
  const painel = (c, ft, fi) => {
    const pn = el('section', 'painel ' + c, R), h = el('div', 'painel-h', pn);
    tx(el('h4', 'painel-t', h), ft);
    tx(el('span', 'painel-id', h), fi);
    return pn;
  };

  /* ---- topo: frase do README + suite6.desc do site + rótulo de dado real ---- */
  const topo = el('div', 'xo-topo', R), t1 = el('div', 'xo-t1', topo), t2 = el('div', 'xo-t2', topo);
  tx(el('p', 'xo-sobre', t1), (T) => T.sobre);
  tx(el('h3', 'xo-titulo', t1), (T) => T.tit);
  tx(el('p', 'xo-tese', t1), (T) => T.tese);
  const lead = el('p', 'xo-lead', t1), la = el('span', '', lead), lb = el('strong', '', lead), lc = el('span', '', lead);
  on(() => { [la.textContent, lb.textContent, lc.textContent] = T.lead; });
  const selo = el('p', 'xo-selo', t2);
  oc(el('span', 'xo-ponto', selo));
  tx(el('span', '', selo), (T) => T.selo);
  tx(el('p', 'xo-qd', t2), (T) => (isNaN(FIM) ? '' : `${T.ult} ${dpt(FIM, 1)} · ${dtf({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(FIM)} UTC · ${rel(FIM)}`));
  const gh = el('a', 'btn xo-gh', t2);
  tx(el('span', '', gh), (T) => T.gh);
  oc(el('span', '', gh, '↗'));
  link(gh, repo);

  /* ---- contadores: o número exato, sem contagem encenada ---- */
  const kp = el('div', 'painel xo-kpis', R);
  [O.coletas, O.leituras, O.alvos, O.instantaneos_de_mudanca, O.taxa_conclusiva].forEach((v, i) => {
    const c = el('div', 'xo-k', kp);
    tx(el('p', 'xo-kl', c), (T) => T.k[i]);
    tx(el('p', 'xo-kv', c), () => (v == null ? '—' : i === 4 ? pc(v) : nf(v)));
    tx(el('p', 'xo-kn', c), (T) => T.kn[i](dpt(INI, 1), nf(nP), nf(nR)));
  });

  /* ---- gráfico: legenda-filtro, série, faixa registrada, cursor ---- */
  const pg = painel('xo-pg', (T) => T.gt, (T) => T.gid);
  const lgs = el('div', 'xo-lgs', pg);
  lgs.setAttribute('role', 'group');
  on(() => lgs.setAttribute('aria-label', T.lgl));
  const gw = el('div', 'xo-graf', pg);
  const svg = oc(sv('svg', { class: 'xo-svg', focusable: 'false' }, gw));
  const hit = el('div', 'xo-hit', gw);
  hit.tabIndex = 0;
  for (const [k, v] of [['role', 'slider'], ['aria-valuemin', 1], ['aria-valuemax', N], ['aria-valuenow', N]]) hit.setAttribute(k, v);
  on(() => hit.setAttribute('aria-label', T.gt + ' — ' + T.sl));
  const tip = oc(el('div', 'xo-tip', gw)), tph = el('p', 'xo-tph', tip);
  tx(el('p', 'xo-vazio', gw), (T) => T.vazio);

  for (const s of S) {
    const b = el('button', 'xo-lg xo-c' + s.k, lgs), key = oc(sv('svg', { class: 'xo-key', viewBox: '0 0 30 8' }, b));
    b.type = 'button';
    b.setAttribute('aria-pressed', 'true');
    sv('line', { x1: 2, y1: 4, x2: 28, y2: 4, 'stroke-dasharray': TRACO[s.k] || 'none' }, key);
    const t = el('span', 'xo-lt', b);
    el('span', 'xo-lh', t, s.h);
    const m = el('span', 'xo-lc', t);
    tx(el('span', '', m), () => cls(s));
    if (mud.has(s.h)) {
      const d = el('span', 'xo-d', m);
      oc(el('span', '', d, 'Δ'));
      tx(el('span', '', d), (T) => T.delta);
    }
    tx(el('span', 'xo-lv', b), () => n1(s.nota_atual));
    const row = el('p', 'xo-tpr xo-c' + s.k, tip);
    oc(el('i', 'xo-tk', row));
    s.tv = el('b', '', row);
    el('span', '', row, s.h);
    Object.assign(s, { b, row });
    b.addEventListener('click', () => {
      s.off = !s.off;
      b.setAttribute('aria-pressed', String(!s.off));
      vivos();
    });
    for (const [ev, f] of [['pointerenter', s], ['pointerleave', null], ['focus', s], ['blur', null]]) b.addEventListener(ev, () => foco(f, 1));
  }

  const rod = el('div', 'xo-rod', pg), cap = el('div', 'xo-cap', rod);
  tx(el('p', '', cap), (T) => T.cap(nf(N)));
  if (casa) tx(el('p', '', cap), (T) => T.casat(n1(casa.nota_atual)));
  tx(el('p', 'xo-av', cap), (T) => T.aviso);
  const bt = el('button', 'btn xo-bt', rod);
  bt.type = 'button';
  bt.setAttribute('aria-expanded', 'false');
  bt.setAttribute('aria-controls', U + 't');
  oc(el('span', '', bt, '▦'));
  const btT = tx(el('span', '', bt), (T) => (bt.getAttribute('aria-expanded') === 'true' ? T.ot : T.vt));
  const tw = el('div', 'xo-tw sr-only', pg);
  tw.id = U + 't';
  const tb = el('table', 'xo-tb', tw);
  tx(el('caption', '', tb), (T) => T.gt);
  const th0 = el('tr', '', el('thead', '', tb)), tbo = el('tbody', '', tb);
  T.th.forEach((_, i) => { const c = el('th', '', th0); c.scope = 'col'; tx(c, (T) => T.th[i]); });
  for (const s of S) {
    const r = el('tr', '', tbo), c = el('th', '', r);
    c.scope = 'row';
    oc(el('i', 'xo-sw xo-c' + s.k, c));
    c.append(s.h);
    tx(el('td', '', r), () => cls(s));
    for (const k of ['nota_atual', 'nota_min', 'nota_max']) tx(el('td', '', r), () => n1(s[k]));
    tx(el('td', '', r), () => nf(s.leituras ?? 0));
  }
  bt.addEventListener('click', () => {
    const ab = bt.getAttribute('aria-expanded') !== 'true';
    bt.setAttribute('aria-expanded', String(ab));
    tw.classList.toggle('sr-only', !ab);
    btT.textContent = ab ? T.ot : T.vt;
  });

  /* ---- matriz de sondas (última coleta) + a série inteira ---- */
  const pm = painel('xo-mx', (T) => T.mt, (T) => T.mid(nf(cont.ok), nf(cont.ok + cont.inconclusivo), nf(cont.pulada)));
  const mg = el('div', 'xo-mxg', pm), mt = el('table', 'xo-mt', el('div', 'xo-mw', mg));
  tx(el('caption', 'sr-only', mt), (T) => T.mt);
  const mh = el('tr', '', el('thead', '', mt)), mb = el('tbody', '', mt);
  el('td', '', mh);
  for (const k of SONDAS) { const c = el('th', '', mh); c.scope = 'col'; tx(c, (T) => T.so[k]); }
  for (const s of S) {
    const r = el('tr', 'xo-mr xo-c' + s.k, mb), c = el('th', '', r);
    c.scope = 'row';
    oc(el('i', 'xo-sw', c));
    c.append(s.h);
    for (const k of SONDAS) {
      const st = (s.sondas_atuais || {})[k], td = el('td', '', r);
      tx(el('span', 'xo-cl', td), (T) => T.so[k]);
      tx(el('span', 'chip ' + (CHIP[st] || 'sev-info'), td), (T) => T.st[st] || st || '—');
    }
    s.d.push(r);
  }
  const mc = el('div', 'painel-c xo-mn', mg), ml = el('ul', 'xo-ml', mc);
  for (const k of EST) {
    const li = el('li', '', ml);
    tx(el('span', 'chip ' + CHIP[k], li), (T) => T.st[k]);
    tx(el('span', '', li), (T) => T.sx[k]);
  }
  tx(el('p', 'xo-frase', mc), (T) => T.frase);
  tx(el('p', 'xo-nt', mc), (T) => T.ct);
  const hs = el('div', 'xo-hs', mc);
  tx(el('p', 'xo-sub', hs), (T) => T.hist);
  const hb = oc(el('div', 'xo-hb', hs)), hl = el('ul', 'xo-hl', hs);
  for (const k of EST) {
    el('i', 'xo-h' + k[0], hb).style.flexGrow = SO[k] || 0;
    tx(el('li', 'xo-h' + k[0], hl), (T) => `${nf(SO[k] || 0)} ${T.st[k]}`);
  }
  if (O.taxa_conclusiva != null) tx(el('p', 'xo-nt', hs), (T) => T.taxa(pc(O.taxa_conclusiva)));
  tx(el('p', 'voz xo-voz', mc), (T) => T.voz);

  /* ---- diário de mudanças (observatorio.detalhes, como veio do repositório) ---- */
  const pd = painel('xo-dia', (T) => T.dt, (T) => T.did(nf(DET.length)));
  const dc = el('div', 'painel-c', pd), um = el('p', 'xo-um', dc);
  tx(el('span', 'xo-uml', um), (T) => T.ucm);
  const alvo = (h, c, pai) => {
    const s = S.find((q) => q.h === h), e = el(c === 'xo-umb' ? 'span' : 'li', c + (s ? ' xo-c' + s.k : ''), pai);
    const n = c === 'xo-umb' ? e : el('span', 'xo-dh', e);
    oc(el('i', 'xo-sw', n));
    n.append(h);
    if (s) s.d.push(e);
    return e;
  };
  for (const h of mud) alvo(h, 'xo-umb', um);
  const ol = el('ol', 'xo-dl', dc);
  let dia = null, ul = null;
  for (const d of DET) {
    if (d.dia !== dia) {
      dia = d.dia;
      const li = el('li', 'xo-dd', ol), tm = el('time', 'xo-dt', li);
      tm.dateTime = d.dia;
      tx(tm, () => dpt(new Date(d.dia)));
      ul = el('ul', 'xo-de', li);
    }
    const it = alvo(d.alvo, 'xo-di', ul);
    el('code', 'xo-dit', it, d.item);
    tx(el('span', 'xo-doq', it), (T) => T.oq(d.o_que));
  }
  for (const s of S) for (const e of s.d) { e.addEventListener('pointerenter', () => foco(s, 1)); e.addEventListener('pointerleave', () => foco(null, 1)); }

  /* ---- régua de admissão ---- */
  const rg = el('div', 'painel xo-rg', R);
  tx(el('p', 'xo-rgk', rg), (T) => T.rg);
  tx(el('p', 'xo-rgt', rg), (T) => T.rgt);
  const rc = el('p', 'xo-rgc', rg);
  tx(el('span', 'chip sev-holo', rc), (T) => `${nf(nP)} ${T.cls.proprio}`);
  tx(el('span', 'chip sev-info', rc), (T) => `${nf(nR)} ${T.cls.referencia}`);
  tx(el('p', 'xo-rgd', rg), (T) => T.rgd);
  const rl = el('a', 'xo-rgl', rg);
  tx(el('span', '', rl), (T) => T.rgl);
  oc(el('span', '', rl, '↗'));
  link(rl, repo + '/blob/main/REGRAS-DE-ENGAJAMENTO.md');

  /* ---- desenho do gráfico (refeito no resize e na troca de idioma) ---- */
  function desenhar() {
    if (!larg) return;
    const W = Math.max(260, larg), m = W < 600, H = m ? 210 : 320, t0 = 16, n = S.length, pw = m ? 9 : 13;
    const x0 = m ? 24 : 32, x1 = W - n * pw - (m ? 26 : 32), yx = t0 + H + 20, gx = x1 + 12;
    const Y = (v) => t0 + ((10 - v) / 10) * H, X = (i) => x0 + (i / (N - 1)) * (x1 - x0);
    const txt = (a, s) => { sv('text', a, svg).textContent = s; };
    svg.textContent = '';
    gw.classList.toggle('xo-m', m);
    for (const [k, v] of [['viewBox', `0 0 ${W} ${t0 + H + 30}`], ['width', W], ['height', t0 + H + 30]]) svg.setAttribute(k, v);
    for (const [k, v] of [['--l', x0], ['--t', t0], ['--w', x1 - x0], ['--h', H]]) gw.style.setProperty(k, v + 'px');
    const clip = sv('rect', { height: t0 + H + 8, width: 0 }, sv('clipPath', { id: U + 'c' }, sv('defs', {}, svg)));
    for (let v = 0; v <= 10; v += 2) {
      sv('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), class: v ? 'xo-gr' : 'xo-gr xo-base' }, svg);
      txt({ x: x0 - 8, y: Y(v) + 3.5, 'text-anchor': 'end', class: 'xo-yt' }, nf(v));
    }
    txt({ x: x0, y: yx, class: 'xo-xt' }, dpt(INI, 1));
    txt({ x: x1, y: yx, 'text-anchor': 'end', class: 'xo-xt' }, dpt(FIM, 1));
    if (!m) txt({ x: (x0 + x1) / 2, y: yx, 'text-anchor': 'middle', class: 'xo-yt' }, `← ${T.ordem} →`);
    sv('rect', { x: gx, y: t0, width: n * pw + 8, height: H, class: 'xo-gut' }, svg);
    txt({ x: gx + 4 + (n * pw) / 2, y: yx, 'text-anchor': 'middle', class: 'xo-yt' }, T.faixa);
    const gs = sv('g', { 'clip-path': `url(#${U}c)` }, svg);
    S.forEach((s, j) => {
      const a = s.spark || [], L = a.length, g = sv('g', { class: 'xo-s xo-c' + s.k }, gs);
      if (L > 1) {
        const d = 'M' + a.map((v, i) => X((i * (N - 1)) / (L - 1)).toFixed(1) + ' ' + Y(v).toFixed(1)).join('L');
        sv('path', { d, class: 'xo-l', 'stroke-dasharray': TRACO[s.k] || 'none' }, g);
      }
      const wx = gx + 4 + j * pw + pw / 2, w = sv('g', { class: 'xo-w xo-c' + s.k }, svg);
      if (s.nota_min != null && s.nota_max != null) {
        sv('line', { x1: wx, x2: wx, y1: Y(s.nota_max), y2: Y(s.nota_min), class: 'xo-wl' }, w);
        for (const v of [s.nota_min, s.nota_max]) sv('line', { x1: wx - 3.5, x2: wx + 3.5, y1: Y(v), y2: Y(v), class: 'xo-wl' }, w);
      }
      if (s.nota_atual != null) {
        sv('circle', { cx: wx, cy: Y(s.nota_atual), r: 7, class: 'xo-wh' }, w).style.animationDelay = -j * 0.77 + 's';
        sv('circle', { cx: wx, cy: Y(s.nota_atual), r: 4, class: 'xo-wd' }, w);
      }
      Object.assign(s, { g, w, wx, an: null, cd: sv('circle', { r: 4.5, class: 'xo-cd xo-c' + s.k }, svg) });
    });
    // o vale: o menor mínimo que a amostra não contém — marcado na faixa, FORA do eixo do tempo (sem data)
    const vv = S.filter((s) => s.nota_min != null && !(s.spark || []).includes(s.nota_min)).sort((a, b) => a.nota_min - b.nota_min)[0];
    if (vv) {
      const y = Y(vv.nota_min), xa = vv.wx - 13, an = sv('g', { class: 'xo-an xo-c' + vv.k }, svg);
      sv('line', { x1: xa + 3, x2: vv.wx - 5, y1: y, y2: y, class: 'xo-anl' }, an);
      for (const [dy, c, s] of [[-13, 'xo-ans', vv.h], [4, 'xo-ant', T.vale(n1(vv.nota_min))], [18, 'xo-ans', T.vale2(nf(N))]]) sv('text', { x: xa, y: y + dy, 'text-anchor': 'end', class: c }, an).textContent = s;
      vv.an = an;
    }
    if (casa && val(casa, 0) != null) sv('text', { x: x0 + 8, y: Y(val(casa, 0)) - 9, class: 'xo-ans xo-cs' }, gs).textContent = m ? T.casa : `${casa.h} · ${T.casa}`;
    G = { H, t0, x0, x1, X, Y, clip, ch: sv('line', { y1: t0, y2: t0 + H, class: 'xo-ch' }, svg), scan: sv('line', { y1: t0 - 4, y2: t0 + H, class: 'xo-scan' }, svg) };
    svg.append(...S.map((s) => s.cd));
    aplicar();
    vivos();
  }

  function aplicar() {
    const e = 1 - Math.pow(1 - p, 3);
    if (G) {
      const x = G.x0 + e * (G.x1 - G.x0);
      G.clip.setAttribute('width', x + 6);
      for (const a of ['x1', 'x2']) G.scan.setAttribute(a, x);
    }
    R.classList.toggle('xo-anim', p > 0 && p < 1);
    gw.classList.toggle('xo-pronto', p >= 1);
  }
  function quadro(t) {
    raf = 0;
    p = Math.min(1, p + (ult ? t - ult : 16) / DUR);
    ult = t;
    aplicar();
    if (p < 1 && vis && !pausado) raf = requestAnimationFrame(quadro);
    else ult = 0;
  }
  const parar = () => { if (raf) cancelAnimationFrame(raf); raf = 0; ult = 0; };
  const talvez = () => { if (!raf && p < 1 && vis && !pausado && !reduzido) raf = requestAnimationFrame(quadro); };
  const completar = () => { if (p < 1) { parar(); p = 1; aplicar(); } };

  /* ---- realce e liga/desliga: o realce atravessa gráfico, faixa, legenda, matriz e diário ---- */
  function foco(s, deLegenda) {
    if (deLegenda) fL = s; else fP = s;
    realce();
  }
  function realce() {
    let f = fL || fP;
    if (f && f.off) f = null;
    R.classList.toggle('xo-foc', !!f);
    for (const s of S) for (const e of [s.b, s.row, s.g, s.w, s.cd, s.an, ...s.d]) if (e) e.classList.toggle('xo-alvo', s === f);
    if (f && f.g) f.g.parentNode.append(f.g);
  }
  function vivos() {
    let n = 0;
    for (const s of S) {
      for (const e of [s.g, s.w, s.cd, s.an, s.row]) if (e) e.classList.toggle('xo-off', !!s.off);
      if (!s.off) n++;
    }
    gw.classList.toggle('xo-nada', !n);
    if (idx >= 0) cursor(idx);
    realce();
  }
  function cursor(i) {
    idx = i;
    gw.classList.toggle('xo-cur', i >= 0 && !!G);
    if (i < 0 || !G) return;
    const x = G.X(i), lista = [];
    for (const a of ['x1', 'x2']) G.ch.setAttribute(a, x);
    for (const s of S) {
      const v = val(s, i);
      s.tv.textContent = n1(v);
      s.cd.classList.toggle('xo-off', !!s.off || v == null);
      if (v != null) { s.cd.setAttribute('cx', x); s.cd.setAttribute('cy', G.Y(v)); }
      if (!s.off && v != null) lista.push([v, s]);
    }
    lista.sort((a, b) => b[0] - a[0]).forEach(([, s], r) => { s.row.style.order = r; });
    const pt = T.pt(nf(i + 1), nf(N));
    tph.textContent = pt;
    tip.classList.toggle('xo-flip', x > (G.x0 + G.x1) / 2);
    gw.style.setProperty('--x', x + 'px');
    hit.setAttribute('aria-valuenow', i + 1);
    hit.setAttribute('aria-valuetext', pt + ': ' + lista.map(([v, s]) => `${s.h} ${n1(v)}`).join('; '));
  }
  const lim = (i) => Math.max(0, Math.min(N - 1, i));
  const mover = (e) => {
    if (!G) return;
    completar();
    const i = lim(Math.round((e.offsetX / (G.x1 - G.x0)) * (N - 1)));
    let mel = null, dm = 14;
    cursor(i);
    for (const s of S) {
      const v = val(s, i), dd = v == null || s.off ? dm : Math.abs(G.Y(v) - G.t0 - e.offsetY);
      if (dd < dm) { dm = dd; mel = s; }
    }
    foco(mel, 0);
  };
  hit.addEventListener('pointermove', mover);
  hit.addEventListener('pointerdown', mover);
  hit.addEventListener('pointerleave', () => { if (document.activeElement !== hit) cursor(-1); foco(null, 0); });
  hit.addEventListener('focus', () => { completar(); cursor(idx < 0 ? N - 1 : idx); });
  hit.addEventListener('blur', () => cursor(-1));
  hit.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
    let i = idx < 0 ? N - 1 : idx;
    if (d) i += d;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = N - 1;
    else if (e.key === 'Escape') return cursor(-1);
    else return;
    e.preventDefault();
    completar();
    cursor(lim(i));
  });

  /* ---- medir só no resize; animar só visível e não pausado ---- */
  const ro = new ResizeObserver((es) => {
    const w = Math.floor(es[0].contentRect.width);
    if (w && w !== larg) { larg = w; desenhar(); }
  });
  ro.observe(gw);
  const io = new IntersectionObserver((es) => {
    vis = es[0].isIntersecting;
    if (vis) talvez(); else parar();
  }, { threshold: 0.35 });
  io.observe(gw);
  aplicar();

  return {
    pausar(b) {
      pausado = !!b;
      R.classList.toggle('xo-p', pausado);
      if (pausado) parar(); else talvez();
    },
    idioma(l) {
      T = TXT[l === 'en' ? 'en' : 'pt'];
      for (const f of FN) f();
      desenhar();
    },
    reduzir(b) {
      reduzido = !!b;
      R.classList.toggle('xo-red', reduzido);
      if (reduzido) completar(); else talvez();
    },
    destruir() {
      parar();
      ro.disconnect();
      io.disconnect();
      raiz.textContent = '';
    },
  };
}
