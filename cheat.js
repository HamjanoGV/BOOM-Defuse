'use strict';
/* ============ MODE TES (cheat) ============
   Panel cheat TERPISAH dari pengaturan suara. Hanya bisa dibuka/ditutup dengan tombol ]
   (pengaturan suara tetap lewat ikon speaker di pojok kiri atas).
   Dimuat PALING AKHIR di index.html, setelah clues.js:
       <script src="clues.js"></script>
       <script src="cheat.js"></script>
   Sebelum dirilis ke pemain, ubah CHEAT menjadi false (atau hapus baris script-nya). */
const CHEAT = true;

if (CHEAT) (function () {
  const stage = document.getElementById('stage'); if (!stage) return;
  const $c = id => document.getElementById(id);

  /* ---------- gaya ---------- */
  const css = document.createElement('style');
  css.textContent = `
    #cheat{position:absolute;top:5cqw;right:1cqw;z-index:60;width:20cqw;background:rgba(10,8,14,.95);
      border:.15cqw solid #ff5a3c;border-radius:.8cqw;padding:.8cqw 1cqw;display:flex;flex-direction:column;gap:.55cqw;
      font-size:1.15cqw;box-shadow:0 .5cqw 1.5cqw rgba(0,0,0,.7)}
    #cheat[hidden]{display:none}
    .chhead{display:flex;justify-content:space-between;align-items:center;color:#ff5a3c;font-size:1.3cqw}
    .chhead small{color:#999;font-weight:normal;font-size:.95cqw;margin-left:.4cqw}
    #chx{padding:.1cqw .6cqw;font-size:1.1cqw}
    #cheat input{width:100%;font-size:1.25cqw;padding:.35cqw .6cqw;border-radius:.4cqw;border:.1cqw solid #c9a66b;
      background:#1d1824;color:#fff;user-select:text;-webkit-user-select:text}
    #cheat button{font-size:1.1cqw;padding:.35cqw .6cqw}
    .chrow{display:flex;gap:.4cqw}.chrow button{flex:1}
    #chmsg{color:#ffb000;font-size:1cqw;min-height:1.3cqw;line-height:1.3}`;
  document.head.appendChild(css);

  /* ---------- panel cheat (terpisah dari #audio) ---------- */
  const panel = document.createElement('div'); panel.id = 'cheat'; panel.hidden = true;
  panel.innerHTML = `
    <div class="chhead"><b>Mode Tes<small>tekan ] untuk tutup</small></b><button id="chx" aria-label="Tutup">&#10005;</button></div>
    <input id="chn" type="number" min="0" value="1000" inputmode="numeric" aria-label="Jumlah koin">
    <div class="chrow"><button id="chadd">Tambah</button><button id="chset">Atur</button></div>
    <button id="chall">Buka semua petunjuk</button>
    <button id="chrc">Reset koin</button>
    <button id="chrs">Reset cerita</button>
    <button id="chra">Reset semua</button>
    <small id="chmsg"></small>`;
  stage.appendChild(panel);

  /* ---------- shortcut: tekan ] untuk buka/tutup ---------- */
  const toggle = () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) { say(''); const i = $c('chn'); if (i) i.select(); }
  };
  document.addEventListener('keydown', e => {
    if (e.key !== ']' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault(); toggle();
  }, true);
  $c('chx').onclick = () => { panel.hidden = true; };

  /* ---------- bantu ---------- */
  const num = () => Math.max(0, Math.floor(+$c('chn').value) || 0);
  function say(t) { const m = $c('chmsg'); if (m) m.textContent = t; }
  const sync = () => document.querySelectorAll('.mn-coin,.mm-coin,.inf-coin,#ifcoin')
    .forEach(e => { e.textContent = 'Koin: ' + money(); });
  const redraw = () => {                         // gambar ulang layar kalau tidak sedang bermain
    if (typeof S !== 'undefined' && S && !S.over) return;
    if ($c('if')) openInformant();
    else if (document.querySelector('.mn,.mm')) menu();
  };

  /* ---------- koin ---------- */
  $c('chadd').onclick = () => { const n = num(); addMoney(n); sync(); say(`+${n} koin. Total: ${money()}`); };
  $c('chset').onclick = () => {
    const n = num();
    try { localStorage.setItem('bd_coin', n); } catch (e) {}
    sync(); say(`Koin diatur menjadi ${money()}`);
  };
  $c('chn').addEventListener('keydown', e => {   // cegah tombol game (mis. Backspace di bom) ikut terpicu
    e.stopPropagation();
    if (e.key === 'Enter') $c('chadd').click();
  });

  /* ---------- cerita ---------- */
  const wipeCoin = () => { try { localStorage.removeItem('bd_coin'); } catch (e) {} };
  const wipeStory = () => {
    CLS = {};
    if (typeof PROG !== 'undefined') PROG = {};  // progres lama dari game.js
    try { localStorage.removeItem('bd_story2'); localStorage.removeItem('bd_clues'); } catch (e) {}
  };
  $c('chrc').onclick = () => { wipeCoin(); sync(); say('Koin direset ke 0'); };
  $c('chrs').onclick = () => {
    if (!confirm('Reset semua progres cerita (petunjuk & kasus selesai)?')) return;
    wipeStory(); redraw(); say('Progres cerita direset');
  };
  $c('chra').onclick = () => {
    if (!confirm('Reset koin DAN semua progres cerita?')) return;
    wipeCoin(); wipeStory(); sync(); redraw(); say('Semua data direset');
  };
  $c('chall').onclick = () => {
    [1, 2, 3].forEach(lv => {
      const s = clSt(lv);
      s.closed = false; s.pins = {};
      s.got = STORY[lv].clues.map((_, i) => i);
      s.got.forEach(i => { s.pins[i] = clPlacePin(lv); });
    });
    clSave(); redraw();
    say('Semua petunjuk terbuka. Kembali ke menu, telepon akan berdering.');
  };
})();