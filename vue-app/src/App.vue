<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { loadPortfolioData } from './api.js'
import { initializePortfolio } from './portfolio.js'
import IconsSprite from './components/IconsSprite.vue'
import Utilities from './components/Utilities.vue'
import SiteHeader from './components/SiteHeader.vue'
import DashboardSection from './components/DashboardSection.vue'
import HighlightsSection from './components/HighlightsSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import DocumentationSection from './components/DocumentationSection.vue'
import ContactSection from './components/ContactSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import Overlays from './components/Overlays.vue'

const profile = ref(null)
const skills = ref(null)
const projects = ref(null)
const education = ref(null)
const apiMessage = ref('Menghubungkan ke API Go...')
const apiHasError = ref(false)

onMounted(async () => {
  const { data, errors } = await loadPortfolioData()

  profile.value = data.profil || null
  skills.value = data.keahlian || null
  projects.value = data.proyek || null
  education.value = data.pendidikan || null

  apiHasError.value = errors.length > 0
  apiMessage.value = errors.length
    ? `Sebagian data masih menggunakan contoh lokal. ${errors.join(' ')}`
    : 'Data profil, keahlian, proyek, dan pendidikan dimuat dari API.'

  await nextTick()
  initializePortfolio({
    profile: profile.value,
    skills: skills.value,
    projects: projects.value,
  })
})
</script>

<template>
  <IconsSprite />
  <Utilities />
  <p class="api-status" :class="{ 'has-error': apiHasError }" role="status" aria-live="polite">
    {{ apiMessage }}
  </p>
  <SiteHeader :profile="profile" />
  <main>
    <DashboardSection :profile="profile" />
    <HighlightsSection />
    <ExperienceSection :education="education" />
    <SkillsSection :skills="skills" />
    <ProjectsSection />
    <DocumentationSection />
    <ContactSection :profile="profile" />
    <SiteFooter :profile="profile" />
  </main>
  <Overlays />
</template>
