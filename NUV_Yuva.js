// NUV_Yuva.js — Full interactive script
// - toggleMobileMenu available globally for inline HTML onclick
// - ripple, CTA pulse, tilt, hero parallax, confetti, countdown
// - registration modal appears 5s after load (every load)
// - committee pyramid builder + mobile accordion
// - reduced-motion respect

/* global window, document, requestAnimationFrame */

(function () {
  const NAVBAR_HEIGHT = 64;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // shorthand selectors
  const q = (sel, ctx = document) => ctx.querySelector(sel);
  const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');
  const nowTs = () => Date.now();

  // ========== Loading Screen Handler ==========
  (function loadingScreen() {
    const loadingScreen = q('#loading-screen');
    const loadingBarFill = q('.loading-bar-fill');
    const loadingPercentage = q('.loading-percentage');
    const body = document.body;
    
    if (!loadingScreen || reduceMotion) {
      if (loadingScreen) loadingScreen.remove();
      return;
    }

    let progress = 0;
    const targetProgress = 100;
    const minDisplayTime = 1500; // Minimum time to show loading screen (1.5s)
    const startTime = Date.now();

    // Simulate loading progress
    function updateProgress() {
      if (progress >= targetProgress) return;
      
      // Calculate progress based on actual page load
      const resources = performance.getEntriesByType('resource');
      const totalResources = resources.length;
      const loadedResources = resources.filter(r => r.duration > 0).length;
      const resourceProgress = totalResources > 0 ? (loadedResources / totalResources) * 80 : 0;
      
      // Combine with time-based progress
      const timeProgress = Math.min(30, ((Date.now() - startTime) / minDisplayTime) * 30);
      progress = Math.min(95, resourceProgress + timeProgress);
      
      if (loadingBarFill) loadingBarFill.style.width = progress + '%';
      if (loadingPercentage) loadingPercentage.textContent = Math.round(progress) + '%';
      
      requestAnimationFrame(updateProgress);
    }

    function hideLoadingScreen() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        progress = 100;
        if (loadingBarFill) loadingBarFill.style.width = '100%';
        if (loadingPercentage) loadingPercentage.textContent = '100%';
        
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          body.classList.remove('loading');
          
          // Remove loading screen from DOM after transition
          setTimeout(() => {
            loadingScreen.remove();
            // Trigger page entrance animations
            initPageAnimations();
          }, 600);
        }, 300);
      }, remaining);
    }

    // Start progress animation
    updateProgress();
    
    // Hide when page is fully loaded
    if (document.readyState === 'complete') {
      hideLoadingScreen();
    } else {
      window.addEventListener('load', hideLoadingScreen);
    }
  })();

  // ========== Enhanced Page Animations ==========
  function initPageAnimations() {
    if (reduceMotion) return;

    // Animate navbar on load
    const navbar = q('.navbar');
    if (navbar) {
      navbar.style.opacity = '0';
      navbar.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        navbar.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        navbar.style.opacity = '1';
        navbar.style.transform = 'translateY(0)';
      }, 100);
    }

    // Animate hero content
    const heroContent = q('.hero-content');
    if (heroContent) {
      const elements = heroContent.querySelectorAll('.badge, h1, .subtitle, p, .event-details, .countdown, .btn-group');
      elements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 200 + (i * 100));
      });
    }

    // Add scroll-triggered animations to sections
    const sections = qa('section');
    sections.forEach((section, index) => {
      section.classList.add('animate-on-scroll', 'fade-in-up');
      
      // Alternate slide directions for visual interest
      if (index % 2 === 0) {
        section.classList.add('slide-in-left');
      } else {
        section.classList.add('slide-in-right');
      }
    });

    // Animate section titles
    const sectionTitles = qa('.section-title');
    sectionTitles.forEach((title, i) => {
      title.style.opacity = '0';
      title.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        title.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, 300 + (i * 150));
    });

    // Enhanced scroll reveal for all animated elements - OPTIMIZED
    let scrollTimeout;
    let lastScrollTime = 0;
    const SCROLL_THROTTLE = 100; // Throttle to 100ms
    
    function revealOnScroll() {
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_THROTTLE) {
        return;
      }
      lastScrollTime = now;
      
      const elements = qa('.animate-on-scroll, .events-grid > *, .gallery > *, .committee-grid > *');
      const windowHeight = window.innerHeight;
      
      elements.forEach((el) => {
        if (el.classList.contains('animated')) return;
        
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < windowHeight - 100 && rect.bottom > 0;
        
        if (isVisible) {
          el.classList.add('animated');
          
          // Simplified stagger effect
          if (el.parentElement && (el.parentElement.classList.contains('events-grid') || 
              el.parentElement.classList.contains('gallery') || 
              el.parentElement.classList.contains('committee-grid'))) {
            const siblings = Array.from(el.parentElement.children);
            const index = siblings.indexOf(el);
            el.style.transitionDelay = `${Math.min(index * 0.05, 0.3)}s`;
          }
        }
      });
    }

    // Animate footer when it comes into view - OPTIMIZED
    const footer = q('footer');
    if (footer) {
      let footerChecked = false;
      function checkFooter() {
        if (footerChecked) return;
        const rect = footer.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          footer.classList.add('animated');
          footerChecked = true;
        }
      }
      checkFooter();
      // Throttled scroll listener
      let footerScrollTimeout;
      window.addEventListener('scroll', () => {
        if (footerScrollTimeout) return;
        footerScrollTimeout = setTimeout(() => {
          checkFooter();
          footerScrollTimeout = null;
        }, SCROLL_THROTTLE);
      }, { passive: true });
    }

    // Initial check and throttled scroll listener
    revealOnScroll();
    let scrollRAF;
    window.addEventListener('scroll', () => {
      if (scrollRAF) return;
      scrollRAF = requestAnimationFrame(() => {
        revealOnScroll();
        scrollRAF = null;
      });
    }, { passive: true });
    window.addEventListener('resize', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(revealOnScroll, 150);
    }, { passive: true });
  }

  // ========== Global mobile menu toggle (exposed for inline onclick) ==========
  window.toggleMobileMenu = function toggleMobileMenu() {
    const nav = q('#mobileNav');
    const btn = q('.mobile-menu');
    if (!nav) return;
    const isActive = nav.classList.toggle('active');
    nav.setAttribute('aria-hidden', String(!isActive));
    if (btn) btn.setAttribute('aria-expanded', String(isActive));
  };

  // small helper toast
  function showToast(msg, ms = 3000) {
    let el = q('.nuv-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'nuv-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), ms);
  }

  // create or show registration floating toast (non-modal)
  function showRegisterToast() {
    if (q('.nuv-register-toast')) return;
    const toast = document.createElement('div');
    toast.className = 'nuv-register-toast';
    toast.innerHTML = `
      <div class="toast-avatar">YU</div>
      <div class="toast-body">
        <div class="toast-title">Enjoying NUV Yuva?</div>
        <div class="toast-sub">Register to save your spot and get event reminders.</div>
      </div>
      <div class="toast-actions">
        <button class="btn maybe-btn">Maybe later</button>
        <button class="btn register-btn">Register now</button>
      </div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    // actions
    function removeToast() {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 320);
    }

    toast.querySelector('.maybe-btn').addEventListener('click', () => {
      removeToast();
    });

    toast.querySelector('.register-btn').addEventListener('click', () => {
      removeToast();
      const reg = q('#registration');
      if (reg) window.scrollTo({ top: reg.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT, behavior: 'smooth' });
      // optional confetti burst
      try { confetti(window.innerWidth / 2, window.innerHeight / 3); } catch (e) {}
    });
  }

  // ripple effect on .btn (pointer down)
  document.addEventListener('pointerdown', (ev) => {
    const btn = ev.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.2;
    span.style.width = span.style.height = size + 'px';
    span.style.left = (ev.clientX - rect.left - size / 2) + 'px';
    span.style.top = (ev.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(span);
    requestAnimationFrame(() => span.style.transform = 'scale(1)');
    setTimeout(() => span.remove(), 700);
  });

  // CTA pulse (only when visible)
  (function ctaPulse() {
    const cta = q('.btn-primary');
    if (!cta || reduceMotion) return;
    function check() {
      const r = cta.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) cta.classList.add('pulse');
      else cta.classList.remove('pulse');
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
  })();

  // 3D tilt binding for card-like items
  function bindTilt(selector = '.tilt', { maxRotation = 12, scale = 1.02 } = {}) {
    if (reduceMotion) return;
    qa(selector).forEach((item) => {
      let inner = item.querySelector('.tilt-inner');
      if (!inner) {
        inner = document.createElement('div');
        inner.className = 'tilt-inner';
        while (item.firstChild) inner.appendChild(item.firstChild);
        item.appendChild(inner);
      }
      function onMove(e) {
        const rect = item.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) - 0.5;
        const py = ((e.clientY - rect.top) / rect.height) - 0.5;
        const rotY = px * maxRotation * -1;
        const rotX = py * maxRotation;
        inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
        item.style.transform = `perspective(1000px) translateZ(6px) scale(${scale})`;
      }
      function reset() {
        inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
        item.style.transform = '';
      }
      item.addEventListener('pointermove', onMove);
      item.addEventListener('pointerleave', reset);
      item.addEventListener('pointercancel', reset);
      item.addEventListener('pointerup', reset);
      item.addEventListener('focusin', () => item.style.transform = `perspective(1000px) translateZ(6px) scale(${scale})`);
      item.addEventListener('focusout', reset);
      if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
    });
  }

  // Bind tilt to event cards and member-card fallback
  bindTilt('.event-card', { maxRotation: 10, scale: 1.02 });
  bindTilt('.member-card', { maxRotation: 8, scale: 1.015 });

  // hero parallax subtle movement
  (function heroParallax() {
    const hero = q('.hero');
    if (!hero || reduceMotion) return;
    function move(e) {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const layers = qa('.hero-content, .hero-glow, .badge, .text-gradient');
      layers.forEach((el, i) => {
        const depth = (i + 1) * 4;
        el.style.transform = `translate3d(${px * depth}px, ${py * depth * 0.6}px, 0)`;
      });
    }
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', () => qa('.hero-content, .hero-glow, .badge, .text-gradient').forEach(el => el.style.transform = ''));
  })();

  // stagger reveal on scroll (for elements with .reveal or .reveal-stagger)
  function revealOnScroll() {
    const reveals = qa('.reveal, .reveal-stagger');
    if (!reveals.length) return;
    reveals.forEach(el => {
      if (el.classList.contains('revealed')) return;
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || document.documentElement.clientHeight) - 80) {
        if (el.classList.contains('reveal-stagger')) {
          const children = Array.from(el.children);
          children.forEach((c, i) => {
            c.style.transition = `opacity 520ms cubic-bezier(.2,.9,.3,1) ${(i * 80)}ms, transform 520ms ${(i * 80)}ms`;
            c.style.opacity = 0;
            requestAnimationFrame(() => {
              c.style.opacity = 1;
              c.style.transform = 'translateY(0)';
            });
          });
        } else {
          el.classList.add('revealed');
        }
      }
    });
  }
  // Removed duplicate scroll listener - already handled in initPageAnimations

  // lightweight confetti canvas
  function createConfettiCanvas() {
    const c = document.createElement('canvas');
    c.id = 'nuv-confetti';
    c.style.position = 'fixed';
    c.style.left = '0';
    c.style.top = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.pointerEvents = 'none';
    c.style.zIndex = 6000;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    function fit() {
      const dpr = window.devicePixelRatio || 1;
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    addEventListener('resize', fit);
    return { c, ctx };
  }

  const confetti = (function () {
    if (reduceMotion) return () => { };
    const { c, ctx } = createConfettiCanvas();
    let particles = [];
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function spawn(x = innerWidth / 2, y = innerHeight / 2, count = 40) {
      const colors = ['#F3E5A8', '#CC604B', '#95586A', '#2F6E6A', '#62775B'];
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          w: rand(6, 12), h: rand(6, 12),
          vx: rand(-6, 6), vy: rand(-10, -2),
          r: rand(0, 360), vr: rand(-8, 8),
          color: colors[Math.floor(Math.random() * colors.length)],
          life: rand(120, 220)
        });
      }
    }
    let raf = null;
    function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles.forEach((p, i) => {
        p.vy += 0.35;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.life--;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      particles = particles.filter(p => p.life > 0 && p.y < innerHeight + 50);
      if (particles.length) raf = requestAnimationFrame(loop);
      else { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    return function burst(atX, atY) {
      spawn(atX, atY, 48);
      if (!raf) raf = requestAnimationFrame(loop);
    };
  })();

  // bind confetti to CTA clicks for visual delight
  qa('.btn-primary, .btn.cta, .btn-primary.cta').forEach(b => {
    b.addEventListener('click', (ev) => {
      const rect = b.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      try { confetti(cx, cy); } catch (e) { /* ignore */ }
    });
  });

  // ================= Registration Modal shown 5s after load (every load) =================
  (function registrationModalAfter5s() {
    if (reduceMotion) return;
    function createModal() {
      if (q('#nuv-modal')) return;
      // backdrop
      const backdrop = document.createElement('div');
      backdrop.id = 'nuv-modal-backdrop';
      backdrop.style.position = 'fixed';
      backdrop.style.left = '0';
      backdrop.style.top = '0';
      backdrop.style.width = '100%';
      backdrop.style.height = '100%';
      backdrop.style.background = 'rgba(0,0,0,0.6)';
      backdrop.style.backdropFilter = 'blur(4px)';
      backdrop.style.zIndex = 7000;
      backdrop.style.opacity = '0';
      backdrop.style.transition = 'opacity .28s ease';
      document.body.appendChild(backdrop);

      // modal container
  const modal = document.createElement('div');
  modal.id = 'nuv-modal';
  modal.style.position = 'fixed';
  modal.style.left = '50%';
  modal.style.top = '50%';
  modal.style.transform = 'translate(-50%,-50%) scale(.98)';
  modal.style.minWidth = '320px';
  modal.style.maxWidth = '520px';
  modal.style.background = 'rgba(12, 20, 18, 0.8)';
  modal.style.border = '1px solid rgba(255, 255, 255, 0.12)';
  modal.style.borderRadius = '22px';
  modal.style.padding = '1.4rem 1.6rem';
  modal.style.boxShadow = '0 25px 70px rgba(0,0,0,0.55)';
  modal.style.backdropFilter = 'blur(28px) saturate(160%)';
  modal.style.WebkitBackdropFilter = 'blur(28px) saturate(160%)';
  modal.style.zIndex = 7001;
  modal.style.opacity = '0';
  modal.style.transition = 'opacity .28s ease, transform .28s cubic-bezier(.2,.9,.3,1)';

      modal.innerHTML = `
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:62px;height:62px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--primary),var(--accent));color:white;font-weight:800;font-size:1.1rem;box-shadow:0 14px 32px rgba(0,0,0,0.35)">YU</div>
          <div style="min-width:0">
            <div style="font-weight:800;font-size:1.15rem;color:#fff;margin-bottom:6px">Enjoying NUV Yuva?</div>
            <div style="color:rgba(255,255,255,0.78);font-size:.98rem">Register to save your spot and get event reminders.</div>
          </div>
        </div>
        <div style="display:flex;gap:.8rem;justify-content:flex-end;margin-top:1.4rem">
          <button id="nuv-modal-close" class="btn btn-secondary">Maybe later</button>
          <button id="nuv-modal-register" class="btn btn-primary">Register now</button>
        </div>
      `;
      document.body.appendChild(modal);

      // show
      requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%,-50%) scale(1)';
      });

      // actions
      q('#nuv-modal-close').addEventListener('click', () => {
        backdrop.style.opacity = '0';
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%,-50%) scale(.98)';
        setTimeout(() => { backdrop.remove(); modal.remove(); }, 280);
      });
      q('#nuv-modal-register').addEventListener('click', () => {
        backdrop.style.opacity = '0';
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%,-50%) scale(.98)';
        setTimeout(() => { backdrop.remove(); modal.remove(); }, 280);
        const reg = q('#registration');
        if (reg) window.scrollTo({ top: reg.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT, behavior: 'smooth' });
        try { confetti(window.innerWidth / 2, window.innerHeight / 3); } catch (e) {}
      });

      // close modal with Escape
      function onKey(e) { if (e.key === 'Escape') { backdrop.remove(); modal.remove(); document.removeEventListener('keydown', onKey); } }
      document.addEventListener('keydown', onKey);
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        createModal();
        // also show non-modal toast at lower left so footer doesn't overlap
        showRegisterToast();
      }, 5000);
    });
  })();

  // Navbar background on scroll - OPTIMIZED with throttling
  const navbar = q('.navbar');
  if (navbar) {
    let navbarScrollTimeout;
    let lastScrollY = window.scrollY;
    function updateNavbar() {
      if (!navbar) return;
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 10) return; // Skip if scroll is minimal
      lastScrollY = currentScrollY;
      
      if (currentScrollY > 50) navbar.classList.add('nuv-scrolled');
      else navbar.classList.remove('nuv-scrolled');
    }
    updateNavbar();
    window.addEventListener('scroll', () => {
      if (navbarScrollTimeout) return;
      navbarScrollTimeout = requestAnimationFrame(() => {
        updateNavbar();
        navbarScrollTimeout = null;
      });
    }, { passive: true });
  }

  // Smooth scroll for same-page anchors
  qa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (ev) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
      // close mobile menu if open
      const mobileNav = q('#mobileNav');
      if (mobileNav && mobileNav.classList.contains('active')) toggleMobileMenu();
    });
  });

  // Countdown (updates every second)
  (function countdown() {
    const daysEl = q('#days'), hoursEl = q('#hours'), minutesEl = q('#minutes'), secondsEl = q('#seconds'), countdownWrapper = q('#countdown');
    if (!(daysEl && hoursEl && minutesEl && secondsEl && countdownWrapper)) return;
    const EVENT_TS = new Date('2026-02-06T00:00:00').getTime();
    function tick() {
      const diff = Math.max(0, EVENT_TS - nowTs());
      if (diff <= 0) {
        clearInterval(window._nuy_countdown);
        countdownWrapper.innerHTML = '<h2 class="text-gradient" style="margin:0">The Event Has Started!</h2>';
        return;
      }
      const sec = Math.floor(diff / 1000);
      const days = Math.floor(sec / (3600 * 24));
      const hours = Math.floor((sec % (3600 * 24)) / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;
      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }
    tick();
    window._nuy_countdown = setInterval(tick, 1000);
  })();

  // graceful startup: hero glow and reveal grid items
  window.addEventListener('load', () => {
    // add hero glow if absent
    if (!q('.hero-glow') && q('.hero')) {
      const g = document.createElement('div'); g.className = 'hero-glow'; q('.hero').appendChild(g);
      // add a few lightweight sparklers (reduced for smoother performance)
      if (!reduceMotion) {
        const sparkCount = 4;
        for (let i = 0; i < sparkCount; i++) {
          const s = document.createElement('div');
          s.className = 'sparkle';
          s.style.left = `${15 + Math.random() * 70}%`;
          s.style.bottom = `${15 + Math.random() * 50}%`;
          s.style.width = `${5 + Math.random() * 6}px`;
          s.style.height = `${5 + Math.random() * 6}px`;
          s.style.animationDuration = `${6 + Math.random() * 6}s`;
          q('.hero').appendChild(s);
        }
      }
    }

    // global enchanted sparkles drifting across the page
    if (!reduceMotion && !q('.forest-sparkles')) {
      const layer = document.createElement('div');
      layer.className = 'forest-sparkles';
      const count = window.innerWidth < 768 ? 14 : 28;
      for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'forest-sparkle';
        const size = 3 + Math.random() * 6;
        sparkle.style.setProperty('--sparkle-size', `${size}px`);
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 8}s`;
        sparkle.style.setProperty('--sparkle-duration', `${6 + Math.random() * 8}s`);
        layer.appendChild(sparkle);
      }
      document.body.appendChild(layer);
    }

    // add tilt marker classes to be used by bindTilt
    qa('.event-card, .member-card').forEach(el => el.classList.add('tilt'));

    // show welcome toast (only after loading screen is gone)
    setTimeout(() => {
      if (!q('#loading-screen')) {
        showToast('Welcome to NUV Yuva — explore & register!', 2600);
      }
    }, 2500);
  });

  // ========== Committee pyramid builder ==========
  (function buildCommitteePyramid() {
    function run() {
      const oldGrid = document.querySelector('.committee-grid');
      if (!oldGrid || oldGrid.dataset.pyramid === '1') return;
      const cards = Array.from(oldGrid.querySelectorAll('.member-card'));
      if (!cards.length) return;

      // group members by role
      const groups = {};
      cards.forEach(card => {
        const nameEl = card.querySelector('.member-name');
        const roleEl = card.querySelector('.member-role');
        const name = nameEl ? nameEl.textContent.trim() : (card.textContent || '').trim();
        const role = roleEl ? roleEl.textContent.trim() : 'Other';
        if (!groups[role]) groups[role] = [];
        groups[role].push({ name, rawEl: card });
      });

      // role -> level mapping (editable)
      const roleToLevel = {
        'President': 0,
        'Vice President': 1,
        'Secretary': 2,
        'Treasurer': 2,
        'Cultural Head': 3,
        'Student Welfare': 3,
        'Marketing Head': 3,
        'Outreach Head': 4,
        'Design Head': 4,
        'Content Head': 4,
        'E-Sports Head': 4,
        'Decoration Head': 5,
        'Social Media Head': 5,
        'Media Head': 5,
        'Technical Head': 5
      };

      // compute rows by level for present roles
      const presentRoles = Object.keys(groups);
      const rowsMap = {};
      presentRoles.forEach(r => {
        const lvl = roleToLevel.hasOwnProperty(r) ? roleToLevel[r] : 6;
        rowsMap[lvl] = rowsMap[lvl] || [];
        rowsMap[lvl].push(r);
      });

      const levels = Object.keys(rowsMap).map(Number).sort((a, b) => a - b);
      const pyramid = document.createElement('div');
      pyramid.className = 'committee-pyramid';

      function initialsOf(name) {
        if (!name) return '';
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
      }

      levels.forEach(level => {
        const row = document.createElement('div');
        row.className = `pyramid-row level-${level}`;
        if (level === levels[0]) row.classList.add('top');
        const roles = rowsMap[level];

        // center heavier groups: sort by descending group size
        roles.sort((a, b) => (groups[b].length - groups[a].length));

        roles.forEach(role => {
          const people = groups[role];
          const frame = document.createElement('div');
          frame.className = 'committee-frame';
          if (people.length > 3) frame.classList.add('compact');

          const roleEl = document.createElement('div');
          roleEl.className = 'committee-role';
          if (level === 0) roleEl.classList.add('crown');
          roleEl.textContent = role;
          frame.appendChild(roleEl);

          const list = document.createElement('div');
          list.className = 'committee-list';
          people.forEach(p => {
            const item = document.createElement('div');
            item.className = 'committee-person';
            item.innerHTML = `<div class="person-avatar" aria-hidden="true">${initialsOf(p.name)}</div><div><div class="person-name">${p.name}</div></div>`;
            list.appendChild(item);
          });

          frame.appendChild(list);
          row.appendChild(frame);
        });

        pyramid.appendChild(row);
      });

      oldGrid.parentNode.replaceChild(pyramid, oldGrid);
      pyramid.dataset.pyramid = '1';

      // reveal frames
      const frames = pyramid.querySelectorAll('.committee-frame');
      frames.forEach((f, i) => setTimeout(() => f.classList.add('reveal', 'revealed'), 120 + i * 90));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  })();

  // ========== mobile accordion for frames ==========
  (function committeeAccordionMobile() {
    // Disabled: All committee members are always visible on mobile
    // Previously this created accordion/dropdown functionality
    function setup() {
      // Remove any existing collapsed classes and toggle buttons on mobile
      if (window.innerWidth <= 860) {
        const frames = Array.from(document.querySelectorAll('.committee-frame'));
        frames.forEach(frame => {
          // Remove collapsed class to ensure visibility
          frame.classList.remove('collapsed');
          // Remove any existing toggle buttons
          const toggleBtn = frame.querySelector('.committee-toggle');
          if (toggleBtn) toggleBtn.remove();
          // Ensure committee lists are visible
          const list = frame.querySelector('.committee-list');
          if (list) {
            list.style.maxHeight = '';
            list.style.overflow = 'visible';
          }
        });
      }
    }
    window.addEventListener('load', setup);
    window.addEventListener('resize', () => { clearTimeout(window.__committeeResize); window.__committeeResize = setTimeout(setup, 220); });  
  })();

  // Accessibility helper: add aria attributes to mobile menu button
  (function ensureMobileAria() {
    const mobileBtn = q('.mobile-menu');
    if (!mobileBtn) return;
    if (!mobileBtn.hasAttribute('aria-controls')) mobileBtn.setAttribute('aria-controls', 'mobileNav');
    if (!mobileBtn.hasAttribute('aria-expanded')) mobileBtn.setAttribute('aria-expanded', 'false');
  })();

  // ========== Hero Spotlight Effect ==========
  (function heroSpotlight() {
    const hero = q('.hero');
    if (!hero || reduceMotion) return;

    let rafId = null;
    let isMouseOver = false;

    // Debounced pointer tracking
    const updateSpotlight = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update CSS variables for spotlight position
      hero.style.setProperty('--spotlight-x', x + 'px');
      hero.style.setProperty('--spotlight-y', y + 'px');
    };

    hero.addEventListener('mouseenter', () => {
      isMouseOver = true;
      hero.classList.add('spotlight-active');
      // set base spotlight brightness and size
      hero.style.setProperty('--spotlight-brightness', '0.22');
      hero.style.setProperty('--spot-size', window.innerWidth < 640 ? '220px' : '320px');
    });

    // increase brightness while pressing (felt intensity)
    hero.addEventListener('pointerdown', () => {
      hero.style.setProperty('--spotlight-brightness', '0.45');
    });

    hero.addEventListener('pointerup', () => {
      if (isMouseOver) hero.style.setProperty('--spotlight-brightness', '0.22');
    });

    hero.addEventListener('pointercancel', () => {
      if (isMouseOver) hero.style.setProperty('--spotlight-brightness', '0.22');
    });

    hero.addEventListener('mousemove', (e) => {
      if (!isMouseOver) return;

      // Cancel previous rAF and schedule new one
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateSpotlight(e);
      });
    });

    hero.addEventListener('mouseleave', () => {
      isMouseOver = false;
      hero.classList.remove('spotlight-active');
      if (rafId) cancelAnimationFrame(rafId);
      // hide spotlight
      hero.style.setProperty('--spotlight-brightness', '0');
    });

    // Keyboard focus: center spotlight and show subtle brightness
    hero.addEventListener('focusin', () => {
      hero.style.setProperty('--spotlight-x', '50%');
      hero.style.setProperty('--spotlight-y', '50%');
      hero.style.setProperty('--spotlight-brightness', '0.18');
      hero.classList.add('spotlight-active');
    });

    hero.addEventListener('focusout', () => {
      hero.style.setProperty('--spotlight-brightness', '0');
      hero.classList.remove('spotlight-active');
    });
  })();

  // ================= Registration Color Splash =================
  (function registrationSplash() {
    const containers = qa('.color-splash');
    if (!containers.length || reduceMotion) return;

    containers.forEach((el) => {
      if (el.dataset.rsInit === 'true') return;
      el.dataset.rsInit = 'true';

      let raf = null;
      let last = null;
      const DEFAULT_SIZE = window.innerWidth < 640 ? 220 : 300;

      el.style.setProperty('--rs-size', DEFAULT_SIZE + 'px');
      el.style.setProperty('--rs-opacity', '0');
      // Allow customizing splash color via data attribute - data-rs
      if (el.dataset.rs) {
        el.style.setProperty('--rs-color', el.dataset.rs);
      }
      if (el.dataset.rs2) {
        el.style.setProperty('--rs-color2', el.dataset.rs2);
      }

      function applyVars(pos) {
        el.style.setProperty('--rs-x', pos.x + 'px');
        el.style.setProperty('--rs-y', pos.y + 'px');
      }

      function onPointerEnter(e) {
        el.classList.add('splash-active');
        el.style.setProperty('--rs-opacity', '1');
        enqueue(e);
      }

      function onPointerMove(e) {
        enqueue(e);
      }

      function onPointerDown(e) {
        el.style.setProperty('--rs-size', (DEFAULT_SIZE * 1.2) + 'px');
      }

      function onPointerUp(e) {
        el.style.setProperty('--rs-size', DEFAULT_SIZE + 'px');
      }

      function onPointerLeave() {
        el.classList.remove('splash-active');
        el.style.setProperty('--rs-opacity', '0');
      }

      function enqueue(e) {
        last = {
          x: e.clientX - el.getBoundingClientRect().left,
          y: e.clientY - el.getBoundingClientRect().top
        };
        if (raf) return;
        raf = requestAnimationFrame(() => {
          applyVars(last);
          raf = null;
        });
      }

      // Touch fallback: animate a static splash on touchstart
      el.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        el.style.setProperty('--rs-x', (t.clientX - el.getBoundingClientRect().left) + 'px');
        el.style.setProperty('--rs-y', (t.clientY - el.getBoundingClientRect().top) + 'px');
        el.style.setProperty('--rs-opacity', '1');
      }, { passive: true });

      el.addEventListener('touchend', () => {
        el.style.setProperty('--rs-opacity', '0');
      });

      // Desktop pointer events
      el.addEventListener('pointerenter', onPointerEnter);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointerleave', onPointerLeave);

      // keyboard focus support
      el.addEventListener('focusin', () => {
        el.classList.add('splash-active');
        el.style.setProperty('--rs-opacity', '1');
        el.style.setProperty('--rs-x', '50%');
        el.style.setProperty('--rs-y', '50%');
      });
      el.addEventListener('focusout', () => {
        el.classList.remove('splash-active');
        el.style.setProperty('--rs-opacity', '0');
      });
    });
  })();

  // No longer needed — registration form removed from HTML

  // Respect reduced motion: remove heavy effects if user prefers reduced motion
  if (reduceMotion) {
    // quick cleanup: remove many animated classes if present
    qa('.hero-glow, .sparkle').forEach(el => el.remove());
  }

  // ================= Fancy Button: Splash + Shimmer + Burst =================
  (function bindFancyButtons() {
    if (reduceMotion) return;
    const buttons = qa('.liquid-btn.with-splash');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      if (btn.dataset.splashInit === '1') return;
      btn.dataset.splashInit = '1';
      let raf = null;
      let lastPos = { x: 0, y: 0 };

      function setVars(x, y) {
        btn.style.setProperty('--btn-x', x + 'px');
        btn.style.setProperty('--btn-y', y + 'px');
      }

      function onPointerMove(e) {
        const rect = btn.getBoundingClientRect();
        lastPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        if (raf) return;
        raf = requestAnimationFrame(() => {
          setVars(lastPos.x, lastPos.y);
          raf = null;
        });
      }

      function onPointerEnter(e) {
        btn.classList.add('splash-active');
        btn.style.setProperty('--btn-splash-opacity', '1');
        onPointerMove(e);
      }

      function onPointerLeave() {
        btn.classList.remove('splash-active');
        btn.style.setProperty('--btn-splash-opacity', '0');
      }

      function burstParticles(ev, count = 14) {
        const rect = btn.getBoundingClientRect();
        const cx = (ev && ev.clientX) ? (ev.clientX - rect.left) : rect.width / 2;
        const cy = (ev && ev.clientY) ? (ev.clientY - rect.top) : rect.height / 2;
        for (let i = 0; i < count; i++) {
          const p = document.createElement('span');
          p.className = 'liquid-btn-particle';
          const size = 6 + Math.round(Math.random() * 8);
          p.style.width = p.style.height = size + 'px';
          p.style.left = cx - size / 2 + 'px';
          p.style.top = cy - size / 2 + 'px';
          // random color choices biased to theme
          const colors = ['#F3E5A8', '#CC604B', '#95586A', '#2F6E6A', '#62775B'];
          p.style.background = colors[Math.floor(Math.random() * colors.length)];
          btn.appendChild(p);

          // animate out
          requestAnimationFrame(() => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 28 + Math.random() * 48;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - (6 + Math.random() * 10);
            p.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${0.6 + Math.random() * 0.9})`;
            p.style.opacity = '0';
          });

          // cleanup
          setTimeout(() => p.remove(), 620 + Math.random() * 240);
        }
      }

      // pointer down intensifies splash and triggers burst
      btn.addEventListener('pointerdown', (ev) => {
        btn.style.setProperty('--btn-splash-size', '220px');
        burstParticles(ev, 18);
      });
      btn.addEventListener('pointerup', () => {
        btn.style.setProperty('--btn-splash-size', '160px');
      });

      // pointer events for tracking
      btn.addEventListener('pointermove', onPointerMove);
      btn.addEventListener('pointerenter', onPointerEnter);
      btn.addEventListener('pointerleave', onPointerLeave);

      // touch support (touchstart sets position)
      btn.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        const r = btn.getBoundingClientRect();
        setVars(t.clientX - r.left, t.clientY - r.top);
        btn.style.setProperty('--btn-splash-opacity', '1');
        burstParticles({ clientX: t.clientX, clientY: t.clientY }, 16);
      }, { passive: true });

      btn.addEventListener('touchend', () => {
        btn.style.setProperty('--btn-splash-opacity', '0');
      });

      // keyboard accessibility: space/enter triggers burst and brief splash
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // center splash
          const rect = btn.getBoundingClientRect();
          setVars(rect.width / 2, rect.height / 2);
          btn.style.setProperty('--btn-splash-opacity', '1');
          burstParticles(null, 18);
          setTimeout(() => btn.style.setProperty('--btn-splash-opacity', '0'), 420);
        }
      });
    });
  })();

})();

/* Color splash follow — minimal, opt-in behavior for .splash-follow buttons */
(function attachSplashFollow(selector = '.liquid-btn.with-splash.splash-follow') {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function init() {
    const buttons = Array.from(document.querySelectorAll(selector));
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      let rafId = null;
      let prev = { x: null, y: null };

      // initialize safe defaults
      btn.style.setProperty('--x', '50%');
      btn.style.setProperty('--y', '50%');
      btn.style.setProperty('--dx', '0');
      btn.style.setProperty('--dy', '0');

      if (reduceMotion) return; // avoid motion for reduced-motion users

      function scheduleUpdate(xPx, yPx, dx, dy) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          btn.style.setProperty('--x', `${Math.round(xPx)}px`);
          btn.style.setProperty('--y', `${Math.round(yPx)}px`);
          btn.style.setProperty('--dx', String(dx));
          btn.style.setProperty('--dy', String(dy));
              // compute rotation from directional delta so the streak aligns with motion
              const ang = Math.atan2(dy, dx) * 180 / Math.PI || 0;
              btn.style.setProperty('--rot', ang + 'deg');
          rafId = null;
        });
      }

      function onPointerMove(e) {
        const rect = btn.getBoundingClientRect();
        const x = clamp(e.clientX - rect.left, 0, Math.max(0, rect.width));
        const y = clamp(e.clientY - rect.top, 0, Math.max(0, rect.height));

        const dx = prev.x === null ? 0 : x - prev.x;
        const dy = prev.y === null ? 0 : y - prev.y;
        prev.x = x; prev.y = y;

        const cdx = clamp(Math.round(dx), -20, 20);
        const cdy = clamp(Math.round(dy), -20, 20);

        scheduleUpdate(x, y, cdx, cdy);
      }

      function onPointerLeave() {
        if (rafId) cancelAnimationFrame(rafId);
        btn.style.setProperty('--dx', '0');
        btn.style.setProperty('--dy', '0');
      }

      btn.addEventListener('pointerenter', onPointerMove, { passive: true });
      btn.addEventListener('pointermove', onPointerMove, { passive: true });
      btn.addEventListener('pointerleave', onPointerLeave, { passive: true });

      // keyboard accessibility: center splash
      btn.addEventListener('focus', () => {
        const w = btn.offsetWidth, h = btn.offsetHeight;
        scheduleUpdate(w / 2, h / 2, 0, 0);
      });
      btn.addEventListener('blur', () => { btn.style.setProperty('--dx', '0'); btn.style.setProperty('--dy', '0'); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ================= Registration Ribbon (pointer-attached glow) ================= */
(function initEnchantedRibbon(sectionSelector = '#registration', canvasSelector = '#registration-ribbon') {
  const section = document.querySelector(sectionSelector);
  const canvas = document.querySelector(canvasSelector);
  if (!section || !canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let dpr = window.devicePixelRatio || 1;
  let rafId = null;
  let pointerActive = false;
  let points = [];
  const MAX_POINTS = 60;
  const POINT_LIFE = 600; // ms

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = section.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function relativePoint(ev) {
    const point = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
    const rect = section.getBoundingClientRect();
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
      time: performance.now()
    };
  }

  function resetTrail(ev) {
    points = [relativePoint(ev)];
    pointerActive = true;
    scheduleDraw();
  }

  function addPoint(ev) {
    if (!pointerActive) {
      resetTrail(ev);
      return;
    }
    points.push(relativePoint(ev));
    trimPoints();
    scheduleDraw();
  }

  function trimPoints() {
    const now = performance.now();
    while (points.length && (now - points[0].time > POINT_LIFE || points.length > MAX_POINTS)) {
      points.shift();
    }
  }

  function stopTrail() {
    pointerActive = false;
    scheduleDraw();
  }

  function scheduleDraw() {
    if (rafId) return;
    rafId = requestAnimationFrame(draw);
  }

  function draw() {
    rafId = null;
    trimPoints();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length < 2) {
      if ((pointerActive || points.length) && !rafId) {
        scheduleDraw();
      }
      return;
    }

    const start = points[0];
    const end = points[points.length - 1];
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, 'rgba(12, 24, 20, 0.25)');
    gradient.addColorStop(0.35, 'rgba(18, 34, 30, 0.75)');
    gradient.addColorStop(1, 'rgba(15, 29, 26, 1)');

    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = gradient;
    ctx.shadowColor = 'rgba(10, 18, 15, 0.55)';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.shadowBlur = 35;
    ctx.fillStyle = 'rgba(15, 29, 26, 0.95)';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 7, 0, Math.PI * 2);
    ctx.fill();

    if (pointerActive || points.length) {
      scheduleDraw();
    }
  }

  function handlePointerEnter(ev) {
    resetTrail(ev);
  }

  function handlePointerMove(ev) {
    addPoint(ev);
  }

  section.addEventListener('pointerenter', handlePointerEnter, { passive: true });
  section.addEventListener('pointermove', handlePointerMove, { passive: true });
  section.addEventListener('pointerdown', handlePointerEnter, { passive: true });
  section.addEventListener('pointerup', handlePointerMove, { passive: true });
  section.addEventListener('pointerleave', stopTrail);
  section.addEventListener('pointercancel', stopTrail);

  section.addEventListener('touchstart', handlePointerEnter, { passive: true });
  section.addEventListener('touchmove', handlePointerMove, { passive: true });
  section.addEventListener('touchend', stopTrail, { passive: true });
  section.addEventListener('touchcancel', stopTrail, { passive: true });

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
})();