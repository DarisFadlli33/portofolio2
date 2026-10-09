<template>
<button class="to-float" id="toTop" aria-label="Kembali ke atas"><svg class="ico"><use href="#i-up"/></svg></button>

<!-- Modal detail (dialog modern) -->
<dialog id="dlg" aria-labelledby="dlgTitle">
  <div class="dialog-card">
    <button class="dlg-close" id="dlgClose" aria-label="Tutup"><svg class="ico"><use href="#i-x"/></svg></button>
    <div class="dlg-media ph"><img id="dlgImg" alt=""></div>
    <div class="dlg-body">
      <p class="dlg-kicker" id="dlgKicker"></p>
      <h3 id="dlgTitle"></h3>
      <p id="dlgDesc"></p>
      <div class="dlg-meta" id="dlgMeta"></div>
      <ul class="chips" id="dlgTech"></ul>
      <div class="dlg-actions">
        <button class="btn solid" id="dlgVisit">Kunjungi Proyek <svg class="ico"><use href="#i-arrow-ur"/></svg></button>
        <button class="btn ghost" id="dlgShut">Tutup</button>
      </div>
    </div>
  </div>
</dialog>

<!-- Lightbox dokumentasi -->
<dialog id="lb" aria-label="Foto diperbesar">
  <figure class="lb-fig">
    <img id="lbImg" alt="">
    <figcaption class="lb-bar">
      <span class="lb-cap" id="lbCap"></span>
      <span class="lb-cap" id="lbCount"></span>
      <div class="lb-nav">
        <button class="icon-btn" id="lbPrev" aria-label="Foto sebelumnya"><svg class="ico"><use href="#i-arrow-l"/></svg></button>
        <button class="icon-btn" id="lbNext" aria-label="Foto berikutnya"><svg class="ico"><use href="#i-arrow-r"/></svg></button>
        <button class="icon-btn" id="lbClose" aria-label="Tutup"><svg class="ico"><use href="#i-x"/></svg></button>
      </div>
    </figcaption>
  </figure>
</dialog>
</template>
