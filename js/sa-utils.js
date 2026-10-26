/* sa-utils.js: utilitas minimal yang diekspor ke window.SA.
   Pengganti ringkas untuk util shared.js (generasi desain lama).
   Dimuat sebelum skrip halaman (index.js, dsb.) dan enhancements.js. */
(function () {
  "use strict";

  window.SA = window.SA || {};
  var SA = window.SA;

  SA.$ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };

  SA.$$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  SA.esc = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  SA.clamp = function (v, min, max) {
    return Math.min(max, Math.max(min, v));
  };

  SA.reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
})();
