import type {
  ThemeColorToken,
  ThemeEffectsRecord,
  ThemeHeadingStyle,
  ThemeLayoutRecord,
  ThemeResponsiveTypography,
  ThemeSnapshot,
  ThemeTypographyRecord,
} from './theme-types'

function heading(fontFamily: string, size: string, lineHeight: string, weight: string): ThemeHeadingStyle {
  return { fontFamily, size, lineHeight, weight }
}

export const DEFAULT_THEME_COLORS: ThemeColorToken[] = [
  { id: 'primary', label: 'Primary', value: '#2563eb' },
  { id: 'secondary', label: 'Secondary', value: '#0f172a' },
  { id: 'surface', label: 'Surface', value: '#ffffff' },
  { id: 'surface-muted', label: 'Surface Muted', value: '#f8fafc' },
  { id: 'text-primary', label: 'Text Primary', value: '#0f172a' },
  { id: 'text-muted', label: 'Text Muted', value: '#64748b' },
  { id: 'border', label: 'Border', value: '#e2e8f0' },
  { id: 'success', label: 'Success', value: '#16a34a' },
  { id: 'warning', label: 'Warning', value: '#d97706' },
  { id: 'danger', label: 'Danger', value: '#dc2626' },
]

export const DEFAULT_THEME_TYPOGRAPHY_RESPONSIVE: ThemeResponsiveTypography = {}

export const DEFAULT_THEME_TYPOGRAPHY: ThemeTypographyRecord = {
  id: 'typography',
  installedFonts: [],
  fontBody: 'Inter, system-ui, sans-serif',
  fontHeading: 'Sora, Inter, system-ui, sans-serif',
  fontMono: 'JetBrains Mono, monospace',
  textBase: '16px',
  lineHeightBase: '1.6',
  h1: heading('Sora, Inter, system-ui, sans-serif', '56px', '1.05', '800'),
  h2: heading('Sora, Inter, system-ui, sans-serif', '40px', '1.1', '800'),
  h3: heading('Sora, Inter, system-ui, sans-serif', '32px', '1.15', '700'),
  h4: heading('Sora, Inter, system-ui, sans-serif', '24px', '1.2', '700'),
  h5: heading('Sora, Inter, system-ui, sans-serif', '20px', '1.25', '700'),
  h6: heading('Sora, Inter, system-ui, sans-serif', '16px', '1.3', '700'),
  responsive: DEFAULT_THEME_TYPOGRAPHY_RESPONSIVE,
}

export const DEFAULT_THEME_LAYOUT: ThemeLayoutRecord = {
  id: 'layout',
  containerWidth: '1280px',
  containerPaddingX: '20px',
  sectionGap: '80px',
  gridGap: '24px',
  radiusBase: '12px',
}

export const DEFAULT_THEME_EFFECTS: ThemeEffectsRecord = {
  id: 'effects',
  shadowSm: '0 1px 2px rgba(15, 23, 42, 0.06)',
  shadowMd: '0 8px 24px rgba(15, 23, 42, 0.12)',
  shadowLg: '0 20px 48px rgba(15, 23, 42, 0.18)',
}

export const DEFAULT_THEME_SNAPSHOT: ThemeSnapshot = {
  colors: DEFAULT_THEME_COLORS,
  typography: DEFAULT_THEME_TYPOGRAPHY,
  layout: DEFAULT_THEME_LAYOUT,
  effects: DEFAULT_THEME_EFFECTS,
}
