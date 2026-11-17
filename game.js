'use strict';
if (typeof SFX === 'undefined') {                // audio.js tidak ada -> game tetap jalan tanpa suara
  const mute = new Proxy({}, { get: () => () => {} });
  window.SFX = mute; window.BGM = mute;
}
/* ============ ASSET ============
   Struktur folder (BOOM Defuse):  index.html, style.css, spawn.js, game.js, folder "In game Asset", folder "Look Around".
   Jika folder asset ada di tempat lain, ubah DIR (contoh: '../In game Asset/'). */
const DIR = 'In game Asset/';
const src = f => encodeURI(DIR + f);      // asset game biasa (di dalam "In game Asset")
const srcLA = f => encodeURI(f);
const srcRoot = srcLA;                      // folder "Menu" & "Level Picker" juga di folder game (BOOM Defuse)           // folder "Look Around" ada di folder game (BOOM Defuse), BUKAN di dalam "In game Asset"
const P = {
  bomb:     'Asset Bomb.png',
  book:     'Asset Buku Hint.png',
  scissors: 'Asset Gunting.png',
  uiBomb:   'UI/UI Bomb (FullScreen).png',
  uiHint:   'UI/UI Hint Book kosong (Floating UI).png',
  uiRumus:  'UI/UI Rumus (Floating UI).png'
};

/* ============ ASSET MENU & LEVEL PICKER (folder di samping index.html) ============ */
const MENU = { bg: 'Menu/Background Menu.png', title: 'Menu/BOOM Defuse Title.png', play: 'Menu/Play Button.png',
  clues: 'Menu/Clues Button.png' };            // tombol Clues (opsional: kalau belum ada, tampil tombol teks)
const INF_ASSET = { bg: 'Informan/Background Informan.png', char: 'Informan/Informan.png' };   // opsional: kalau belum ada, tampil latar gelap + emoji
const PICK = { bg: 'Level Picker/Background LevelPicker.png', title: 'Level Picker/Rolling Title.png',
  diff: [['Easy', 'Level Picker/Level/Easy.png'], ['Medium', 'Level Picker/Level/Medium.png'], ['Hard', 'Level Picker/Level/Hard.png']] };  // urutan = Level 1, 2, 3
const PICK_WAIT = 2000, PICK_STEPS = 17, PICK_COUNT = 3;   // jeda sebelum rolling (ms), jumlah langkah rolling, hitung mundur (detik)

/* ============ KONFIGURASI LEVEL (ubah di sini) ============
   map  : gambar peta Look Around (ukuran harus sama dengan W/H di spawn.js)
   objs : urutan HARUS sesuai karakter kode ->
          [emoji cadangan, nama, nama-file-dasar, ukuran terbesar (piksel peta), jumlah varian (opsional)]
   Lokasi asset Look Around (di folder yang sama dengan index.html, di luar "In game Asset"):
     Look Around/Level N/Angka +/<dasar> +.png      dan     Look Around/Level N/Angka -/<dasar> -.png
     Objek bervarian (Penumpang): Look Around/Level 3/Angka +/Penumpang +/Penumpang 1 +.png  (1..4, dipilih acak)
   Kalau file belum ada, game memakai emoji + lencana +/- sebagai cadangan. */
const LEVELS = {
  1: { place: 'Taman',   time: 150, reward: 100,
       bg: 'BackGround/background belakang meja level 1 (taman).jpeg',
       table: 'Meja/Asset meja Kayu Level 1.png',
       map: 'Look Around/Level 1/BackGround Taman.jpeg',
       objs: [['🍎','Apel','Apel',18], ['🪑','Bangku','Bangku',28], ['🗑️','Tong sampah','Tong',22], ['🌳','Pohon','Pohon',42]] },
  2: { place: 'Kantor',  time: 180, reward: 250,
       bg: 'BackGround/background belakang meja level 2 (kantor).jpeg',
       table: 'Meja/Asset meja Kantor Level 2.png',
       map: 'Look Around/Level 2/BackGround Kantor.jpeg',
       objs: [['🖥️','Monitor','Monitor',28], ['📺','TV','TV',34], ['🖱️','Mouse','Mouse',13], ['🪑','Kursi','Chair',26]] },
  3: { place: 'Pesawat', time: 210, reward: 500,
       bg: 'BackGround/background belakang tanpa meja level 3 (pesawat).jpeg',
       table: null,                                   // level 3: tanpa meja, bom di lantai
       map: 'Look Around/Level 3/BackGround Pesawat.jpeg',
       objs: [['🧳','Koper','Koper',52], ['🧍','Penumpang','Penumpang',48,4], ['🧯','Gas Pemadam','Gas Pemadam',42], ['🪟','Jendela','Jendela',46]] }
};
const WORDS = ['Halo','Bom','Api','Aman','Kode','Sip','Ya','Gas','Kita','Run','Zip','Ok'];
const WIRE_COLORS = ['Hijau', 'Merah', 'Biru'];

/* Koordinat (piksel gambar) layar, panel timer, tombol, dan area keypad pada asset bom */
const GB = { W: 1092, H: 551, scr: [370,184,601,358], tm: [642,160,783,254],            // bom idle
  enter: [434,392,524,423], space: [664,389,758,406], kx0: 640, ky0: 281, cover: [637,278,786,386] };
const GF = { W: 758, H: 427, scr: [184,110,415,284], tm: [452,87,597,181],              // UI bom fullscreen
  enter: [248,316,338,349], space: [478,315,571,332], kx0: 454, ky0: 207, cover: [451,203,601,312] };
const KW = 17, KH = 17, COLP = 125 / 6, ROWP = 27;           // ukuran & jarak tombol huruf
const LAYOUT = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'];   // 26 huruf (G dan W dibuat ulang)
const WIRES = [  // [warna, sisi, titik jalur kabel pada gambar bom idle]
  ['Hijau','Kiri',  '300,220 250,210 200,187 150,160 100,144 60,146 35,165 33,200 50,224 76,235'],
  ['Merah','Kiri',  '300,253 200,253 100,251 75,257 63,280'],
  ['Biru','Kiri',   '300,277 250,283 200,297 150,306 100,308 85,303'],
  ['Hijau','Kanan', '830,210 860,200 900,182 950,172 1000,170 1037,178 1050,200 1043,230 1017,248 983,257 963,253'],
  ['Merah','Kanan', '830,280 877,284 910,289 950,296 990,301 1017,299 1023,293 1003,287 975,288'],
  ['Biru','Kanan',  '830,307 860,317 887,333 910,350 937,373 960,388 990,397 1023,387 1040,367 1042,347 1030,330 1013,322']
];

/* ============ UTIL & ENKRIPSI (Tabel Kuantifikasi) ============ */
const $ = id => document.getElementById(id);
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Kapital A-Z = 1..26, kecil a-z = -1..-26, spasi = 0
const toVal = c => c === ' ' ? 0 : A.includes(c) ? A.indexOf(c) + 1 : -(A.indexOf(c.toUpperCase()) + 1);
const randCase = s => [...s].map(c => Math.random() < .5 ? c.toUpperCase() : c.toLowerCase()).join('');
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const left = () => S && !S.over && S.end ? Math.max(0, Math.ceil((S.end - Date.now()) / 1000)) : 0;

function genCode() {            // maksimal 4 karakter (jumlah objek per level)
  const r = Math.random();
  if (r < .15) return randCase(A[rnd(26)] + ' ' + A[rnd(26)]);
  if (r < .45) return randCase(Array.from({length: 1 + rnd(4)}, () => A[rnd(26)]).join(''));
  const w = pick(WORDS), s = Math.random();
  return s < .3 ? w.toUpperCase() : s < .5 ? w.toLowerCase() : w;
}

/* ============ ASSET OBJEK LOOK AROUND (+ dan -) ============ */
const oimg = (lv, o, neg, v = 1) => {
  const g = neg ? '-' : '+', base = `Look Around/Level ${lv}/Angka ${g}/`;
  return (o[4] > 1) ? `${base}${o[2]} ${g}/${o[2]} ${v} ${g}.png` : `${base}${o[2]} ${g}.png`;
};
const oimgTag = (o, neg, cls = '', v = 1) =>
  `<img class="${cls}" src="${srcLA(oimg(S.lv, o, neg, v))}" data-e="${o[0]}" data-neg="${neg ? 1 : ''}" alt="${o[1]} ${neg ? '(-)' : '(+)'}" onerror="fb(this)">`;
function fb(img) {               // gambar objek tidak ada -> pakai emoji + lencana +/-
  const sp = document.createElement('span');
  sp.className = 'fbk' + (img.dataset.neg ? ' neg' : '');
  sp.textContent = img.dataset.e;
  img.replaceWith(sp);
}

/* ============ SPAWN OBJEK LOOK AROUND (data zona ada di spawn.js) ============
   Aturan spawn tiap objek:
   Level 1: Pohon = di mana saja di taman | Apel = di sekitar pohon | Tong sampah = sekitar jalan | Bangku = jalan + tempat ramai
   Level 2: Monitor = hanya di atas meja kerja | Mouse = di sebelah monitor | TV = hampir semua ruang (bukan toilet) | Kursi = semua ruang, biasanya di belakang meja
   Level 3: Koper = badan utama (bukan kokpit/ruang pramugari) | Penumpang = hanya di kursi | Gas Pemadam = di mana saja | Jendela = hanya di dinding pesawat */
const pairs = a => { const r = []; for (let i = 0; i < a.length; i += 2) r.push([a[i], a[i + 1]]); return r; };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jit = ([x, y], j) => [x + (Math.random() - .5) * j, y + (Math.random() - .5) * j];
const inPoly = (x, y, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const POOL = {};
function pool(lv) {              // ubah array datar [x,y,x,y,...] jadi daftar titik, sekali saja
  if (POOL[lv]) return POOL[lv];
  const D = SPAWN[lv], p = {};
  if (lv === 1) { p.tree = pairs(D.tree); p.trash = pairs(D.trash); p.path = pairs(D.benchPath); p.crowd = pairs(D.benchCrowd); }
  if (lv === 2) { p.desk = pairs(D.desk); p.tv = pairs(D.tv); p.ring = pairs(D.ring); p.floor = pairs(D.floor); }
  if (lv === 3) { p.seats = D.seats; }
  return POOL[lv] = p;
}

function genOrder(lv, len) {      // urutan objek acak untuk satu kode: karakter ke-j <-> objek order[j]
  return shuffle(LEVELS[lv].objs.map((_, i) => i)).slice(0, len);
}
function spawnZone(lv, code, order) {   // hasil: [{k: indeks objek, neg, v, x, y}] dalam piksel peta
  const D = SPAWN[lv], cfg = LEVELS[lv], P_ = pool(lv), cv = [...code].map(toVal);
  const vals = cfg.objs.map(() => 0);                // nilai per objek (indeks objek, bukan posisi karakter)
  order.forEach((k, j) => { vals[k] = cv[j] || 0; });
  const out = [], used = [];
  const n = k => Math.abs(vals[k] || 0), isNeg = k => (vals[k] || 0) < 0, sz = k => cfg.objs[k][3];
  const clampXY = ([x, y]) => [Math.min(D.W - 10, Math.max(10, x)), Math.min(D.H - 10, Math.max(10, y))];
  const find = (gen, r) => {                           // cari titik yang tidak menimpa objek lain (80 percobaan)
    let best = null, bd = -1e9;
    for (let t = 0; t < 80; t++) {
      const p = clampXY(gen(t));
      const d = used.length ? Math.min(...used.map(u => Math.hypot(u[0] - p[0], u[1] - p[1]) - (u[2] + r) * .55)) : 1;
      if (d >= 0) return p;
      if (d > bd) { bd = d; best = p; }                // kalau penuh, ambil titik yang paling longgar
    }
    return best;
  };
  const put = (k, p) => { out.push({ k, neg: isNeg(k), v: 1 + rnd(cfg.objs[k][4] || 1), x: Math.round(p[0]), y: Math.round(p[1]) }); used.push([p[0], p[1], sz(k)]); };
  const make = (k, gen) => { const r = []; for (let i = 0; i < n(k); i++) { const p = find(gen, sz(k)); put(k, p); r.push(p); } return r; };

  if (lv === 1) {
    const trees = make(3, () => jit(pick(P_.tree), 8));                              // Pohon
    make(2, () => jit(pick(P_.trash), 6));                                           // Tong sampah (jalanan)
    make(1, () => jit(pick(Math.random() < .5 ? P_.path : P_.crowd), 6));            // Bangku (jalanan + ramai)
    const anc = trees.length ? trees : [pick(P_.tree), pick(P_.tree), pick(P_.tree)];
    make(0, t => {                                                                   // Apel (sekitar pohon, makin lama mencari makin jauh)
      const a = pick(anc), g = Math.random() * 6.283, d = 14 + Math.random() * (28 + t * 4);
      return [a[0] + Math.cos(g) * d, a[1] + Math.sin(g) * d];
    });
  } else if (lv === 2) {
    const mons = make(0, () => jit(pick(P_.desk), 4));                               // Monitor (di meja)
    make(1, () => jit(pick(P_.tv), 6));                                              // TV
    const OFF = [[24, 6], [-24, 6], [24, -10], [-24, -10], [0, 20], [40, 6], [-40, 6], [0, -22]];
    for (let i = 0; i < n(2); i++) {                                                 // Mouse (di sebelah monitor)
      const a = mons.length ? mons[i % mons.length] : pick(P_.desk);
      const o = OFF[(mons.length ? Math.floor(i / mons.length) : 0) % OFF.length];
      put(2, clampXY([a[0] + o[0], a[1] + o[1]]));
    }
    make(3, () => jit(pick(Math.random() < .7 ? P_.ring : P_.floor), 6));           // Kursi (biasanya di belakang meja)
  } else {
    const seats = shuffle(P_.seats.slice());
    for (let i = 0; i < n(1) && i < seats.length; i++) put(1, seats[i]);             // Penumpang (hanya di kursi)
    make(3, () => {                                                                  // Jendela (hanya di dinding)
      const w = pick(D.walls), t = .01 + Math.random() * .98;
      return [w[0] + (w[2] - w[0]) * t, w[1] + (w[3] - w[1]) * t];
    });
    const xs = D.hull.map(p => p[0]), ys = D.hull.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    make(2, () => {                                                                  // Gas pemadam (di mana saja di badan pesawat)
      for (let t = 0; t < 200; t++) {
        const x = x0 + Math.random() * (x1 - x0), y = y0 + Math.random() * (y1 - y0);
        if (inPoly(x, y, D.hull)) return [x, y];
      }
      return [(x0 + x1) / 2, (y0 + y1) / 2];
    });
    const [a, b, c, d] = D.cabin;
    make(0, () => {                                                                  // Koper (badan utama, bukan zona terlarang)
      for (let t = 0; t < 60; t++) {
        const x = a + 20 + Math.random() * (c - a - 40), y = b + 15 + Math.random() * (d - b - 30);
        if (!D.excl.some(e => x >= e[0] && x <= e[2] && y >= e[1] && y <= e[3])) return [x, y];
      }
      return [(a + c) / 2, (b + d) / 2];
    });
  }
  return out;
}

/* ============ STATE ============ */
let S = null, tick = null, backTimer = null, Z = 6;
const money = () => { try { return +localStorage.getItem('bd_coin') || 0; } catch (e) { return 0; } };
const addMoney = n => { try { localStorage.setItem('bd_coin', money() + n); } catch (e) {} };

/* ============ DETEKSI GAMBAR GAGAL DIMUAT ============ */
const missing = [];
const errBox = document.createElement('div');
errBox.id = 'imgerr'; errBox.hidden = true;
$('stage').appendChild(errBox);
const fade = document.createElement('div');   // layar hitam untuk fade out / fade in
fade.id = 'fade'; $('stage').appendChild(fade);
document.addEventListener('error', e => {       // error gambar tidak bubbling, jadi pakai capture
  const t = e.target;
  if (!t || t.tagName !== 'IMG' || t.dataset.opt) return;   // data-opt = gambar opsional, jangan tampilkan peringatan
  let u = t.getAttribute('src') || '';
  try { u = decodeURIComponent(u); } catch (x) {}
  if (!missing.includes(u)) missing.push(u);
  errBox.hidden = false;
  errBox.innerHTML = '<b>Gambar tidak ditemukan:</b><br>' + missing.slice(0, 4).join('<br>') +
    '<br>Pastikan folder "In game Asset" satu folder dengan index.html, atau ubah DIR / nama file di game.js.';
}, true);

/* ============ ALUR GAME ============ */
let pickT = [];                                  // timer milik Level Picker (dibatalkan saat kembali ke menu)
const later = (fn, ms) => { const t = setTimeout(fn, ms); pickT.push(t); return t; };
const clearPick = () => { pickT.forEach(clearTimeout); pickT = []; };

function menu() {
  clearInterval(tick); clearTimeout(backTimer); clearPick(); stopType(); S = null; BGM.play('menu');
  $('bar').hidden = true; $('bar').innerHTML = '';
  $('hud').hidden = true; $('hud').textContent = ''; $('hud').classList.remove('warn');
  $('overlay').hidden = true; $('overlay').className = ''; $('overlay').innerHTML = '';
  $('floats').innerHTML = '';
  $('stage').classList.remove('nocur');
  fade.style.opacity = 0;
  if (typeof SPAWN === 'undefined') {            // spawn.js belum dimuat -> Look Around peta tidak bisa jalan
    $('scene').innerHTML = `<section class="menu"><h1>spawn.js tidak ditemukan</h1>
      <p>Letakkan file <b>spawn.js</b> (data zona spawn) satu folder dengan index.html dan game.js, lalu refresh (Ctrl+F5).</p></section>`;
    return;
  }
  $('scene').innerHTML = `<div class="mn">
    <img class="bg" src="${srcRoot(MENU.bg)}" alt="">
    <img class="mn-title" src="${srcRoot(MENU.title)}" alt="BOOM Defuse">
    <button class="mn-play" onclick="openPicker()" aria-label="Play"><img src="${srcRoot(MENU.play)}" alt="Play"></button>
    <button class="mn-clues" onclick="openInformant()" aria-label="Clues"><img data-opt="1" src="${srcRoot(MENU.clues)}" alt="Clues"
      onload="this.parentNode.classList.add('img')" onerror="this.replaceWith(document.createTextNode('CLUES'))"></button>
    <div class="chip mn-coin">Koin: ${money()}</div>
    <div class="mn-ver">Versi: Look Around peta v2</div></div>`;
}

/* ============ LEVEL PICKER: ROLLING KESULITAN ============ */
function openPicker() {          // Play -> halaman Level Picker -> 2 dtk -> rolling -> hitung mundur -> fade -> game
  clearPick(); BGM.play('picker');
  const target = rnd(3), N = PICK_STEPS, first = ((target - (N - 1)) % 3 + 3) % 3;   // rolling berakhir tepat di target
  $('scene').innerHTML = `<div class="lp">
    <img class="bg" src="${srcRoot(PICK.bg)}" alt="">
    <img class="lp-title" src="${srcRoot(PICK.title)}" alt="Rolling">
    <div class="lp-card idle" id="lpcard">${PICK.diff.map(d => `<img class="lp-d" src="${srcRoot(d[1])}" alt="${d[0]}">`).join('')}</div>
    <div class="lp-info"><div class="lp-msg" id="lpmsg">Menyambungkan panggilan...</div><div class="lp-cnt" id="lpcnt"></div></div></div>`;
  const imgs = [...document.querySelectorAll('.lp-d')], card = $('lpcard'), msg = $('lpmsg'), cnt = $('lpcnt');
  const show = i => imgs.forEach((im, k) => im.classList.toggle('on', k === i));
  show(first);

  const finish = () => {                         // rolling berhenti -> hitung mundur
    card.classList.add('done'); SFX.pick();
    msg.textContent = 'Kesulitan: ' + PICK.diff[target][0];
    const count = n => {
      cnt.innerHTML = `<small>Mulai dalam</small>${n}`; SFX.beep(n === 1);
      later(n > 1 ? () => count(n - 1) : leave, 1000);
    };
    count(PICK_COUNT);
  };
  const leave = () => {                          // fade out -> masuk game -> fade in
    fade.style.opacity = 1; SFX.whoosh();
    later(() => { startLevel(target + 1); fade.style.opacity = 0; }, 650);
  };
  const roll = i => {                            // cepat -> melambat -> berhenti
    show((first + i) % 3); SFX.roll(i);
    card.classList.remove('idle', 'tick'); void card.offsetWidth; card.classList.add('tick');
    if (i < N - 1) later(() => roll(i + 1), 60 * Math.pow(1.14, i)); else finish();
  };
  later(() => { msg.textContent = 'Memilih tingkat kesulitan...'; roll(0); }, PICK_WAIT);
}

function startLevel(lv) {        // dipanggil setelah rolling selesai: level = hasil rolling
  const cfg = LEVELS[lv], codes = Array.from({length: lv}, genCode);
  const orders = codes.map(c => genOrder(lv, c.length));   // urutan objek acak per kode
  S = { lv, cfg, codes, orders, spawn: codes.map((c, i) => spawnZone(lv, c, orders[i])), cam: null, done: 0, wire: null, page: 0, zone: 0,
        buf: '', fb: '', caps: false, view: 'brief', over: false, busy: false, end: 0 };
  BGM.play(lv);
  briefing();
}

/* ============ EFEK KETIK (narator & informan) ============ */
let TW = null;
function stopType() { if (TW) { clearTimeout(TW.t); TW = null; } }
function typeText(el, text, cb) {
  stopType(); el.textContent = '';
  let i = 0; const w = TW = { el, text, cb, t: 0 };
  const step = () => {
    if (TW !== w) return;
    i++; el.textContent = text.slice(0, i); if (i % 3 === 0) SFX.type();
    if (i >= text.length) { TW = null; if (cb) cb(); } else w.t = setTimeout(step, 20);
  };
  step();
}
function skipType() {            // klik saat sedang mengetik = tampilkan semua teks langsung
  if (!TW) return false;
  const w = TW; clearTimeout(w.t); TW = null; w.el.textContent = w.text; if (w.cb) w.cb();
  return true;
}
function emo(img) {              // gambar opsional tidak ada -> emoji
  const sp = document.createElement('span'); sp.className = 'emo'; sp.textContent = img.dataset.e; img.replaceWith(sp);
}

/* ============ NARATOR AWAL MISI (story.js) ============ */
function briefing() {
  const st = STORY[S.lv], cfg = S.cfg;
  $('scene').innerHTML = bg() + `<div class="brief" onclick="briefNext()">
    <div class="brief-tag">${st.diff} &middot; ${st.place} &middot; Waktu ${fmt(cfg.time)} &middot; Hadiah ${cfg.reward} koin</div>
    <h2>${st.title}</h2><div class="brief-text" id="btext"></div>
    <div class="brief-foot"><button class="big" id="bgo" onclick="event.stopPropagation();briefNext()">Lewati</button></div></div>`;
  typeText($('btext'), st.intro.join('\n\n'), () => { const b = $('bgo'); if (b) b.textContent = 'Mulai misi'; });
}
function briefNext() { if (skipType()) return; if (S && S.view === 'brief') start(); }

/* ============ INFORMAN & CLUES (story.js) ============
   Alur: pilih level -> bayar informan -> PILIH topik yang ingin dibeli -> petunjuk masuk ke roadmap.
   Semua petunjuk terkumpul -> pelaku terungkap. Progres disimpan di localStorage (bd_clues). */
let PROG = (() => { try { return JSON.parse(localStorage.getItem('bd_clues')) || {}; } catch (e) { return {}; } })();
const saveProg = () => { try { localStorage.setItem('bd_clues', JSON.stringify(PROG)); } catch (e) {} };
const IF = { lv: 1, pending: false };            // pending = sudah bayar tapi belum memilih topik
const infSay = (text, cb) => typeText($('inftext'), text, cb);

function openInformant() {
  clearPick(); stopType(); IF.pending = false; BGM.play('informant');
  $('scene').innerHTML = `<div class="inf">
    <img class="bg" data-opt="1" src="${srcRoot(INF_ASSET.bg)}" alt="" onerror="this.remove()">
    <div class="inf-tabs" id="inftabs"></div>
    <div class="chip inf-coin" id="infcoin"></div>
    <button class="inf-back" onclick="infLeave()">Kembali</button>
    <div class="inf-road" id="infroad"></div>
    <div class="inf-char"><img data-opt="1" data-e="&#128373;&#65039;" src="${srcRoot(INF_ASSET.char)}" alt="Informan" onerror="emo(this)"></div>
    <div class="inf-box" onclick="skipType()"><div class="inf-name">${INFORMANT.name}, sang Informan</div><div class="inf-text" id="inftext"></div></div>
    <button class="inf-pay" id="infpay" onclick="infPay()"></button>
    <div class="inf-pick" id="infpick" hidden></div></div>`;
  infRefresh(); infGreet();
}
function infRefresh() {
  const st = STORY[IF.lv], got = PROG[IF.lv] || [], n = st.clues.length, done = got.length >= n;
  $('inftabs').innerHTML = [1, 2, 3].map(l => `<button class="${l === IF.lv ? 'on' : ''}" onclick="infTab(${l})">${STORY[l].diff} &middot; ${STORY[l].place}</button>`).join('');
  $('infcoin').textContent = 'Koin: ' + money();
  $('infroad').innerHTML = `<div class="rd-head"><b>Roadmap Petunjuk &ndash; ${st.place}</b><span>${got.length} / ${n}</span></div>
    <div class="rd-grid">${st.clues.map((c, i) => got.includes(i)
      ? `<button class="rd-node on" onclick="infReplay(${i})"><i>${i + 1}</i><span>${c.t}</span></button>`
      : `<button class="rd-node" disabled><i>${i + 1}</i><span>???</span></button>`).join('')}</div>
    <div class="rd-end ${done ? 'on' : ''}">Pelaku: ${done ? st.reveal.name : '???'}</div>`;
  const pay = $('infpay');
  pay.innerHTML = done ? 'Kasus selesai' : `Bayar informan<small>${st.cost} koin</small>`;
  pay.disabled = done || IF.pending;
  const pk = $('infpick');
  if (IF.pending) {
    pk.hidden = false;
    pk.innerHTML = `<div class="pk-box"><h3>Pilih informasi yang ingin kamu beli</h3><div class="pk-grid">${
      st.clues.map((c, i) => got.includes(i) ? '' : `<button onclick="infChoose(${i})">${c.t}</button>`).join('')}</div>
      <button class="pk-cancel" onclick="infCancel()">Batal (uang dikembalikan)</button></div>`;
  } else { pk.hidden = true; pk.innerHTML = ''; }
}
function infGreet() {
  const st = STORY[IF.lv], done = (PROG[IF.lv] || []).length >= st.clues.length;
  infSay(done ? st.done : pick(st.greet));
}
function infRefund() {           // pergi / ganti tab / batal sebelum memilih topik -> uang kembali
  if (!IF.pending) return;
  addMoney(STORY[IF.lv].cost); IF.pending = false;
}
function infTab(l) { clearPick(); infRefund(); IF.lv = l; infRefresh(); infGreet(); }
function infLeave() { infRefund(); menu(); }
function infCancel() { infRefund(); infRefresh(); infSay(pick(INFORMANT.cancel)); }
function infPay() {
  const st = STORY[IF.lv];
  if (IF.pending || (PROG[IF.lv] || []).length >= st.clues.length) return;
  if (money() < st.cost) { SFX.deny(); return infSay(pick(INFORMANT.broke)); }
  SFX.coin(); addMoney(-st.cost); IF.pending = true; infRefresh(); infSay(pick(INFORMANT.pay));
}
function infChoose(i) {
  if (!IF.pending) return;
  clearPick();
  const lv = IF.lv, st = STORY[lv], got = PROG[lv] || (PROG[lv] = []);
  IF.pending = false;
  if (!got.includes(i)) got.push(i);
  saveProg();
  const done = got.length >= st.clues.length;
  SFX.reveal(); if (done) setTimeout(SFX.win, 500);
  infRefresh();
  infSay(st.clues[i].d, done ? () => later(() => { if (IF.lv === lv) infSay(st.reveal.text); }, 1200) : null);
}
function infReplay(i) { infSay(STORY[IF.lv].clues[i].d); }

function start() {
  stopType();
  S.end = Date.now() + S.cfg.time * 1000;
  tick = setInterval(updateTimer, 250); go('table');
}

function paintTime() {
  const t = left();
  document.querySelectorAll('.tm').forEach(e => { e.textContent = fmt(t); e.classList.toggle('warn', t <= 30); });
  return t;
}
let lastSec = -1;
function updateTimer() {
  if (!S || S.over) return;
  const t = paintTime();
  if (t !== lastSec) { lastSec = t; if (t > 0 && t <= 60) SFX.tick(t <= 10 ? 2 : t <= 30 ? 1 : 0); }   // detak makin cepat menjelang habis
  if (t <= 0) boom('Timer mencapai 00:00.');
}

function end(cls, title, line) {
  BGM.stop(); S.over = true; clearInterval(tick); $('stage').classList.remove('nocur');
  const o = $('overlay'); o.className = cls; o.hidden = false;
  o.innerHTML = `<h1>${title}</h1><p>${line}</p><button onclick="menu()">Kembali ke menu</button>`;
  backTimer = setTimeout(menu, 4000);        // otomatis kembali ke main page
}
function win() { SFX.win(); addMoney(S.cfg.reward); end('win', 'Bom jinak!', `Kamu menang dan mendapat ${S.cfg.reward} koin.`); }
function boom(why) { if (S && !S.over) { SFX.boom(); end('boom', 'BOOM!', `${why}<br>Kamu kalah. Tidak ada koin.`); } }

/* ============ KOMPONEN ============ */
const bg = () => `<img class="bg" src="${src(S.cfg.bg)}" alt="">`;
const tbl = () => S.cfg.table ? `<img class="tbl" src="${src(S.cfg.table)}" alt="">` : '';
const pos = (G, [a, b, c, d]) => `left:${a / G.W * 100}%;top:${b / G.H * 100}%;width:${(c - a) / G.W * 100}%;height:${(d - b) / G.H * 100}%`;

function screenHTML() {          // isi layar hijau di bom
  const n = S.codes.length;
  if (S.done >= n) return `<small>KODE BENAR</small><b>POTONG\n${S.wire.c.toUpperCase()} ${S.wire.s.toUpperCase()}</b>`;
  return `<small>KODE ${S.done + 1}/${n}${S.caps ? ' [CAPS]' : ''}</small><b>${S.buf}_</b><small>${S.fb}</small>`;
}
function keysHTML(G, live) {     // keypad 26 huruf; live = bisa diklik (fullscreen)
  const t = live ? 'button' : 'div';
  let h = `<div class="well" style="${pos(G, G.cover)}"></div>`;
  LAYOUT.forEach((row, i) => [...row].forEach((c, j) => {
    const x = G.kx0 + j * COLP, y = G.ky0 + i * ROWP;
    h += `<${t} class="key" style="${pos(G, [x, y, x + KW, y + KH])}"${live ? ` aria-label="${c}" onclick="addCh('${c}')"` : ''}>${c}</${t}>`;
  }));
  return h;
}
function bombBox(G, cls, st, extra = '') {
  const full = cls === 'full';
  return `<div class="bw ${cls}" style="${st}"><img src="${src(full ? P.uiBomb : P.bomb)}" alt="Bom">
    <div class="scr" style="${pos(G, G.scr)}">${screenHTML()}</div>
    ${full ? `<div class="tm" style="${pos(G, G.tm)}">${fmt(left())}</div>` : ''}${keysHTML(G, full)}${extra}</div>`;
}
const refresh = () => { document.querySelectorAll('.scr').forEach(e => e.innerHTML = screenHTML()); };

function go(view) {
  if (!S || S.over) return;
  S.view = view; $('stage').classList.toggle('nocur', view === 'scissor');
  $('hud').hidden = view === 'bomb';          // timer pindah ke layar bom saat bom dibuka
  const b = $('bar'); b.hidden = false;
  b.innerHTML = (view !== 'table' ? `<button onclick="go('table')">Back</button>` : '') +
    (view !== 'look' ? `<button onclick="go('look')">Look Around</button>` : '') +
    `<button onclick="toggle('rumus')">Rumus</button><button onclick="toggle('hint')">Hint</button>` +
    `<span class="chip">Level ${S.lv} - ${S.cfg.place}</span>`;
  ({ table, look, bomb: bombFull, scissor })[view]();
  paintTime();
}

/* ============ MEJA ============ */
function table() {
  $('scene').innerHTML = bg() + tbl() +
    `<button class="obj" style="left:7%;bottom:9%;width:15%" onclick="toggle('hint')" aria-label="Buku Hint"><img src="${src(P.book)}" alt=""></button>` +
    bombBox(GB, 'idle', 'left:27%;top:38%;width:46%', `<button class="hot all" onclick="go('bomb')" aria-label="Buka bom"></button>`) +
    `<button class="obj" style="right:10%;bottom:12%;width:6%" onclick="go('scissor')" aria-label="Gunting"><img src="${src(P.scissors)}" alt=""></button>`;
}

/* ============ LOOK AROUND: PETA (geser, zoom in/out) ============ */
const ZMAX = 6;                                   // zoom maksimum = 6x dari zoom minimum
const setZone = i => { S.zone = i; S.page = i; look(); hintBody(); };   // Zona n selalu = Lembar hint n
const vpSize = () => { const v = $('vp'); return v ? [v.clientWidth, v.clientHeight] : [1, 1]; };
const minScale = () => { const [w, h] = vpSize(), D = SPAWN[S.lv]; return Math.max(w / D.W, h / D.H); };

function clampCam(c) {                            // peta tidak boleh keluar dari layar
  const [w, h] = vpSize(), D = SPAWN[S.lv], mn = minScale();
  c.s = Math.min(Math.max(c.s, mn), mn * ZMAX);
  const mw = D.W * c.s, mh = D.H * c.s;
  c.x = mw <= w ? (w - mw) / 2 : Math.min(0, Math.max(w - mw, c.x));
  c.y = mh <= h ? (h - mh) / 2 : Math.min(0, Math.max(h - mh, c.y));
}
function applyCam() {
  const w = $('world'); if (!w || !S || !S.cam) return;
  clampCam(S.cam);
  w.style.transform = `translate(${S.cam.x}px,${S.cam.y}px) scale(${S.cam.s})`;
}
function initCam() {                              // awal: sedikit zoom, di tengah peta
  const [w, h] = vpSize(), D = SPAWN[S.lv], s = minScale() * 1.4;
  S.cam = { s, x: (w - D.W * s) / 2, y: (h - D.H * s) / 2 };
  applyCam();
}
function zoomAt(f, px, py) {                      // zoom dengan titik (px,py) tetap di tempatnya
  const c = S.cam, mn = minScale(), s2 = Math.min(Math.max(c.s * f, mn), mn * ZMAX), k = s2 / c.s;
  c.x = px - (px - c.x) * k; c.y = py - (py - c.y) * k; c.s = s2;
  applyCam();
}
const zoomBtn = f => { const [w, h] = vpSize(); zoomAt(f, w / 2, h / 2); };
const resetCam = () => { initCam(); };

function bindMap() {
  const vp = $('vp'), ptr = new Map();
  const dist = () => { const p = [...ptr.values()]; return p.length === 2 ? Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]) : 0; };
  const mid = () => { const p = [...ptr.values()]; return p.length === 2 ? [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2] : p[0]; };
  vp.addEventListener('pointerdown', e => {
    vp.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); vp.classList.add('grab');
  });
  vp.addEventListener('pointermove', e => {
    if (!ptr.has(e.pointerId) || !S || !S.cam) return;
    const old = ptr.get(e.pointerId), nx = [e.clientX, e.clientY];
    if (ptr.size === 1) {                          // geser peta
      S.cam.x += nx[0] - old[0]; S.cam.y += nx[1] - old[1]; ptr.set(e.pointerId, nx); applyCam();
    } else if (ptr.size === 2) {                   // cubit untuk zoom (layar sentuh)
      const d0 = dist(), m0 = mid(); ptr.set(e.pointerId, nx);
      const d1 = dist(), m1 = mid(), r = vp.getBoundingClientRect();
      S.cam.x += m1[0] - m0[0]; S.cam.y += m1[1] - m0[1];
      if (d0 > 0) zoomAt(d1 / d0, m1[0] - r.left, m1[1] - r.top); else applyCam();
    }
  });
  const up = e => { ptr.delete(e.pointerId); if (!ptr.size) vp.classList.remove('grab'); };
  vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
  vp.addEventListener('wheel', e => {              // scroll mouse untuk zoom
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
}
window.addEventListener('resize', () => { if (S && S.view === 'look' && $('world')) applyCam(); });

function look() {
  const z = S.zone, cfg = S.cfg, D = SPAWN[S.lv];
  const tabs = S.codes.map((_, i) => `<button class="${i === z ? 'on' : ''}" onclick="setZone(${i})">Zona ${i + 1}</button>`).join('');
  const items = S.spawn[z].slice().sort((a, b) => a.y - b.y).map(o => {   // yang di bawah digambar paling depan
    const ob = cfg.objs[o.k], s = ob[3];
    return `<div class="mo" style="left:${o.x}px;top:${o.y}px;width:${s}px;height:${s}px;font-size:${Math.round(s * .85)}px">${oimgTag(ob, o.neg, '', o.v)}</div>`;
  }).join('');
  $('scene').innerHTML =
    `<div class="vp" id="vp"><div id="world" style="width:${D.W}px;height:${D.H}px"><img class="map" src="${srcLA(cfg.map)}" alt="Peta">${items}</div></div>
     <div class="mtabs">${tabs}</div>
     <div class="mzoom"><button onclick="zoomBtn(1.4)" aria-label="Zoom in">+</button><button onclick="zoomBtn(1/1.4)" aria-label="Zoom out">&minus;</button><button onclick="resetCam()" aria-label="Reset peta">&#8962;</button></div>
     <div class="mhelp">Seret untuk menggeser &middot; scroll / cubit untuk zoom</div>`;
  if (S.cam) applyCam(); else initCam();
  bindMap();
}

/* ============ PANEL MELAYANG: HINT & RUMUS ============ */
function toggle(k) {
  const old = $('fl-' + k); if (old) return old.remove();
  const d = document.createElement('div'); d.id = 'fl-' + k; d.className = 'fl'; d.style.zIndex = ++Z;
  d.style.cssText += k === 'hint' ? ';left:3%;top:12%;width:28%' : ';right:3%;top:12%;width:46%';
  d.innerHTML = k === 'hint' ? `<img src="${src(P.uiHint)}" alt=""><div class="ht" id="ht"></div>` : `<img src="${src(P.uiRumus)}" alt="Rumus">`;
  d.insertAdjacentHTML('beforeend', `<button class="x" onclick="this.parentNode.remove()" aria-label="Tutup">&#10005;</button>`);
  $('floats').appendChild(d); drag(d); if (k === 'hint') hintBody();
}
function hintBody() {
  const el = $('ht'); if (!el) return;
  const p = S.page, n = S.codes[p].length, lv = S.lv;
  const list = S.orders[p].map(k => S.cfg.objs[k]).map((o, i) =>
    `<li>${i + 1}. ${o[1]}${o[4] > 1 ? ' <small>(semua model dihitung 1 objek)</small>' : ''}: <span class="sg p">+</span>${oimgTag(o, false, 'hi')} <span class="sg n">&minus;</span>${oimgTag(o, true, 'hi')}</li>`).join('');
  el.innerHTML = `<h3>Lembar ${p + 1} dari ${lv} (Zona ${p + 1})</h3>
    <p>Kode ke-${p + 1}, ${n} karakter. Buka Look Around, pilih Zona ${p + 1}, lalu cari dan hitung objek di peta sesuai urutan di bawah (urutan objek berbeda tiap kode):</p><ul>${list}</ul>
    <p>Objek dengan asset + berarti angka positif (huruf kapital), asset &minus; berarti angka negatif (huruf kecil). Objek yang ada di daftar tapi TIDAK muncul di peta = 0 = ketik Spasi di posisi itu.
    Ubah angka jadi huruf lewat Rumus. Masukkan semua ${lv} kode ke bom sebelum memotong kabel.</p>
    <div class="pg"><button onclick="pg(-1)" ${p === 0 ? 'disabled' : ''}>&lsaquo;</button><button onclick="pg(1)" ${p === lv - 1 ? 'disabled' : ''}>&rsaquo;</button></div>`;
}
const pg = d => { S.page += d; S.zone = S.page; hintBody(); if (S.view === 'look') look(); };   // ganti lembar = ganti zona
function drag(d) {
  d.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    const s = $('stage').getBoundingClientRect(), r = d.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    d.style.zIndex = ++Z; d.setPointerCapture(e.pointerId);
    const mv = ev => { d.style.left = ev.clientX - s.left - ox + 'px'; d.style.top = ev.clientY - s.top - oy + 'px'; d.style.right = 'auto'; };
    const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); };
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
  });
}

/* ============ BOM FULLSCREEN: KEYBOARD, CAPS LOCK & KODE ============ */
function bombFull() {
  const h = `<button class="hot" aria-label="Spasi" style="${pos(GF, GF.space)}" onclick="addCh(' ',true)"></button>` +
            `<button class="hot" aria-label="Enter" style="${pos(GF, GF.enter)}" onclick="submitCode()"></button>`;
  $('scene').innerHTML = bombBox(GF, 'full', 'left:0;top:0;width:100%', h) +
    `<div class="tb"><button onclick="del()">Hapus</button>
     <button id="capsbtn" class="caps ${S.caps ? 'on' : ''}" onclick="toggleCaps()"><i class="led"></i>Caps Lock</button></div>`;
}
function toggleCaps() { S.caps = !S.caps; $('capsbtn').classList.toggle('on', S.caps); refresh(); }
function addCh(c, raw) {         // raw = karakter dipakai apa adanya (keyboard fisik / spasi)
  if (!S || S.over || S.done >= S.codes.length || S.buf.length >= 6) return;
  S.buf += raw ? c : (S.caps ? c.toUpperCase() : c.toLowerCase()); S.fb = ''; refresh();
}
function del() { if (S && !S.over) { S.buf = S.buf.slice(0, -1); refresh(); } }
function submitCode() {
  if (!S || S.over || S.done >= S.codes.length) return;
  if (S.buf.replace(/ +/g, ' ').trim() !== S.codes[S.done]) return boom('Kode salah, bom meledak.');
  SFX.correct(); S.done++; S.buf = ''; S.fb = 'BENAR';
  if (S.done === S.codes.length) S.wire = { c: pick(WIRE_COLORS), s: pick(['Kiri', 'Kanan']) };
  refresh();
}
document.addEventListener('keydown', e => {      // keyboard fisik: besar/kecil sesuai yang kamu ketik
  if (!S || S.over || S.view !== 'bomb' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter' || e.key === 'Backspace' || /^[A-Za-z ]$/.test(e.key)) {
    e.preventDefault();                          // cegah tombol layar yang sedang fokus ikut terklik (spasi/huruf ganda)
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  if (e.repeat) return;
  if (e.key === 'Enter') submitCode();
  else if (e.key === 'Backspace') del();
  else if (/^[A-Za-z ]$/.test(e.key)) { SFX.key(); addCh(e.key, true); }
});
document.addEventListener('mousedown', e => {   // klik tombol bom tidak boleh mengambil fokus keyboard
  if (e.target.closest && e.target.closest('.bw button, .tb button')) e.preventDefault();
});

/* ============ GUNTING: KLIK LANGSUNG KABEL ============ */
function scissor() {
  const svg = `<svg class="wires" viewBox="0 0 ${GB.W} ${GB.H}">` + WIRES.map(([c, s, p]) =>
    `<polyline class="w" points="${p}" onclick="cut('${c}','${s}',this)"><title>${c} ${s}</title></polyline>`).join('') + '</svg>';
  $('scene').innerHTML = bg() + tbl() + bombBox(GB, 'scis', 'left:11%;top:22%;width:78%', svg) +
    `<div class="note">Gunting aktif: klik kabel yang ingin dipotong</div><img id="sc" class="scfollow" src="${src(P.scissors)}" alt="">`;
}
$('stage').addEventListener('pointermove', e => {
  const f = $('sc'); if (!f) return;
  const r = $('stage').getBoundingClientRect(); f.style.left = e.clientX - r.left + 'px'; f.style.top = e.clientY - r.top + 'px';
});
function cut(c, s, el) {
  if (S.over || S.busy) return;
  SFX.cut(); S.busy = true; el.classList.add('cut'); const f = $('sc'); if (f) f.classList.add('snip');
  setTimeout(() => {
    S.busy = false; if (S.over) return;
    if (S.done < S.codes.length) return boom('Kabel dipotong sebelum semua kode dimasukkan.');
    if (c === S.wire.c && s === S.wire.s) win(); else boom('Kabel yang dipotong salah.');
  }, 450);
}

menu();