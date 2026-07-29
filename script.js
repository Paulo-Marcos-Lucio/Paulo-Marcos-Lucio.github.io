(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.svc-card, .step, .work-card, .hero-stats li, .section-header, .cta-inner, .project, .cred-item, .cred-note, .suite-card, .provoke-card'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- spotlight interativo nos cards de pacote ----------
     pointermove dispara na taxa do dispositivo (pode passar de 1000 Hz em
     mouses gamer e em telas de alta taxa). Escrever custom properties a cada
     evento força um recálculo de estilo por evento. Aqui o evento só guarda a
     última posição e um requestAnimationFrame — coalescido por uma flag —
     escreve no máximo uma vez por quadro. */
  if (!prefersReduced && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.work-card').forEach(function (card) {
      var pendente = false;
      var ultimoX = 0, ultimoY = 0;

      function aplicar() {
        pendente = false;
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        card.style.setProperty('--mx', ((ultimoX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--my', ((ultimoY - r.top) / r.height) * 100 + '%');
      }

      card.addEventListener('pointermove', function (e) {
        ultimoX = e.clientX;
        ultimoY = e.clientY;
        if (pendente) return;      // já há um quadro agendado: coalesce
        pendente = true;
        requestAnimationFrame(aplicar);
      });
    });
  }

  /* ---------- chuva de binários (estilo Matrix) ---------- */
  var canvas = document.getElementById('matrix');
  if (!canvas || prefersReduced) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cols = 0, fontSize = 16;
  var drops = [], speeds = [];
  var GLYPHS = '01';

  function reset() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fontSize = W < 600 ? 13 : 16;
    cols = Math.ceil(W / fontSize);
    drops = new Array(cols);
    speeds = new Array(cols);
    for (var i = 0; i < cols; i++) {
      drops[i] = (Math.random() * H) / fontSize; // já semeados na tela
      speeds[i] = 0.4 + Math.random() * 0.7;
    }
  }
  reset();

  var last = 0;
  var FRAME_GAP = 1000 / 30; // ~30fps
  var running = true;
  var rafId = 0;

  function draw(t) {
    if (!running) return;
    rafId = requestAnimationFrame(draw);
    if (t - last < FRAME_GAP) return;
    last = t;

    // rastro: pinta o fundo do site com leve transparência (menor = rastros mais longos)
    ctx.fillStyle = 'rgba(8, 11, 15, 0.10)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '600 ' + fontSize + 'px "JetBrains Mono", monospace';

    for (var i = 0; i < cols; i++) {
      var x = i * fontSize;
      var y = drops[i] * fontSize;
      var ch = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);

      // Alfas contidos por CONTRASTE (WCAG 1.4.3): a chuva passa por trás de
      // texto em --fg-3, e no alfa antigo (líder 0.95 / glifos até 0.85) o pior
      // pixel derrubava esse texto a 1,08:1. Com estes valores o pior caso
      // analítico sobe para 3,19:1. Chegar a 4,5:1 exigiria opacidade 0.14 no
      // #matrix — ou seja, apagar o efeito; ver relatório.
      if (Math.random() < 0.03) {
        ctx.fillStyle = 'rgba(226, 236, 245, 0.45)'; // líder "piscando" claro
      } else if (Math.random() < 0.07) {
        ctx.fillStyle =
          (Math.random() < 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(129, 140, 248, ') +
          (0.26 + Math.random() * 0.24) + ')'; // respingos sky/indigo
      } else {
        ctx.fillStyle = 'rgba(45, 212, 191, ' + (0.26 + Math.random() * 0.26) + ')'; // teal
      }
      ctx.fillText(ch, x, y);

      drops[i] += speeds[i];
      if (y > H && Math.random() > 0.975) {
        drops[i] = Math.random() * -20;
        speeds[i] = 0.4 + Math.random() * 0.7;
      }
    }
  }
  rafId = requestAnimationFrame(draw);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reset, 160);
  });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = 0; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(draw); }
  });
})();
