/* main.js — inti global situs (gabungan sa-spa.js + scroll-fallback.js, Opsi A).
   1) SPA navigation ringan: link *.html di-intercept, <main> di-swap lewat fetch;
      skrip per-halaman dieksekusi ulang pada konten baru; header, footer, Tailwind,
      dan AudioContext gamelan tidak diganti sehingga musik tetap mulus antar halaman.
   2) Pemulihan scroll otomatis (wheel rescue): tidak berbuat apa pun saat halaman
      sehat; menyala hanya saat scrollY terkunci oleh ekstensi/driver.
   Dimuat sekali per kunjungan penuh; file peta PERSIST tidak dieksekusi ulang. */

(function () {
  "use strict";

  /* Skrip persisten: cukup dimuat sekali saat halaman pertama */
  var PERSIST = {
    "js/helpers.js": 1,
    "js/main.js": 1,
    "js/audio.js": 1,
    "js/search-palette.js": 1,
    "js/enhancements.js": 1
  };

  var busy = false;

  function resolve(href) {
    try { return new URL(href, location.href); } catch (err) { return null; }
  }

  function interceptable(a, e) {
    if (!a || !a.getAttribute) return false;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (e.defaultPrevented) return false; /* ex: smooth anchor sudah mencegat */
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download") || a.hasAttribute("data-no-spa")) return false;
    var u = resolve(href);
    if (!u || u.origin !== location.origin) return false;
    if (!/\.html?$/i.test(u.pathname)) return false;
    return true;
  }

  /* Buang semua skrip dari <main> hasil parse, urut sesuai dokumen */
  function extractScripts(newMain) {
    var list = [];
    newMain.querySelectorAll("script").forEach(function (node) {
      list.push({
        src: node.getAttribute("src") || "",
        type: node.getAttribute("type") || "",
        text: node.textContent || ""
      });
      node.parentNode.removeChild(node);
    });
    return list;
  }

  function executeScript(spec) {
    if (spec.src && PERSIST["js/" + spec.src.split("/").pop()]) return;
    var el = document.createElement("script");
    if (spec.src) {
      var u = resolve(spec.src);
      el.src = u ? u.href : spec.src;
      el.async = false; /* jaga urutan eksekusi */
    }
    if (spec.type) el.type = spec.type;
    el.text = spec.text;
    document.body.appendChild(el);
  }

  function loadPage(url, push) {
    if (busy) return;
    busy = true;

    /* Bersih-bersih halaman lama: tutup modal/drawer & pulihkan state body
       (pageCleanup dibuat tiap per-page JS; warisan.js dulu terset tapi tak pernah dipanggil) */
    try {
      if (window.SA && typeof window.SA.pageCleanup === "function") window.SA.pageCleanup();
    } catch (err) { /* cleanup gagal tidak boleh cegah navigasi */ }
    document.body.style.overflow = ""; /* pengaman: kalau overflow:hidden tertinggal, scroll mati semua page */

    var curMain = document.querySelector("main");
    if (curMain) {
      curMain.style.transition = "opacity 0.15s ease";
      curMain.style.opacity = "0.3";
    }

    fetch(url, { redirect: "follow" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var newMain = doc.querySelector("main");
      if (!newMain || !curMain) {
        location.href = url; /* struktur aneh: reload penuh */
        return;
      }

      var scripts = extractScripts(newMain);

      /* Swap konten: salin isi dan atribut class dari main baru */
      curMain.className = newMain.className;
      curMain.innerHTML = newMain.innerHTML;
      document.title = doc.title || document.title;

      scripts.forEach(executeScript);

      if (push) {
        try { history.pushState({}, "", url); } catch (err) {}
      }
      window.scrollTo(0, 0);
      curMain.style.opacity = "1";

      /* Pola interaksi halaman baru (reveal, counter, nav aktif, dsb.) */
      if (window.SA && window.SA.enhanceRefresh) window.SA.enhanceRefresh();
      document.dispatchEvent(new CustomEvent("sa:page:update"));

      busy = false;
    }).catch(function () {
      location.href = url; /* fetch gagal: reload penuh sebagai fallback */
    });
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!interceptable(a, e)) return;
    e.preventDefault();
    var u = resolve(a.getAttribute("href"));
    loadPage(u.href, true);
  }, false);

  window.addEventListener("popstate", function () {
    if (!/\.html?$/i.test(location.pathname)) return;
    loadPage(location.href, false);
  });
})();

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
