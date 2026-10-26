/* sa-spa.js: SPA navigation ringan untuk situs ini.
   Link internal *.html di-intercept; <main> di-swap lewat fetch; skrip
   per-halaman (src + inline) dieksekusi ulang pada konten baru.
   Header, footer, Tailwind, dan AudioContext gamelan tidak diganti,
   sehingga musik tetap berbunyi mulus antar halaman. Jika fetch gagal
   (mis. dibuka via file://), navigasi jatuh ke reload penuh. */
(function () {
  "use strict";

  /* Skrip persisten: cukup dimuat sekali saat halaman pertama */
  var PERSIST = {
    "js/sa-utils.js": 1,
    "js/sa-spa.js": 1,
    "js/sa-audio.js": 1,
    "js/enhancements.js": 1,
    "js/scroll-fallback.js": 1
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
