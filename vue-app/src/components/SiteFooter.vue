<script setup>
defineProps({
  profile: {
    type: Object,
    default: null,
  },
})
</script>

<template>
<!-- ============ FOOTER ============ -->
  <footer class="site-footer">
    <div class="foot-marquee" aria-hidden="true">
      <div class="mq-track">
        <div class="foot-mq">
          <span>{{ profile?.name || 'Daris Fadlli' }}</span><svg class="ico"><use href="#i-spark"/></svg>
          <span>Sampai Jumpa</span><svg class="ico"><use href="#i-spark"/></svg>
          <span>Terima Kasih</span><svg class="ico"><use href="#i-spark"/></svg>
        </div>
        <div class="foot-mq">
          <span>{{ profile?.name || 'Daris Fadlli' }}</span><svg class="ico"><use href="#i-spark"/></svg>
          <span>Sampai Jumpa</span><svg class="ico"><use href="#i-spark"/></svg>
          <span>Terima Kasih</span><svg class="ico"><use href="#i-spark"/></svg>
        </div>
      </div>
    </div>
    <div class="wrap foot-grid">
      <span>© <span id="yearNow">2025</span> {{ profile?.name || 'Daris Fadlli' }} — Belajar Golang, API &amp; database</span>
      <button class="toTop" id="toTopInline">Kembali ke atas <svg class="ico" style="width:13px;height:13px"><use href="#i-up"/></svg></button>
    </div>
  </footer>
</template>
