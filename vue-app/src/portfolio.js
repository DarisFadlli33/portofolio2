export function initializePortfolio(apiData = {}) {
/* ================= UTIL ================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine    = matchMedia('(pointer: fine)').matches;
const imgUrl = seed => `/assets/images/${seed}.jpg`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

/* ================= DATA ================= */
const DEFAULT_PROJECTS = [
  {title:'REST API Manajemen Tugas', cat:'Konsep latihan', year:'Personal', role:'Proyek latihan', seed:'prj-lumina',
   desc:'Konsep API untuk latihan mengelola data tugas, memahami endpoint, dan menerapkan operasi CRUD menggunakan Golang.',
   tech:['Golang','REST API','CRUD','JSON']},
  {title:'API Catatan Keuangan', cat:'Konsep latihan', year:'Personal', role:'Proyek latihan', seed:'prj-arola',
   desc:'Konsep backend pencatatan transaksi untuk belajar validasi data, pengelompokan transaksi, dan perancangan endpoint.',
   tech:['Golang','REST API','SQL']},
  {title:'Sistem Data Inventaris', cat:'Konsep latihan', year:'Personal', role:'Proyek latihan', seed:'prj-kopi',
   desc:'Konsep pengelolaan barang untuk berlatih menyimpan, membaca, memperbarui, dan menghapus data melalui API.',
   tech:['Golang','Database','CRUD']},
  {title:'API Perpustakaan', cat:'Konsep latihan', year:'Personal', role:'Proyek latihan', seed:'prj-tara',
   desc:'Konsep layanan data buku dan peminjaman sebagai latihan relasi data dan perancangan struktur database.',
   tech:['Golang','SQL','REST API']},
  {title:'Backend Katalog Produk', cat:'Konsep latihan', year:'Personal', role:'Proyek latihan', seed:'prj-peta',
   desc:'Konsep API katalog untuk belajar mengirim data produk dalam format JSON dan memisahkan logika server.',
   tech:['Golang','JSON','API']},
];
const profile = apiData.profile || {};
const email = profile.email || 'darisfadlli@student.upi.edu';
const skills = apiData.skills;
const PROJECTS = apiData.projects === null || apiData.projects === undefined
  ? DEFAULT_PROJECTS
  : apiData.projects.map(project => ({
      ...project,
      cat: project.category,
      seed: null,
      desc: project.description,
      tech: project.technologies || [],
    }));
const projectImage = project => project.image_url || (project.seed
  ? imgUrl(project.seed)
  : '/assets/images/daris-portrait.jpg');
const HIGHLIGHTS = [
  {kicker:'Fokus 01 · Golang', title:'Belajar Membuat REST API', seed:'hl-lumina',
   desc:'Latihan memahami cara server menerima request, memproses data, dan mengirim response dalam format JSON.',
   tags:['Golang','REST API','JSON'], meta:[['Kategori','Proses belajar'],['Jenis','Personal']]},
  {kicker:'Fokus 02 · Database', title:'Belajar Mengelola Data', seed:'hl-award',
   desc:'Mempelajari dasar penyimpanan data, query SQL, dan hubungan database dengan aplikasi backend.',
   tags:['Database','SQL','Data'], meta:[['Kategori','Proses belajar'],['Jenis','Personal']]},
  {kicker:'Fokus 03 · CRUD', title:'Latihan Operasi Data', seed:'hl-oss',
   desc:'Mencoba alur membuat, membaca, memperbarui, dan menghapus data melalui endpoint API.',
   tags:['Golang','CRUD','API'], meta:[['Kategori','Latihan'],['Jenis','Personal']]},
  {kicker:'Fokus 04 · Backend', title:'Memahami Logika Server', seed:'hl-talk',
   desc:'Belajar memisahkan logika aplikasi di server dan menyiapkan data untuk digunakan oleh aplikasi lain.',
   tags:['Backend','Golang','Belajar'], meta:[['Kategori','Pembelajaran'],['Jenis','Personal']]},
];
const DOCS = [
  ['Mencoba membuat endpoint API','Catatan belajar','doc-1','tall'],
  ['Belajar format data JSON','Latihan mandiri','doc-2',''],
  ['Menyusun operasi CRUD','Proyek latihan','doc-3',''],
  ['Mencoba query database','Latihan mandiri','doc-4','wide'],
  ['Belajar dasar SQL','Catatan belajar','doc-5',''],
  ['Menghubungkan API dan data','Proyek latihan','doc-6',''],
  ['Eksperimen logika server','Latihan mandiri','doc-7','tall'],
  ['Mempelajari struktur backend','Eksplorasi','doc-8',''],
];

/* ================= TOAST ================= */
const toastsEl = $('#toasts');
function toast(msg, icon = 'check'){
  const t = document.createElement('div');
  t.className = 'toast';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ico');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${icon}`);
  svg.append(use);
  const text = document.createElement('span');
  text.textContent = msg;
  t.append(svg, text);
  toastsEl.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 450); }, 3000);
}

/* ================= CAROUSEL SOROTAN ================= */
const car = $('#carViewport'), track = $('#carTrack'), carBar = $('#carBar'), carCount = $('#carCount');
const AUTO = 5200;
let idx = 0, timer = null, suppress = false;

track.innerHTML = HIGHLIGHTS.map((h, i) => `
  <article class="slide">
    <div class="slide-media ph"><img src="${imgUrl(h.seed, 900, 600)}" alt="${h.title}" loading="lazy"></div>
    <div class="slide-body">
      <p class="slide-kicker mono">${h.kicker}</p>
      <h3>${h.title}</h3>
      <p>${h.desc}</p>
      <ul class="chips">${h.tags.map(t => `<li>${t}</li>`).join('')}</ul>
      <button class="link-btn" data-hl="${i}">Baca selengkapnya <svg class="ico" style="width:14px;height:14px"><use href="#i-arrow-r"/></svg></button>
    </div>
  </article>`).join('');

const pad = n => String(n + 1).padStart(2, '0');
function applyX(x){ track.style.transform = `translate3d(${x}px,0,0)`; }
function go(i, user){
  idx = (i + HIGHLIGHTS.length) % HIGHLIGHTS.length;
  track.style.transition = 'transform .75s cubic-bezier(.76,0,.24,1)';
  applyX(-idx * car.clientWidth);
  carCount.innerHTML = `<b>${pad(idx)}</b> / ${pad(HIGHLIGHTS.length - 1)}`;
  if (user) startAuto();
}
function freezeBar(){ carBar.style.transition = 'none'; carBar.style.width = getComputedStyle(carBar).width; }
function restartBar(){ if (reduced) return; carBar.style.transition = 'none'; carBar.style.width = '0%'; void carBar.offsetWidth; carBar.style.transition = `width ${AUTO}ms linear`; carBar.style.width = '100%'; }
function startAuto(){ if (reduced) return; stopAuto(); restartBar(); timer = setInterval(() => go(idx + 1), AUTO); }
function stopAuto(){ clearInterval(timer); timer = null; }

 $('#carNext').addEventListener('click', () => go(idx + 1, true));
 $('#carPrev').addEventListener('click', () => go(idx - 1, true));
car.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { go(idx + 1, true); e.preventDefault(); }
  if (e.key === 'ArrowLeft')  { go(idx - 1, true); e.preventDefault(); }
});
car.addEventListener('mouseenter', () => { if (timer) stopAuto(); freezeBar(); });
car.addEventListener('mouseleave', () => startAuto());
document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

/* Drag / swipe dengan Pointer Events */
let down = false, sx = 0, dx = 0, baseX = 0;
car.addEventListener('pointerdown', e => {
  down = true; sx = e.clientX; dx = 0; baseX = -idx * car.clientWidth;
  track.style.transition = 'none'; car.setPointerCapture(e.pointerId);
  car.classList.add('grab'); stopAuto(); freezeBar();
});
car.addEventListener('pointermove', e => { if (!down) return; dx = e.clientX - sx; applyX(baseX + dx); });
const endDrag = () => {
  if (!down) return; down = false; car.classList.remove('grab');
  if (Math.abs(dx) > 8) { suppress = true; setTimeout(() => suppress = false, 60); }
  if (dx < -60) go(idx + 1, true); else if (dx > 60) go(idx - 1, true); else go(idx, true);
};
car.addEventListener('pointerup', endDrag);
car.addEventListener('pointercancel', endDrag);
car.addEventListener('click', e => { if (suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
addEventListener('resize', () => applyX(-idx * car.clientWidth));
track.addEventListener('click', e => {
  const b = e.target.closest('[data-hl]');
  if (b && !suppress) openDetail(HIGHLIGHTS[+b.dataset.hl], 'Sorotan Pilihan');
});
carCount.innerHTML = `<b>01</b> / ${pad(HIGHLIGHTS.length - 1)}`;
startAuto();

/* ================= PROYEK: daftar + pratinjau kursor ================= */
const list = $('#projectList'), pv = $('#workPreview'), pvImg = $('#workPreview img');
list.innerHTML = PROJECTS.map((p, i) => `
  <li class="reveal" style="--d:${i * 60}ms">
    <button class="project-row" data-idx="${i}" data-cursor-label="LIHAT" aria-haspopup="dialog">
      <span class="p-thumb ph"><img src="${escapeHtml(projectImage(p))}" alt="" loading="lazy"></span>
      <span class="p-index">0${i + 1}</span>
      <span class="p-main"><h3>${escapeHtml(p.title)}</h3><span class="p-cat">${escapeHtml(p.cat)}</span></span>
      <span class="p-year">${escapeHtml(p.year)}</span>
      <span class="p-arrow"><svg class="ico"><use href="#i-arrow-ur"/></svg></span>
    </button>
  </li>`).join('');
// Preload pratinjau agar mulus
PROJECTS.forEach(p => { const im = new Image(); im.src = projectImage(p); });

let pvOn = 0, pvOp = 0;
list.addEventListener('pointerover', e => {
  const row = e.target.closest('.project-row');
  if (row && fine) { pvImg.src = projectImage(PROJECTS[+row.dataset.idx]); pvOn = 1; }
});
list.addEventListener('pointerleave', () => pvOn = 0);
list.addEventListener('click', e => {
  const row = e.target.closest('.project-row');
  if (row) openDetail(PROJECTS[+row.dataset.idx], `Proyek 0${+row.dataset.idx + 1}`);
});

/* ================= MODAL DETAIL ================= */
const dlg = $('#dlg');
function openDetail(d, kicker){
  const role = d.role || d.meta?.[0]?.[1] || 'Proyek latihan';
  const year = d.year || d.meta?.[1]?.[1] || 'Personal';
  const yearLabel = d.year ? 'Tahun' : d.meta?.[1]?.[0] || 'Jenis';
  $('#dlgImg').src = projectImage(d);
  $('#dlgImg').alt = d.title;
  $('#dlgKicker').textContent = kicker;
  $('#dlgTitle').textContent = d.title;
  $('#dlgDesc').textContent = d.desc;
  $('#dlgMeta').innerHTML = `
    <div><b>Peran</b><span>${escapeHtml(role)}</span></div>
    <div><b>${escapeHtml(yearLabel)}</b><span>${escapeHtml(year)}</span></div>`;
  $('#dlgTech').innerHTML = (d.tech || d.tags).map(t => `<li>${escapeHtml(t)}</li>`).join('');
  dlg.showModal(); dlg.scrollTop = 0;
}
 $('#dlgClose').addEventListener('click', () => dlg.close());
 $('#dlgShut').addEventListener('click', () => dlg.close());
 $('#dlgVisit').addEventListener('click', () => toast('Versi demo — tautan eksternal proyek tidak diaktifkan.', 'info'));
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

/* ================= DOKUMENTASI + LIGHTBOX ================= */
const docGrid = $('#docGrid'), lb = $('#lb');
let lbIdx = 0;
docGrid.innerHTML = DOCS.map((d, i) => `
  <button class="doc-item ${d[3]}" data-doc="${i}" data-cursor-label="PERBESAR" aria-label="Perbesar foto: ${d[0]}">
    <span class="ph"><img src="${imgUrl(d[2], 640, 480)}" alt="${d[0]}" loading="lazy"></span>
    <span class="doc-cap"><span>${d[0]}</span><span>${d[1]}</span></span>
  </button>`).join('');
function showLb(i){
  lbIdx = (i + DOCS.length) % DOCS.length;
  $('#lbImg').src = imgUrl(DOCS[lbIdx][2], 1200, 800);
  $('#lbImg').alt = DOCS[lbIdx][0];
  $('#lbCap').textContent = DOCS[lbIdx][0];
  $('#lbCount').textContent = `${lbIdx + 1} / ${DOCS.length}`;
}
docGrid.addEventListener('click', e => {
  const b = e.target.closest('.doc-item');
  if (b) { showLb(+b.dataset.doc); lb.showModal(); }
});
 $('#lbNext').addEventListener('click', () => showLb(lbIdx + 1));
 $('#lbPrev').addEventListener('click', () => showLb(lbIdx - 1));
 $('#lbClose').addEventListener('click', () => lb.close());
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') showLb(lbIdx + 1);
  if (e.key === 'ArrowLeft')  showLb(lbIdx - 1);
});

/* ================= REVEAL, COUNTER & METER ================= */
if ('IntersectionObserver' in window && !reduced) {
  const ro = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .skill').forEach(el => ro.observe(el));
} else $$('.reveal, .skill').forEach(el => el.classList.add('in'));

const fmtID = new Intl.NumberFormat('id-ID');
function countUp(el){
  const to = +el.dataset.to, dur = 1400, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmtID.format(Math.round(to * e));
    if (p < 1) requestAnimationFrame(tick);
  };
  if (reduced) { el.textContent = fmtID.format(to); return; }
  requestAnimationFrame(tick);
}
const co = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); }
}), { threshold: .5 });
 $$('.count').forEach(el => co.observe(el));

/* ================= SCROLLSPY & HEADER ================= */
const header = $('#siteHeader'), toTop = $('#toTop');
const spy = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) $$('.nav-link').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
 $$('main section[id]').forEach(s => spy.observe(s));

const supportsSTL = CSS.supports('animation-timeline: scroll()');
addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 16);
  toTop.classList.toggle('show', scrollY > 700);
  if (!supportsSTL) {
    const h = document.documentElement.scrollHeight - innerHeight;
    $('.progress i').style.transform = `scaleX(${h ? scrollY / h : 0})`;
  }
}, { passive: true });
const toTopFn = () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
toTop.addEventListener('click', toTopFn);
 $('#toTopInline').addEventListener('click', toTopFn);

/* ================= TEMA + VIEW TRANSITION ================= */
const rootEl = document.documentElement;
function applyTheme(t){ rootEl.dataset.theme = t; localStorage.setItem('tema', t); }
 $('#themeBtn').addEventListener('click', e => {
  const next = rootEl.dataset.theme === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition || reduced) { applyTheme(next); return; }
  const x = e.clientX, y = e.clientY;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(() => applyTheme(next));
  vt.ready.then(() => rootEl.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
    { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
  ));
  toast(`Tema ${next === 'dark' ? 'gelap' : 'terang'} diaktifkan.`, 'check');
});

/* ================= JAM LIVE (WIB) ================= */
const clockFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' });
const tickClock = () => $$('.js-clock').forEach(el => el.textContent = clockFmt.format(new Date()) + ' WIB');
tickClock(); setInterval(tickClock, 1000);
 $('#yearNow').textContent = new Date().getFullYear();

/* ================= KATA BERPUTAR (WAAPI) ================= */
const words = ['andal.', 'terstruktur.', 'aman.', 'efisien.'];
const rot = $('#rotWord'); let wi = 0;
if (!reduced) setInterval(() => {
  rot.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-110%)', opacity: 0 }],
    { duration: 320, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
    wi = (wi + 1) % words.length; rot.textContent = words[wi];
    rot.animate([{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
  };
}, 2800);

/* ================= TILT KARTU PROFIL ================= */
if (fine && !reduced) {
  const card = $('#profileCard'), inner = $('#pcInner');
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    inner.style.transition = 'transform .1s';
    inner.style.transform = `perspective(1000px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  });
  card.addEventListener('pointerleave', () => {
    inner.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)';
    inner.style.transform = 'perspective(1000px)';
  });
}

/* ================= TOMBOL MAGNETIK ================= */
if (fine && !reduced) $$('.magnetic').forEach(b => {
  b.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1)';
  b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
  });
  b.addEventListener('pointerleave', () => b.style.transform = '');
});

/* ================= KURSOR KUSTOM + LOOP LERP ================= */
const cursor = $('#cursor'), cursorLabel = $('#cursorLabel');
let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, ptx = mx, pty = my, pvx = mx, pvy = my;
if (fine && !reduced) {
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY; cursor.classList.add('vis');
    if (e.target.closest && e.target.closest('#carViewport')) { ptx = mx; pty = my; }
  });
  document.addEventListener('pointerover', e => {
    if (!e.target.closest) return;
    const lab = e.target.closest('[data-cursor-label]');
    const act = e.target.closest('a,button,summary,[role="button"]');
    cursor.classList.toggle('big', !!lab);
    cursor.classList.toggle('mid', !lab && !!act);
    if (lab) cursorLabel.textContent = lab.dataset.cursorLabel;
  });
  (function loop(){
    cx += (mx - cx) * .22; cy += (my - cy) * .22;
    cursor.style.translate = `${cx - 0}px ${cy - 0}px`;
    cursor.style.translate = '-50% -50%'; // jaga anchor tengah
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    pvx += (ptx - pvx) * .12; pvy += (pty - pvy) * .12;
    pvOp += ((pvOn ? 1 : 0) - pvOp) * .14;
    const rotv = Math.max(-8, Math.min(8, (ptx - pvx) * .06));
    const ox = ptx > innerWidth - 380 ? -360 : 30;
    pv.style.left = (pvx + ox) + 'px'; pv.style.top = pvy + 'px';
    pv.style.transform = `translate(0,-50%) rotate(${rotv}deg) scale(${.85 + pvOp * .15})`;
    pv.style.opacity = pvOp.toFixed(3);
    requestAnimationFrame(loop);
  })();
} else { cursor.remove(); pv.remove(); }

/* ================= MENU MOBILE ================= */
const menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
function toggleMenu(open){
  mobileMenu.classList.toggle('open', open);
  header.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.innerHTML = `<svg class="ico"><use href="#i-${open ? 'x' : 'menu'}"/></svg>`;
}
menuBtn.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('open')));
 $$('.mm-in a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ================= COPY EMAIL & UNDUH CV ================= */
async function copyEmail(){
  try { await navigator.clipboard.writeText(email); toast('Email disalin ke clipboard.', 'copy'); }
  catch { toast(`Gagal menyalin — salin manual: ${email}`, 'info'); }
}
 $$('.js-copy').forEach(b => b.addEventListener('click', copyEmail));
 $('#cvBtn').addEventListener('click', () => {
  const cv = [
    `${profile.name || 'Daris Fadlli'} — ${profile.headline || 'Mahasiswa & Backend Developer Pemula'}`,
    `${profile.location || 'Majalengka, Indonesia'} · ${email}`,
    '',
    'RINGKASAN',
    profile.summary || 'Belajar backend dengan Golang, REST API, serta database.',
    '',
    'PENDIDIKAN',
    ...(apiData.education
      ? apiData.education.map(item => `${item.title} — ${item.period_label}`)
      : ['Lulusan SMK', 'Sedang melanjutkan kuliah']),
    '',
    'PROYEK',
    ...PROJECTS.map(project => project.title),
    '',
    'TEKNOLOGI YANG DIPELAJARI',
    skills
      ? [...new Set(skills.map(skill => skill.name))].join(' · ') || 'Belum ada keahlian yang ditambahkan.'
      : 'Golang · REST API · SQL · JSON · Vue',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([cv], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'CV-Daris-Fadlli.txt' });
  a.click(); URL.revokeObjectURL(url);
  toast('CV berhasil diunduh.', 'down');
});

/* ================= FORM KONTAK ================= */
const form = $('#contactForm');
form.addEventListener('input', e => e.target.closest('.field')?.classList.remove('error'));
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  const check = (el, valid) => { el.closest('.field').classList.toggle('error', !valid); if (!valid) ok = false; };
  check($('#fName'), $('#fName').value.trim().length >= 2);
  check($('#fEmail'), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#fEmail').value.trim()));
  check($('#fMsg'), $('#fMsg').value.trim().length >= 5);
  if (!ok) { toast('Periksa kembali isian yang ditandai.', 'info'); return; }
  const btn = $('#sendBtn'), html = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Mengirim…';
  setTimeout(() => {
    btn.disabled = false; btn.innerHTML = html;
    form.reset();
    toast('Pesan terkirim! Saya akan membalas secepatnya.', 'send');
  }, 900);
});

/* Marquee: gandakan isi agar loop mulus, lalu mulai carousel */
 $('#mqTrack').innerHTML += $('#mqTrack').innerHTML;
go(0);
}
