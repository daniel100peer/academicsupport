/* ============================================================
   ACADEVA — GSAP ScrollTrigger Orchestration Engine
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Utility ──────────────────────────────────────────────
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return gsap.utils.toArray(sel, ctx); }

  // RTL-aware directional helper: returns -value in RTL, value in LTR
  function dirX(value) {
    return document.documentElement.dir === 'rtl' ? -value : value;
  }

  // ── Mouse Tracking (glassmorphism glow) ──────────────────
  function initMouseTracking() {
    if (isTouchDevice) return;
    const root = document.documentElement;

    window.addEventListener('pointermove', function (e) {
      root.style.setProperty('--mouse-x', e.clientX + 'px');
      root.style.setProperty('--mouse-y', e.clientY + 'px');
    });
  }

  // ── Cursor Follower ──────────────────────────────────────
  function initCursorFollower() {
    if (isTouchDevice) return;
    const cursor = qs('.cursor-follower');
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.6, ease: 'power3' });

    window.addEventListener('pointermove', function (e) {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!cursor.classList.contains('active')) {
        cursor.classList.add('active');
      }
    });

    document.addEventListener('pointerleave', function () {
      cursor.classList.remove('active');
    });

    // Grow cursor on interactive elements
    qsa('a, button, [data-magnetic]').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        cursor.classList.add('hovering');
      });
      el.addEventListener('pointerleave', function () {
        cursor.classList.remove('hovering');
      });
    });
  }

  // ── Scroll Progress Bar ──────────────────────────────────
  function initScrollProgress() {
    var bar = qs('.scroll-progress__bar');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  }

  // ── Navigation Scroll State ──────────────────────────────
  function initNav() {
    var nav = qs('.nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: function (self) {
        if (self.scroll() > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    });

    // Mobile toggle
    var toggle = qs('#navToggle');
    var links = qs('#navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
      });

      // Close on link click
      qsa('.nav__link', links).forEach(function (link) {
        link.addEventListener('click', function () {
          toggle.classList.remove('open');
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ── Magnetic Buttons ─────────────────────────────────────
  function initMagneticButtons() {
    if (isTouchDevice) return;

    qsa('.magnetic-wrap').forEach(function (wrap) {
      var bounds;

      function calcBounds() {
        bounds = wrap.getBoundingClientRect();
      }

      wrap.addEventListener('pointerenter', calcBounds);

      wrap.addEventListener('pointermove', function (e) {
        if (!bounds) return;
        var x = e.clientX - bounds.left - bounds.width / 2;
        var y = e.clientY - bounds.top - bounds.height / 2;

        gsap.to(wrap, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.4,
          ease: 'power3.out'
        });
      });

      wrap.addEventListener('pointerleave', function () {
        gsap.to(wrap, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  // ── Background Orbs Parallax ─────────────────────────────
  function initOrbParallax() {
    qsa('.bg-mesh__orb').forEach(function (orb, i) {
      var speed = (i + 1) * 30;
      gsap.to(orb, {
        y: speed,
        x: dirX((i % 2 === 0 ? 1 : -1) * speed * 0.5),
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });
    });
  }

  // ── Hero Pinned Section ──────────────────────────────────
  function initHeroPinned() {
    var hero = qs('#hero');
    if (!hero) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=800',
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    });

    // Fade and scale hero content as user scrolls past
    tl.to(qs('.hero__content'), {
      y: -80,
      opacity: 0,
      scale: 0.92,
      duration: 1
    });

    // Parallax the decorative shapes at different rates
    qsa('.hero__shape').forEach(function (shape, i) {
      tl.to(shape, {
        y: -(i + 1) * 60,
        opacity: 0,
        duration: 1
      }, 0);
    });
  }

  // ── Hero Title Word-by-Word Reveal ───────────────────────
  function initHeroReveal() {
    var words = qsa('.hero__title-word');
    if (!words.length) return;

    gsap.from(words, {
      y: 80,
      opacity: 0,
      rotateX: -15,
      stagger: 0.12,
      duration: 1.2,
      ease: 'power4.out',
      delay: 0.3
    });

    // Badge and subtitle
    gsap.from('.hero__badge', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1
    });

    gsap.from('.hero__subtitle', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.8
    });

    gsap.from('.hero__actions', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 1.1
    });
  }

  // ── Scroll Reveal Animations (Batch) ─────────────────────
  function initRevealAnimations() {
    // Reveal Up
    ScrollTrigger.batch('.reveal-up', {
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          overwrite: true
        });
      },
      start: 'top 88%',
      once: true
    });

    // Reveal Left
    ScrollTrigger.batch('.reveal-left', {
      onEnter: function (batch) {
        gsap.to(batch, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          overwrite: true
        });
      },
      start: 'top 88%',
      once: true
    });

    // Reveal Right
    ScrollTrigger.batch('.reveal-right', {
      onEnter: function (batch) {
        gsap.to(batch, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          overwrite: true
        });
      },
      start: 'top 88%',
      once: true
    });

    // Reveal Scale
    ScrollTrigger.batch('.reveal-scale', {
      onEnter: function (batch) {
        gsap.to(batch, {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          overwrite: true
        });
      },
      start: 'top 88%',
      once: true
    });

    // Reveal Fade
    ScrollTrigger.batch('.reveal-fade', {
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power2.out',
          overwrite: true
        });
      },
      start: 'top 90%',
      once: true
    });
  }

  // ── Neon Divider Glow on Scroll ──────────────────────────
  function initNeonDividers() {
    qsa('.neon-divider').forEach(function (divider) {
      gsap.from(divider, {
        scaleX: 0,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: divider,
          start: 'top 90%',
          once: true
        }
      });
    });
  }

  // ── Counter Animation ────────────────────────────────────
  function initCounters() {
    qsa('[data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        },
        onUpdate: function () {
          el.textContent = Math.round(obj.val).toLocaleString();
        }
      });
    });
  }

  // ── Glass Card Tilt on Hover ─────────────────────────────
  function initCardTilt() {
    if (isTouchDevice) return;

    qsa('.glass-card[data-magnetic]').forEach(function (card) {
      var bounds;

      card.addEventListener('pointerenter', function () {
        bounds = card.getBoundingClientRect();
      });

      card.addEventListener('pointermove', function (e) {
        if (!bounds) return;
        var mx = e.clientX - bounds.left - bounds.width / 2;
        var my = e.clientY - bounds.top - bounds.height / 2;
        var rx = gsap.utils.clamp(-8, 8, -my / 15);
        var ry = gsap.utils.clamp(-8, 8, mx / 15);

        gsap.to(card, {
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 800,
          duration: 0.4,
          ease: 'power3.out'
        });
      });

      card.addEventListener('pointerleave', function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  // ── Section Parallax Layers ──────────────────────────────
  function initSectionParallax() {
    qsa('[data-parallax-speed]').forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute('data-parallax-speed')) || 0.2;
      gsap.to(layer, {
        yPercent: -20 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // ── CTA Banner Scale-In ──────────────────────────────────
  function initCTABanner() {
    var banner = qs('.cta-banner');
    if (!banner) return;

    gsap.from(banner, {
      scale: 0.88,
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: banner,
        start: 'top 85%',
        once: true
      }
    });
  }

  // ── Timeline Items (About page) ──────────────────────────
  function initTimeline() {
    qsa('.timeline-item').forEach(function (item, i) {
      gsap.from(item, {
        x: dirX(-40),
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  // ── Form Input Focus Glow ────────────────────────────────
  function initFormInteractions() {
    qsa('.form-input, .form-textarea').forEach(function (input) {
      input.addEventListener('focus', function () {
        gsap.to(input, {
          scale: 1.01,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      input.addEventListener('blur', function () {
        gsap.to(input, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  // ── Staggered Feature Rows ───────────────────────────────
  function initFeatureRows() {
    qsa('.feature-row').forEach(function (row) {
      var visual = qs('.feature-row__visual', row);
      var text = qs('.feature-row__text', row);
      if (!visual || !text) return;

      var isReverse = row.classList.contains('feature-row--reverse');

      gsap.from(visual, {
        x: dirX(isReverse ? 60 : -60),
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 80%',
          once: true
        }
      });

      gsap.from(text, {
        x: dirX(isReverse ? -60 : 60),
        opacity: 0,
        duration: 1,
        delay: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 80%',
          once: true
        }
      });
    });
  }

  // ── Blog Card Hover Image Zoom (non-CSS fallback) ────────
  function initBlogCardInteractions() {
    qsa('.blog-card').forEach(function (card) {
      var img = qs('.blog-card__image img', card);
      if (!img) return;

      card.addEventListener('pointerenter', function () {
        gsap.to(img, { scale: 1.08, duration: 0.6, ease: 'power3.out' });
      });
      card.addEventListener('pointerleave', function () {
        gsap.to(img, { scale: 1, duration: 0.8, ease: 'power2.out' });
      });
    });
  }

  // ── Smooth Anchor Scrolling ──────────────────────────────
  function initSmoothAnchors() {
    qsa('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        var target = qs(targetId);
        if (!target) return;
        e.preventDefault();
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 80 },
          duration: 1.2,
          ease: 'power3.inOut'
        });
      });
    });
  }

  // ── Responsive Animation Adjustments ─────────────────────
  function initResponsive() {
    gsap.matchMedia().add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 767px)',
        reducedMotion: '(prefers-reduced-motion: reduce)'
      },
      function (context) {
        var conditions = context.conditions;

        if (conditions.reducedMotion) {
          ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
          qsa('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade').forEach(function (el) {
            gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1 });
          });
          return;
        }

        if (conditions.isDesktop) {
          qsa('.glass-card').forEach(function (card, i) {
            gsap.to(card, {
              y: -10 - (i % 3) * 5,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            });
          });
        }
      }
    );
  }

  // ── Floating Particles ───────────────────────────────────
  function initParticles() {
    var container = qs('.particles-container');
    if (!container) return;

    var colors = ['#818cf8', '#22d3ee', '#f59e0b', '#f43f5e', '#10b981'];
    var sizes = ['particle--sm', 'particle--md', 'particle--lg'];

    for (var i = 0; i < 30; i++) {
      var p = document.createElement('div');
      p.className = 'particle ' + sizes[Math.floor(Math.random() * sizes.length)];
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      container.appendChild(p);

      gsap.to(p, {
        y: -200 - Math.random() * 300,
        x: (Math.random() - 0.5) * 200,
        opacity: 0.15 + Math.random() * 0.2,
        duration: 8 + Math.random() * 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 5
      });
    }
  }

  // ── Image Reveal Wipe Animation ──────────────────────────
  function initImageReveals() {
    qsa('.img-reveal').forEach(function (wrap) {
      var img = wrap.querySelector('img');
      if (!img) return;

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top 80%',
          once: true
        }
      });

      tl.to(wrap.querySelector('::after') || wrap, {
        scaleX: 0,
        transformOrigin: document.documentElement.dir === 'rtl' ? 'left' : 'right',
        duration: 0.8,
        ease: 'power4.inOut'
      });

      // Fallback: animate the pseudo-element via a clip overlay
      gsap.set(wrap, { '--reveal-progress': '100%' });
      tl.to(wrap, {
        '--reveal-progress': '0%',
        duration: 0.9,
        ease: 'power4.inOut'
      }, 0);

      tl.from(img, {
        scale: 1.3,
        duration: 1.2,
        ease: 'power3.out'
      }, 0.3);
    });
  }

  // ── Scroll Velocity Skew ─────────────────────────────────
  function initScrollSkew() {
    if (isTouchDevice) return;

    var skewElements = qsa('.skew-on-scroll');
    if (!skewElements.length) return;

    var currentSkew = 0;
    var targetSkew = 0;
    var lastScroll = 0;

    ScrollTrigger.create({
      onUpdate: function (self) {
        var velocity = self.getVelocity();
        targetSkew = gsap.utils.clamp(-3, 3, velocity / 300);
      }
    });

    gsap.ticker.add(function () {
      currentSkew += (targetSkew - currentSkew) * 0.1;
      targetSkew *= 0.95;
      if (Math.abs(currentSkew) > 0.01) {
        skewElements.forEach(function (el) {
          gsap.set(el, { skewY: currentSkew });
        });
      }
    });
  }

  // ── Parallax Images (within containers) ──────────────────
  function initParallaxImages() {
    qsa('.parallax-img-wrap').forEach(function (wrap) {
      var img = wrap.querySelector('img');
      if (!img) return;

      gsap.to(img, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // ── Blog Card Staggered Image Pan ────────────────────────
  function initImagePanOnHover() {
    if (isTouchDevice) return;

    qsa('.blog-card__image').forEach(function (imgWrap) {
      var img = imgWrap.querySelector('img');
      if (!img) return;

      var bounds;

      imgWrap.addEventListener('pointerenter', function () {
        bounds = imgWrap.getBoundingClientRect();
        gsap.to(img, { scale: 1.1, duration: 0.5, ease: 'power2.out' });
      });

      imgWrap.addEventListener('pointermove', function (e) {
        if (!bounds) return;
        var mx = (e.clientX - bounds.left) / bounds.width - 0.5;
        var my = (e.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(img, {
          x: mx * 20,
          y: my * 15,
          duration: 0.5,
          ease: 'power2.out'
        });
      });

      imgWrap.addEventListener('pointerleave', function () {
        gsap.to(img, { scale: 1, x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
      });
    });
  }

  // ── Button Ripple Effect ─────────────────────────────────
  function initButtonRipples() {
    qsa('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple-circle';
        var size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);

        gsap.to(ripple, {
          scale: 1,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: function () { ripple.remove(); }
        });
      });
    });
  }

  // ── Magnetic Nav Links ───────────────────────────────────
  function initMagneticNavLinks() {
    if (isTouchDevice) return;

    qsa('.nav__link').forEach(function (link) {
      var bounds;

      link.addEventListener('pointerenter', function () {
        bounds = link.getBoundingClientRect();
      });

      link.addEventListener('pointermove', function (e) {
        if (!bounds) return;
        var x = e.clientX - bounds.left - bounds.width / 2;
        var y = e.clientY - bounds.top - bounds.height / 2;

        gsap.to(link, {
          x: x * 0.2,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      link.addEventListener('pointerleave', function () {
        gsap.to(link, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  // ── Text Character Split Reveal ──────────────────────────
  function initCharSplit() {
    qsa('.char-split').forEach(function (el) {
      var text = el.textContent;
      el.innerHTML = '';
      text.split('').forEach(function (char) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
      });

      gsap.from(el.querySelectorAll('.char'), {
        opacity: 0,
        y: 30,
        rotateX: -60,
        stagger: 0.025,
        duration: 0.6,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  // ── Word Split Reveal ────────────────────────────────────
  function initWordSplit() {
    qsa('.word-split').forEach(function (el) {
      var text = el.textContent;
      el.innerHTML = '';
      text.split(' ').forEach(function (word, i) {
        var outer = document.createElement('span');
        outer.className = 'word';
        var inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = word;
        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < text.split(' ').length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      gsap.from(el.querySelectorAll('.word-inner'), {
        y: '110%',
        stagger: 0.04,
        duration: 0.7,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  // ── Scroll Section Indicators ────────────────────────────
  function initScrollIndicators() {
    var indicators = qs('.scroll-indicators');
    if (!indicators) return;

    var dots = qsa('.scroll-indicator-dot', indicators);
    var sections = qsa('[data-section-id]');

    sections.forEach(function (section, i) {
      if (!dots[i]) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: function () {
          dots.forEach(function (d) { d.classList.remove('active'); });
          dots[i].classList.add('active');
        },
        onEnterBack: function () {
          dots.forEach(function (d) { d.classList.remove('active'); });
          dots[i].classList.add('active');
        }
      });

      dots[i].addEventListener('click', function () {
        gsap.to(window, {
          scrollTo: { y: section, offsetY: 80 },
          duration: 1,
          ease: 'power3.inOut'
        });
      });
    });
  }

  // ── Decorative Shape Rotation on Scroll ──────────────────
  function initScrollRotation() {
    qsa('.rotate-on-scroll').forEach(function (el) {
      gsap.to(el, {
        rotation: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2
        }
      });
    });
  }

  // ── Testimonial Cards Stagger from Scroll ────────────────
  function initTestimonialScroll() {
    var testimonials = qsa('.testimonial-card');
    if (testimonials.length < 2) return;

    testimonials.forEach(function (card, i) {
      gsap.from(card, {
        y: 50 + i * 20,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true
        }
      });
    });
  }

  // ── Section Color Shift on Scroll ────────────────────────
  function initSectionColorShift() {
    qsa('[data-bg-shift]').forEach(function (section) {
      var target = section.getAttribute('data-bg-shift');
      gsap.to(section, {
        background: target,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: true
        }
      });
    });
  }

  // ── Enhanced Counter with Glow ───────────────────────────
  function initEnhancedCounters() {
    qsa('.stat-card').forEach(function (card) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          card.classList.add('is-counting');
          gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
          });
          setTimeout(function () {
            card.classList.remove('is-counting');
          }, 2200);
        }
      });
    });
  }

  // ── Horizontal Scroll Track ──────────────────────────────
  function initHorizontalScroll() {
    var track = qs('.h-scroll-track');
    if (!track) return;

    var section = track.closest('.h-scroll-section');
    if (!section) return;

    var cards = qsa('.h-scroll-card', track);
    if (cards.length < 2) return;

    var totalWidth = 0;
    cards.forEach(function (c) {
      totalWidth += c.offsetWidth + parseFloat(getComputedStyle(track).gap || 0);
    });

    gsap.to(track, {
      x: function () { return -(totalWidth - window.innerWidth + 100); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + (totalWidth - window.innerWidth + 100); },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
  }

  // ── Footer Reveal ────────────────────────────────────────
  function initFooterReveal() {
    var footer = qs('.footer');
    if (!footer) return;

    var links = qsa('.footer__link', footer);
    gsap.from(links, {
      y: 20,
      opacity: 0,
      stagger: 0.04,
      duration: 0.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
        once: true
      }
    });
  }

  // ── Section Headings Parallax ────────────────────────────
  function initHeadingParallax() {
    qsa('.section__title').forEach(function (title) {
      gsap.to(title, {
        y: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: title,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // ── Master Initialization ────────────────────────────────
  function init() {
    if (prefersReducedMotion) {
      qsa('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      initNav();
      return;
    }

    // Core
    initMouseTracking();
    initCursorFollower();
    initScrollProgress();
    initNav();

    // Micro-interactions
    initMagneticButtons();
    initMagneticNavLinks();
    initButtonRipples();
    initCardTilt();
    initImagePanOnHover();

    // Scroll-driven effects
    initOrbParallax();
    initHeroPinned();
    initHeroReveal();
    initRevealAnimations();
    initNeonDividers();
    initCounters();
    initEnhancedCounters();
    initSectionParallax();
    initParallaxImages();
    initScrollSkew();
    initScrollRotation();
    initHeadingParallax();

    // Content reveals
    initCharSplit();
    initWordSplit();
    initImageReveals();
    initTestimonialScroll();
    initCTABanner();
    initTimeline();
    initFormInteractions();
    initFeatureRows();
    initBlogCardInteractions();
    initFooterReveal();

    // Structural
    initHorizontalScroll();
    initScrollIndicators();
    initSectionColorShift();
    initParticles();
    initResponsive();

    // Refresh after all init
    ScrollTrigger.refresh();
  }

  // ── Language Change Handler ─────────────────────────────
  window.addEventListener('langchange', function () {
    // Kill all existing ScrollTriggers
    ScrollTrigger.getAll().forEach(function (st) { st.kill(); });

    // Reset reveal elements to their initial hidden state so they can re-animate
    qsa('.reveal-up').forEach(function (el) {
      gsap.set(el, { opacity: 0, y: 60 });
    });
    qsa('.reveal-left').forEach(function (el) {
      gsap.set(el, { opacity: 0, x: dirX(-60) });
    });
    qsa('.reveal-right').forEach(function (el) {
      gsap.set(el, { opacity: 0, x: dirX(60) });
    });
    qsa('.reveal-scale').forEach(function (el) {
      gsap.set(el, { opacity: 0, scale: 0.85 });
    });
    qsa('.reveal-fade').forEach(function (el) {
      gsap.set(el, { opacity: 0 });
    });

    // Re-run init to rebind all scroll-driven animations with correct direction
    requestAnimationFrame(function () {
      init();
    });
  });

  // Wait for fonts + DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(init);
    });
  } else {
    requestAnimationFrame(init);
  }

})();
