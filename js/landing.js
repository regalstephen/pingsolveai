// Landing page (index.html): mouse parallax background and spinning app icons.
//
// Background: three blurred layers ease toward the mouse at different depths,
// and a soft glow trails the cursor. Icons: each becomes a two-sided tile;
// moving the mouse across it (or near it) gives it spin, which coasts down
// and then settles facing forward, like the crystal on crystallize.prism-on.tokyo.
//
// Runs only with a mouse and without reduced motion; on touch screens and with
// reduced motion nothing moves and css/landing.css shows the static gradient.
(function () {
  'use strict';

  var still = window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)');
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
    return useRaf ? requestAnimationFrame(cb) : setTimeout(function () { cb(performance.now()); }, 16);
  }

  // ── State ───────────────────────────────────────────────
  var mouse = { x: innerWidth / 2, y: innerHeight / 2, seen: false, energy: 0 };
  var aim = { x: 0, y: 0 }, drift = { x: 0, y: 0 };
  var glowAt = { x: innerWidth / 2, y: innerHeight / 2 };
  var icons = [];
  var running = false, last = 0;

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
    if (running || still.matches) return;
    running = true;
    last = performance.now();
    nextFrame(step);
  }

  // ── Input ───────────────────────────────────────────────
  document.addEventListener('pointermove', function (e) {
    if (still.matches || e.pointerType !== 'mouse') return;
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
    aim.x = aim.y = 0;
    bg.classList.remove('is-live');
    mouse.seen = false;
    start();
  });

  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);

  // ── Frame ───────────────────────────────────────────────
  function step(now) {
    var k = Math.min(3, (now - last) / 16.667);   // 1 at 60 fps
    last = now;
    var busy = false;

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
    for (var j = 0; j < icons.length; j++) {
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

    if (busy) nextFrame(step);
    else running = false;
  }

  // ── Digital rain ────────────────────────────────────────
  // Light gray columns of falling characters on a canvas. Faint everywhere;
  // around the cursor they darken and fall faster, more so while the mouse moves.
  var rain = (function () {
    var canvas = document.querySelector('.landing-bg-rain');
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
    var SIZE = 16;               // px per character cell
    var BASE = 0.09;             // trail opacity away from the cursor
    var HEAD = 0.2;              // leading character opacity away from the cursor
    var PEAK = 0.8;              // extra opacity right under a moving cursor
    var cols = [], w = 0, h = 0, rows = 0, last = 0, on = false;

    function glyph() { return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)); }

    function newDrop(col, top) {
      col.len = 8 + Math.floor(Math.random() * 14);
      col.head = top ? -Math.random() * rows : -Math.random() * 10;
      col.speed = 0.18 + Math.random() * 0.32;   // rows per 60 fps frame
    }

    function size() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
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
      if (!on) return;
      var k = Math.min(3, (now - last) / 16.667);
      last = now;
      mouse.energy *= Math.pow(0.97, k);
      var live = mouse.seen ? 1 : 0;
      var reach = 170 + 230 * mouse.energy;                    // px around the cursor
      var lift = live * (0.5 + 0.5 * mouse.energy);            // 0..1

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
      nextFrame(frame);
    }

    window.addEventListener('resize', function () { if (on) size(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { on = false; }
      else if (!still.matches && !on) { on = true; last = performance.now(); nextFrame(frame); }
    });

    return {
      start: function () {
        if (on || still.matches) return;
        on = true;
        size();
        last = performance.now();
        nextFrame(frame);
      },
      stop: function () {
        on = false;
        ctx.clearRect(0, 0, w, h);
      }
    };
  })();

  // ── Mouse vs. touch / reduced motion ────────────────────
  function reset() {
    if (!still.matches) return;
    if (rain) rain.stop();
    drift.x = drift.y = aim.x = aim.y = 0;
    for (var i = 0; i < layers.length; i++) layers[i].style.transform = '';
    bg.classList.remove('is-live');
    for (var j = 0; j < icons.length; j++) {
      icons[j].angle = icons[j].v = 0;
      icons[j].el.style.transform = '';
      icons[j].el.style.setProperty('--sheen-alpha', 0);
    }
  }
  if (still.addEventListener) still.addEventListener('change', reset);
  else if (still.addListener) still.addListener(reset);

  function wake() {
    buildIcons();
    if (rain) rain.start();
  }
  if (!still.matches) wake();
  // Start up if a mouse shows up later (for example, a tablet with a trackpad).
  if (still.addEventListener) still.addEventListener('change', function () { if (!still.matches) wake(); });
})();
