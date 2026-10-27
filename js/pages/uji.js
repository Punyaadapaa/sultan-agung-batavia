/* pages/uji.js: Bab 04 - Simulator Keputusan & Quiz Interaktif */
(function () {
  "use strict";

  /* ---------- Simulator State & Logic ---------- */
  var simState = {
    p: 78,
    f: 62,
    m: 85,
    w: 90
  };

  function applyDecision(scenarioId, deltaP, deltaF, deltaM, deltaW, optionLetter) {
    simState.p = Math.max(10, Math.min(100, simState.p + deltaP));
    simState.f = Math.max(10, Math.min(100, simState.f + deltaF));
    simState.m = Math.max(10, Math.min(100, simState.m + deltaM));
    simState.w = Math.max(10, Math.min(100, simState.w + deltaW));

    // Update GUI
    document.getElementById('metric-p-bar').style.width = simState.p + '%';
    document.getElementById('metric-p-text').textContent = simState.p + '%';

    document.getElementById('metric-f-bar').style.width = simState.f + '%';
    document.getElementById('metric-f-text').textContent = simState.f + '%';

    document.getElementById('metric-m-bar').style.width = simState.m + '%';
    document.getElementById('metric-m-text').textContent = simState.m + '%';

    document.getElementById('metric-w-bar').style.width = simState.w + '%';
    document.getElementById('metric-w-text').textContent = simState.w + '%';

    // Feedback narrative
    var fbTitle = document.getElementById('feedback-title');
    var fbDesc = document.getElementById('feedback-desc');
    var indexText = document.getElementById('overall-index');

    if (optionLetter === 'A') {
      fbTitle.textContent = 'Hasil Taktis Opsi A: Pasukan Tertekan, Pangan Terjaga Parsial';
      fbDesc.textContent = 'Prajurit Baureksa berhasil mendarat di tepian Marunda, namun kehilangan 15% kesiapan akibat rentetan meriam benteng Hollandia. Moral tetap stabil.';
    } else if (optionLetter === 'B') {
      fbTitle.textContent = 'Hasil Taktis Opsi B: Krisis Busuk Logistik dan Morale Drop';
      fbDesc.textContent = 'Gencatan senjata palsu membuat beras berjamur di kapal lembap. Pasukan terjangkit disentri sebelum genderang perang dibunyikan.';
    } else {
      fbTitle.textContent = 'Hasil Taktis Opsi C: Pertahanan Parit Tanah Sangat Efektif!';
      fbDesc.textContent = 'Pasukan Mataram berhasil merekayasa parit lumpur yang menelan peluru bulat meriam VOC. Wibawa keraton terangkat di mata adipati pesisir.';
    }

    var avg = Math.round((simState.p + simState.f + simState.m + simState.w) / 4);
    if (avg >= 75) {
      indexText.textContent = 'Kondisi: Siap Tempur Unggul (' + avg + '%)';
    } else if (avg >= 50) {
      indexText.textContent = 'Kondisi: Rawan Terisolasi (' + avg + '%)';
    } else {
      indexText.textContent = 'Kondisi: Kritis Menyerah (' + avg + '%)';
    }
  }
  window.applyDecision = applyDecision;

  function resetSimulator() {
    simState.p = 78;
    simState.f = 62;
    simState.m = 85;
    simState.w = 90;

    document.getElementById('metric-p-bar').style.width = '78%';
    document.getElementById('metric-p-text').textContent = '78%';
    document.getElementById('metric-f-bar').style.width = '62%';
    document.getElementById('metric-f-text').textContent = '62%';
    document.getElementById('metric-m-bar').style.width = '85%';
    document.getElementById('metric-m-text').textContent = '85%';
    document.getElementById('metric-w-bar').style.width = '90%';
    document.getElementById('metric-w-text').textContent = '90%';

    document.getElementById('feedback-title').textContent = 'Simulasi Direset ke Posisi Awal 1628';
    document.getElementById('feedback-desc').textContent = 'Kekuatan penuh kembali dipersiapkan di pesisir Kendal dan pedalaman Mataram.';
    document.getElementById('overall-index').textContent = 'Stabil / Superior';
  }
  window.resetSimulator = resetSimulator;

  /* ---------- Quiz Questions Dataset (10 Questions Sequence) ---------- */
  var quizDataset = [
    {
      category: "Pertanyaan 01 \u00B7 Tokoh dan Strategi Laut",
      question: "Siapakah panglima perang Mataram asal Kendal yang memimpin armada maritim 59 kapal pembawa logistik pada pengepungan pertama Agustus 1628?",
      options: ["Tumenggung Baureksa", "Pangeran Mandurareja", "Adipati Ukur (Priangan)", "Kyai Juru Kiting"],
      correct: 0,
      explanation: "Tumenggung Baureksa memimpin armada maritim dari Kendal sebagai garda pelopor pengepungan pertama Batavia sebelum gugur dalam serbuan ke redoute benteng."
    },
    {
      category: "Pertanyaan 02 \u00B7 Logistik dan Agrikultur 1629",
      question: "Dimanakah lokasi sentra lumbung beras rahasia Mataram pada ekspedisi kedua (1629) yang dibakar oleh armada VOC akibat pengkhianatan mata-mata?",
      options: ["Banten dan Cilegon", "Tegal dan Karawang", "Surabaya dan Pasuruan", "Semarang dan Jepara"],
      correct: 1,
      explanation: "Sultan Agung membangun lumbung di Tegal dan Karawang agar pasukan tidak kelaparan saat berjalan kaki ratusan kilometer. Sayang, lumbung ini dibumihanguskan oleh kapal VOC pimpinan Philip Lucasz."
    },
    {
      category: "Pertanyaan 03 \u00B7 Pemimpin VOC",
      question: "Siapakah Gubernur Jenderal VOC yang memimpin pertahanan Kasteel Batavia pada masa pengepungan dan tewas pada September 1629?",
      options: ["Pieter Both", "Jan Pieterszoon Coen", "Cornelis de Houtman", "Joan Maetsuycker"],
      correct: 1,
      explanation: "Jan Pieterszoon Coen, yang dijuluki 'Mur Jangkung' oleh masyarakat lokal, wafat di Batavia pada 21 September 1629 di tengah-tengah berlangsungnya pengepungan kedua."
    },
    {
      category: "Pertanyaan 04 \u00B7 Taktik Rekayasa Lingkungan",
      question: "Taktik apa yang digunakan pasukan Mataram terhadap Sungai Ciliwung demi melemahkan benteng Belanda?",
      options: ["Memasang ranjau air berbahan mesiu", "Membendung dan mencemari air sungai dengan bangkai", "Menggali terowongan rahasia di bawah sungai", "Membelokkan aliran sungai ke laut Jawa"],
      correct: 1,
      explanation: "Pasukan Mataram membendung hulu Sungai Ciliwung dan membuang bangkai hewan serta kotoran, yang memicu wabah kolera dahsyat di dalam benteng Batavia."
    },
    {
      category: "Pertanyaan 05 \u00B7 Artileri Sultan Agung",
      question: "Meriam pusaka legendaris Kesultanan Mataram yang kini berada di Museum Fatahillah dan sering dikaitkan dengan pengepungan Batavia adalah?",
      options: ["Meriam Ki Amuk", "Meriam Si Jagur", "Meriam Nyai Setomi", "Meriam Kyai Guntur Geni"],
      correct: 1,
      explanation: "Meriam Si Jagur yang bertuliskan moto Latin 'Ex me ipsa renata sum' berasal dari Portugis di Melaka dan kemudian dipindahkan VOC ke Batavia."
    },
    {
      category: "Pertanyaan 06 \u00B7 Kepemimpinian Pengepungan Kedua",
      question: "Pada ekspedisi kedua tahun 1629, Sultan Agung mempercayakan komando tertinggi pasukan darat kepada?",
      options: ["Adipati Pragola II", "Dipati Singaranu dan Kyai Juru Kiting", "Sultan Ageng Tirtayasa", "Raden Wijaya"],
      correct: 1,
      explanation: "Kyai Juru Kiting, seorang sesepuh Mataram, bersama Adipati Purbaya memegang tampuk komando tertinggi setelah kegagalan ekspedisi perintis di tahun sebelumnya."
    },
    {
      category: "Pertanyaan 07 \u00B7 Motifikasi Geopolitik",
      question: "Alasan pokok Sultan Agung bersikeras mengusir VOC dari Batavia adalah...",
      options: ["Sultan Agung ingin menjual rempah secara eksklusif ke Inggris", "Monopoli VOC menghalangi cita-cita penyatuan Pulau Jawa di bawah kedaulatan Mataram", "Batavia adalah tanah milik keluarga Keraton Mataram", "VOC menolak membayar pajak sewa pelabuhan di Jepara"],
      correct: 1,
      explanation: "Sultan Agung memandang monopoli dagang VOC di Batavia sebagai ancaman eksistensial terhadap hegemoni politik Mataram untuk mempersatukan seantero tanah Jawa."
    },
    {
      category: "Pertanyaan 08 \u00B7 Rintangan Alam",
      question: "Selain sabotase lumbung pangan, rintangan terbesar yang menggerogoti prajurit infanteri Mataram di Batavia adalah...",
      options: ["Gempa bumi tektonik dahsyat", "Wabah penyakit kolera, disentri, dan malaria di kawasan rawa", "Serangan mendadak bajak laut Tiongkok", "Kekurangan perbekalan panah dan tombak"],
      correct: 1,
      explanation: "Medan Batavia masa itu dipenuhi rawa-rawa liar beriklim tropis basah. Ribuan prajurit wafat bukan oleh peluru mesiu, melainkan akibat kolera dan malaria."
    },
    {
      category: "Pertanyaan 09 \u00B7 Pasukan Bantuan Lokal VOC",
      question: "Di dalam Kasteel Batavia, selain serdadu sewaan Eropa, VOC mengandalkan pertahanan dari milisi lokal yaitu...",
      options: ["Laskar Bugis dan Mardijkers", "Prajurit Kerajaan Pajajaran", "Laskar Diponegoro", "Pasukan Khusus Samudera Pasai"],
      correct: 0,
      explanation: "VOC merekrut orang Mardijkers (bekas budak Portugis yang dibebaskan) serta prajurit sewaan asal Ambon, Banda, dan Bugis untuk mempertahankan bastion."
    },
    {
      category: "Pertanyaan 10 \u00B7 Warisan Budaya Sultan Agung",
      question: "Karya monumental Sultan Agung di bidang kebudayaan dan penanggalan yang masih lestari hingga hari ini adalah...",
      options: ["Kitab Negarakertagama", "Kalender Jawa (Saka Islam)", "Sistem Aksara Dewanagari", "Kitab Smaradahana"],
      correct: 1,
      explanation: "Tahun 1633 M (1555 Saka), Sultan Agung memadukan Kalender Saka (matahari) dengan Kalender Hijriah (bulan), melahirkan sistem Kalender Jawa Islam yang unik."
    }
  ];

  var currentQIdx = 0;
  var quizScore = 0;

  function handleQuizAnswer(selectedIdx) {
    var q = quizDataset[currentQIdx];
    var buttons = document.querySelectorAll('.quiz-btn');
    var feedbackBox = document.getElementById('quiz-explanation-box');
    if (!q || !feedbackBox) return;
    var expTitle = document.getElementById('explanation-title');
    var expBody = document.getElementById('explanation-body');
    var expIcon = document.getElementById('explanation-icon');
    var nextBtn = document.getElementById('quiz-next-btn');

    // Disable all options
    buttons.forEach(function (b) { b.disabled = true; });

    if (selectedIdx === q.correct) {
      quizScore += 10;
      document.getElementById('quiz-live-score').textContent = quizScore + ' Poin';
      buttons[selectedIdx].classList.add('bg-secondary-fixed/50', 'text-on-secondary-fixed');
      expTitle.textContent = "Jawaban Tepat! (+10 Poin)";
      expIcon.textContent = "check_circle";
      expIcon.className = "material-symbols-outlined text-secondary text-[20px]";
    } else {
      buttons[selectedIdx].classList.add('bg-error-container', 'text-on-error-container');
      buttons[q.correct].classList.add('bg-secondary-fixed/50', 'text-on-secondary-fixed');
      expTitle.textContent = "Kurang Tepat";
      expIcon.textContent = "cancel";
      expIcon.className = "material-symbols-outlined text-error text-[20px]";
    }

    expBody.textContent = q.explanation;
    feedbackBox.classList.remove('hidden');
    nextBtn.disabled = false;
  }
  window.handleQuizAnswer = handleQuizAnswer;

  function nextQuestion() {
    currentQIdx++;
    if (currentQIdx >= quizDataset.length) {
      showQuizCompletion();
      return;
    }

    var q = quizDataset[currentQIdx];
    document.getElementById('question-category').textContent = q.category;
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('quiz-progress-text').textContent = 'Soal 0' + (currentQIdx + 1) + ' / 10';
    document.getElementById('quiz-progress-bar').style.width = ((currentQIdx + 1) * 10) + '%';

    var container = document.getElementById('quiz-options-container');
    var optionLetters = ['A', 'B', 'C', 'D'];
    container.innerHTML = '';

    q.options.forEach(function (opt, idx) {
      var btn = document.createElement('button');
      btn.onclick = function () { handleQuizAnswer(idx); };
      btn.className = "quiz-btn text-left p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-all flex items-start gap-space-sm group";
      btn.innerHTML = '<span class="w-7 h-7 rounded-full bg-surface-container-highest text-primary font-bold flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">' + optionLetters[idx] + '</span>' +
        '<span class="font-body-md text-body-md pt-0.5">' + opt + '</span>';
      container.appendChild(btn);
    });

    document.getElementById('quiz-explanation-box').classList.add('hidden');
    document.getElementById('quiz-next-btn').disabled = true;
  }
  window.nextQuestion = nextQuestion;

  function showQuizCompletion() {
    var card = document.getElementById('question-card');
    if (!card) return;
    card.innerHTML =
      '<div class="py-space-xl flex flex-col items-center text-center gap-space-md">' +
      '  <div class="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">' +
      '    <span class="material-symbols-outlined text-[36px]">military_tech</span>' +
      '  </div>' +
      '  <div class="flex flex-col gap-space-xs">' +
      '    <h3 class="font-headline-sm text-headline-sm text-primary">Evaluasi Selesai! Skor Anda: ' + quizScore + ' / 100</h3>' +
      '    <p class="font-body-md text-body-md text-on-surface-variant max-w-md">' +
      (quizScore >= 70
        ? 'Selamat! Anda berhak menyandang gelar kehormatan dan mengunduh sertifikat berstempel resmi di bawah ini.'
        : 'Wawasan Anda telah terasah. Ulangi kuis untuk memperbaiki pemahaman dan mencetak nilai sempurna.') +
      '    </p>' +
      '  </div>' +
      '  <a href="#participant-name-input" class="px-space-lg py-space-sm rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-all">' +
      '    Klaim dan Cetak Sertifikat Anda' +
      '  </a>' +
      '</div>';
  }

  /* ---------- Certificate Dynamic Preview Logic ---------- */
  function updateCertName(val) {
    var display = document.getElementById('cert-preview-name');
    if (!display) return;
    display.textContent = val.trim() === '' ? 'Raden Aria Santoso, M.Hum.' : val;
  }
  window.updateCertName = updateCertName;

  function updateCertRole(val) {
    var el = document.getElementById('cert-preview-role');
    if (el) el.textContent = val;
  }
  window.updateCertRole = updateCertRole;

  function downloadCertAction(format) {
    var input = document.getElementById('participant-name-input');
    var name = (input ? input.value : '') || 'Peserta';
    alert('Memproses penerbitan arsip digital... Sertifikat \'' + name + '\' siap diunduh dalam format ' + format + '.');
  }
  window.downloadCertAction = downloadCertAction;

  // Set today's date dynamically
  (function setToday() {
    var opts = { day: 'numeric', month: 'long', year: 'numeric' };
    var dateStr = new Date().toLocaleDateString('id-ID', opts);
    var target = document.getElementById('cert-issue-date');
    if (target) target.textContent = dateStr;
  })();

  function toggleMobileMenu() {
    var drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) drawer.classList.toggle('hidden');
  }
  window.toggleMobileMenu = toggleMobileMenu;

  /* ---------- Cleanup untuk SPA (dipanggil sa-spa.js sebelum swap) ---------- */
  window.SA = window.SA || {};
  window.SA.pageCleanup = function () {
    /* tidak ada modal persisten di halaman ini */
  };
})();
