'use strict';
/* ============ STORY BOMB DEFUSE (versi Clues + Cutscene) ============
   Tiga level, tiga cerita terpisah.
   Per level:
     intro   : narasi awal misi (dipakai game.js: briefing)
     greet   : kalimat sapaan Remi saat masuk laman Clues
     tkp     : dialog "Tempat Perkara" (gratis)
     clues   : [{t judul, k jenis berkas, d dialog Remi, f isi berkas}]  (5 / 10 / 15)
     reveal  : pelaku (terungkap setelah SEMUA petunjuk terkumpul)
     call    : dialog telepon polisi
     meet    : dialog melabrak pelaku (di TKP)
     epilog  : narasi penutup cerita (cutscene)
   Format baris dialog:
     {w:'player'|'remi'|'sinta'|'bram'|'hendra'|'reza', e:'Ekspresi', t:'teks'}
     {n:'teks narator'}   {cap:'Judul lokasi', sub:'waktu'}   {bg:'taman'|'kantor'|'pesawat'|'airport'|'polisi'}
     {show:'bram', e:'Idle'}  (menampilkan karakter tanpa teks)
     {ask:[{l:'label', go:[...baris], end:true}], loop:true}
   Ekspresi yang tersedia:
     player: Idle Angry Determined Happy Sad Shocked | remi: Idle Angry Happy Shocked Suspicious Whispering
     sinta : Idle Angry Commanding Happy Shocked Tired | bram: Idle Angry Defeated "Gentle smile" Sad Shocked
     hendra: Idle Angry Defeated Nervous Shocked Smug  | reza: Idle Angry "Bitter smile" Resolute Sad Shocked */

const INFORMANT = {
  name: 'Remi',
  hub: [
    "Ya? Kamu butuh apa kali ini?",
    "Hmm. Duduk saja kalau mau, tapi jangan terlalu lama. Lorong ini punya mata.",
    "Kamu lagi. Baik, saya dengarkan."
  ],
  pay: [
    "Uangnya sudah masuk kantong. Sekarang, kamu mau dengar soal apa?",
    "Hmm, bayaran yang pas. Pilih satu topik, dan mulut saya terbuka.",
    "Oke, kita bertransaksi. Bagian yang mana yang mau kamu tahu?"
  ],
  broke: [
    "Uangmu belum cukup. Kembali kalau dompetmu sudah lebih tebal.",
    "Saya bukan lembaga amal. Jinakkan bom dulu, baru kita bicara.",
    "Segitu? Kurang. Selesaikan beberapa misi lagi, lalu datang kemari."
  ],
  cancel: [
    "Berubah pikiran? Nih, uangmu saya kembalikan. Tidak ada yang rugi.",
    "Tidak jadi? Ya sudah. Uangmu utuh, pintu saya tetap terbuka."
  ],
  handover: [
    "Itu garis besarnya. Kalau mau tahu lengkapnya, baca saja berkas ini.",
    "Selebihnya ada di sini. Baca sendiri, jangan bilang dari mana kamu dapat.",
    "Yang rinci saya tulis di berkas ini. Ambil, dan simpan baik-baik."
  ],
  more: [
    "Masih ada yang mau kamu tanyakan?",
    "Ada lagi?",
    "Lanjut, atau cukup sampai di sini?"
  ],
  bye: [
    "Hati-hati di luar sana. Lorong ini tidak pernah benar-benar sepi.",
    "Sampai jumpa. Dan jangan lupa, kamu tidak pernah kenal saya."
  ]
};

const STORY = (() => {
  const M  = (e, t) => ({ w: 'player', e, t });
  const R  = (e, t) => ({ w: 'remi', e, t });
  const SN = (e, t) => ({ w: 'sinta', e, t });
  const B  = (e, t) => ({ w: 'bram', e, t });
  const H  = (e, t) => ({ w: 'hendra', e, t });
  const RZ = (e, t) => ({ w: 'reza', e, t });
  const N  = t => ({ n: t });
  const CAP = (cap, sub) => ({ cap, sub });
  const BG = bg => ({ bg });
  const SHOW = (w, e) => ({ show: w, e });

  return {

/* ================================================================ LEVEL 1 */
1: {
  diff: 'Easy', place: 'Taman Kota', title: 'Bom di Bawah Bangku', cost: 50,
  intro: [
    "Sabtu sore, Taman Kota Mandala sedang ramai. Anak-anak berlarian, para pedagang menjajakan jajanan, dan musik akustik mengalun dari panggung kecil di dekat air mancur.",
    "Pukul 15.42, seorang petugas kebersihan menemukan kotak logam di bawah salah satu bangku taman. Dari dalamnya terdengar bunyi detak yang pelan, tetapi pasti.",
    "Polisi sudah menutup area, namun regu penjinak bom masih terjebak macet di seberang kota. Kamu satu-satunya spesialis yang berada dalam jarak lima menit.",
    "Cari petunjuk di sekitarmu, pecahkan kodenya, lalu potong kabel yang benar. Setiap bom yang berhasil dijinakkan akan dibayar dengan imbalan yang pantas."
  ],
  greet: [
    "Psst, sini. Taman Mandala itu wilayah saya. Ada yang lewat, ada yang menetap, dan semuanya saya hafal.",
    "Kamu lagi mengejar si pemasang bom di taman, kan? Informasi saya murah untuk kasus semudah ini.",
    "Pelakunya meninggalkan jejak seperti remah roti. Tinggal siapa yang mau membayar untuk mengikutinya."
  ],
  done: "Kasus taman sudah tuntas, kawan. Pelakunya Bram Santoso. Tidak ada lagi yang bisa saya jual soal ini.",
  reveal: {
    name: 'Bram Santoso',
    text: "Kalau semua kepingan itu kamu susun, orangnya cuma satu: Bram Santoso, mantan teknisi irigasi Dinas Pertamanan. Dendamnya pada kota dibungkus dalam kotak logam di bawah bangku itu. Alamat kosnya sudah saya bisikkan ke polisi. Sisanya urusan mereka."
  },
  tkp: [
    R('Idle', "Tempat perkara, ya. Taman Mandala, bangku dekat air mancur. Kotak logam itu terselip di bawahnya, tepat di bawah tempat duduk."),
    R('Suspicious', "Anehnya, bukan bangku paling ramai. Pelakunya memilih tempat yang cukup sepi supaya tidak mengundang curiga, tapi cukup dekat jalan supaya kotaknya pasti ketemu."),
    R('Whispering', "Orang yang memasang itu hafal taman ini luar-dalam. Dia tahu jam petugas kebersihan lewat, dan dia tahu bangku mana yang jarang diperiksa."),
    R('Idle', "Itu gambaran luarnya. Kalau mau yang lebih dalam, ada harganya.")
  ],
  clues: [
    { t: "Cara berjalan", k: "KETERANGAN SAKSI",
      d: "Saksi di warung bakso bilang orangnya berjalan pincang, kaki kiri. Tidak parah, tapi cukup bikin langkahnya miring. Dia sering menyembunyikannya dengan bersandar ke batang pohon.",
      f: "Saksi: penjual bakso, Warung Pojok Taman Mandala.\n\nSekitar pukul 15.20, seorang lelaki berjaket hijau lusuh memesan teh hangat. Ketika berdiri, langkahnya miring ke kiri; ia menahan sakit lalu bersandar pada batang pohon sebelum pergi ke arah air mancur.\n\nSaksi tidak melihat wajahnya jelas karena topi ditarik rendah." },
    { t: "Latar belakang pekerjaan", k: "ARSIP KEPEGAWAIAN",
      d: "Orang ini dulu bekerja di Dinas Pertamanan, bagian instalasi irigasi. Tiga bulan lalu dia dipecat karena dituduh mencuri pompa air. Dia selalu bilang itu fitnah.",
      f: "Dinas Pertamanan Kota. Bagian: Instalasi Irigasi.\n\nPegawai kontrak tingkat teknisi, masa kerja sebelas tahun. Diberhentikan tiga bulan lalu atas dugaan pencurian satu unit pompa air. Pegawai membantah dan menolak menandatangani berita acara.\n\nCatatan: pompa belum ditemukan saat pemberhentian." },
    { t: "Kebiasaan di taman", k: "CATATAN PENGAMATAN",
      d: "Hampir tiap sore dia duduk di dekat air mancur dan menabur remah roti ke merpati. Kata penjual jagung, dia paling ramah pada burung dan paling dingin pada manusia.",
      f: "Pengamat: petugas kebersihan taman, shift sore.\n\nSelama dua bulan terakhir, lelaki yang sama duduk di bangku dekat air mancur setiap pukul 16.00 membawa sekantong remah roti untuk merpati. Tidak pernah berbicara dengan pengunjung. Merpati mendekatinya tanpa takut." },
    { t: "Asal komponen bom", k: "LAPORAN LABORATORIUM",
      d: "Timer di dalam kotak itu bekas pengatur irigasi otomatis, jenis yang hanya dipasang di taman milik pemerintah kota. Gudang irigasinya terkunci sejak dia dipecat, tapi salinan kuncinya tidak pernah dia kembalikan.",
      f: "Barang bukti: pengatur waktu (timer) rangkaian bom.\n\nKomponen identik dengan pengatur irigasi otomatis tipe RG-4 yang hanya dipasang di taman milik pemerintah kota. Nomor seri sebagian terkikis, namun cap Dinas Pertamanan terbaca di sisi dalam.\n\nGudang irigasi terkunci sejak pemberhentian; satu salinan kunci tidak dikembalikan." },
    { t: "Tempat tinggal", k: "LAPORAN LAPANGAN",
      d: "Sekarang dia ngekos di gang sempit di belakang Pasar Mandala, kamar paling ujung di lantai dua. Jendelanya selalu tertutup kain hijau, dan tiap malam terdengar suara solder.",
      f: "Lokasi: gang sempit belakang Pasar Mandala, kos dua lantai.\n\nKamar paling ujung lantai dua. Jendela ditutup kain hijau dari dalam. Tetangga melaporkan bau timah panas dan suara solder hampir setiap malam. Penghuni jarang keluar kecuali sore hari." }
  ],
  call: [
    CAP('Pos Polisi Kota Mandala', 'Telepon tersambung'),
    BG('polisi'),
    N("Kamu mengangkat gagang telepon. Suara di seberang terdengar lelah, tapi tegas."),
    SN('Tired', "Halo. Ini Inspektur Sinta dari Polres Kota. Saya bicara dengan penjinak bom yang bertugas di Taman Mandala?"),
    M('Idle', "Benar, Inspektur."),
    SN('Idle', "Bagus. Informasi yang kamu kumpulkan sudah sampai ke meja saya. Semalaman tim saya mencocokkan satu per satu. Ada beberapa hal yang mau kamu tanyakan sebelum bergerak?"),
    { ask: [
      { l: "Siapa pelakunya sebenarnya?", go: [
        SN('Idle', "Bram Santoso, empat puluh enam tahun, mantan teknisi irigasi Dinas Pertamanan."),
        SN('Tired', "Dan satu hal yang tidak diumumkan Dinas: pompa air yang dituduhkan padanya ditemukan seminggu setelah dia dipecat. Salah catat gudang. Tidak ada yang meminta maaf.")
      ] },
      { l: "Apakah buktinya cukup?", go: [
        SN('Idle', "Cukup untuk menangkap, belum cukup untuk vonis. Pengakuan langsung darinya akan menentukan. Sidik jari di kotak itu baru setengah selesai kami proses.")
      ] },
      { l: "Kenapa tidak disergap di kosnya?", go: [
        SN('Commanding', "Terlalu berisiko. Di kamarnya masih tersimpan solder dan sisa komponen. Kalau panik, dia bisa merakit sesuatu lagi."),
        SN('Idle', "Taman lebih aman: terbuka, ramai, dan tiap pukul empat sore dia pasti datang menaburkan remah roti.")
      ] },
      { l: "Saya berangkat sekarang.", end: true, go: [
        SN('Commanding', "Kami tunggu di pos taman. Satu hal: jangan bertindak sebelum saya beri tanda. Dia mungkin rapuh, tapi dia tetap pembuat bom."),
        M('Determined', "Dimengerti.")
      ] }
    ], loop: true }
  ],
  meet: [
    CAP('Taman Kota Mandala', 'Senin · 16.05'),
    BG('taman'),
    N("Matahari condong. Angin membawa bau rumput basah. Di atas air mancur, merpati-merpati berputar rendah."),
    SHOW('bram', 'Gentle smile'),
    N("Di bangku dekat air mancur, seorang lelaki berjaket hijau menaburkan remah roti dengan telaten. Merpati mengerumuninya seperti pelanggan setia."),
    B('Gentle smile', "Pelan-pelan. Semua kebagian. Dasar rakus."),
    M('Idle', "Merpati setia sekali, ya, Pak. Katanya itu sebabnya Bapak tiap sore ke sini."),
    B('Idle', "Siapa yang bilang begitu? Penjual jagung? Orang taman ini terlalu banyak bicara."),
    M('Idle', "Dan penjual bakso bilang Bapak bersandar ke pohon tiap berdiri. Kaki kiri, kan?"),
    B('Idle', "Saya sudah lama begini. Jatuh dari tangga waktu kerja dulu. Apa urusannya dengan Anda?"),
    M('Determined', "Tangga yang mana, Pak? Gudang irigasi Dinas Pertamanan?"),
    B('Shocked', "..."),
    N("Remah roti di tangannya berhenti jatuh. Merpati-merpati mulai gelisah."),
    B('Angry', "Saya tidak kenal Anda. Pergi, sebelum saya panggil petugas."),
    M('Idle', "Panggil saja. Petugasnya tiga puluh meter di belakang bangku itu. Sengaja tidak berseragam."),
    M('Determined', "Timer di kotak itu bekas pengatur irigasi RG-4. Hanya ada di taman milik kota. Gudangnya terkunci sejak Bapak pergi, tapi ada satu kunci yang tidak pernah kembali."),
    B('Angry', "Saya DIFITNAH! Sebelas tahun saya merawat taman ini, tiap selokan, tiap pipa! Lalu mereka menyuruh saya pergi seperti pencuri!"),
    { ask: [
      { l: "Tunjukkan bukti-buktinya", go: [
        M('Determined', "Saya sudah baca berkasnya, Pak. Pompa itu ditemukan seminggu setelah Bapak dipecat, di gudang yang salah dicatat. Tidak ada yang minta maaf, bukan?"),
        B('Shocked', "Anda... tahu soal itu?"),
        M('Idle', "Saya tahu. Dan saya tahu rasanya dituduh untuk hal yang tidak dilakukan. Tapi itu bukan alasan memasang bom.")
      ] },
      { l: "Biarkan dia bicara", go: [
        M('Sad', "Ceritakan, Pak. Saya mendengarkan."),
        B('Sad', "Tiga bulan saya diam. Datang ke dinas, ditolak. Kirim surat, tidak dibalas. Orang-orang yang dulu menyapa saya tiba-tiba pura-pura sibuk."),
        B('Sad', "Satu-satunya yang tidak berubah cuma burung-burung itu.")
      ] }
    ] },
    B('Defeated', "Saya cuma ingin kota ini berhenti pura-pura tuli."),
    M('Angry', "Dengan kotak yang berdetak di bawah bangku tempat anak-anak duduk?"),
    B('Shocked', "Saya... saya atur timernya supaya ada yang sempat menemukan. Saya tidak pernah mau—"),
    M('Angry', "Tidak ada yang bisa menjamin siapa yang menemukannya lebih dulu, Pak! Sabtu sore, ada anak yang menaruh bekalnya di atas kotak itu!"),
    N("Sunyi. Merpati-merpati terbang serentak, meninggalkan remah yang tersisa."),
    B('Defeated', "...Benar. Tidak ada yang bisa menjamin."),
    B('Sad', "Boleh saya minta satu hal? Kantong remah ini. Besok pagi mereka akan kelaparan."),
    M('Sad', "Saya yang urus."),
    N("Bram menyerahkan kantong itu dengan kedua tangannya, lalu mengulurkan pergelangan tangan tanpa perlawanan."),
    SN('Commanding', "Bram Santoso, Anda ditahan atas percobaan peledakan di tempat umum. Bawa dia."),
    M('Idle', "Terima kasih sudah menunggu tanda dari saya, Inspektur."),
    SN('Happy', "Kamu bekerja bagus. Istirahatlah.")
  ],
  epilog: { bg: 'taman', lines: [
    "Malam itu, Dinas Pertamanan membuka kembali berkas pemecatan Bram Santoso. Pompa yang dituduhkan terbukti tidak pernah dicuri, hanya salah catat. Permintaan maaf resmi datang tiga bulan terlambat.",
    "Bram menjalani proses hukum atas percobaan peledakan. Kantong remah rotinya kamu titipkan pada penjual jagung, yang berjanji menaburkannya setiap sore.",
    "Di Taman Mandala, merpati-merpati tetap berkumpul di dekat air mancur. Dan di bawah bangku itu, tidak ada lagi bunyi detak."
  ] }
},

/* ================================================================ LEVEL 2 */
2: {
  diff: 'Medium', place: 'Gedung Kantor', title: 'Lembur Terakhir', cost: 120,
  intro: [
    "Jumat malam, Menara Arkana nyaris kosong. Hanya beberapa lampu yang menyala di lantai 17, markas Arkana Finance, perusahaan investasi yang dijadwalkan diperiksa auditor eksternal hari Senin.",
    "Pukul 00.40, seorang satpam yang berkeliling mendengar bunyi berdetak dari ruang arsip di balik pintu kaca. Alarm gedung tidak berbunyi, dan kamera pengawas di lantai itu entah mengapa mati.",
    "Gedung sudah dievakuasi. Kini hanya ada kamu, ruangan penuh dokumen, dan sebuah bom dengan rangkaian yang lebih rumit dari biasanya.",
    "Pelakunya jelas bukan amatir. Berhati-hatilah, dan jangan biarkan waktu menipumu."
  ],
  greet: [
    "Gedung kantor itu seperti hutan, dan setiap orang di dalamnya menyimpan rahasia. Saya jual rahasia. Mau yang mana?",
    "Kali ini lebih rumit dari taman, jadi petunjuknya juga lebih banyak. Sabar, dan siapkan dompet.",
    "Orang berdasi pintar menutupi jejak. Tapi tidak ada yang sempurna. Selalu ada satu yang terlewat."
  ],
  done: "Kasus Menara Arkana sudah selesai. Pelakunya Hendra Kusuma. Pembukuan itu akhirnya dibuka juga.",
  reveal: {
    name: 'Hendra Kusuma',
    text: "Semua petunjuk mengarah ke satu orang: Hendra Kusuma, manajer keuangan Arkana Finance. Dia tidak ingin membunuh siapa pun. Dia hanya ingin arsip dan pembukuan itu hangus sebelum auditor datang. Sepupunya sudah memberi keterangan, dan alibinya runtuh. Selesai."
  },
  tkp: [
    R('Idle', "Tempat perkara: lantai 17 Menara Arkana, ruang arsip keuangan. Pintunya kaca, bukan besi. Bom itu bukan dirakit di sana, tapi dibawa masuk dan dipasang cepat."),
    R('Suspicious', "Perhatikan: bukan ruang direksi, bukan lobi. Ruang arsip. Orang yang memasangnya tahu persis apa yang ada di dalam rak-rak itu."),
    R('Whispering', "Alarm gedung tidak berbunyi, kamera lantai itu mati. Itu bukan keberuntungan. Itu pekerjaan orang dalam."),
    R('Idle', "Kalau mau tahu siapa orang dalamnya, kamu tahu apa yang harus kamu lakukan.")
  ],
  clues: [
    { t: "Waktu pemasangan", k: "LOG LIFT",
      d: "Log lift mencatat satu perjalanan ke lantai 17 pukul 22.14, lalu turun lagi pukul 22.47. Tiga puluh menit lebih sedikit. Waktu yang pas untuk memasang bom.",
      f: "Menara Arkana, lift barang B2.\n\n22.14 : naik, lantai 17.\n22.47 : turun, lantai dasar.\n\nTidak ada perjalanan lain ke lantai 17 hingga petugas keamanan naik pukul 00.38. Selisih waktu tiga puluh tiga menit, cukup untuk memasang rangkaian." },
    { t: "Akses lantai 17", k: "DAFTAR AKSES",
      d: "Hanya dua belas orang yang punya kartu akses lantai 17 setelah jam kerja. Pelakunya salah satu dari mereka, atau orang yang bisa memakai kartu salah satu dari mereka.",
      f: "Kartu akses lantai 17 setelah pukul 19.00: dua belas pemegang aktif.\n\nTerdiri atas sembilan staf keuangan, satu staf arsip, satu admin Divisi IT, dan satu tenaga kebersihan malam. Pemakaian kartu bersama pernah tercatat, namun tidak pada malam kejadian." },
    { t: "Kamera yang mati", k: "LOG SISTEM TI",
      d: "Kamera lantai 17 dimatikan selama dua puluh menit lewat akun admin Divisi IT. Kata sandi akun itu ditulis di buku catatan bersama, dan hanya segelintir orang yang tahu karena mereka yang mengurus pembayaran lisensinya.",
      f: "Kamera lantai 17 dinonaktifkan 22.10 hingga 22.30 melalui akun admin Divisi IT.\n\nKata sandi akun tercatat di buku catatan bersama. Hanya segelintir orang yang mengetahuinya, yaitu mereka yang mengurus pembayaran lisensi. Tidak ada tanda peretasan dari luar." },
    { t: "Motif", k: "ANALISIS PENYIDIK",
      d: "Senin pagi ada audit eksternal. Ada angka di pembukuan yang tidak boleh dilihat siapa pun. Bom itu ditaruh di ruang arsip keuangan, bukan di ruang direksi. Pelaku mengincar dokumennya, bukan manusianya.",
      f: "Bom diletakkan di ruang arsip keuangan, bukan ruang direksi atau lobi.\n\nPemeriksaan audit eksternal dijadwalkan Senin pukul 09.00. Sejumlah angka pembukuan kuartal ketiga tidak cocok dengan laporan bank.\n\nKesimpulan sementara: sasarannya dokumen, bukan manusia." },
    { t: "Gaya merakit", k: "LAPORAN FORENSIK",
      d: "Kabel di bom itu dirapikan dengan lilitan ke arah kiri. Itu kebiasaan orang kidal. Dari dua belas pemegang kartu, hanya tiga yang kidal.",
      f: "Rangkaian kabel dililit searah putaran kiri, rapi dan konsisten pada seluruh sambungan.\n\nPola ini lazim pada perakit kidal. Dari dua belas pemegang kartu akses, tiga orang tercatat kidal." },
    { t: "Gelas kopi", k: "BARANG BUKTI",
      d: "Gelas kopi hitam tanpa gula ditemukan di tempat sampah dekat ruang arsip, cap kafe lobi, dibeli pukul 21.55. Dari tiga orang kidal tadi, hanya satu yang rutin minum kopi hitam tanpa gula.",
      f: "Gelas kopi kertas, kopi hitam tanpa gula, ditemukan di tempat sampah dekat ruang arsip.\n\nCap kafe lobi; struk pembelian 21.55. Dari tiga orang kidal, satu orang rutin membeli kopi hitam tanpa gula di kafe tersebut hampir setiap malam lembur." },
    { t: "Pembelian komponen", k: "PENELUSURAN PEMBELIAN",
      d: "Komponen elektroniknya dibeli lewat perusahaan 'PT Sinar Mitra'. Perusahaan itu hanya ada di atas kertas. Alamat gudangnya ternyata rumah sepupu seseorang di Divisi Keuangan.",
      f: "Komponen elektronik dibeli atas nama PT Sinar Mitra.\n\nAkta perusahaan tidak memiliki kegiatan usaha. Alamat gudang yang tertera adalah sebuah rumah di pinggir kota, milik sepupu seseorang yang bekerja di Divisi Keuangan Arkana." },
    { t: "Orang di belakang layar", k: "KETERANGAN SAKSI",
      d: "Pelaku tidak merakit bomnya sendiri. Dia minta tolong sepupunya yang teknisi elektronik, dibayar tunai. Sekarang si sepupu mendadak punya motor baru.",
      f: "Saksi: pemilik bengkel elektronik, bertetangga dengan alamat PT Sinar Mitra.\n\nPenghuni rumah itu teknisi elektronik lepas. Dua minggu terakhir ia mendadak membeli motor baru dan membayarnya tunai. Ia menolak bercerita dari mana uangnya." },
    { t: "Alibi palsu", k: "BERITA ACARA",
      d: "Dia mengaku makan malam di restoran Jalan Melati dari jam sembilan sampai sebelas. Struknya memang ada, tapi tercetak pukul 21.05, dan pelayannya ingat orang itu pergi sebelum jam sepuluh.",
      f: "Terperiksa mengaku makan malam di restoran Jalan Melati pukul 21.00 hingga 23.00.\n\nStruk memang ada, tetapi tercetak 21.05. Pelayan malam itu mengingat tamu tersebut pergi sebelum pukul 22.00 setelah menerima telepon. Alibi tidak konsisten." },
    { t: "Jabatan & ruangan", k: "DENAH GEDUNG",
      d: "Jabatannya manajer, ruangannya di lantai 17, persis di sebelah ruang arsip, nomor 1704. Dialah orang yang paling rugi kalau auditor membuka pembukuan.",
      f: "Lantai 17: Ruang 1704 (Manajer Keuangan) bersebelahan langsung dengan ruang arsip.\n\nDinding pemisah tipis; suara dari ruang arsip terdengar jelas dari 1704. Penghuni 1704 adalah pihak yang paling dirugikan jika pembukuan diperiksa." }
  ],
  call: [
    CAP('Pos Polisi Kota', 'Telepon tersambung'),
    BG('polisi'),
    N("Telepon berdering dua kali sebelum kamu mengangkatnya."),
    SN('Idle', "Penjinak bom dari Menara Arkana? Inspektur Sinta. Saya sudah membaca semua berkas yang kamu kumpulkan."),
    SN('Tired', "Kasus ini lebih licin dari yang saya duga. Orang-orang berdasi memang pandai menghapus jejak, tapi mereka jarang sadar jejak mana yang mereka tinggalkan."),
    { ask: [
      { l: "Siapa yang kita incar?", go: [
        SN('Idle', "Hendra Kusuma, manajer keuangan Arkana Finance. Kidal, minum kopi hitam tanpa gula, ruangannya persis di sebelah ruang arsip."),
        SN('Commanding', "Semua petunjuk kita bertemu di satu pintu: ruang 1704.")
      ] },
      { l: "Apa dia akan melawan?", go: [
        SN('Idle', "Dia bukan tipe yang mengangkat tangan. Dia tipe yang membuat kamu merasa salah. Jangan terpancing, bicaranya halus tapi menusuk.")
      ] },
      { l: "Kapan waktu terbaik menemuinya?", go: [
        SN('Idle', "Senin pagi sebelum jam sembilan. Auditor belum datang dan dia pasti sudah di mejanya, merapikan hal-hal yang tidak mau dilihat siapa pun."),
        SN('Commanding', "Itu satu-satunya jendela kita.")
      ] },
      { l: "Saya akan ke sana.", end: true, go: [
        SN('Commanding', "Tim saya menunggu di lobi. Kamu masuk sendiri, kami menyusul setelah saya dengar tanda dari kamu."),
        M('Determined', "Dimengerti, Inspektur.")
      ] }
    ], loop: true }
  ],
  meet: [
    CAP('Menara Arkana · Lantai 17', 'Senin · 07.48'),
    BG('kantor'),
    N("Garis polisi kuning masih melintang di depan ruang arsip. Dari ruang 1704, lampu menyala dan aroma kopi hitam menyeruak keluar."),
    SHOW('hendra', 'Smug'),
    H('Smug', "Pagi. Kalau mencari bom, Anda terlambat tiga hari. Katanya Anda yang menjinakkannya. Selamat."),
    M('Idle', "Anda lembur di Jumat malam yang sama, Pak Hendra."),
    H('Smug', "Semua orang keuangan lembur menjelang audit. Alibi saya sudah saya serahkan ke polisi: restoran Jalan Melati, jam sembilan sampai sebelas."),
    M('Idle', "Struknya tercetak 21.05. Pelayannya ingat Anda pergi sebelum jam sepuluh setelah menerima telepon."),
    H('Nervous', "Pelayan itu lupa-lupa ingat. Orang bisa salah soal jam."),
    M('Determined', "Gelas kopi hitam tanpa gula, cap kafe lobi, 21.55. Anda memesan itu tiap malam lembur."),
    N("Tangan kiri Hendra, yang tadi memegang gelas kopi, berpindah ke saku. Gerakan kecil, tapi kamu sudah melihatnya."),
    H('Nervous', "Itu... kebetulan. Banyak orang minum kopi hitam."),
    { ask: [
      { l: "Tekan soal PT Sinar Mitra", go: [
        M('Determined', "PT Sinar Mitra tidak punya kegiatan usaha. Alamat gudangnya rumah sepupu Anda, teknisi elektronik. Tunai, dua minggu lalu, dan sekarang dia punya motor baru."),
        H('Shocked', "Itu urusan keluarga saya! Anda tidak berhak menyeret mereka!")
      ] },
      { l: "Tekan soal angka pembukuan", go: [
        M('Idle', "Angka kuartal ketiga tidak cocok dengan laporan bank. Auditor datang jam sembilan. Sebentar lagi mereka akan membaca semuanya."),
        H('Angry', "Anda tidak tahu apa pun soal angka itu!")
      ] }
    ] },
    H('Angry', "Cukup! Anda pikir saya senang melakukan ini?!"),
    H('Angry', "Dua tahun. Dua tahun Direktur Utama menyuruh saya merapikan angka-angka itu. Kalau auditor membacanya, yang tanda tangan di bawahnya saya! Yang masuk penjara saya, bukan dia!"),
    M('Idle', "Jadi bom itu untuk membakar arsipnya."),
    H('Defeated', "Saya tidak mau ada yang terluka. Ruang itu kosong. Saya hitung, jam setengah satu pagi tidak ada siapa-siapa."),
    M('Angry', "Satpam malam mendengar bunyinya dan nyaris membuka pintu kaca itu! Jaraknya satu pintu dari bom, Pak!"),
    H('Shocked', "Dia... tidak apa-apa?"),
    M('Idle', "Tidak apa-apa. Kali ini nasib baik berpihak pada Anda, bukan pada rencana Anda."),
    H('Defeated', "...Saya capek. Dua tahun tidur ditemani angka-angka itu."),
    M('Determined', "Kejahatan Anda tetap kejahatan. Tapi ceritakan soal Direktur Utama ke auditor, bukan lewat bom. Mereka akan bertanya pada orang yang menyuruh Anda juga."),
    H('Defeated', "Begitu, ya."),
    N("Hendra melepas kacamata, menaruhnya di atas map terakhir yang belum sempat ia bakar."),
    SN('Commanding', "Hendra Kusuma, Anda ditahan atas pemasangan bahan peledak. Dan ya, kami akan memanggil Direktur Utama untuk diperiksa."),
    SN('Happy', "Kerja bagus. Terima kasih sudah tidak menekan tombol alarm sebelum waktunya.")
  ],
  epilog: { bg: 'kantor', lines: [
    "Pukul 09.00, auditor tiba di lantai 17 dan menemukan arsip keuangan Arkana Finance utuh di raknya. Tidak ada yang sempat dibakar.",
    "Pembukuan dibuka halaman demi halaman. Nama Direktur Utama muncul di bawah hampir setiap angka yang tidak cocok, dan ia dipanggil malam itu juga.",
    "Hendra Kusuma menjalani proses hukum untuk pemasangan bahan peledak. Sepupunya menyerahkan sisa uang pembayaran, dan satpam malam itu menerima ucapan terima kasih yang tidak sempat ia dengar sebelumnya.",
    "Di lantai 17, ruang 1704 kini kosong. Gelas kopinya masih di meja, dingin dan tak pernah dihabiskan."
  ] }
},

/* ================================================================ LEVEL 3 */
3: {
  diff: 'Hard', place: 'Pesawat', title: 'Ketinggian 35.000 Kaki', cost: 250,
  intro: [
    "Penerbangan NA-712 tujuan Makassar baru dua jam mengudara ketika kapten menerima pesan ancaman lewat sistem komunikasi kabin: ada bom di dalam pesawat, dan hitung mundurnya sudah berjalan.",
    "Tidak ada bandara yang bisa dicapai tepat waktu. Kebetulan, salah satu penumpang adalah seorang penjinak bom. Itu kamu. Pramugari memanggilmu ke lorong kabin dengan wajah pucat.",
    "Bom itu terpasang di bawah kursi 14C. Seratus delapan puluh tujuh orang berada di sekelilingmu, sebagian mulai panik, dan ruang geraknya sempit.",
    "Ini misi tersulit yang pernah kamu terima. Tidak ada kesempatan kedua."
  ],
  greet: [
    "Pesawat, ya? Di ketinggian itu, semua orang terjebak bersama pelakunya. Sebut saja ironi.",
    "Kasus ini besar, dan informasinya juga banyak. Lima belas keping. Kamu harus rajin mengisi dompet.",
    "Pelakunya sabar, cerdas, dan punya dendam lama. Tapi dendam selalu meninggalkan bekas."
  ],
  done: "Kasus NA-712 sudah selesai. Pelakunya Reza Mahardika. Pesawat itu mendarat dengan selamat, dan itu yang penting.",
  reveal: {
    name: 'Reza Mahardika',
    text: "Orangnya Reza Mahardika, empat puluh satu tahun, mantan insinyur perawatan Nusantara Air, yang menyamar sebagai 'Arman Liem' di kursi 3A. Dia tidak ingin pesawat jatuh. Dia ingin dunia membaca laporannya. Sayangnya, caranya salah."
  },
  tkp: [
    R('Idle', "Tempat perkara: pesawat NA-712, kabin ekonomi, kursi 14C. Kotaknya terselip di bawah kursi, di ketinggian tiga puluh lima ribu kaki."),
    R('Suspicious', "Kebanyakan orang membayangkan bom di bagasi atau kokpit. Pelaku memilih kabin penumpang, tempat orang paling mudah panik dan paling sulit diselamatkan."),
    R('Whispering', "Yang bikin saya merinding: dia tidak membawa bom itu sendiri. Dia memastikan bom itu ada di sana tanpa terlihat membawanya."),
    R('Idle', "Selebihnya ada di berkas-berkas saya. Kalau kamu sanggup membayar.")
  ],
  clues: [
    { t: "Waktu naik pesawat", k: "LAPORAN KRU KABIN",
      d: "Dia naik paling terakhir, beberapa menit sebelum pintu ditutup, napasnya terengah. Tapi matanya langsung memeriksa letak pintu darurat.",
      f: "Penumpang kursi 3A naik paling akhir, sekitar empat menit sebelum pintu ditutup. Napas terengah, namun pandangannya langsung menyapu letak pintu darurat dan pintu kokpit sebelum ia duduk." },
    { t: "Cara membeli tiket", k: "DATA PENJUALAN TIKET",
      d: "Tiketnya dibeli tunai di konter dua jam sebelum berangkat, atas nama 'Arman Liem'. KTP-nya sah, tapi alamat di dalamnya tidak pernah ada.",
      f: "Tiket NA-712 atas nama 'Arman Liem', dibeli tunai di konter dua jam sebelum keberangkatan.\n\nKTP yang ditunjukkan sah secara fisik, tetapi alamat yang tertera tidak terdaftar di kelurahan mana pun." },
    { t: "Bagasi", k: "CATATAN BAGASI",
      d: "Dia check-in dengan satu koper berat, tapi koper itu sengaja tidak dinaikkan. Hanya tas kabin kecil yang dia bawa. Petugas bagasi heran karena dia tidak keberatan kopernya ditinggal.",
      f: "Satu koper berat didaftarkan atas nama yang sama namun ditandai tidak dinaikkan atas permintaan penumpang.\n\nPenumpang hanya membawa tas kabin kecil dan tidak mempermasalahkan kopernya tertinggal." },
    { t: "Posisi kursi", k: "DENAH KABIN",
      d: "Dia duduk di 3A, kelas bisnis, jauh dari kursi 14C tempat bom ditemukan. Orang pintar tidak mau duduk dekat barang buatannya sendiri.",
      f: "Bom ditemukan di bawah kursi 14C. Penumpang 'Arman Liem' duduk di 3A, kelas bisnis, sebelas baris di depannya.\n\nJarak yang tidak lazim bagi penumpang yang tidak terkait dengan kejadian." },
    { t: "Ciri fisik", k: "KETERANGAN SAKSI",
      d: "Tingginya sekitar seratus delapan puluh senti. Kelingking kanannya kurang satu ruas. Pramugari yang menyajikan welcome drink masih ingat itu.",
      f: "Saksi: pramugari penyaji welcome drink.\n\nTinggi sekitar 180 cm. Kelingking tangan kanan kurang satu ruas; saksi sempat melihatnya ketika gelas diterima. Penumpang tidak memperkenalkan diri." },
    { t: "Pakaian", k: "CATATAN PENGAMATAN",
      d: "Jaket abu-abu dengan sablon logo bengkel kecil di punggung, dan sepatu bot kerja. Bukan gaya penumpang bisnis pada umumnya.",
      f: "Jaket abu-abu dengan sablon logo bengkel kecil di bagian punggung, sebagian memudar, dan sepatu bot kerja.\n\nTidak sesuai dengan profil penumpang kelas bisnis." },
    { t: "Keahlian", k: "KETERANGAN SAKSI",
      d: "Waktu pramugari menjelaskan prosedur keselamatan, dia bergumam mengoreksi istilah teknisnya. Dia paham sistem pesawat ini, bahkan tahu letak panel akses di lorong.",
      f: "Saksi: pramugari senior.\n\nSaat demonstrasi keselamatan, penumpang 3A bergumam mengoreksi istilah teknis. Ia juga menoleh ke panel akses di lorong sebelum saksi sempat menyebutkannya." },
    { t: "Latar belakang pekerjaan", k: "ARSIP PERSONALIA",
      d: "Dua tahun lalu dia insinyur perawatan di maskapai ini. Dia melaporkan retakan pada komponen mesin, laporannya diabaikan, lalu dia dipecat dengan alasan 'tidak kooperatif'.",
      f: "Nusantara Air, Divisi Perawatan.\n\nInsinyur diberhentikan dua tahun lalu dengan alasan 'tidak kooperatif', setelah mengajukan laporan retakan komponen mesin. Laporan dicatat 'sudah ditinjau' tanpa tindak lanjut." },
    { t: "Jalur masuk bom", k: "LAPORAN PENYELIDIKAN",
      d: "Bom tidak dibawa penumpang. Ia masuk lewat troli katering yang dimuat sebelum boarding. Kru katering harian disuap dua juta rupiah dan tidak tahu isinya apa.",
      f: "Rangkaian bom tidak dibawa penumpang. Ditemukan masuk bersama troli katering yang dimuat sebelum boarding.\n\nSeorang kru katering mengaku menerima dua juta rupiah untuk 'memindahkan satu kotak', tanpa tahu isinya." },
    { t: "Sumber komponen", k: "LAPORAN LABORATORIUM",
      d: "Detonatornya terhubung ke sensor tekanan kabin, bagian yang hanya bisa didapat dari gudang suku cadang pesawat. Barang itu dilaporkan hilang pada tahun dia dipecat.",
      f: "Detonator terhubung dengan sensor tekanan kabin tipe khusus. Sensor semacam itu hanya tersedia di gudang suku cadang maskapai.\n\nSatu unit dilaporkan hilang pada tahun yang sama dengan pemecatan seorang insinyur perawatan." },
    { t: "Jejak pesan ancaman", k: "LOG KOMUNIKASI",
      d: "Pesan ancaman ke kapten dikirim lewat Wi-Fi pesawat dengan akun yang didaftarkan memakai nomor telepon yang sama dengan nomor kontak di tiket.",
      f: "Pesan ancaman dikirim melalui layanan Wi-Fi pesawat.\n\nAkun pengirim didaftarkan dengan nomor telepon yang identik dengan nomor kontak pada tiket kursi 3A." },
    { t: "Barang tertinggal", k: "BARANG BUKTI",
      d: "Di kantong kursi 3A ada buku manual perawatan pesawat tipe ini. Halaman sistem tekanan kabinnya penuh coretan tinta merah.",
      f: "Kantong kursi 3A: buku manual perawatan untuk tipe pesawat ini.\n\nHalaman sistem tekanan kabin penuh coretan tinta merah dan tanggal-tanggal tulisan tangan, beberapa di antaranya dilingkari." },
    { t: "Hubungan dengan kapten", k: "KETERANGAN KAPTEN",
      d: "Kapten hari ini adalah mantan atasannya, orang yang dulu mengabaikan laporannya. Pelaku memaksa agar pesan ancaman dibacakan langsung ke kapten, bukan ke awak kabin.",
      f: "Pesan ancaman menuntut agar dibacakan langsung kepada kapten, bukan awak kabin.\n\nKapten hari itu adalah atasan langsung insinyur perawatan tersebut dua tahun lalu." },
    { t: "Nama samaran", k: "ANALISIS PENYIDIK",
      d: "Nama aslinya diawali huruf R. 'Arman Liem' hanyalah gabungan nama kakek dan nama ibunya.",
      f: "'Arman Liem' tersusun dari nama kakek dan nama gadis ibu terduga.\n\nNama asli terduga diawali huruf R." },
    { t: "Rekam jejak hukum", k: "ARSIP KEPOLISIAN",
      d: "Dia pernah dilaporkan karena mengancam atasannya, tapi tidak pernah dihukum. Tidak ada catatan kriminal, makanya dia lolos pemeriksaan keamanan.",
      f: "Pernah dilaporkan mengancam atasan; laporan dicabut dan tidak ada vonis.\n\nTidak ada catatan kriminal, sehingga lolos dari pemeriksaan latar belakang keamanan." }
  ],
  call: [
    CAP('Pos Polisi Bandara', 'Telepon tersambung'),
    BG('polisi'),
    N("Telepon berdering lama sebelum kamu mengangkatnya. Di seberang, ada suara orang yang belum tidur semalaman."),
    SN('Tired', "Inspektur Sinta. Saya sudah membaca semua berkasmu tentang penerbangan NA-712. Lima belas keping, rapi sekali."),
    SN('Idle', "Kabar baiknya: kami tahu siapa orangnya. Kabar buruknya: dia belum selesai dengan perjalanannya."),
    { ask: [
      { l: "Siapa dia sebenarnya?", go: [
        SN('Idle', "Reza Mahardika, empat puluh satu tahun. Mantan insinyur perawatan Nusantara Air. 'Arman Liem' hanya nama samaran."),
        SN('Tired', "Laporan retakan mesin yang dia ajukan dua tahun lalu memang pernah ada. Dan memang tidak pernah ditindaklanjuti. Itu mengerikan, tapi tidak membenarkan apa pun.")
      ] },
      { l: "Di mana dia sekarang?", go: [
        SN('Commanding', "Bandara Sultan Hasanuddin, Makassar. Dia memesan tiket pulang atas nama yang sama: NA-801 pukul 07.15. Dia berencana pergi diam-diam, seolah tidak terjadi apa-apa.")
      ] },
      { l: "Kenapa tidak ditangkap di gerbang?", go: [
        SN('Idle', "Banyak orang, dan dia terlatih. Satu gerakan salah bisa membuat panik massal."),
        SN('Commanding', "Rencana kami: kamu bicara dengannya lebih dulu. Dia mau didengar, dan hanya kamu yang pernah menjinakkan rangkaiannya.")
      ] },
      { l: "Saya berangkat ke bandara.", end: true, go: [
        SN('Commanding', "Pesawat NA-801 sudah saya tahan di pintu. Tidak ada penumpang lain yang boleh naik sebelum kamu selesai."),
        M('Determined', "Saya akan bicara dengannya, Inspektur.")
      ] }
    ], loop: true }
  ],
  meet: [
    CAP('Bandara Sultan Hasanuddin · Makassar', 'Rabu · 06.12'),
    BG('airport'),
    N("Pagi buta. Bandara baru terbangun. Di deretan kursi dekat gerbang keberangkatan, seorang pria berjaket abu-abu membolak-balik buku tebal berisi diagram."),
    SHOW('reza', 'Idle'),
    M('Idle', "Jaket abu-abu, sepatu bot kerja. Kelingking kanan kurang satu ruas. Itu dia."),
    N("Kamu duduk dua kursi darinya, pura-pura memeriksa ponsel. Dia tidak menoleh. Tapi jarinya berhenti membalik halaman."),
    RZ('Idle', "Kursi di sebelah saya kosong, tapi Anda memilih duduk dua kursi dari saya. Orang yang tidak mau menarik perhatian biasanya begitu."),
    M('Idle', "Kebiasaan kerja. Saya sering berdekatan dengan benda yang berdetak."),
    RZ('Shocked', "...Kursi 14C."),
    M('Idle', "Anda hafal letaknya. Padahal Anda duduk di 3A."),
    RZ('Bitter smile', "Penumpang mana yang tidak penasaran siapa yang menjinakkan bom di pesawatnya? Selamat, Anda pahlawan hari ini."),
    RZ('Resolute', "Permisi. Pesawat saya berangkat sebentar lagi."),
    M('Determined', "NA-801, kursi 3A lagi, Pak Arman? Atau saya harus memanggil Anda Reza?"),
    N("Dia berhenti melangkah. Bahunya turun, hanya sedikit. Tapi dia tidak lari."),
    RZ('Resolute', "Kalau begitu, ikut saja. Tempat ini terlalu ramai untuk bicara."),
    CAP('Pesawat NA-801 · Kabin Bisnis', 'Rabu · 06.34'),
    BG('pesawat'),
    N("Kabin kosong. Hanya lampu darurat yang menyala. Inspektur Sinta sudah memastikan tidak ada penumpang lain yang naik. Reza duduk di 3A, buku manual terbuka di pangkuannya."),
    SHOW('reza', 'Resolute'),
    RZ('Resolute', "Silakan duduk. Sudah lama saya ingin bicara dengan seseorang yang benar-benar mendengarkan."),
    M('Idle', "Saya dengar. Tapi mulai dari yang saya tahu dulu."),
    { ask: [
      { l: "Buka halaman bertinta merah", go: [
        M('Determined', "Halaman sistem tekanan kabin penuh coretan merah. Tanggal-tanggalnya cocok dengan jadwal perawatan dua tahun lalu. Anda tahu persis mesin mana yang retak."),
        RZ('Sad', "Mesin nomor dua. Retak halus di bracket. Saya tulis tiga kali. Tiga laporan.")
      ] },
      { l: "Sebut laporan retakan itu", go: [
        M('Idle', "Dua tahun lalu Anda melaporkan retakan komponen mesin. Laporannya ditandai 'sudah ditinjau', lalu Anda dipecat."),
        RZ('Bitter smile', "Anda sudah baca berkas saya. Berarti Anda lebih rajin dari mereka semua.")
      ] }
    ] },
    RZ('Sad', "Mereka bilang saya 'tidak kooperatif'. Dua tahun saya kirim surat, email, datangi kantor regulator. Tidak ada yang membaca. Orang baru berhenti menutup telinga kalau mendengar ledakan."),
    M('Angry', "Jadi Anda menaruh bom di bawah kursi 14C?! Seratus delapan puluh tujuh orang, Pak. Termasuk anak yang duduk di 14B!"),
    RZ('Shocked', "Tidak! Saya... saya atur sensor tekanannya agar tidak memicu apa pun sebelum mendarat! Saya hanya mau dunia membaca laporan saya!"),
    M('Determined', "Rangkaian itu punya hitung mundur. Bom tidak punya tombol 'jangan jatuh', Pak. Anda tidak bisa menjamin apa pun, dan Anda tahu itu."),
    N("Hening panjang. Dari jendela, matahari pagi mulai menyentuh sayap pesawat."),
    RZ('Sad', "...Saya tahu."),
    RZ('Resolute', "Laporannya ada di buku itu, terselip di bawah halaman 214. Bacakan di pengadilan, atau serahkan ke siapa pun yang mau membaca."),
    M('Determined', "Akan saya pastikan laporan itu dibaca. Lewat jalur yang benar, dan di depan orang yang benar."),
    RZ('Bitter smile', "Kalau begitu, itu sudah lebih banyak dari yang mereka berikan dua tahun lalu."),
    SN('Commanding', "Reza Mahardika, Anda ditahan atas pemasangan bahan peledak di penerbangan NA-712. Ikut saya."),
    RZ('Resolute', "Saya ikut. Tolong... jangan sampai buku itu hilang."),
    M('Idle', "Tidak akan.")
  ],
  epilog: { bg: 'pesawat', lines: [
    "NA-801 akhirnya berangkat tanpa seorang pun penumpang dari Rabu pagi itu. Buku manual dengan halaman 214 yang penuh coretan merah dibawa Inspektur Sinta ke Komite Keselamatan Penerbangan.",
    "Pemeriksaan menyeluruh dilakukan pada seluruh armada Nusantara Air. Tiga pesawat ditemukan memiliki retakan halus pada bracket mesin nomor dua, persis seperti yang ditulis Reza tiga kali dua tahun lalu.",
    "Reza Mahardika menjalani proses hukum atas pemasangan bahan peledak. Laporannya dibacakan di ruang sidang, untuk pertama kalinya didengar oleh orang-orang yang berwenang.",
    "Dan di ketinggian tiga puluh lima ribu kaki, kursi 14C kembali diduduki penumpang biasa."
  ] }
}

  };
})();