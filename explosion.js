'use strict';
/* ============ VIDEO LEDAKAN SAAT KALAH ============
   File ini dimuat SETELAH game.js dan menu.js, dan menggantikan fungsi boom() milik game.js.
   Alur: layar fade out ke hitam -> video ledakan (tanpa suara) diputar sekali sesuai level
   (Explode Level 1/2/3.mp4) -> setelah selesai muncul hitung mundur EX_BACK detik menuju menu utama,
   plus tombol untuk langsung kembali.
   Folder "Explosion" diletakkan satu folder dengan index.html (sejajar "Menu", "Look Around").
   Kalau lokasinya beda, ubah EX_DIR. Kalau file video bermasalah, pesan galat tampil di panel. */
const EX_DIR = 'Explosion/';             // lokasi utama (kalau beda, ubah ini)
const EX_ALT = ['In game Asset/Explosion/', 'Explosion/Explosion/', 'In game Asset/Explosion/Explosion/'];   // dicoba otomatis kalau lokasi utama gagal
const EX_BACK = 7;                       // hitung mundur (detik) setelah video selesai
const EX_FADE = 1400;                    // lama fade out sebelum video (ms) - makin besar makin lambat/dramatis
const exVideo = (lv, dir) => srcLA(`${dir}Explode Level ${lv}.mp4`);

let ex = null;                           // state ledakan yang sedang tampil (null = tidak ada)

function boom(why) {
  if (!S || S.over) return;
  S.over = true; clearInterval(tick); clearTimeout(backTimer);
  $('stage').classList.remove('nocur');
  const f = fadeEl();                    // fade out ke hitam dulu (durasi khusus ledakan, lebih lambat dari transisi biasa)
  f.style.transition = `opacity ${EX_FADE}ms ease-in-out`;
  f.classList.add('on');
  showExplosion(S.lv, why);
}

function showExplosion(lv, why) {
  const el = document.createElement('div'); el.id = 'exp';
  el.style.opacity = '1'; el.style.transition = 'none';   // pengaman: tetap terlihat walau CSS lama membuat #exp transparan
  el.style.visibility = 'hidden';        // disembunyikan sampai fade out selesai (video tetap dimuat di belakang)
  el.innerHTML = `<video class="exp-v" playsinline muted preload="auto"></video>
    <button class="exp-tap" hidden>&#9654; Putar video</button>
    <div class="exp-panel" hidden><h1>BOOM!</h1><p>${why}<br>Kamu kalah. Tidak ada koin.</p>
      <p class="exp-err" hidden></p>
      <p class="exp-cd">Kembali ke menu dalam <b>${EX_BACK}</b></p>
      <button onclick="leaveExplosion()">Kembali ke menu</button></div>`;
  $('stage').appendChild(el);            // berada di bawah layar fade, jadi video dimuat diam-diam selagi fade out
  const v = el.querySelector('video'), panel = el.querySelector('.exp-panel'), num = el.querySelector('.exp-cd b'),
        tap = el.querySelector('.exp-tap'), err = el.querySelector('.exp-err');
  v.muted = true; v.defaultMuted = true;  // video tanpa suara
  const my = ex = { el, video: v, iv: 0, fail: 0, rv: 0 };
  let shown = false, revealed = false;

  const done = () => {                    // video selesai (atau gagal) -> panel + hitung mundur
    if (ex !== my || shown) return;
    shown = true; clearTimeout(my.fail); v.pause(); tap.hidden = true;
    panel.hidden = false; el.classList.add('done');
    let c = EX_BACK; num.textContent = c;
    my.iv = setInterval(() => { c--; num.textContent = c; if (c <= 0) leaveExplosion(); }, 1000);
  };
  const play = () => {                    // kalau diblokir browser -> tampil tombol putar manual
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(e => {
      if (ex !== my || shown || (e && e.name === 'AbortError')) return;
      tap.hidden = false; clearTimeout(my.fail);
    });
  };

  v.addEventListener('playing', () => {   // video benar-benar jalan -> pengaman = durasi + 4 detik
    tap.hidden = true; clearTimeout(my.fail);
    my.fail = setTimeout(done, ((v.duration || 6) + 4) * 1000);
  });
  v.addEventListener('ended', done);
  const dirs = [EX_DIR, ...EX_ALT]; let di = 0;
  v.addEventListener('error', () => {     // file tidak ketemu / format tidak didukung
    if (ex !== my || shown) return;
    if (++di < dirs.length) { v.src = exVideo(lv, dirs[di]); if (revealed) play(); return; }   // coba lokasi lain
    err.hidden = false;
    err.textContent = 'Video tidak bisa dimuat. Lokasi yang dicoba: ' + dirs.map(d => d + 'Explode Level ' + lv + '.mp4').join(' | ');
    done();
  });
  tap.onclick = () => { tap.hidden = true; play(); };

  v.src = exVideo(lv, dirs[0]);           // mulai memuat (belum diputar)
  my.rv = setTimeout(() => {              // fade out selesai -> tampilkan video dari awal
    if (ex !== my) return;
    revealed = true;
    const f = fadeEl();
    el.style.visibility = 'visible';
    f.style.transition = 'none'; f.classList.remove('on'); void f.offsetWidth; f.style.transition = '';   // layar hitam langsung berganti ke video
    play();                               // diputar sekali (tanpa loop)
    if (!shown) my.fail = setTimeout(done, 15000);   // pengaman kalau video macet sebelum mulai
  }, EX_FADE + 50);
}

function leaveExplosion() {
  if (!ex) return;
  const cur = ex; ex = null;
  clearTimeout(cur.fail); clearTimeout(cur.rv); clearInterval(cur.iv);
  cur.video.pause(); cur.el.remove();
  menu();
}