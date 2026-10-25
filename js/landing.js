// Landing page (index.html): mouse parallax background and spinning app icons.
//
// Background: three blurred layers ease toward the mouse at different depths,
// and a soft glow trails the cursor. Icons: each becomes a two-sided tile;
// moving the mouse across it (or near it) gives it spin, which coasts down
// and then settles facing forward, like the crystal on crystallize.prism-on.tokyo.
//
// Touch screens get lighter ambient motion and passive touch feedback.
// Reduced motion always leaves the static gradient, regardless of input device.
(function () {
  'use strict';

  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = window.matchMedia('(hover: none), (pointer: coarse)');
  var bg = document.querySelector('.landing-bg');
  var layers = document.querySelectorAll('.landing-bg-layer');
  var glow = document.querySelector('.landing-bg-glow');
  var DEPTHS = [24, 56, 110];   // px of travel at the screen edge: far, mid, near
  var REACH = 300;              // px around an icon where the mouse adds spin
  var GAIN = 0.275;             // degrees of spin per px of mouse travel, at the icon
  var MAX_SPIN = 14;            // degrees per frame
  var FRICTION = 0.955;         // per 60 fps frame

  // ── Frames ──────────────────────────────────────────────
  // requestAnimationFrame, or a 60 fps timer where frames don't arrive
  // (some embedded and background views never run them).
  var useRaf = false;
  requestAnimationFrame(function () { useRaf = true; });
  function nextFrame(cb) {
    return useRaf ? { raf: requestAnimationFrame(cb) } : { timer: setTimeout(function () { cb(performance.now()); }, 16) };
  }
  function cancelFrame(frame) {
    if (!frame) return;
    if (frame.raf !== undefined) cancelAnimationFrame(frame.raf);
    else clearTimeout(frame.timer);
  }

  // ── State ───────────────────────────────────────────────
  var mouse = { x: innerWidth / 2, y: innerHeight / 2, seen: false, energy: 0 };
  var aim = { x: 0, y: 0 }, drift = { x: 0, y: 0 };
  var glowAt = { x: innerWidth / 2, y: innerHeight / 2 };
  var icons = [];
  var running = false, last = 0;
  var pendingFrame = null, touchUntil = 0, touchId = null;
  var revealObserver = null;

  // Turn each icon into a front and back face around the same image.
  function buildIcons() {
    var wraps = document.querySelectorAll('.app-card-icon');
    for (var i = 0; i < wraps.length; i++) {
      var wrap = wraps[i];
      var img = wrap.querySelector('img');
      if (!img || wrap.classList.contains('is-spinnable')) continue;
      var spin = document.createElement('div');
      spin.className = 'icon-spin';
      var front = document.createElement('div');
      front.className = 'icon-face';
      var back = document.createElement('div');
      back.className = 'icon-face icon-face--back';
      var backImg = img.cloneNode();
      backImg.alt = '';
      front.appendChild(img);
      back.appendChild(backImg);
      spin.appendChild(front);
      spin.appendChild(back);
      wrap.appendChild(spin);
      wrap.classList.add('is-spinnable');
      icons.push({ el: spin, wrap: wrap, angle: 0, v: 0, cx: 0, cy: 0 });
    }
    measure();
  }

  function measure() {
    for (var i = 0; i < icons.length; i++) {
      var r = icons[i].wrap.getBoundingClientRect();
      icons[i].cx = r.left + r.width / 2;
      icons[i].cy = r.top + r.height / 2;
    }
  }

  function start() {
    if (running || still.matches || document.hidden) return;
    running = true;
    last = performance.now();
    pendingFrame = nextFrame(step);
  }

  // ── Input ───────────────────────────────────────────────
  document.addEventListener('pointermove', function (e) {
    if (still.matches || mobile.matches || e.pointerType !== 'mouse') return;
    var dx = e.clientX - mouse.x;
    var dy = e.clientY - mouse.y;
    if (!mouse.seen) { dx = dy = 0; mouse.seen = true; bg.classList.add('is-live'); }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Faster movement charges the rain around the cursor; it drains each frame.
    mouse.energy = Math.min(1, mouse.energy + Math.hypot(dx, dy) / 260);
    // -1 at the left/top edge, 1 at the right/bottom; layers drift the other way.
    aim.x = -(mouse.x / innerWidth * 2 - 1);
    aim.y = -(mouse.y / innerHeight * 2 - 1);
    // Horizontal travel spins nearby icons; closer icons get more.
    for (var i = 0; i < icons.length; i++) {
      var ic = icons[i];
      var d = Math.hypot(mouse.x - ic.cx, mouse.y - ic.cy);
      var near = Math.max(0, 1 - d / REACH);
      if (!near) continue;
      ic.v += dx * GAIN * near * near;
      ic.v = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, ic.v));
    }
    start();
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    if (mobile.matches || still.matches) return;
    aim.x = aim.y = 0;
    bg.classList.remove('is-live');
    mouse.seen = false;
    start();
  });

  // Never capture pointers or cancel events: native scrolling, zoom and links win.
  function touchFeedback(e) {
    mouse.x = glowAt.x = e.clientX;
    mouse.y = glowAt.y = e.clientY;
    mouse.seen = true;
    mouse.energy = 0.35;
    touchUntil = performance.now() + 650;
    glow.style.transform = 'translate3d(' + mouse.x + 'px,' + mouse.y + 'px,0)';
    bg.classList.add('is-live');
  }
  document.addEventListener('pointerdown', function (e) {
    if (still.matches || !mobile.matches || e.pointerType === 'mouse' || !e.isPrimary) return;
    touchId = e.pointerId;
    touchFeedback(e);
  }, { passive: true });
  document.addEventListener('pointermove', function (e) {
    if (still.matches || !mobile.matches || e.pointerId !== touchId) return;
    touchFeedback(e);
  }, { passive: true });
  function endTouch(e) {
    if (e.pointerId !== touchId) return;
    touchId = null;
    touchUntil = performance.now() + (e.type === 'pointercancel' ? 0 : 180);
  }
  document.addEventListener('pointerup', endTouch, { passive: true });
  document.addEventListener('pointercancel', endTouch, { passive: true });

  window.addEventListener('scroll', function () {
    if (!mobile.matches) measure();
  }, { passive: true });
  window.addEventListener('resize', measure);

  // ── Frame ───────────────────────────────────────────────
  function step(now) {
    pendingFrame = null;
    if (still.matches || document.hidden) { running = false; return; }
    if (mobile.matches && now - last < 1000 / 30 - 1) {
      pendingFrame = nextFrame(step);
      return;
    }
    var k = Math.min(3, (now - last) / 16.667);   // 1 at 60 fps
    last = now;
    var busy = false;

    if (mobile.matches) {
      // Small, slow drift, with a bounded scroll contribution and no layout reads.
      aim.x = Math.sin(now / 9000) * 0.12;
      aim.y = Math.cos(now / 11000) * 0.1 - Math.min(1, Math.max(0, window.scrollY) / innerHeight) * 0.16;
      if (now >= touchUntil) {
        mouse.seen = false;
        bg.classList.remove('is-live');
      }
      busy = true;
    }

    // Background layers and glow.
    var ease = 1 - Math.pow(1 - 0.07, k);
    drift.x += (aim.x - drift.x) * ease;
    drift.y += (aim.y - drift.y) * ease;
    for (var i = 0; i < layers.length; i++) {
      layers[i].style.transform = 'translate3d(' + (drift.x * DEPTHS[i]).toFixed(2) + 'px,' + (drift.y * DEPTHS[i]).toFixed(2) + 'px,0)';
    }
    if (Math.abs(aim.x - drift.x) > 0.0005 || Math.abs(aim.y - drift.y) > 0.0005) busy = true;

    var glowEase = 1 - Math.pow(1 - 0.12, k);
    glowAt.x += (mouse.x - glowAt.x) * glowEase;
    glowAt.y += (mouse.y - glowAt.y) * glowEase;
    glow.style.transform = 'translate3d(' + glowAt.x.toFixed(1) + 'px,' + glowAt.y.toFixed(1) + 'px,0)';
    if (Math.abs(mouse.x - glowAt.x) > 0.3 || Math.abs(mouse.y - glowAt.y) > 0.3) busy = true;

    // Icons: coast with friction, then a spring brings them back to face front.
    for (var j = 0; !mobile.matches && j < icons.length; j++) {
      var ic = icons[j];
      ic.angle += ic.v * k;
      ic.v *= Math.pow(FRICTION, k);
      if (Math.abs(ic.v) < 3) {
        var home = Math.round(ic.angle / 360) * 360;
        ic.v += (home - ic.angle) * 0.02 * k;
        ic.v *= Math.pow(0.86, k);
        if (Math.abs(home - ic.angle) < 0.05 && Math.abs(ic.v) < 0.02) {
          ic.angle = 0;
          ic.v = 0;
        }
      }
      var turn = ((ic.angle % 360) + 360) % 360;              // 0..360
      var edgeOn = Math.abs(Math.sin(turn * Math.PI / 180));   // 1 when side-on
      ic.el.style.transform = ic.angle ? 'rotateY(' + ic.angle.toFixed(2) + 'deg)' : '';
      ic.el.style.setProperty('--sheen', ((turn % 180) / 180).toFixed(3));
      ic.el.style.setProperty('--sheen-alpha', (Math.min(1, Math.abs(ic.v) / 3) * (0.4 + 0.6 * edgeOn)).toFixed(3));
      if (ic.angle || ic.v) busy = true;
    }

    if (busy) pendingFrame = nextFrame(step);
    else running = false;
  }

  // ── Digital rain ────────────────────────────────────────
  // Light gray columns of falling characters on a canvas. Faint everywhere;
  // around the cursor they darken and fall faster, more so while the mouse moves.
  var rain = (function () {
    var canvas = document.querySelector('.landing-bg-rain');
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
    var SIZE = 16;               // px per character cell
    var BASE = 0.09;             // trail opacity away from the cursor
    var HEAD = 0.2;              // leading character opacity away from the cursor
    var PEAK = 0.8;              // extra opacity right under a moving cursor
    var cols = [], w = 0, h = 0, rows = 0, last = 0, on = false;
    var pending = null;

    function glyph() { return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)); }

    function newDrop(col, top) {
      col.len = mobile.matches ? 6 + Math.floor(Math.random() * 7) : 8 + Math.floor(Math.random() * 14);
      col.head = top ? (mobile.matches ? Math.random() * rows : -Math.random() * rows) : -Math.random() * 10;
      col.speed = (0.18 + Math.random() * 0.32) * (mobile.matches ? 0.65 : 1);   // rows per 60 fps frame
    }

    function size() {
      SIZE = mobile.matches ? 24 : 16;
      var dpr = Math.min(mobile.matches ? 1.5 : 2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = '500 ' + (SIZE - 2) + 'px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
      ctx.textBaseline = 'top';
      rows = Math.ceil(h / SIZE) + 1;
      var n = Math.ceil(w / SIZE);
      cols = [];
      for (var i = 0; i < n; i++) {
        var col = { x: i * SIZE, chars: [] };
        for (var r = 0; r < rows; r++) col.chars.push(glyph());
        newDrop(col, true);
        cols.push(col);
      }
    }

    function frame(now) {
      pending = null;
      if (!on) return;
      if (mobile.matches && now - last < 1000 / 30 - 1) {
        pending = nextFrame(frame);
        return;
      }
      var k = Math.min(3, (now - last) / 16.667);
      last = now;
      mouse.energy *= Math.pow(0.97, k);
      var live = mouse.seen ? 1 : 0;
      var reach = 170 + 230 * mouse.energy;                    // px around the cursor
      var lift = live * (0.5 + 0.5 * mouse.energy);            // 0..1
      if (mobile.matches) {
        reach = 140;
        lift *= Math.max(0, Math.min(1, (touchUntil - now) / 650)) * 0.65;
      }

      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < cols.length; i++) {
        var col = cols[i];
        var cx = col.x + SIZE / 2;
        var colNear = Math.max(0, 1 - Math.abs(cx - mouse.x) / reach) * lift;
        col.head += col.speed * (1 + 2.2 * colNear) * k;
        if (col.head - col.len > rows) newDrop(col, false);
        if (Math.random() < 0.04 * k) col.chars[Math.floor(Math.random() * rows)] = glyph();

        var top = Math.floor(col.head);
        for (var t = 0; t < col.len; t++) {
          var row = top - t;
          if (row < 0 || row >= rows) continue;
          var y = row * SIZE;
          var d = Math.hypot(cx - mouse.x, y + SIZE / 2 - mouse.y);
          var near = Math.max(0, 1 - d / reach);
          near = near * near * lift;
          var fade = 1 - t / col.len;
          var alpha = (t === 0 ? HEAD : BASE * fade) + PEAK * near * fade;
          // Light gray, shading toward the page's crystal blue under the cursor.
          var r = Math.round(150 - 87 * near), g = Math.round(158 - 67 * near), b = Math.round(170 + 7 * near);
          ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
          ctx.fillText(col.chars[row], col.x, y);
        }
      }
      pending = nextFrame(frame);
    }

    window.addEventListener('resize', function () {
      // Mobile browser chrome resizes during a scroll: don't regenerate rain then.
      if (on && (!mobile.matches || w !== canvas.clientWidth || Math.abs(h - canvas.clientHeight) > 160)) size();
    });

    return {
      start: function () {
        if (on || still.matches || document.hidden) return;
        on = true;
        size();
        last = performance.now();
        pending = nextFrame(frame);
      },
      stop: function () {
        on = false;
        cancelFrame(pending);
        pending = null;
        ctx.clearRect(0, 0, w, h);
      }
    };
  })();

  // ── Input mode, visibility and reduced motion ──────────
  function reset() {
    cancelFrame(pendingFrame);
    pendingFrame = null;
    running = false;
    if (rain) rain.stop();
    if (revealObserver) revealObserver.disconnect();
    touchUntil = 0;
    touchId = null;
    mouse.seen = false;
    mouse.energy = 0;
    drift.x = drift.y = aim.x = aim.y = 0;
    for (var i = 0; i < layers.length; i++) layers[i].style.transform = '';
    bg.classList.remove('is-live');
    for (var j = 0; j < icons.length; j++) {
      icons[j].angle = icons[j].v = 0;
      icons[j].el.style.transform = '';
      icons[j].el.style.setProperty('--sheen-alpha', 0);
      icons[j].el.classList.remove('mobile-enter');
    }
  }
  function wake() {
    if (still.matches || document.hidden) return;
    buildIcons();
    if (rain) rain.start();
    if (mobile.matches) {
      if ('IntersectionObserver' in window) {
        if (!revealObserver) revealObserver = new IntersectionObserver(function (entries) {
          if (still.matches || !mobile.matches || document.hidden) return;
          entries.forEach(function (entry) {
            var spin = entry.target.querySelector('.icon-spin');
            // Re-arm offscreen so the same turn plays on the next pass in either
            // direction. Separate entry/exit thresholds avoid edge flicker.
            if (!entry.isIntersecting) spin.classList.remove('mobile-enter');
            else if (entry.intersectionRatio >= 0.35) spin.classList.add('mobile-enter');
          });
        }, { threshold: [0, 0.35] });
        icons.forEach(function (ic) {
          revealObserver.observe(ic.wrap);
        });
      }
      start();
    }
  }
  function sync() { reset(); wake(); }
  [still, mobile].forEach(function (query) {
    if (query.addEventListener) query.addEventListener('change', sync);
    else if (query.addListener) query.addListener(sync);
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', function (e) { if (e.persisted) sync(); });
  wake();
})();
