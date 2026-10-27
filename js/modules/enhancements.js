/* modules/enhancements.js — interaksi & animasi global: progress bar, header, reveal,
   counters, tilt, parallax, smooth anchor, menu drawer, lazy-load, nav aktif,
   copy-clipboard, footer year. Sebelumnya js/enhancements.js; search palette
   dipisah ke modules/search-palette.js. */

(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. READING PROGRESS BAR */
  function initReadingProgress() {
    if (document.getElementById('reading-progress')) return; /* idempotent */
    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.insertBefore(bar, document.body.firstChild);

    var ticking = false;
    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  }

  /* 2. HEADER GLASS EFFECT ON SCROLL */
  function initHeaderScroll() {
    var header = document.querySelector('header');
    if (!header) return;

    var lastScroll = 0;
    var ticking = false;

    function updateHeader() {
      var scrollY = window.pageYOffset;
      if (scrollY > 24) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader();
  }

  /* 3. SCROLL REVEAL ANIMATIONS (IntersectionObserver) */
  function initScrollReveal() {
    if (reduce || !('IntersectionObserver' in window)) {
      // Fallback: show everything
      document.querySelectorAll('[data-reveal],[data-reveal-stagger]').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.06
    });

    document.querySelectorAll('[data-reveal],[data-reveal-stagger]').forEach(function (el) {
      // Don't animate elements already in viewport on load
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });
  }

  /* 4. ANIMATED STAT COUNTERS */
  function animateCounter(el, target, duration, suffix) {
    if (reduce) { el.textContent = target + suffix; return; }
    var start = 0;
    var startTime = null;
    var isFloat = String(target).includes('.');

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = isFloat ? (eased * target).toFixed(1) : Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  function initStatCounters() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.dataset.countTarget || el.textContent.replace(/[^0-9.]/g, ''));
        var suffix = el.dataset.countSuffix || '';
        var duration = parseInt(el.dataset.countDuration || '1400', 10);
        if (!isNaN(target)) animateCounter(el, target, duration, suffix);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count-target]').forEach(function (el) {
      el.textContent = '0' + (el.dataset.countSuffix || '');
      observer.observe(el);
    });
  }

  /* 5. CARD 3D TILT EFFECT (mouse-tracking) */
  function initCardTilt() {
    if (reduce || window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.card-premium').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotY = x * 8;
        var rotX = -y * 6;
        card.style.transform = 'translateY(-6px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
        setTimeout(function () { card.style.transition = ''; }, 500);
      });
    });
  }

  /* 6. SMOOTH PARALLAX for hero background blobs */
  function initParallax() {
    if (reduce || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      requestAnimationFrame(function () {
        var scrollY = window.pageYOffset;
        /* Query tiap tick: konten SPA bisa bertukar, jangan kache NodeList */
        document.querySelectorAll('.parallax-blob').forEach(function (blob) {
          var speed = parseFloat(blob.dataset.speed || '0.15');
          blob.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        });
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* 7. AUTO-APPLY data-reveal to key elements (lets us animate without touching HTML manually) */
  function autoMarkRevealElements() {
    // Sections
    document.querySelectorAll('section:not([data-no-reveal])').forEach(function (el, i) {
      if (!el.hasAttribute('data-reveal') && !el.hasAttribute('data-reveal-stagger')) {
        // Check if already in viewport
        var rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.85) {
          el.setAttribute('data-reveal', '');
        }
      }
    });

    // Card grids — stagger children
    document.querySelectorAll('.grid > .bg-surface-container-lowest, .grid > .bg-primary-container').forEach(function (el) {
      if (!el.hasAttribute('data-reveal')) {
        var rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.9) {
          el.setAttribute('data-reveal', 'scale');
        }
      }
    });
  }

  /* 8. SMOOTH ANCHOR SCROLLING with offset for fixed header */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var headerH = 80; // fixed header height
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* 9. ENHANCED MOBILE MENU TOGGLE (drawer animation) */
  function initMobileMenu() {
    if (window.__saMenuWired) return; /* drawer ada di header persisten; cukup sekali */
    window.__saMenuWired = true;
    // The existing toggleMobileMenu() is already defined in HTML,
    // we enhance it with animation
    var drawer = document.getElementById('mobile-menu-drawer');
    if (!drawer) return;

    // Add transition styles
    drawer.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

    var origToggle = window.toggleMobileMenu;
    window.toggleMobileMenu = function () {
      var isHidden = drawer.classList.contains('hidden');
      if (isHidden) {
        drawer.classList.remove('hidden');
        drawer.style.opacity = '0';
        drawer.style.transform = 'translateY(-8px)';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            drawer.style.opacity = '1';
            drawer.style.transform = 'translateY(0)';
          });
        });
      } else {
        drawer.style.opacity = '0';
        drawer.style.transform = 'translateY(-8px)';
        setTimeout(function () {
          drawer.classList.add('hidden');
          drawer.style.opacity = '';
          drawer.style.transform = '';
        }, 250);
      }
    };
  }

  /* 10. IMAGE LAZY-LOAD PROGRESSIVE ENHANCEMENT */
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.style.transition = 'opacity 0.4s ease';
        img.style.opacity = '1';
        observer.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      img.style.opacity = '0';
      observer.observe(img);
    });
  }

  /* 11. ACTIVE NAV HIGHLIGHT on current page */
  function updateActiveNav() {
    var currentFile = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a, #mobile-menu-drawer a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var isActive = href === currentFile || (currentFile === '' && href === 'index.html');
      /* Reset simetris: penting saat SPA swap karena header tidak diganti */
      if (isActive) {
        a.setAttribute('aria-current', 'page');
        a.classList.add('text-secondary-fixed', 'font-bold', 'bg-primary/40', 'rounded-lg');
        a.classList.remove('text-on-primary-container');
      } else {
        a.removeAttribute('aria-current');
        a.classList.remove('text-secondary-fixed', 'font-bold', 'bg-primary/40', 'rounded-lg');
        a.classList.add('text-on-primary-container');
      }
    });
  }

  /* 12. COPY-TO-CLIPBOARD for citations/references */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.dataset.copy;
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
          var original = btn.textContent;
          btn.textContent = '✓ Disalin';
          setTimeout(function () { btn.textContent = original; }, 1800);
        });
      });
    });
  }

  /* 14. FOOTER YEAR AUTO-UPDATE */
  function updateFooterYear() {
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* 15. INIT ALL — run on DOM ready and re-run on SPA nav */
  function initAll() {
    autoMarkRevealElements();
    initScrollReveal();
    initStatCounters();
    initCardTilt();
    initSmoothAnchors();
    initMobileMenu();
    initLazyImages();
    updateActiveNav();
    initCopyButtons();
    updateFooterYear();
  }

  /* Refresher untuk SPA navigation (dipanggil sa-spa.js setelah swap main).
     Hanya inisialisasi yang relevan untuk konten baru; listener dokumen/window
     persisten tidak diulang. */
  window.SA = window.SA || {};
  window.SA.enhanceRefresh = function () {
    autoMarkRevealElements();
    initScrollReveal();
    initStatCounters();
    initCardTilt();
    initSmoothAnchors();
    updateActiveNav();
    initCopyButtons();
    updateFooterYear();
  };

  function bootstrap() {
    initReadingProgress();
    initHeaderScroll();
    initParallax();
    initAll();

    // Re-run lightweight inits after SPA navigation
    // Hook into the SA.wirePage cycle if available
    var origWirePage = window.SA && window.SA.wirePage;
    if (origWirePage) {
      window.SA.wirePage = function () {
        origWirePage.apply(this, arguments);
        setTimeout(initAll, 50);
      };
    }

    // Also observe DOM changes for dynamically added sections
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (mutations) {
        var hasNewNodes = mutations.some(function (m) {
          return m.addedNodes.length > 0;
        });
        if (hasNewNodes) {
          setTimeout(function () {
            initScrollReveal();
            initStatCounters();
            initCardTilt();
          }, 100);
        }
      });
      mo.observe(document.querySelector('main') || document.body, {
        childList: true,
        subtree: false
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
