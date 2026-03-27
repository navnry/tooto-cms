import { ref, watch } from 'vue'
import type {
  ThemeColorToken,
  ThemeEffectsRecord,
  ThemeLayoutRecord,
  ThemeSnapshot,
  ThemeTypographyDevice,
  ThemeTypographyOverride,
  ThemeTypographyRecord,
} from '../services/theme/theme-types'
import { DEFAULT_THEME_SNAPSHOT } from '../services/theme/theme-defaults'
import { useEditor } from './useEditor'
import {
  addThemeColor,
  getThemeSnapshot,
  removeThemeColor,
  updateThemeColor,
  updateThemeEffects,
  updateThemeLayout,
  updateThemeTypography,
} from '../services/theme/theme-datasource'
import { applyThemeCss } from '../services/theme/theme-css'
import { injectThemeFontsIntoCanvas } from '../services/theme/theme-fonts'
import { useEditorBridge } from '../bridge/useEditorBridge'

const theme = ref<ThemeSnapshot>(DEFAULT_THEME_SNAPSHOT)

export function useThemeConfig() {
  const { editor, ready } = useEditor()
  const bridge = useEditorBridge()

  function refresh() {
    if (!editor.value) return
    theme.value = getThemeSnapshot(editor.value)
  }

  watch([ready, () => bridge.themeRevision.value], ([isReady]) => {
    if (!isReady) return
    refresh()
  }, { immediate: true })

  function applyAndRefresh() {
    if (!editor.value) return
    theme.value = getThemeSnapshot(editor.value)
    applyThemeCss(editor.value, theme.value)
    injectThemeFontsIntoCanvas(editor.value, theme.value)
  }

  function setTypography(patch: Partial<Omit<ThemeTypographyRecord, 'id'>>) {
    if (!editor.value) return
    updateThemeTypography(editor.value, patch)
    applyAndRefresh()
  }

  function installFont(family: string) {
    const normalized = family.trim().replace(/['"]/g, '')
    if (!normalized || !editor.value) return
    const nextInstalledFonts = Array.from(new Set([
      ...theme.value.typography.installedFonts,
      normalized,
    ]))
    setTypography({ installedFonts: nextInstalledFonts })
  }

  function removeInstalledFont(family: string) {
    if (!editor.value) return
    setTypography({
      installedFonts: theme.value.typography.installedFonts.filter((item) => item !== family),
    })
  }

  function setResponsiveTypography(device: Exclude<ThemeTypographyDevice, 'Desktop'>, patch: ThemeTypographyOverride) {
    if (!editor.value) return
    const currentResponsive = theme.value.typography.responsive
    setTypography({
      responsive: {
        ...currentResponsive,
        [device]: {
          ...(currentResponsive[device] ?? {}),
          ...patch,
        },
      },
    })
  }

  function setLayout(patch: Partial<Omit<ThemeLayoutRecord, 'id'>>) {
    if (!editor.value) return
    updateThemeLayout(editor.value, patch)
    applyAndRefresh()
  }

  function setEffects(patch: Partial<Omit<ThemeEffectsRecord, 'id'>>) {
    if (!editor.value) return
    updateThemeEffects(editor.value, patch)
    applyAndRefresh()
  }

  function createColor() {
    if (!editor.value) return
    addThemeColor(editor.value)
    applyAndRefresh()
  }

  function setColor(id: string, patch: Partial<Omit<ThemeColorToken, 'id'>>) {
    if (!editor.value) return
    updateThemeColor(editor.value, id, patch)
    applyAndRefresh()
  }

  function deleteColor(id: string) {
    if (!editor.value) return
    removeThemeColor(editor.value, id)
    applyAndRefresh()
  }

  return {
    theme,
    refresh,
    setTypography,
    setResponsiveTypography,
    installFont,
    removeInstalledFont,
    setLayout,
    setEffects,
    createColor,
    setColor,
    deleteColor,
  }
}
