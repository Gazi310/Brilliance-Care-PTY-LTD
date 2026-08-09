/* ============================================================
   BRILLIANCE CARE — WIREFRAME SHELL
   Injects the review toolbar, site nav, breadcrumb hero, footer,
   tab bar and sticky rail so each page file is content only.

   Page files declare themselves with body data attributes:
     data-page   file slug (drives the switcher's selected state)
     data-title  subtitle shown in the review toolbar
     data-nav    which top-nav link is active
     data-shell  "site" (default) | "admin" | "plain"
     data-hero-title / data-hero-sub / data-crumb / data-hero-img
   ============================================================ */
(function () {
  var B = document.body, D = B.dataset;

  var PAGES = [
    ['Marketing', [
      ['index', 'Home'], ['laundry', 'Laundry'], ['cleaning', 'Cleaning'],
      ['services', 'All services'], ['pricing', 'Pricing'], ['how-it-works', 'How it works'],
      ['faq', 'FAQ'], ['contact', 'Contact'], ['products', 'Shop'], ['product-detail', 'Product detail']
    ]],
    ['Booking & checkout', [
      ['book', 'Book (4 steps)'], ['cart', 'Cart'], ['checkout', 'Pay deposit'], ['confirmed', 'Order confirmed']
    ]],
    ['Customer account', [
      ['account-orders', 'My orders'], ['invoice', 'Invoice & balance'],
      ['profile', 'Profile'], ['login', 'Log in / Register']
    ]],
    ['Admin', [
      ['admin-dashboard', 'Dashboard'], ['admin-orders', 'Work queue'], ['admin-assess', 'Assess & invoice'],
      ['admin-schedule', 'Schedule'], ['admin-customers', 'Customers'], ['admin-settings', 'Settings']
    ]]
  ];

  var NAV = [
    ['index', 'Home'], ['laundry', 'Laundry'], ['cleaning', 'Cleaning'],
    ['products', 'Shop'], ['pricing', 'Pricing'], ['how-it-works', 'How it works'], ['contact', 'Contact']
  ];

  /* ---- query-string state so the view survives navigation ---- */
  var Q = new URLSearchParams(location.search);
  var isMobile = Q.get('v') === 'm';
  var showNotes = Q.get('n') === '1';
  function link(slug) {
    var q = [];
    if (isMobile) q.push('v=m');
    if (showNotes) q.push('n=1');
    return slug + '.html' + (q.length ? '?' + q.join('&') : '');
  }

  var I = {
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.5L21 11l-6.4 2.5L12 20l-2.6-6.5L3 11l6.4-2.5z"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16H5z"/><path d="M9 2v4M15 2v4M5 10h14"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 006 6L17 13l5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9H4z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16v14H4z"/><path d="M4 10h16"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v17l-3-2-3 2-3-2-3 2z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.5-3.6 4-5.4 7-5.4s5.5 1.8 7 5.4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c1.2-3.2 3.6-4.8 7-4.8s5.8 1.6 7 4.8"/><path d="M16 5.5a3 3 0 010 5.6M18 20c-.3-1.5-.8-2.7-1.6-3.7"/></svg>',
    cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19"/></svg>'
  };

  var BRAND = '<div class="brand"><div class="mark">' + I.star +
    '</div><div class="wm">BRILLIANCE CARE<small>LAUNDRY &amp; CLEANING</small></div></div>';

  /* ---------------- review toolbar ---------------- */
  var opts = PAGES.map(function (g) {
    return '<optgroup label="' + g[0] + '">' + g[1].map(function (p) {
      return '<option value="' + p[0] + '"' + (p[0] === D.page ? ' selected' : '') + '>' + p[1] + '</option>';
    }).join('') + '</optgroup>';
  }).join('');

  var bar = document.createElement('div');
  bar.className = 'toolbar';
  bar.innerHTML =
    '<div class="tb-brand"><div class="tb-mark">B</div><div>' +
      '<div class="tb-t">Brilliance Care — wireframes v2</div>' +
      '<div class="tb-s">' + (D.title || '') + '</div></div></div>' +
    '<select class="tb-sel" id="sw" aria-label="Jump to page">' + opts + '</select>' +
    '<div class="seg" role="group" aria-label="Viewport">' +
      '<button id="vD" aria-pressed="' + (!isMobile) + '">Desktop</button>' +
      '<button id="vM" aria-pressed="' + isMobile + '">Mobile</button></div>' +
    '<label class="tgl"><input type="checkbox" id="nt"' + (showNotes ? ' checked' : '') + '> Show what each section answers</label>';
  B.insertBefore(bar, B.firstChild);

  /* ---------------- page frame ---------------- */
  var wrap = document.createElement('div');
  wrap.className = 'stagewrap';
  wrap.innerHTML = '<div class="stage' + (isMobile ? ' is-mobile' : '') + '" id="stage"><div class="page" id="pg"></div></div>';
  B.appendChild(wrap);

  var pg = wrap.querySelector('#pg');
  var shell = D.shell || 'site';

  /* nav */
  var nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = BRAND +
    '<div class="navlinks">' + NAV.map(function (n) {
      return '<a href="' + link(n[0]) + '"' + (n[0] === D.nav ? ' class="on"' : '') + '>' + n[1] + '</a>';
    }).join('') + '</div>' +
    '<div class="navcta"><span class="ph">03 XXXX XXXX</span>' +
    '<a class="btn btn-gold" href="' + link('book') + '">Book a service</a></div>' +
    '<button class="burger" aria-label="Menu">' + I.burger + '</button>';
  pg.appendChild(nav);

  /* breadcrumb hero */
  if (D.heroTitle) {
    var crumbs = (D.crumb || 'Home').split('/').map(function (c) { return c.trim(); });
    var trail = crumbs.map(function (c, i) {
      return i === crumbs.length - 1
        ? '<span>' + c + '</span>'
        : '<a href="' + link(i === 0 ? 'index' : c.toLowerCase().replace(/\s+/g, '-')) + '">' + c + '</a><span class="sep">›</span>';
    }).join('');
    var h = document.createElement('header');
    h.className = 'ihero';
    h.innerHTML = '<div class="ph"><span>Photo — ' + (D.heroImg || 'page banner') + '</span></div>' +
      '<div class="container"><div class="crumb">' + trail + '</div>' +
      '<h1 class="h1">' + D.heroTitle + '</h1>' +
      (D.heroSub ? '<p class="lead">' + D.heroSub + '</p>' : '') + '</div>';
    pg.appendChild(h);
  }

  /* move authored content in */
  var main = B.querySelector('main');
  if (main) pg.appendChild(main);

  /* footer */
  if (shell === 'site') {
    var f = document.createElement('footer');
    f.className = 'foot';
    f.innerHTML = '<div class="container"><div class="fgrid">' +
      '<div class="c1">' + BRAND +
        '<p class="blurb">Family-run laundry and cleaning, looking after Melbourne\'s eastern suburbs since 2023.</p>' +
        '<p class="meta abn">ABN XX XXX XXX XXX</p></div>' +
      '<div class="col"><h4>Services</h4><ul>' +
        '<li><a href="' + link('laundry') + '">Laundry</a></li><li><a href="' + link('cleaning') + '">Cleaning</a></li>' +
        '<li><a href="' + link('cleaning') + '">End of lease</a></li><li><a href="' + link('products') + '">Shop</a></li>' +
        '<li><a href="' + link('pricing') + '">Pricing</a></li></ul></div>' +
      '<div class="col"><h4>Company</h4><ul>' +
        '<li><a href="' + link('index') + '">About us</a></li><li><a href="' + link('how-it-works') + '">How it works</a></li>' +
        '<li><a href="' + link('contact') + '">Service area</a></li><li><a href="' + link('faq') + '">FAQ</a></li>' +
        '<li><a href="' + link('contact') + '">Contact</a></li></ul></div>' +
      '<div class="col"><h4>Get in touch</h4><ul><li><a href="#">03 XXXX XXXX</a></li>' +
        '<li><a href="#">hello@brilliancecare.com.au</a></li><li>7am – 7pm, seven days</li></ul>' +
        '<div class="news"><label class="sr" for="nl">Email address</label>' +
        '<input class="field" id="nl" placeholder="Your email">' +
        '<button class="btn btn-gold">Sign up</button></div></div>' +
      '</div><div class="fbar"><span>© 2026 Brilliance Care Pty Ltd. All prices AUD, GST included.</span>' +
      '<span>Privacy · Terms</span></div></div>';
    pg.appendChild(f);
  }

  /* mobile tab bar */
  var tabs = shell === 'admin'
    ? [[I.chart, 'Dashboard', 'admin-dashboard'], [I.receipt, 'Orders', 'admin-orders'],
       [I.cal, 'Schedule', 'admin-schedule'], [I.cog, 'More', 'admin-settings']]
    : [[I.home, 'Home', 'index'], [I.grid, 'Services', 'services'],
       [I.plus, 'Book', 'book'], [I.receipt, 'Orders', 'account-orders'], [I.user, 'Account', 'profile']];
  var tb = document.createElement('div');
  tb.className = 'tabbar';
  tb.innerHTML = tabs.map(function (t) {
    return '<div' + (t[2] === D.page ? ' class="on"' : '') + '>' + t[0] + t[1] + '</div>';
  }).join('');
  pg.appendChild(tb);

  /* sticky rail */
  if (shell === 'site') {
    var r = document.createElement('div');
    r.className = 'rail';
    r.innerHTML =
      '<a href="' + link('book') + '">' + I.cal + 'Book online</a>' +
      '<a href="' + link('pricing') + '">' + I.dollar + 'Pricing</a>' +
      '<a href="' + link('contact') + '">' + I.phone + 'Contact</a>';
    wrap.querySelector('#stage').appendChild(r);
  }

  if (showNotes) B.classList.add('notes');

  /* ---------------- behaviour ---------------- */
  function go(mobile, notes) {
    var q = [];
    if (mobile) q.push('v=m');
    if (notes) q.push('n=1');
    location.search = q.join('&');
  }
  document.getElementById('sw').addEventListener('change', function (e) {
    location.href = link(e.target.value);
  });
  document.getElementById('vD').addEventListener('click', function () { if (isMobile) go(false, showNotes); });
  document.getElementById('vM').addEventListener('click', function () { if (!isMobile) go(true, showNotes); });
  document.getElementById('nt').addEventListener('change', function (e) { go(isMobile, e.target.checked); });

  /* ---- markup helpers so page files stay readable ---- */
  /* <div class="stars"></div> fills itself with 5 gold stars + an a11y label */
  document.querySelectorAll('.stars').forEach(function (el) {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', (el.dataset.n || 5) + ' out of 5');
    el.innerHTML = new Array(5).fill(I.star).join('');
  });
  /* every accordion summary gets its chevron appended */
  document.querySelectorAll('details.q > summary').forEach(function (s) {
    s.insertAdjacentHTML('beforeend',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
  });

  /* expose the admin sidebar builder for admin pages */
  window.adminAside = function (active) {
    var items = [[I.chart, 'Dashboard', 'admin-dashboard'], [I.receipt, 'Orders', 'admin-orders'],
      [I.cal, 'Schedule', 'admin-schedule'], [I.users, 'Customers', 'admin-customers'],
      [I.box, 'Laundry', 'admin-settings'], [I.box, 'Cleaning', 'admin-settings'],
      [I.box, 'Shop', 'admin-settings'], [I.cog, 'Settings', 'admin-settings']];
    return '<aside class="aside"><div class="ttl">Admin</div>' + items.map(function (it) {
      return '<a href="' + link(it[2]) + '"' + (it[1].toLowerCase() === active ? ' class="on"' : '') + '>' + it[0] + it[1] + '</a>';
    }).join('') + '</aside>';
  };
  document.querySelectorAll('[data-aside]').forEach(function (el) {
    el.outerHTML = window.adminAside(el.getAttribute('data-aside'));
  });
})();
