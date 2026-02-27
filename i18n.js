/* ============================================================
   ACADEVA — Internationalization Engine
   Handles language switching (en/he), RTL/LTR, localStorage
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'acadeva-lang';
  var DEFAULT_LANG = 'he';

  /* ── Getters / Setters ────────────────────────────── */

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  /* ── Translation lookup ────────────────────────────────── */

  function t(key, lang) {
    var entry = TRANSLATIONS[key];
    if (!entry) return null;
    return entry[lang] || entry.en || null;
  }

  /* ── Apply all translations ───────────────────────────── */

  function applyTranslations(lang) {
    var dir = lang === 'he' ? 'rtl' : 'ltr';
    var html = document.documentElement;

    html.lang = lang;
    html.dir = dir;

    // data-i18n →  textContent
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      var val = t(key, lang);
      if (val !== null) els[i].textContent = val;
    }

    // data-i18n-html →  innerHTML ( for text containing markup like <span class="text-gradient">)
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      var hkey = htmlEls[j].getAttribute('data-i18n-html');
      var hval = t(hkey, lang);
      if (hval !== null) htmlEls[j].innerHTML = hval;
    }

    // data-i18n-placeholder → placeholder attribute
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var k = 0; k < phEls.length; k++) {
      var pkey = phEls[k].getAttribute('data-i18n-placeholder');
      var pval = t(pkey, lang);
      if (pval !== null) phEls[k].placeholder = pval;
    }

    // data-i18n-aria →  aria-label attribute
    var ariaEls = document.querySelectorAll('[data-i18n-aria]');
    for (var m = 0; m < ariaEls.length; m++) {
      var akey = ariaEls[m].getAttribute('data-i18n-aria');
      var aval = t(akey, lang);
      if (aval !== null) ariaEls[m].setAttribute('aria-label', aval);
    }

    // data-i18n-option → option text in selects
    var optEls = document.querySelectorAll('[data-i18n-option]');
    for (var n = 0; n < optEls.length; n++) {
      var okey = optEls[n].getAttribute('data-i18n-option');
      var oval = t(okey, lang);
      if (oval !== null) optEls[n].textContent = oval;
    }

    // Page title via meta tag
    var titleMeta = document.querySelector('meta[name="i18n-title-key"]');
    if (titleMeta) {
      var titleKey = titleMeta.getAttribute('content');
      var titleVal = t(titleKey, lang);
      if (titleVal) document.title = titleVal;
    }

    // Page meta description
    var descMeta = document.querySelector('meta[name="i18n-desc-key"]');
    if (descMeta) {
      var descKey = descMeta.getAttribute('content');
      var descVal = t(descKey, lang);
      if (descVal) {
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', descVal);
      }
    }

    // Update toggle button text ───────────────────────────────━ show the OTHER language
    var toggleBtn = document.getElementById('langToggle');
    if (toggleBtn) {
      var toggleSpan = toggleBtn.querySelector('span');
      if (toggleSpan) {
        toggleSpan.textContent = lang === 'he' ? 'English' : 'סבטית'\;
      }
    }

    // Mark ready (unhide translated content)
    html.classList.add('i18n-ready');
  }

  /* ── Toggle language ──────────────────────────────────── */

  function toggleLang() {
    var current = getLang();
    var next = current === 'he' ? 'en' : 'he';
    setLang(next);
    applyTranslations(next);

    // Dispatch event for GSAP to re-init
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: next } }));

    // Refresh ScrollTrigger after DOM changes
    if (window.ScrollTrigger) {
      setTimeout(function () {
        ScrollTrigger.refresh(true);
      }, 100);
    }
  }

  // Expose globally
  window.toggleLang = toggleLang;
  window.getLang = getLang;
  window.t = t;

  /* ── Initial application ──────────────────────────────── */

  function initI18n() {
    var lang = getLang();
    applyTranslations(lang);
  }

  // Run as soon as DOM is interactive
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }

})();
