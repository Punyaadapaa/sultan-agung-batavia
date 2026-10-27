/* utils/helpers.js — helper umum diekspor ke window.SA.
   Sebelumnya js/sa-utils.js. Dimuat sebelum skrip halaman dan modul modul lain. */
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
