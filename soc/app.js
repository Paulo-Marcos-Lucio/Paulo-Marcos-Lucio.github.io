/* Orquestrador do protótipo do SOC. Carrega cada módulo de forma resiliente (um módulo
   quebrado não derruba os outros), cuida das abas da exposição, da pausa global (WCAG 2.2.2),
   do idioma e do prefers-reduced-motion. Contrato dos módulos: ver CONTRATO.md. */
import { DADOS } from './dados-reais.js';

const html = document.documentElement;
const MQ = window.matchMedia('(prefers-reduced-motion: reduce)');
/* FRESCOR — um cálculo só, compartilhado por referência com todos os módulos (ctx.frescor).
   'Ao vivo'/'online' só enquanto a última leitura do observatório tiver até LIMITE_H horas (o backstop
   da cadência); fora disso tudo fica neutro e mostra a idade. Módulo nenhum decide sozinho o que é 'agora'. */
const LIMITE_H = 6;
function medirFrescor() {
  const idadeMin = Math.max(0, Math.round((Date.now() - Date.parse(DADOS.observatorio.ultima)) / 60000));
  return { fresco: idadeMin <= LIMITE_H * 60, idadeMin, limiteH: LIMITE_H, ultima: DADOS.observatorio.ultima };
}
const ctx = { dados: DADOS, idioma: 'pt', reduzido: MQ.matches, pausado: false, frescor: medirFrescor() };
const instancias = [];

const TXT = {
  pt: {
    'soc.eyebrow': 'Centro de operações · dado real',
    'soc.titulo': 'A superfície, ao vivo', 'soc.titulo.velho': 'A superfície, na última leitura',
    'soc.lead': 'Este painel não encena ataque nenhum. Tudo aqui é medido de verdade: o observatório que lê {n} alvos, agendado de hora em hora, o laudo do meu próprio site e as requisições que a sua visita acabou de fazer. Confira no DevTools.',
    'expo.eyebrow': 'Ferramentas · open source · com teste',
    'expo.titulo': 'A suíte, em operação',
    'expo.lead': 'Seis ferramentas: cinco frentes do OWASP Top 10 e a vigilância contínua. Cada módulo mostra o método trabalhando: os números são os do corpus público de cada ferramenta e os do laudo real deste site; os exemplos são demonstrações, e estão rotulados como tal.',
    'nav.soc': 'A superfície', 'nav.expo': 'A suíte', 'nav.contato': 'Contato',
    pausar: 'Pausar animação', retomar: 'Retomar animação', indisponivel: 'módulo indisponível no momento',
  },
  en: {
    'soc.eyebrow': 'Operations center · real data',
    'soc.titulo': 'The surface, live', 'soc.titulo.velho': 'The surface, as last read',
    'soc.lead': 'This panel stages no attack at all. Everything here is actually measured: the observatory reading {n} targets on an hourly schedule, the report on my own site, and the requests your visit just made. Check it in DevTools.',
    'expo.eyebrow': 'Tools · open source · tested',
    'expo.titulo': 'The suite, in operation',
    'expo.lead': 'Six tools: five fronts of the OWASP Top 10 plus continuous surveillance. Each module shows the method at work: the numbers come from each tool’s public corpus and from this site’s real report; the examples are demonstrations, and are labeled as such.',
    'nav.soc': 'The surface', 'nav.expo': 'The suite', 'nav.contato': 'Contact',
    pausar: 'Pause animation', retomar: 'Resume animation', indisponivel: 'module unavailable right now',
  },
};

const EXPOS = [
  { id: 'sentinela',    nome: 'Sentinela',          frente: { pt: 'Perímetro', en: 'Perimeter' } },
  { id: 'guardiao',     nome: 'Guardião',           frente: { pt: 'Segredos', en: 'Secrets' } },
  { id: 'chaveiro',     nome: 'Chaveiro',           frente: { pt: 'Autenticação', en: 'Authentication' } },
  { id: 'esteira',      nome: 'Esteira',            frente: { pt: 'Cadeia de suprimentos', en: 'Supply chain' } },
  { id: 'laboratorio',  nome: 'Laboratório OWASP',  frente: { pt: 'Correção', en: 'Remediation' } },
  { id: 'observatorio', nome: 'Observatório',       frente: { pt: 'Vigilância', en: 'Surveillance' } },
];

async function carregar(nome) {
  try {
    return await import(`./${nome}.js`);
  } catch (erro) {
    console.error(`[soc] módulo ${nome} não carregou:`, erro);
    return null;
  }
}

function montar(mod, raiz, nome) {
  if (!mod || typeof mod.montar !== 'function') return falhou(raiz, nome);
  try {
    const inst = mod.montar(raiz, { ...ctx }) || {};
    instancias.push(inst);
    return inst;
  } catch (erro) {
    console.error(`[soc] módulo ${nome} falhou ao montar:`, erro);
    return falhou(raiz, nome);
  }
}

function falhou(raiz, nome) {
  if (!raiz || typeof raiz.appendChild !== 'function') return null;
  const aviso = document.createElement('p');
  aviso.className = 'modulo-falhou';
  aviso.textContent = `[${nome}] ${TXT[ctx.idioma].indisponivel}`;
  raiz.appendChild(aviso);
  return null;
}

function emTodos(metodo, valor) {
  for (const inst of instancias) {
    try { if (inst && typeof inst[metodo] === 'function') inst[metodo](valor); }
    catch (erro) { console.error(`[soc] ${metodo} falhou:`, erro); }
  }
}

/* ---------- SOC (monta já) ---------- */
const vivo = await carregar('soc-vivo');
montar(vivo, {
  ticker: document.getElementById('soc-ticker'),
  status: document.getElementById('soc-status'),
  kpis: document.getElementById('soc-kpis'),
  feed: document.getElementById('soc-feed'),
  conexao: document.getElementById('soc-conexao'),
}, 'soc-vivo');
montar(await carregar('mapa'), document.getElementById('soc-mapa'), 'mapa');

/* ---------- exposição: abas ARIA, cada módulo monta na 1ª ativação ---------- */
const lista = document.getElementById('expo-tabs');
const palco = document.getElementById('expo-palco');
const abas = [];

EXPOS.forEach((e, i) => {
  const aba = document.createElement('button');
  aba.type = 'button';
  aba.className = 'expo-tab';
  aba.id = `aba-${e.id}`;
  aba.setAttribute('role', 'tab');
  aba.setAttribute('aria-controls', `painel-${e.id}`);
  aba.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  aba.tabIndex = i === 0 ? 0 : -1;
  const nome = document.createElement('span');
  nome.textContent = e.nome;
  const frente = document.createElement('span');
  frente.className = 'frente';
  frente.textContent = e.frente[ctx.idioma];
  aba.append(nome, frente);

  const painel = document.createElement('div');
  painel.className = 'expo-painel';
  painel.id = `painel-${e.id}`;
  painel.setAttribute('role', 'tabpanel');
  painel.setAttribute('aria-labelledby', aba.id);
  painel.tabIndex = 0;
  painel.hidden = i !== 0;

  lista.appendChild(aba);
  palco.appendChild(painel);
  abas.push({ e, aba, painel, frente, inst: null, montado: false });
});

async function ativar(indice, focar) {
  for (const [i, a] of abas.entries()) {
    const ativa = i === indice;
    a.aba.setAttribute('aria-selected', ativa ? 'true' : 'false');
    a.aba.tabIndex = ativa ? 0 : -1;
    a.painel.hidden = !ativa;
    if (a.inst && typeof a.inst.pausar === 'function') a.inst.pausar(!ativa || ctx.pausado);
  }
  const alvo = abas[indice];
  if (focar) alvo.aba.focus();
  if (!alvo.montado) {
    alvo.montado = true;
    alvo.inst = montar(await carregar(`expo-${alvo.e.id}`), alvo.painel, `expo-${alvo.e.id}`);
  }
}

lista.addEventListener('click', (ev) => {
  const aba = ev.target.closest('[role="tab"]');
  if (aba) ativar(abas.findIndex((a) => a.aba === aba), false);
});
lista.addEventListener('keydown', (ev) => {
  const atual = abas.findIndex((a) => a.aba === document.activeElement);
  if (atual < 0) return;
  const n = abas.length;
  const proximo = { ArrowRight: (atual + 1) % n, ArrowLeft: (atual - 1 + n) % n, Home: 0, End: n - 1 }[ev.key];
  if (proximo === undefined) return;
  ev.preventDefault();
  ativar(proximo, true);
});
ativar(0, false);

/* ---------- pausa global (WCAG 2.2.2) ---------- */
const botaoPausa = document.querySelector('[data-pausa]');
botaoPausa.addEventListener('click', () => {
  ctx.pausado = !ctx.pausado;
  html.classList.toggle('pausado', ctx.pausado);
  botaoPausa.setAttribute('aria-pressed', String(ctx.pausado));
  botaoPausa.textContent = TXT[ctx.idioma][ctx.pausado ? 'retomar' : 'pausar'];
  emTodos('pausar', ctx.pausado);
});

/* ---------- idioma ---------- */
function texto(l, chave) {
  const k = chave === 'soc.titulo' && !ctx.frescor.fresco ? 'soc.titulo.velho' : chave;
  return TXT[l][k].replace('{n}', String(DADOS.observatorio.alvos));
}
function pintarTextos() {
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = texto(ctx.idioma, el.dataset.t); });
}
function aplicarIdioma(l) {
  ctx.idioma = l;
  html.lang = l === 'en' ? 'en' : 'pt-BR';
  html.setAttribute('data-lang', l);
  pintarTextos();
  document.querySelectorAll('[data-lang-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langBtn === l)));
  botaoPausa.textContent = TXT[l][ctx.pausado ? 'retomar' : 'pausar'];
  for (const a of abas) a.frente.textContent = a.e.frente[l];
  emTodos('idioma', l);
}
document.querySelectorAll('[data-lang-btn]').forEach((b) => b.addEventListener('click', () => aplicarIdioma(b.dataset.langBtn)));

/* ---------- movimento reduzido, ao vivo ---------- */
MQ.addEventListener('change', (ev) => { ctx.reduzido = ev.matches; emTodos('reduzir', ev.matches); });

/* aba do navegador oculta: congela tudo sem mexer no estado do botão */
document.addEventListener('visibilitychange', () => emTodos('pausar', document.hidden || ctx.pausado));

/* ---------- frescor: os textos do shell já nascem certos; reavalia a cada minuto (estado, não animação) ---------- */
pintarTextos();
setInterval(() => {
  const antes = ctx.frescor.fresco;
  Object.assign(ctx.frescor, medirFrescor());
  if (ctx.frescor.fresco !== antes) { pintarTextos(); emTodos('frescor', ctx.frescor); }
}, 60000);
