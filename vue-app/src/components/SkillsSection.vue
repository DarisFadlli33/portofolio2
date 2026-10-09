<script setup>
import { computed } from 'vue'

const props = defineProps({
  skills: {
    type: Array,
    default: null,
  },
})

const groups = computed(() => {
  if (!props.skills) return []

  const grouped = new Map()
  for (const skill of props.skills) {
    const category = skill.category || 'Lainnya'
    if (!grouped.has(category)) grouped.set(category, [])
    grouped.get(category).push(skill)
  }
  return [...grouped].map(([category, items]) => ({ category, items }))
})

const technologies = computed(() => [...new Set((props.skills || []).map((skill) => skill.name))])
</script>

<template>
<!-- ============ KEAHLIAN ============ -->
  <section class="sec" id="keahlian">
    <div class="wrap">
      <div class="sec-head reveal">
        <span class="sec-no">03</span>
        <div>
          <p class="eyebrow"><i></i>Fokus Belajar Backend</p>
          <h2 class="sec-title">Hal yang sedang <em>saya pelajari</em></h2>
        </div>
        <p class="sec-note">Teknologi yang sedang saya pelajari dan gunakan dalam latihan.</p>
      </div>

      <template v-if="skills === null">
      <div class="skill-group reveal">
        <p class="skill-cat mono">01 — Backend &amp; Golang</p>
        <ul>
          <li class="skill"><span class="skill-name">Golang</span><span class="skill-val">Belajar</span></li>
          <li class="skill"><span class="skill-name">Dasar Backend &amp; Server</span><span class="skill-val">Belajar</span></li>
        </ul>
      </div>
      <div class="skill-group reveal">
        <p class="skill-cat mono">02 — API &amp; Database</p>
        <ul>
          <li class="skill"><span class="skill-name">REST API &amp; JSON</span><span class="skill-val">Belajar</span></li>
          <li class="skill"><span class="skill-name">SQL &amp; Basis Data</span><span class="skill-val">Belajar</span></li>
          <li class="skill"><span class="skill-name">CRUD &amp; Validasi Data</span><span class="skill-val">Belajar</span></li>
        </ul>
      </div>
      <div class="skill-group reveal">
        <p class="skill-cat mono">03 — Dasar Pendukung</p>
        <ul>
          <li class="skill"><span class="skill-name">Git &amp; Kontrol Versi</span><span class="skill-val">Belajar</span></li>
          <li class="skill"><span class="skill-name">Dasar Frontend (Vue)</span><span class="skill-val">Belajar</span></li>
        </ul>
      </div>
      <div class="tools-row reveal">
        <ul class="chips"><li>Golang</li><li>REST API</li><li>SQL</li><li>JSON</li><li>CRUD</li><li>Git</li><li>Vue</li></ul>
      </div>
      </template>
      <template v-else>
        <div v-for="(group, index) in groups" :key="group.category" class="skill-group reveal">
          <p class="skill-cat mono">{{ String(index + 1).padStart(2, '0') }} — {{ group.category }}</p>
          <ul>
            <li v-for="skill in group.items" :key="skill.id" class="skill">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-val">{{ skill.proficiency }}</span>
            </li>
          </ul>
        </div>
        <p v-if="skills.length === 0" class="skill-empty">Belum ada keahlian yang ditambahkan.</p>
        <div v-else class="tools-row reveal">
          <ul class="chips"><li v-for="technology in technologies" :key="technology">{{ technology }}</li></ul>
        </div>
      </template>
    </div>
  </section>
</template>
