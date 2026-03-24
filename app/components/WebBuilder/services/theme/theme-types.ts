export interface ThemeColorToken {
  id: string
  label: string
  value: string
}

export interface ThemeHeadingStyle {
  fontFamily: string
  size: string
  lineHeight: string
  weight: string
}

export type ThemeTypographyDevice = 'Desktop' | 'Tablet' | 'Mobile'

export interface ThemeHeadingStyleOverride {
  fontFamily?: string
  size?: string
  lineHeight?: string
  weight?: string
}

export interface ThemeTypographyOverride {
  fontBody?: string
  fontHeading?: string
  fontMono?: string
  textBase?: string
  lineHeightBase?: string
  h1?: ThemeHeadingStyleOverride
  h2?: ThemeHeadingStyleOverride
  h3?: ThemeHeadingStyleOverride
  h4?: ThemeHeadingStyleOverride
  h5?: ThemeHeadingStyleOverride
  h6?: ThemeHeadingStyleOverride
}

export interface ThemeResponsiveTypography {
  Tablet?: ThemeTypographyOverride
  Mobile?: ThemeTypographyOverride
}

export interface ThemeTypographyRecord {
  id: 'typography'
  installedFonts: string[]
  fontBody: string
  fontHeading: string
  fontMono: string
  textBase: string
  lineHeightBase: string
  h1: ThemeHeadingStyle
  h2: ThemeHeadingStyle
  h3: ThemeHeadingStyle
  h4: ThemeHeadingStyle
  h5: ThemeHeadingStyle
  h6: ThemeHeadingStyle
  responsive: ThemeResponsiveTypography
}

export interface ThemeLayoutRecord {
  id: 'layout'
  containerWidth: string
  containerPaddingX: string
  sectionGap: string
  gridGap: string
  radiusBase: string
}

export interface ThemeEffectsRecord {
  id: 'effects'
  shadowSm: string
  shadowMd: string
  shadowLg: string
}

export interface ThemeSnapshot {
  colors: ThemeColorToken[]
  typography: ThemeTypographyRecord
  layout: ThemeLayoutRecord
  effects: ThemeEffectsRecord
}
