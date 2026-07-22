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

  function draw(t) {
    if (!running) return;
    requestAnimationFrame(draw);
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

      if (Math.random() < 0.03) {
        ctx.fillStyle = 'rgba(233, 240, 245, 0.95)'; // líder "piscando" claro
      } else if (Math.random() < 0.07) {
        ctx.fillStyle =
          (Math.random() < 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(129, 140, 248, ') +
          (0.35 + Math.random() * 0.45) + ')'; // respingos sky/indigo
      } else {
        ctx.fillStyle = 'rgba(45, 212, 191, ' + (0.35 + Math.random() * 0.5) + ')'; // teal
      }
      ctx.fillText(ch, x, y);

      drops[i] += speeds[i];
      if (y > H && Math.random() > 0.975) {
        drops[i] = Math.random() * -20;
        speeds[i] = 0.4 + Math.random() * 0.7;
      }
    }
  }
  requestAnimationFrame(draw);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reset, 160);
  });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(draw); }
  });
})();
