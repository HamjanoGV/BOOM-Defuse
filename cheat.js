'use strict';
/* ============ MODE TES (cheat) ============
   Menambah bagian "Mode Tes" di panel volume (ikon speaker pojok kiri atas).
   Dimuat PALING AKHIR di index.html.
   Sebelum dirilis ke pemain, ubah CHEAT menjadi false. */
const CHEAT = true;

if (CHEAT) (function () {
  const stage = document.getElementById('stage'); if (!stage) return;
  const $c = id => document.getElementById(id);

  /* ---------- gaya ---------- */
  const css = document.createElement('style');
  css.textContent = `
    #aupanel{width:18cqw}
    #chsec{margin-top:.4cqw;padding-top:.7cqw;border-top:.12cqw solid #c9a66b;display:flex;flex-direction:column;gap:.5cqw}
    #chsec>b{color:#ffb000;font-size:1.2cqw}
    #chsec input{width:100%;font-size:1.2cqw;padding:.3cqw .5cqw;border-radius:.4cqw;border:.1cqw solid #c9a66b;
      background:#1d1824;color:#fff;user-select:text;-webkit-user-select:text}
    #chsec button{font-size:1.05cqw;padding:.3cqw .6cqw}
    .chrow{display:flex;gap:.4cqw}.chrow button{flex:1}
    #chmsg{color:#ffb000;font-size:1cqw;min-height:1.3cqw;line-height:1.3}`;
  document.head.appendChild(css);

  /* ---------- panel (pakai milik audio.js; kalau tidak ada, buat sendiri) ---------- */
  let panel = $c('aupanel');
  if (!panel) {
    const w = document.createElement('div'); w.id = 'audio';
    w.innerHTML = `<button id="aubtn" aria-label="Mode Tes">&#9881;</button><div id="aupanel" hidden></div>`;
    stage.appendChild(w);
    panel = $c('aupanel');
    $c('aubtn').onclick = () => { panel.hidden = !panel.hidden; };
  }
  const sec = document.createElement('div'); sec.id = 'chsec';
  sec.innerHTML = `<b>Mode Tes</b>
    <input id="chn" type="number" min="0" value="1000" inputmode="numeric" aria-label="Jumlah koin">
    <div class="chrow"><button id="chadd">Tambah</button><button id="chset">Atur</button></div>
    <button id="chall">Buka semua petunjuk</button>
    <button id="chrc">Reset koin</button>
    <button id="chrs">Reset cerita</button>
    <button id="chra">Reset semua</button>
    <small id="chmsg"></small>`;
  panel.appendChild(sec);

  /* ---------- bantu ---------- */
  const num = () => Math.max(0, Math.floor(+$c('chn').value) || 0);
  const say = t => { $c('chmsg').textContent = t; };
  const sync = () => document.querySelectorAll('.mn-coin,.mm-coin,#ifcoin')
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