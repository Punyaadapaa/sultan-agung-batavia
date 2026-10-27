/* modules/search-palette.js — Global Search Modal "Pencarian Arsip Historis".
   Diekstrak dari enhancements.js (section 13) saat restruktur folder; berisi
   searchIndex, modal builder, dan Ctrl/"/" shortcut. Inisialisasi sekali. */
(function () {
  "use strict";

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
    modal.className = 'fixed inset-0 z-50 bg-[#0b1220]/45 backdrop-blur-sm hidden items-start justify-center pt-[13vh] px-4 sm:px-6';
    modal.innerHTML = [
      '<div class="bg-white max-w-xl w-full rounded-2xl shadow-[0_30px_90px_-20px_rgba(13,24,41,0.55)] overflow-hidden">',
      '  <div class="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-black/[0.07] bg-gradient-to-r from-[#FDC84B]/10 via-[#FDC84B]/[0.04] to-transparent">',
      '    <span class="shrink-0 w-9 h-9 rounded-full bg-[#C17D11]/12 flex items-center justify-center"><span class="material-symbols-outlined text-[20px] text-[#C17D11]">search</span></span>',
      '    <input type="text" id="global-search-input" placeholder="Cari tokoh, bab pertempuran, artefak pusaka..." class="w-full bg-transparent text-[15px] font-medium font-body-md text-on-surface outline-none placeholder:text-black/30 [caret-color:#C17D11]" autofocus autocomplete="off"/>',
      '    <kbd class="hidden sm:block shrink-0 px-2 py-0.5 rounded-md border border-black/10 bg-black/[0.03] font-mono text-[10px] text-black/35">ESC</kbd>',
      '  </div>',
      '  <div id="global-search-results" class="max-h-[336px] overflow-y-auto p-2 flex flex-col gap-0.5"></div>',
      '  <div class="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-black/[0.07] font-body-md text-[11px] text-black/35">',
      '    <span>Gunakan ↑ / ↓ untuk navigasi, Enter untuk membuka</span>',
      '    <span id="search-result-count" class="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-[#162035]/[0.05] font-semibold text-[10px] text-[#3d475e]">16 arsip</span>',
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

      countBox.textContent = matches.length + ' arsip';
      if (!matches.length) {
        resultsBox.innerHTML = '<div class="py-10 text-center font-body-md text-[13px] text-black/40">Tidak ada arsip yang cocok dengan "<b>' + query + '</b>"</div>';
        return;
      }

      resultsBox.innerHTML = matches.map(function (item, idx) {
        var isFirst = idx === 0;
        return [
          '<a href="' + item.url + '" class="search-result-item group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ' + (isFirst ? 'bg-[#162035]/[0.055]' : 'hover:bg-black/[0.035]') + '">',
          '  <div class="min-w-0 flex-1">',
          '    <div class="flex items-baseline gap-2">',
          '      <span class="font-body-md font-semibold text-[14px] leading-snug text-on-surface group-hover:text-[#C17D11] transition-colors truncate">' + item.title + '</span>',
          '      <span class="hidden sm:inline shrink-0 px-2 py-[3px] rounded-full bg-[#C17D11]/[0.09] text-[#9B6400] text-[9px] font-bold uppercase tracking-[0.12em] whitespace-nowrap">' + item.cat + '</span>',
          '    </div>',
          '    <p class="font-body-md text-[12px] leading-snug text-black/40 truncate mt-0.5">' + item.desc + '</p>',
          '  </div>',
          '  <span class="material-symbols-outlined text-[18px] shrink-0 transition-opacity ' + (isFirst ? 'text-[#C17D11] opacity-100' : 'text-black/25 opacity-0 group-hover:opacity-100') + '">arrow_forward</span>',
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

  function bootstrapSearch() {
    initGlobalSearch();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapSearch);
  } else {
    bootstrapSearch();
  }
})();
