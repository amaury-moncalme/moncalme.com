/* Mon Calme — consentement à la mesure d'audience.
   Google Analytics n'est chargé qu'après un « Accepter ». Sans choix, ou après « Refuser »,
   rien n'est envoyé : les appels gtag() restent en mémoire sur la page.
   Le choix est gardé 6 mois, puis redemandé. Le lien « Cookies » du pied de page rouvre le bandeau. */
(function () {
  var GA_ID = 'G-0PPDHXLE6D';
  var KEY = 'moncalme-consent';
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // ~6 mois
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var ALL = {
    fr: { text: 'J\'utilise Google Analytics pour savoir quelles pages vous aident et où la réservation coince. Rien n\'est mesuré sans votre accord.',
          accept: 'Accepter', refuse: 'Refuser', more: 'En savoir plus', label: 'Choix des cookies', link: 'Cookies' },
    en: { text: 'I use Google Analytics to see which pages help and where booking gets stuck. Nothing is measured without your consent.',
          accept: 'Accept', refuse: 'Decline', more: 'Learn more', label: 'Cookie choice', link: 'Cookies' },
    es: { text: 'Uso Google Analytics para saber qué páginas ayudan y dónde se atasca la reserva. No se mide nada sin tu consentimiento.',
          accept: 'Aceptar', refuse: 'Rechazar', more: 'Saber más', label: 'Elección de cookies', link: 'Cookies' }
  };
  var TXT = ALL[lang] || ALL.fr;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') window.gtag = function () { window.dataLayer.push(arguments); };

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && v.t && Date.now() - v.t < MAX_AGE) return v.c;
    } catch (e) {}
    return null;
  }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch (e) {} }

  var loaded = false;
  function loadGA() {
    if (loaded) return; loaded = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function clearGA() {
    // Efface les cookies Analytics éventuellement posés lors d'un accord précédent
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid') {
        ['', '.' + location.hostname, location.hostname].forEach(function (d) {
          document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var banner = null;
  function build() {
    var t = TXT;
    banner = document.createElement('div');
    banner.className = 'mc-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', t.label);
    banner.innerHTML =
      '<p class="mc-consent-text">' + t.text + ' <a href="/mentions-legales/#cookies">' + t.more + '</a></p>' +
      '<div class="mc-consent-btns"><button type="button" data-c="denied">' + t.refuse + '</button>' +
      '<button type="button" data-c="granted">' + t.accept + '</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      var c = b.getAttribute('data-c');
      save(c);
      if (c === 'granted') loadGA(); else clearGA();
      hide();
    });
    var css = document.createElement('style');
    css.textContent =
      '.mc-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:400;max-width:560px;margin:0 auto;background:var(--dark,#1A1612);' +
      'color:var(--cream,#F1E8D8);border:0.5px solid rgba(201,169,110,0.5);padding:18px 20px;box-shadow:0 10px 40px rgba(0,0,0,0.45);' +
      'font-family:Jost,system-ui,sans-serif;}' +
      '.mc-consent-text{font-size:15px;line-height:1.6;margin:0 0 14px;color:inherit;}' +
      '.mc-consent-text a{color:var(--gold-light,#E3CB98);text-decoration:none;border-bottom:0.5px solid rgba(201,169,110,0.5);white-space:nowrap;}' +
      '.mc-consent-btns{display:flex;gap:10px;}' +
      '.mc-consent-btns button{flex:1;cursor:pointer;font:inherit;font-size:13.5px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 10px;' +
      'background:transparent;color:var(--gold-light,#E3CB98);border:0.5px solid rgba(201,169,110,0.6);}' +
      '.mc-consent-btns button:hover{background:rgba(201,169,110,0.14);}' +
      '@media (max-width:900px){.mc-consent{left:10px;right:10px;bottom:calc(84px + env(safe-area-inset-bottom));}}';
    document.head.appendChild(css);
  }
  function show() {
    if (!banner) build();
    if (!banner.isConnected) document.body.appendChild(banner);
    var b = banner.querySelector('button[data-c="granted"]');
    if (b) b.focus({ preventScroll: true });
  }
  function hide() { if (banner && banner.isConnected) banner.remove(); }

  // Lien « Cookies » dans le pied de page pour changer d'avis
  function addFooterLink() {
    var f = document.querySelector('.footer-info');
    if (!f || f.querySelector('.mc-consent-link')) return;
    var a = document.createElement('a');
    a.href = '#'; a.className = 'mc-consent-link'; a.textContent = TXT.link;
    a.addEventListener('click', function (e) { e.preventDefault(); show(); });
    f.appendChild(a);
  }

  function init() {
    addFooterLink();
    var c = read();
    if (c === 'granted') loadGA();
    else if (c === null) show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
