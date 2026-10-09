<script setup>
defineProps({
  profile: {
    type: Object,
    default: null,
  },
})
</script>

<template>
<!-- ============ HERO / DASHBOARD PROFIL ============ -->
  <section class="hero" id="beranda">
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <p class="eyebrow reveal"><i></i>Portofolio — Edisi 2026</p>
          <h1 class="hero-title reveal" style="--d:80ms">Belajar membangun <em>backend</em> yang <span class="rotator"><span class="rot-word" id="rotWord">andal.</span></span></h1>
          <p class="hero-sub reveal" style="--d:160ms">Halo, saya <strong>{{ profile?.name || 'Daris Fadlli' }}</strong> — {{ profile?.summary || 'lulusan SMK yang sedang melanjutkan kuliah dan belajar backend dengan Golang, API, dan database melalui proyek latihan.' }}</p>
          <div class="hero-cta reveal" style="--d:240ms">
            <a class="btn solid magnetic" href="#proyek">Lihat Proyek <svg class="ico"><use href="#i-arrow-ur"/></svg></a>
            <button class="btn ghost magnetic" id="cvBtn">Unduh CV <svg class="ico"><use href="#i-down"/></svg></button>
          </div>
        </div>

        <!-- Kartu profil bergaya dashboard: foto, jam live, status -->
        <aside class="hero-visual reveal" style="--d:200ms">
          <div class="profile-card" id="profileCard">
            <div class="pc-inner" id="pcInner">
              <div class="pc-photo ph">
                <img :src="profile?.photo_url || '/assets/images/daris-portrait.jpg'" :alt="`Foto profil ${profile?.name || 'Daris Fadlli'}`">
                <div class="sticker" aria-hidden="true">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="58" fill="var(--accent)"/>
                    <g class="sticker-rot">
                      <path id="stkrCirc" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" fill="none"/>
                      <text><textPath href="#stkrCirc" class="sticker-text">TERBUKA UNTUK KOLABORASI • BELAJAR • BERKARYA •</textPath></text>
                    </g>
                    <path d="M52 60h16M60 52v16" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" transform="rotate(45 60 60)"/>
                  </svg>
                </div>
              </div>
              <div class="pc-body">
                <div class="pc-head">
                  <h3>{{ profile?.name || 'Daris Fadlli' }}</h3>
                  <p class="mono">{{ profile?.headline || 'Mahasiswa / Backend Learner' }}</p>
                </div>
                <ul class="pc-meta">
                  <li><svg class="ico"><use href="#i-pin"/></svg> {{ profile?.location || 'Majalengka, Indonesia' }}</li>
                  <li><svg class="ico"><use href="#i-clock"/></svg> <span class="js-clock">—</span></li>
                  <li><svg class="ico"><use href="#i-mail"/></svg> <button class="pc-mail js-copy" title="Salin email">{{ profile?.email || 'darisfadlli@student.upi.edu' }}</button></li>
                </ul>
                <div class="pc-status"><span class="dot"></span> Terbuka untuk kolaborasi</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Ringkasan pendidikan dan minat -->
      <div class="stats reveal">
        <div class="stat"><span class="stat-n">SMK</span><span class="stat-l mono">Rekayasa Perangkat Lunak</span></div>
        <div class="stat"><span class="stat-n">Kuliah</span><span class="stat-l mono">Sedang ditempuh</span></div>
        <div class="stat"><span class="stat-n">Go</span><span class="stat-l mono">Fokus backend</span></div>
        <div class="stat"><span class="stat-n">SQL</span><span class="stat-l mono">Fokus database</span></div>
      </div>
    </div>

    <!-- Marquee keahlian -->
    <div class="marquee" aria-hidden="true">
      <div class="mq-track" id="mqTrack">
        <div class="mq-group">
          <span class="mq-item">Golang <svg class="ico"><use href="#i-spark"/></svg></span>
          <span class="mq-item">REST API <svg class="ico"><use href="#i-spark"/></svg></span>
          <span class="mq-item">Database <svg class="ico"><use href="#i-spark"/></svg></span>
          <span class="mq-item">SQL <svg class="ico"><use href="#i-spark"/></svg></span>
          <span class="mq-item">CRUD <svg class="ico"><use href="#i-spark"/></svg></span>
          <span class="mq-item">Backend Web <svg class="ico"><use href="#i-spark"/></svg></span>
          <span class="mq-item">JSON <svg class="ico"><use href="#i-spark"/></svg></span>
        </div>
      </div>
    </div>
  </section>
</template>
