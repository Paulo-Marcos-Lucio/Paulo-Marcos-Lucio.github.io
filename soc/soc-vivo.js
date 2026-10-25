const TXT = {
  pt: {
    vivo: 'ao vivo', velho: (r) => `dado real · leitura ${r}`, pau: 'pausado', agora: 'agora há pouco', tkAria: 'Faixa de dados reais (pausa com mouse ou foco)',
    obs: 'observatório', snt: 'Sentinela · meu site', pag: 'sua página',
    ult: (r) => `última coleta ${r}`,
    mud: (n, l) => (n ? `${n} ${n === 1 ? 'alvo mudou' : 'alvos mudaram'} na última coleta: ${l}` : 'nenhum alvo mudou na última coleta'),
    nota: (g, c, a, r) => `${g} · ${c} ${c === 1 ? 'crítico' : 'críticos'} · ${a} ${a === 1 ? 'alto' : 'altos'} · laudo ${r}`,
    req: (n, t, c) => `${n} ${n === 1 ? 'requisição' : 'requisições'} · ${t} de terceiros · ${c} ${c === 1 ? 'cookie' : 'cookies'}`,
    lei: (n, a) => `${n} leituras de ${a} alvos`,
    stAria: 'Status do painel', crit: (c) => `${c} ${c === 1 ? 'crítico' : 'críticos'}`,
    online: 'observatório online', parado: 'observatório', leit: (r) => `última leitura ${r}`, notaR: 'nota',
    k: [['Sentinela', 'nota do meu site'], ['Observatório', 'coletas'], ['Observatório', 'taxa conclusiva'],
      ['Observatório', 'instantâneos de mudança'], ['Guardião', 'segredos achados no corpus'], ['Chaveiro', 'vetores JWT no corpus']],
    era: (a) => `era ${a} no 1º laudo · reteste`, dns: 'parte da subida: o DMARC do github.io deixou de contar',
    hora: (d) => `agendado de hora em hora desde ${d}`, dia: (n) => `na prática, ${n}/dia`, med: (d) => `README, medido em ${d}`,
    inc: (n) => `${n} inconclusivas — não é o mesmo que ausente`,
    snap: 'guardados quando a superfície muda',
    fp: (n) => (n === 0 ? '0 falso-positivo' : `${n} falsos-positivos`),
    fT: 'Achados & mudanças', fId: 'sentinela + observatório',
    fil: ['Todos', 'Achados', 'Mudanças'], filAria: 'Filtrar achados e mudanças',
    mais: (n) => `Ver todos (${n})`, menos: 'Mostrar menos', mostra: (a, b) => `Mostrando ${a} de ${b}`,
    sev: { critical: 'crítica', high: 'alta', medium: 'média', low: 'baixa', info: 'info' },
    sevT: 'Severidade no meu site', achN: (n) => `${n} achados no laudo`,
    mudou: 'mudou', origS: 'Sentinela · meu site', origO: 'Observatório',
    fontes: (d, e, o) => `Fontes: laudo passivo do Sentinela neste site (${d} UTC${e}) e a série pública do Observatório da Superfície (última leitura: ${o} UTC). “Mudou”, na faixa, é a impressão da postura; aqui só entra mudança de política legível — um alvo pode mudar sem virar linha.`,
    tit: {}, oque: {},
    cT: 'Sua conexão, agora', cSub: 'medido no seu navegador', cVivo: 'medindo',
    m: ['Protocolo', 'TTFB', 'DOM pronto', 'Carga total', 'Requisições', 'De terceiros', 'Transferido', 'Cookies', 'HTTPS'],
    cache: 'cache', nenhum: 'nenhum', sim: 'sim', local: 'não (local)', nao: 'não',
    csp: 'CSP ativa · lida da <meta>', cspNao: 'Sem CSP em <meta> (se houver, veio por cabeçalho, que o JS não lê).',
    selo: 'nada sai daqui', seloT: (t) => `${t} de terceiros nesta visita`,
    rede: (n) => `Rede · ${n} ${n === 1 ? 'requisição' : 'requisições'}`,
    cols: ['Arquivo', 'Tipo', 'Tamanho', 'Tempo', 'Origem'], mesma: 'mesma origem', doc: 'documento', fonte: 'fonte',
    redeAria: 'Requisições desta página (aba Rede do DevTools)',
    aviso0: 'Abra uma aba da exposição: o módulo baixado surge aqui, no topo.',
    aviso: (n, a, tot) => `+${n} de terceiros agora: ${a} · ${tot} no total`,
  },
  en: {
    vivo: 'live', velho: (r) => `real data · read ${r}`, pau: 'paused', agora: 'just now', tkAria: 'Real-data strip (pauses on hover or focus)',
    obs: 'observatory', snt: 'Sentinela · my site', pag: 'your page',
    ult: (r) => `last collection ${r}`,
    mud: (n, l) => (n ? `${n} ${n === 1 ? 'target' : 'targets'} changed in the last collection: ${l}` : 'no target changed in the last collection'),
    nota: (g, c, a, r) => `${g} · ${c} critical · ${a} high · report ${r}`,
    req: (n, t, c) => `${n} ${n === 1 ? 'request' : 'requests'} · ${t} third-party · ${c} ${c === 1 ? 'cookie' : 'cookies'}`,
    lei: (n, a) => `${n} readings of ${a} targets`,
    stAria: 'Panel status', crit: (c) => `${c} critical`,
    online: 'observatory online', parado: 'observatory', leit: (r) => `last reading ${r}`, notaR: 'grade',
    k: [['Sentinela', 'my site’s grade'], ['Observatory', 'collections'], ['Observatory', 'conclusive rate'],
      ['Observatory', 'change snapshots'], ['Guardião', 'secrets found in the corpus'], ['Chaveiro', 'JWT vectors in the corpus']],
    era: (a) => `was ${a} in the 1st report · retest`, dns: 'part of the climb: github.io’s DMARC stopped counting',
    hora: (d) => `scheduled hourly since ${d}`, dia: (n) => `in practice, ${n}/day`, med: (d) => `README, measured ${d}`,
    inc: (n) => `${n} inconclusive — not the same as absent`,
    snap: 'saved whenever the surface changes',
    fp: (n) => `${n} false positives`,
    fT: 'Findings & changes', fId: 'sentinela + observatory',
    fil: ['All', 'Findings', 'Changes'], filAria: 'Filter findings and changes',
    mais: (n) => `Show all (${n})`, menos: 'Show less', mostra: (a, b) => `Showing ${a} of ${b}`,
    sev: { critical: 'critical', high: 'high', medium: 'medium', low: 'low', info: 'info' },
    sevT: 'Severity on my site', achN: (n) => `${n} findings in the report`,
    mudou: 'changed', origS: 'Sentinela · my site', origO: 'Observatory',
    fontes: (d, e, o) => `Sources: Sentinela’s passive report on this site (${d} UTC${e}) and the Surface Observatory’s public series (last reading: ${o} UTC). “Changed”, in the strip, is the posture fingerprint; only readable policy changes land here — a target can change without a line.`,
    tit: {
      CLICKJACKING_SEM_PROTECAO: 'No clickjacking protection', XCTO_AUSENTE: 'X-Content-Type-Options missing',
      CORS_OK: 'CORS with no cross-origin leak', CSP_OK: 'CSP present and governing script origins',
      COOP_AUSENTE: 'Cross-Origin-Opener-Policy missing', HSTS_SEM_SUBDOMINIOS: 'HSTS without includeSubDomains',
      PERMISSIONS_POLICY_AUSENTE: 'Permissions-Policy missing', POLITICA_VIA_META: 'Security policy declared via <meta>, not an HTTP header',
      DNS_HOSPEDAGEM_GERENCIADA: 'Domain on managed hosting (provider DNS/e-mail)',
      METODOS_NAO_AVALIADOS: 'OPTIONS inventory unavailable; TRACE probed, writes not tested',
      TLS_OK: 'TLS and certificate in order', HTTPS_FORCADO: 'HTTP redirects to HTTPS',
    },
    oque: {
      'mudou de valor': 'value changed',
      'mudou de política (o conjunto de diretivas/tokens, não só a ordem)': 'policy changed (the set of directives/tokens, not just the order)',
    },
    cT: 'Your connection, right now', cSub: 'measured in your browser', cVivo: 'measuring',
    m: ['Protocol', 'TTFB', 'DOM ready', 'Full load', 'Requests', 'Third-party', 'Transferred', 'Cookies', 'HTTPS'],
    cache: 'cache', nenhum: 'none', sim: 'yes', local: 'no (local)', nao: 'no',
    csp: 'Active CSP · read from the <meta>', cspNao: 'No CSP in a <meta> (if any, it came as a header, which JS cannot read).',
    selo: 'nothing leaves here', seloT: (t) => `${t} third-party requests this visit`,
    rede: (n) => `Network · ${n} ${n === 1 ? 'request' : 'requests'}`,
    cols: ['File', 'Type', 'Size', 'Time', 'Origin'], mesma: 'same origin', doc: 'document', fonte: 'font',
    redeAria: 'This page’s requests (DevTools Network tab)',
    aviso0: 'Open an exhibition tab: its module shows up here, on top.',
    aviso: (n, a, tot) => `+${n} third-party just now: ${a} · ${tot} total`,
  },
};

const SEV = ['critical', 'high', 'medium', 'low', 'info'];
const CHIP = { critical: 'sev-crit', high: 'sev-high', medium: 'sev-med', low: 'sev-low', info: 'sev-info' };
const TIPO = { js: 'script', css: 'css', woff2: 'f', html: 'd' };
let seq = 0;

const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
};
const ap = (p, ...k) => (p.append(...k), p);
const at = (e, o) => { for (const k in o) e.setAttribute(k, o[k]); return e; };
const ts = (iso) => Date.parse(String(iso).replace(/(\.\d{3})\d+/, '$1'));
const naTela = (n) => { const r = n.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
const lis = (ul, itens) => ul.replaceChildren(...itens.map((x) => ap(el('li'), x)));

export function montar(raizes, ctx = {}) {
  const R = raizes || {}, D = ctx.dados || {};
  const O = D.observatorio || {}, S = D.sentinela_site || {}, U = D.suite || {};
  const E = { l: ctx.idioma === 'en' ? 'en' : 'pt', red: !!ctx.reduzido, pau: !!ctx.pausado, filtro: 0, aberto: 0, kp: 1 };
  const uid = `vivo${++seq}`, wraps = [], vis = {}, tm = {};
  let T, F, raf = 0, ult = 0;

  const fmts = () => {
    const l = E.l === 'en' ? 'en' : 'pt-BR', N = Intl.NumberFormat, DT = Intl.DateTimeFormat, Z = { timeZone: 'UTC' };
    T = TXT[E.l];
    F = {
      n: new N(l), pct: new N(l, { style: 'percent', minimumFractionDigits: 1 }),
      ms: new N(l, { style: 'unit', unit: 'millisecond', maximumFractionDigits: 0 }),
      kb: new N(l, { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 1 }),
      rel: new Intl.RelativeTimeFormat(l, { style: 'narrow' }),
      dia: new DT(l, { ...Z, dateStyle: 'medium' }),
      diaC: new DT(l, { ...Z, day: '2-digit', month: 'short' }),
      hora: new DT(l, { ...Z, dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' }),
      lista: new Intl.ListFormat(l),
    };
  };
  const data = (iso, f = F.dia) => { const t = ts(iso); return isNaN(t) ? '—' : f.format(t); };
  const relMin = (m) => (isNaN(m ?? NaN) ? '—' : m < 1 ? T.agora : m < 60 ? F.rel.format(-Math.floor(m), 'minute')
    : m < 1440 ? F.rel.format(-Math.round(m / 60), 'hour') : F.rel.format(-Math.round(m / 1440), 'day'));
  const rel = (iso) => relMin((Date.now() - ts(iso)) / 6e4);
  // pulso só no frescor (ctx.frescor, o do app); fora dele: neutro + a idade
  const fresco = () => ctx.frescor?.fresco === true, idadeObs = () => relMin(ctx.frescor?.idadeMin);
  const luz = (e, on, ...t) => (e.classList.toggle('neutro', !on), e.replaceChildren(...t), e);
  const cookies = () => { const c = document.cookie; return c ? c.split(';').length : 0; };

  const rede = { linhas: [], vistos: new Set(), terc: 0, fila: [], lote: [] };
  const entrada = (e, doc) => {
    let u;
    try { u = new URL(e.name, location.href); } catch { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    let nome = u.pathname.split('/').pop() || u.host;
    try { nome = decodeURIComponent(nome); } catch {}
    return { nome, tipo: doc ? 'd' : TIPO[(/\.(\w+)$/.exec(nome) || [])[1]?.toLowerCase()] || e.initiatorType, tam: e.transferSize || 0,
      ms: Math.max(0, e.responseEnd - e.startTime), terc: u.origin !== location.origin, host: u.host };
  };
  const navE = () => performance.getEntriesByType('navigation')[0];
  const nav0 = navE() && entrada(navE(), 1);
  if (nav0) rede.linhas.push(nav0);
  for (const e of performance.getEntriesByType('resource')) {
    rede.vistos.add(e.name + '|' + e.startTime);
    const r = entrada(e);
    if (r) rede.linhas.unshift(r);
  }
  rede.terc = rede.linhas.filter((x) => x.terc).length;
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy" i]');
  const DIRS = meta ? meta.content.split(';').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean) : [];
  const CONN = DIRS.find((d) => /^connect-src /i.test(d));

  let tk = null;
  if (R.ticker) {
    tk = { rot: el('span', 'vivo-tk-rot ao-vivo'), jan: at(el('div', 'vivo-tk-jan'), { tabindex: 0, role: 'region' }), tri: el('div', 'vivo-tk-tri'),
      l1: el('ul', 'vivo-tk-lista'), l2: at(el('ul', 'vivo-tk-lista vivo-tk-dup'), { 'aria-hidden': 'true' }), hv: el('span', 'vivo-tk-v'), hora: el('time', 'vivo-tk-hora') };
    ap(tk.jan, ap(el('div', 'vivo-tk-msk'), ap(tk.tri, tk.l1, tk.l2)));
    ap(tk.hora, el('span', 'vivo-tk-k', 'UTC'), tk.hv);
    R.ticker.append(tk.w = ap(el('div', 'vivo-ticker'), tk.rot, tk.jan, tk.hora));
  }
  const pintarTicker = () => {
    if (!tk) return;
    const sv = S.por_severidade || {}, mud = O.ultima_coleta_mudaram, it = [];
    if (O.ultima) it.push([T.obs, T.ult(idadeObs())]);
    if (mud) it.push([T.obs, T.mud(mud.length, F.lista.format(mud))]);
    if (S.grau) it.push([T.snt, T.nota(`${S.grau}·${S.nota}`, sv.critical ?? '—', sv.high ?? '—', rel(S.em))]);
    it.push([T.pag, T.req(rede.linhas.length, rede.terc, cookies())]);
    if (O.leituras != null) it.push([T.obs, T.lei(F.n.format(O.leituras), O.alvos)]);
    at(tk.jan, { 'aria-label': T.tkAria });
    for (const ul of [tk.l1, tk.l2]) ul.replaceChildren(...it.map(([k, v]) => ap(el('li'), el('span', 'vivo-tk-k', k), el('span', 'vivo-tk-v', v))));
  };
  const medir = () => {
    const w = tk && !E.red && tk.l1.offsetWidth;
    if (w) tk.tri.style.setProperty('--vivo-dur', `${Math.max(40, Math.round(w / 38))}s`);
  };
  const relogio = () => {
    if (!tk) return;
    const d = new Date(), p = (x) => String(x).padStart(2, '0');
    tk.hv.textContent = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}${E.red ? '' : `:${p(d.getUTCSeconds())}`}`;
    tk.hora.dateTime = d.toISOString();
  };
  const agendarRelogio = () => {
    clearTimeout(tm.rel);
    relogio();
    const passo = E.red ? 6e4 : 1e3;
    if (tk && !E.pau && vis.ticker) tm.rel = setTimeout(agendarRelogio, passo - (Date.now() % passo) + 15);
  };

  const st = R.status ? el('ul', 'vivo-status') : null;
  if (st) R.status.append(st);
  const pintarStatus = () => {
    if (!st) return;
    const it = [], c = S.por_severidade?.critical;
    if (c != null) it.push(el('span', `chip ${c ? 'sev-crit' : 'sev-ok'}`, T.crit(c)));
    if (O.ultima) it.push(luz(el('span', 'vivo-st ao-vivo'), fresco(), ap(el('span', null, `${fresco() ? T.online : T.parado} `), el('span', 'vivo-st-sub', `· ${T.leit(idadeObs())}`))));
    if (S.grau) it.push(ap(el('span', 'vivo-st vivo-st-nota', `${T.notaR} `), el('b', null, `${S.grau}·${S.nota}`)));
    lis(at(st, { 'aria-label': T.stAria }), it);
  };

  const kp = R.kpis ? { g: el('ul', 'vivo-kpi-g'), ts: [], ns: [] } : null;
  if (kp) R.kpis.append(kp.w = ap(el('div', 'vivo-kpis'), kp.g));
  const SU = U.sentinela || {}, RG = SU.regua;
  const tiles = () => {
    const sd = O.sondas || {}, out = [], inteiro = (x) => F.n.format(Math.round(x));
    // letra SEMPRE pela régua, em cada quadro
    if (S.nota != null) out.push({ i: 0, v: S.nota, de: (RG && SU.nota_antes_valor) || S.nota, f: (x) => { const r = Math.round(x); return `${RG ? RG.find(([m]) => r >= m)?.[1] : S.grau}·${r}`; },
      s: SU.nota_antes ? [[T.era(SU.nota_antes)]] : [] });
    if (O.coletas != null) out.push({ i: 1, v: O.coletas, f: inteiro, s: [O.coletas_por_dia != null && [T.dia(F.n.format(O.coletas_por_dia))]] });
    if (O.taxa_conclusiva != null) out.push({ i: 2, v: O.taxa_conclusiva, f: (x) => F.pct.format(x), s: [sd.inconclusivo != null && [T.inc(F.n.format(sd.inconclusivo))]] });
    if (O.instantaneos_de_mudanca != null) out.push({ i: 3, v: O.instantaneos_de_mudanca, f: inteiro, s: [[T.snap]] });
    for (const [i, o, c] of [[4, U.guardiao, 'recall'], [5, U.chaveiro, 'vetores']]) {
      const m = /^(\d+)\/(\d+)$/.exec(o?.[c]), fp = o?.falsos_positivos;
      if (m) out.push({ i, v: +m[1], f: (x) => `${Math.round(x)}/${m[2]}`, s: [fp != null && [T.fp(fp), fp === 0 && 'vivo-up']] });
    }
    return out;
  };
  const pintarKpis = () => {
    const e = E.kOn ? 1 - (1 - E.kp) ** 3 : 1;
    kp?.ts.forEach((t, j) => { const de = t.de || 0; kp.ns[j].textContent = t.f(de + (t.v - de) * e); });
  };
  const montarKpis = () => {
    if (!kp) return;
    kp.ts = tiles();
    kp.ns = [];
    kp.g.replaceChildren(...kp.ts.map((t) => {
      const n = at(el('p', 'vivo-kpi-n'), { 'aria-hidden': 'true' }), sub = el('p', 'vivo-kpi-s');
      kp.ns.push(n);
      t.s.filter(Boolean).forEach(([x, c], j) => { if (j) sub.append(' · '); sub.append(el('span', c, x)); });
      return ap(el('li', 'vivo-kpi'), el('p', 'vivo-kpi-f', T.k[t.i][0]), n, el('p', 'sr-only', t.f(t.v)), el('p', 'vivo-kpi-r', T.k[t.i][1]), sub);
    }));
    pintarKpis();
  };
  const quadro = (agora) => {
    raf = 0;
    if (ult) E.kp = Math.min(1, E.kp + (agora - ult) / 900);
    ult = agora;
    pintarKpis();
    if (E.kp < 1) girar(); else E.kOn = 0;
  };
  const girar = () => { if (!raf && E.kOn && !E.pau && vis.kpis) raf = requestAnimationFrame(quadro); };
  const parar = () => { cancelAnimationFrame(raf); raf = ult = 0; };
  const contar = () => {
    if (!kp || E.kFeito || E.red || E.pau) return;
    E.kFeito = E.kOn = 1;
    E.kp = 0;
    pintarKpis();
    girar();
  };

  const rank = (s) => (CHIP[s] ? SEV.indexOf(s) : 4);
  const ACH = (S.achados || []).map((a) => ({ ...a, k: 'a', r: rank(a.severidade) })).sort((x, y) => x.r - y.r);
  const MUD = (O.detalhes || []).map((m) => ({ ...m, k: 'm' })).sort((x, y) => String(y.dia).localeCompare(String(x.dia)));
  const TODOS = ACH.filter((a) => a.r < 4);
  for (let i = 0, inf = ACH.filter((a) => a.r > 3); i < Math.max(MUD.length, inf.length); i++) TODOS.push(...[MUD[i], inf[i]].filter(Boolean));
  const LISTAS = [TODOS, ACH, MUD];
  let fd = null;
  if (R.feed) {
    fd = { t: at(el('h2', 'painel-t'), { id: `${uid}-ft` }), id: el('span', 'painel-id'), viv: el('span', 'vivo-st ao-vivo'), sevT: el('span'), sevN: el('span'),
      barra: at(el('div', 'vivo-barra'), { 'aria-hidden': 'true' }), cont: el('ul', 'vivo-cont'), grp: at(el('div', 'vivo-filtros'), { role: 'group' }),
      ol: at(el('ol', 'vivo-linhas'), { id: `${uid}-fl`, 'aria-labelledby': `${uid}-ft` }), mostra: at(el('p', 'vivo-mostra'), { role: 'status' }),
      mais: at(el('button', 'btn vivo-mais'), { type: 'button', 'aria-controls': `${uid}-fl` }), fontes: el('p', 'vivo-fontes') };
    fd.bts = [0, 1, 2].map((i) => {
      const b = at(el('button', 'btn vivo-filtro'), { type: 'button' });
      b.addEventListener('click', () => { E.filtro = i; pintarLinhas(); });
      return b;
    });
    fd.mais.addEventListener('click', () => { E.aberto = !E.aberto; pintarLinhas(); });
    R.feed.append(fd.w = ap(el('div', 'vivo-feed'), ap(el('div', 'painel'),
      ap(el('div', 'painel-h'), ap(el('div', 'vivo-ht'), fd.t, fd.id), fd.viv),
      ap(el('div', 'vivo-sev'), ap(el('p', 'vivo-sev-t'), fd.sevT, fd.sevN), fd.barra, fd.cont),
      ap(fd.grp, ...fd.bts), fd.ol, ap(el('div', 'vivo-pe'), fd.mostra, fd.mais), fd.fontes)));
  }
  const linha = (x, i) => {
    const a = x.k === 'a', s = a && CHIP[x.severidade] ? x.severidade : 'info', tit = el('p', 'vivo-l-t');
    const li = el('li', `vivo-linha vivo-s-${a ? s : 'mud'}`);
    li.style.setProperty('--vivo-i', i);
    if (a) tit.textContent = T.tit[x.id] || x.titulo;
    else tit.append(el('code', 'vivo-cod', x.item), ` ${T.oque[x.o_que] || x.o_que}`);
    const m = el('p', 'vivo-l-m');
    (a ? [x.owasp, x.cwe] : [data(`${x.dia}T00:00:00Z`, F.diaC)]).filter(Boolean).forEach((t, j) => ap(m, j ? ' · ' : '', el('span', null, t)));
    return ap(li, el('span', `chip ${a ? CHIP[s] : 'sev-holo'}`, a ? T.sev[s] : T.mudou),
      ap(el('p', 'vivo-l-1'), el('span', 'vivo-l-id', a ? x.id : x.alvo), el('span', 'vivo-l-o', a ? T.origS : T.origO)), tit, m);
  };
  const pintarLinhas = () => {
    if (!fd) return;
    const L = LISTAS[E.filtro], n = E.aberto ? L.length : Math.min(8, L.length);
    fd.ol.classList.remove('vivo-cascata');
    fd.ol.replaceChildren(...L.slice(0, n).map(linha));
    fd.mostra.textContent = T.mostra(n, L.length);
    fd.mais.hidden = L.length <= 8;
    at(fd.mais, { 'aria-expanded': !!E.aberto }).textContent = E.aberto ? T.menos : T.mais(L.length);
    fd.bts.forEach((b, i) => at(b, { 'aria-pressed': i === E.filtro }).replaceChildren(T.fil[i], el('span', 'vivo-n', F.n.format(LISTAS[i].length))));
  };
  const pintarFeed = () => {
    if (!fd) return;
    const ps = S.por_severidade || {};
    fd.t.textContent = T.fT;
    fd.id.textContent = T.fId;
    at(fd.grp, { 'aria-label': T.filAria });
    fd.sevT.textContent = T.sevT;
    fd.sevN.textContent = T.achN(F.n.format(S.total ?? ACH.length));
    fd.barra.replaceChildren(...SEV.filter((s) => ps[s]).map((s) => { const b = el('span', `vivo-s-${s}`); b.style.setProperty('--vivo-n', ps[s]); return b; }));
    fd.cont.replaceChildren(...SEV.map((s) => ap(el('li', `vivo-s-${s}${ps[s] ? '' : ' vivo-zero'}`), el('span', 'vivo-cl', T.sev[s]), el('span', 'vivo-cn', ps[s] == null ? '—' : F.n.format(ps[s])))));
    fd.fontes.textContent = T.fontes(data(S.em, F.hora), S.owasp_edicao ? ` · OWASP Top 10:${S.owasp_edicao}` : '', data(O.ultima, F.hora));
    pintarLinhas();
  };
  const cascata = () => {
    if (!fd || E.cFeita || E.red || E.pau) return;
    E.cFeita = 1;
    fd.ol.classList.add('vivo-cascata');
  };

  let cx = null;
  if (R.conexao) {
    cx = { t: el('h2', 'painel-t'), sub: el('span', 'painel-id'), viv: el('span', 'ao-vivo'), dl: el('dl', 'vivo-med'), dt: [], dd: [],
      cspT: el('p', 'vivo-csp-t'), cspL: el('ul'), selo: el('div', 'vivo-selo'), seloT: el('p', 'vivo-selo-t'), seloS: el('p', 'vivo-selo-s'),
      rt: at(el('h3', 'vivo-rede-t'), { id: `${uid}-rt` }), av: el('p', 'vivo-aviso'),
      cap: el('caption', 'sr-only'), th: el('tr'), tb: el('tbody') };
    for (let i = 0; i < 9; i++) cx.dl.append(ap(el('div'), cx.dt[i] = el('dt'), cx.dd[i] = el('dd')));
    cx.th.append(...['', 'vivo-x', 'vivo-num', 'vivo-num', 'vivo-x'].map((c) => at(el('th', c), { scope: 'col' })));
    R.conexao.append(cx.w = ap(el('div', 'vivo-cx'), ap(el('div', 'painel'),
      ap(el('div', 'painel-h'), ap(el('div', 'vivo-ht'), cx.t, cx.sub), cx.viv),
      ap(el('div', 'vivo-cx-corpo'),
        ap(el('div', 'vivo-cx-esq'), cx.dl, ap(el('div', 'vivo-csp'), cx.cspT, cx.cspL),
          ap(cx.selo, at(el('span', 'vivo-selo-g', '✓'), { 'aria-hidden': 'true' }), ap(el('div'), cx.seloT, cx.seloS))),
        ap(el('div', 'vivo-cx-dir'), ap(el('div', 'vivo-rede-h'), cx.rt, cx.av),
          ap(at(el('div', 'vivo-rede'), { tabindex: 0, role: 'region', 'aria-labelledby': `${uid}-rt` }), ap(el('table'), cx.cap, ap(el('thead'), cx.th), cx.tb)))))));
  }
  const linhaRede = (it) => {
    const tipo = it.tipo === 'd' ? T.doc : it.tipo === 'f' ? T.fonte : it.tipo || '—', org = it.terc ? it.host : T.mesma, novo = it.novo;
    it.novo = 0;
    return ap(el('tr', novo && !E.red && 'vivo-novo'), ap(el('td'), el('span', null, it.nome), el('span', 'vivo-sub', `${tipo} · ${org}`)),
      el('td', 'vivo-x', tipo), el('td', 'vivo-num', it.tam ? F.kb.format(it.tam / 1e3) : it.terc ? '—' : T.cache),
      el('td', 'vivo-num', F.ms.format(it.ms)), el('td', `vivo-x ${it.terc ? 'vivo-alerta' : 'vivo-ok'}`, org));
  };
  const pintarMedidas = () => {
    if (!cx) return;
    const n = navE(), ms = (v) => [v > 0 ? F.ms.format(v) : '…'], ck = cookies(), pr = n?.nextHopProtocol;
    const bytes = rede.linhas.reduce((a, x) => a + x.tam, 0);
    [[pr ? pr.toUpperCase().replace(/^H(\d)$/, 'HTTP/$1') : '—'], ms(n?.responseStart), ms(n?.domContentLoadedEventEnd), ms(n?.loadEventEnd),
      [F.n.format(rede.linhas.length)], [F.n.format(rede.terc), rede.terc ? -1 : 1], [bytes ? F.kb.format(bytes / 1e3) : T.cache],
      [ck ? F.n.format(ck) : T.nenhum, ck ? 0 : 1], location.protocol === 'https:' ? [T.sim, 1] : isSecureContext ? [T.local] : [T.nao, -1],
    ].forEach(([x, ok], i) => {
      cx.dt[i].textContent = T.m[i];
      cx.dd[i].textContent = `${ok > 0 ? '✓ ' : ok < 0 ? '● ' : ''}${x}`;
      cx.dd[i].className = ok > 0 ? 'vivo-ok' : ok < 0 ? 'vivo-alerta' : '';
    });
    cx.selo.hidden = CONN !== "connect-src 'none'" || rede.terc > 0; // CSP E medição
    cx.seloT.textContent = T.selo;
    cx.seloS.replaceChildren(el('code', null, CONN || ''), ` · ${T.seloT(rede.terc)}`);
    cx.rt.textContent = T.rede(rede.linhas.length);
  };
  const pintarAviso = () => { if (cx) cx.av.textContent = rede.ult ? T.aviso(...rede.ult, rede.linhas.length) : T.aviso0; };
  const pintarCx = () => {
    if (!cx) return;
    cx.t.textContent = T.cT;
    cx.sub.textContent = T.cSub;
    cx.cap.textContent = T.redeAria;
    [...cx.th.children].forEach((th, i) => { th.textContent = T.cols[i]; });
    cx.cspT.textContent = DIRS.length ? T.csp : T.cspNao;
    lis(cx.cspL, DIRS.map((d) => el('code', d === CONN && 'vivo-chave', d)));
    cx.tb.replaceChildren(...rede.linhas.map(linhaRede));
    pintarMedidas();
    pintarAviso();
  };
  // região viva só nasce com o 1º terceiro (devem ser 0): nem clique nem troca de idioma anunciam
  const anunciar = () => { const l = rede.lote.splice(0); rede.ult = [l.length, l[l.length - 1].nome]; pintarAviso(); };
  const inserir = (it) => {
    rede.linhas.unshift(it);
    rede.terc += it.terc;
    if (cx) { cx.tb.prepend(linhaRede(it)); pintarMedidas(); }
    pintarTicker();
    if (it.terc) { cx?.av.setAttribute('role', 'status'); rede.lote.push(it); clearTimeout(tm.av); tm.av = setTimeout(anunciar, 900); }
  };
  let po = null;
  try {
    po = new PerformanceObserver((lista) => lista.getEntries().forEach((e) => {
      const k = e.name + '|' + e.startTime, it = !rede.vistos.has(k) && entrada(e);
      rede.vistos.add(k);
      if (it) { it.novo = 1; if (E.pau) rede.fila.push(it); else inserir(it); } // pausado, congela (WCAG 2.2.2)
    }));
    po.observe({ type: 'resource', buffered: true });
  } catch { po = null; }

  const marcar = () => wraps.forEach((w) => {
    w.classList.toggle('vivo-pausado', E.pau);
    w.classList.toggle('vivo-reduzido', E.red);
    w.lang = E.l === 'en' ? 'en' : 'pt-BR';
  });
  // pausa = estado final
  const fim = () => { E.kOn = 0; parar(); pintarKpis(); fd?.ol.classList.remove('vivo-cascata'); };
  const pintarLuz = () => {
    const f = fresco(), v = T.velho(idadeObs());
    if (tk) luz(tk.rot, f && !E.pau, E.pau ? T.pau : f ? T.vivo : v);
    if (fd) luz(fd.viv, f, f ? T.vivo : v);
    if (cx) luz(cx.viv, !E.pau, E.pau ? T.pau : T.cVivo);
    pintarStatus();
  };
  const tudo = () => { pintarTicker(); montarKpis(); pintarFeed(); pintarCx(); pintarLuz(); medir(); };
  const agendarTextos = () => {
    clearTimeout(tm.txt);
    if (!E.pau) tm.txt = setTimeout(() => { pintarTicker(); pintarLuz(); agendarTextos(); }, 3e4);
  };
  const io = window.IntersectionObserver && new IntersectionObserver((es) => {
    es.forEach((e) => {
      const k = e.target.dataset.vivo;
      vis[k] = e.isIntersecting;
      if (vis[k] && k === 'kpis') contar();
      if (vis[k] && k === 'feed') cascata();
    });
    agendarRelogio();
    girar();
  });

  fmts();
  tudo();
  for (const [k, w] of Object.entries({ ticker: tk?.w, status: st, kpis: kp?.w, feed: fd?.w, conexao: cx?.w })) {
    if (!w) continue;
    wraps.push(w);
    w.dataset.vivo = k;
    vis[k] = !io || naTela(w);
    if (io) io.observe(w);
  }
  marcar();
  if (vis.kpis) contar();
  if (vis.feed) cascata();
  agendarRelogio();
  agendarTextos();
  document.fonts?.ready.then(medir);
  const navOk = () => setTimeout(pintarMedidas);
  addEventListener('load', navOk, { once: true });
  document.addEventListener('DOMContentLoaded', navOk, { once: true });
  navOk();

  return {
    pausar(b) {
      E.pau = !!b;
      marcar();
      if (E.pau) fim(); else rede.fila.splice(0).forEach((it) => inserir(it));
      pintarLuz();
      agendarRelogio();
      agendarTextos();
    },
    reduzir(b) {
      E.red = !!b;
      marcar();
      if (E.red) fim();
      agendarRelogio();
      medir();
    },
    idioma(l) { E.l = l === 'en' ? 'en' : 'pt'; fmts(); marcar(); tudo(); },
    frescor(f) { if (f) ctx.frescor = f; pintarTicker(); pintarLuz(); },
    destruir() {
      parar();
      Object.values(tm).forEach(clearTimeout);
      io?.disconnect();
      po?.disconnect();
      wraps.forEach((w) => w.remove());
    },
  };
}
