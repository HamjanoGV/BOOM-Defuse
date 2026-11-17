'use strict';
/* ============ MENU UTAMA + LEVEL PICKER ============
   File ini dimuat SETELAH game.js (lihat index.html) dan menggantikan fungsi menu() milik game.js.
   Folder "Menu" dan "Level Picker" diletakkan satu folder dengan index.html
   (sejajar dengan "In game Asset" dan "Look Around"). Kalau lokasinya beda, ubah MENU_DIR / LP_DIR. */
const MENU_DIR = 'Menu/', LP_DIR = 'Level Picker/';
const MA = {
  menuBg:  MENU_DIR + 'Background Menu.png',
  title:   MENU_DIR + 'BOOM Defuse Title.png',
  play:    MENU_DIR + 'Play Button.png',
  pickBg:  LP_DIR + 'Background LevelPicker.png',
  rolling: LP_DIR + 'Rolling Title.png'
};
/* Easy = Level 1 (Taman), Medium = Level 2 (Kantor), Hard = Level 3 (Pesawat) */
const DIFFS = [
  { name: 'Easy',   lv: 1, img: LP_DIR + 'Level/Easy.png' },
  { name: 'Medium', lv: 2, img: LP_DIR + 'Level/Medium.png' },
  { name: 'Hard',   lv: 3, img: LP_DIR + 'Level/Hard.png' }
];
/* Pengaturan waktu (ms) */
const PK = {
  wait: 2000,      // jeda setelah masuk Level Picker sebelum rolling mulai
  steps: 22,       // jumlah pergantian kartu minimal saat rolling
  fast: 60,        // jeda antar kartu di awal (cepat)
  slow: 480,       // jeda antar kartu di akhir (lambat)
  count: 3,        // hitung mundur (detik) setelah kartu terkunci
  fade: 800        // lama fade out (samakan dengan transition di #fade pada menu.css)
};

let pk = null;     // state Level Picker yang sedang berjalan (null = tidak ada)

function clearPick() { if (pk) { pk.timers.forEach(clearTimeout); pk = null; } }
function later(fn, ms) {         // setTimeout yang otomatis batal kalau picker sudah ditutup
  const my = pk; if (!my) return;
  my.timers.push(setTimeout(() => { if (pk === my) fn(); }, ms));
}
function fadeEl() {
  let f = $('fade');
  if (!f) { f = document.createElement('div'); f.id = 'fade'; $('stage').appendChild(f); }
  return f;
}

/* ============ MENU UTAMA ============ */
function menu() {
  clearInterval(tick); clearTimeout(backTimer); clearPick(); S = null;
  $('bar').hidden = true; $('bar').innerHTML = '';
  $('hud').hidden = true; $('hud').textContent = ''; $('hud').classList.remove('warn');
  $('overlay').hidden = true; $('overlay').className = ''; $('overlay').innerHTML = '';
  $('floats').innerHTML = '';
  $('stage').classList.remove('nocur');
  fadeEl().classList.remove('on');
  if (typeof SPAWN === 'undefined') {            // spawn.js belum dimuat -> Look Around tidak bisa jalan
    $('scene').innerHTML = `<section class="menu"><h1>spawn.js tidak ditemukan</h1>
      <p>Letakkan file <b>spawn.js</b> (data zona spawn) satu folder dengan index.html dan game.js, lalu refresh (Ctrl+F5).</p></section>`;
    return;
  }
  $('scene').innerHTML = `<section class="mm">
    <img class="mm-bg" src="${srcLA(MA.menuBg)}" alt="">
    <img class="mm-title" src="${srcLA(MA.title)}" alt="BOOM Defuse">
    <button class="mm-play" onclick="openPicker()" aria-label="Play"><img src="${srcLA(MA.play)}" alt="Play"></button>
    <div class="mm-coin">Koin: ${money()}</div></section>`;
}

/* ============ LEVEL PICKER ============ */
function openPicker() {
  clearPick(); pk = { timers: [] };
  $('scene').innerHTML = `<section class="lp">
    <img class="lp-bg" src="${srcLA(MA.pickBg)}" alt="">
    <img class="lp-title" src="${srcLA(MA.rolling)}" alt="Rolling">
    <div class="lp-slot"><div class="lp-sel" id="lpsel"></div>
      ${DIFFS.map((d, i) => `<img class="lp-card" data-i="${i}" src="${srcLA(d.img)}" alt="${d.name}">`).join('')}</div>
    <div class="lp-count" id="lpcount"><div class="lp-info" id="lpinfo"></div>
      <div class="lp-lbl">Mulai dalam</div><div class="lp-num" id="lpnum"></div></div></section>`;

  const cards = [...document.querySelectorAll('.lp-card')];
  const first = rnd(DIFFS.length), target = rnd(DIFFS.length);     // target = hasil acak (ditentukan dari awal)
  let n = PK.steps; while ((first + n) % DIFFS.length !== target) n++;   // jumlah langkah agar berhenti tepat di target
  const show = i => cards.forEach((c, k) => c.classList.toggle('on', k === i));
  show(first);

  function step(i) {                              // i = langkah ke-i dari 1..n
    const cur = (first + i) % DIFFS.length;
    show(cur);
    if (i >= n) return lock(cur);
    const t = PK.fast + (PK.slow - PK.fast) * Math.pow((i + 1) / n, 2.5);   // cepat -> melambat
    later(() => step(i + 1), t);
  }
  later(() => { $('lpsel').className = 'lp-sel roll'; step(1); }, PK.wait);
  return target;
}

function lock(i) {
  const d = DIFFS[i];
  $('lpsel').className = 'lp-sel lock';
  document.querySelectorAll('.lp-card')[i].classList.add('lock');
  $('lpinfo').textContent = `Level ${d.lv} - ${LEVELS[d.lv].place}`;
  $('lpcount').classList.add('go');
  let c = PK.count;
  const paint = () => { const e = $('lpnum'); e.textContent = c; e.classList.remove('tick'); void e.offsetWidth; e.classList.add('tick'); };
  const down = () => {
    c--;
    if (c > 0) { paint(); later(down, 1000); }
    else {                                        // hitung mundur selesai -> fade out -> in-game
      fadeEl().classList.add('on');
      later(() => enter(d.lv), PK.fade + 100);
    }
  };
  paint(); later(down, 1000);
}

function enter(lv) {
  const f = fadeEl();
  clearPick();
  startLevel(lv);
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));   // fade in ke in-game
}

/* Mulai level langsung (tanpa layar briefing "Panggilan tugas") */
function startLevel(lv) {
  const cfg = LEVELS[lv], codes = Array.from({length: lv}, genCode);
  const orders = codes.map(c => genOrder(lv, c.length));
  S = { lv, cfg, codes, orders, spawn: codes.map((c, i) => spawnZone(lv, c, orders[i])), cam: null, done: 0, wire: null, page: 0, zone: 0,
        buf: '', fb: '', caps: false, view: 'brief', over: false, busy: false, end: 0 };
  start();
}

menu();