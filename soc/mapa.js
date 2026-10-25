/* mapa — "A rede que eu observo" (ver CONTRATO.md): o mapa holográfico do SOC, com dado REAL do observatório.
   Terra = polígonos que desenhei à mão, rasterizados numa grade de 2° (equirretangular) e guardados em corridas;
   nenhum asset de terceiros. Alvo = região da sede (dado real), nunca cidade de servidor: os alvos são CDN anycast.
   A nota 0–10 do observatório não tem faixa nem cor de severidade: a cor é a CLASSE (meu site × referência). */

const TXT = {
  pt: {
    titulo: 'A rede que eu observo', alvos: '{n} alvos reais', vivo: 'telemetria real · leitura {r}', velho: 'dado real · leitura {r}',
    pausado: 'pausado', palco: 'Mapa dos alvos observados', obs: 'Observatório', obsSub: ' · GitHub Actions · agendado de hora em hora',
    obsMed: 'média realizada: {c} coletas/dia', voz: 'Leitura passiva e contínua.',
    voce: 'você', req: 'sua requisição: ', aprox: 'aproximado pelo fuso do seu navegador · nada sai daqui',
    proprio: 'meu site', referencia: 'referência', escala: 'nota de postura do observatório, 0 a 10 — não é severidade e não compara alvos',
    delta: 'mudou na última coleta', semDelta: 'sem mudança na última coleta',
    deltaL: 'mudou na última coleta: a impressão da postura (nem toda mudança vira linha no diário)',
    pulso: 'pulso = o caminho da sonda, não o ritmo', inc: '= a sonda não conseguiu medir; não é o mesmo que ausente',
    porta80: 'porta 80', cabecalhos: 'cabeçalhos', tls: 'TLS', security_txt: 'security.txt', dns: 'DNS',
    transparencia_certificados: 'transparência de certificados', st_ok: 'ok', st_inconclusivo: 'inconclusivo', st_pulada: 'pulada',
    serie: 'série: mín {a} · máx {b} · {n} leituras',
    sede: 'posição = região da sede; os servidores são CDN anycast', oper: 'posição = região do operador; o site sai de CDN anycast',
    porque: 'Por que {n}?', perdas: 'perdas:', nenhuma: 'nenhuma', limT: 'limite do host',
    limite: 'o GitHub Pages não deixa nenhum site definir os cabeçalhos que faltam — é limite da hospedagem, não do site.',
    dec: ' Decisão registrada: fico aqui por enquanto; o _headers já pronto no repositório resolve isso no dia em que eu mover para um host que leia esse arquivo.',
    nAlvos: '{n} alvos', lista: 'ver como lista', mapa: 'ver como mapa',
    cols: 'Alvo|Classe|Nota (0–10)|Região|Mudou na última coleta?', sim: 'sim', nao: 'não',
    fuso: 'fuso do navegador: {tz} → referência: {c}', fusoOff: 'fuso do navegador: UTC{o} → só a longitude',
    ttfb: 'tempo até o 1º byte desta página (Navigation Timing do seu navegador)',
    csp: 'Nada sai daqui: a CSP desta página é connect-src \'none\', e o observatório não lê você.',
    cap: 'Alvos do observatório — equivalente textual do mapa',
  },
  en: {
    titulo: 'The network I watch', alvos: '{n} real targets', vivo: 'real telemetry · read {r}', velho: 'real data · read {r}',
    pausado: 'paused', palco: 'Map of the observed targets', obs: 'Observatory', obsSub: ' · GitHub Actions · scheduled hourly',
    obsMed: 'actual average: {c} collections/day', voz: 'Passive, continuous reading.',
    voce: 'you', req: 'your request: ', aprox: 'approximated from your browser’s time zone · nothing leaves this page',
    proprio: 'my site', referencia: 'reference', escala: 'observatory posture score, 0 to 10 — not a severity, and not for comparing targets',
    delta: 'changed in the last collection', semDelta: 'no change in the last collection',
    deltaL: 'changed in the last collection: the posture fingerprint (not every change becomes a change-log line)',
    pulso: 'pulse = the probe’s path, not its pace', inc: '= the probe could not measure; not the same as absent',
    porta80: 'port 80', cabecalhos: 'headers', transparencia_certificados: 'certificate transparency',
    st_inconclusivo: 'inconclusive', st_pulada: 'skipped', serie: 'series: min {a} · max {b} · {n} readings',
    sede: 'position = headquarters region; the servers are anycast CDN', oper: 'position = operator’s region; the site is served from an anycast CDN',
    porque: 'Why {n}?', perdas: 'deductions:', nenhuma: 'none', limT: 'hosting limit',
    limite: 'GitHub Pages doesn’t let any site set the missing headers — a hosting limit, not a site flaw.',
    dec: ' Decision on record: staying here for now; the _headers file already in the repo solves this the day I move to a host that reads it.',
    nAlvos: '{n} targets', lista: 'view as list', mapa: 'view as map',
    cols: 'Target|Class|Score (0–10)|Region|Changed in the last collection?', sim: 'yes', nao: 'no',
    fuso: 'browser time zone: {tz} → reference: {c}', fusoOff: 'browser time zone: UTC{o} → longitude only',
    ttfb: 'time to first byte of this page (your browser’s Navigation Timing)',
    csp: 'Nothing leaves this page: its CSP is connect-src \'none\', and the observatory doesn’t read you.',
    cap: 'The observatory’s targets — text equivalent of the map',
  },
};
/* textos em PT que vêm dentro do dado real */
const EN = {
  'Baía de São Francisco, EUA': 'San Francisco Bay Area, USA', 'Massachusetts, EUA': 'Massachusetts, USA',
  'operador do observatório': 'observatory operator', 'sede da OWASP Foundation': 'OWASP Foundation headquarters',
  'HSTS com max-age >= 180 dias': 'HSTS with max-age >= 180 days', 'CSP em <meta> (crédito parcial)': 'CSP in <meta> (partial credit)',
  ':80 sobe para HTTPS': ':80 upgrades to HTTPS', 'X-Powered-By revela pilha': 'X-Powered-By reveals the stack',
};

/* terra: grade de 2° (lat 81…−55 × lon −179…179 = 69 × 180), linha a linha, em corridas alternadas mar/terra;
   cada caractere = comprimento + 48 (corrida longa = '[' + '0' + resto). Gerada dos meus polígonos. */
const TERRA = '[U[0@1[0WVA5[0[0R97F[0?5[0X4:CW3<=>3[02995:BU27OS5?822388?[04[03:17N28276<GD6[0A2Y664991?94[0K8U676775<52[0S8T9395G62[0S982I82>2G74[0F15@39E87S63[0@74OG58L2542[0A83QI1:K3414[0A92SH1;H2132[0H81UP32I11[0L[03M1123I[0N[03PNJ1[[06LQ71811251[22[03KN73225642Y[08IP571221<1R13[0<GQ4;21;2Q32[0<GR144=[1242[07ES9<[63[09CS<:[51[0=ATD1[02[0D861SF261S[0F6ZG274O[0F6ZH27124I21[0F571QJ1;4;1:[0L4XK1:7827[0Q31372JL188656[0S5ST956671[0M5QQ=38662[0M4RM@39562[0O345IM12=1<363[0P318HN@181;2[0S;GLJ18121[0T=F16DK153[0V>NBJ254[0V?N@L24412[0SAL@M23321[0SEI?O1422163[0JGH>P1?5[0HFH>Q3=5[0GEI>[0:2[0GDI>[031[0PCI>31Y331[0LAJ>23U632[0L@J=33S>[0L?J<42S?[0K?L:52QB[0J>M:52QC[0I<O:XC[0I;Q8YC[0I;Q7ZC[0I:R6[72:[0I9T4[0146116[0I8[0[0<6;1[0=8[0[0=4=1[0<6[0[0P1[0<5[0[0B2;1[0>4[0[0O2[0>4[0[0N2[0>5[0[0[0[034[0[0[0[052[0[0[0[072';
/* fuso IANA (último segmento) → cidade de referência "lat lon" */
const FUSOS = 'Sao_Paulo -24 -47,Bahia -13 -38,Fortaleza -4 -39,Recife -8 -35,Maceio -10 -36,Belem -1 -48,Manaus -3 -60,Cuiaba -16 -56,Campo_Grande -20 -55,Porto_Velho -9 -64,Rio_Branco -10 -68,Buenos_Aires -35 -58,Montevideo -35 -56,Asuncion -25 -58,Santiago -33 -71,La_Paz -17 -68,Lima -12 -77,Bogota 5 -74,Caracas 10 -67,Guayaquil -2 -80,Panama 9 -80,Mexico_City 19 -99,Havana 23 -82,Santo_Domingo 18 -70,New_York 41 -74,Toronto 44 -79,Chicago 42 -88,Denver 40 -105,Phoenix 33 -112,Los_Angeles 34 -118,Vancouver 49 -123,Anchorage 61 -150,Honolulu 21 -158,Azores 38 -26,Reykjavik 64 -22,Lisbon 39 -9,London 52 0,Dublin 53 -6,Madrid 40 -4,Paris 49 2,Brussels 51 4,Amsterdam 52 5,Berlin 53 13,Zurich 47 9,Rome 42 12,Vienna 48 16,Warsaw 52 21,Stockholm 59 18,Oslo 60 11,Helsinki 60 25,Athens 38 24,Istanbul 41 29,Kiev 50 31,Kyiv 50 31,Moscow 56 38,Casablanca 34 -8,Lagos 6 3,Luanda -9 13,Maputo -26 33,Johannesburg -26 28,Nairobi -1 37,Cairo 30 31,Jerusalem 32 35,Riyadh 25 47,Dubai 25 55,Tehran 36 51,Karachi 25 67,Kolkata 23 88,Calcutta 23 88,Bangkok 14 101,Saigon 11 107,Ho_Chi_Minh 11 107,Singapore 1 104,Jakarta -6 107,Manila 15 121,Hong_Kong 22 114,Shanghai 31 121,Seoul 38 127,Tokyo 36 140,Perth -32 116,Sydney -34 151,Melbourne -38 145,Auckland -37 175';

const ST = { ok: 'sev-ok', inconclusivo: 'mapa-inc', pulada: 'mapa-pul' };
const el = (t, c, x, p) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; if (p) p.appendChild(e); return e; };
const at = (e, o) => { for (const k in o) e.setAttribute(k, o[k]); return e; };

let MASC;
function mascara() {
  if (!MASC) {
    MASC = new Uint8Array(12420);
    let i = 0, k = 0;
    for (const c of TERRA) MASC.fill(k++ & 1, i, (i += c.charCodeAt(0) - 48));
  }
  return MASC;
}

function ondeVoce() {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { tz = ''; }
  const c = tz.split('/').pop(), r = c && FUSOS.split(',').find((e) => e.startsWith(c + ' '));
  if (r) { const [, la, lo] = r.split(' '); return { tz, c: c.replace(/_/g, ' '), lat: +la, lon: +lo }; }
  const off = -new Date().getTimezoneOffset() / 60;
  return { off, lat: 0, lon: Math.max(-178, Math.min(178, off * 15)) };
}

export function montar(raiz, ctx) {
  const D = ctx.dados.observatorio, mud = D.ultima_coleta_mudaram || [];
  let L = ctx.idioma === 'en' ? 'en' : 'pt', red = !!ctx.reduzido, pau = !!ctx.pausado, lst = false, F = ctx.frescor || {}, NF, N1, NS, RT, iM, ttfb = 0;
  const id = 'mapa-' + Math.random().toString(36).slice(2, 8);
  const T = (k, o) => String(TXT[L][k] ?? TXT.pt[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => o[x]);
  const tr = (s) => (L === 'en' ? EN[s] || s.replace(' sem ', ' without ').replace('sede da organização', 'organization headquarters') : s);
  const fmt = () => {
    const l = L === 'en' ? 'en-US' : 'pt-BR', u = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    NF = new Intl.NumberFormat(l); N1 = new Intl.NumberFormat(l, u);
    NS = new Intl.NumberFormat(l, { ...u, signDisplay: 'always' }); RT = new Intl.RelativeTimeFormat(l);
  };
  /* idade da última leitura: do frescor central (ctx.frescor), nunca de um relógio próprio */
  const idade = (m = F.idadeMin) => (m >= 0 ? (m < 60 ? RT.format(-Math.max(1, m), 'minute')
    : m < 2880 ? RT.format(-Math.round(m / 60), 'hour') : RT.format(-Math.round(m / 1440), 'day')) : '—');
  fmt();
  try { const n = performance.getEntriesByType('navigation')[0]; ttfb = Math.max(0, n.responseStart - (n.activationStart || 0)); } catch (e) { ttfb = 0; }

  /* alvos da mesma região viram um aglomerado (a Baía de SF tem 4) */
  const alvos = Object.entries(D.postura).map(([h, p]) => {
    const s = D.serie[h] || {};
    return { h, p, s, n: s.nota_atual ?? p.nota, mu: mud.includes(h), pr: p.classe === 'proprio' };
  }).sort((a, b) => a.p.regiao.lon - b.p.regiao.lon);
  const marc = [];
  for (const a of alvos) {
    let m = marc.find((x) => x.rg === a.p.regiao.rotulo);
    if (!m) marc.push((m = { rg: a.p.regiao.rotulo, m: [], at: 0, lat: a.p.regiao.lat, lon: a.p.regiao.lon }));
    m.m.push(a);
    m.g = m.m.length > 1;
  }
  const V = ondeVoce(), voce = { m: [], at: 0, lat: V.lat, lon: V.lon };
  marc.sort((a, b) => a.g - b.g).splice(marc.findIndex((m) => m.g) >>> 0, 0, voce);
  /* a ficha abre no alvo que mudou na última coleta; o meu próprio número nunca é o gancho */
  let sel = marc.find((m) => m.m.some((a) => a.h === mud[0])) || marc.find((m) => m.m[0] && !m.m[0].pr) || marc[0];
  sel.at = Math.max(0, sel.m.findIndex((a) => a.h === mud[0]));

  const cx = at(el('section', 'painel mapa-raiz', 0, raiz), { 'aria-labelledby': id + 't' });
  const cab = el('div', 'painel-h', 0, cx), tit = at(el('h2', 'painel-t', 0, cab), { id: id + 't' }), bdg = el('div', 'mapa-badges', 0, cab);
  const bAl = el('span', 'chip sev-holo', 0, bdg), bVi = el('span', 'ao-vivo', 0, bdg), palco = at(el('div', 'mapa-palco', 0, cx), { role: 'group' });
  const cv = [0, 1].map(() => at(el('canvas', 0, 0, palco), { 'aria-hidden': 'true' }));
  const orb = el('p', 'mapa-orb', 0, palco), orbT = el('b', 0, 0, orb), orbS = el('span', 0, 0, orb), orbM = el('small', 0, 0, orb);
  for (const m of marc) {
    m.btn = at(el('button', 'mapa-alvo mapa-' + (m === voce ? 'voce' : m.g ? 'grupo' : m.m[0].pr ? 'pr' : 'rf'), 0, palco), { type: 'button', 'aria-controls': id + 'f' });
    m.no = at(el('span', 'mapa-no', 0, m.btn), { 'aria-hidden': 'true' });
    m.ro = at(el('span', 'mapa-rot', 0, m.btn), { 'aria-hidden': 'true' });
    const f = () => escolher(m);
    m.btn.onpointerenter = (e) => e.pointerType === 'mouse' && f();
    m.btn.onfocus = m.btn.onclick = f;
  }
  const fic = at(el('div', 'mapa-ficha', 0, cx), { id: id + 'f' });
  const fMem = at(el('div', 'mapa-membros', 0, fic), { role: 'group' }), fDet = el('div', 'mapa-det', 0, fic);
  const lis = el('div', 'mapa-lista', 0, cx), rod = el('div', 'mapa-rodape', 0, cx), info = el('div', 'mapa-info', 0, rod);
  const alt = at(el('button', 'btn mapa-alterna', 0, rod), { type: 'button' }), avi = at(el('p', 'sr-only', 0, rod), { 'aria-live': 'polite' });
  lis.hidden = true;

  const fms = () => (ttfb ? (ttfb < 10 ? N1 : NF).format(ttfb < 10 ? ttfb : Math.round(ttfb)) : '—');
  const req = () => T('req') + fms() + ' ms';
  const fuso = () => (V.tz ? T('fuso', { tz: V.tz, c: V.c }) : T('fusoOff', { o: (V.off < 0 ? '−' : '+') + NF.format(Math.abs(V.off)) }));
  /* cor = a CLASSE (meu site em sinapse, referência em holo); nota = só o número na escala dela, em tinta normal */
  const cl = (a) => T(a.pr ? 'proprio' : 'referencia'), cc = (a) => 'mapa-' + (a.pr ? 'pr' : 'rf'), cor = (a) => (a.pr ? 'synapse-lift' : 'holo');
  const n10 = (a) => N1.format(a.n) + '/10';
  const nome = (a) => [a.h, cl(a), n10(a), tr(a.p.regiao.rotulo), a.mu && T('delta')].filter(Boolean).join(' — ');
  const lim = (pai, pre) => { const q = el('p', 'mapa-f-lim', 0, pai); el('b', 'mapa-lim', T('limT'), q); q.append(pre + T('limite') + T('dec')); };
  /* proveniência: o ponto pulsa só dentro do frescor central; fora dele fica neutro e diz a idade */
  const selo = () => {
    iM = F.idadeMin;
    bVi.className = F.fresco ? 'ao-vivo' : 'ao-vivo neutro';
    bVi.textContent = T(F.fresco ? 'vivo' : 'velho', { r: idade() }) + (pau ? ' · ' + T('pausado') : '');
  };

  /* rótulo completo; com .mapa-curto (palco estreito ou nenhum lado livre) as partes .mapa-x somem */
  function rotulos() {
    for (const m of marc) {
      const a = m.m[0], v = m === voce, n = NF.format(m.m.length), d = m.m.filter((x) => x.mu).length, r = m.ro;
      r.replaceChildren();
      m.no.textContent = m.g ? n : '';
      el('b', v ? 0 : 'mapa-x', v ? T('voce') : m.g ? tr(m.rg).split(',')[0] : a.h, r);
      const s = el('span', 'mapa-n', 0, r);
      if (v) el('span', 'mapa-x', T('req'), s);
      s.append(v ? fms() + ' ms' : m.g ? T('nAlvos', { n }) : n10(a));
      if (v) el('small', 'mapa-x', T('aprox'), r);
      if (a && a.pr) el('i', 'mapa-tag', T('proprio'), r);
      if (d) el('span', 'mapa-dl', m.g ? 'Δ' + NF.format(d) : 'Δ', r);
      m.btn.setAttribute('aria-label', v ? T('voce') + ': ' + req() + '. ' + T('aprox')
        : m.g ? tr(m.rg) + ': ' + T('nAlvos', { n }) + ' — ' + m.m.map((x) => x.h + ' ' + n10(x)).join(', ') : nome(a));
    }
  }

  const marcar = () => marc.forEach((x) => x.btn.setAttribute('aria-current', x === sel));
  function escolher(m) {
    if (sel === m) return;
    sel = m;
    marcar();
    ficha();
    if (W && !raf) quadro();
  }

  /* ficha: hover, foco ou toque; no aglomerado, botões escolhem o alvo */
  function ficha() {
    if (sel.bx) fic.style.setProperty('--cx', Math.round(sel.bx) + 'px');
    at(fMem, { 'aria-label': tr(sel.rg || '') });
    fMem.replaceChildren();
    fMem.hidden = !sel.g;
    if (sel.g) sel.m.forEach((a, i) => {
      const b = at(el('button', 'mapa-membro ' + cc(a), 0, fMem), { type: 'button', 'aria-pressed': i === sel.at, 'aria-label': nome(a) });
      el('span', 'mapa-n', n10(a), b);
      el('span', 0, a.h + (a.mu ? ' Δ' : ''), b);
      const f = () => {
        if (sel.at === i) return;
        sel.at = i;
        [...fMem.children].forEach((c, j) => c.setAttribute('aria-pressed', j === i));
        det();
        if (W && !raf) quadro();
      };
      b.onclick = b.onfocus = f;
      b.onpointerenter = (e) => e.pointerType === 'mouse' && f();
    });
    det();
  }

  function det() {
    fDet.replaceChildren();
    const v = sel === voce, a = sel.m[sel.at] || {}, s = a.s, p = a.p;
    const top = el('div', 'mapa-f-topo', 0, fDet), gr = el('div', 'mapa-f-grade', 0, fDet);
    const nt = el('p', 'mapa-f-nota', 0, gr), inf = el('div', 0, 0, gr);
    const lin = (x, c) => el('p', 'mapa-f-l ' + (c || ''), x, inf);
    el('span', 'mapa-f-host', v ? T('voce') : a.h, top);
    el('span', 'mapa-f-classe ' + (v ? 'mapa-voce' : cc(a)), v ? T('aprox') : cl(a), top);
    el('b', 0, v ? fms() : N1.format(a.n), nt);
    el('small', 0, v ? 'ms' : '/10', nt);
    if (v) {
      lin(req() + ' — ' + T('ttfb'));
      lin(fuso());
      return el('p', 'mapa-f-lim', T('csp'), fDet);
    }
    lin(T('serie', { a: N1.format(s.nota_min), b: N1.format(s.nota_max), n: NF.format(s.leituras) }));
    /* sondas por estado: "inconclusivo" é estado próprio, não ausência */
    const est = {};
    for (const [k, x] of Object.entries(s.sondas_atuais || {})) (est[x] = est[x] || []).push(T(k));
    for (const x in est) { const q = lin(); el('span', 'chip ' + (ST[x] || 'sev-info'), T('st_' + x), q); el('span', 0, est[x].join(' · '), q); }
    lin(a.mu ? 'Δ ' + T('delta') : T('semDelta'), a.mu && 'mapa-sim');
    const pq = el('div', 'mapa-f-pq', 0, fDet), per = p.perdas || [];
    const item = (q, [mo, pt], c) => { const i = el('span', 0, 0, q); el('b', c, NS.format(pt), i); i.append(' ' + tr(mo)); };
    if (a.pr) {
      el('p', 'mapa-f-pqt', T('porque', { n: N1.format(a.n) }), pq);
      const q = el('p', 'mapa-f-l', 0, pq);
      (p.ganhos || []).forEach((x) => item(q, x));
    }
    const pe = el('p', 'mapa-f-l', 0, pq);
    el('span', 0, T('perdas'), pe);
    if (per.length) per.forEach((x) => item(pe, x, 'mapa-neg')); else el('span', 0, T('nenhuma'), pe);
    if (a.pr) lim(pq, ' ');
    const rg = el('p', 'mapa-f-rg', 0, fDet);
    el('b', 0, tr(p.regiao.rotulo), rg);
    rg.append(' · ' + tr(p.regiao.nota) + ' — ' + T(a.pr ? 'oper' : 'sede'));
  }

  function rodape() {
    info.replaceChildren();
    el('p', 'voz mapa-voz', T('voz'), info);
    const lg = el('ul', 'mapa-leg', 0, info), li = (c, t, x) => { const e = el('li', 0, 0, lg); if (c) el('span', c, t, e); e.append(x); };
    li(0, 0, T('escala'));
    li('mapa-sw mapa-pr', 0, T('proprio'));
    li('mapa-sw mapa-rf', 0, T('referencia'));
    li('mapa-dl', 'Δ', T('deltaL'));
    li('chip mapa-inc', T('st_inconclusivo'), T('inc'));
    li('mapa-vc', 0, T('voce') + ': ' + T('aprox'));
    if (F.fresco && !red) li('mapa-pi', 0, T('pulso'));
  }

  function tabela() {
    lis.replaceChildren();
    const w = at(el('div', 'mapa-tabw', 0, lis), { tabindex: 0, role: 'region', 'aria-label': T('cap') }), tb = el('table', 'mapa-tab', 0, w);
    el('caption', 0, T('cap'), tb);
    const hr = el('tr', 0, 0, el('thead', 0, 0, tb)), bd = el('tbody', 0, 0, tb);
    for (const c of T('cols').split('|')) at(el('th', 0, c, hr), { scope: 'col' });
    for (const a of alvos) {
      const r = el('tr', 0, 0, bd);
      at(el('th', 0, a.h, r), { scope: 'row' });
      el('td', 0, cl(a), r);
      el('td', 0, n10(a), r);
      el('td', 0, tr(a.p.regiao.rotulo), r);
      el('td', 0, a.mu ? 'Δ ' + T('sim') : T('nao'), r);
    }
    const o = alvos.find((a) => a.pr);
    if (o) lim(lis, ' ' + o.h + ' · ' + n10(o) + ' — ');
    el('p', 'mapa-f-l', T('sede'), lis);
    el('p', 'mapa-f-l', T('voce') + ': ' + fuso() + ' · ' + req(), lis);
  }

  function textos() {
    tit.textContent = T('titulo');
    bAl.textContent = T('alvos', { n: NF.format(D.alvos) });
    selo();
    palco.setAttribute('aria-label', T('palco'));
    orbT.textContent = T('obs');
    orbS.textContent = T('obsSub');
    orbM.textContent = T('obsMed', { c: D.coletas_por_dia >= 0 ? N1.format(D.coletas_por_dia) : '—' });
    alt.textContent = T(lst ? 'mapa' : 'lista');
    rotulos();
    ficha();
    rodape();
    if (lst) tabela();
  }

  /* equirretangular 83°N..57°S; no estreito, recorta a longitude em volta dos pontos */
  let W = 0, H = 0, s = 1, lo0 = -180, oy = 0, banda = 0, comp = false, dpr = 1, sx = 0, sy = 0, ARC = [];
  const C = {}, X = (lo) => (lo - lo0) * s, Y = (la) => oy + (83 - la) * s;

  function layout() {
    const r = palco.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const lons = marc.map((m) => m.lon), a = Math.min(...lons) - 24, b = Math.max(...lons) + 24;
    W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1); comp = W < 520;
    banda = Math.round(Math.max(44, Math.min(92, H * 0.16)));
    const hm = H - banda - 4;
    let sp = Math.min(360, (W * 140) / hm);
    if (b - a > sp) sp = Math.min(360, b - a);
    s = W / sp;
    lo0 = Math.max(-180, Math.min(180 - sp, (a + b - sp) / 2));
    oy = banda + Math.max(0, (hm - 140 * s) / 2);
    sx = W / H < 1.8 ? 26 : Math.round(W * 0.5);
    sy = Math.round(banda / 2);
    for (const c of cv) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const cs = getComputedStyle(cx);
    for (const k of ['holo', 'synapse-lift', 'void-0']) C[k] = cs.getPropertyValue('--' + k).trim();
    for (const m of marc) { m.bx = m.x = X(m.lon); m.by = m.y = Y(m.lat); }
    /* você sobre um alvo (fuso de São Paulo): o botão se afasta sem sobrepor a área de toque (44 px), uma guia aponta o lugar */
    const perto = (x, y) => marc.some((o) => o !== voce && Math.max(Math.abs(o.x - x), Math.abs(o.y - y)) < 46);
    if (perto(voce.x, voce.y)) for (const [dx, dy] of [[0, 46], [0, -46], [46, 0], [-46, 0], [46, 46], [-46, 46]]) {
      const x = voce.x + dx, y = voce.y + dy;
      if (!perto(x, y) && x > 22 && x < W - 22 && y > banda + 22 && y < H - 22) { voce.bx = x; voce.by = y; break; }
    }
    for (const m of marc) { m.btn.style.setProperty('--x', m.bx.toFixed(1) + 'px'); m.btn.style.setProperty('--y', m.by.toFixed(1) + 'px'); }
    orb.style.setProperty('--x', sx + 24 + 'px');
    orb.style.setProperty('--y', sy + 'px');
    const g = cv[1].getContext('2d');
    ARC = [];
    for (const m of marc) m.m.forEach((al, j) => {
      const tx = X(al.p.regiao.lon), ty = Y(al.p.regiao.lat), k = (j - (m.m.length - 1) / 2) * 18, i = ARC.length, gr = g.createLinearGradient(sx, sy, tx, ty);
      gr.addColorStop(0, C.holo);
      gr.addColorStop(1, C[cor(al)]);
      /* pulso: viagem T s, período P ≥ 3,4 s (< 1 a cada 2,5 s), fase própria */
      ARC.push({ m, j, al, gr, p: [sx, sy, tx * 0.7 + sx * 0.3 + k, sy + (ty - sy) * 0.08 + Math.abs(k) / 2, tx, ty], T: 1.9 + 0.3 * (i % 3), P: 3.4 + ((i * 1.37) % 1.8), f: (i * 0.618) % 1 });
    });
    rotular();
    fundo();
    quadro();
    fic.style.setProperty('--cx', Math.round(sel.bx) + 'px');
  }

  /* rótulo no 1º lado que fica dentro do palco sem cobrir a área de toque (44 px) de outro nó, outro rótulo nem o
     satélite; tenta cheio → quebrado em 2 linhas → curto (palco estreito: só o curto). Sem lado livre: o de menor
     sobreposição, ainda dentro do palco. Abaixo/acima deslizam na horizontal; direita/esquerda, na vertical. */
  function rotular() {
    if (!W) return;
    const cl = (v, a, b) => Math.max(a, Math.min(b, v)), oh = orb.offsetHeight, ob = marc.map((m) => [m.bx - 22, m.by - 22, 44, 44]);
    ob.push([sx - 20, sy - Math.max(16, oh / 2), orb.offsetWidth + 46, Math.max(32, oh)]);
    marc.forEach((m, i) => {
      let o, w, h;
      for (const md of comp ? [2] : [0, 1, 2]) {
        m.btn.classList.toggle('mapa-quebra', md === 1);
        m.btn.classList.toggle('mapa-curto', md === 2);
        w = m.ro.offsetWidth; h = m.ro.offsetHeight;
        const sob = ([, x, y]) => ob.reduce((t, c, j) => t + (j === i ? 0 : Math.max(0, Math.min(x + w, c[0] + c[2]) - Math.max(x, c[0])) * Math.max(0, Math.min(y + h, c[1] + c[3]) - Math.max(y, c[1]))), 0);
        const op = [['dir', m.bx + 19, m.by - h / 2], ['baixo', m.bx - w / 2, m.by + 19], ['esq', m.bx - 19 - w, m.by - h / 2], ['cima', m.bx - w / 2, m.by - 19 - h]]
          .map(([l, x, y], k) => [l, k % 2 ? cl(x, 4, W - 4 - w) : x, k % 2 ? y : cl(y, banda, H - 3 - h), x, y])
          .filter(([, x, y]) => x >= 4 && x + w <= W - 4 && y >= banda && y + h <= H - 3);
        if ((o = op.find((p) => !sob(p)))) break;
        if (md === 2) o = op.sort((p, q) => sob(p) - sob(q))[0] || ['baixo', cl(m.bx - w / 2, 4, W - 4 - w), cl(m.by + 19, banda, H - 3 - h), m.bx - w / 2, m.by + 19];
      }
      m.btn.dataset.lado = o[0];
      m.ro.style.setProperty('--dx', o[1] - o[3] + 'px');
      m.ro.style.setProperty('--dy', o[2] - o[4] + 'px');
      ob.push([o[1], o[2], w, h]);
    });
  }

  function fundo() {
    const g = cv[0].getContext('2d'), M = mascara(), luz = marc.filter((m) => m !== voce), r = Math.max(0.7, Math.min(1.3, s * 0.38));
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    Object.assign(g, { strokeStyle: C.holo, fillStyle: C.holo, lineWidth: 1, globalAlpha: 0.25 });
    g.setLineDash([2, 5]);
    g.beginPath();
    g.moveTo(sx - W, sy + banda * 0.55);
    g.quadraticCurveTo(sx, sy - banda * 0.55, sx + W, sy + banda * 0.55);
    g.stroke();
    for (let la = 81; la > -57; la -= 2) for (let lo = -179; lo < 180; lo += 2) {
      const x = X(lo), y = Y(la);
      if (x < -2 || x > W + 2 || !M[(81 - la) * 90 + (lo + 179) / 2]) continue;
      let k = 0.26 + 0.07 * Math.sin(lo * 0.09 + la * 0.13);
      for (const m of luz) k += 0.5 * Math.exp(-((x - m.x) ** 2 + (y - m.y) ** 2) / 12800);
      g.globalAlpha = Math.min(0.85, k);
      g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }

  /* camada viva; reduzido = estado final. A sonda só pulsa dentro do frescor central (retrato velho = satélite
     parado); o anel do "você" (medido agora, no navegador) anima uma vez nos dois casos */
  function quadro() {
    const g = cv[1].getContext('2d'), t = tA, an = !red, vv = an && F.fresco, A = (o) => Object.assign(g, o);
    const cir = (x, y, r, a0 = 0, a1 = 7) => { g.beginPath(); g.arc(x, y, r, a0, a1); };
    const reta = (x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    A({ lineWidth: 1, strokeStyle: C.holo, globalAlpha: 0.35 });
    g.setLineDash([2, 4]);
    reta(sel.bx, sel.by + 17, sel.bx, H);
    g.setLineDash([]);
    for (const a of ARC) for (const w of a.m === sel && a.j === a.m.at ? [6, 1.6] : [1]) {
      A({ globalAlpha: w > 5 ? 0.12 : w > 1 ? 0.95 : 0.38, lineWidth: w, strokeStyle: a.gr });
      g.beginPath();
      g.moveTo(a.p[0], a.p[1]);
      g.quadraticCurveTo(a.p[2], a.p[3], a.p[4], a.p[5]);
      g.stroke();
    }
    g.lineWidth = 1;
    if (vv) for (const a of ARC) {
      const l = (t + a.f * a.P) % a.P, u = l / a.T, e = u * u * (3 - 2 * u), p = a.p;
      if (l < a.T) for (let k = 0; k < 10 && e > k * 0.012; k++) {
        const w = e - k * 0.012, v = 1 - w;
        A({ fillStyle: C.holo, globalAlpha: 0.95 - k * 0.09 });
        cir(v * v * p[0] + 2 * v * w * p[2] + w * w * p[4], v * v * p[1] + 2 * v * w * p[3] + w * w * p[5], k ? 1.2 : 2.2);
        g.fill();
      } else if (l < a.T + 0.9) {
        A({ strokeStyle: C[cor(a.al)], globalAlpha: 0.4 - (0.4 * (l - a.T)) / 0.9 });
        cir(p[4], p[5], 10 + (12 * (l - a.T)) / 0.9);
        g.stroke();
      }
    }
    /* o observatório não tem cidade: é o satélite acima do mapa */
    A({ strokeStyle: C.holo, fillStyle: C['void-0'], globalAlpha: 0.3 });
    cir(sx, sy, 14 + (vv ? 1.6 * Math.sin(t * 1.25) : 0));
    g.stroke();
    g.globalAlpha = 0.9;
    g.strokeRect(sx - 19.5, sy - 3.5, 9, 7);
    g.strokeRect(sx + 10.5, sy - 3.5, 9, 7);
    g.globalAlpha = 1;
    g.beginPath();
    g.moveTo(sx, sy - 7); g.lineTo(sx + 7, sy); g.lineTo(sx, sy + 7); g.lineTo(sx - 7, sy);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = C.holo;
    cir(sx, sy, 2.2);
    g.fill();
    for (const m of marc) if (m.g) {
      const d = (2 * Math.PI) / m.m.length;
      m.m.forEach((a, i) => {
        A({ strokeStyle: C[cor(a)], lineWidth: m === sel && i === m.at ? 3.2 : 2 });
        cir(m.bx, m.by, 13, i * d - 1.37, (i + 1) * d - 1.77);
        g.stroke();
      });
    }
    A({ lineWidth: 1, strokeStyle: C['synapse-lift'], fillStyle: C['synapse-lift'], globalAlpha: 0.75 });
    if (voce.by !== voce.y || voce.bx !== voce.x) {
      g.setLineDash([2, 3]);
      reta(voce.x, voce.y, voce.bx, voce.by);
      g.setLineDash([]);
      cir(voce.x, voce.y, 2.2);
      g.fill();
    }
    const k = an ? Math.min(1, Math.max(0, (t - 0.5) / 2.4)) : 1;
    if (k < 1) { g.globalAlpha = 0.75 * (1 - k); cir(voce.bx, voce.by, 7 + 48 * k * (2 - k)); g.stroke(); }
    g.globalAlpha = 0.6;
    cir(voce.bx, voce.by, 10);
    g.stroke();
  }

  let raf = 0, tA = 0, tP = 0, vis = false, rz = 0;
  const passo = (ts) => { raf = 0; tA += tP ? Math.min(0.05, (ts - tP) / 1e3) : 0; tP = ts; if (F.idadeMin !== iM) selo(); quadro(); agendar(); };
  /* fora do frescor o laço só vive até o anel do "você" assentar (~3 s) */
  const agendar = () => { if (!raf && vis && !pau && !red && !lst && W && (F.fresco || tA < 3)) raf = requestAnimationFrame(passo); };
  const parar = () => { cancelAnimationFrame(raf); raf = tP = 0; };
  const estado = () => { cx.classList.toggle('mapa-reduzido', red); cx.classList.toggle('mapa-pausado', pau); };

  alt.onclick = () => {
    lst = !lst;
    palco.hidden = fic.hidden = lst;
    lis.hidden = !lst;
    alt.textContent = T(lst ? 'mapa' : 'lista');
    avi.textContent = T(lst ? 'cap' : 'palco');
    if (lst) { parar(); tabela(); } else { layout(); agendar(); }
  };

  estado();
  textos();
  marcar();
  const io = new IntersectionObserver((es) => { vis = es[es.length - 1].isIntersecting; if (!vis) return parar(); if (F.idadeMin !== iM) selo(); agendar(); });
  const ro = new ResizeObserver(() => { rz = rz || requestAnimationFrame(() => { rz = 0; layout(); agendar(); }); });
  io.observe(palco);
  ro.observe(palco);
  if (document.fonts) { document.fonts.ready.then(rotular); document.fonts.addEventListener('loadingdone', rotular); }

  return {
    pausar(b) { pau = !!b; estado(); selo(); if (pau) parar(); else agendar(); },
    idioma(l) { L = l === 'en' ? 'en' : 'pt'; fmt(); textos(); rotular(); },
    reduzir(b) { red = !!b; estado(); rodape(); if (red) parar(); if (W) quadro(); agendar(); },
    /* o app avisa quando o retrato vira (fresco ⇄ velho): selo, legenda e pulso mudam sem recarregar */
    frescor(f) { if (f) F = f; selo(); rodape(); if (W) quadro(); agendar(); },
    destruir() { parar(); io.disconnect(); ro.disconnect(); cancelAnimationFrame(rz); if (document.fonts) document.fonts.removeEventListener('loadingdone', rotular); cx.remove(); },
  };
}
