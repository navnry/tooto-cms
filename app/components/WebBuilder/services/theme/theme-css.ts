import type { Editor } from 'grapesjs'
import type { ThemeHeadingStyle, ThemeSnapshot, ThemeTypographyDevice, ThemeTypographyOverride, ThemeTypographyRecord } from './theme-types'

const THEME_MEDIA_RULES: Record<Exclude<ThemeTypographyDevice, 'Desktop'>, string> = {
  Tablet: '(max-width: 1023px)',
  Mobile: '(max-width: 767px)',
}

function mergeHeading(base: ThemeHeadingStyle, override?: ThemeTypographyOverride['h1']): ThemeHeadingStyle {
  return {
    fontFamily: override?.fontFamily ?? base.fontFamily,
    size: override?.size ?? base.size,
    lineHeight: override?.lineHeight ?? base.lineHeight,
    weight: override?.weight ?? base.weight,
  }
}

export function resolveTypographyForDevice(
  typography: ThemeTypographyRecord,
  device: ThemeTypographyDevice,
): ThemeTypographyRecord {
  const tablet = typography.responsive.Tablet
  const mobile = typography.responsive.Mobile
  const chain: ThemeTypographyOverride[] = []

  if (device === 'Tablet' || device === 'Mobile') {
    if (tablet) chain.push(tablet)
  }
  if (device === 'Mobile' && mobile) {
    chain.push(mobile)
  }

  return chain.reduce<ThemeTypographyRecord>((current, override) => ({
    ...current,
    fontBody: override.fontBody ?? current.fontBody,
    fontHeading: override.fontHeading ?? current.fontHeading,
    fontMono: override.fontMono ?? current.fontMono,
    textBase: override.textBase ?? current.textBase,
    lineHeightBase: override.lineHeightBase ?? current.lineHeightBase,
    h1: mergeHeading(current.h1, override.h1),
    h2: mergeHeading(current.h2, override.h2),
    h3: mergeHeading(current.h3, override.h3),
    h4: mergeHeading(current.h4, override.h4),
    h5: mergeHeading(current.h5, override.h5),
    h6: mergeHeading(current.h6, override.h6),
  }), typography)
}

export function buildThemeVariables(theme: ThemeSnapshot): Record<string, string> {
  const typography = resolveTypographyForDevice(theme.typography, 'Desktop')
  const colorVars = Object.fromEntries(
    theme.colors.map((token) => [`--color-${token.id}`, token.value]),
  )

  return {
    ...colorVars,
    '--font-body': typography.fontBody,
    '--font-heading': typography.fontHeading,
    '--font-mono': typography.fontMono,
    '--text-base': typography.textBase,
    '--line-height-base': typography.lineHeightBase,
    '--h1-font-family': typography.h1.fontFamily,
    '--h1-size': typography.h1.size,
    '--h1-line-height': typography.h1.lineHeight,
    '--h1-weight': typography.h1.weight,
    '--h2-font-family': typography.h2.fontFamily,
    '--h2-size': typography.h2.size,
    '--h2-line-height': typography.h2.lineHeight,
    '--h2-weight': typography.h2.weight,
    '--h3-font-family': typography.h3.fontFamily,
    '--h3-size': typography.h3.size,
    '--h3-line-height': typography.h3.lineHeight,
    '--h3-weight': typography.h3.weight,
    '--h4-font-family': typography.h4.fontFamily,
    '--h4-size': typography.h4.size,
    '--h4-line-height': typography.h4.lineHeight,
    '--h4-weight': typography.h4.weight,
    '--h5-font-family': typography.h5.fontFamily,
    '--h5-size': typography.h5.size,
    '--h5-line-height': typography.h5.lineHeight,
    '--h5-weight': typography.h5.weight,
    '--h6-font-family': typography.h6.fontFamily,
    '--h6-size': typography.h6.size,
    '--h6-line-height': typography.h6.lineHeight,
    '--h6-weight': typography.h6.weight,
    '--container-width': theme.layout.containerWidth,
    '--container-padding-x': theme.layout.containerPaddingX,
    '--section-gap': theme.layout.sectionGap,
    '--grid-gap': theme.layout.gridGap,
    '--radius-base': theme.layout.radiusBase,
    '--shadow-sm': theme.effects.shadowSm,
    '--shadow-md': theme.effects.shadowMd,
    '--shadow-lg': theme.effects.shadowLg,
  }
}

function buildResponsiveTypographyVariables(
  typography: ThemeTypographyRecord,
): Record<string, string> {
  return {
    '--font-body': typography.fontBody,
    '--font-heading': typography.fontHeading,
    '--font-mono': typography.fontMono,
    '--text-base': typography.textBase,
    '--line-height-base': typography.lineHeightBase,
    '--h1-font-family': typography.h1.fontFamily,
    '--h1-size': typography.h1.size,
    '--h1-line-height': typography.h1.lineHeight,
    '--h1-weight': typography.h1.weight,
    '--h2-font-family': typography.h2.fontFamily,
    '--h2-size': typography.h2.size,
    '--h2-line-height': typography.h2.lineHeight,
    '--h2-weight': typography.h2.weight,
    '--h3-font-family': typography.h3.fontFamily,
    '--h3-size': typography.h3.size,
    '--h3-line-height': typography.h3.lineHeight,
    '--h3-weight': typography.h3.weight,
    '--h4-font-family': typography.h4.fontFamily,
    '--h4-size': typography.h4.size,
    '--h4-line-height': typography.h4.lineHeight,
    '--h4-weight': typography.h4.weight,
    '--h5-font-family': typography.h5.fontFamily,
    '--h5-size': typography.h5.size,
    '--h5-line-height': typography.h5.lineHeight,
    '--h5-weight': typography.h5.weight,
    '--h6-font-family': typography.h6.fontFamily,
    '--h6-size': typography.h6.size,
    '--h6-line-height': typography.h6.lineHeight,
    '--h6-weight': typography.h6.weight,
  }
}

export function applyThemeCss(editor: Editor, theme: ThemeSnapshot): void {
  const rootVariables = buildThemeVariables(theme)
  const primaryText = rootVariables['--color-text-primary'] ? 'var(--color-text-primary)' : '#0f172a'

  editor.Css.setRule(':root', rootVariables)
  editor.Css.setRule('body', {
    'font-family': 'var(--font-body)',
    'font-size': 'var(--text-base)',
    'line-height': 'var(--line-height-base)',
    color: primaryText,
  })
  ;(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).forEach((tag) => {
    editor.Css.setRule(tag, {
      'font-family': `var(--${tag}-font-family)`,
      'font-size': `var(--${tag}-size)`,
      'font-weight': `var(--${tag}-weight)`,
      'line-height': `var(--${tag}-line-height)`,
      color: primaryText,
    })
  })
  editor.Css.setRule('[data-component-type="container"]', {
    width: '100%',
    'max-width': 'var(--container-width)',
    'padding-left': 'var(--container-padding-x)',
    'padding-right': 'var(--container-padding-x)',
    'margin-left': 'auto',
    'margin-right': 'auto',
    'box-sizing': 'border-box',
  })

  ;(['Tablet', 'Mobile'] as const).forEach((device) => {
    const responsiveTypography = resolveTypographyForDevice(theme.typography, device)
    editor.Css.setRule(':root', buildResponsiveTypographyVariables(responsiveTypography), {
      atRuleType: 'media',
      atRuleParams: THEME_MEDIA_RULES[device],
    })
  })
}
