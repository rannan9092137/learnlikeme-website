/* Learn Like Me — site behavior: nav, scroll reveals, funnel breadcrumb, count-up */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav: solid after scrolling past the hero top, mobile toggle ---- */
  var nav = document.querySelector('.nav');
  if (nav && !nav.classList.contains('nav--solid')) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealed.forEach(function (el) { ro.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Count-up for big numbers ----
     Elements: <span data-count="86" data-prefix="$" data-suffix="%">
     Non-numeric stats skip animation. */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    var dur = 1400;
    var start = null;
    function fmt(v) {
      var s = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US');
      return prefix + s + suffix;
    }
    if (reduceMotion) { el.textContent = fmt(target); return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          co.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- Funnel breadcrumb: highlight the place we've scrolled to ---- */
  var crumbItems = document.querySelectorAll('.funnel__crumb li[data-panel]');
  var panels = document.querySelectorAll('.funnel__panel[id]');
  if (crumbItems.length && panels.length && 'IntersectionObserver' in window) {
    var setActive = function (id) {
      var passed = true;
      crumbItems.forEach(function (li) {
        var isThis = li.getAttribute('data-panel') === id;
        li.classList.toggle('is-active', isThis);
        if (isThis) passed = false;
        li.classList.toggle('is-passed', passed && !isThis);
      });
    };
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { threshold: 0.5 });
    panels.forEach(function (p) { po.observe(p); });
  }
})();
