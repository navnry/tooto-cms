/**
 * useTheme — Light / Dark / System theme management
 *
 * Singleton composable: state is shared across all callers.
 * Persists the selected mode to localStorage.
 * Responds to OS prefers-color-scheme changes when mode is 'system'.
 */

import { ref, computed } from 'vue'
import { darkTheme, type GlobalTheme, type GlobalThemeOverrides } from 'naive-ui'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'tooto-theme-mode'

// ── Singleton state ───────────────────────────────────────────────────────────

const _mode = ref<ThemeMode>(
  // BUG-07: guard localStorage access for SSR safety (matches the window.matchMedia guard below)
  (typeof window !== 'undefined'
    ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null)
    : null) ?? 'dark',
)

const _systemIsDark = ref(false)

// Set up OS preference listener once at module load
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  _systemIsDark.value = mq.matches
  mq.addEventListener('change', (e) => { _systemIsDark.value = e.matches })
}

// ── Derived state ─────────────────────────────────────────────────────────────

export const isDark = computed<boolean>(() => {
  if (_mode.value === 'dark') return true
  if (_mode.value === 'light') return false
  return _systemIsDark.value
})

const PRIMARY          = '#5B8EFF'
const PRIMARY_HOVER    = '#7AA5FF'
const PRIMARY_PRESSED  = '#4B7AEE'

export const naiveTheme = computed<GlobalTheme | null>(() =>
  isDark.value ? darkTheme : null,
)

export const naiveThemeOverrides = computed<GlobalThemeOverrides>(() => {
  const overrides: GlobalThemeOverrides = {
    common: {
      primaryColor:       PRIMARY,
      primaryColorHover:  PRIMARY_HOVER,
      primaryColorPressed: PRIMARY_PRESSED,
      primaryColorSuppl:  PRIMARY,
    },
  }

  // Dark mode: override Naive UI component backgrounds to match glassmorphism palette
  if (isDark.value) {
    Object.assign(overrides.common!, {
      bodyColor:           '#080c18',
      cardColor:           '#0e1830',
      modalColor:          '#0e1830',
      popoverColor:        '#111828',
      inputColor:          '#0a1428',
      inputColorDisabled:  '#080c18',
      tableColor:          '#0e1830',
      tableHeaderColor:    '#080c18',
    })
  }

  return overrides
})

// ── Composable ────────────────────────────────────────────────────────────────

export function useTheme() {
  function setMode(mode: ThemeMode) {
    _mode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
  }

  return {
    /** Current user-selected mode ('light' | 'dark' | 'system') */
    mode: _mode,
    /** Resolved dark state — accounts for system preference when mode='system' */
    isDark,
    /** Naive UI theme object (null = light theme) */
    naiveTheme,
    /** Naive UI theme overrides — primary color + dark mode component backgrounds */
    naiveThemeOverrides,
    setMode,
  }
}
