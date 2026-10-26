/* perang.js: Bab 02 - Dua Pengepungan & Kronologi Pertempuran */
(function () {
  "use strict";

  /* ---------- 1. TACTICAL MAP FOCUS CONTROLLER ---------- */
  function setMapFocus(type, descriptionText) {
    var descEl = document.getElementById('map-description');
    if (descEl) {
      descEl.innerHTML =
        '<span class="material-symbols-outlined shrink-0 text-[18px]" style="color:#fdbe59;">adjust</span>' +
        '<span style="color:rgba(188,198,226,0.9);">' + descriptionText + '</span>';
    }

    var kasteel = document.getElementById('node-kasteel');
    var hollandia = document.getElementById('node-hollandia');
    var parit = document.getElementById('node-parit');
    var marunda = document.getElementById('node-marunda');

    // Reset to original colors for the new realistic SVG
    if (kasteel) kasteel.setAttribute('fill', '#b09050');
    if (hollandia) hollandia.setAttribute('fill', '#e8c060');
    if (parit) { parit.setAttribute('stroke', '#8b4513'); parit.setAttribute('stroke-width', '3.5'); }
    if (marunda) marunda.setAttribute('fill', '#2a4a7a');

    // Highlight the selected focal point with a brighter color
    if (type === 'kasteel' && kasteel) {
      kasteel.setAttribute('fill', '#c87d18');
    } else if (type === 'hollandia' && hollandia) {
      hollandia.setAttribute('fill', '#e8302a');
    } else if (type === 'parit' && parit) {
      parit.setAttribute('stroke', '#ff6b35');
      parit.setAttribute('stroke-width', '5');
    } else if (type === 'ciliwung') {
      // Flash the info about Ciliwung river (no specific SVG node to highlight)
    } else if (type === 'marunda' && marunda) {
      marunda.setAttribute('fill', '#fabb57');
    }
  }
  window.setMapFocus = setMapFocus;

  /* ---------- 2. DUAL-PERSPECTIVE HISTORIOGRAPHY TOGGLE ---------- */
  function toggleHistoriography(activeMode) {
    var btnVoc = document.getElementById('btn-hist-voc');
    var btnBabad = document.getElementById('btn-hist-babad');
    var panelVoc = document.getElementById('panel-hist-voc');
    var panelBabad = document.getElementById('panel-hist-babad');
    if (!btnVoc || !btnBabad || !panelVoc || !panelBabad) return;

    if (activeMode === 'voc') {
      btnVoc.className = 'px-space-md py-space-xs rounded-full bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm';
      btnBabad.className = 'px-space-md py-space-xs rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all';
      panelVoc.classList.remove('opacity-40');
      panelVoc.classList.add('shadow-md');
      panelBabad.classList.add('opacity-40');
      panelBabad.classList.remove('shadow-md');
    } else {
      btnBabad.className = 'px-space-md py-space-xs rounded-full bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm';
      btnVoc.className = 'px-space-md py-space-xs rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all';
      panelBabad.classList.remove('opacity-40');
      panelBabad.classList.add('shadow-md');
      panelVoc.classList.add('opacity-40');
      panelVoc.classList.remove('shadow-md');
    }
  }
  window.toggleHistoriography = toggleHistoriography;

  /* ---------- 3. GLOSSARY DRAWER & SEARCH CONTROLLER ---------- */
  function toggleGlossaryModal(isOpen) {
    var drawer = document.getElementById('glossary-drawer');
    var panel = document.getElementById('glossary-panel');
    if (!drawer || !panel) return;

    if (isOpen) {
      drawer.classList.remove('opacity-0', 'pointer-events-none');
      drawer.classList.add('opacity-100');
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
      var input = document.getElementById('glossary-search');
      if (input) input.focus();
    } else {
      drawer.classList.remove('opacity-100');
      drawer.classList.add('opacity-0', 'pointer-events-none');
      panel.classList.remove('translate-x-0');
      panel.classList.add('translate-x-full');
    }
  }
  window.toggleGlossaryModal = toggleGlossaryModal;

  function filterGlossary() {
    var searchEl = document.getElementById('glossary-search');
    if (!searchEl) return;
    var query = searchEl.value.toLowerCase();
    var items = document.querySelectorAll('.term-item');
    items.forEach(function (item) {
      var term = item.getAttribute('data-term') || '';
      var text = item.innerText.toLowerCase();
      if (term.includes(query) || text.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }
  window.filterGlossary = filterGlossary;

  function toggleMobileMenu() {
    var drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) drawer.classList.toggle('hidden');
  }
  window.toggleMobileMenu = toggleMobileMenu;

  /* ---------- Cleanup untuk SPA (dipanggil sa-spa.js sebelum swap) ---------- */
  window.SA = window.SA || {};
  window.SA.pageCleanup = function () {
    toggleGlossaryModal(false);
  };
})();
