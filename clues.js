'use strict';
/* ============ CLUES, TELEPON POLISI, MELABRAK PELAKU, CUTSCENE ============
   Dimuat SETELAH game.js (lihat index.html). File ini menggantikan fungsi openInformant() dan
   membungkus menu() milik game.js, jadi game.js TIDAK perlu diubah.
   Folder "Story" diletakkan satu folder dengan index.html (sejajar "Menu", "Look Around", dst).
   Struktur:  Story/Background, Story/Character, Story/Item, Story/UI And Interface  */

const CL_DIR = 'Story/';
const CL_BG = {
  informan: 'Background/Background Informan (Clue).png',
  taman:    'Background/Background dialog Taman.png',
  kantor:   'Background/Background dialog Kantor.png',
  pesawat:  'Background/Background dialog Pesawatpng.png',     // (nama file asli memang "Pesawatpng")
  airport:  'Background/Background dialog Airport.png',
  polisi:   'Background/Background dialog Telepon Polisi.png'
};
const CL_UI = {
  berkasUI:   'UI And Interface/Berkas UI.png',
  berkasItem: 'Item/Berkas.png',
  map: n => `UI And Interface/Clue Covered from Informan/Clue Map LVL${n}.png`
};
const CL_CHAR = {            // dir = nama folder karakter di Story/Character
  player: { dir: 'Agen Penjinak Bom (Player)',   name: 'Kamu' },
  remi:   { dir: 'Informan (Remi)',              name: 'Remi' },
  sinta:  { dir: 'Polisi (Inspektur Sinta)',     name: 'Inspektur Sinta' },
  bram:   { dir: 'Bram Santoso (Taman Kota)',    name: 'Bram Santoso' },
  hendra: { dir: 'Hendra Kusuma (Gedung Kantor)', name: 'Hendra Kusuma' },
  reza:   { dir: 'Reza Mahardika alias \u201cArman Liem\u201d (Pesawat)', name: 'Reza Mahardika' }
};
/* Posisi area klik telepon di background main menu (satuan cqw = % lebar layar, sama seperti style.css).
   Sesuaikan dengan letak telepon di gambar Background Menu kamu. Set PHONE_DEBUG = true untuk melihat kotaknya. */
const PHONE = { l: 70, t: 36, w: 12, h: 11 };
const PHONE_DEBUG = false;
const PIN_IMG = null;        // isi path gambar pin (mis. 'Story/UI And Interface/Pin.png') kalau sudah punya asset pin sendiri

const clSrc = p => encodeURI(CL_DIR + p);
const clSpr = (w, e) => clSrc(`Character/${CL_CHAR[w].dir}/${e}.png`);
const clBgSrc = k => clSrc(CL_BG[k]);

/* ---------- progres (localStorage: bd_story2) ---------- */
let CLS = (() => { try { return JSON.parse(localStorage.getItem('bd_story2')) || {}; } catch (e) { return {}; } })();
const clSave = () => { try { localStorage.setItem('bd_story2', JSON.stringify(CLS)); } catch (e) {} };
const clSt = lv => CLS[lv] || (CLS[lv] = { got: [], pins: {}, closed: false });
const clDone = lv => clSt(lv).got.length >= STORY[lv].clues.length;
const clPending = () => [1, 2, 3].find(l => clDone(l) && !clSt(l).closed);

/* ---------- pengetik teks ---------- */
function clTyper(el, text, done, speed = 18) {
  let i = 0, t = 0, dead = false;
  const o = {
    skip() { if (dead) return false; clearTimeout(t); dead = true; el.textContent = text; if (done) done(); return true; },
    stop() { dead = true; clearTimeout(t); }
  };
  const step = () => {
    if (dead) return;
    i++; el.textContent = text.slice(0, i); if (i % 3 === 0) SFX.type();
    if (i >= text.length) { dead = true; if (done) done(); } else t = setTimeout(step, speed);
  };
  step();
  return o;
}
const clFade = (mid) => {                       // fade ke hitam -> jalankan mid -> fade balik
  const f = (typeof fade !== 'undefined') ? fade : null;
  if (!f) return mid();
  f.style.opacity = 1;
  setTimeout(() => { mid(); setTimeout(() => { f.style.opacity = 0; }, 120); }, 680);
};

/* ============ ENGINE DIALOG (visual novel) ============ */
let VN = null, VNG = 0;
const vnT = (fn, ms) => { const g = VNG; return setTimeout(() => { if (g === VNG) fn(); }, ms); };

function vnPreload(script) {
  (script || []).forEach(l => {
    if (l.w && l.e) { const i = new Image(); i.src = clSpr(l.w, l.e); }
    if (l.show) { const i = new Image(); i.src = clSpr(l.show, l.e || 'Idle'); }
    if (l.bg && CL_BG[l.bg]) { const i = new Image(); i.src = clBgSrc(l.bg); }
    if (l.ask) l.ask.forEach(o => vnPreload(o.go));
  });
}
function vnAbort() {
  VNG++;
  if (VN && VN.typer) VN.typer.stop();
  VN = null;
  const v = document.getElementById('vn'); if (v) v.remove();
}
/* o: {bg, flip (lawan bicara di kiri, pemain di kanan), solo (tanpa sprite pemain), overlay (hanya kotak dialog di atas scene yang ada), cine (cutscene narator)} */
function vnPlay(script, o, done) {
  vnAbort(); o = o || {};
  vnPreload(script);
  const ov = !!o.overlay, spr = !ov && !o.cine;
  const html = `<div class="vn${ov ? ' ov' : ''}${o.cine ? ' cine' : ''}${o.flip ? ' flip' : ''}" id="vn" onclick="vnClick()">
    ${ov ? '' : '<img class="vn-bg" id="vnbg" alt=""><img class="vn-bg b2" id="vnbg2" alt="">'}
    ${spr ? `<div class="vn-spr L" id="vnL" ${o.solo || o.flip ? 'hidden' : ''}><img alt=""></div><div class="vn-spr R" id="vnR" hidden><img alt=""></div>` : ''}
    <div class="vn-box" id="vnbox" hidden><div class="vn-name" id="vnname" hidden></div><div class="vn-text" id="vntext"></div><i class="vn-next">&#9660;</i></div>
    <div class="vn-ask" id="vnask" hidden></div>
    <div class="vn-cap" id="vncap" hidden><b></b><span></span></div></div>`;
  if (ov) $('scene').insertAdjacentHTML('beforeend', html); else $('scene').innerHTML = html;
  VN = { q: script.slice(), o, spr, done, state: 'idle', typer: null, rem: null, loop: false, bgKey: null, L: null, R: null, capT: 0 };
  if (!ov && o.bg) vnBg(o.bg, true);
  if (spr && !o.solo) vnSpr(o.flip ? 'R' : 'L', 'player', 'Idle');
  vnNext();
}
function vnBg(key, instant) {
  const a = $('vnbg'), b = $('vnbg2'); if (!a || !VN) return;
  const url = clBgSrc(key);
  if (!VN.bgKey || instant) { a.src = url; VN.bgKey = key; b.style.opacity = 0; return; }
  if (VN.bgKey === key) return;
  VN.bgKey = key; b.src = url; b.style.opacity = 1;
  vnT(() => { a.src = url; b.style.transition = 'none'; b.style.opacity = 0; void b.offsetWidth; b.style.transition = ''; }, 650);
}
function vnSpr(side, w, e) {
  const el = $('vn' + side); if (!el) return;
  const img = el.firstElementChild, url = clSpr(w, e);
  if (VN[side] !== w) { el.classList.remove('in'); void el.offsetWidth; }
  VN[side] = w; el.hidden = false; el.classList.add('in');
  if (img.getAttribute('src') !== url) img.src = url;
}
function vnFocus(side) { ['L', 'R'].forEach(s => { const el = $('vn' + s); if (el) el.classList.toggle('dim', s !== side); }); }
function vnClick() {
  if (!VN) return;
  if (VN.state === 'cap') { clearTimeout(VN.capT); return vnCapEnd(); }
  if (VN.state === 'ask' || VN.state === 'run') return;
  if (VN.typer && VN.typer.skip()) return;
  vnNext();
}
function vnNext() {
  if (!VN) return;
  VN.state = 'idle';
  const ln = VN.q.shift();
  if (!ln) return vnFinish();
  if (ln.bg) { vnBg(ln.bg); return vnNext(); }
  if (ln.show) { if (VN.spr) vnSpr(VN.o.flip ? 'L' : 'R', ln.show, ln.e || 'Idle'); return vnNext(); }
  if (ln.sfx) { if (SFX[ln.sfx]) SFX[ln.sfx](); return vnNext(); }
  if (ln.run) { VN.state = 'run'; ln.run(); return; }
  if (ln._ask) { return ln._ask.length ? vnShowAsk(ln._ask, true) : vnNext(); }
  if (ln.ask) return vnShowAsk(ln.ask.slice(), !!ln.loop);
  if (ln.cap) {
    const nx = VN.q[0];
    if (nx && nx.bg) { VN.q.shift(); vnBg(nx.bg, true); }
    return vnCap(ln);
  }
  // baris teks
  const box = $('vnbox'), nm = $('vnname');
  if (ln.w) {
    const pl = VN.o.flip ? 'R' : 'L', ot = VN.o.flip ? 'L' : 'R', side = ln.w === 'player' ? pl : ot;
    if (VN.spr && !(ln.w === 'player' && VN.o.solo)) { vnSpr(side, ln.w, ln.e || 'Idle'); vnFocus(side); }
    nm.textContent = CL_CHAR[ln.w].name; nm.hidden = false; box.classList.remove('nar');
  } else {
    nm.hidden = true; box.classList.add('nar'); vnFocus(null);
  }
  if (VN.o.onLine) VN.o.onLine(ln);
  box.hidden = false; box.classList.remove('done');
  VN.typer = clTyper($('vntext'), ln.t || ln.n || '', () => { const b = $('vnbox'); if (b) b.classList.add('done'); });
}
function vnShowAsk(rem, loop) {
  VN.state = 'ask'; VN.rem = rem; VN.loop = loop;
  const a = $('vnask');
  a.className = 'vn-ask' + (rem.length > 5 ? ' many' : '');
  a.innerHTML = rem.map((o, i) => `<button onclick="event.stopPropagation();vnPick(${i})">${o.l}</button>`).join('');
  a.hidden = false;
}
function vnPick(i) {
  if (!VN || VN.state !== 'ask') return;
  const rem = VN.rem, opt = rem[i];
  $('vnask').hidden = true;
  if (opt.fn) { VN.state = 'run'; return opt.fn(); }
  const go = opt.go || [];
  if (VN.loop && !opt.end) { rem.splice(i, 1); VN.q.unshift(...go, { _ask: rem }); }
  else VN.q.unshift(...go);
  vnNext();
}
const vnPush = lines => { if (!VN) return; VN.q.unshift(...lines); vnNext(); };
function vnCap(ln) {
  VN.state = 'cap';
  const c = $('vncap'), bx = $('vnbox');
  bx.hidden = true; $('vnask').hidden = true;
  c.querySelector('b').textContent = ln.cap; c.querySelector('span').textContent = ln.sub || '';
  c.hidden = false; c.classList.remove('out'); void c.offsetWidth; c.classList.add('in');
  VN.capT = vnT(vnCapEnd, 2800);
}
function vnCapEnd() {
  if (!VN || VN.state !== 'cap') return;
  const c = $('vncap'); c.classList.remove('in'); c.classList.add('out');
  VN.state = 'run';
  vnT(() => { c.hidden = true; vnNext(); }, 500);
}
function vnFinish() {
  const d = VN.done, ov = VN.o.overlay;
  if (ov) { const v = $('vn'); if (v) v.remove(); }
  VN = null;
  if (d) d();
}

/* ============ MENU: TELEPON POLISI ============ */
let CLR = 0;                                   // interval bunyi telepon
function clStopRing() { clearInterval(CLR); CLR = 0; }
function clRingSound() {
  if (typeof tone !== 'function') return;
  const p = d => { tone({ f: 1480, type: 'square', dur: .07, v: .12, d }); tone({ f: 1180, type: 'square', dur: .07, v: .1, d: d + .08 }); };
  p(0); p(.18); p(.36);
}
function clPhone() {
  const mn = document.querySelector('.mn'), lv = clPending();
  if (!mn || !lv) return;
  mn.insertAdjacentHTML('beforeend',
    `<button class="phone${PHONE_DEBUG ? ' dbg' : ''}" onclick="answerPhone()" aria-label="Telepon berdering"
      style="left:${PHONE.l}cqw;top:${PHONE.t}cqw;width:${PHONE.w}cqw;height:${PHONE.h}cqw">
      <i class="ph-w"></i><i class="ph-w w2"></i><b class="ph-txt">RIIIING!</b></button>`);
  clRingSound();
  CLR = setInterval(() => { if (!document.querySelector('.phone')) return clStopRing(); clRingSound(); }, 2400);
}
let CLB = false;
function answerPhone() {
  const lv = clPending(); if (!lv || CLB) return;
  CLB = true; clStopRing();
  clFade(() => {
    BGM.play('informant');
    vnPlay(STORY[lv].call, { flip: true }, () => clFade(() => clMeet(lv)));
  });
}

/* ============ MELABRAK PELAKU + CUTSCENE PENUTUP ============ */
function clMeet(lv) {
  BGM.play(lv);
  vnPlay(STORY[lv].meet, {}, () => clFade(() => clEpilog(lv)));
}
function clEpilog(lv) {
  const ep = STORY[lv].epilog;
  BGM.play('informant');
  vnPlay(ep.lines.map(t => ({ n: t })), { cine: true, bg: ep.bg }, () => {
    const st = STORY[lv];
    clSt(lv).closed = true; clSave();
    const e = document.createElement('div');
    e.className = 'cl-end'; e.id = 'clend';
    e.innerHTML = `<small>KASUS SELESAI</small><h1>${st.title}</h1>
      <p>Pelaku: <b>${st.reveal.name}</b> &mdash; ditangkap.</p>
      <button onclick="menu()">Kembali ke menu</button>`;
    $('scene').appendChild(e);
    SFX.win();
  });
}

/* ============ LAMAN CLUES (INFORMAN REMI) ============ */
const IFN = { lv: 1, sel: false, gt: null, gen: 0, toastT: 0, pickCb: null, newPin: -1 };
const ifRemi = e => { const i = $('ifrimg'); if (i) i.src = clSpr('remi', e || 'Idle'); };
const ifLine = (e, t) => ({ w: 'remi', e, t });
const ifR = (e, a) => ifLine(e, pick(a));

function clAbort() {
  CLB = false; IFN.gen++; if (IFN.gt) { IFN.gt.stop(); IFN.gt = null; }
  clearTimeout(IFN.toastT); IFN.pickCb = null;
  vnAbort(); clStopRing();
}
openInformant = function () {
  clearPick(); clAbort(); BGM.play('informant');
  IFN.lv = [1, 2, 3].find(l => !clSt(l).closed) || 1;
  IFN.sel = false;                       // belum ada lokasi yang dipilih
  $('scene').innerHTML = `<div class="if" id="if">
    <img class="if-bg" src="${clBgSrc('informan')}" alt="">
    <div class="chip if-coin" id="ifcoin"></div>
    <button class="if-back" onclick="ifLeave()">Kembali</button>
    <button class="if-remi" id="ifremibtn" onclick="ifTalk()" aria-label="Bicara dengan Remi"><img id="ifrimg" src="${clSpr('remi', 'Idle')}" alt="Remi"></button>
    <div class="if-dots" id="ifdots" hidden><i></i><i></i><i></i></div>
    <div class="if-greet" id="ifgreet" hidden></div>
    <div class="cm" id="cm"></div>
    <div class="if-strip" id="ifstrip"></div>
    <div class="if-toast" id="iftoast" hidden></div></div>`;
  ifRender(); ifGreet();
};
function ifLeave() { menu(); }
function ifCoin() { const c = $('ifcoin'); if (c) c.textContent = 'Koin: ' + money(); }

const PIN_SVG = `<svg viewBox="0 0 40 54" aria-hidden="true"><path d="M3 22C3 10 11 3 20 3s17 7 17 19q-4-4-8.3 0Q24.3 18 20 22q-4.3-4-8.7 0Q7 18 3 22Z" fill="#d7332b" stroke="#6b1410" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M20 3 11.3 22M20 3l8.7 19M20 3v19" stroke="#8c1d17" stroke-width="1.2" fill="none"/><circle cx="20" cy="3.5" r="2.2" fill="#f2c14e" stroke="#6b1410" stroke-width="1"/>
<path d="M20 22v28" stroke="#c9ccd1" stroke-width="2.6" stroke-linecap="round"/><path d="M20 22v28" stroke="#fff" stroke-opacity=".6" stroke-width=".8" stroke-linecap="round"/></svg>`;

function ifRender() {
  ifCoin();
  if (!IFN.sel) {
    $('cm').innerHTML = '';
    $('ifstrip').innerHTML = 'Bicara dengan Remi untuk memilih lokasi kasus';
    return;
  }
  const lv = IFN.lv, st = STORY[lv], s = clSt(lv), n = st.clues.length, done = clDone(lv);
  $('cm').innerHTML = `<img src="${clSrc(CL_UI.map(lv))}" alt="Clue Map" draggable="false"><div class="cm-pins">${
    s.got.map((idx, k) => {
      const p = s.pins[idx] || [50, 50];
      return `<button class="cm-pin${IFN.newPin === idx ? ' drop' : ''}" style="left:${p[0]}%;top:${p[1]}%" onclick="openBerkas(${lv},${idx})" title="${st.clues[idx].t}">
        <span class="pn">${PIN_IMG ? `<img src="${encodeURI(PIN_IMG)}" alt="">` : PIN_SVG}</span><b>${k + 1}</b></button>`;
    }).join('')}</div>`;
  IFN.newPin = -1;
  $('ifstrip').innerHTML = `${st.place} &nbsp;&middot;&nbsp; Petunjuk <b>${s.got.length} / ${n}</b> &nbsp;&middot;&nbsp; Pelaku: <b class="${done ? 'ok' : ''}">${done ? st.reveal.name : '???'}</b>`;
}
function ifGreet() {
  if (IFN.gt) { IFN.gt.stop(); IFN.gt = null; }
  const g = ++IFN.gen, lv = IFN.lv, st = STORY[lv], b = $('ifgreet'), dots = $('ifdots');
  dots.hidden = true; b.hidden = true; ifRemi('Idle');
  const text = !IFN.sel ? pick(INFORMANT.hub)
    : clSt(lv).closed ? st.done
    : clDone(lv) ? "Semua kepingan sudah di tanganmu. Tinggal tunggu Inspektur Sinta menelepon. Pulanglah ke menu."
    : pick(st.greet);
  setTimeout(() => {
    if (g !== IFN.gen || !$('ifgreet')) return;
    b.hidden = false; b.className = 'if-greet in';
    ifRemi(IFN.sel && clDone(lv) ? 'Happy' : 'Whispering');
    IFN.gt = clTyper(b, text, () => {
      setTimeout(() => {
        if (g !== IFN.gen || !$('ifgreet')) return;
        b.className = 'if-greet out';
        setTimeout(() => { if (g === IFN.gen && $('ifgreet')) { b.hidden = true; $('ifdots').hidden = false; ifRemi('Idle'); } }, 450);
      }, 1800 + text.length * 35);
    }, 22);
  }, 700);
}
function ifToast(t) {
  const el = $('iftoast'); if (!el) return;
  el.textContent = t; el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  clearTimeout(IFN.toastT); IFN.toastT = setTimeout(() => { const e = $('iftoast'); if (e) e.hidden = true; }, 3600);
}

/* ---- interaksi dengan Remi ---- */
function ifTalk() {
  if (VN || IFN.pickCb || !$('if')) return;
  IFN.gen++; if (IFN.gt) { IFN.gt.stop(); IFN.gt = null; }
  const b = $('ifgreet'); b.hidden = true; $('ifdots').hidden = true;
  vnPlay([ifR('Idle', INFORMANT.hub), ifHubAsk()], { overlay: true, onLine: l => { if (l.w === 'remi') ifRemi(l.e); } }, ifAfter);
}
function ifAfter() { ifRemi('Idle'); const d = $('ifdots'); if (d) d.hidden = false; }

/* Menu utama Remi:
   - Tanyakan informasi di ...   -> pilih salah satu dari 3 map
   - Bayar (koin) untuk informasi -> hanya muncul setelah map dipilih, lalu pilih informasi yang ditukar
   - Sudahi percakapan */
function ifHubAsk() {
  const opts = [{
    l: IFN.sel ? 'Tanyakan informasi di lokasi lain' : 'Tanyakan informasi di lokasi kasus',
    fn: () => vnPush([ifPlaceAsk()])
  }];
  if (IFN.sel && !clDone(IFN.lv)) opts.push({ l: `Bayar ${STORY[IFN.lv].cost} koin untuk informasi`, fn: ifPay });
  opts.push({ l: 'Sudahi percakapan', fn: () => vnPush([ifR('Idle', INFORMANT.bye)]) });
  return { ask: opts };
}
function ifPlaceAsk() {                         // pilih 1 dari 3 map
  const opts = [1, 2, 3].map(l => ({
    l: `${STORY[l].place}${clSt(l).closed ? ' (selesai)' : ''}`,
    fn: () => ifPickPlace(l)
  }));
  opts.push({ l: 'Kembali', fn: () => vnPush([ifHubAsk()]) });
  return { ask: opts };
}
function ifPickPlace(l) {
  IFN.lv = l; IFN.sel = true; ifRender();
  const st = STORY[l];
  const first = clSt(l).closed ? ifLine('Happy', st.done)
    : clDone(l) ? ifLine('Happy', 'Semua kepingan soal tempat itu sudah di tanganmu. Tinggal tunggu telepon dari Inspektur Sinta.')
    : ifLine('Idle', `${st.place}, ya. Aku punya beberapa kepingan soal itu. Bayar, nanti kuceritakan.`);
  vnPush([first, ifHubAsk()]);
}
function ifPay() {
  const lv = IFN.lv, st = STORY[lv];
  if (money() < st.cost) { SFX.deny(); return vnPush([ifR('Suspicious', INFORMANT.broke), ifR('Idle', INFORMANT.more), ifHubAsk()]); }
  SFX.coin(); addMoney(-st.cost); ifCoin();
  vnPush([ifR('Happy', INFORMANT.pay), ifTopicAsk()]);
}
function ifTopicAsk() {
  const lv = IFN.lv, st = STORY[lv], got = clSt(lv).got, opts = [];
  st.clues.forEach((c, i) => { if (!got.includes(i)) opts.push({ l: c.t, fn: () => ifBuy(i) }); });
  opts.push({ l: 'Batal (uang dikembalikan)', fn: ifRefund });
  return { ask: opts };
}
function ifRefund() {
  addMoney(STORY[IFN.lv].cost); ifCoin();
  vnPush([ifR('Idle', INFORMANT.cancel), ifHubAsk()]);
}
function ifBuy(i) {
  const lv = IFN.lv, c = STORY[lv].clues[i];
  const sent = c.d.match(/[^.!?]+[.!?]+(\s+|$)/g) || [c.d], pages = [];
  for (let k = 0; k < sent.length; k += 2) pages.push(sent.slice(k, k + 2).join('').trim());
  const ex = ['Whispering', 'Idle', 'Suspicious'];
  const lines = pages.map((t, k) => ifLine(ex[k % 3], t));
  lines.push(ifR('Happy', INFORMANT.handover));
  lines.push({ run: () => ifGive(lv, i) });
  vnPush(lines);
}
function ifGive(lv, i) {
  const c = STORY[lv].clues[i], o = document.createElement('div');
  o.className = 'ov pick'; o.id = 'ovpick';
  o.innerHTML = `<img class="pick-item" src="${clSrc(CL_UI.berkasItem)}" alt="Berkas"><h2>Mendapatkan informasi baru!</h2>
    <p>Berkas: <b>${c.t}</b></p><small>Klik untuk lanjut</small>`;
  o.onclick = () => ifGiveDone(lv, i);
  $('scene').appendChild(o); SFX.reveal();
  IFN.pickCb = true;
}
function ifGiveDone(lv, i) {
  if (!IFN.pickCb) return; IFN.pickCb = null;
  const o = $('ovpick'); if (o) o.remove();
  const s = clSt(lv), st = STORY[lv];
  if (!s.got.includes(i)) { s.got.push(i); s.pins[i] = clPlacePin(lv); }
  clSave();
  IFN.newPin = i; ifRender();
  const fin = clDone(lv);
  ifToast(`Clue terbuka: ${st.clues[i].t}  (${s.got.length}/${st.clues.length})`);
  SFX.coin();
  const nx = [];
  if (fin) {
    nx.push(ifLine('Whispering', st.reveal.text));
    nx.push(ifLine('Happy', "Sekarang tinggal tunggu telepon dari polisi. Kembalilah ke menu, dan angkat kalau berdering."));
    setTimeout(() => { if ($('if')) { ifToast(`Semua petunjuk terkumpul. Pelaku: ${st.reveal.name}`); SFX.win(); } }, 1600);
  }
  nx.push(ifR('Idle', INFORMANT.more), ifHubAsk());
  vnPush(nx);
}
function clPlacePin(lv) {                       // posisi acak di papan (persen dari gambar), tidak saling menumpuk
  const ex = Object.values(clSt(lv).pins);
  let min = 12;
  for (let t = 0; ; t++) {
    const x = 12 + Math.random() * 76, y = 22 + Math.random() * 56;
    if (ex.every(p => Math.hypot(p[0] - x, (p[1] - y) * .82) >= min)) return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    if (t % 30 === 29) min *= .85;
  }
}

/* ---- membaca berkas dari pin ---- */
function openBerkas(lv, idx) {
  if (VN || IFN.pickCb || document.getElementById('ovbk')) return;
  const st = STORY[lv], c = st.clues[idx], s = clSt(lv), no = s.got.indexOf(idx) + 1;
  const o = document.createElement('div');
  o.className = 'ov bk'; o.id = 'ovbk'; o.onclick = () => o.remove();
  const paras = c.f.split('\n\n');
  let L = paras, Rr = [];
  if (paras.length >= 2) { const h = Math.ceil(paras.length / 2); L = paras.slice(0, h); Rr = paras.slice(h); }
  else { const se = paras[0].split(/(?<=[.!?])\s+/), h = Math.ceil(se.length / 2); L = [se.slice(0, h).join(' ')]; Rr = [se.slice(h).join(' ')]; }
  const P = a => a.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  o.innerHTML = `<div class="bk-in" onclick="event.stopPropagation()"><img src="${clSrc(CL_UI.berkasUI)}" alt="Berkas" draggable="false">
    <div class="bk-pg bk-l"><small>BERKAS NO. ${no} &middot; ${c.k}</small><h3>${c.t}</h3>${P(L)}</div>
    <div class="bk-pg bk-r">${P(Rr)}<div class="bk-stamp">ARSIP REMI<br>${st.place.toUpperCase()}</div></div>
    <button class="bk-x" onclick="document.getElementById('ovbk').remove()" aria-label="Tutup">&#10005;</button></div>`;
  $('scene').appendChild(o); SFX.click();
}

/* ============ PEMBUNGKUS menu() ============ */
const clMenu0 = menu;
menu = function () { clAbort(); clMenu0(); clPhone(); };
menu();                                         // render ulang menu (menu pertama dibuat sebelum file ini dimuat)

/* ============ RESET DATA (tekan \ di main menu) ============
   Hanya aktif saat main menu tampil. Pilih Story / Uang / Semua, lalu konfirmasi. */
const RS_START_MONEY = 0;                       // uang setelah direset (ganti kalau uang awal game bukan 0)
const RS_LABEL = { story: 'Story', uang: 'Uang', semua: 'Story + Uang' };

(function rsStyle() {
  const s = document.createElement('style');
  s.textContent = `
  .rs{position:absolute;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72)}
  .rs-box{min-width:min(420px,86%);padding:22px 26px;border:2px solid #f2c14e;border-radius:12px;background:#1b1612;color:#f6e9cf;text-align:center;font-family:inherit}
  .rs-box h2{margin:0 0 6px;font-size:22px;color:#f2c14e}
  .rs-box p{margin:0 0 16px;font-size:15px;opacity:.85}
  .rs-box button{display:block;width:100%;margin:8px 0 0;padding:11px 14px;border:0;border-radius:8px;background:#f2c14e;color:#2a1d08;font:inherit;font-size:16px;font-weight:700;cursor:pointer}
  .rs-box button:hover{filter:brightness(1.1)}
  .rs-box button.all,.rs-box button.yes{background:#d7332b;color:#fff}
  .rs-box button.x{background:transparent;color:#f6e9cf;border:1px solid #6b5a3c}
  .rs-hint{margin-top:12px;font-size:12px;opacity:.55}`;
  document.head.appendChild(s);
})();

function rsOpen() {
  if (!document.querySelector('.mn') || $('rs')) return;
  const o = document.createElement('div');
  o.className = 'rs'; o.id = 'rs'; o.onclick = rsClose;
  o.innerHTML = `<div class="rs-box" id="rsbox" onclick="event.stopPropagation()">
    <h2>Hapus Data</h2><p>Pilih data yang mau dihapus</p>
    <button onclick="rsAsk('story')">Story</button>
    <button onclick="rsAsk('uang')">Uang</button>
    <button class="all" onclick="rsAsk('semua')">Semua (Story + Uang)</button>
    <button class="x" onclick="rsClose()">Batal</button>
    <div class="rs-hint">Tekan \\ lagi untuk menutup</div></div>`;
  $('scene').appendChild(o);
}
function rsClose() { const o = $('rs'); if (o) o.remove(); }
function rsAsk(what) {
  const b = $('rsbox'); if (!b) return;
  b.innerHTML = `<h2>Hapus ${RS_LABEL[what]}?</h2><p>Data yang dihapus tidak bisa dikembalikan.</p>
    <button class="yes" onclick="rsDo('${what}')">Ya, hapus</button>
    <button class="x" onclick="rsClose()">Batal</button>`;
}
function rsDo(what) {
  if (what === 'story' || what === 'semua') {
    Object.keys(CLS).forEach(k => delete CLS[k]);
    clSave();
  }
  if (what === 'uang' || what === 'semua') {
    if (typeof money === 'function' && typeof addMoney === 'function') addMoney(RS_START_MONEY - money());
  }
  rsClose();
  menu();                                       // render ulang menu (telepon berdering hilang, koin ter-update)
}
document.addEventListener('keydown', e => {
  if (e.key !== '\\') return;
  const t = e.target && e.target.tagName;
  if (t === 'INPUT' || t === 'TEXTAREA') return;
  if ($('rs')) rsClose(); else rsOpen();
});