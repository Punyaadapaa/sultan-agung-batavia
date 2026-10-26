/* sa-peta.js - Peta interaktif realistis Jawa 1628-1629 (port dari aset standalone, di-retint ke token situs).
   UX: wheel biasa = scroll halaman normal; Ctrl+wheel / pinch / tombol +/- / drag = kontrol peta.
   Skrip ini TIDAK persisten: re-init tiap navigasi SPA karena DOM baru. Listener window lama
   dijaga dengan isConnected guard. */
(function () {
  "use strict";

  var wrap = document.getElementById("peta-wrap");
  if (!wrap || wrap.dataset.spInit) return;
  wrap.dataset.spInit = "1";

  var NS = "http://www.w3.org/2000/svg";
  var W = 1000, H = 360;

  /* Skin (retint token situs: navy #01081c, gold #805600, krem) */
  var style = document.createElement("style");
  style.textContent = [
    "#peta-wrap{--sp-land:#f3eddc;--sp-sea:#e6eae3;--sp-ink:#1a1c1a;--sp-mut:#56615a;--sp-gold:#805600;--sp-line:#c9b46a}",
    "#peta-wrap svg{width:100%;height:100%;display:block;cursor:grab;touch-action:pan-y}",
    "#peta-wrap svg:active{cursor:grabbing}",
    "#peta-wrap svg text{font-family:'Plus Jakarta Sans',sans-serif;paint-order:stroke;stroke:var(--sp-land);stroke-width:3px;stroke-linejoin:round;fill:var(--sp-ink)}",
    "#peta-wrap .sp-ctl{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;z-index:10}",
    "#peta-wrap .sp-ctl button{width:36px;height:36px;border:1px solid var(--sp-line);background:rgba(255,255,255,.95);color:var(--sp-ink);border-radius:6px;font:600 18px 'Plus Jakarta Sans',sans-serif;cursor:pointer;box-shadow:0 1px 4px rgba(1,8,28,.10)}",
    "#peta-wrap .sp-ctl button:hover{background:#fdfaf0}",
    "#peta-wrap .sp-sc{position:absolute;left:12px;bottom:10px;font-size:12px;color:var(--sp-ink);z-index:10}",
    "#peta-wrap .sp-sc i{display:block;height:5px;border:1.5px solid var(--sp-ink);border-top:0;margin-bottom:2px}",
    "#peta-wrap .sp-layer{position:absolute;left:12px;top:10px;background:rgba(255,255,255,.92);border:1px solid var(--sp-line);border-radius:8px;padding:8px 10px;font-size:11px;color:var(--sp-ink);z-index:10;box-shadow:0 1px 4px rgba(1,8,28,.10)}",
    "#peta-wrap .sp-layer label{display:flex;align-items:center;gap:6px;padding:2px 0;cursor:pointer}",
    "#peta-wrap .sp-legend{position:absolute;right:12px;bottom:10px;max-width:250px;background:rgba(255,255,255,.92);border:1px solid var(--sp-line);border-radius:8px;padding:6px 9px;font-size:10px;line-height:1.45;color:#45464d;z-index:10}",
    "@media(max-width:640px){#peta-wrap .sp-legend{display:none}}",
    "#peta-wrap .sp-pt{cursor:pointer}#peta-wrap .sp-pt:focus{outline:none}#peta-wrap .sp-pt.on .m{stroke:#1a1c1a;stroke-width:2.5}"
  ].join("");
  document.head.appendChild(style);

  /* SVG root */
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Peta interaktif realistis Pulau Jawa abad ke-17, jalur ekspedisi Mataram 1628-1629");
  wrap.appendChild(svg);

  var P = function (c) { return [(c[0] - 105) * 100, -c[1] * 100 - 550]; };
  var mid = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
  function closed(a) {
    a = a.map(P); var n = a.length, d = "M" + mid(a[n - 1], a[0]);
    for (var i = 0; i < n; i++) d += "Q" + a[i] + " " + mid(a[i], a[(i + 1) % n]);
    return d + "Z";
  }
  function open(a) {
    a = a.map(P); var d = "M" + a[0];
    for (var i = 1; i < a.length - 1; i++) d += "Q" + a[i] + " " + mid(a[i], a[i + 1]);
    return d + "L" + a[a.length - 1];
  }
  function el(t, at, par, txt) {
    var e = document.createElementNS(NS, t);
    for (var k in at) e.setAttribute(k, at[k]);
    if (txt) e.textContent = txt;
    (par || svg).appendChild(e);
    return e;
  }

  /* Lapisan */
  var layers = {};
  ["sea", "land", "reg", "riv", "mt", "route", "pl"].forEach(function (id, i) {
    layers[id] = el("g", { id: "sp-" + id }, svg);
    layers[id].dataset.name = ["", "", "Wilayah (perkiraan)", "Sungai besar", "Gunung berapi", "Jalur serangan", "Kota dan situs"][i];
    layers[id].dataset.col = ["", "", "#c9a227", "#4a90a4", "#8a6d3b", "#805600", "#2e7d5b"][i];
  });

  /* laut + garis lintang / bujur */
  el("rect", { x: -80, y: -80, width: W + 160, height: H + 160, fill: "var(--sp-sea)" }, layers.sea);
  for (var lo = 105; lo <= 115; lo++) {
    el("line", { x1: (lo - 105) * 100, x2: (lo - 105) * 100, y1: -80, y2: H + 80, stroke: "var(--sp-mut)", "stroke-opacity": .13 }, layers.sea);
    el("text", { x: (lo - 105) * 100 + 3, y: 11, "font-size": 8, style: "stroke:none;fill:var(--sp-mut)" }, layers.sea, lo + "\u00B0BT");
  }
  for (var la = 6; la <= 9; la++) {
    el("line", { x1: -80, x2: W + 80, y1: la * 100 - 550, y2: la * 100 - 550, stroke: "var(--sp-mut)", "stroke-opacity": .13 }, layers.sea);
    el("text", { x: 3, y: la * 100 - 552, "font-size": 8, style: "stroke:none;fill:var(--sp-mut)" }, layers.sea, la + "\u00B0LS");
  }

  /* daratan (koordinat nyata) */
  var jawa = [[105.3,-6.8],[105.5,-6.55],[105.95,-6.05],[106.1,-5.93],[106.4,-5.95],[106.6,-6.0],[106.82,-6.1],[107.0,-6.0],[107.4,-5.95],[107.8,-6.25],[108.3,-6.3],[108.57,-6.72],[109.0,-6.85],[109.4,-6.85],[109.7,-6.9],[110.2,-6.9],[110.45,-6.95],[110.6,-6.85],[110.65,-6.58],[110.95,-6.45],[111.15,-6.72],[111.45,-6.7],[112.05,-6.9],[112.5,-6.9],[112.65,-7.12],[112.75,-7.22],[112.9,-7.65],[113.2,-7.72],[113.7,-7.72],[113.95,-7.7],[114.4,-7.85],[114.4,-8.2],[114.45,-8.5],[114.35,-8.72],[113.9,-8.55],[113.45,-8.4],[112.7,-8.4],[112.2,-8.3],[111.75,-8.3],[111.1,-8.2],[110.6,-8.15],[110.3,-8.03],[109.9,-7.85],[109.45,-7.75],[109.0,-7.72],[108.5,-7.72],[107.7,-7.65],[106.4,-7.4],[106.5,-7.05],[106.3,-6.9],[105.8,-6.85]];
  el("path", { d: closed(jawa), fill: "var(--sp-land)", stroke: "#7a6a2c", "stroke-width": 1.2 }, layers.land);
  el("path", { d: closed([[112.72,-7.1],[113.0,-6.9],[113.5,-6.88],[113.87,-6.95],[114.15,-7.05],[113.8,-7.17],[113.3,-7.2],[112.9,-7.2]]), fill: "var(--sp-land)", stroke: "#7a6a2c", "stroke-width": 1.2 }, layers.land);
  el("path", { d: closed([[108.8,-7.78],[109.1,-7.7],[109.25,-7.72],[109.0,-7.8]]), fill: "var(--sp-land)", stroke: "#7a6a2c" }, layers.land);
  el("path", { d: closed([[114.45,-8.15],[115.0,-8.1],[115.0,-8.75],[114.5,-8.8]]), fill: "var(--sp-land)", stroke: "#7a6a2c", "stroke-dasharray": "3 2" }, layers.land);

  var lbl = function (x, y, t, s) {
    el("text", { x: x, y: y, "text-anchor": "middle", "font-size": s || 9, "font-style": "italic", style: "stroke:none;fill:var(--sp-mut)" }, layers.sea, t);
  };
  lbl(520, 45, "L a u t   J a w a", 11);
  lbl(520, 345, "S a m u d r a   H i n d i a", 11);
  lbl(18, 40, "Sumatra", 8);
  lbl(960, 285, "Bali", 8);
  lbl(35, 90, "Selat Sunda", 7);

  /* wilayah Mataram (perkiraan batas kekuasaan 1628) */
  var R = [
    ["Negara Agung, inti Mataram", "#d4af37", [[109.7,-7.2],[110.6,-7.2],[110.9,-7.6],[110.8,-8.1],[110.0,-8.0],[109.6,-7.6]]],
    ["Mancanegara Kulon", "#2e9e75", [[108.9,-7.3],[109.7,-7.2],[109.6,-7.6],[110.0,-8.0],[109.0,-7.7],[108.8,-7.5]]],
    ["Mancanegara Wetan", "#3f8fb0", [[110.9,-7.6],[111.5,-7.3],[112.4,-7.5],[112.2,-8.1],[111.2,-8.1],[110.8,-8.1]]],
    ["Pesisir utara", "#1f7a8c", [[109.0,-6.85],[110.0,-6.85],[110.6,-6.6],[111.0,-6.5],[111.4,-6.65],[112.1,-6.85],[112.1,-7.15],[111.3,-7.1],[110.6,-7.0],[109.9,-7.15],[109.0,-7.1]]],
    ["Jawa Timur taklukan (Surabaya, Pasuruan)", "#7d5ba6", [[112.2,-7.2],[112.9,-7.2],[113.2,-7.7],[112.9,-8.0],[112.2,-7.9]]],
    ["Cirebon dan Priangan, daerah pengaruh", "#c77d2e", [[107.5,-6.3],[108.7,-6.6],[108.7,-7.2],[107.8,-7.4],[107.4,-7.0]]],
    ["Kesultanan Banten, merdeka", "#b3261e", [[105.5,-6.5],[106.4,-6.0],[106.7,-6.5],[106.4,-7.0],[105.7,-6.9]]],
    ["Blambangan, belum ditaklukkan", "#8a8a8a", [[113.8,-7.8],[114.4,-8.0],[114.4,-8.6],[113.7,-8.4]]]
  ];
  R.forEach(function (r) {
    var e = el("path", { d: closed(r[2]), fill: r[1], "fill-opacity": .26, stroke: r[1], "stroke-width": 1, "stroke-dasharray": "4 3" }, layers.reg);
    var ti = document.createElementNS(NS, "title"); ti.textContent = r[0]; e.appendChild(ti);
  });

  /* sungai */
  [[[111.0,-7.95],[110.83,-7.57],[111.45,-7.4],[111.88,-7.15],[112.4,-7.08],[112.55,-7.12]],
   [[112.6,-8.0],[112.0,-7.85],[112.45,-7.47],[112.75,-7.28]],
   [[110.2,-7.4],[110.15,-7.7],[110.1,-7.95]],
   [[109.9,-7.3],[109.4,-7.45],[109.1,-7.65]],
   [[107.6,-7.0],[107.45,-6.5],[107.45,-6.0]],
   [[110.5,-7.6],[110.4,-7.95]]].forEach(function (r) {
    el("path", { d: open(r), fill: "none", stroke: "#4a90a4", "stroke-width": 1.3, opacity: .9 }, layers.riv);
  });

  /* gunung berapi */
  var G = [["Krakatau",105.42,-6.1],["Salak",106.73,-6.72],["Gede",106.98,-6.78],["Tangkuban Perahu",107.6,-6.76],["Ciremai",108.4,-6.89],["Galunggung",108.06,-7.25],["Slamet",109.21,-7.24],["Dieng",109.92,-7.2],["Sindoro",109.99,-7.3],["Sumbing",110.07,-7.38],["Merbabu",110.44,-7.45],["Merapi",110.44,-7.54],["Muria",110.88,-6.62],["Lawu",111.19,-7.63],["Wilis",111.76,-7.81],["Kelud",112.31,-7.93],["Arjuno",112.58,-7.75],["Bromo",112.95,-7.94],["Semeru",112.92,-8.11],["Raung",114.04,-8.12],["Ijen",114.24,-8.06]];
  var mts = G.map(function (m) {
    var c = P([m[1], m[2]]);
    var g = el("g", { transform: "translate(" + c[0] + " " + c[1] + ")" }, layers.mt);
    el("path", { d: "M-1 .8 L0 -1.2 L1 .8Z", fill: "#8a6d3b", stroke: "#4b3a1a", "stroke-width": .15 }, g);
    var t = el("text", { y: -2, "text-anchor": "middle", style: "font-size:9px" }, g, m[0]);
    return { g: g, t: t, x: c[0], y: c[1] };
  });

  /* jalur: darat (solid, gold) + armada bahari (dash, navy) */
  el("path", { id: "sp-route-land", d: open([[110.4,-7.85],[110.22,-7.47],[110.2,-6.95],[109.68,-6.89],[109.14,-6.87],[108.55,-6.72],[108.3,-6.4],[107.8,-6.35],[107.3,-6.31],[106.82,-6.13]]), fill: "none", stroke: "#805600", "stroke-width": 2.6, "stroke-linecap": "round" }, layers.route);
  el("path", { id: "sp-route-sea", d: open([[110.2,-6.88],[109.6,-6.6],[108.8,-6.35],[108.0,-5.9],[107.2,-5.75],[106.8,-5.95]]), fill: "none", stroke: "#01081c", "stroke-width": 2.2, "stroke-dasharray": "5 4", "stroke-linecap": "round" }, layers.route);

  /* penanda: id, nama, lon, lat, tipe, sisi, teks */
  var T = [
    ["Kerta dan Kotagede", 110.4, -7.85, "k", "r", "Pusat Mataram. Kotagede adalah ibu kota pertama sejak 1587; Sultan Agung (bertakhta 1613\u20131645) memindahkan keraton ke Kerta di dekatnya."],
    ["Imogiri", 110.39, -7.93, "s", "b", "Makam raja-raja Mataram, mulai dibangun pada 1632 atas perintah Sultan Agung di atas bukit."],
    ["Kedu (Magelang)", 110.22, -7.47, "s", "l", "Dataran subur di antara Merapi, Merbabu, Sindoro, dan Sumbing. Menjadi lumbung beras pasukan dan jalur ke pantai utara."],
    ["Pajang", 110.76, -7.56, "s", "l", "Bekas kerajaan yang ditaklukkan Senopati, pendiri Mataram. Surakarta belum ada pada masa ini."],
    ["Madiun", 111.52, -7.63, "s", "b", "Pusat Mancanegara Wetan, wilayah timur yang dikuasai lewat para adipati."],
    ["Kediri", 112.01, -7.82, "s", "b", "Bekas pusat kerajaan kuno di lembah Brantas; masuk pengaruh Mataram lewat penaklukan di timur."],
    ["Banyumas", 109.3, -7.51, "s", "l", "Pusat Mancanegara Kulon di lembah Serayu, penyedia pasukan dan bahan pangan di barat."],
    ["Demak", 110.64, -6.89, "p", "r", "Kesultanan Islam pertama di Jawa. Masjid Agung Demak tetap menjadi sumber wibawa agama bagi raja-raja Mataram."],
    ["Jepara", 110.67, -6.59, "p", "r", "Pelabuhan dan galangan kapal penting di pantai utara; kapal dan awak laut Mataram banyak berasal dari sini."],
    ["Kendal", 110.2, -6.92, "p", "t", "Pangkalan utama serangan 1628. Tumenggung Bahureksa memimpin pasukan pertama dari sini, dan kapal serta bekal dikumpulkan di pelabuhannya."],
    ["Semarang", 110.42, -6.97, "p", "b", "Pelabuhan pesisir di bawah Mataram. VOC baru menguasainya pada 1678."],
    ["Pekalongan", 109.68, -6.89, "p", "b", "Kota pesisir di jalur darat ke barat. Pasukan dan pedati bekal melewati jalan pantai ini."],
    ["Pati", 111.03, -6.75, "p", "r", "Pada 1627 Pati memberontak melawan Mataram dan ditumpas. Kejadian ini menunda rencana menyerang Batavia."],
    ["Tegal", 109.14, -6.87, "p", "t", "Pelabuhan tempat bekal dan kapal dikumpulkan. VOC membakar lumbung dan kapal di pesisir ini pada 1628\u20131629."],
    ["Cirebon", 108.55, -6.72, "p", "b", "Kesultanan sekutu Mataram sejak 1613. Pelabuhan dan perhentian pasukan menuju barat."],
    ["Sumedang", 107.92, -6.85, "s", "b", "Pusat Priangan. Masuk lingkup Mataram sejak sekitar 1620, ketika Priangan diminta tunduk."],
    ["Karawang", 107.3, -6.31, "s", "b", "Pos terdepan dan lumbung beras untuk pasukan yang mengepung Batavia. Pada 1629 VOC menghancurkan lumbungnya."],
    ["Batavia (VOC)", 106.82, -6.13, "v", "r", "Dibangun J.P. Coen pada 1619 di bekas Jayakarta. Dikepung dua kali, 1628 dan 1629, tetapi bertahan. Coen wafat pada 21 September 1629."],
    ["Banten", 106.15, -6.03, "r", "l", "Kesultanan merdeka, pusat perdagangan lada. Bersaing dengan VOC dan juga dengan Mataram."],
    ["Surabaya", 112.74, -7.25, "p", "r", "Lawan terbesar di timur. Jatuh pada 1625 setelah dikepung bertahun-tahun, dengan sungai dan lumbung diputus."],
    ["Gresik dan Giri", 112.65, -7.17, "p", "t", "Kedaton Giri adalah pusat ulama berpengaruh. Baru tunduk pada Mataram pada 1636."],
    ["Tuban", 112.05, -6.9, "p", "t", "Pelabuhan lama yang ditaklukkan sekitar 1619."],
    ["Madura", 113.3, -7.05, "s", "t", "Ditaklukkan pada 1624. Pangeran Cakraningrat dari Madura kemudian dipakai sebagai sekutu Mataram."],
    ["Pasuruan", 112.9, -7.65, "p", "r", "Dikuasai pada kisaran 1616\u20131617 sebagai bagian dari pergerakan ke timur."],
    ["Blambangan", 114.3, -8.25, "r", "l", "Kerajaan Hindu di ujung timur Jawa. Belum ditaklukkan pada 1628 dan baru diserang Mataram pada 1639."]
  ];

  var sh = {
    k: "M0-7.5L2.2-2.4 7.5-2.4 3.3 .9 5 6.3 0 3 -5 6.3 -3.3 .9 -7.5-2.4-2.2-2.4Z",
    v: "M-5-5H5V5H-5Z",
    r: "M0-6.5L6.5 0 0 6.5-6.5 0Z"
  };
  var fill = { k: "#fdbe59", p: "#2e7d5b", s: "#faf7ea", v: "#e87c1e", r: "#c0392b" };
  var TYPE = { k: "Keraton & Pusat Kerajaan", p: "Pelabuhan & Kota Pesisir", s: "Situs Pedalaman", v: "Pos VOC", r: "Kekuatan Regional" };
  var WHO = { k: "Kesultanan Mataram", p: "Pelabuhan Kerajaan Mataram", s: "Administrasi Kabupaten Mataram", v: "Vereenigde Oostindische Compagnie", r: "Kekuatan regional non-Mataram" };
  var ARMY = { k: "Pasukan inti kerajaan", p: "Kapal & awak laut kerajaan", s: "Pasukan & logistik daerah", v: "Garnisun benteng VOC", r: "Pasukan regional mandiri" };
  var NODE_KEY = { "Kerta dan Kotagede": "karta", "Kendal": "kendal", "Tegal": "tegal", "Cirebon": "cirebon", "Karawang": "karawang", "Batavia (VOC)": "batavia" };

  var pls = T.map(function (it) {
    var c = P([it[1], it[2]]);
    var g = el("g", { "class": "sp-pt", tabindex: 0, role: "button", "aria-label": it[0] }, layers.pl);
    if (it[3] === "p" || it[3] === "s") {
      el("circle", { r: 5, "class": "m", fill: fill[it[3]], stroke: "#1a1c1a", "stroke-width": 1.2 }, g);
    } else {
      el("path", { d: sh[it[3]], "class": "m", fill: fill[it[3]], stroke: "#1a1c1a", "stroke-width": 1.2 }, g);
    }
    var dxT = { r: 9, l: -9, t: 0, b: 0 }[it[4]], dyT = { t: -9, b: 16, r: 4, l: 4 }[it[4]];
    el("text", { x: dxT, y: dyT, "text-anchor": { r: "start", l: "end", t: "middle", b: "middle" }[it[4]], style: "font-size:11px;font-weight:600" }, g, it[0]);
    return { g: g, name: it[0], lo: it[1], la: it[2], tipe: it[3], desc: it[5], x: c[0], y: c[1] };
  });

  /* kontrol: layer, zoom, skala, legenda */
  var layerBox = document.createElement("div");
  layerBox.className = "sp-layer";
  ["reg", "riv", "mt", "route", "pl"].forEach(function (id) {
    var l = document.createElement("label");
    l.innerHTML = '<input type="checkbox" checked><span class="sw" style="background:' + layers[id].dataset.col + '"></span>' + layers[id].dataset.name;
    l.firstChild.onchange = function (e) { layers[id].style.display = e.target.checked ? "" : "none"; };
    layerBox.appendChild(l);
  });
  wrap.appendChild(layerBox);

  var ctl = document.createElement("div");
  ctl.className = "sp-ctl";
  var mkBtn = function (txt, aria) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = txt; b.setAttribute("aria-label", aria);
    ctl.appendChild(b); return b;
  };
  var zi = mkBtn("+", "Perbesar peta");
  var zo = mkBtn("\u2212", "Perkecil peta");
  var zr = mkBtn("\u27F2", "Atur ulang tampilan peta");
  zr.style.fontSize = "13px";
  wrap.appendChild(ctl);

  var sc = document.createElement("div");
  sc.className = "sp-sc";
  sc.innerHTML = '<i id="sp-bar"></i>100 km';
  wrap.appendChild(sc);
  var barEl = sc.querySelector("i");

  var lg = document.createElement("div");
  lg.className = "sp-legend";
  lg.textContent = "Bintang emas: pusat Mataram \u2022 Hijau: kota pesisir \u2022 Putih: pedalaman \u2022 Persegi oranye: VOC \u2022 Belah ketupat merah: kekuatan luar. Garis pantai & gunung memakai koordinat nyata; batas wilayah hanya perkiraan.";
  wrap.appendChild(lg);

  /* viewport, zoom, geser */
  var v = { x: 0, y: 0, w: W };
  var cw = function () { return wrap.clientWidth; };
  var ch = function () { return wrap.clientHeight; };
  var markerBy = {};

  function apply() {
    if (!barEl || !wrap.isConnected) return;
    var c = cw(), hc = ch();
    if (!c || !hc) return; /* elemen belum berukuran: lewati */
    var k = v.w / c;
    if (!isFinite(k) || k <= 0) return;
    var hh0 = v.w * hc / c;
    v.w = Math.max(60, Math.min(v.w, 1100));
    hh0 = v.w * hc / c;
    v.x = Math.max(-60, Math.min(v.x, W + 60 - v.w));
    v.y = Math.max(-80, Math.min(v.y, H + 80 - hh0));
    svg.setAttribute("viewBox", v.x + " " + v.y + " " + v.w + " " + hh0);
    pls.forEach(function (p) { p.g.setAttribute("transform", "translate(" + p.x + " " + p.y + ") scale(" + k + ")"); });
    mts.forEach(function (m) {
      m.g.setAttribute("transform", "translate(" + m.x + " " + m.y + ")");
      m.t.setAttribute("transform", "scale(" + k + ")");
      m.t.style.display = k < .55 ? "" : "none";
    });
    barEl.style.width = (91 / k) + "px";
  }
  function reset() {
    v = { x: 0, y: (H - W * ch() / cw()) / 2, w: W };
    if (cw() < 700) { v.w = 700; v.x = 60; }
    apply();
  }
  function zoom(f, cx, cy) {
    var px = v.x + cx * v.w, py = v.y + cy * v.w * ch() / cw();
    v.w /= f;
    v.x = px - cx * v.w;
    v.y = py - cy * v.w * ch() / cw();
    apply();
  }

  var cur = null;
  function clearCards() {
    var cards = wrap.parentElement.parentElement.querySelectorAll(".route-node");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("bg-surface-container-high", "shadow-md");
      cards[i].classList.add("bg-surface-container-low");
    }
  }
  function genericPanel(p) {
    clearCards();
    var g = function (id) { return document.getElementById(id); };
    if (g("detail-badge")) g("detail-badge").textContent = TYPE[p.tipe];
    if (g("detail-distance")) g("detail-distance").textContent = (-p.la).toFixed(2) + "\u00B0 LS, " + p.lo.toFixed(2) + "\u00B0 BT";
    if (g("detail-title")) g("detail-title").textContent = p.name;
    if (g("detail-desc")) g("detail-desc").textContent = p.desc;
    if (g("detail-commander")) g("detail-commander").textContent = WHO[p.tipe];
    if (g("detail-force")) g("detail-force").textContent = ARMY[p.tipe];
  }

  var moved = false;
  pls.forEach(function (p) {
    markerBy[NODE_KEY[p.name] || p.name] = p;
    var pick = function () {
      var key = NODE_KEY[p.name];
      if (cur) cur.classList.remove("on");
      cur = p.g; p.g.classList.add("on");
      if (key && window.selectNode) { window.selectNode(key); }
      else { genericPanel(p); }
    };
    p.g.addEventListener("click", function () { if (!moved) pick(); });
    p.g.addEventListener("keydown", function (e) { if (e.key === "Enter") pick(); });
  });

  /* API untuk index.js: no-op jika DOM instans ini sudah terput (SPA swap) */
  window.SAPeta = {
    focus: function (key) {
      if (!wrap.isConnected) return;
      var p = markerBy[key];
      if (!p) return;
      if (cur) cur.classList.remove("on");
      cur = p.g; p.g.classList.add("on");
      v.x = p.x - v.w / 2;
      v.y = p.y - (v.w * ch() / cw()) / 2;
      apply();
    },
    setMode: function (year) {
      if (!wrap.isConnected) return;
      var land = document.getElementById("sp-route-land");
      var sea = document.getElementById("sp-route-sea");
      if (!land || !sea) return;
      if (year === "1628") {
        land.style.opacity = "0.95"; sea.style.opacity = "0.7";
      } else {
        land.style.opacity = "0.35"; sea.style.opacity = "0.95";
      }
    }
  };

  /* wheel: hanya Ctrl+wheel yang zoom peta; wheel biasa membiarkan halaman scroll */
  wrap.addEventListener("wheel", function (e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    var r = wrap.getBoundingClientRect();
    zoom(e.deltaY < 0 ? 1.25 : .8, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  }, { passive: false });

  var ptr = new Map(), pd = 0;
  wrap.addEventListener("pointerdown", function (e) {
    ptr.set(e.pointerId, e); moved = false; pd = 0;
    if (ptr.size === 2) {
      var arr = Array.from(ptr.values());
      pd = Math.hypot(arr[0].clientX - arr[1].clientX, arr[0].clientY - arr[1].clientY);
    }
  });
  wrap.addEventListener("pointermove", function (e) {
    if (!ptr.has(e.pointerId)) return;
    var o = ptr.get(e.pointerId);
    var r = wrap.getBoundingClientRect();
    if (ptr.size === 1) {
      var dx = e.clientX - o.clientX, dy = e.clientY - o.clientY;
      if (Math.hypot(dx, dy) > 1) moved = true;
      v.x -= dx * v.w / cw();
      v.y -= dy * v.w / cw();
      apply();
    } else if (ptr.size === 2) {
      ptr.set(e.pointerId, e);
      var arr = Array.from(ptr.values());
      var d = Math.hypot(arr[0].clientX - arr[1].clientX, arr[0].clientY - arr[1].clientY);
      if (pd) zoom(d / pd, ((arr[0].clientX + arr[1].clientX) / 2 - r.left) / r.width, ((arr[0].clientY + arr[1].clientY) / 2 - r.top) / r.height);
      pd = d; moved = true;
    }
    ptr.set(e.pointerId, e);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) {
    wrap.addEventListener(t, function (e) {
      ptr.delete(e.pointerId); pd = 0;
      setTimeout(function () { moved = false; }, 60);
    });
  });

  zi.onclick = function () { zoom(1.4, .5, .5); };
  zo.onclick = function () { zoom(1 / 1.4, .5, .5); };
  zr.onclick = reset;
  var rl = function () { if (wrap.isConnected) reset(); };
  window.addEventListener("resize", rl);
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () {
      if (!wrap.isConnected) { mo.disconnect(); window.removeEventListener("resize", rl); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (window.requestAnimationFrame) {
    requestAnimationFrame(function () { reset(); window.SAPeta.setMode("1628"); });
  } else {
    reset();
    window.SAPeta.setMode("1628");
  }
})();
