// Mix Poker pages (mixpoker*.html): header, reveal on scroll and the THORSE rotation.
// Adapted from learnmixpoker.com/site/site.js. Every page is complete without it;
// motion only runs when JS is on and reduced motion is off.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) root.classList.add('motion');

  // ── Header ───────────────────────────────────────────────

  function setUpHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = header.querySelector('.menu-toggle');
    var nav = header.querySelector('.nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { toggle.click(); toggle.focus(); }
    });
  }

  // ── Reveal on scroll ─────────────────────────────────────

  function onceInView(els, fn, threshold) {
    if (!('IntersectionObserver' in window)) { for (var i = 0; i < els.length; i++) fn(els[i]); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        fn(entry.target);
      });
    }, { threshold: threshold || 0.15, rootMargin: '0px 0px -6% 0px' });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  function setUpReveal() {
    if (!root.classList.contains('motion')) return;
    onceInView(document.querySelectorAll('[data-reveal]'), function (el) { el.classList.add('is-in'); });
  }

  // ── The rotation (hero) ──────────────────────────────────

  function setUpRotation() {
    var rotation = document.querySelector('[data-rotation]');
    if (!rotation) return;
    var fan = rotation.querySelector('.fan');
    var cards = rotation.querySelectorAll('.fan-card');
    var caption = rotation.querySelector('.rotation-caption');
    var gameEl = caption.querySelector('.game');
    var whatEl = caption.querySelector('.what');
    var countEl = caption.querySelector('.count');
    var active = 0;
    var timer = null;
    var paused = false;

    function show(n, animate) {
      cards[active].classList.remove('is-active');
      active = n;
      cards[active].classList.add('is-active');
      fan.style.setProperty('--at', active);
      var c = cards[active];
      var update = function () {
        gameEl.textContent = c.getAttribute('data-game');
        whatEl.textContent = c.getAttribute('data-what');
        countEl.textContent = 'Game ' + (active + 1) + ' of 6';
      };
      if (!animate || reduceMotion) { update(); return; }
      caption.classList.add('is-swapping');
      setTimeout(function () { update(); caption.classList.remove('is-swapping'); }, 230);
    }

    function tick() { if (!paused) show((active + 1) % cards.length, true); }
    function start() { if (!timer && !reduceMotion) timer = setInterval(tick, 2800); }
    function stop() { clearInterval(timer); timer = null; }

    for (var i = 0; i < cards.length; i++) {
      (function (n) {
        cards[n].addEventListener('mouseenter', function () { paused = true; if (n !== active) show(n, true); });
        cards[n].addEventListener('focus', function () { paused = true; if (n !== active) show(n, true); });
        cards[n].addEventListener('mouseleave', function () { paused = false; });
        cards[n].addEventListener('blur', function () { paused = false; });
      })(i);
    }

    show(0, false);

    // Deal the fan in, then start the rotation once it has settled.
    if (root.classList.contains('motion')) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fan.classList.add('is-dealt');
          setTimeout(function () { fan.classList.add('is-settled'); }, 1300);
        });
      });
    }

    // Only rotate while the fan is on screen and the tab is visible.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start(); else stop();
      }).observe(rotation);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  }

  function boot() {
    setUpHeader();
    setUpReveal();
    setUpRotation();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
