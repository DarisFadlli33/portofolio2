const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '')
const requestTimeoutMs = 8000

async function request(path, expectedType) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    let body
    try {
      body = await response.json()
    } catch {
      throw new Error('API mengirim respons yang bukan JSON valid.')
    }

    if (!response.ok) {
      throw new Error(body.error || `API merespons dengan status ${response.status}`)
    }
    if (expectedType === 'array' ? !Array.isArray(body) : !body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Format data dari API tidak sesuai.')
    }

    return body
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Permintaan ke API melewati batas waktu.')
    }
    if (error instanceof TypeError) {
      throw new Error('API tidak dapat dijangkau. Pastikan server Go berjalan.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function loadPortfolioData() {
  const endpoints = [
    ['Profil', '/api/profile', 'object'],
    ['Keahlian', '/api/skills', 'array'],
    ['Proyek', '/api/projects', 'array'],
    ['Pendidikan', '/api/education', 'array'],
  ]

  const results = await Promise.allSettled(endpoints.map(([, path, type]) => request(path, type)))
  const data = {}
  const errors = []

  results.forEach((result, index) => {
    const [label] = endpoints[index]
    if (result.status === 'fulfilled') {
      data[label.toLowerCase()] = result.value
    } else {
      errors.push(`${label}: ${result.reason.message}`)
    }
  })

  return { data, errors }
}
