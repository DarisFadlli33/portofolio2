<script setup>
defineProps({
  profile: {
    type: Object,
    default: null,
  },
})
</script>

<template>
<!-- ============ HEADER ============ -->
<header class="site-header" id="siteHeader">
  <div class="wrap header-in">
    <a href="#" class="logo" aria-label="Beranda">{{ profile?.name ? profile.name.split(' ')[0] : 'Daris' }}<b>.</b></a>
    <nav class="nav" aria-label="Navigasi utama">
      <a class="nav-link" href="#sorotan">Sorotan</a>
      <a class="nav-link" href="#pengalaman">Pendidikan</a>
      <a class="nav-link" href="#keahlian">Keahlian</a>
      <a class="nav-link" href="#proyek">Proyek</a>
      <a class="nav-link" href="#dokumentasi">Dokumentasi</a>
      <a class="nav-link" href="#kontak">Kontak</a>
    </nav>
    <div class="header-acts">
      <button class="icon-btn" id="themeBtn" aria-label="Ganti tema terang/gelap">
        <svg class="ico ic-moon"><use href="#i-moon"/></svg>
        <svg class="ico ic-sun"><use href="#i-sun"/></svg>
      </button>
      <button class="icon-btn menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mobileMenu" aria-label="Buka menu">
        <svg class="ico"><use href="#i-menu"/></svg>
      </button>
    </div>
  </div>
</header>

<!-- Menu mobile -->
<div class="mobile-menu" id="mobileMenu">
  <nav class="mm-in" aria-label="Menu seluler">
    <a href="#sorotan" style="--d:.08s"><small>01</small> Sorotan</a>
    <a href="#pengalaman" style="--d:.13s"><small>02</small> Pendidikan</a>
    <a href="#keahlian" style="--d:.18s"><small>03</small> Keahlian</a>
    <a href="#proyek" style="--d:.23s"><small>04</small> Proyek</a>
    <a href="#dokumentasi" style="--d:.28s"><small>05</small> Dokumentasi</a>
    <a href="#kontak" style="--d:.33s"><small>06</small> Kontak</a>
    <p class="mm-foot">{{ profile?.email || 'darisfadlli@student.upi.edu' }} — {{ profile?.location || 'Majalengka, Indonesia' }}</p>
  </nav>
</div>
</template>
