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

  /* A chuva de binários e a criatura do fundo moram em abismo.js. */
})();
