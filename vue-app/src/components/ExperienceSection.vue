<script setup>
defineProps({
  education: {
    type: Array,
    default: null,
  },
})
</script>

<template>
<!-- ============ PENGALAMAN ============ -->
  <section class="sec" id="pengalaman">
    <div class="wrap">
      <div class="sec-head reveal">
        <span class="sec-no">02</span>
        <div>
          <p class="eyebrow"><i></i>Pendidikan &amp; Proses Belajar</p>
          <h2 class="sec-title">Membangun fondasi <em>backend</em></h2>
        </div>
        <p class="sec-note">Klik setiap baris untuk melihat pendidikan dan proses belajar saya.</p>
      </div>

      <div v-if="education === null" class="xp-list reveal">
        <details class="xp" open>
          <summary>
            <span class="xp-year">Saat ini</span>
            <div class="xp-role"><h3>Mahasiswa</h3><p class="xp-co">Sedang melanjutkan pendidikan</p></div>
            <span class="xp-toggle"><svg class="ico"><use href="#i-plus"/></svg></span>
          </summary>
          <div class="xp-body"><div class="xp-body-in">
            <span class="xp-year">Fokus saat ini</span>
            <div><p>Sambil kuliah, saya belajar membuat program backend dengan Golang, memahami cara kerja API, dan mencoba menghubungkan aplikasi dengan database.</p>
            <ul class="chips"><li>Golang</li><li>REST API</li><li>Database</li></ul></div>
          </div></div>
        </details>
        <details class="xp">
          <summary>
            <span class="xp-year">Pendidikan menengah</span>
            <div class="xp-role"><h3>Lulusan SMK</h3><p class="xp-co">Latar belakang pendidikan kejuruan</p></div>
            <span class="xp-toggle"><svg class="ico"><use href="#i-plus"/></svg></span>
          </summary>
          <div class="xp-body"><div class="xp-body-in">
            <span class="xp-year">Bekal awal</span>
            <div><p>Bekal dari SMK menjadi dasar saya untuk melanjutkan belajar pemrograman, logika aplikasi, pengelolaan data, dan pengembangan backend.</p>
            <ul class="chips"><li>Dasar pemrograman</li><li>Logika aplikasi</li><li>Pengelolaan data</li></ul></div>
          </div></div>
        </details>
        <details class="xp">
          <summary>
            <span class="xp-year">Di luar kelas</span>
            <div class="xp-role"><h3>Latihan Backend</h3><p class="xp-co">Eksplorasi program dan API</p></div>
            <span class="xp-toggle"><svg class="ico"><use href="#i-plus"/></svg></span>
          </summary>
          <div class="xp-body"><div class="xp-body-in">
            <span class="xp-year">Praktik</span>
            <div><p>Saya berlatih menyusun logika program, menerima dan mengolah data, serta membuat endpoint sederhana untuk memahami alur kerja server.</p>
            <ul class="chips"><li>Golang</li><li>API</li><li>JSON</li></ul></div>
          </div></div>
        </details>
        <details class="xp">
          <summary>
            <span class="xp-year">Selanjutnya</span>
            <div class="xp-role"><h3>Target Belajar</h3><p class="xp-co">Backend dan database</p></div>
            <span class="xp-toggle"><svg class="ico"><use href="#i-plus"/></svg></span>
          </summary>
          <div class="xp-body"><div class="xp-body-in">
            <span class="xp-year">Langkah berikutnya</span>
            <div><p>Saya ingin memperdalam Golang, membangun REST API, dan belajar merancang serta menghubungkan database ke aplikasi.</p>
            <ul class="chips"><li>Golang</li><li>REST API</li><li>SQL</li></ul></div>
          </div></div>
        </details>
      </div>
      <div v-else-if="education.length" class="xp-list reveal">
        <details v-for="(item, index) in education" :key="item.id" class="xp" :open="index === 0">
          <summary>
            <span class="xp-year">{{ item.period_label }}</span>
            <div class="xp-role">
              <h3>{{ item.title }}</h3>
              <p class="xp-co">Pendidikan &amp; proses belajar</p>
            </div>
            <span class="xp-toggle"><svg class="ico"><use href="#i-plus"/></svg></span>
          </summary>
          <div class="xp-body"><div class="xp-body-in">
            <span class="xp-year">Keterangan</span>
            <div><p>{{ item.description }}</p></div>
          </div></div>
        </details>
      </div>
      <p v-else class="education-empty">Belum ada pendidikan atau proses belajar yang ditambahkan.</p>
    </div>
  </section>
</template>
