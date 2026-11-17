'use strict';
/* ============ AUDIO: SFX (dibuat dari kode) + BGM (file di folder "Audio") ============
   SFX tidak butuh file apa pun. BGM dibaca dari folder "Audio" di samping index.html.
   Kalau file BGM belum ada, game tetap jalan tanpa musik (tanpa pesan error di layar).
   Format yang disarankan: .mp3 atau .ogg. Ganti nama file di AUDIO.bgm sesuai file kamu.
     menu / picker / informant = halaman tersebut | 1, 2, 3 = musik misi Level 1, 2, 3 */
const AUDIO = {
  dir: 'Audio/',
  bgm: { menu: 'BGM Menu.mp3', picker: 'BGM Level Picker.mp3', informant: 'BGM Informan.mp3',
         1: 'BGM Level 1.mp3', 2: 'BGM Level 2.mp3', 3: 'BGM Level 3.mp3' }
};

/* ---------- pengaturan (tersimpan di browser) ---------- */
const AS = { music: .5, sfx: .8, mute: false };
try { Object.assign(AS, JSON.parse(localStorage.getItem('bd_audio')) || {}); } catch (e) {}
const saveAS = () => { try { localStorage.setItem('bd_audio', JSON.stringify(AS)); } catch (e) {} };

/* ---------- mesin suara ---------- */
let ac = null, nbuf = null;
function ctx() {                                  // dibuat saat pertama dipakai (setelah klik pemain)
  if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(o) {                                // nada: f (Hz) -> f2 (opsional), jenis gelombang, durasi, volume, jeda
  if (AS.mute || AS.sfx <= 0) return;
  const a = ctx(); if (!a) return;
  const t = a.currentTime + (o.d || 0), dur = o.dur || .1, v = Math.max((o.v ?? .3) * AS.sfx, .0002);
  const osc = a.createOscillator(), g = a.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + (o.a || .005));
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  osc.connect(g); g.connect(a.destination);
  osc.start(t); osc.stop(t + dur + .03);
}
function noise(o) {                               // desis/derau yang disaring: ft (jenis filter), f0 -> f1, durasi, volume
  if (AS.mute || AS.sfx <= 0) return;
  const a = ctx(); if (!a) return;
  if (!nbuf) {
    nbuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + (o.d || 0), dur = o.dur || .2, v = Math.max((o.v ?? .4) * AS.sfx, .0002);
  const src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  src.buffer = nbuf; fl.type = o.ft || 'lowpass';
  fl.frequency.setValueAtTime(o.f0 || 1000, t);
  if (o.f1) fl.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  src.connect(fl); fl.connect(g); g.connect(a.destination);
  src.start(t, Math.random()); src.stop(t + dur + .03);
}

/* ---------- daftar sound effect ---------- */
const SFX = {
  click:   () => tone({ f: 700, f2: 480, type: 'square', dur: .05, v: .1 }),                 // semua tombol
  key:     () => tone({ f: 520 + Math.random() * 120, type: 'triangle', dur: .05, v: .22 }), // keyboard bom
  type:    () => tone({ f: 1300 + Math.random() * 300, type: 'square', dur: .015, v: .025 }),// efek ketik narator/informan
  tick(lv) {                                                                                   // detak timer: 0 pelan, 1 <=30 dtk, 2 <=10 dtk
    if (lv === 2) { tone({ f: 1900, type: 'square', dur: .05, v: .16 }); tone({ f: 1300, type: 'square', dur: .05, v: .12, d: .12 }); }
    else if (lv === 1) tone({ f: 1400, type: 'square', dur: .04, v: .1 });
    else tone({ f: 900, type: 'square', dur: .03, v: .05 });
  },
  correct() { tone({ f: 880, type: 'triangle', dur: .12, v: .3 }); tone({ f: 1320, type: 'triangle', dur: .3, v: .3, d: .1 }); },   // kode benar
  cut() {                                                                                      // gunting memotong kabel
    noise({ ft: 'highpass', f0: 3000, dur: .08, v: .5 }); tone({ f: 2400, f2: 1200, type: 'sawtooth', dur: .08, v: .1 });
    noise({ ft: 'highpass', f0: 4000, dur: .06, v: .4, d: .09 });
  },
  boom() {                                                                                     // ledakan
    noise({ ft: 'lowpass', f0: 3500, f1: 60, dur: 1.8, v: .9 });
    tone({ f: 130, f2: 28, type: 'sine', dur: 1.5, v: .8 });
    noise({ ft: 'bandpass', f0: 900, f1: 200, dur: .5, v: .5, d: .02 });
  },
  win() {                                                                                      // bom jinak
    [523, 659, 784, 1047].forEach((f, i) => tone({ f, type: 'triangle', dur: .28, v: .3, d: i * .12 }));
    [523, 659, 784, 1047].forEach(f => tone({ f, type: 'sine', dur: .9, v: .16, d: .5 }));
  },
  coin() { tone({ f: 1318, type: 'square', dur: .08, v: .14 }); tone({ f: 1760, type: 'square', dur: .25, v: .14, d: .07 }); },   // bayar informan
  deny:    () => tone({ f: 170, f2: 110, type: 'sawtooth', dur: .25, v: .25 }),                // uang kurang
  reveal() { [660, 880, 1175].forEach((f, i) => tone({ f, type: 'triangle', dur: .35, v: .26, d: i * .09 })); },                    // petunjuk didapat
  roll:    i => tone({ f: 460 + (i % 3) * 200, type: 'square', dur: .05, v: .13 }),             // rolling kesulitan
  pick() { [392, 523, 659, 784].forEach((f, i) => tone({ f, type: 'triangle', dur: .3, v: .28, d: i * .07 })); },                    // rolling berhenti
  beep:    last => tone({ f: last ? 1320 : 880, type: 'sine', dur: last ? .4 : .15, v: .3 }),   // hitung mundur 3-2-1
  whoosh:  () => noise({ ft: 'bandpass', f0: 300, f1: 3200, dur: .6, v: .35 })                   // fade ke game
};

/* ---------- BGM (file di folder Audio, loop + fade) ---------- */
function fadeEl(el, to, ms, done) {
  clearInterval(el._fd);
  const from = el.volume, steps = Math.max(1, Math.round(ms / 40)); let i = 0;
  el._fd = setInterval(() => {
    i++; el.volume = Math.min(1, Math.max(0, from + (to - from) * i / steps));
    if (i >= steps) { clearInterval(el._fd); if (done) done(); }
  }, 40);
}
const BGM = {
  key: null, el: null,
  target() { return AS.mute ? 0 : Math.min(1, AS.music * .6); },       // BGM sedikit lebih pelan dari efek
  play(key) {
    if (this.key === key) return;
    this.fadeOut(600); this.key = key;
    const f = AUDIO.bgm[key]; if (!f) return;
    const el = new Audio(encodeURI(AUDIO.dir + f));
    el.loop = true; el.volume = 0; el.preload = 'auto';
    this.el = el; this.start();
  },
  start() {                                                           // dicoba lagi setelah klik pertama (aturan autoplay browser)
    const el = this.el; if (!el) return;
    const p = el.play(); if (p && p.catch) p.catch(() => {});
    fadeEl(el, this.target(), 800);
  },
  fadeOut(ms) { const old = this.el; this.el = null; if (old) fadeEl(old, 0, ms, () => old.pause()); },
  stop() { this.key = null; this.fadeOut(500); },
  refresh() { if (this.el) fadeEl(this.el, this.target(), 150); }
};

/* ---------- buka kunci audio saat klik/tekan pertama + bunyi klik semua tombol ---------- */
let unlocked = false;
function unlockAudio() { if (unlocked) return; unlocked = true; ctx(); BGM.start(); }
document.addEventListener('pointerdown', e => {
  unlockAudio();
  const b = e.target.closest && e.target.closest('button');
  if (b && !b.disabled) (b.classList.contains('key') ? SFX.key : SFX.click)();
}, true);
document.addEventListener('keydown', unlockAudio, true);

/* ---------- widget volume (pojok kiri atas) ---------- */
(function audioUI() {
  const st = document.getElementById('stage'); if (!st) return;
  const w = document.createElement('div'); w.id = 'audio';
  const ico = () => AS.mute ? '&#128263;' : '&#128266;';
  w.innerHTML = `<button id="aubtn" aria-label="Pengaturan suara">${ico()}</button>
    <div id="aupanel" hidden>
      <label>Musik <input type="range" id="aumus" min="0" max="100" value="${Math.round(AS.music * 100)}"></label>
      <label>Efek <input type="range" id="ausfx" min="0" max="100" value="${Math.round(AS.sfx * 100)}"></label>
      <button id="aumute">${AS.mute ? 'Nyalakan suara' : 'Matikan suara'}</button>
    </div>`;
  st.appendChild(w);
  const $a = id => document.getElementById(id);
  $a('aubtn').onclick = () => { $a('aupanel').hidden = !$a('aupanel').hidden; };
  $a('aumus').oninput = e => { AS.music = e.target.value / 100; BGM.refresh(); saveAS(); };
  $a('ausfx').oninput = e => { AS.sfx = e.target.value / 100; saveAS(); };
  $a('ausfx').onchange = () => SFX.key();                             // contoh bunyi saat slider dilepas
  $a('aumute').onclick = () => {
    AS.mute = !AS.mute; saveAS(); BGM.refresh();
    $a('aubtn').innerHTML = ico(); $a('aumute').textContent = AS.mute ? 'Nyalakan suara' : 'Matikan suara';
  };
})();