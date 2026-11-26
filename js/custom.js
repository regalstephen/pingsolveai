// PingSolve Studio page (custom.html): the "Pick a problem" blueprint.
//
// Pick who it's for (your business, your startup, just you), then a problem,
// and its example blueprint swaps in. Rain glyphs fall into the blueprint and
// gather on each step, the step's words decode out of the glyphs, the line
// between steps draws in, and then a ping travels the line lighting each step
// in turn. The real text is in the page the whole time; the glyphs are a
// decorative overlay hidden from screen readers.
//
// Reduced motion: blueprints swap instantly, with no glyphs, line or ping.
(function () {
  'use strict';

  var AUDIENCES = {
    business: ['missed', 'reviews', 'quotes', 'noshows'],
    startup: ['connector', 'mvp', 'support'],
    you: ['privateai', 'learn']
  };

  var BLUEPRINT = 'Example blueprint';
  var COACHING = 'Setup + coaching';
  var AI_STEPS = ['When', 'AI handles', 'You decide', 'Result'];

  var PROBLEMS = {
    // ── Your business ──
    missed: {
      chip: 'Missed calls cost me jobs',
      tag: BLUEPRINT,
      title: 'Every missed call is a job that goes to someone else.',
      labels: AI_STEPS,
      steps: [
        'A call goes unanswered while you’re busy with a customer.',
        'Texts the caller right away with your booking link, and answers simple questions like hours and prices.',
        'See who called and what they need, and call back the ones that matter first.',
        'Callers book themselves or hear back, and every missed call is logged.'
      ],
      tools: ['Your business phone', 'Text messages', 'Your booking calendar', 'Claude'],
      goal: 'No caller hears silence.'
    },
    reviews: {
      chip: 'Customers never leave reviews',
      tag: BLUEPRINT,
      title: 'Happy customers leave, and never leave a review.',
      labels: AI_STEPS,
      steps: [
        'A job or appointment is marked done.',
        'Sends every customer a short, personal thank-you with a one-tap link to leave a review.',
        'Any reply that mentions a problem comes straight to you, so you can make it right.',
        'A steady stream of reviews, and problems you hear about first.'
      ],
      tools: ['Your booking or POS system', 'Text messages', 'Email', 'Google Business Profile'],
      goal: 'More reviews, without chasing anyone.'
    },
    quotes: {
      chip: 'Quotes take my evenings',
      tag: BLUEPRINT,
      title: 'Writing quotes eats your evenings.',
      labels: AI_STEPS,
      steps: [
        'You snap photos and leave a voice note at the job site.',
        'Turns them into a draft estimate in your own template, using your prices and past jobs.',
        'Check the numbers, adjust anything, and approve.',
        'The customer gets a clean, professional quote the same day.'
      ],
      tools: ['Your phone', 'Your price list', 'Google Docs or QuickBooks', 'Claude'],
      goal: 'Quotes go out while the customer is still interested.'
    },
    noshows: {
      chip: 'No-shows leave empty slots',
      tag: BLUEPRINT,
      title: 'No-shows and late cancellations leave empty chairs.',
      labels: ['When', 'Software handles', 'You decide', 'Result'],
      steps: [
        'An appointment is coming up, or someone cancels.',
        'Sends reminders with one-tap confirm, and offers any freed slot to your waitlist in order.',
        'Set the rules: how early to remind, and who gets offered a slot first.',
        'Fewer no-shows, and cancelled slots get a second chance to fill.'
      ],
      tools: ['Your booking calendar', 'Text messages', 'A live waitlist'],
      goal: 'Every open slot gets a second chance.',
      proof: 'Like <a href="waitlistpoker.html">WaitlistPoker</a>, the waitlist app we built for poker rooms.'
    },

    // ── Your startup ──
    connector: {
      chip: 'Put our product inside AI',
      tag: BLUEPRINT,
      title: 'Your customers work in Claude and ChatGPT. Your product isn’t there yet.',
      labels: ['When', 'Connector handles', 'You decide', 'Result'],
      steps: [
        'A customer asks their AI assistant to do something in your product.',
        'Gives the assistant safe actions in your product, through the customer’s own account.',
        'Choose which actions are allowed, and which need the customer to confirm.',
        'Customers use your product without opening it, and every action is logged.'
      ],
      tools: ['MCP connector', 'Your API', 'Claude', 'ChatGPT'],
      goal: 'Your product shows up where your customers already work.',
      proof: 'We built this for <a href="branchsolve.html">Branchsolve</a>: approvals your team handles without leaving Claude.'
    },
    mvp: {
      chip: 'We need an MVP, fast',
      tag: BLUEPRINT,
      title: 'You need something real to show investors and first users.',
      labels: ['When', 'We build', 'You decide', 'Result'],
      steps: [
        'You bring the idea and the one job the product has to do well.',
        'A working web or iPhone app, with weekly demos so you see it take shape.',
        'What makes the first version, and what waits for later.',
        'A real product in users’ hands, on code and accounts you own.'
      ],
      tools: ['iPhone & iPad', 'Web app', 'App Store launch', 'Your own accounts'],
      goal: 'A real product in weeks, not months.',
      proof: 'We’ve shipped ten apps of our own on iPhone and the web. <a href="index.html">See them all</a>.'
    },
    support: {
      chip: 'Support tickets pile up',
      tag: BLUEPRINT,
      title: 'Support tickets pile up faster than you can answer them.',
      labels: AI_STEPS,
      steps: [
        'A ticket arrives by email, chat or your help desk.',
        'Sorts it, drafts an answer from your docs, and spots anything urgent.',
        'Your team sends, edits or takes over. Urgent tickets go straight to a person.',
        'Faster replies, and a weekly list of questions your docs don’t answer yet.'
      ],
      tools: ['Your help desk', 'Email', 'Website chat', 'Your docs', 'Claude'],
      goal: 'Your team spends its time on the tickets that need a person.'
    },

    // ── Just you ──
    privateai: {
      chip: 'My own private AI',
      tag: COACHING,
      title: 'You want your own AI, on your own computer, from anywhere.',
      labels: ['When', 'We set up', 'You decide', 'Result'],
      steps: [
        'You ask your AI a question from your phone, at home or away.',
        'An AI model running on your own computer, and a private, secure link from your phone to it.',
        'Which files and tools your AI is allowed to use.',
        'Your own AI from anywhere, with conversations that stay on your machine.'
      ],
      tools: ['Your computer', 'Your phone', 'A local AI model', 'A private network'],
      goal: 'Your AI, on your hardware, under your control.'
    },
    learn: {
      chip: 'Learn to build with AI',
      tag: COACHING,
      title: 'You want to build your own tools with AI, but don’t know where to start.',
      labels: ['When', 'We set up', 'You decide', 'Result'],
      steps: [
        'We meet on a remote call, working on your own computer.',
        'AI coding tools installed and connected, and a first project picked together.',
        'What to build: something that solves a real problem in your life or work.',
        'Your first working tool, and the know-how to build the next one.'
      ],
      tools: ['Remote sessions', 'Claude Code', 'Your computer', 'GitHub'],
      goal: 'You leave able to build, not just watch.'
    }
  };

  var GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var small = window.matchMedia('(max-width: 760px)');

  var panel = document.getElementById('cx-blueprint');
  if (!panel) return;
  var tablist = document.querySelector('.cx-tabs');
  var audGroup = document.querySelector('.cx-aud');
  var audButtons = Array.prototype.slice.call(document.querySelectorAll('.cx-aud-btn'));
  var audThumb = document.querySelector('.cx-aud-thumb');
  var tabs = [];
  var canvas = panel.querySelector('.cx-particles');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  function field(name) { return panel.querySelector('[data-field="' + name + '"]'); }
  function glyph() { return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)); }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ── Content ─────────────────────────────────────────────
  function fill(p) {
    var tag = field('tag');
    tag.textContent = p.tag;
    tag.classList.toggle('cx-tag--coaching', p.tag === COACHING);
    field('title').textContent = p.title;
    for (var i = 0; i < 4; i++) {
      field('l' + i).textContent = p.labels[i];
      field('s' + i).textContent = p.steps[i];
    }
    field('goal').textContent = p.goal;
    var list = field('tools');
    list.innerHTML = '';
    p.tools.forEach(function (t, k) {
      var li = document.createElement('li');
      li.textContent = t;
      li.style.setProperty('--i', k + 4);
      list.appendChild(li);
    });
    var proof = field('proof');
    if (p.proof) { proof.innerHTML = p.proof; proof.hidden = false; }
    else { proof.innerHTML = ''; proof.hidden = true; }
  }

  // ── Audience switch ─────────────────────────────────────
  var audience = 'business';

  function placeThumb() {
    if (!audThumb) return;
    var on = audGroup.querySelector('[aria-pressed="true"]');
    audThumb.style.width = on.offsetWidth + 'px';
    audThumb.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  }

  function setAudience(btn, animate) {
    audience = btn.getAttribute('data-aud');
    audButtons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    placeThumb();
    renderTabs();
    select(tabs[0], animate);
  }

  audButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      setAudience(btn, true);
    });
  });
  window.addEventListener('resize', placeThumb);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb);
  placeThumb();

  // ── Problem tabs (automatic activation, arrow keys move between them) ──
  function renderTabs() {
    tablist.innerHTML = '';
    tabs = AUDIENCES[audience].map(function (id) {
      var b = document.createElement('button');
      b.className = 'cx-tab';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.id = 'tab-' + id;
      b.setAttribute('aria-controls', 'cx-blueprint');
      b.setAttribute('data-problem', id);
      b.textContent = PROBLEMS[id].chip;
      tablist.appendChild(b);
      return b;
    });
    bindTabs();
  }

  function bindTabs() {
    tabs = Array.prototype.slice.call(tablist.querySelectorAll('.cx-tab'));
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, true); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        select(next, true);
      });
    });
  }

  var current = 'missed';
  function select(tab, animate) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    var id = tab.getAttribute('data-problem');
    if (id === current && animate) { build(); return; }
    current = id;
    stopAll();
    fill(PROBLEMS[id]);
    if (animate) build();
  }

  bindTabs();

  // ── Build sequence ──────────────────────────────────────
  var decoders = [], frame = null, pingTimer = null, particles = [], visible = false;

  function stopAll() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    clearTimeout(pingTimer);
    decoders.forEach(function (d) { finish(d); });
    decoders = [];
    particles = [];
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    panel.classList.remove('is-building', 'is-pinging');
  }

  function build() {
    stopAll();
    if (still.matches) return;
    void panel.offsetWidth;            // restart CSS animations
    panel.classList.add('is-building');

    var els = panel.querySelectorAll('[data-decode]');
    var start = performance.now();
    // Title first, then each step as its glyphs land, then the goal.
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var f = el.getAttribute('data-field');
      var delay = f === 'title' ? 120 : f === 'goal' ? 760 : 300 + Number(f.slice(1)) * 110;
      decoders.push(decoder(el, start + delay, Math.min(900, 420 + el.textContent.length * 5)));
    }
    spawn(start);
    frame = requestAnimationFrame(tick);
    pingTimer = setTimeout(function () { panel.classList.add('is-pinging'); }, 1200);
  }

  function decoder(el, at, dur) {
    var text = el.textContent;
    var overlay = document.createElement('span');
    overlay.className = 'cx-decode-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    el.classList.add('is-decoding');
    el.appendChild(overlay);
    var order = [];
    for (var i = 0; i < text.length; i++) order.push(i / text.length * 0.75 + Math.random() * 0.25);
    return { el: el, overlay: overlay, text: text, order: order, at: at, dur: dur, chars: text.split('').map(glyph), done: false };
  }

  function finish(d) {
    if (d.done) return;
    d.done = true;
    if (d.overlay.parentNode) d.overlay.parentNode.removeChild(d.overlay);
    d.el.classList.remove('is-decoding');
  }

  function drawDecoder(d, now) {
    if (d.done) return false;
    var p = (now - d.at) / d.dur;
    if (p < 0) { d.overlay.textContent = ''; return true; }
    if (p >= 1) { finish(d); return false; }
    var html = '', pending = '';
    for (var i = 0; i < d.text.length; i++) {
      var c = d.text.charAt(i);
      if (p >= d.order[i] || c === ' ') {
        if (pending) { html += '<span class="g">' + pending + '</span>'; pending = ''; }
        html += esc(c);
      } else {
        if (Math.random() < 0.18) d.chars[i] = glyph();
        pending += esc(d.chars[i]);
      }
    }
    if (pending) html += '<span class="g">' + pending + '</span>';
    d.overlay.innerHTML = html;
    return true;
  }

  // Glyphs fall from above the sheet and gather on the title and steps.
  function spawn(start) {
    if (!ctx) return;
    var box = panel.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '500 14px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    var targets = [field('title')].concat(Array.prototype.slice.call(panel.querySelectorAll('.cx-node')));
    var per = small.matches ? 10 : 24;
    targets.forEach(function (t, k) {
      var r = t.getBoundingClientRect();
      var lead = k === 0 ? 0 : 160 + (k - 1) * 110;   // land just before that step decodes
      for (var n = 0; n < per; n++) {
        var tx = r.left - box.left + 12 + Math.random() * Math.max(10, r.width - 24);
        var ty = r.top - box.top + 10 + Math.random() * Math.max(10, r.height - 20);
        particles.push({
          sx: tx + (Math.random() - 0.5) * box.width * 0.5,
          sy: -20 - Math.random() * 120,
          tx: tx, ty: ty,
          at: start + Math.max(0, lead - 420) + Math.random() * 180,
          dur: 420 + Math.random() * 260,
          ch: glyph()
        });
      }
    });
  }

  function drawParticles(now) {
    if (!ctx || !particles.length) return false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var live = false;
    for (var i = 0; i < particles.length; i++) {
      var q = particles[i];
      var p = (now - q.at) / q.dur;
      if (p >= 1) continue;
      live = true;
      if (p < 0) continue;
      // Fall straight down first, then slide sideways onto the target.
      var e = 1 - Math.pow(1 - p, 3);
      var cx = q.sx, cy = q.ty;
      var x = (1 - e) * (1 - e) * q.sx + 2 * (1 - e) * e * cx + e * e * q.tx;
      var y = (1 - e) * (1 - e) * q.sy + 2 * (1 - e) * e * cy + e * e * q.ty;
      var a = Math.min(1, p * 5) * (p > 0.7 ? (1 - p) / 0.3 : 1);
      var r = Math.round(150 - 87 * e), g = Math.round(158 - 67 * e), b = Math.round(170 + 7 * e);
      if (Math.random() < 0.08) q.ch = glyph();
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a * 0.85).toFixed(3) + ')';
      ctx.fillText(q.ch, x, y);
    }
    if (!live) { particles = []; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    return live;
  }

  function tick(now) {
    frame = null;
    var busy = drawParticles(now);
    for (var i = 0; i < decoders.length; i++) if (drawDecoder(decoders[i], now)) busy = true;
    if (busy) frame = requestAnimationFrame(tick);
    else decoders = [];
  }

  // ── Play once when the blueprint first comes into view; pause the ping off screen ──
  var played = false;
  function setPaused() {
    panel.classList.toggle('is-paused', !visible || document.hidden);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible = entry.isIntersecting;
        if (!played && entry.intersectionRatio >= 0.35) { played = true; build(); }
        setPaused();
      });
    }, { threshold: [0, 0.35] }).observe(panel);
  } else {
    visible = true;
    played = true;
    build();
  }
  document.addEventListener('visibilitychange', setPaused);

  function onMotionChange() { if (still.matches) stopAll(); }
  if (still.addEventListener) still.addEventListener('change', onMotionChange);
  else if (still.addListener) still.addListener(onMotionChange);
})();

// Contact form: builds an email from the answers and opens the visitor's
// email app. Nothing is sent from the page itself. If no email app opens,
// the status box offers to copy the message instead.
(function () {
  'use strict';

  var form = document.getElementById('cx-form');
  if (!form) return;
  var TO = 'support@pingsolveai.com';
  var problem = document.getElementById('cx-problem');
  var error = document.getElementById('cx-problem-error');
  var status = document.getElementById('cx-status');
  var copy = document.getElementById('cx-copy');
  var copied = document.getElementById('cx-copied');
  var message = '';

  // Until the visitor picks one themselves, follow the demo's audience.
  var kindTouched = false;
  var KIND_FOR = { business: 0, startup: 1, you: 2 };
  var kinds = form.querySelectorAll('input[name="kind"]');
  Array.prototype.forEach.call(kinds, function (r) {
    r.addEventListener('change', function () { kindTouched = true; });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.cx-aud-btn'), function (b) {
    b.addEventListener('click', function () {
      var i = KIND_FOR[b.getAttribute('data-aud')];
      if (!kindTouched && kinds[i]) kinds[i].checked = true;
    });
  });

  function showError(on) {
    error.hidden = !on;
    if (on) problem.setAttribute('aria-invalid', 'true');
    else problem.removeAttribute('aria-invalid');
  }
  problem.addEventListener('input', function () {
    if (problem.value.trim()) showError(false);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = problem.value.trim();
    if (!text) {
      showError(true);
      problem.focus();
      return;
    }
    showError(false);

    var data = new FormData(form);
    var kind = data.get('kind') || '';
    var tools = (data.get('tools') || '').trim();
    var name = (data.get('name') || '').trim();
    var lines = [
      'Hi PingSolve Studio,',
      '',
      'What I’m looking for: ' + kind,
      '',
      'The problem, or what I want AI to do:',
      text,
      ''
    ];
    if (tools) lines.push('Tools we use today: ' + tools, '');
    lines.push('How soon: ' + data.get('when'), '', 'Thanks,');
    if (name) lines.push(name);
    message = lines.join('\r\n');

    var subject = 'Free call with PingSolve Studio: ' + kind;
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);

    copied.textContent = '';
    status.hidden = false;
  });

  copy.addEventListener('click', function () {
    if (!message) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).then(function () {
        copied.textContent = 'Copied. Paste it into an email to ' + TO + '.';
      }, function () {
        copied.textContent = 'Copying didn’t work here. Your answers are still in the form above.';
      });
    } else {
      copied.textContent = 'Copying didn’t work here. Your answers are still in the form above.';
    }
  });
})();
