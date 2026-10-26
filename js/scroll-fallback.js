/* scroll-fallback.js — Pemulihan scroll otomatis (mouse wheel & trackpad).
   Prinsip: saat halaman sehat, script ini TIDAK melakukan apa pun (biarkan browser default).
   Jika terdeteksi event wheel datang tapi scrollY tidak berubah padahal tidak berada di ujung
   halaman (kasus ekstensi/driver yang memanggil preventDefault), mode "rescue" menyala:
   handler memangkas preventDefault & menggulir manual (scrollBy instant).

   Versi 2 — anti-jeda setelah refresh:
   1. Ketika aktifasi, flag disimpan di sessionStorage. Halaman berikutnya / setelah refresh
      langsung menyala mode rescue SEJAK EVENT PERTAMA — tidak ada masa "kumpul bukti" lagi
      sehingga tak terasa jeda/ngelag setiap kali refresh.
   2. Ambang deteksi lebih cepat: 160px delta dalam window 220ms (sebelumnya 350px/400ms).
      Gulir normal tetap tidak terganggu: begitu scrollY bergerak, jejak langsung direset.
   3. Penjaga panel dalam: wheel di atas elemen yang bisa discroll sendiri (glossary, modal,
      panel overflow) diteruskan ke bawaan browser — tidak diculik oleh rescue. */
(function () {
  "use strict";
  var FLAG = "saWheelRescue";
  if (window.__SAWheelRescue) return; /* cegah dobel-inisialisasi */
  window.__SAWheelRescue = true;
  window.__SAWheelRescueActive = false;

  var trace = []; /* {t, y, dy} */

  function activate(sumDy) {
    window.__SAWheelRescueActive = true;
    try { sessionStorage.setItem(FLAG, "acv"); } catch (err) {}
    trace.length = 0;
    window.scrollBy({ top: sumDy, behavior: "instant" });
  }

  function maxScroll() {
    var d = document.documentElement;
    return Math.max(0, d.scrollHeight - d.clientHeight);
  }

  function normDelta(e) {
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;           /* baris → piksel */
    else if (e.deltaMode === 2) dy *= document.documentElement.clientHeight;
    return dy;
  }

  /* Cari scrollable container manual (overflow auto/scroll) dari event target ke atas.
     Return null bila tidak ada yang bisa digulir ke arah dy. */
  function innerScrollable(t, dy) {
    var el = t instanceof Element ? t : null;
    while (el && el !== document.documentElement && el !== document.body) {
      var cs = window.getComputedStyle(el);
      var ov = cs.overflowY;
      if ((ov === "auto" || ov === "scroll") && el.scrollHeight > el.clientHeight + 1) {
        var canUp = el.scrollTop > 1;
        var canDown = el.scrollTop < el.scrollHeight - el.clientHeight - 1;
        if ((dy < 0 && canUp) || (dy > 0 && canDown)) return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  window.addEventListener("wheel", function (e) {
    if (e.ctrlKey || e.metaKey) return; /* zoom browser/peta tetap default */

    if (window.__SAWheelRescueActive) {
      /* liberkan wheel untuk scrollable panel dalam (glosarium, modal, dsb.) */
      if (innerScrollable(e.target, normDelta(e))) return;
      e.preventDefault();
      window.scrollBy({ top: normDelta(e), behavior: "instant" });
      return;
    }

    /* ==== FASE DETEKSI ==== */
    var dy = normDelta(e);
    if (innerScrollable(e.target, dy)) return; /* di dalam panel: bukan urusan halaman */

    trace.push({ t: e.timeStamp, y: window.scrollY, dy: dy });
    if (trace.length > 40) trace.shift();
    rescueCheck();
  }, { passive: false });

  function rescueCheck() {
    if (trace.length < 3) return;
    var first = trace[0], last = trace[trace.length - 1];
    var win = last.t - first.t;
    if (win < 220) return;                     /* window observasi belum cukup */

    var sumDy = 0, i;
    for (i = 0; i < trace.length; i++) sumDy += trace[i].dy;
    var moved = last.y !== first.y;

    if (moved) { trace.length = 0; return; }   /* scroll jalan normal: reset jejak */
    if (Math.abs(sumDy) < 160) return;         /* delta belum signifikan: tunggu */

    /* Tidak bergerak padahal input signifikan — pastikan bukan karena memang di ujung halaman */
    var y = window.scrollY, mx = maxScroll();
    if ((sumDy < 0 && y <= 0) || (sumDy > 0 && y >= mx)) {
      trace.length = 0;
      return;
    }

    /* AKTIFKAN RESCUE: telan input yang tertahan supaya terasa langsung merespons */
    activate(sumDy);
  }

  /* Re-arm instan bila penyelamatan sudah pernah menyala di session ini
     (menutup "jeda setelah refresh"): mode aktif dari wheel pertama. */
  try {
    if (sessionStorage.getItem(FLAG) === "acv") {
      /* jangan lansung aktif saat halaman masih memutih — tunggu frame pertama yang
         stabil, supaya kalau kondisi sudah sehat pun pengguliran manual tetap nyaman */
      requestAnimationFrame(function () {
        window.__SAWheelRescueActive = true;
      });
    }
  } catch (err) {}

  /* SPA: pindah halaman tidak menyalakan ulang mekanisme (flag window tetap satu). */
})();
