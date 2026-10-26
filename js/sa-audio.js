/* sa-audio.js: Gamelan Mataram - ambient loop generatif berbasis WebAudio.
   Tombol header [aria-label="Suasana Gamelan Pelog Mataram"] sebagai saklar.
   Pilihan tersimpan di sessionStorage; saat pindah halaman (MPA reload) musik
   diupayakan lanjut otomatis. Transisi antar halaman dihaluskan dengan
   fade-out cepat saat link internal diklik dan fade-in saat konteks aktif. */
(function () {
  "use strict";

  var SA = window.SA || (window.SA = {});
  var MODE_KEY = "gamelanMode";

  /* Skala pelog nem (perkiraan equal-tempered, C sebagai tumbuk) */
  var PELOG = [261.63, 293.66, 329.63, 392.0, 440.0];
  var GONG = 130.81;

  /* Volume master dan kecepatan fade transisi */
  var VOL = 0.45;
  var FADE_IN_S = 1.2;      /* masuk halaman baru: blend perlahan */
  var FADE_OUT_S = 0.18;    /* klik link: turun cepat sebelum reload */
  var FADE_RESUME_S = 0.9;  /* setelah konteks dibebaskan dari blokir */

  var state = { on: false, ac: null, master: null, timer: null, resumeArmed: false };

  var toggleBtn =
    document.querySelector('[aria-label="Suasana Gamelan Pelog Mataram"]') ||
    document.querySelector('button[aria-label*="Gamelan"]');

  function ensureAudio() {
    if (state.ac) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    state.ac = new AC();
    state.master = state.ac.createGain();
    state.master.gain.value = 0.0001; /* selalu mulai dari nol, lalu di-blend */
    state.master.connect(state.ac.destination);

    /* Saat konteks berpindah dari suspended ke running, blend naik
       perlahan dan lanjutkan loop. */
    state.ac.onstatechange = function () {
      if (state.ac.state === "running" && state.on) {
        rampGain(VOL, FADE_RESUME_S);
        if (!state.timer) loop();
      }
      syncButton();
    };
    return true;
  }

  /* Ramp gain master secara halus (perlu dipanggil saat konteks running) */
  function rampGain(target, secs) {
    if (!state.ac || !state.master) return;
    var g = state.master.gain;
    var now = state.ac.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value === 0 ? 0.0001 : g.value, now);
    g.linearRampToValueAtTime(target, now + secs);
  }

  function muteFast() {
    if (!state.ac || !state.master) return;
    var g = state.master.gain;
    var now = state.ac.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(0.0001, now + FADE_OUT_S);
  }

  function tone(freq, dur, vol, delaySec) {
    var ac = state.ac;
    if (!ac) return;
    var t0 = ac.currentTime + (delaySec || 0);

    var osc = ac.createOscillator();
    var g = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(state.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);

    /* Overton non-unisono, meniru pemanggungan perunggu */
    var osc2 = ac.createOscillator();
    var g2 = ac.createGain();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2.756;
    g2.gain.setValueAtTime(0.0001, t0);
    g2.gain.linearRampToValueAtTime(vol * 0.22, t0 + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.6);
    osc2.connect(g2);
    g2.connect(state.master);
    osc2.start(t0);
    osc2.stop(t0 + dur);
  }

  function scheduleBar() {
    var stepDur = 0.62;
    var count = 8 + Math.floor(Math.random() * 4);
    var prev = -1;
    for (var i = 0; i < count; i++) {
      var pick;
      do {
        pick = Math.floor(Math.random() * PELOG.length);
      } while (pick === prev && Math.random() > 0.35);
      prev = pick;
      tone(PELOG[pick], 1.5 + Math.random() * 0.6, 0.55, i * stepDur);
    }
    if (Math.random() > 0.5) {
      tone(GONG, 3.2, 0.4, count * stepDur);
    } else {
      tone(GONG * 1.5, 2.4, 0.25, count * stepDur);
    }
  }

  function loop() {
    if (!state.on) return;
    /* Jangan tumpuk nada saat konteks beku (suspended): jam audio
       tidak berjalan sehingga nada-nada baru menumpuk di titik sama. */
    if (state.ac.state !== "running") {
      state.timer = null;
      return;
    }
    scheduleBar();
    var nextBarMs = (10 + Math.floor(Math.random() * 4)) * 620;
    state.timer = setTimeout(loop, nextBarMs);
  }

  function audible() {
    return state.on && state.ac && state.ac.state === "running";
  }

  function armGestureResume() {
    if (state.resumeArmed || !state.ac || state.ac.state !== "suspended") return;
    state.resumeArmed = true;
    var events = ["pointerdown", "keydown", "touchstart"];
    function handler(e) {
      /* Klik tombol gamelan sendiri jangan dianggap gesture resume;
         biar click handler tombol yang menentukan (resume/stop). */
      if (toggleBtn && e.target && toggleBtn.contains(e.target)) return;
      if (!state.on || !state.ac || state.ac.state !== "suspended") {
        disarmGestureResume();
        return;
      }
      var p;
      try { p = state.ac.resume(); } catch (err) { p = null; }
      if (p && p.then) {
        p.then(function () { disarmGestureResume(); }).catch(function () {
          /* Ditolak browser (mis. scroll bukan user activation):
             listener dipertahankan untuk gesture berikutnya. */
        });
      }
    }
    state.resumeHandler = handler;
    events.forEach(function (ev) {
      document.addEventListener(ev, handler);
    });
  }

  function disarmGestureResume() {
    if (!state.resumeArmed || !state.resumeHandler) return;
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      document.removeEventListener(ev, state.resumeHandler);
    });
    state.resumeArmed = false;
    state.resumeHandler = null;
  }

  function syncButton() {
    if (!toggleBtn) return;
    var audibleNow = audible();
    toggleBtn.setAttribute("aria-pressed", state.on ? "true" : "false");
    /* Bar soundwave hanya beranimasi saat suara benar-benar berbunyi */
    toggleBtn.classList.toggle("audio-playing", audibleNow);
    if (state.on && !audibleNow) {
      toggleBtn.title = "Melanjutkan gamelan: klik atau sentuh halaman";
    } else if (audibleNow) {
      toggleBtn.title = "Hentikan musik gamelan ambient";
    } else {
      toggleBtn.title = "Putar suasana gamelan pelog Mataram";
    }
  }

  /* Smooth antar halaman: dengan SPA (sa-spa.js) tidak ada unload saat
     navigasi internal, jadi tidak perlu fade saat klik link. */

  function start() {
    if (!ensureAudio()) return;
    if (state.ac.state === "suspended") {
      state.ac.resume();
      armGestureResume();
    }
    state.on = true;
    try {
      sessionStorage.setItem(MODE_KEY, "1");
    } catch (err) {}
    if (state.ac.state === "running") {
      /* Blend masuk lembut: dari nyaris diam ke volume penuh */
      rampGain(VOL, FADE_IN_S);
    }
    loop();
    syncButton();
  }

  /* Matikan semua penjadwal nada aktif */
  function raid() {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  }

  /* Turunkan volume pelan lalu hentikan jadwal nada */
  function stopSmooth() {
    if (state.ac && state.ac.state === "running") {
      muteFast();
      var delay = Math.ceil(FADE_OUT_S * 1000) + 60;
      /* Bila sempat diganti start lagi dalam jeda ini, batalkan raid */
      setTimeout(function () {
        if (!state.on) raid();
      }, delay);
    } else {
      raid();
    }
  }

  function stop() {
    state.on = false;
    disarmGestureResume();
    stopSmooth();
    try {
      sessionStorage.setItem(MODE_KEY, "0");
    } catch (err) {}
    syncButton();
  }

  function toggle() {
    if (state.on && state.ac && state.ac.state === "running") {
      stop();
    } else if (state.on && state.ac && state.ac.state === "suspended") {
      /* Musik dimaksudkan on tapi nyangkut autoplay: klik ini meresume */
      state.ac.resume();
    } else {
      start();
    }
  }

  function init() {
    if (!toggleBtn) return;
    toggleBtn.addEventListener("click", toggle);

    var saved = 0;
    try {
      saved = parseInt(sessionStorage.getItem(MODE_KEY) || "0", 10) || 0;
    } catch (err) {}

    /* Niat on dari halaman sebelumnya: lanjutkan otomatis. Bila browser
       memblokir (suspended), listener interaksi pertama sudah disiapkan,
       dan onstatechange melakukan blend naik saat terbebas. */
    if (saved === 1) {
      start();
    }

    syncButton();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && state.on) {
        muteFast();
        raid();
      } else if (!document.hidden && state.on) {
        if (state.ac.state === "suspended") {
          state.ac.resume();
        } else {
          rampGain(VOL, FADE_RESUME_S);
          loop();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  SA.gamelan = { toggle: toggle, start: start, stop: stop };
})();
