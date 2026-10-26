/* index.js: Beranda - peta interaktif rute ekspedisi, glossary, expedition switcher */
(function () {
  "use strict";
  var SA = window.SA || {};
  var $ = SA.$, $$ = SA.$$;

  // Strategic Map Node Data
  var nodesData = {
    karta: {
      title: "Keraton Karta: Perumusan Titah Sumpah Pasukan",
      badge: "Pusat Pemerintahan Mataram",
      distance: "0 KM Titik Pangkal",
      commander: "Tumenggung Bahureksa & Pangeran Mandurareja",
      force: "~10.000 Infanteri + 50 Kapal Jung",
      desc: "Di keraton ini Sultan Agung memerintahkan Tumenggung Bahureksa mengumpulkan prajurit infanteri dan kavaleri. Sumpah kepatuhan diikrarkan di hadapan alun-alun sebelum berbaris menuju utara Jawa."
    },
    kendal: {
      title: "Pangkalan Kendal: Konsentrasi Armada Kapal Jung",
      badge: "Pangkalan Angkatan Laut",
      distance: "120 KM dari Karta",
      commander: "Tumenggung Bahureksa (Bupati Kendal)",
      force: "59 Perahu Jung Besar & Pasukan Marinir",
      desc: "Kendal menjadi pelabuhan persiapan maritim Mataram pada Agustus 1628. Puluhan kapal membawa beras dan perbekalan perang bertolak menyusuri pesisir utara menuju Batavia."
    },
    tegal: {
      title: "Depot Transit Tegal: Titik Temu Jalur Darat & Bahari",
      badge: "Lumbung Logistik Lapangan",
      distance: "210 KM dari Karta",
      commander: "Kiai Rangga & Tumenggung Sura Agul-Agul",
      force: "Depot 2.000 Pikul Gabah Padi",
      desc: "Pos strategis pergantian hewan angkut dan konsolidasi prajurit darat sebelum menembus hutan lebat di perbatasan barat Jawa Tengah."
    },
    cirebon: {
      title: "Cirebon: Gerbang Aliansi Kesultanan Pasundan",
      badge: "Aliansi Kesultanan Pesisir",
      distance: "320 KM dari Karta",
      commander: "Pangeran Girilaya & Utusan Keraton",
      force: "Penyedia Pasukan Penunjuk Jalan & Intelijen",
      desc: "Kesultanan Cirebon yang bersekutu dengan Mataram memfasilitasi jalur lintas pasukan serta memberikan perlindungan intelijen mengenai posisi kapal perang VOC di Teluk Jakarta."
    },
    karawang: {
      title: "Karawang & Ciasem: Sawah Lumbung Pangan Rahasia 1629",
      badge: "Kantung Logistik Taktis 1629",
      distance: "420 KM dari Karta",
      commander: "Dipati Ukur & Panglima Kertabumi",
      force: "Ribuan Petani Milisi & Parit Padi",
      desc: "Belajar dari kegagalan 1628, Sultan Agung memerintahkan pembukaan persawahan di Karawang dan Ciasem. Sayangnya, jaringan lumbung ini dibakar mata-mata VOC menjelang pengepungan."
    },
    batavia: {
      title: "Kasteel Batavia: Kepungan Parit & Wafatnya J.P. Coen",
      badge: "Pusat Pertahanan VOC",
      distance: "510 KM dari Karta",
      commander: "Jan Pieterszoon Coen & Jacques Specx",
      force: "Benteng 4 Bastion & Meriam Kaliber Besar",
      desc: "Pasukan Mataram membendung Kali Ciliwung dan mengotori sumber air tawar kastel dengan kotoran serta bangkai kuda. J.P. Coen terjangkit kolera mendadak dan wafat 21 September 1629."
    }
  };

  function selectNode(nodeKey) {
    var data = nodesData[nodeKey];
    if (!data) return;

    // Update Detail Text
    var titleEl = document.getElementById('detail-title');
    var badgeEl = document.getElementById('detail-badge');
    var distanceEl = document.getElementById('detail-distance');
    var commanderEl = document.getElementById('detail-commander');
    var forceEl = document.getElementById('detail-force');
    var descEl = document.getElementById('detail-desc');

    if (titleEl) titleEl.innerText = data.title;
    if (badgeEl) badgeEl.innerText = data.badge;
    if (distanceEl) distanceEl.innerText = data.distance;
    if (commanderEl) commanderEl.innerText = data.commander;
    if (forceEl) forceEl.innerText = data.force;
    if (descEl) descEl.innerText = data.desc;

    // Highlight Node Button Cards
    var routeNodes = $$('.route-node');
    routeNodes.forEach(function (el) {
      el.classList.remove('bg-surface-container-high', 'shadow-md');
      el.classList.add('bg-surface-container-low');
    });
    var activeBtn = document.getElementById('node-' + nodeKey);
    if (activeBtn) {
      activeBtn.classList.add('bg-surface-container-high', 'shadow-md');
      activeBtn.classList.remove('bg-surface-container-low');
    }

    // Peta realistis: geser viewport ke penanda & sorot
    if (window.SAPeta) window.SAPeta.focus(nodeKey);
  }

  function setExpedition(year) {
    var btn1628 = document.getElementById('btn-route-1628');
    var btn1629 = document.getElementById('btn-route-1629');

    if (year === '1628') {
      if (btn1628) btn1628.className = 'px-space-md py-space-xs rounded font-label-md text-label-md font-bold bg-primary text-on-primary shadow transition-all';
      if (btn1629) btn1629.className = 'px-space-md py-space-xs rounded font-label-md text-label-md font-bold text-on-surface-variant hover:text-primary transition-all';
      // Peta realistis: jalur darat 1628 disorot, armada bahari dim
      if (window.SAPeta) window.SAPeta.setMode('1628');
      selectNode('kendal');
    } else {
      if (btn1629) btn1629.className = 'px-space-md py-space-xs rounded font-label-md text-label-md font-bold bg-primary text-on-primary shadow transition-all';
      if (btn1628) btn1628.className = 'px-space-md py-space-xs rounded font-label-md text-label-md font-bold text-on-surface-variant hover:text-primary transition-all';
      // Serangan kedua: sorot jalur bahari/logistik, jalur darat dim
      if (window.SAPeta) window.SAPeta.setMode('1629');
      selectNode('karawang');
    }
  }

  // Glossary Data
  var glossaryData = {
    catur: {
      tag: "Arsitektur & Filosofi Kosmologi",
      latin: "Quadrumvirat Filosofis Jawa",
      title: "Catur Gatra Tunggal",
      text: "Konsep tata ruang sakral Mataram yang menyatukan empat pilar utama dalam satu sumbu spasial: Keraton (pusat kekuasaan raja), Alun-alun (ruang komunikasi publik), Masjid Gedhe (kehidupan spiritual-keagamaan), dan Pasar (pusat denyut roda ekonomi rakyat). Konsep ini dibawa dan dipertahankan dalam merancang kota-kota satelit selama ekspedisi."
    },
    lumbung: {
      tag: "Taktik Suplai Pangan Militer",
      latin: "Granarium Strategicum",
      title: "Lumbung Beras Pantai Utara",
      text: "Jaringan penyimpanan beras skala besar yang didirikan di sepanjang pesisir utara pulau Jawa (Kendal, Tegal, Karawang, Ciasem). Lumbung-lumbung ini dirancang untuk menyokong barisan puluhan ribu serdadu tanpa harus membebani angkutan perbekalan langsung dari pusat pedalaman Mataram."
    },
    anno: {
      tag: "Kronologi & Kalender Nasional",
      latin: "Kalender Jawa Sultan Agungan",
      title: "Anno Javanico (1555 Saka)",
      text: "Karya monumental Sultan Agung pada tahun 1633 Masehi yang menggabungkan sistem penanggalan Saka (Hindu-Buddha berbasis matahari) dengan sistem kalender Hijriah (Islam berbasis bulan). Penyatuan ini memperkuat legitimasi spiritual dan menyelaraskan daur ritus agraris rakyat Jawa."
    },
    nayaka: {
      tag: "Struktur Komando Militer Kerajaan",
      latin: "Dignitarii & Duces Militares",
      title: "Bupati Nayaka & Wedana",
      text: "Para bupati pesisir dan komandan perang bawahan raja yang memimpin brigade pasukan berdasarkan asal distrik kedaerahan. Kepemimpinan Nayaka menguji kepatuhan daerah taklukan Mataram di bawah komando Panglima Tertinggi seperti Bahureksa dan Mandurareja."
    }
  };

  function showGlossary(key) {
    var item = glossaryData[key];
    if (!item) return;

    var tagEl = document.getElementById('glossary-tag');
    var latinEl = document.getElementById('glossary-latin');
    var headingEl = document.getElementById('glossary-heading');
    var textEl = document.getElementById('glossary-text');

    if (tagEl) tagEl.innerText = item.tag;
    if (latinEl) latinEl.innerText = item.latin;
    if (headingEl) headingEl.innerText = item.title;
    if (textEl) textEl.innerText = item.text;

    var glossaryBtns = $$('.glossary-btn');
    glossaryBtns.forEach(function (btn) {
      btn.classList.remove('ring-2', 'ring-secondary', 'bg-surface-container-high');
      btn.classList.add('bg-surface-container-lowest');
    });
    var activeChip = document.getElementById('chip-' + key);
    if (activeChip) {
      activeChip.classList.add('ring-2', 'ring-secondary', 'bg-surface-container-high');
    }
  }

  // Init: wire onclick handlers
  function init() {
    // Expedition buttons
    var btn1628 = document.getElementById('btn-route-1628');
    var btn1629 = document.getElementById('btn-route-1629');
    if (btn1628) btn1628.addEventListener('click', function () { setExpedition('1628'); });
    if (btn1629) btn1629.addEventListener('click', function () { setExpedition('1629'); });

    // Node buttons
    var nodeButtons = $$('.route-node');
    nodeButtons.forEach(function (btn) {
      var nodeKey = btn.id.replace('node-', '');
      btn.addEventListener('click', function () { selectNode(nodeKey); });
    });

    // SVG node clicks
    var svgPts = $$('.svg-pt');
    svgPts.forEach(function (pt) {
      pt.style.cursor = 'pointer';
      var nodeKey = pt.getAttribute('data-key');
      pt.addEventListener('click', function () { selectNode(nodeKey); });
    });

    // Glossary buttons
    var glossaryBtns = $$('.glossary-btn');
    glossaryBtns.forEach(function (btn) {
      var key = btn.id.replace('chip-', '');
      btn.addEventListener('click', function () { showGlossary(key); });
    });

    // Manuscript zoom trigger
    var msTrigger = document.getElementById('manuscript-zoom-trigger');
    if (msTrigger) {
      msTrigger.addEventListener('click', function () {
        var modal = document.getElementById('manuscript-modal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'manuscript-modal';
          modal.className = 'fixed inset-0 z-50 bg-primary/80 backdrop-blur-md hidden items-center justify-center p-space-md';
          modal.innerHTML = [
            '<div class="bg-surface-container-lowest max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">',
            '  <div class="p-space-md border-b border-surface-container-high flex items-center justify-between">',
            '    <div class="flex items-center gap-space-xs">',
            '      <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>',
            '      <h3 class="font-title-editorial text-title-editorial text-primary font-bold">Babad Nitik Sultan Agung (Folio 12v)</h3>',
            '    </div>',
            '    <button type="button" id="close-ms-modal" class="p-1 rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer">',
            '      <span class="material-symbols-outlined text-[20px]">close</span>',
            '    </button>',
            '  </div>',
            '  <div class="relative overflow-auto p-space-md bg-surface-container flex items-center justify-center">',
            '    <img src="assets/babad-tanah-jawi.webp" alt="Manuskrip Iluminasi Emas" class="max-h-[65vh] object-contain rounded shadow-lg"/>',
            '  </div>',
            '  <div class="p-space-md bg-surface-container-low text-body-sm text-on-surface-variant flex flex-col gap-1">',
            '    <span class="font-semibold text-primary">Inspeksi Filologi:</span>',
            '    <p class="leading-relaxed">Halaman naskah beriluminasi emas prada memuat titah mobilisasi militer 1628 dengan gaya ornamen dedaunan pesisiran lung-lungan dan sengkalan memet yang langka.</p>',
            '  </div>',
            '</div>'
          ].join('\n');
          document.body.appendChild(modal);

          modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.closest('#close-ms-modal')) {
              modal.classList.add('hidden');
              modal.classList.remove('flex');
              document.body.style.overflow = '';
            }
          });
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      });
    }

    // Set default selection
    selectNode('karta');
    showGlossary('catur');
  }

  // Export to global scope for onclick handlers if needed
  window.selectNode = selectNode;
  window.setExpedition = setExpedition;
  window.showGlossary = showGlossary;

  // Page cleanup for SPA navigation
  window.SA = window.SA || {};
  window.SA.pageCleanup = function () {
    var msModal = document.getElementById('manuscript-modal');
    if (msModal) {
      msModal.classList.add('hidden');
      msModal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  };

  // Wire on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('sa:page:update', function () {
    if (document.getElementById('peta-strategis')) {
      init();
    }
  });
})();
