import type { Editor } from 'grapesjs'
import type { ThemeSnapshot } from './theme-types'
import { resolveTypographyForDevice } from './theme-css'

const SYSTEM_FONTS = new Set([
  'Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Verdana',
  'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
  'Georgia', 'Palatino', 'Book Antiqua', 'Garamond',
  'Times New Roman', 'Courier New', 'Lucida Console', 'Monaco',
  'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
  'inherit', 'initial', 'unset', 'none',
])

export function getThemeFontFamilies(theme: ThemeSnapshot): string[] {
  const families = new Set<string>()
  const typographyVariants = [
    resolveTypographyForDevice(theme.typography, 'Desktop'),
    resolveTypographyForDevice(theme.typography, 'Tablet'),
    resolveTypographyForDevice(theme.typography, 'Mobile'),
  ]

  theme.typography.installedFonts.forEach((family) => families.add(family))

  for (const stack of typographyVariants.flatMap((current) => [
    current.fontBody,
    current.fontHeading,
    current.fontMono,
    current.h1.fontFamily,
    current.h2.fontFamily,
    current.h3.fontFamily,
    current.h4.fontFamily,
    current.h5.fontFamily,
    current.h6.fontFamily,
  ])) {
    stack.split(',').forEach((part) => {
      const family = part.trim().replace(/['"]/g, '')
      if (family && !SYSTEM_FONTS.has(family)) families.add(family)
    })
  }

  return Array.from(families)
}

export function injectThemeFontsIntoCanvas(editor: Editor, theme: ThemeSnapshot): void {
  const canvasDoc = editor.Canvas.getDocument()
  if (!canvasDoc) return

  getThemeFontFamilies(theme).forEach((family) => {
    const id = `theme-font-${family.replace(/\s+/g, '-').toLowerCase()}`
    if (canvasDoc.getElementById(id)) return
    const link = canvasDoc.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700;800&display=swap`
    canvasDoc.head.appendChild(link)
  })
}
