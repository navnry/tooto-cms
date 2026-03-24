import type { Editor } from 'grapesjs'
import type { DataSourceProps } from 'grapesjs'
import {
  DEFAULT_THEME_COLORS,
  DEFAULT_THEME_EFFECTS,
  DEFAULT_THEME_LAYOUT,
  DEFAULT_THEME_TYPOGRAPHY,
} from './theme-defaults'
import type {
  ThemeColorToken,
  ThemeEffectsRecord,
  ThemeHeadingStyle,
  ThemeHeadingStyleOverride,
  ThemeLayoutRecord,
  ThemeResponsiveTypography,
  ThemeSnapshot,
  ThemeTypographyOverride,
  ThemeTypographyRecord,
} from './theme-types'

export const THEME_CONFIG_DATA_SOURCE_ID = 'theme-config'
export const THEME_COLORS_DATA_SOURCE_ID = 'theme-colors'

function isSameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function normalizeLength(value: unknown, fallback: string): string {
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return fallback
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`
  return trimmed
}

function normalizeColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function normalizeText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function normalizeFontFamilyName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().replace(/['"]/g, '')
  return trimmed || undefined
}

function normalizeInstalledFonts(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const unique = new Set<string>()
  value.forEach((item) => {
    const family = normalizeFontFamilyName(item)
    if (family) unique.add(family)
  })
  return Array.from(unique)
}

function toRecordJson<T extends { id: string }>(record: unknown): T | null {
  if (!record || typeof record !== 'object') return null
  const candidate = record as {
    toJSON?: () => T
    attributes?: T
  }
  if (typeof candidate.toJSON === 'function') return candidate.toJSON()
  if (candidate.attributes) return candidate.attributes
  return record as T
}

function getDataSource(editor: Editor, id: string) {
  return editor.DataSources.get(id)
}

function getDefaultStringValue(
  source: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = source[key]
  return typeof value === 'string' ? value : fallback
}

function normalizeHeadingStyle(value: unknown, fallback: ThemeHeadingStyle): ThemeHeadingStyle {
  const candidate = (value && typeof value === 'object' ? value : {}) as Partial<ThemeHeadingStyle>
  return {
    fontFamily: normalizeText(candidate.fontFamily, fallback.fontFamily),
    size: normalizeLength(candidate.size, fallback.size),
    lineHeight: normalizeText(candidate.lineHeight, fallback.lineHeight),
    weight: normalizeText(candidate.weight, fallback.weight),
  }
}

function normalizeOptionalLength(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`
  return trimmed
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function normalizeHeadingStyleOverride(value: unknown): ThemeHeadingStyleOverride | undefined {
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Partial<ThemeHeadingStyleOverride>
  const normalized: ThemeHeadingStyleOverride = {}
  const fontFamily = normalizeOptionalText(candidate.fontFamily)
  const size = normalizeOptionalLength(candidate.size)
  const lineHeight = normalizeOptionalText(candidate.lineHeight)
  const weight = normalizeOptionalText(candidate.weight)
  if (fontFamily) normalized.fontFamily = fontFamily
  if (size) normalized.size = size
  if (lineHeight) normalized.lineHeight = lineHeight
  if (weight) normalized.weight = weight
  return Object.keys(normalized).length ? normalized : undefined
}

function normalizeTypographyOverride(value: unknown): ThemeTypographyOverride | undefined {
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Partial<ThemeTypographyOverride>
  const normalized: ThemeTypographyOverride = {}

  const fontBody = normalizeOptionalText(candidate.fontBody)
  const fontHeading = normalizeOptionalText(candidate.fontHeading)
  const fontMono = normalizeOptionalText(candidate.fontMono)
  const textBase = normalizeOptionalLength(candidate.textBase)
  const lineHeightBase = normalizeOptionalText(candidate.lineHeightBase)

  if (fontBody) normalized.fontBody = fontBody
  if (fontHeading) normalized.fontHeading = fontHeading
  if (fontMono) normalized.fontMono = fontMono
  if (textBase) normalized.textBase = textBase
  if (lineHeightBase) normalized.lineHeightBase = lineHeightBase

  ;(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).forEach((level) => {
    const heading = normalizeHeadingStyleOverride(candidate[level])
    if (heading) normalized[level] = heading
  })

  return Object.keys(normalized).length ? normalized : undefined
}

function normalizeResponsiveTypography(value: unknown): ThemeResponsiveTypography {
  if (!value || typeof value !== 'object') return {}
  const candidate = value as Partial<ThemeResponsiveTypography>
  const tablet = normalizeTypographyOverride(candidate.Tablet)
  const mobile = normalizeTypographyOverride(candidate.Mobile)
  return {
    ...(tablet ? { Tablet: tablet } : {}),
    ...(mobile ? { Mobile: mobile } : {}),
  }
}

function getTypographyFallback(key: string): string {
  return getDefaultStringValue(DEFAULT_THEME_TYPOGRAPHY as unknown as Record<string, unknown>, key, '')
}

function normalizeTypographyPatch(record: unknown): ThemeTypographyRecord {
  const source = (record && typeof record === 'object' ? record : {}) as Record<string, unknown>
  const legacyHeadingWeight = normalizeText(
    typeof source.headingWeight === 'string' ? source.headingWeight : '',
    DEFAULT_THEME_TYPOGRAPHY.h2.weight,
  )

  return {
    ...DEFAULT_THEME_TYPOGRAPHY,
    ...(source as Partial<ThemeTypographyRecord>),
    installedFonts: normalizeInstalledFonts(source.installedFonts),
    fontBody: normalizeText(source.fontBody, DEFAULT_THEME_TYPOGRAPHY.fontBody),
    fontHeading: normalizeText(source.fontHeading, DEFAULT_THEME_TYPOGRAPHY.fontHeading),
    fontMono: normalizeText(source.fontMono, DEFAULT_THEME_TYPOGRAPHY.fontMono),
    textBase: normalizeLength(source.textBase, DEFAULT_THEME_TYPOGRAPHY.textBase),
    lineHeightBase: normalizeText(source.lineHeightBase, DEFAULT_THEME_TYPOGRAPHY.lineHeightBase),
    h1: normalizeHeadingStyle(source.h1, { ...DEFAULT_THEME_TYPOGRAPHY.h1, weight: legacyHeadingWeight }),
    h2: normalizeHeadingStyle(source.h2, { ...DEFAULT_THEME_TYPOGRAPHY.h2, weight: legacyHeadingWeight }),
    h3: normalizeHeadingStyle(source.h3, { ...DEFAULT_THEME_TYPOGRAPHY.h3, weight: legacyHeadingWeight }),
    h4: normalizeHeadingStyle(source.h4, { ...DEFAULT_THEME_TYPOGRAPHY.h4, weight: legacyHeadingWeight }),
    h5: normalizeHeadingStyle(source.h5, { ...DEFAULT_THEME_TYPOGRAPHY.h5, weight: legacyHeadingWeight }),
    h6: normalizeHeadingStyle(source.h6, { ...DEFAULT_THEME_TYPOGRAPHY.h6, weight: legacyHeadingWeight }),
    responsive: normalizeResponsiveTypography(source.responsive),
  }
}

function getThemeConfigDataSource(editor: Editor) {
  return getDataSource(editor, THEME_CONFIG_DATA_SOURCE_ID)
}

function getThemeColorsDataSource(editor: Editor) {
  return getDataSource(editor, THEME_COLORS_DATA_SOURCE_ID)
}

function buildThemeConfigDataSource(): DataSourceProps<ThemeTypographyRecord | ThemeLayoutRecord | ThemeEffectsRecord> {
  return {
    id: THEME_CONFIG_DATA_SOURCE_ID,
    records: [DEFAULT_THEME_TYPOGRAPHY, DEFAULT_THEME_LAYOUT, DEFAULT_THEME_EFFECTS],
    transformers: {
      onRecordSetValue: ({ id, key, value }) => {
        if (id === 'typography') {
          if (key === 'installedFonts') return normalizeInstalledFonts(value)
          if (key === 'textBase') return normalizeLength(value, DEFAULT_THEME_TYPOGRAPHY.textBase)
          if (key === 'lineHeightBase') return normalizeText(value, DEFAULT_THEME_TYPOGRAPHY.lineHeightBase)
          if (key === 'h1') return normalizeHeadingStyle(value, DEFAULT_THEME_TYPOGRAPHY.h1)
          if (key === 'h2') return normalizeHeadingStyle(value, DEFAULT_THEME_TYPOGRAPHY.h2)
          if (key === 'h3') return normalizeHeadingStyle(value, DEFAULT_THEME_TYPOGRAPHY.h3)
          if (key === 'h4') return normalizeHeadingStyle(value, DEFAULT_THEME_TYPOGRAPHY.h4)
          if (key === 'h5') return normalizeHeadingStyle(value, DEFAULT_THEME_TYPOGRAPHY.h5)
          if (key === 'h6') return normalizeHeadingStyle(value, DEFAULT_THEME_TYPOGRAPHY.h6)
          if (key === 'responsive') return normalizeResponsiveTypography(value)
          return normalizeText(value, getTypographyFallback(key))
        }
        if (id === 'layout') {
          return normalizeLength(
            value,
            getDefaultStringValue(DEFAULT_THEME_LAYOUT as unknown as Record<string, unknown>, key, '0px'),
          )
        }
        if (id === 'effects') {
          return normalizeText(
            value,
            getDefaultStringValue(DEFAULT_THEME_EFFECTS as unknown as Record<string, unknown>, key, ''),
          )
        }
        return value
      },
    },
  }
}

function buildThemeColorsDataSource(): DataSourceProps<ThemeColorToken> {
  return {
    id: THEME_COLORS_DATA_SOURCE_ID,
    records: DEFAULT_THEME_COLORS,
    transformers: {
      onRecordSetValue: ({ key, value, id }) => {
        if (key === 'value') {
          const fallback = DEFAULT_THEME_COLORS.find((color) => color.id === id)?.value ?? '#000000'
          return normalizeColor(value, fallback)
        }
        if (key === 'label') {
          const fallback = DEFAULT_THEME_COLORS.find((color) => color.id === id)?.label ?? 'Color'
          return normalizeText(value, fallback)
        }
        return value
      },
    },
  }
}

function ensureThemeConfigDataSource(editor: Editor) {
  let dataSource = getThemeConfigDataSource(editor)
  if (!dataSource) {
    dataSource = editor.DataSources.add(buildThemeConfigDataSource())
    return dataSource
  }

  const existing = new Map(
    dataSource.getRecords()
      .map((record) => toRecordJson<{ id: string }>(record))
      .filter((record): record is { id: string } => Boolean(record))
      .map((record) => [record.id, record]),
  )

  const nextRecords = [
    normalizeTypographyPatch(existing.get('typography') ?? {}),
    { ...DEFAULT_THEME_LAYOUT, ...(existing.get('layout') ?? {}) },
    { ...DEFAULT_THEME_EFFECTS, ...(existing.get('effects') ?? {}) },
  ]

  const currentRecords = dataSource.getRecords()
    .map((record) => toRecordJson<{ id: string }>(record))
    .filter((record): record is { id: string } => Boolean(record))

  if (!isSameJson(currentRecords, nextRecords)) {
    dataSource.setRecords(nextRecords)
  }

  return dataSource
}

function ensureThemeColorsDataSource(editor: Editor) {
  let dataSource = getThemeColorsDataSource(editor)
  if (!dataSource) {
    dataSource = editor.DataSources.add(buildThemeColorsDataSource())
    return dataSource
  }

  const existing = dataSource.getRecords()
    .map((record) => toRecordJson<ThemeColorToken>(record))
    .filter((record): record is ThemeColorToken => Boolean(record))

  const normalized = existing.length
    ? existing.map((record) => ({
      id: record.id,
      label: normalizeText(record.label, 'Color'),
      value: normalizeColor(record.value, '#000000'),
    }))
    : DEFAULT_THEME_COLORS

  if (!isSameJson(existing, normalized)) {
    dataSource.setRecords(normalized)
  }
  return dataSource
}

function getTypedRecord<T extends { id: string }>(dataSource: ReturnType<Editor['DataSources']['get']>, id: string, fallback: T): T {
  const record = dataSource?.getRecord(id)
  return {
    ...fallback,
    ...(toRecordJson<T>(record) ?? {}),
  }
}

export function ensureThemeDataSources(editor: Editor): ThemeSnapshot {
  ensureThemeConfigDataSource(editor)
  ensureThemeColorsDataSource(editor)
  return getThemeSnapshot(editor)
}

export function getThemeSnapshot(editor: Editor): ThemeSnapshot {
  const configDataSource = ensureThemeConfigDataSource(editor)
  const colorsDataSource = ensureThemeColorsDataSource(editor)

  return {
    colors: colorsDataSource.getRecords()
      .map((record) => toRecordJson<ThemeColorToken>(record))
      .filter((record): record is ThemeColorToken => Boolean(record))
      .map((record) => ({
        id: record.id,
        label: normalizeText(record.label, 'Color'),
        value: normalizeColor(record.value, '#000000'),
      })),
    typography: normalizeTypographyPatch(getTypedRecord(configDataSource, 'typography', DEFAULT_THEME_TYPOGRAPHY)),
    layout: getTypedRecord(configDataSource, 'layout', DEFAULT_THEME_LAYOUT),
    effects: getTypedRecord(configDataSource, 'effects', DEFAULT_THEME_EFFECTS),
  }
}

export function updateThemeTypography(editor: Editor, patch: Partial<Omit<ThemeTypographyRecord, 'id'>>) {
  const dataSource = ensureThemeConfigDataSource(editor)
  const record = dataSource.getRecord('typography')
  if (!record) return
  record.set(patch)
}

export function updateThemeLayout(editor: Editor, patch: Partial<Omit<ThemeLayoutRecord, 'id'>>) {
  const dataSource = ensureThemeConfigDataSource(editor)
  const record = dataSource.getRecord('layout')
  if (!record) return
  record.set(patch)
}

export function updateThemeEffects(editor: Editor, patch: Partial<Omit<ThemeEffectsRecord, 'id'>>) {
  const dataSource = ensureThemeConfigDataSource(editor)
  const record = dataSource.getRecord('effects')
  if (!record) return
  record.set(patch)
}

export function addThemeColor(editor: Editor): ThemeColorToken {
  const dataSource = ensureThemeColorsDataSource(editor)
  const token: ThemeColorToken = {
    id: `color-${Date.now().toString(36)}`,
    label: 'New Color',
    value: '#94a3b8',
  }
  dataSource.addRecord(token)
  return token
}

export function updateThemeColor(editor: Editor, id: string, patch: Partial<Omit<ThemeColorToken, 'id'>>) {
  const dataSource = ensureThemeColorsDataSource(editor)
  const record = dataSource.getRecord(id)
  if (!record) return
  record.set(patch)
}

export function removeThemeColor(editor: Editor, id: string) {
  const dataSource = ensureThemeColorsDataSource(editor)
  const required = new Set(['primary', 'surface', 'text-primary'])
  if (required.has(id)) return
  dataSource.removeRecord(id)
}
