(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- nav mobile: hamburguer acessivel (aria-expanded, Esc, clique-fora, foco) ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteHeader = document.querySelector('.site-header');
  var navPrimary = document.getElementById('nav-primary');
  if (navToggle && siteHeader && navPrimary) {
    function fecharNav(focar) {
      siteHeader.removeAttribute('data-nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      if (focar) navToggle.focus();
    }
    function abrirNav() {
      siteHeader.setAttribute('data-nav-open', '');
      navToggle.setAttribute('aria-expanded', 'true');
      var link = navPrimary.querySelector('a');
      if (link) link.focus();
    }
    navToggle.addEventListener('click', function () {
      if (navToggle.getAttribute('aria-expanded') === 'true') fecharNav(false); else abrirNav();
    });
    navPrimary.addEventListener('click', function (e) { if (e.target.closest('a')) fecharNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteHeader.hasAttribute('data-nav-open')) fecharNav(true);
    });
    document.addEventListener('click', function (e) {
      if (siteHeader.hasAttribute('data-nav-open') && !e.target.closest('.site-header')) fecharNav(false);
    });
  }

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

  /* ---------- o olho costurado dos cards ----------
     Cada card de ferramenta/pacote ganha um olho no canto (decorativo, aria-hidden): fechado em
     costura; no hover/foco abre (CSS) e a pupila acompanha o ponteiro dentro do card. Mesmo
     esquema do spotlight acima: o evento só guarda a posição, um rAF escreve uma vez por quadro. */
  document.querySelectorAll('.suite-card, .work-card').forEach(function (card) {
    var olho = document.createElement('span');
    olho.className = 'olho-card';
    olho.setAttribute('aria-hidden', 'true');
    var globo = document.createElement('span');
    globo.className = 'olho-globo';
    var pupila = document.createElement('span');
    pupila.className = 'olho-pupila';
    globo.appendChild(pupila);
    olho.appendChild(globo);
    card.appendChild(olho);
    if (prefersReduced || !window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;

    var pendente = false, px = 0, py = 0;
    function mirar() {
      pendente = false;
      var r = olho.getBoundingClientRect();
      var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy) || 1, k = d / (d + 60);
      pupila.style.transform = 'translate(' + (dx / d * k * 8).toFixed(1) + 'px,' + (dy / d * k * 3.5).toFixed(1) + 'px)';
    }
    card.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(mirar);
    });
    card.addEventListener('pointerleave', function () { pupila.style.transform = ''; });
  });

  /* ---------- pausa global (WCAG 2.2.2): desoculta o botao e liga o toggle.
     O congelamento das animacoes e CSS (html:has([data-abismo-pausa][aria-pressed=true])). ---------- */
  var pausa = document.querySelector('[data-abismo-pausa]');
  if (pausa) {
    pausa.hidden = false;
    var txtPausa = pausa.querySelector('.abismo-pausa-txt');
    function rotularPausa(ativo) {
      var en = document.documentElement.getAttribute('data-lang') === 'en';
      var label = ativo ? (en ? 'Resume animation' : 'Retomar animação')
                        : (en ? 'Pause animation' : 'Pausar animação');
      if (txtPausa) txtPausa.textContent = label;
      pausa.setAttribute('aria-label', label);
    }
    pausa.addEventListener('click', function () {
      var ativo = pausa.getAttribute('aria-pressed') !== 'true';
      pausa.setAttribute('aria-pressed', String(ativo));
      rotularPausa(ativo);
    });
    rotularPausa(false);
    new MutationObserver(function () {
      rotularPausa(pausa.getAttribute('aria-pressed') === 'true');
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  }
})();
