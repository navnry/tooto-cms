import type { SelectOption } from 'naive-ui'
import type { ThemeSnapshot, ThemeTypographyRecord } from './theme-types'

export type FontOption = SelectOption & {
  label: string
  value: string
}

const DEFAULT_FONT_OPTIONS: FontOption[] = [
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
]

function firstFamily(stack: string): string {
  return stack.split(',')[0]?.trim().replace(/['"]/g, '') ?? stack
}

function normalizeInstalledFontValue(family: string): string {
  const normalized = family.trim().replace(/['"]/g, '')
  if (!normalized) return ''
  return normalized.includes(' ')
    ? `'${normalized}', sans-serif`
    : `${normalized}, sans-serif`
}

function pushOption(options: FontOption[], seen: Set<string>, value: string, label?: string) {
  if (!value || seen.has(value)) return
  seen.add(value)
  options.push({
    value,
    label: label ?? firstFamily(value),
  })
}

export function getThemeFontOptions(typography: ThemeTypographyRecord): FontOption[] {
  const options: FontOption[] = []
  const seen = new Set<string>()

  DEFAULT_FONT_OPTIONS.forEach((option) => pushOption(options, seen, option.value, option.label))
  typography.installedFonts.forEach((family) => {
    const value = normalizeInstalledFontValue(family)
    pushOption(options, seen, value, family)
  })

  ;[
    typography.fontBody,
    typography.fontHeading,
    typography.fontMono,
    typography.h1.fontFamily,
    typography.h2.fontFamily,
    typography.h3.fontFamily,
    typography.h4.fontFamily,
    typography.h5.fontFamily,
    typography.h6.fontFamily,
  ].forEach((stack) => pushOption(options, seen, stack))

  return options
}

export function getThemeFontOptionsFromSnapshot(theme: ThemeSnapshot): FontOption[] {
  return getThemeFontOptions(theme.typography)
}
