<script setup>
defineProps({
  profile: {
    type: Object,
    default: null,
  },
})
</script>

<template>
<!-- ============ KONTAK & LOKASI ============ -->
  <section class="contact" id="kontak">
    <div class="wrap">
      <div class="c-grid">
        <div class="reveal">
          <p class="eyebrow"><i></i>Kontak &amp; Lokasi</p>
          <h2 class="c-title">Punya ide di kepala? <em>Mari wujudkan.</em></h2>
          <p class="c-sub">Ingin berdiskusi atau berkolaborasi untuk proyek belajar backend, Golang, API, dan database? Kirim pesan — saya senang bertukar pikiran.</p>
          <button class="email-line js-copy">{{ profile?.email || 'darisfadlli@student.upi.edu' }} <svg class="ico"><use href="#i-copy"/></svg></button>
          <div class="c-socials">
            <a class="icon-btn" href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub"><svg class="ico"><use href="#i-github"/></svg></a>
            <a class="icon-btn" href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn"><svg class="ico"><use href="#i-linkedin"/></svg></a>
            <a class="icon-btn" href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><svg class="ico"><use href="#i-insta"/></svg></a>
          </div>
        </div>
        <form class="c-form reveal" id="contactForm" novalidate>
          <div class="field">
            <input id="fName" name="nama" type="text" placeholder=" " autocomplete="name" required>
            <label for="fName">Nama kamu</label>
            <span class="err">Mohon isi nama kamu</span>
          </div>
          <div class="field">
            <input id="fEmail" name="email" type="email" placeholder=" " autocomplete="email" required>
            <label for="fEmail">Email</label>
            <span class="err">Format email belum benar</span>
          </div>
          <div class="field">
            <textarea id="fMsg" name="pesan" placeholder=" " required></textarea>
            <label for="fMsg">Ceritakan proyekmu…</label>
            <span class="err">Pesan tidak boleh kosong</span>
          </div>
          <button class="btn solid" type="submit" id="sendBtn">Kirim Pesan <svg class="ico"><use href="#i-send"/></svg></button>
        </form>
      </div>

      <div class="loc reveal">
        <div class="map-card">
          <span class="map-tag">Peta — {{ profile?.location || 'Majalengka' }}</span>
          <!-- Mini-map SVG buatan sendiri: jalan abstrak + pin berdenyut -->
          <svg viewBox="0 0 420 300" role="img" :aria-label="`Peta ilustratif lokasi ${profile?.location || 'Majalengka'}`">
            <rect width="420" height="300" fill="color-mix(in oklab, var(--bg) 7%, transparent)"/>
            <g stroke="color-mix(in oklab, var(--bg) 14%, transparent)" stroke-width="1">
              <path d="M0 60H420M0 130H420M0 200H420M0 260H420M70 0V300M150 0V300M240 0V300M330 0V300"/>
            </g>
            <g fill="color-mix(in oklab, var(--bg) 8%, transparent)">
              <rect x="80" y="70" width="55" height="45" rx="4"/><rect x="160" y="140" width="65" height="45" rx="4"/>
              <rect x="250" y="70" width="60" height="40" rx="4"/><rect x="340" y="210" width="55" height="38" rx="4"/>
              <rect x="85" y="215" width="50" height="34" rx="4"/>
            </g>
            <g stroke="color-mix(in oklab, var(--bg) 34%, transparent)" fill="none" stroke-linecap="round">
              <path d="M40 0 L58 300" stroke-width="9"/>
              <path d="M0 228 C 110 208 210 252 420 196" stroke-width="13"/>
              <path d="M300 0 C 290 90 320 180 282 300" stroke-width="9"/>
            </g>
            <text x="88" y="52" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="3" fill="color-mix(in oklab, var(--bg) 45%, transparent)">KEMANG</text>
            <text x="238" y="268" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="3" fill="color-mix(in oklab, var(--bg) 45%, transparent)">MAMPANG</text>
            <circle class="pin-pulse" cx="255" cy="150" r="14" fill="var(--accent)" opacity=".5"/>
            <circle cx="255" cy="150" r="8" fill="var(--accent)" stroke="var(--fg)" stroke-width="3"/>
            <text x="255" y="128" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="2" fill="var(--bg)">SAYA DI SINI</text>
          </svg>
        </div>
        <div class="loc-info">
          <h3>Basecamp {{ profile?.location || 'Majalengka' }}</h3>
          <div class="loc-row"><svg class="ico"><use href="#i-pin"/></svg><span><b>Alamat</b>{{ profile?.location || 'Majalengka — Indonesia' }}</span></div>
          <div class="loc-row"><svg class="ico"><use href="#i-clock"/></svg><span><b>Zona Waktu</b>WIB (UTC+7) · <span class="js-clock">—</span></span></div>
          <div class="loc-row"><svg class="ico"><use href="#i-spark"/></svg><span><b>Koordinat</b>6.2607° S, 106.8105° E</span></div>
          <a class="loc-btn" href="https://maps.google.com/?q=Majalengka,+Indonesia" target="_blank" rel="noopener">Petunjuk Arah <svg class="ico"><use href="#i-arrow-ur"/></svg></a>
        </div>
      </div>
    </div>
  </section>
</template>
