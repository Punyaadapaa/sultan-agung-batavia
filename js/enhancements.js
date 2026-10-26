/* Interaksi dan animasi pelengkap website */

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

  /* 13. GLOBAL SEARCH MODAL (Pencarian Arsip Historis) */
  var searchIndex = [
    { title: "Sultan Agung Hanyakrakusuma", cat: "Tokoh Mataram", url: "latar.html", desc: "Raja Mataram III yang memimpin ekspedisi 1628 dan 1629 menantang hegemoni VOC." },
    { title: "Jan Pieterszoon Coen", cat: "Tokoh VOC", url: "latar.html", desc: "Gubernur Jenderal VOC arsitek benteng Batavia yang wafat saat pengepungan kedua 1629." },
    { title: "Tumenggung Bahureksa", cat: "Panglima Perang", url: "latar.html", desc: "Bupati Kendal dan panglima armada laut 59 jung perang Mataram pada ekspedisi 1628." },
    { title: "Dipati Ukur dan Tatar Sunda", cat: "Panglima Darat", url: "latar.html", desc: "Panglima infanteri darat Priangan yang membendung Sungai Ciliwung." },
    { title: "Pengepungan Pertama (1628)", cat: "Kronologi Perang", url: "perang.html", desc: "Pendaratan armada Bahureksa di Marunda dan gempuran parit pertahanan benteng." },
    { title: "Pengepungan Kedua & Sabotase Lumbung (1629)", cat: "Kronologi Perang", url: "perang.html", desc: "Strategi lumbung padi Karawang dan Tegal serta pembakaran oleh mata-mata VOC." },
    { title: "Wafatnya J.P. Coen (21 September 1629)", cat: "Titik Balik", url: "perang.html", desc: "Kematian mendadak Gubernur Jenderal VOC akibat wabah di dalam Kasteel Batavia." },
    { title: "Benteng Kasteel Batavia & 4 Bastion", cat: "Arsitektur Militer", url: "perang.html", desc: "Pertahanan bastion Parel, Diamant, Robijn, dan Saffier." },
    { title: "Keris Mataram Luk 13 Pamor Wos Wutah", cat: "Artefak Pusaka", url: "warisan.html", desc: "Pusaka keningratan komandan kavaleri perang Mataram abad ke-17." },
    { title: "Meriam Si Jagur", cat: "Artileri Benteng", url: "warisan.html", desc: "Meriam perunggu berat berornamen mano in fico pertahanan VOC Batavia." },
    { title: "Armada Kapal Perang & Jung Jawa 1596", cat: "Dokumen Maritim", url: "warisan.html", desc: "Etsa kapal penjelajah pesisir pengangkut logistik Mataram melintasi Laut Jawa." },
    { title: "Kereta Kencana Singa Barong Cirebon", cat: "Simbol Diplomasi", url: "warisan.html", desc: "Mahakarya akulturasi tiga budaya lambang persekutuan Mataram dan Cirebon." },
    { title: "Kalender Jawa Islam (Saka Hijriah)", cat: "Warisan Budaya", url: "warisan.html", desc: "Penyatuan kalender Saka dan Hijriah oleh Sultan Agung tahun 1633 M (1555 Saka)." },
    { title: "Kitab Sastra Gendhing & Nitipraya", cat: "Filsafat & Sastra", url: "warisan.html", desc: "Karya sufistik filosofis gubahan Sultan Agung mengenai tata kosmos dan jiwa." },
    { title: "Pemakaman Imogiri", cat: "Arsitektur Suci", url: "warisan.html", desc: "Makam suci raja-raja Mataram di perbukitan Girirejo karya Sultan Agung." },
    { title: "Simulator Panglima & Sertifikat Pejuang", cat: "Uji Kompetensi", url: "uji.html", desc: "Simulasi keputusan taktis logistik dan 10 soal kuis historiografi berhadiah sertifikat." }
  ];

  function ensureSearchModal() {
    var modal = document.getElementById('global-search-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'global-search-modal';
    modal.className = 'fixed inset-0 z-50 bg-primary/80 backdrop-blur-md hidden items-start justify-center pt-24 px-4 sm:px-6';
    modal.innerHTML = [
      '<div class="bg-surface-container-lowest max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">',
      '  <div class="p-space-md border-b border-surface-container-high flex items-center gap-space-sm">',
      '    <span class="material-symbols-outlined text-secondary text-[24px]">search</span>',
      '    <input type="text" id="global-search-input" placeholder="Cari tokoh, bab pertempuran, artefak pusaka..." class="w-full bg-transparent text-primary text-body-md font-body-md outline-none placeholder:text-on-surface-variant/60" autofocus autocomplete="off"/>',
      '    <kbd class="hidden sm:inline-block px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">ESC</kbd>',
      '  </div>',
      '  <div id="global-search-results" class="max-h-80 overflow-y-auto p-space-sm flex flex-col gap-1">',
      '  </div>',
      '  <div class="p-space-xs px-space-md bg-surface-container-low text-caption-meta text-on-surface-variant flex items-center justify-between border-t border-surface-container-high">',
      '    <span>Gunakan ↑ / ↓ untuk navigasi, Enter untuk membuka</span>',
      '    <span id="search-result-count">16 Arsip</span>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(modal);

    var input = modal.querySelector('#global-search-input');
    var resultsBox = modal.querySelector('#global-search-results');
    var countBox = modal.querySelector('#search-result-count');

    function renderResults(q) {
      var query = (q || '').trim().toLowerCase();
      var matches = searchIndex.filter(function (item) {
        if (!query) return true;
        return item.title.toLowerCase().includes(query) ||
               item.desc.toLowerCase().includes(query) ||
               item.cat.toLowerCase().includes(query);
      });

      countBox.textContent = matches.length + ' Arsip';
      if (!matches.length) {
        resultsBox.innerHTML = '<div class="py-8 text-center text-on-surface-variant text-body-sm">Tidak ada arsip yang cocok dengan "<b>' + query + '</b>"</div>';
        return;
      }

      resultsBox.innerHTML = matches.map(function (item, idx) {
        return [
          '<a href="' + item.url + '" class="search-result-item p-space-sm rounded-lg hover:bg-surface-container transition-colors flex flex-col gap-0.5 group cursor-pointer ' + (idx === 0 ? 'bg-surface-container/50' : '') + '">',
          '  <div class="flex items-center justify-between">',
          '    <span class="font-title-editorial text-primary group-hover:text-secondary font-bold text-sm">' + item.title + '</span>',
          '    <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-caps">' + item.cat + '</span>',
          '  </div>',
          '  <p class="font-body-sm text-xs text-on-surface-variant line-clamp-1">' + item.desc + '</p>',
          '</a>'
        ].join('\n');
      }).join('\n');
    }

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideSearchModal();
    });

    return modal;
  }

  function showSearchModal() {
    var modal = ensureSearchModal();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    var input = modal.querySelector('#global-search-input');
    var resultsBox = modal.querySelector('#global-search-results');
    input.value = '';
    // Initial display of suggestions
    var renderEvt = new Event('input');
    input.dispatchEvent(renderEvt);
    setTimeout(function () { input.focus(); }, 50);
    document.body.style.overflow = 'hidden';
  }

  function hideSearchModal() {
    var modal = document.getElementById('global-search-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  function initGlobalSearch() {
    document.querySelectorAll('[aria-label="Pencarian Arsip Historis"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        showSearchModal();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideSearchModal();
        var artModal = document.getElementById('artifact-modal');
        if (artModal) {
          artModal.classList.add('hidden');
          artModal.classList.remove('flex');
          document.body.style.overflow = '';
        }
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        showSearchModal();
      }
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
    initGlobalSearch();
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
