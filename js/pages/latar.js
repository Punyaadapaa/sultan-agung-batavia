/* pages/latar.js: Bab 01 - Latar Belakang & Komparasi Mataram vs VOC */
(function () {
  "use strict";

  /* ---------- Interactive Filter Logic for Figures ---------- */
  var filterButtons = document.querySelectorAll('#figure-filter-group .filter-btn');
  var figureCards = document.querySelectorAll('.figure-card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        b.classList.add('text-on-surface-variant');
      });

      btn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
      btn.classList.remove('text-on-surface-variant');

      var filter = btn.getAttribute('data-filter');

      figureCards.forEach(function (card) {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else if (card.classList.contains(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ---------- Modal Bio Content Database ---------- */
  var bioData = {
    agung: {
      name: "Sultan Agung Hanyokrokusumo",
      role: "Sultan Mataram III (1613\u20131645)",
      badge: "Kubu Mataram Islam",
      provenance: "Serat Babad Tanah Jawi dan Babad Nitik",
      text: "Raden Mas Jatmika bergelar Sri Susuhunan Sultan Agung Hanyakrakusuma. Di bawah kepemimpinannya, Mataram menjelma menjadi imperium agraris terbesar di Jawa. Menolak tunduk pada monopoli dagang VOC, ia mengerahkan puluhan ribu prajurit dalam dua ekspedisi pengepungan Batavia. Meski gagal merebut benteng, keberaniannya menjadikan beliau simbol perlawanan anti-kolonial paling awal di Nusantara."
    },
    coen: {
      name: "Jan Pieterszoon Coen",
      role: "Gouverneur-Generaal van Nederlands-Indi\u00EB",
      badge: "Kubu VOC Batavia",
      provenance: "Daghregister Kasteel Batavia (1619\u20131629)",
      text: "Lahir di Hoorn, Coen merupakan perancang utama tata niaga monopoli VOC di Asia. Ia merebut Jayakarta pada 1619 dan mendirikan Batavia. Ia dikenal keras kepala dan tanpa kompromi. Saat pengepungan kedua Mataram berkecamuk pada September 1629, Coen meninggal mendadak di dalam kastel akibat wabah kolera/disentri yang menjangkiti kedua belah pihak."
    },
    bahureksa: {
      name: "Tumenggung Bahureksa",
      role: "Bupati Kendal dan Panglima Armada Laut 1628",
      badge: "Kubu Mataram Islam",
      provenance: "Catatan Sejarah Kabupaten Kendal dan ANRI",
      text: "Ki Joko Bahu, Adipati Kendal yang dipercaya Sultan Agung memimpin ekspedisi pembuka tahun 1628. Menyiapkan 59 jung perang dan ribuan prajurit di pantai utara. Pasukannya berhasil merangsek sampai ke kubu pertahanan luar Batavia sebelum gugur dalam pertempuran sengit di parit benteng pada akhir September 1628."
    },
    specx: {
      name: "Jacques Specx",
      role: "Gouverneur-Generaal ad interim (1629\u20131632)",
      badge: "Kubu VOC Batavia",
      provenance: "Arsip VOC Nationaal Archief Den Haag",
      text: "Tiba di Batavia tak lama sebelum wafatnya Coen. Sebagai administrator senior yang terbiasa berdiplomasi dengan Shogun Tokugawa di Jepang, ia mengendalikan situasi darurat kota Batavia, mempertahankan benteng dari sisa-sisa pasukan Mataram, dan menata ulang administrasi garnisun pasca-pengepungan."
    },
    ukur: {
      name: "Dipati Ukur dan Pangeran Mandurareja",
      role: "Panglima Pasukan Darat dan Tatar Sunda",
      badge: "Kubu Mataram Islam",
      provenance: "Babad Dipati Ukur dan Naskah Cikundul",
      text: "Wangsanata (Dipati Ukur) memimpin ribuan prajurit Sunda Tatar Ukur bersama Pangeran Mandurareja. Mereka bertanggung jawab atas pergerakan darat melintasi rimba Priangan, membuat kubu pengepungan di sebelah selatan benteng, dan membendung aliran kali Ciliwung guna memutus air bersih garnisun VOC."
    },
    febvre: {
      name: "Jacques le Febvre",
      role: "Komandan Sektor Pertahanan Bastion",
      badge: "Kubu VOC Batavia",
      provenance: "Resolusi Dewan Hindia VOC",
      text: "Perwira militer berpengalaman yang mengatur tembakan meriam kaliber berat dari Bastion Hollandia. Taktik bertahan di balik redoute dan penggunaan peluru gotri terbukti mematikan terhadap gelombang serbuan infanteri Mataram yang mencoba memanjat dinding benteng."
    },
    juminah: {
      name: "Kiai Adipati Juminah",
      role: "Panglima Ekspedisi Kedua 1629",
      badge: "Kubu Mataram Islam",
      provenance: "Babad Meinsma dan Laporan VOC 1629",
      text: "Pangeran Juminah memimpin ekspedisi 1629 dengan strategi yang jauh lebih matang: membangun jaringan lumbung padi di Karawang dan Tegal serta parit perlindungan berundak. Sayangnya, pembakaran lumbung oleh mata-mata VOC membuat pasukannya kehabisan logistik makanan di tengah pengepungan."
    }
  };

  function openBioModal(id) {
    var data = bioData[id];
    if (!data) return;

    var modal = document.getElementById('bio-modal');
    var content = document.getElementById('modal-content');
    if (!modal || !content) return;

    content.innerHTML = [
      '<div class="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-secondary-container/30 text-on-secondary-container font-label-caps text-label-caps uppercase font-bold w-fit mb-space-sm">',
      '  ' + data.badge,
      '</div>',
      '<h3 class="font-headline-md text-headline-md text-primary font-bold">' + data.name + '</h3>',
      '<span class="font-title-editorial text-title-editorial text-secondary block mt-1">' + data.role + '</span>',
      '<div class="my-space-md p-space-md rounded-lg bg-surface-container shadow-sm">',
      '  <span class="font-caption-meta text-caption-meta text-on-surface font-semibold block mb-1">Rujukan Arsip:</span>',
      '  <span class="font-caption-meta text-caption-meta text-on-surface-variant">' + data.provenance + '</span>',
      '</div>',
      '<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">' + data.text + '</p>',
      '<div class="mt-space-lg flex justify-end">',
      '  <button type="button" onclick="closeBioModal()" class="px-space-lg py-space-sm rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors">',
      '    Tutup Rincian',
      '  </button>',
      '</div>'
    ].join('\n');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeBioModal() {
    var modal = document.getElementById('bio-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  window.openBioModal = openBioModal;
  window.closeBioModal = closeBioModal;

  // Close modal when clicking outside
  var bioModalEl = document.getElementById('bio-modal');
  if (bioModalEl) {
    bioModalEl.addEventListener('click', function (e) {
      if (e.target === this) closeBioModal();
    });
  }

  function toggleMobileMenu() {
    var drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) drawer.classList.toggle('hidden');
  }
  window.toggleMobileMenu = toggleMobileMenu;

  /* ---------- Cleanup untuk SPA (dipanggil sa-spa.js sebelum swap) ---------- */
  window.SA = window.SA || {};
  window.SA.pageCleanup = function () {
    closeBioModal();
  };
})();
