export interface GoogleFontEntry {
  family: string
  category: string
  variants: string[]
}

const GOOGLE_API_KEY = 'AIzaSyAHK1O3Kt_BU6RHX3v7jiEG-hwhPpoehOw'
const GOOGLE_FONTS_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_API_KEY}&sort=popularity`

let cachedCatalog: GoogleFontEntry[] | null = null
let pendingCatalogRequest: Promise<GoogleFontEntry[]> | null = null

export async function fetchGoogleFontsCatalog(): Promise<GoogleFontEntry[]> {
  if (cachedCatalog) return cachedCatalog
  if (pendingCatalogRequest) return pendingCatalogRequest

  pendingCatalogRequest = fetch(GOOGLE_FONTS_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Google Fonts request failed with ${response.status}`)
      }
      const payload = await response.json() as { items?: GoogleFontEntry[] }
      cachedCatalog = payload.items ?? []
      return cachedCatalog
    })
    .finally(() => {
      pendingCatalogRequest = null
    })

  return pendingCatalogRequest
}

export function ensureGoogleFontPreview(family: string, targetDoc: Document = document): void {
  const normalized = family.trim().replace(/['"]/g, '')
  if (!normalized) return

  const id = `google-font-preview-${normalized.replace(/\s+/g, '-').toLowerCase()}`
  if (targetDoc.getElementById(id)) return

  const link = targetDoc.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(normalized)}:wght@400;500;600;700;800&display=swap`
  targetDoc.head.appendChild(link)
}
