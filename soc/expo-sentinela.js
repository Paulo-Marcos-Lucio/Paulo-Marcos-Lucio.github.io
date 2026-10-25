/* expo-sentinela · "o scan" — reproduz o laudo REAL do Sentinela sobre o próprio site do Paulo.
   Todo número sai de ctx.dados (sentinela_site + suite.sentinela): achados, severidades, OWASP/CWE,
   distribuição e nota são os do laudo; encenado é só o RITMO do replay. Contrato: CONTRATO.md. */

const TXT = {
  pt: {
    loc: 'pt-BR',
    sobre: 'Prova real · Sentinela',
    tit: 'Comecei pelo meu próprio site — achei, corrigi, retestei',
    lead: (a, d) => `Rodei a minha ferramenta no meu domínio, não-intrusiva. Deu ${a} e listou o quê: CSP ausente, clickjacking, DMARC. Corrigi o que a plataforma permite (CSP via <meta>) e o reteste subiu para ${d} — publicado assim, sem maquiar.`,
    rep: 'replay do laudo real de ',
    modo: 'não-intrusivo',
    gh: 'Ver no GitHub', aba: ' (abre em nova aba)',
    con: 'Console de varredura', btn: 'Reproduzir o laudo',
    est: { ocioso: 'pronto', rodando: 'reproduzindo', apurando: 'apurando a nota', completo: 'laudo completo', pausado: 'replay pausado' },
    ach: 'achados', nota: 'nota', nh: 'Nota de higiene', esc: 'escala 0–100',
    antes: 'antes', depois: 'reteste', ad: 'achei → corrigi → retestei',
    aguarda: 'aguardando leitura…', lendo: 'lendo…', pos: '✓ em ordem',
    dist: 'Distribuição do laudo', psev: 'Por severidade',
    semow: 'Sem mapeamento OWASP', semowd: 'confirmações e informativos',
    sev: { critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa', info: 'Info' },
    pq: 'Por que não é A?', lim: '⊘ limite da hospedagem',
    pqt: 'Os pontos que faltam (X-Frame-Options, X-Content-Type-Options, HSTS com subdomínios) são cabeçalhos que o GitHub Pages não deixa nenhum site definir — é limite da hospedagem, não do site, e a própria ferramenta me diz isso com a linha exata e a saída (domínio próprio + CDN).',
    voz: 'Um scanner te dá um número; um diagnóstico te diz por que o número é esse e o que fazer.',
    prok: 'Edição Pro', prot: 'Confirma SQLi/XSS',
    prox: 'Não infere, prova — read-only, só sob autorização por escrito, com marcador inerte. A linha vermelha é código, não promessa.',
    lab: (o) => (o && typeof o === 'object')
      ? `SQLi + XSS confirmado · ${o.precisao}/${o.recall} em laboratório controlado · ${o.falsos_positivos} falso-positivo`
      : (o || ''),
    leg: (n) => `anel externo: ${n} achados, na cor da severidade`,
    sai: 'Saída',
    fmt: 'Relatório em HTML, Markdown, JSON e SARIF 2.1.0 (ingestável pela aba Security do GitHub).',
    ini: 'Reproduzindo o laudo real.',
    fim: (g, n, t) => `Laudo reproduzido: nota ${g}, ${n} de 100; ${t} achados.`,
    // ordem do replay = ordem destas chaves · [checagem, descrição curta (fiel ao laudo)]
    a: {
      TLS_OK: ['TLS / certificado', 'Certificado válido e confiável (cadeia completa, no prazo, hostname confere); transporte só em TLS moderno, com forward secrecy.'],
      HTTPS_FORCADO: ['HTTPS forçado', 'A versão em HTTP foi alcançada e a cadeia de redirecionamento termina em HTTPS: quem digita sem https:// cai no canal seguro.'],
      HSTS_SEM_SUBDOMINIOS: ['HSTS', 'HSTS ativo, mas sem includeSubDomains — diretiva que depende de um cabeçalho que o GitHub Pages não deixa o site definir.'],
      CSP_OK: ['CSP', 'A CSP existe, governa de onde os scripts carregam e não traz brecha (curinga, inline/eval, object-src ou base-uri ausentes).'],
      CORS_OK: ['CORS', 'O servidor não refletiu a origem-sonda nem a origem null e não combina curinga com credenciais: nenhum site de terceiro lê resposta autenticada.'],
      CLICKJACKING_SEM_PROTECAO: ['Clickjacking', 'Sem X-Frame-Options e sem frame-ancestors — que, numa CSP via <meta>, o navegador descarta. A página pode ser embutida num <iframe> alheio.'],
      XCTO_AUSENTE: ['X-Content-Type-Options', 'Falta X-Content-Type-Options: nosniff, então o navegador pode “adivinhar” o tipo de um arquivo e tratá-lo como script.'],
      COOP_AUSENTE: ['COOP', 'Sem Cross-Origin-Opener-Policy, a página divide o grupo de navegação com janelas de outras origens (window.opener, canal lateral).'],
      PERMISSIONS_POLICY_AUSENTE: ['Permissions-Policy', 'Nenhuma Permissions-Policy restringe câmera, microfone ou geolocalização — o que amplia o estrago de um eventual XSS.'],
      POLITICA_VIA_META: ['Política via <meta>', 'CSP e Referrer-Policy vão em <meta>: legítimo, e a única via em hospedagem estática — mas frame-ancestors, sandbox e report-uri só valem em cabeçalho.'],
      DNS_HOSPEDAGEM_GERENCIADA: ['DNS / hospedagem', 'github.io é hospedagem gerenciada: DNS e e-mail são do provedor. SPF, DMARC, CAA e DNSSEC são pulados para não gerar achado enganoso.'],
      METODOS_NAO_AVALIADOS: ['Métodos HTTP', 'O OPTIONS não trouxe Allow; o TRACE foi sondado (só leitura). PUT/DELETE/PATCH não foram enviados, por alterarem estado: a falta de Allow não prova escrita desligada.'],
    },
  },
  en: {
    loc: 'en',
    sobre: 'Real proof · Sentinela',
    tit: 'I started with my own site — found it, fixed it, retested it',
    lead: (a, d) => `I ran my own tool against my own domain, non-intrusively. It came back ${a} and listed what was wrong: missing CSP, clickjacking, DMARC. I fixed what the platform allows (CSP via <meta>) and the retest climbed to ${d} — published as-is, no touch-ups.`,
    rep: 'replay of the real report from ',
    modo: 'non-intrusive',
    gh: 'View on GitHub', aba: ' (opens in a new tab)',
    con: 'Scan console', btn: 'Replay the report',
    est: { ocioso: 'ready', rodando: 'replaying', apurando: 'computing the score', completo: 'report complete', pausado: 'replay paused' },
    ach: 'findings', nota: 'score', nh: 'Hygiene score', esc: '0–100 scale',
    antes: 'before', depois: 'retest', ad: 'found it → fixed it → retested it',
    aguarda: 'awaiting read…', lendo: 'reading…', pos: '✓ in order',
    dist: 'Report breakdown', psev: 'By severity',
    semow: 'No OWASP mapping', semowd: 'confirmations and informational',
    sev: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low', info: 'Info' },
    pq: 'Why not an A?', lim: '⊘ hosting limit',
    pqt: 'The remaining gaps (X-Frame-Options, X-Content-Type-Options, HSTS with subdomains) are headers that GitHub Pages doesn’t let any site set — a hosting limit, not a site flaw, and the tool itself tells me so with the exact line and output (custom domain + CDN).',
    voz: 'A scanner gives you a number; a diagnosis tells you why that’s the number and what to do about it.',
    prok: 'Pro edition', prot: 'Confirms SQLi/XSS',
    prox: 'It doesn’t infer, it proves — read-only, only under written authorization, with an inert marker. The red line is code, not a promise.',
    // o número vem do dado (PT); só a forma muda: "1,00/1,00 … 0 falso-positivo" → "1.00/1.00 … 0 false positives"
    lab: (o) => {
      if (!o || typeof o !== 'object') return o || '';
      const n = (x) => (+String(x).replace(',', '.')).toLocaleString('en', { minimumFractionDigits: 2 });
      return `SQLi + XSS confirmed · ${n(o.precisao)}/${n(o.recall)} in a controlled lab · ${o.falsos_positivos} false positives`;
    },
    leg: (n) => `outer ring: ${n} findings, colored by severity`,
    sai: 'Output',
    fmt: 'Report in HTML, Markdown, JSON, and SARIF 2.1.0 (ingestible by GitHub’s Security tab).',
    ini: 'Replaying the real report.',
    fim: (g, n, t) => `Report replayed: grade ${g}, ${n} out of 100; ${t} findings.`,
    a: {
      TLS_OK: ['TLS / certificate', 'Valid, trusted certificate (complete chain, in date, hostname matches); transport only over modern TLS, with forward secrecy.', 'TLS and certificate in order'],
      HTTPS_FORCADO: ['HTTPS enforced', 'The HTTP version was reached and the redirect chain ends on HTTPS: whoever types it without https:// lands on the secure channel.', 'HTTP redirects to HTTPS'],
      HSTS_SEM_SUBDOMINIOS: ['HSTS', 'HSTS is on, but without includeSubDomains — a directive that needs a header GitHub Pages doesn’t let the site set.', 'HSTS without includeSubDomains'],
      CSP_OK: ['CSP', 'The CSP exists, governs where scripts load from and has no gap (wildcard, inline/eval, missing object-src or base-uri).', 'CSP present and governing script origins'],
      CORS_OK: ['CORS', 'The server reflected neither the probe origin nor the null origin and never pairs a wildcard with credentials: no third-party site reads an authenticated response.', 'CORS with no cross-origin leak'],
      CLICKJACKING_SEM_PROTECAO: ['Clickjacking', 'No X-Frame-Options and no frame-ancestors — which the browser drops in a <meta> CSP. The page can be embedded in someone else’s <iframe>.', 'No clickjacking protection'],
      XCTO_AUSENTE: ['X-Content-Type-Options', 'X-Content-Type-Options: nosniff is missing, so the browser may “guess” a file’s type and treat it as script.', 'X-Content-Type-Options missing'],
      COOP_AUSENTE: ['COOP', 'Without Cross-Origin-Opener-Policy, the page shares its browsing group with windows from other origins (window.opener, side channels).', 'Cross-Origin-Opener-Policy missing'],
      PERMISSIONS_POLICY_AUSENTE: ['Permissions-Policy', 'No Permissions-Policy restricts camera, microphone or geolocation — which widens the damage of an eventual XSS.', 'Permissions-Policy missing'],
      POLITICA_VIA_META: ['Policy via <meta>', 'CSP and Referrer-Policy ship in <meta>: legitimate, and the only way on static hosting — but frame-ancestors, sandbox and report-uri only work as headers.', 'Security policy declared via <meta>, not an HTTP header'],
      DNS_HOSPEDAGEM_GERENCIADA: ['DNS / hosting', 'github.io is managed hosting: DNS and email belong to the provider. SPF, DMARC, CAA and DNSSEC are skipped so as not to raise a misleading finding.', 'Domain on managed hosting (provider’s DNS/email)'],
      METODOS_NAO_AVALIADOS: ['HTTP methods', 'OPTIONS returned no Allow; TRACE was probed (read-only). PUT/DELETE/PATCH were not sent, since they change state: a missing Allow doesn’t prove writes are off.', 'No OPTIONS inventory; TRACE probed, writes not tested'],
    },
  },
};

const SEV = { critical: 'crit', high: 'high', medium: 'med', low: 'low', info: 'info' };
// "Por que não é A?": cabeçalho que o GitHub Pages não deixa definir → achado do laudo que ele explica
const LIM = [['X-Frame-Options', 'CLICKJACKING_SEM_PROTECAO'], ['X-Content-Type-Options', 'XCTO_AUSENTE'], ['HSTS · includeSubDomains', 'HSTS_SEM_SUBDOMINIOS']];
const PASSO = 420, LER = 260, VARRE = 1200, R1 = 84, R2 = 108;
const C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2, NS = 'http://www.w3.org/2000/svg';

const pad = (n) => String(n).padStart(2, '0');
const put = (e, s) => { if (e.textContent !== s) e.textContent = s; };
const oculto = (e) => (e.setAttribute('aria-hidden', 'true'), e);
const pt = (g, r) => [120 + r * Math.sin((g * Math.PI) / 180), 120 - r * Math.cos((g * Math.PI) / 180)];

function el(tag, cls, pai, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  if (pai) pai.appendChild(e);
  return e;
}
function at(e, o) {
  for (const k in o) e.setAttribute(k, typeof o[k] === 'number' ? +o[k].toFixed(2) : o[k]);
  return e;
}
const sv = (tag, o, pai) => pai.appendChild(at(document.createElementNS(NS, tag), o));

export function montar(raiz, ctx) {
  const D = ctx.dados || {}, S = D.sentinela_site || {}, SU = (D.suite || {}).sentinela || {};
  let T = TXT[ctx.idioma === 'en' ? 'en' : 'pt'];
  let pausado = !!ctx.pausado, reduzido = !!ctx.reduzido, visivel = false, iniciou = false;
  let t = 0, ult = 0, raf = 0, fase = 'ocioso', kAnt = -1, atual = -1;
  const U = 'xs' + Math.random().toString(36).slice(2, 7), REG = [];
  const tx = (e, f) => { REG.push([e, f]); put(e, f(T)); return e; };
  const nf = (n) => new Intl.NumberFormat(T.loc).format(n);

  /* ---- dados (nada inventado: ordem fixa só para o replay; achado desconhecido entra no fim) ---- */
  const todos = S.achados || [], ordem = Object.keys(TXT.pt.a);
  const A = ordem.map((id) => todos.find((a) => a.id === id)).filter(Boolean).concat(todos.filter((a) => !ordem.includes(a.id)));
  const N = A.length, TOT = S.total ?? N, PS = S.por_severidade || {};
  const nota = Number(S.nota) || 0, grau = S.grau || '', antesTxt = SU.nota_antes || '';
  const antes = Number(antesTxt.split('·')[1]);
  const depois = () => `${grau}·${nf(nota)}`;
  const T0 = Math.max(0, (N - 1) * PASSO + LER + 240), FIM = T0 + VARRE, VOLTA = Math.max(1, N * PASSO);
  const em = new Date(S.em), valida = !isNaN(em);
  const dfmt = (o) => (valida ? new Intl.DateTimeFormat(T.loc, { timeZone: 'UTC', ...o }).format(em) : '—');
  const rel = () => {
    const s = Math.max(0, (Date.now() - em) / 1e3), r = new Intl.RelativeTimeFormat(T.loc, { numeric: 'auto' });
    if (!valida) return '—';
    return s < 3600 ? r.format(-Math.round(s / 60), 'minute') : s < 172800 ? r.format(-Math.round(s / 3600), 'hour') : r.format(-Math.round(s / 86400), 'day');
  };

  raiz.textContent = '';
  const cx = el('div', 'xs-raiz', raiz);
  cx.classList.toggle('xs-red', reduzido);

  /* ---- cabeçalho: frase do site + rótulo de replay com a data REAL do laudo ---- */
  const topo = el('div', 'xs-topo', cx), tl = el('div', 'xs-tl', topo), tr = el('div', 'xs-tr', topo);
  tx(el('p', 'xs-sobre', tl), (T) => T.sobre);
  tx(el('h3', 'xs-titulo', tl), (T) => T.tit);
  tx(el('p', 'xs-lead', tl), (T) => T.lead(antesTxt, depois()));
  const rep = el('p', 'xs-rep', tr);
  oculto(el('span', 'xs-rep-i', rep, '⟲'));
  tx(el('span', '', rep), (T) => T.rep + dfmt({ dateStyle: 'long' }));
  tx(el('p', 'xs-qd', tr), (T) => [rel(), dfmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) + ' UTC', T.modo].join(' · '));
  const gh = el('a', 'btn xs-gh', tr);
  gh.href = 'https://github.com/' + (SU.repo || 'Paulo-Marcos-Lucio/sentinela');
  gh.target = '_blank';
  gh.rel = 'noopener';
  tx(el('span', '', gh), (T) => T.gh);
  oculto(el('span', '', gh, '↗'));
  tx(el('span', 'sr-only', gh), (T) => T.aba);

  const grade = el('div', 'xs-grade', cx);
  const painel = (cls, ft, fi, pai = grade) => {
    const p = el('div', 'painel ' + cls, pai), h = el('div', 'painel-h', p);
    tx(el('h4', 'painel-t', h), ft);
    if (fi) tx(el('span', 'painel-id', h), fi);
    return p;
  };

  /* ---- nota: anel segmentado (1 segmento por achado) + arco da nota + marca do "antes" ---- */
  const pn = painel('xs-nota', (T) => T.nh, (T) => T.esc);
  const nc = el('div', 'xs-nc', pn), g = el('div', 'xs-g', nc);
  const s = sv('svg', { viewBox: '0 0 240 240', 'aria-hidden': 'true', focusable: 'false' }, g);
  const lg = sv('linearGradient', { id: U + 'g', x1: 0, y1: 0, x2: 1, y2: 1 }, sv('defs', {}, s));
  sv('stop', { offset: 0, class: 'xs-g1' }, lg);
  sv('stop', { offset: 1, class: 'xs-g2' }, lg);
  sv('path', { d: 'M2 22V2h20M218 2h20v20M238 218v20h-20M22 238H2v-20', class: 'xs-hud' }, s);
  for (let v = 0; v < 100; v += 5) {
    const [x1, y1] = pt(v * 3.6, v % 25 ? 95 : 91), [x2, y2] = pt(v * 3.6, 99);
    sv('line', { x1, y1, x2, y2, class: 'xs-tk' }, s);
  }
  sv('circle', { cx: 120, cy: 120, r: R1, class: 'xs-trk' }, s);
  const arco = sv('circle', { cx: 120, cy: 120, r: R1, class: 'xs-arc', stroke: `url(#${U}g)`, 'stroke-dasharray': C1, 'stroke-dashoffset': C1, transform: 'rotate(-90 120 120)' }, s);
  const segs = A.map((_, i) => sv('circle', { cx: 120, cy: 120, r: R2, class: 'xs-seg', 'stroke-dasharray': `${(C2 / N - 5).toFixed(2)} ${C2.toFixed(2)}`, transform: `rotate(${(-90 + (i * 360) / N).toFixed(2)} 120 120)` }, s));
  const cab = sv('circle', { cx: 120, cy: 120 - R2, r: 4, class: 'xs-cab' }, s);
  if (antes >= 0 && antes <= 100) {
    const [x1, y1] = pt(antes * 3.6, 72), [x2, y2] = pt(antes * 3.6, 100), [x, y] = pt(antes * 3.6, 57);
    sv('line', { x1, y1, x2, y2, class: 'xs-at' }, s);
    sv('text', { x, y: y + 3.5, class: 'xs-al', 'text-anchor': 'middle' }, s).textContent = antesTxt;
  }
  const nuc = el('div', 'xs-nuc', g);
  const nk = el('span', 'xs-k', nuc), nn = el('span', 'xs-num', nuc), nr = el('span', 'xs-nr', nuc);
  const nd = el('span', '', nr), ngr = el('span', 'xs-gr', nr, grau);
  const ad = el('div', 'xs-ad', nc);
  const lado = (k, c) => { const p = el('p', 'xs-adp ' + c, ad); tx(el('span', 'xs-k', p), (T) => T[k]); return el('b', 'xs-adv', p); };
  lado('antes', 'xs-ada').textContent = antesTxt || '—';
  oculto(el('span', 'xs-ads', ad, '→'));
  tx(lado('depois', 'xs-add'), depois);
  tx(el('p', 'xs-adc', ad), (T) => T.ad);
  tx(el('p', 'xs-leg', pn), (T) => T.leg(nf(N)));

  /* ---- console: alvo fixo (não é input: este módulo não faz rede) + replay ---- */
  const pc = painel('xs-con', (T) => T.con, () => 'OWASP Top 10:' + (S.owasp_edicao || ''));
  const cmd = el('div', 'xs-cmd', pc), pr = el('p', 'xs-pr', cmd);
  el('span', 'xs-ps', pr, '$ ');
  pr.append('sentinela scan ');
  el('span', 'xs-alvo', pr, S.alvo || '');
  const bt = el('button', 'btn btn-holo xs-play', cmd);
  bt.type = 'button';
  oculto(el('span', '', bt, '▸'));
  tx(el('span', '', bt), (T) => T.btn);
  const est = el('p', 'xs-est', pc), estT = el('span', '', est), estK = el('span', '', est);
  const barra = el('i', '', oculto(el('div', 'xs-tri', pc)));
  const ol = el('ol', 'xs-lista', pc);
  const L = A.map((a, i) => {
    const li = el('li', 'xs-linha xs-pend', ol), b = el('button', 'xs-lb', li), did = U + 'd' + i;
    b.type = 'button';
    b.disabled = true;
    b.dataset.i = i;
    at(b, { 'aria-expanded': 'false', 'aria-controls': did, 'aria-describedby': did });
    el('span', 'xs-n', b, pad(i + 1));
    // chip e título reais ocupam o espaço desde o início (ocultos até a leitura): o replay não mexe no layout
    const l1 = el('span', 'xs-l1', b), cel = el('span', 'xs-sv', l1);
    tx(el('span', 'chip sev-' + (SEV[a.severidade] || 'info'), cel), (T) => T.sev[a.severidade] || a.severidade);
    oculto(el('span', 'xs-vaz', cel, '···'));
    tx(el('span', 'xs-chk', l1), (T) => (T.a[a.id] || [a.id])[0]);
    if (/_OK$|^HTTPS_FORCADO$/.test(a.id)) tx(el('span', 'xs-pos', l1), (T) => T.pos);
    tx(el('span', 'xs-tit', b), (T) => (T.a[a.id] || [])[2] || a.titulo);
    const o = { a, li, b, s: -1, tt: el('span', 'xs-esp', b) };
    o.ft = (T) => (o.s === 1 ? T.lendo : T.aguarda);
    REG.push([o.tt, o.ft]);
    const d = el('div', 'xs-desc', li), di = el('div', '', d);
    d.id = did;
    tx(el('p', 'xs-dp', di), (T) => (T.a[a.id] || [])[1] || '');
    el('p', 'xs-meta', di, [a.id, a.owasp, a.cwe].filter(Boolean).join(' · '));
    return o;
  });

  /* ---- distribuição (por_severidade) + categorias OWASP derivadas dos achados ---- */
  const pd = painel('xs-dist', (T) => T.dist, (T) => `${nf(TOT)} ${T.ach}`);
  const dc = el('div', 'painel-c', pd);
  tx(el('p', 'xs-sub', dc), (T) => T.psev);
  const dl = el('ul', 'xs-dl', dc);
  const DS = Object.keys(SEV).map((k) => {
    const li = el('li', 'xs-dr', dl);
    tx(el('span', 'chip sev-' + SEV[k], li), (T) => T.sev[k]);
    const f = el('i', '', oculto(el('span', 'xs-dt sev-' + SEV[k], li)));
    return { k, f, c: el('span', 'xs-dc', li) };
  });
  tx(el('p', 'xs-sub', dc), () => 'OWASP Top 10:' + (S.owasp_edicao || ''));
  const ow = el('ul', 'xs-ow', dc);
  const GS = [...new Set(A.map((a) => a.owasp || ''))].sort((x, y) => !x - !y || x.localeCompare(y)).map((k) => {
    const li = el('li', 'xs-or', ow), cod = k.split(' ')[0];
    el('span', 'xs-oc', li, k ? cod.split(':')[0] : '—');
    const on = el('span', 'xs-on', li);
    tx(el('span', '', on), (T) => (k ? k.slice(cod.length + 1) : T.semow));
    const cwe = [...new Set(A.filter((a) => (a.owasp || '') === k && a.cwe).map((a) => a.cwe))];
    tx(el('small', '', on), (T) => (k ? [cod, ...cwe].join(' · ') : T.semowd));
    return { k, li, c: el('span', 'xs-dc', li) };
  });
  tx(el('p', 'xs-sub xs-sai', dc), (T) => T.sai);
  tx(el('p', 'xs-fmt', dc), (T) => T.fmt);

  /* ---- por que não é A? (copy do site) + faixa Pro ---- */
  const pq = painel('xs-pq', (T) => T.pq, null, cx);
  const qc = el('div', 'painel-c xs-qc', pq), ql = el('ul', 'xs-ql', qc);
  for (const [hdr, id] of LIM) {
    const a = A.find((x) => x.id === id);
    if (!a) continue;
    const li = el('li', '', ql);
    el('code', 'xs-qh', li, hdr);
    tx(el('span', 'chip sev-' + SEV[a.severidade], li), (T) => T.sev[a.severidade]);
    tx(el('span', 'xs-qlim', li), (T) => T.lim);
  }
  const qt = el('div', 'xs-qt', qc);
  tx(el('p', '', qt), (T) => T.pqt);
  tx(el('p', 'voz xs-voz', qt), (T) => T.voz);
  const pro = el('div', 'xs-pro', cx);
  tx(el('span', 'xs-pk', pro), (T) => T.prok);
  tx(el('strong', 'xs-pt', pro), (T) => T.prot);
  tx(el('span', 'xs-pl', pro), (T) => T.lab(SU.pro_lab || ''));
  tx(el('p', 'xs-px', pro), (T) => T.prox);
  const vivo = el('p', 'sr-only', cx);
  vivo.setAttribute('aria-live', 'polite');

  /* ---- motor do replay: linha do tempo t (ms), só avança com rAF visível e não pausado ---- */
  function contar(k) {
    const feitos = A.slice(0, k);
    for (const d of DS) {
      const v = k >= N && PS[d.k] != null ? PS[d.k] : feitos.filter((a) => a.severidade === d.k).length;
      d.f.style.transform = `scaleX(${TOT ? v / TOT : 0})`;
      put(d.c, nf(v));
    }
    for (const gq of GS) {
      const v = feitos.filter((a) => (a.owasp || '') === gq.k).length;
      gq.li.classList.toggle('xs-zero', !v);
      put(gq.c, nf(v));
    }
  }
  function estado(k) {
    const sc = fase === 'apurando' || fase === 'completo', roda = fase === 'rodando' || fase === 'apurando';
    put(nk, sc ? T.nota : T.ach);
    put(nn, sc ? nf(nota) : pad(k));
    put(nd, sc ? '/100' : '/' + pad(N));
    ngr.hidden = !sc;
    put(estT, roda && pausado ? T.est.pausado : T.est[fase]);
    put(estK, roda ? `${pad(k)}/${pad(N)}` : `${nf(TOT)} ${T.ach}`);
    cx.classList.toggle('xs-roda', roda && !pausado);
  }
  function pintar() {
    let k = 0;
    L.forEach((o, i) => {
      const st = fase === 'ocioso' || t < i * PASSO ? 0 : t < i * PASSO + LER ? 1 : 2;
      if (st === 2) k++;
      if (o.s === st) return;
      o.s = st;
      ['xs-pend', 'xs-lendo', 'xs-feito'].forEach((c, j) => o.li.classList.toggle(c, j === st));
      o.b.disabled = st < 2;
      segs[i].setAttribute('class', 'xs-seg' + (st === 1 ? ' xs-s-l' : st === 2 ? ' xs-s-' + o.a.severidade : ''));
      put(o.tt, o.ft(T));
    });
    if (k !== kAnt) { kAnt = k; contar(k); }
    if (fase === 'rodando' && t >= T0) fase = 'apurando';
    const p = Math.min(1, Math.max(0, (t - T0) / VARRE));
    arco.setAttribute('stroke-dashoffset', (C1 * (1 - ((1 - (1 - p) ** 3) * nota) / 100)).toFixed(2));
    cab.setAttribute('transform', `rotate(${((Math.min(t, VOLTA) / VOLTA) * 360).toFixed(1)} 120 120)`);
    barra.style.transform = `scaleX(${Math.min(1, t / T0 || 0)})`;
    estado(k);
  }
  const pode = () => !pausado && visivel && !reduzido && (fase === 'rodando' || fase === 'apurando');
  function laco(agora) {
    if (ult) t += Math.min(agora - ult, 64);
    ult = agora;
    if (t >= FIM) return concluir(true);
    pintar();
    raf = pode() ? requestAnimationFrame(laco) : 0;
  }
  function retomar() { if (!raf && pode()) { ult = 0; raf = requestAnimationFrame(laco); } }
  function parar() { cancelAnimationFrame(raf); raf = 0; }
  function concluir(fala) {
    parar();
    t = FIM;
    fase = 'completo';
    pintar();
    if (fala) vivo.textContent = T.fim(grau, nf(nota), nf(TOT));
  }
  function iniciar() {
    iniciou = true;
    abrir(-1);
    if (reduzido) return concluir(true);
    parar();
    t = 0;
    fase = 'rodando';
    pintar();
    vivo.textContent = T.ini;
    retomar();
  }
  function abrir(i) {
    if (L[atual]) { L[atual].li.classList.remove('xs-aberta'); L[atual].b.setAttribute('aria-expanded', 'false'); }
    atual = i;
    if (L[i]) { L[i].li.classList.add('xs-aberta'); L[i].b.setAttribute('aria-expanded', 'true'); }
  }

  /* ---- interação: botão de replay; linha mostra a descrição ao focar (teclado) ou ao tocar ---- */
  bt.addEventListener('click', iniciar);
  ol.addEventListener('focusin', (e) => {
    const b = e.target.closest('.xs-lb');
    if (b && b.matches(':focus-visible')) abrir(+b.dataset.i);
  });
  ol.addEventListener('click', (e) => {
    const b = e.target.closest('.xs-lb');
    if (b && !b.disabled) abrir(atual === +b.dataset.i ? -1 : +b.dataset.i);
  });
  ol.addEventListener('keydown', (e) => {
    const b = e.target.closest('.xs-lb');
    if (!b) return;
    if (e.key === 'Escape') return abrir(-1);
    const ok = L.map((o) => o.b).filter((x) => !x.disabled), j = ok.indexOf(b);
    const n = ok[{ ArrowDown: j + 1, ArrowUp: j - 1, Home: 0, End: ok.length - 1 }[e.key]];
    if (n) { e.preventDefault(); n.focus(); }
  });

  pintar();
  if (reduzido) { iniciou = true; concluir(false); }
  let io = null;
  if ('IntersectionObserver' in window) {
    // autoinício por PIXELS visíveis (não por fração): o módulo é alto e a tela pode ser baixa
    io = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      visivel = e.isIntersecting;
      if (visivel && !iniciou && e.intersectionRect.height >= Math.min(240, innerHeight / 3)) iniciar();
      if (visivel) retomar(); else parar();
    }, { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.3] });
    io.observe(cx);
  } else {
    visivel = true;
    if (!iniciou) iniciar();
  }

  return {
    pausar(b) { pausado = !!b; if (pausado) parar(); else retomar(); estado(kAnt); },
    idioma(l) { T = TXT[l === 'en' ? 'en' : 'pt']; for (const [e, f] of REG) put(e, f(T)); estado(kAnt); },
    reduzir(b) {
      reduzido = !!b;
      cx.classList.toggle('xs-red', reduzido);
      if (reduzido) { iniciou = true; concluir(false); } else retomar();
    },
    destruir() { parar(); if (io) io.disconnect(); raiz.textContent = ''; },
  };
}
