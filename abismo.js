(function () {
  'use strict';

  /* abismo.js — STUB provisório (será substituído pelo motor WebGL da criatura).
     Por ora: a mesma chuva de binários de antes, recolorida para o tema vermelho.
     Respeita prefers-reduced-motion e pausa com a aba oculta. */

  var canvas = document.getElementById('abismo');
  if (!canvas) return;
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cols = 0, fontSize = 16, drops = [], speeds = [];

  function reset() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fontSize = W < 600 ? 13 : 16;
    cols = Math.ceil(W / fontSize);
    drops = new Array(cols); speeds = new Array(cols);
    for (var i = 0; i < cols; i++) { drops[i] = (Math.random() * H) / fontSize; speeds[i] = 0.4 + Math.random() * 0.7; }
  }
  reset();

  var last = 0, running = true, rafId = 0, FRAME_GAP = 1000 / 30;
  function draw(t) {
    if (!running) return;
    rafId = requestAnimationFrame(draw);
    if (t - last < FRAME_GAP) return;
    last = t;
    ctx.fillStyle = 'rgba(8, 4, 5, 0.10)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '600 ' + fontSize + 'px "JetBrains Mono", monospace';
    for (var i = 0; i < cols; i++) {
      var y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() < 0.03 ? 'rgba(244, 234, 231, 0.40)' : 'rgba(227, 23, 46, ' + (0.22 + Math.random() * 0.24) + ')';
      ctx.fillText(Math.random() < 0.5 ? '0' : '1', i * fontSize, y);
      drops[i] += speeds[i];
      if (y > H && Math.random() > 0.975) { drops[i] = Math.random() * -20; speeds[i] = 0.4 + Math.random() * 0.7; }
    }
  }
  rafId = requestAnimationFrame(draw);

  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(reset, 160); });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = 0; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(draw); }
  });
})();
