<template>
<!-- ============ SOROTAN (CAROUSEL) ============ -->
  <section class="sec" id="sorotan">
    <div class="wrap">
      <div class="sec-head reveal">
        <span class="sec-no">01</span>
        <div>
          <p class="eyebrow"><i></i>Sorotan</p>
          <h2 class="sec-title">Hal yang <em>terpilih</em> &amp; pencapaian</h2>
        </div>
        <p class="sec-note">Geser untuk melihat, atau biarkan berganti otomatis. Klik selengkapnya untuk detail.</p>
      </div>
      <div class="reveal">
        <div class="car-top">
          <span class="car-count" id="carCount"><b>01</b> / 04</span>
          <div class="car-progress"><i id="carBar"></i></div>
          <div class="car-nav">
            <button class="icon-btn" id="carPrev" aria-label="Slide sebelumnya"><svg class="ico"><use href="#i-arrow-l"/></svg></button>
            <button class="icon-btn" id="carNext" aria-label="Slide berikutnya"><svg class="ico"><use href="#i-arrow-r"/></svg></button>
          </div>
        </div>
        <div class="carousel" id="carViewport" tabindex="0" aria-roledescription="carousel" aria-label="Sorotan pilihan" data-cursor-label="SERET">
          <div class="car-track" id="carTrack"></div>
        </div>
      </div>
    </div>
  </section>
</template>
