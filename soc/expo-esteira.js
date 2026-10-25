/* expo-esteira · "o workflow que entrega a chave" — prefixo .xe-
   Números: ctx.dados.suite.esteira. O ci.yml é DEMONSTRAÇÃO rotulada; regras, linhas e severidades anotadas são
   a saída REAL do Esteira sobre exatamente este arquivo (o corrigido sai com 0 achados com um SHA de 40 hex no
   lugar do marcador; com o marcador literal ele aponta o pin, baixa — como deve). Encenado é só o RITMO. */

const TXT = {
  pt: {
    loc: 'pt-BR',
    sobre: 'Cadeia de suprimentos · Esteira',
    tit: 'O workflow que entrega a chave',
    lead: 'Auditor de segurança de CI/CD (GitHub Actions) — script injection, actions não-fixadas por SHA, `pull_request_target`, permissões.',
    gh: 'Ver no GitHub', aba: ' (abre em nova aba)',
    kAria: 'Números medidos em corpus público, reproduzíveis em dois comandos',
    k: ['regras no corpus', 'recall no corpus', 'falso-positivo', 'travamento de CI por ReDoS, medido e corrigido'],
    ad: ['antes', 'depois'],
    rev: 'Revisão do workflow',
    demo: ['demonstração · workflow vulnerável de propósito', 'demonstração · o mesmo workflow, corrigido'],
    nl: 'linhas',
    aud: ['Auditar o workflow', 'Mostrar o resultado', 'Auditar de novo', 'Retestar o corrigido'],
    corr: 'Ver corrigido',
    est: ['pronto', 'auditando', 'retestando', 'pausado', 'auditoria concluída', 'versão corrigida · reteste limpo'],
    linha: 'linha', ach: ['achado', 'achados'],
    leg: ['chave', 'valor', 'expressão, resolvida antes do shell', 'comentário'],
    espera: 'aguardando a varredura…',
    sev: { crit: 'Crítica', high: 'Alta', low: 'Baixa', ok: 'Corrigido' },
    dest: ' — destacar no código',
    msg: 'Nova issue', sha: 'sha-de-40-hex-do-release',
    // [veredito, explicação, veredito corrigido, correção, (nota da 2ª regra)]
    a: {
      perm: ['Token com escrita em tudo, no workflow inteiro',
        '`write-all` dá ao `GITHUB_TOKEN` escrita em todos os escopos — código, releases, pacotes, issues — em todo job e action do arquivo. Inclui `id-token`: o job obtém token OIDC e, se a trust policy for frouxa, entra na sua nuvem.',
        'Token só-leitura; escrita só onde precisa',
        '`contents: read` é o mínimo para clonar. Job que precisar escrever declara o próprio escopo — e só ele.'],
      pin: ['Tag mutável: o que roda muda sem diff',
        '`@v4` é um ponteiro: quem controla o repositório da action — ou quem o invadir — move a tag, e o seu CI roda outro código sem commit seu (caso tj-actions/changed-files, CVE-2025-30066). Oficial (`actions/*`): baixa; de terceiro: alta.',
        'Fixada por SHA: o que roda não muda',
        'O SHA de 40 hex do release é imutável; a tag fica no comentário, para humanos. Pinar sem atualizar congela a versão vulnerável — o Dependabot mantém o SHA em dia.'],
      prt: ['Código de fork roda com os seus segredos',
        '`pull_request_target` roda com os segredos e o token de escrita do repositório-base, mesmo vindo de fork; o checkout do head traz o código do PR, e `npm ci`/`npm test` executam os scripts dele ao lado do `NPM_TOKEN` e do `GITHUB_TOKEN` que o checkout persiste.',
        'PR de fork roda sem segredo e sem escrita',
        'Com `pull_request`, o PR de fork roda sem segredos e com token só-leitura, e o `NPM_TOKEN` sai do job de teste. Precisa de `pull_request_target`? Então nunca faça checkout nem execute o código do PR.',
        'sozinho, o gatilho é informativo; crítico é somá-lo ao checkout do head'],
      inj: ['O título da issue vira comando de shell',
        'O GitHub resolve `${{ }}` no texto do script antes de o bash rodar: um título como `a"; ls $GITHUB_WORKSPACE"` fecha a aspa e executa. Num repositório público, qualquer conta do GitHub abre issue.',
        'O título entra como dado, não como código',
        'A expressão vai para `env:` e o shell lê `"$TITLE"` entre aspas: o valor nunca é reinterpretado como código — a correção que o próprio Esteira sugere (env indirection).'],
    },
    vered: 'Veredito', cnt0: 'Sem veredito', fixc: 'Reteste limpo',
    gate: ['Portão do CI: sem resultado ainda.', 'Portão do CI: exit 1 — reprova (padrão: alta ou acima).', 'Reteste com o SHA real no lugar do marcador: 0 achados, exit 0 — passa.'],
    ver: ['Rode a auditoria: o Esteira lê o workflow como o GitHub o executa — gatilho, permissões e o que roda.',
      'Qualquer conta do GitHub — com um PR de fork ou uma issue — executa código no seu CI, ao lado do `NPM_TOKEN` e de um token com escrita total.',
      'PR de fork roda sem segredo e com token só-leitura; o título da issue chega como dado; a action roda o commit fixado.'],
    voz: 'Um erro de configuração ali não derruba um site — entrega as chaves do reino.',
    fonte: ['Linhas, regras e severidades: a saída real do Esteira sobre este arquivo.', 'Linhas marcadas: onde a correção mudou o arquivo. O reteste é a saída real do Esteira.'],
    pro: ['Pro = escopo + serviço', '*Você roda:* a auditoria dos seus workflows do GitHub Actions.', 'A Pro acrescenta:',
      ['a varredura da *organização inteira* numa tacada', 'a *remediação verificada* — eu corrijo o workflow e o reteste prova que o buraco fechou', 'a auditoria de *trust policy OIDC*', 'o relatório executivo que o regulador arquiva']],
    ini: 'Auditoria iniciada.', reini: 'Reteste iniciado.',
    fim: (n, s) => `Auditoria concluída: ${n}. ${s}. O portão do CI reprova.`,
    fimfix: 'Versão corrigida: reteste sem achados, com o SHA real no lugar do marcador.',
    vul: 'Versão vulnerável.',
  },
  en: {
    loc: 'en',
    sobre: 'Supply chain · Esteira',
    tit: 'The workflow that hands over the key',
    lead: 'CI/CD (GitHub Actions) security auditor — script injection, actions not pinned by SHA, `pull_request_target`, permissions.',
    gh: 'View on GitHub', aba: ' (opens in a new tab)',
    kAria: 'Numbers measured on a public corpus, reproducible in two commands',
    k: ['rules on the corpus', 'recall on the corpus', 'false positives', 'CI lockup from ReDoS, measured and fixed'],
    ad: ['before', 'after'],
    rev: 'Workflow review',
    demo: ['demonstration · deliberately vulnerable workflow', 'demonstration · the same workflow, fixed'],
    nl: 'lines',
    aud: ['Audit the workflow', 'Show the result', 'Audit again', 'Retest the fix'],
    corr: 'Show fixed',
    est: ['ready', 'auditing', 'retesting', 'paused', 'audit complete', 'fixed version · clean retest'],
    linha: 'line', ach: ['finding', 'findings'],
    leg: ['key', 'value', 'expression, resolved before the shell', 'comment'],
    espera: 'awaiting the scan…',
    sev: { crit: 'Critical', high: 'High', low: 'Low', ok: 'Fixed' },
    dest: ' — highlight in the code',
    msg: 'New issue', sha: '40-hex-release-sha',
    a: {
      perm: ['A token that writes everything, workflow-wide',
        '`write-all` gives `GITHUB_TOKEN` write access to every scope — code, releases, packages, issues — in every job and action in the file. It includes `id-token`: the job obtains an OIDC token and, under a loose trust policy, gets into your cloud.',
        'Read-only token; write only where needed',
        '`contents: read` is the minimum to clone. A job that needs to write declares its own scope — and only that one.'],
      pin: ['Mutable tag: what runs changes with no diff',
        '`@v4` is a pointer: whoever controls the action’s repository — or breaks into it — moves the tag, and your CI runs different code without a commit of yours (the tj-actions/changed-files case, CVE-2025-30066). Official (`actions/*`): low; third-party: high.',
        'Pinned by SHA: what runs doesn’t change',
        'The release’s 40-hex SHA is immutable; the tag stays in the comment, for humans. Pinning without updating freezes the vulnerable version — Dependabot keeps the SHA current.'],
      prt: ['Fork code runs with your secrets',
        '`pull_request_target` runs with the base repository’s secrets and write token, even from a fork; checking out the head brings in the PR’s code, and `npm ci`/`npm test` run its scripts right next to `NPM_TOKEN` and the `GITHUB_TOKEN` that checkout persists.',
        'Fork PRs run with no secret and no write access',
        'With `pull_request`, a fork PR runs without secrets and with a read-only token, and `NPM_TOKEN` leaves the test job. Need `pull_request_target`? Then never check out or run the PR’s code.',
        'on its own, the trigger is informational; critical is adding the head checkout to it'],
      inj: ['The issue title becomes a shell command',
        'GitHub resolves `${{ }}` in the script text before bash runs: a title like `a"; ls $GITHUB_WORKSPACE"` closes the quote and executes. On a public repository, any GitHub account can open an issue.',
        'The title comes in as data, not code',
        'The expression moves to `env:` and the shell reads `"$TITLE"` in quotes: the value is never re-parsed as code — the fix Esteira itself suggests (env indirection).'],
    },
    vered: 'Verdict', cnt0: 'No verdict', fixc: 'Clean retest',
    gate: ['CI gate: no result yet.', 'CI gate: exit 1 — fails (default: high or above).', 'Retest with the real SHA in place of the placeholder: 0 findings, exit 0 — passes.'],
    ver: ['Run the audit: Esteira reads the workflow the way GitHub runs it — trigger, permissions and what runs.',
      'Any GitHub account — with a fork PR or an issue — runs code in your CI, right next to `NPM_TOKEN` and a token with full write access.',
      'Fork PRs run with no secret and a read-only token; the issue title arrives as data; the action runs the pinned commit.'],
    voz: 'A misconfiguration there doesn’t take down a site — it hands over the keys to the kingdom.',
    fonte: ['Lines, rules and severities: Esteira’s actual output on this exact file.', 'Marked lines: where the fix changed the file. The retest is Esteira’s actual output.'],
    pro: ['Pro = scope + service', '*You run:* the audit of your GitHub Actions workflows.', 'Pro adds:',
      ['scanning the *entire organization* in one pass', '*verified remediation* — I fix the workflow and the retest proves the hole closed', 'an *OIDC trust-policy* audit', 'the executive report your regulator files away']],
    ini: 'Audit started.', reini: 'Retest started.',
    fim: (n, s) => `Audit complete: ${n}. ${s}. The CI gate fails.`,
    fimfix: 'Fixed version: clean retest, with the real SHA in place of the placeholder.',
    vul: 'Vulnerable version.',
  },
};

/* o arquivo de demonstração ({m} e {s} trocam com o idioma) */
const YML = {
  vul: ['name: ci', 'on:', '  pull_request_target:', '  issues:', '    types: [opened]', 'permissions: write-all', '', 'jobs:', '  test:',
    "    if: github.event_name == 'pull_request_target'", '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4',
    '        with:', '          ref: ${{ github.event.pull_request.head.sha }}', '      - run: npm ci && npm test', '        env:',
    '          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}', '', '  triage:', "    if: github.event_name == 'issues'", '    runs-on: ubuntu-latest',
    '    steps:', '      - run: |', '          echo "{m}: ${{ github.event.issue.title }}"'],
  fix: ['name: ci', 'on:', '  pull_request:', '  issues:', '    types: [opened]', 'permissions:', '  contents: read', '', 'jobs:', '  test:',
    "    if: github.event_name == 'pull_request'", '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@<{s}>  # v4',
    '      - run: npm ci && npm test', '', '  triage:', "    if: github.event_name == 'issues'", '    runs-on: ubuntu-latest', '    steps:',
    '      - run: |', '          echo "{m}: $TITLE"', '        env:', '          TITLE: ${{ github.event.issue.title }}'],
};
/* r = regras que o Esteira de fato reporta [id, severidade, linha]; v/f = âncora e trecho sublinhado; f.ls = linhas da correção */
const ACH = [
  { k: 'perm', ow: 'A01:2025 · CWE-732', r: [['broad-permissions', 'high', 6]],
    v: { ln: 6, mk: { 6: 'write-all' } }, f: { ln: 6, ls: [6, 7], mk: { 7: 'contents: read' } } },
  { k: 'pin', ow: 'A03:2025 · CWE-1357', r: [['unpinned-action-firstparty', 'low', 13]],
    v: { ln: 13, mk: { 13: '@v4' } }, f: { ln: 14, ls: [14], mk: { 14: '<{s}>' } } },
  { k: 'prt', ow: 'A08:2025 · CWE-94', r: [['pull-request-target-checkout', 'crit', 15], ['dangerous-trigger', 'low', 3]],
    v: { ln: 15, mk: { 3: 'pull_request_target', 15: '${{ github.event.pull_request.head.sha }}' } },
    f: { ln: 15, ls: [3, 11, 15], mk: { 3: 'pull_request', 11: "'pull_request'", 15: 'npm ci && npm test' } } },
  { k: 'inj', ow: 'A05:2025 · CWE-94', r: [['script-injection', 'crit', 25]],
    v: { ln: 25, mk: { 25: '${{ github.event.issue.title }}' } }, f: { ln: 22, ls: [22, 23, 24], mk: { 22: '$TITLE', 24: '${{ github.event.issue.title }}' } } },
];
const GLIFO = { crit: '◆', high: '▲', low: '▼', ok: '✓' }, SEVS = ['crit', 'high', 'low'];
const PASSO = 150, REV = 120, ENTRA = 300, TRACO = 420, CAUDA = 650, GAP = 12, NS = 'http://www.w3.org/2000/svg';
const put = (e, s) => { if (e.textContent !== s) e.textContent = s; };
const cl01 = (x) => Math.max(0, Math.min(1, x)), f1 = (v) => v.toFixed(1);
function el(tag, cls, pai, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  if (pai) pai.appendChild(e);
  return e;
}
const at = (e, o) => { for (const k in o) e.setAttribute(k, o[k]); return e; };
const mudo = (e) => at(e, { 'aria-hidden': 'true' });
const svgEl = (tag, pai, o) => at(pai.appendChild(document.createElementNS(NS, tag)), o || {});
function sev(e, s) {
  for (const c of [...e.classList]) if (c.startsWith('xe-s-')) e.classList.remove(c);
  e.classList.add('xe-s-' + s);
}
/* *negrito* e `código`, sem innerHTML */
function rico(e, s) {
  e.textContent = '';
  s.split(/(\*[^*]+\*|`[^`]+`)/).forEach((p, i) => p && e.appendChild(i % 2 ? el(p[0] === '*' ? 'strong' : 'code', '', null, p.slice(1, -1)) : document.createTextNode(p)));
}
/* realce simples: chave · valor · expressão ${{ }} · comentário */
function tokens(s) {
  const o = [], m = s.match(/^(- )?([\w-]+)(:)(?=\s|$)/);
  let r = s;
  if (m) { if (m[1]) o.push(['p', m[1]]); o.push(['k', m[2]], ['p', m[3]]); r = s.slice(m[0].length); }
  else if (r.startsWith('- ')) { o.push(['p', '- ']); r = r.slice(2); }
  const c = r.search(/\s#\s/), com = c < 0 ? '' : r.slice(c);
  if (c >= 0) r = r.slice(0, c);
  r.split(/(\$\{\{[^}]*\}\})/).forEach((p, i) => p && o.push([i % 2 ? 'e' : 'v', p]));
  if (com) o.push(['c', com]);
  return o;
}
/* notas sem sobreposição: aglomera vizinhas e centraliza cada grupo na média das âncoras */
function arranjar(it) {
  const cl = it.map((o) => ({ m: [o], top: Math.max(0, o.y), h: o.h }));
  for (let i = 1; i < cl.length;) {
    const a = cl[i - 1], b = cl[i];
    if (a.top + a.h + GAP <= b.top) { i++; continue; }
    const m = a.m.concat(b.m);
    let off = 0, soma = 0;
    for (const o of m) { soma += o.y - off; off += o.h + GAP; }
    cl.splice(i - 1, 2, { m, top: Math.max(0, soma / m.length), h: off - GAP });
    i = Math.max(1, i - 1);
  }
  for (const c of cl) { let off = 0; for (const o of c.m) { o.top = c.top + off; off += o.h + GAP; } }
}

export function montar(raiz, ctx) {
  const E = (ctx.dados && ctx.dados.suite && ctx.dados.suite.esteira) || {}, REPO = E.repo || 'Paulo-Marcos-Lucio/esteira';
  let T = TXT[ctx.idioma === 'en' ? 'en' : 'pt'], pausado = !!ctx.pausado, reduzido = !!ctx.reduzido, visivel = true;
  let versao = 'vul', fase = 'ocioso', t = 0, ult = 0, raf = 0, agenda = 0, fixo = null, foco = null, sobre = null;
  let L = [], H = [], ys = [], fh = 26, TOTAL = 1;
  const U = 'xe' + Math.random().toString(36).slice(2, 7), REG = [];
  /* textos registrados para idioma(): modo 0 texto · 1 rico · 2 aria-label · 3 data-e (esqueleto, via CSS attr) */
  const aplica = (e, f, m) => { const s = f(T); if (m > 1) e.setAttribute(m > 2 ? 'data-e' : 'aria-label', s); else if (m) rico(e, s); else put(e, s); };
  const tx = (e, f, m = 0) => { REG.push([e, f, m]); aplica(e, f, m); return e; };
  const h = (tag, cls, pai, f, m) => tx(el(tag, cls, pai), f, m);
  const nf = (n) => new Intl.NumberFormat(T.loc).format(n);
  const pl = (n) => `${nf(n)} ${T.ach[+(new Intl.PluralRules(T.loc).select(n) !== 'one')]}`;
  const vul = () => versao === 'vul', ancora = (a) => (vul() ? a.v : a.f).ln;
  const linhasDe = (a) => (vul() ? a.r.map((r) => r[2]) : a.f.ls);
  const conta = (s) => H.filter((x) => x.s === s).length;
  const sub = (s) => s.replace('{m}', T.msg).replace('{s}', T.sha);
  const LADO = matchMedia('(min-width: 980px)');

  raiz.textContent = '';
  const cx = el('div', 'xe-raiz', raiz);
  cx.classList.toggle('xe-red', reduzido);

  /* ---- topo (copy do site) ---- */
  const topo = el('div', 'xe-topo', cx), tl = el('div', 'xe-tl', topo), tr = el('div', 'xe-tr', topo);
  h('p', 'xe-sobre', tl, (T) => T.sobre);
  h('h3', 'xe-titulo', tl, (T) => T.tit);
  h('p', 'xe-lead', tl, (T) => T.lead, 1);
  el('p', 'xe-meta', tr, [REPO, E.linguagem, E.licenca].filter(Boolean).join(' · '));
  const gh = at(el('a', 'btn xe-gh', tr), { href: 'https://github.com/' + REPO, target: '_blank', rel: 'noopener' });
  h('span', '', gh, (T) => T.gh);
  mudo(el('span', '', gh, '↗'));
  h('span', 'sr-only', gh, (T) => T.aba);

  /* ---- números medidos (ctx.dados.suite.esteira) ---- */
  const ks = h('ul', 'xe-kpis', cx, (T) => T.kAria, 2);
  const kpi = (i, f, cls) => {
    const li = el('li', 'xe-kpi' + (cls || ''), ks), n = el('span', 'xe-kn', li);
    if (f) tx(n, f);
    h('span', 'xe-kl', li, (T) => T.k[i]);
    return [li, n];
  };
  kpi(0, () => E.regras || '—');
  kpi(1, () => E.recall || '—');
  kpi(2, () => (E.falsos_positivos == null ? '—' : nf(E.falsos_positivos)));
  /* "7,1 s → <0,01 s": o número é o do dado; só a forma muda com o idioma */
  const rm = /^\s*([\d.,]+)\s*s\s*→\s*(<?)\s*([\d.,]+)\s*s\s*$/.exec(E.redos || '');
  const dec = (x) => (x.split(/[.,]/)[1] || '').length, val = (x) => +x.replace(',', '.');
  const fs = (x) => new Intl.NumberFormat(T.loc, { minimumFractionDigits: dec(x), maximumFractionDigits: dec(x) }).format(val(x)) + ' s';
  const [rd, rn] = kpi(3, rm ? null : () => E.redos || '—', ' xe-redos');
  if (rm) {
    // o número grande é eco visual; para o leitor de tela, valem as barras com "antes/depois"
    h('span', '', mudo(rn), () => fs(rm[1]));
    el('span', 'xe-seta', rn, '→');
    h('span', '', rn, () => rm[2] + fs(rm[3]));
    const bs = el('div', 'xe-barras', rd);
    [[rm[1], 1], [rm[3], val(rm[3]) / val(rm[1])]].forEach(([x, w], i) => {
      h('span', '', bs, (T) => T.ad[i]);
      el('i', '', el('span', 'xe-bar' + (i ? ' xe-ok' : ''), bs)).style.setProperty('--w', (w * 100).toFixed(2) + '%');
      h('span', 'xe-bv', bs, () => (i ? rm[2] : '') + fs(x));
    });
  }

  /* ---- revisão: controles ---- */
  const pv = at(el('div', 'painel xe-rev', cx), { role: 'group', 'aria-labelledby': U + 't' }), ph = el('div', 'painel-h', pv);
  h('h4', 'painel-t', ph, (T) => T.rev).id = U + 't';
  el('span', 'painel-id', ph, '.github/workflows/ci.yml');
  const ctl = el('div', 'xe-ctl', pv), bA = at(el('button', 'btn btn-holo xe-auditar', ctl), { type: 'button' });
  const bG = mudo(el('span', 'xe-bg', bA)), bT = el('span', '', bA);
  const bC = at(el('button', 'btn xe-tg', ctl), { type: 'button', 'aria-pressed': 'false' });
  mudo(el('span', 'xe-sw', bC));
  h('span', '', bC, (T) => T.corr);
  const est = el('p', 'xe-est', ctl), prog = el('i', '', mudo(el('div', 'xe-prog', pv)));

  /* ---- palco: código × trilho de notas, ligados por fios de luz ---- */
  const palco = el('div', 'xe-palco', pv), cod = el('div', 'xe-cod', palco), cab = el('div', 'xe-cab', cod);
  el('span', 'xe-arq', cab, 'ci.yml');
  h('span', 'rotulo-demo', cab, (T) => T.demo[+!vul()]);
  const nl = el('span', 'xe-yml', cab), ol = at(el('ol', 'xe-linhas', cod), { 'aria-label': '.github/workflows/ci.yml' });
  const feixe = mudo(el('div', 'xe-feixe', cod)), lg = el('ul', 'xe-leg', cod);
  [['k', 'on:'], ['v', 'ubuntu-latest'], ['e', '${{ }}'], ['c', '# v4']].forEach(([c, s], i) => {
    const li = el('li', '', lg);
    el('code', 'xe-' + c, li, s);
    h('span', '', li, (T) => T.leg[i]);
  });
  const trilho = el('div', 'xe-trilho', palco), svg = svgEl('svg', palco, { class: 'xe-fios', 'aria-hidden': 'true' });

  /* ---- uma nota de revisão por achado, com as regras reais do Esteira ---- */
  const C = ACH.map((a, i) => {
    const c = { a, op: -1, p: -1, len: 0, el: h('article', 'xe-nota', trilho, (T) => T.espera, 3) };
    const b = (c.btn = at(el('button', 'xe-nb', c.el), { type: 'button', 'aria-pressed': 'false', 'aria-describedby': U + 'd' + i }));
    b.disabled = true;
    c.chip = el('span', 'chip', b);
    el('span', 'xe-rg', b, a.r[0][0]);
    c.ln = el('span', 'xe-ln', b);
    el('span', 'xe-ow', b, a.ow);
    h('span', 'xe-nt', b, (T) => T.a[a.k][vul() ? 0 : 2]);
    h('span', 'sr-only', b, (T) => T.dest);
    h('p', 'xe-nd', c.el, (T) => T.a[a.k][vul() ? 1 : 3], 1).id = U + 'd' + i;
    if (a.r[1]) {
      const s = el('p', 'xe-sub', c.el), [id, sv, ln] = a.r[1];
      h('span', 'chip sev-' + sv, s, (T) => T.sev[sv]);
      el('span', 'xe-rg', s, id);
      el('span', 'xe-ln', s, 'L' + ln);
      h('span', 'xe-sx', s, (T) => T.a[a.k][4]);
    }
    c.g = svgEl('g', svg, { class: 'xe-fio' });
    c.path = svgEl('path', c.g);
    c.d0 = svgEl('circle', c.g, { r: 3 });
    c.d1 = svgEl('circle', c.g, { r: 2.5 });
    return c;
  });

  /* ---- veredito ---- */
  const sm = el('div', 'xe-sum', pv), sl = el('div', 'xe-sl', sm);
  const cnt = el('span', 'xe-cnt', sl), chips = el('span', 'xe-chips', sl), gate = el('span', 'xe-gate', sl);
  const ver = el('p', 'xe-ver', sm), verK = el('b', '', ver), verT = el('span', '', ver);
  h('p', 'voz xe-voz', sm, (T) => T.voz);
  h('p', 'xe-fonte', sm, (T) => T.fonte[+!vul()]);

  /* ---- faixa Pro (copy do site) ---- */
  const pro = el('div', 'xe-pro', cx), p1 = el('div', '', pro), p2 = el('div', '', pro);
  el('p', 'xe-pk', p1, 'Esteira · Pro');
  h('p', 'xe-pt', p1, (T) => T.pro[0]);
  h('p', 'xe-pv', p1, (T) => T.pro[1], 1);
  h('p', 'xe-pt', p2, (T) => T.pro[2]);
  const pll = el('ul', 'xe-pl', p2);
  T.pro[3].forEach((_, i) => h('li', '', pll, (T) => T.pro[3][i], 1));
  const vivo = at(el('p', 'sr-only', cx), { 'aria-live': 'polite' });

  /* ---- código da versão atual (com o trecho do achado sublinhado) ---- */
  function codigo(surge) {
    const mk = {};
    for (const a of ACH) Object.assign(mk, (vul() ? a.v : a.f).mk);
    ol.textContent = '';
    L = YML[versao].map((raw, i) => {
      const s = sub(raw), z = s.trimStart(), li = el('li', 'xe-l', ol), n = el('span', 'xe-n', li), g = mudo(el('span', 'xe-g', n));
      n.append(i + 1);
      const code = el('code', 'xe-cd', li), m = mk[i + 1] ? sub(mk[i + 1]) : '', a = m ? z.indexOf(m) : -1, b = a + m.length;
      code.style.setProperty('--i', s.length - z.length);
      let pos = 0;
      for (const [c, x] of tokens(z)) {
        const ini = pos, fim = (pos += x.length), k = [ini, Math.max(ini, Math.min(fim, a)), Math.max(ini, Math.min(fim, b)), fim];
        // em ${{ }} o ponto vira oportunidade de quebra (celular): quebra no ".", não no meio da palavra
        for (let j = 0; j < 3; j++) if (k[j + 1] > k[j]) el('span', 'xe-' + c + (j === 1 && a >= 0 ? ' xe-alvo' : ''), code, x.slice(k[j] - ini, k[j + 1] - ini));
      }
      return { li, g, code, on: null };
    });
    H = vul() ? ACH.flatMap((a) => a.r.map(([, s, ln]) => ({ ln, s }))) : ACH.flatMap((a) => a.f.ls.map((ln) => ({ ln, s: 'ok' })));
    for (const x of H) sev(L[x.ln - 1].li, x.s);
    TOTAL = L.length * PASSO + CAUDA;
    put(nl, `YAML · ${nf(L.length)} ${T.nl}`);
    ol.classList.toggle('xe-surge', !!surge && !reduzido);
  }
  /* ---- textos + face das notas: risco (vulnerável) × correção ---- */
  function textos() {
    for (const [e, f, m] of REG) aplica(e, f, m);
    for (const c of C) {
      const s = vul() ? c.a.r[0][1] : 'ok';
      c.chip.className = 'chip sev-' + s;
      put(c.chip, T.sev[s]);
      sev(c.el, s);
      sev(c.g, s);
      put(c.ln, 'L' + [...linhasDe(c.a)].sort((x, y) => x - y).join(' · L'));
    }
  }

  /* ---- medida + layout: ao montar, em resize, fonte e troca de versão/idioma (nunca em pointermove/scroll) ---- */
  function layout() {
    agenda = 0;
    const lado = LADO.matches;
    for (const c of C) {
      const alvo = lado ? trilho : L[ancora(c.a) - 1].li, f = c.el.contains(document.activeElement);
      if (c.el.parentNode !== alvo) { alvo.appendChild(c.el); if (f) c.btn.focus(); }
    }
    const cr = cod.getBoundingClientRect();
    ys = L.map((o) => { const r = o.code.getBoundingClientRect(); return [r.top - cr.top, r.height || 26]; });
    fh = feixe.offsetHeight || 26;
    if (!lado || !cr.width) { trilho.style.height = ''; return pintar(); }
    const pr = palco.getBoundingClientRect(), rr = trilho.getBoundingClientRect(), xa = cr.right - pr.left, xb = rr.left - pr.left, y0 = rr.top - pr.top;
    const it = C.map((c) => {
      const r = L[ancora(c.a) - 1].code.getBoundingClientRect(), ym = r.top - pr.top + Math.min(r.height, 26) / 2;
      return { c, ym, y: ym - y0 - 22, h: c.el.offsetHeight };
    });
    arranjar(it);
    let fundo = 0;
    it.forEach(({ c, ym, top, h: alt }, i) => {
      const y1 = y0 + top + 22, xm = xa + 12 + i * 6, s = Math.sign(y1 - ym), r = Math.min(6, Math.abs(y1 - ym) / 2);
      c.el.style.top = f1(top) + 'px';
      fundo = Math.max(fundo, top + alt);
      c.path.setAttribute('d', `M${f1(xa)} ${f1(ym)}` + (r < 0.5 ? '' : `H${f1(xm - r)}Q${f1(xm)} ${f1(ym)} ${f1(xm)} ${f1(ym + s * r)}V${f1(y1 - s * r)}Q${f1(xm)} ${f1(y1)} ${f1(xm + r)} ${f1(y1)}`) + `H${f1(xb)}`);
      at(c.d0, { cx: f1(xa), cy: f1(ym) });
      at(c.d1, { cx: f1(xb), cy: f1(y1) });
      c.len = c.path.getTotalLength();
      c.path.style.strokeDasharray = f1(c.len);
      c.p = -1;
    });
    trilho.style.height = Math.ceil(fundo) + 'px';
    pintar();
  }
  const agendar = () => { if (!agenda) agenda = requestAnimationFrame(layout); };

  /* ---- pinta o instante t (ms) da varredura ---- */
  function pintar() {
    const n = L.length, roda = fase === 'rodando', ok = fase !== 'ocioso', f = roda ? t / PASSO : ok ? n + 1 : -1;
    let k = 0;
    for (const x of H) {
      const on = f >= x.ln - 0.5, o = L[x.ln - 1];
      k += on;
      if (o.on !== on) { o.on = on; o.li.classList.toggle('xe-on', on); put(o.g, on ? GLIFO[x.s] : ''); }
    }
    for (const c of C) {
      const t0 = (ancora(c.a) - 0.5) * PASSO, op = !ok ? 0 : roda ? cl01((t - t0 - REV) / ENTRA) : 1, p = !ok ? 0 : roda ? cl01((t - t0) / TRACO) : 1;
      if (c.op !== op) {
        c.op = op;
        c.el.style.setProperty('--op', op.toFixed(3));
        c.el.style.setProperty('--y', f1((1 - op) * 6) + 'px');
        c.el.classList.toggle('xe-vis', op > 0);
        c.btn.disabled = op <= 0;
      }
      if (c.p !== p) {
        c.p = p;
        c.path.style.strokeDashoffset = f1(c.len * (1 - p));
        c.g.classList.toggle('xe-vis', p > 0);
        c.d1.classList.toggle('xe-vis', p >= 1);
      }
    }
    const i = Math.max(0, Math.min(n - 1, Math.floor(f))), [yt, yh] = ys[i] || [0, 26];
    feixe.style.opacity = +(roda && f < n);
    feixe.style.transform = `translateY(${f1(yt + (f - i) * yh - fh / 2)}px)`;
    prog.style.transform = `scaleX(${roda ? Math.min(1, t / TOTAL).toFixed(4) : +ok})`;
    estado(k);
  }
  function estado(k) {
    const roda = fase === 'rodando', S = T.est, b = roda ? 1 : vul() ? (fase === 'concluido' ? 2 : 0) : 3;
    put(est, fase === 'ocioso' ? `${S[0]} · ${nf(L.length)} ${T.nl}`
      : !roda ? (vul() ? `${S[4]} · ${pl(H.length)}` : S[5])
      : `${S[pausado ? 3 : vul() ? 1 : 2]} · ${T.linha} ${String(Math.min(L.length, Math.floor(t / PASSO) + 1)).padStart(2, '0')}/${L.length}` + (vul() ? ' · ' + pl(k) : ''));
    cx.classList.toggle('xe-roda', roda && !pausado);
    put(bG, '▸»↻▸'[b]);
    put(bT, T.aud[b]);
  }
  function resumo() {
    const fim = fase === 'concluido', v = vul(), q = !fim ? 0 : v ? 1 : 2;
    chips.textContent = '';
    gate.className = 'xe-gate';
    put(cnt, [T.cnt0, pl(H.length), T.fixc][q]);
    put(gate, T.gate[q]);
    if (fim) {
      sev(gate, v ? 'crit' : 'ok');
      for (const s of v ? SEVS : ['ok']) el('span', 'chip sev-' + s, chips, T.sev[s] + (v ? ' · ' + nf(conta(s)) : ''));
    }
    put(verK, T.vered);
    rico(verT, T.ver[q]);
  }

  /* ---- motor: t só avança com rAF, visível, sem pausa e sem movimento reduzido ---- */
  const pode = () => fase === 'rodando' && !pausado && visivel && !reduzido;
  function laco(agora) {
    if (ult) t += Math.min(agora - ult, 64);
    ult = agora;
    if (t >= TOTAL) return concluir(true);
    pintar();
    raf = pode() ? requestAnimationFrame(laco) : 0;
  }
  const retomar = () => { if (!raf && pode()) { ult = 0; raf = requestAnimationFrame(laco); } };
  const parar = () => { cancelAnimationFrame(raf); raf = 0; };
  function concluir(fala) {
    parar();
    fase = 'concluido';
    t = TOTAL;
    cx.classList.add('xe-ativo');
    pintar();
    resumo();
    agendar();
    if (fala) vivo.textContent = vul() ? T.fim(pl(H.length), SEVS.map((s) => `${T.sev[s]}: ${nf(conta(s))}`).join('; ')) : T.fimfix;
  }
  const zerar = () => { for (const o of L) o.on = null; for (const c of C) c.op = c.p = -1; };
  function iniciar() {
    if (fase === 'rodando') return concluir(true);
    fixo = foco = sobre = null;
    mira();
    cx.classList.add('xe-ativo');
    if (reduzido) return concluir(true);
    parar();
    t = 0;
    fase = 'rodando';
    zerar();
    resumo();
    pintar();
    agendar();
    vivo.textContent = vul() ? T.ini : T.reini;
    retomar();
  }
  /* troca de versão ou de idioma: reconstrói o código; preserva fase, instante e destaque fixado */
  function refaz(surge) {
    codigo(surge);
    zerar();
    textos();
    mira();
    resumo();
    layout();
  }
  function trocar() {
    parar();
    versao = vul() ? 'fix' : 'vul';
    fase = 'concluido';
    t = TOTAL;
    fixo = foco = sobre = null;
    cx.classList.add('xe-ativo');
    cx.classList.toggle('xe-fix', !vul());
    bC.setAttribute('aria-pressed', !vul());
    refaz(true);
    vivo.textContent = vul() ? T.vul : T.fimfix;
  }

  /* ---- foco (teclado), ponteiro ou toque numa nota acendem as linhas dela e apagam o resto ---- */
  function mira() {
    const c = sobre || foco || fixo, ls = c ? linhasDe(c.a) : [];
    palco.classList.toggle('xe-mira', !!c);
    L.forEach((o, i) => o.li.classList.toggle('xe-sel', ls.includes(i + 1)));
    for (const x of C) {
      x.el.classList.toggle('xe-sel', x === c);
      x.g.classList.toggle('xe-sel', x === c);
      x.btn.setAttribute('aria-pressed', x === fixo);
    }
  }
  const notaDe = (e) => { const n = e && e.closest && e.closest('.xe-nota'); return C.find((c) => c.el === n) || null; };
  bA.addEventListener('click', iniciar);
  bC.addEventListener('click', trocar);
  palco.addEventListener('click', (e) => {
    const b = e.target.closest('.xe-nb'), c = b && notaDe(b);
    if (c && !b.disabled) { fixo = fixo === c ? null : c; mira(); }
  });
  palco.addEventListener('focusin', (e) => {
    const b = e.target.closest('.xe-nb');
    if (b && b.matches(':focus-visible')) { foco = notaDe(b); mira(); }
  });
  palco.addEventListener('focusout', () => { if (foco) { foco = null; mira(); } });
  palco.addEventListener('pointerover', (e) => {
    let c = e.pointerType === 'mouse' ? notaDe(e.target) : null;
    if (c && c.op <= 0) c = null;
    if (c !== sobre) { sobre = c; mira(); }
  });
  palco.addEventListener('pointerleave', () => { if (sobre) { sobre = null; mira(); } });
  palco.addEventListener('keydown', (e) => {
    const b = e.target.closest('.xe-nb');
    if (!b) return;
    if (e.key === 'Escape') { fixo = null; return mira(); }
    const ok = C.map((c) => c.btn).filter((x) => !x.disabled), j = ok.indexOf(b);
    const n = ok[{ ArrowDown: j + 1, ArrowRight: j + 1, ArrowUp: j - 1, ArrowLeft: j - 1, Home: 0, End: ok.length - 1 }[e.key]];
    if (n) { e.preventDefault(); n.focus(); }
  });

  codigo();
  textos();
  resumo();
  if (reduzido) concluir(false);
  layout();
  LADO.addEventListener('change', agendar);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(agendar) : null;
  if (ro) ro.observe(cod);
  if (document.fonts) document.fonts.ready.then(agendar);
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { visivel = es[es.length - 1].isIntersecting; if (visivel) retomar(); else parar(); }) : null;
  if (io) io.observe(cx);

  return {
    pausar(b) {
      pausado = !!b;
      cx.classList.toggle('xe-pausa', pausado);
      if (pausado) parar(); else retomar();
      estado(H.filter((x) => L[x.ln - 1].on).length);
    },
    idioma(l) { T = TXT[l === 'en' ? 'en' : 'pt']; refaz(false); },
    reduzir(b) {
      reduzido = !!b;
      cx.classList.toggle('xe-red', reduzido);
      if (reduzido) concluir(false); else retomar();
    },
    destruir() {
      parar();
      cancelAnimationFrame(agenda);
      LADO.removeEventListener('change', agendar);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      raiz.textContent = '';
    },
  };
}
