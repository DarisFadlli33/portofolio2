const API_BASE = 'http://127.0.0.1:8080/api'
const API_ORIGIN = new URL(API_BASE).origin
const WEBSITE_ORIGIN = 'http://localhost:5173'
const notice = document.querySelector('#notice')
const pageTitles = { profile: 'Profil', skills: 'Keahlian', projects: 'Proyek', education: 'Pendidikan' }
let profileData = null
const resources = {
  skills: {
    endpoint: '/skills',
    fields: [
      { key: 'name', label: 'Nama keahlian', required: true },
      { key: 'category', label: 'Kategori', required: true },
      { key: 'proficiency', label: 'Tingkat', required: true, placeholder: 'Belajar' },
      { key: 'display_order', label: 'Urutan tampil', type: 'number' },
    ],
    title: item => item.name,
    subtitle: item => `${item.category} · ${item.proficiency}`,
  },
  projects: {
    endpoint: '/projects',
    fields: [
      { key: 'title', label: 'Nama proyek', required: true },
      { key: 'category', label: 'Kategori', required: true },
      { key: 'year', label: 'Tahun', required: true },
      { key: 'role', label: 'Peran', required: true },
      { key: 'description', label: 'Deskripsi', required: true, multiline: true, wide: true },
      { key: 'technologies', label: 'Teknologi (pisahkan dengan koma)', type: 'text', wide: true },
      { key: 'image_file', label: 'Upload gambar proyek', type: 'file', accept: 'image/jpeg,image/png,image/gif', wide: true },
      { key: 'project_url', label: 'URL proyek' },
      { key: 'display_order', label: 'Urutan tampil', type: 'number' },
    ],
    title: item => item.title,
    subtitle: item => `${item.category} · ${item.year}`,
  },
  education: {
    endpoint: '/education',
    fields: [
      { key: 'period_label', label: 'Periode', required: true },
      { key: 'title', label: 'Institusi / pendidikan', required: true },
      { key: 'description', label: 'Deskripsi', required: true, multiline: true, wide: true },
      { key: 'display_order', label: 'Urutan tampil', type: 'number' },
    ],
    title: item => item.title,
    subtitle: item => item.period_label,
  },
}

function showNotice(message, isError = false) {
  notice.textContent = message
  notice.classList.toggle('error', isError)
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('API Go tidak dapat dijangkau. Jalankan backend terlebih dahulu.')
  }
  if (response.status === 204) return null
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.error || `Permintaan gagal (${response.status})`)
  return body
}

function buildEditors() {
  Object.entries(resources).forEach(([key, config]) => {
    const form = document.querySelector(`#${key}-form`)
    const grid = document.createElement('div')
    grid.className = 'field-grid'
    config.fields.forEach(field => {
      const label = document.createElement('label')
      label.textContent = field.label
      if (field.wide) label.classList.add('wide')
      const control = field.multiline ? document.createElement('textarea') : document.createElement('input')
      control.name = field.key
      control.required = Boolean(field.required)
      if (field.type) control.type = field.type
      if (field.placeholder) control.placeholder = field.placeholder
      if (field.accept) control.accept = field.accept
      if (field.multiline) control.rows = 3
      label.append(control)
      if (field.key === 'image_file') {
        const info = document.createElement('small')
        info.className = 'image-info'
        info.dataset.imageInfo = ''
        info.textContent = 'Format JPEG, PNG, atau GIF; maksimal 8 MB. Dimensi pixel tampil otomatis.'
        const preview = document.createElement('img')
        preview.className = 'image-preview'
        preview.alt = 'Pratinjau gambar proyek'
        preview.hidden = true
        label.append(info, preview)
        control.addEventListener('change', () => {
          const file = control.files[0]
          if (!file) {
            const existingImage = form.dataset.imageUrl
            if (existingImage) setProjectImagePreview(form, existingImage)
            else clearProjectImagePreview(form)
            return
          }
          if (file.size > 8 * 1024 * 1024) {
            control.value = ''
            clearProjectImagePreview(form)
            info.textContent = 'Ukuran file melebihi batas maksimal 8 MB.'
            return
          }
          const previewUrl = URL.createObjectURL(file)
          setProjectImagePreview(form, previewUrl)
          form.projectImagePreviewUrl = previewUrl
        })
      }
      grid.append(label)
    })
    const actions = document.createElement('div')
    actions.className = 'form-actions'
    const save = document.createElement('button')
    save.type = 'submit'
    save.className = 'button primary'
    save.textContent = 'Simpan'
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'button secondary'
    cancel.textContent = 'Batal'
    cancel.addEventListener('click', () => closeEditor(key))
    actions.append(save, cancel)
    form.append(grid, actions)

    form.addEventListener('submit', async event => {
      event.preventDefault()
      const id = form.dataset.id
      const values = new FormData(form)
      const payload = {}
      config.fields.forEach(field => {
        if (field.key === 'image_file') return
        const value = String(values.get(field.key) || '').trim()
        if (field.key === 'display_order') payload[field.key] = value === '' ? 0 : Number(value)
        else if (field.key === 'technologies') payload[field.key] = value.split(',').map(item => item.trim()).filter(Boolean)
        else if (field.key === 'project_url') payload[field.key] = value || null
        else payload[field.key] = value
      })
      try {
        if (key === 'projects') {
          payload.image_url = form.dataset.imageUrl || null
          const imageFile = form.elements.namedItem('image_file').files[0]
          if (imageFile) {
            const imageForm = new FormData()
            imageForm.append('image', imageFile)
            const uploaded = await request('/projects/images', { method: 'POST', body: imageForm })
            payload.image_url = uploaded.image_url
          }
        }
        await request(`${config.endpoint}${id ? `/${id}` : ''}`, {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        })
        closeEditor(key)
        await loadResource(key)
        showNotice(`${pageTitles[key]} berhasil disimpan.`)
      } catch (error) {
        showNotice(error.message, true)
      }
    })
  })
}

function openEditor(key, item = null) {
  const form = document.querySelector(`#${key}-form`)
  clearProjectImagePreview(form)
  form.hidden = false
  form.dataset.id = item?.id || ''
  form.dataset.imageUrl = item?.image_url || ''
  form.reset()
  resources[key].fields.forEach(field => {
    const control = form.elements.namedItem(field.key)
    if (!control || field.type === 'file') return
    const value = item?.[field.key]
    control.value = field.key === 'technologies' ? (value || []).join(', ') : (value ?? '')
  })
  if (form.dataset.imageUrl) setProjectImagePreview(form, form.dataset.imageUrl)
  form.querySelector('[type="submit"]').textContent = item ? 'Simpan perubahan' : 'Tambah'
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
  form.elements[0]?.focus()
}

function closeEditor(key) {
  const form = document.querySelector(`#${key}-form`)
  clearProjectImagePreview(form)
  form.hidden = true
  form.reset()
  delete form.dataset.id
  delete form.dataset.imageUrl
}

function clearProjectImagePreview(form) {
  if (form.projectImagePreviewUrl) {
    URL.revokeObjectURL(form.projectImagePreviewUrl)
    delete form.projectImagePreviewUrl
  }
  const info = form.querySelector('[data-image-info]')
  const preview = form.querySelector('.image-preview')
  if (info) info.textContent = 'Format JPEG, PNG, atau GIF; maksimal 8 MB. Dimensi pixel tampil otomatis.'
  if (preview) {
    preview.hidden = true
    preview.removeAttribute('src')
  }
}

function setProjectImagePreview(form, url, revokePrevious = true) {
  if (revokePrevious && form.projectImagePreviewUrl) {
    URL.revokeObjectURL(form.projectImagePreviewUrl)
    delete form.projectImagePreviewUrl
  }
  const info = form.querySelector('[data-image-info]')
  const preview = form.querySelector('.image-preview')
  preview.hidden = false
  info.textContent = 'Memuat dimensi gambar…'
  preview.onload = () => {
    info.textContent = `${preview.naturalWidth} × ${preview.naturalHeight} px`
  }
  preview.onerror = () => {
    info.textContent = 'Gambar tidak dapat dimuat.'
    preview.hidden = true
  }
  preview.src = imageSource(url)
}

function imageSource(url) {
  if (url.startsWith('/assets/images/projects/') || url.startsWith('/assets/images/profiles/')) {
    return `${API_ORIGIN}${url}`
  }
  return url.startsWith('/') ? `${WEBSITE_ORIGIN}${url}` : url
}

function createText(tag, className, value) {
  const element = document.createElement(tag)
  if (className) element.className = className
  element.textContent = value || ''
  return element
}

async function loadResource(key) {
  const config = resources[key]
  const items = await request(config.endpoint)
  const list = document.querySelector(`#${key}-list`)
  list.replaceChildren()
  if (!items.length) {
    list.append(createText('p', 'empty-state', 'Belum ada data. Gunakan tombol tambah untuk mengisi.'))
    return
  }
  items.forEach(item => {
    const card = document.createElement('article')
    card.className = 'item-card'
    const detail = document.createElement('div')
    detail.className = 'item-detail'
    detail.append(createText('h3', '', config.title(item)), createText('p', '', config.subtitle(item)))
    const actions = document.createElement('div')
    actions.className = 'item-actions'
    const edit = createText('button', 'button small secondary', 'Ubah')
    edit.type = 'button'
    edit.addEventListener('click', () => openEditor(key, item))
    const remove = createText('button', 'button small danger', 'Hapus')
    remove.type = 'button'
    remove.addEventListener('click', async () => {
      if (!window.confirm(`Hapus "${config.title(item)}"?`)) return
      try {
        await request(`${config.endpoint}/${item.id}`, { method: 'DELETE' })
        await loadResource(key)
        showNotice(`${pageTitles[key]} berhasil dihapus.`)
      } catch (error) {
        showNotice(error.message, true)
      }
    })
    actions.append(edit, remove)
    card.append(detail, actions)
    list.append(card)
  })
}

async function loadProfile() {
  const view = document.querySelector('#profile-view')
  try {
    profileData = await request('/profile')
    renderProfile(profileData)
  } catch (error) {
    if (!error.message.includes('profile not found')) throw error
    profileData = null
    view.replaceChildren(createText('p', 'empty-state', 'Profil belum diisi. Tekan tombol untuk menambahkan informasi profil.'))
    document.querySelector('#edit-profile').textContent = 'Buat profil'
  }
}

function renderProfile(profile) {
  const view = document.querySelector('#profile-view')
  view.classList.toggle('without-photo', !profile.photo_url)
  view.replaceChildren()
  const photo = document.createElement('img')
  photo.className = 'profile-photo'
  photo.alt = `Foto profil ${profile.name}`
  if (profile.photo_url) {
    photo.src = imageSource(profile.photo_url)
  } else photo.hidden = true
  const content = document.createElement('div')
  content.className = 'profile-content'
  content.append(
    createText('p', 'profile-eyebrow', 'PROFIL PORTFOLIO'),
    createText('h3', 'profile-name', profile.name),
    createText('p', 'profile-headline', profile.headline),
    createText('p', 'profile-summary', profile.summary),
  )
  const details = document.createElement('dl')
  details.className = 'profile-details'
  for (const [label, value] of [['Email', profile.email], ['Lokasi', profile.location]]) {
    const row = document.createElement('div')
    row.append(createText('dt', '', label), createText('dd', '', value))
    details.append(row)
  }
  content.append(details)
  view.append(photo, content)
  document.querySelector('#edit-profile').textContent = 'Edit profil'
}

function openProfileEditor() {
  const form = document.querySelector('#profile-form')
  clearProjectImagePreview(form)
  form.reset()
  form.dataset.photoUrl = profileData?.photo_url || ''
  for (const key of ['name', 'headline', 'summary', 'email', 'location']) {
    form.elements.namedItem(key).value = profileData?.[key] || ''
  }
  if (form.dataset.photoUrl) setProjectImagePreview(form, form.dataset.photoUrl)
  document.querySelector('#profile-view').hidden = true
  form.hidden = false
  form.scrollIntoView({ behavior: 'smooth', block: 'center' })
  form.elements.namedItem('name').focus()
}

function closeProfileEditor() {
  const form = document.querySelector('#profile-form')
  clearProjectImagePreview(form)
  form.reset()
  form.hidden = true
  delete form.dataset.photoUrl
  document.querySelector('#profile-view').hidden = false
}

const profileForm = document.querySelector('#profile-form')
profileForm.elements.namedItem('photo_file').addEventListener('change', event => {
  const file = event.currentTarget.files[0]
  if (!file) {
    if (profileForm.dataset.photoUrl) setProjectImagePreview(profileForm, profileForm.dataset.photoUrl)
    else clearProjectImagePreview(profileForm)
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    event.currentTarget.value = ''
    clearProjectImagePreview(profileForm)
    profileForm.querySelector('[data-image-info]').textContent = 'Ukuran file melebihi batas maksimal 8 MB.'
    return
  }
  const previewUrl = URL.createObjectURL(file)
  setProjectImagePreview(profileForm, previewUrl)
  profileForm.projectImagePreviewUrl = previewUrl
})

document.querySelector('#edit-profile').addEventListener('click', openProfileEditor)
document.querySelector('#cancel-profile').addEventListener('click', closeProfileEditor)

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-page], .page').forEach(element => element.classList.remove('active'))
    button.classList.add('active')
    document.querySelector(`#page-${button.dataset.page}`).classList.add('active')
    document.querySelector('#page-title').textContent = pageTitles[button.dataset.page]
  })
})

document.querySelectorAll('[data-add]').forEach(button => {
  button.addEventListener('click', () => openEditor(button.dataset.add))
})

document.querySelector('#profile-form').addEventListener('submit', async event => {
  event.preventDefault()
  const form = event.currentTarget
  const values = new FormData(form)
  const payload = Object.fromEntries(['name', 'headline', 'summary', 'email', 'location']
    .map(key => [key, String(values.get(key) || '').trim()]))
  try {
    const photoFile = form.elements.namedItem('photo_file').files[0]
    payload.photo_url = form.dataset.photoUrl || null
    if (photoFile) {
      const imageForm = new FormData()
      imageForm.append('image', photoFile)
      const uploaded = await request('/profile/image', { method: 'POST', body: imageForm })
      payload.photo_url = uploaded.image_url
    }
    await request('/profile', { method: 'PUT', body: JSON.stringify(payload) })
    profileData = await request('/profile')
    renderProfile(profileData)
    closeProfileEditor()
    showNotice('Profil berhasil disimpan dan diperbarui di website utama.')
  } catch (error) {
    showNotice(error.message, true)
  }
})

async function initialize() {
  buildEditors()
  try {
    await Promise.all([loadProfile(), ...Object.keys(resources).map(loadResource)])
    if (!notice.classList.contains('error')) showNotice('Terhubung. Perubahan akan langsung tersimpan ke database.')
  } catch (error) {
    showNotice(error.message, true)
  }
}

initialize()
