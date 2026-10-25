/* ============================================================================
   A Consciência — entidade VIVA do herói (D2). Canvas 2D leve, SEM WebGL:
   rede neural com nós que respiram, PULSOS de luz viajando pelas conexões
   (dados em ação), o orbe-consciência pulsando, e BINÁRIOS caindo ao fundo.
   Disciplina de performance: desenha 1 quadro estático na hora (nada de herói
   em branco), mas SÓ anima depois do 'load' (o LCP é o texto), pausa fora da
   viewport, com a aba oculta, no botão de pausa e em prefers-reduced-motion.
   Zero dependência, zero requisição, CSP intacta (script-src 'self').
   ========================================================================== */
(function () {
  'use strict';
  var canvas = document.querySelector('canvas.hero-field');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var HERO = document.getElementById('top') || canvas.parentElement;
  var MQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener: 0 };

  var HOLO = '79,243,255', SYN = '138,92,255', WHITE = '234,254,255';

  // nós em frações do herói — aglomerado à direita = a consciência
  var ND = [[0.63,0.34],[0.72,0.25],[0.80,0.37],[0.88,0.22],[0.69,0.49],
            [0.91,0.47],[0.79,0.61],[0.57,0.46],[0.96,0.36],[0.86,0.72],[0.61,0.69],[0.74,0.14]];
  var EDG = [[0,1],[1,2],[2,3],[0,4],[4,2],[4,6],[2,5],[6,5],[3,8],[7,0],[7,4],[6,9],[1,8],[8,5],[10,6],[11,1],[11,3]];
  var ORB = [0.79, 0.34];

  var W = 0, H = 0, DPR = 1, nodes = [], orb = {}, cols = [], pulses = [];

  function build() {
    nodes = ND.map(function (p, i) {
      return { x: p[0] * W, y: p[1] * H, r: 1.8 + (i % 3) * 0.9, ph: (i * 1.7) % 6.28, sp: 0.55 + (i % 5) * 0.12 };
    });
    orb = { x: ORB[0] * W, y: ORB[1] * H, R: Math.max(70, Math.min(W, H) * 0.19) };
    orb.glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.R * 1.7);
    orb.glow.addColorStop(0, 'rgba(' + HOLO + ',0.26)'); orb.glow.addColorStop(0.5, 'rgba(' + SYN + ',0.08)'); orb.glow.addColorStop(1, 'rgba(' + SYN + ',0)');
    orb.core = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.R * 0.26);
    orb.core.addColorStop(0, 'rgba(' + WHITE + ',0.95)'); orb.core.addColorStop(0.5, 'rgba(' + HOLO + ',0.7)'); orb.core.addColorStop(1, 'rgba(' + HOLO + ',0)');
    var n = Math.max(7, Math.round(W / 46));
    cols = [];
    for (var c = 0; c < n; c++) {
      cols.push({ x: (c + 0.5) * (W / n) + (c % 3 - 1) * 4, y: (c * 137) % Math.max(1, H),
                  v: 15 + (c % 5) * 6, tint: (c % 6 === 0) ? SYN : HOLO, seed: c * 31 });
    }
    pulses = [];
  }

  function resize() {
    var r = HERO.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // 1) binários de fundo (coluna de 0/1 caindo, bem discretos)
    ctx.textBaseline = 'top';
    ctx.font = '600 12px "JetBrains Mono", ui-monospace, monospace';
    for (var i = 0; i < cols.length; i++) {
      var col = cols[i];
      col.y = (col.y + col.v * 0.016) % (H + 160);
      for (var k = 0; k < 9; k++) {
        var yy = col.y - k * 15 - 60;
        if (yy < -14 || yy > H) continue;
        var a = (0.15 - k * 0.013) * (0.65 + 0.35 * Math.sin(t * 1.2 + i * 0.7));
        if (a <= 0.002) continue;
        ctx.fillStyle = 'rgba(' + col.tint + ',' + a.toFixed(3) + ')';
        ctx.fillText(((col.seed + k + (col.y | 0)) & 1) ? '1' : '0', col.x, yy);
      }
    }

    // 2) conexões
    ctx.lineWidth = 1;
    for (var e = 0; e < EDG.length; e++) {
      var na = nodes[EDG[e][0]], nb = nodes[EDG[e][1]];
      ctx.strokeStyle = 'rgba(' + HOLO + ',0.15)';
      ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
    }

    // 3) pulsos de luz viajando pelas conexões (os "dados em ação")
    if (t > nextSpawn && pulses.length < 12) {
      pulses.push({ e: (Math.random() * EDG.length) | 0, p: 0, sp: 0.5 + Math.random() * 0.5 });
      nextSpawn = t + 0.14 + Math.random() * 0.22;
    }
    for (var pi = pulses.length - 1; pi >= 0; pi--) {
      var pu = pulses[pi]; pu.p += pu.sp * 0.016;
      if (pu.p >= 1) { pulses.splice(pi, 1); continue; }
      var a2 = nodes[EDG[pu.e][0]], b2 = nodes[EDG[pu.e][1]];
      var px = a2.x + (b2.x - a2.x) * pu.p, py = a2.y + (b2.y - a2.y) * pu.p;
      ctx.fillStyle = 'rgba(' + HOLO + ',0.4)';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(' + WHITE + ',0.95)';
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, 6.283); ctx.fill();
    }

    // 4) nós respirando
    for (var ni = 0; ni < nodes.length; ni++) {
      var nd = nodes[ni], br = 0.5 + 0.5 * Math.sin(t * nd.sp + nd.ph);
      ctx.fillStyle = 'rgba(' + HOLO + ',' + (0.35 + 0.5 * br).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * (0.75 + 0.45 * br), 0, 6.283); ctx.fill();
    }

    // 5) orbe-consciência
    var ob = 0.5 + 0.5 * Math.sin(t * 0.85);
    ctx.globalAlpha = 0.72 + 0.28 * ob;
    ctx.fillStyle = orb.glow; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.R * 1.7, 0, 6.283); ctx.fill();
    ctx.globalAlpha = 1;
    for (var ri = 0; ri < 2; ri++) {
      var rr = orb.R * (0.52 + ri * 0.33) + Math.sin(t * 0.6 + ri) * 3, rot = t * (0.32 - ri * 0.14) + ri;
      ctx.strokeStyle = 'rgba(' + HOLO + ',' + (0.55 - ri * 0.2).toFixed(3) + ')';
      ctx.lineWidth = 1.3 - ri * 0.4;
      ctx.beginPath(); ctx.arc(orb.x, orb.y, rr, rot, rot + 4.8); ctx.stroke();
    }
    ctx.globalAlpha = 0.75 + 0.25 * ob;
    ctx.fillStyle = orb.core; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.R * 0.26, 0, 6.283); ctx.fill();
    ctx.globalAlpha = 1;
  }

  var t0 = 0, raf = 0, running = false, onScreen = true, nextSpawn = 0, lastDraw = 0;
  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (!t0) { t0 = ts; nextSpawn = 0; lastDraw = ts - 40; }
    if (ts - lastDraw < 31) return;   // teto ~32fps: fluido e leve
    lastDraw = ts;
    draw((ts - t0) / 1000);
  }
  function staticFrame() { draw(1.1); }
  function pausedExt() {
    var btn = document.querySelector('[data-abismo-pausa]');
    return (btn && btn.getAttribute('aria-pressed') === 'true') || document.hidden || !onScreen;
  }
  function tick() {
    if (MQ.matches) { running = false; cancelAnimationFrame(raf); staticFrame(); return; }
    if (pausedExt()) { running = false; cancelAnimationFrame(raf); return; }
    if (!running) { running = true; t0 = 0; raf = requestAnimationFrame(frame); }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; tick(); }, { threshold: 0.02 }).observe(HERO);
  }
  document.addEventListener('visibilitychange', tick);
  var bp = document.querySelector('[data-abismo-pausa]');
  if (bp) bp.addEventListener('click', function () { setTimeout(tick, 0); });
  if (MQ.addEventListener) MQ.addEventListener('change', tick);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (!running) staticFrame(); }, 180); });

  try { resize(); staticFrame(); } catch (e) { return; }
  var kick = function () { setTimeout(tick, 450); };
  if (document.readyState === 'complete') kick(); else window.addEventListener('load', kick);
})();
