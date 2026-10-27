/* pages/warisan.js: Bab 03 - Warisan Budaya & Artefak Bersejarah */
(function () {
  "use strict";

  /* ---------- Gallery Filters ---------- */
  function initGalleryFilters() {
    var buttons = document.querySelectorAll('#gallery-filter-buttons .filter-btn');
    var cards = document.querySelectorAll('.artifact-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('bg-primary', 'text-on-primary', 'active');
          b.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        btn.classList.add('bg-primary', 'text-on-primary', 'active');
        btn.classList.remove('bg-surface-container', 'text-on-surface-variant');

        var filter = btn.getAttribute('data-filter') || 'all';
        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category') || '';
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- Modal inspeksi artefak (memakai modal statis di markup) ---------- */
  function showArtifactModal(card) {
    var modal = document.getElementById('artifact-modal');
    if (!modal || !card) return;

    var title = card.getAttribute('data-title') || (card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '');
    var desc = card.getAttribute('data-desc') || (card.querySelector('p') ? card.querySelector('p').textContent.trim() : '');

    var setData = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setData('modal-title', title);
    setData('modal-desc', desc);
    setData('modal-era', card.getAttribute('data-era'));
    setData('modal-provenance', card.getAttribute('data-provenance'));

    var categoryBadge = card.querySelector('[class*="font-label-caps"]');
    setData('modal-category', categoryBadge ? categoryBadge.textContent.trim() : 'ARTEFAK HISTORIS');

    // Sitasi untuk tombol Salin Sitasi (dibaca enhancements.js saat klik)
    var copyBtn = document.getElementById('modal-copy-btn');
    if (copyBtn) {
      var sitasi = card.getAttribute('data-title') + ' (' + card.getAttribute('data-era') + '). Repositori: ' +
        card.getAttribute('data-provenance') + '. Arsip Digital Museum, Sultan Agung dan Batavia (1628\u20131629).';
      copyBtn.setAttribute('data-copy', sitasi);
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; /* kunci geser halaman selama modal terbuka */
  }

  function hideArtifactModal() {
    var modal = document.getElementById('artifact-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function initArtifactModals() {
    var modal = document.getElementById('artifact-modal');
    if (!modal) return;

    document.querySelectorAll('.artifact-card').forEach(function (card) {
      card.addEventListener('click', function () {
        showArtifactModal(card);
      });
      var btn = card.querySelector('.open-modal-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          showArtifactModal(card);
        });
      }
    });

    var closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideArtifactModal);

    var modalConfirmBtn = document.getElementById('modal-confirm-btn');
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', hideArtifactModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideArtifactModal();
    });
  }

  function init() {
    initGalleryFilters();
    initArtifactModals();
  }

  /* Markup main sudah lengkap ketika skrip ini dieksekusi (direct load atau SPA swap):
     init cukup SEKALI di sini, tidak lewat DOMContentLoaded maupun sa:page:update lagi. */
  init();

  function toggleMobileMenu() {
    var drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) drawer.classList.toggle('hidden');
  }
  window.toggleMobileMenu = toggleMobileMenu;

  /* ---------- Cleanup untuk SPA (dipanggil sa-spa.js sebelum swap) ---------- */
  window.SA = window.SA || {};
  window.SA.pageCleanup = function () {
    hideArtifactModal();
  };
})();
