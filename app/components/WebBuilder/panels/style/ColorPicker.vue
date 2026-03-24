<script setup lang="ts">
/**
 * ColorPicker — NColorPicker wrapper with confirm / clear actions.
 *
 * Swatches mirror Global Styles → Theme Colors. When confirming a value that
 * matches a theme token, we store `var(--color-{id})` so canvas styles follow
 * global theme updates. Set `commitAsCssVars={false}` when editing theme
 * tokens themselves (Global Styles → Colors).
 */
import { computed, ref, watch } from 'vue'
import { NColorPicker } from 'naive-ui'
import { useThemeConfig } from '../../composables/useThemeConfig'

const props = withDefaults(
  defineProps<{
    value?: string
    showAlpha?: boolean
    size?: 'small' | 'medium' | 'large'
    actions?: ('confirm' | 'clear')[]
    /** When true (default), matching theme swatches commit as `var(--color-*)` */
    commitAsCssVars?: boolean
    /** When false, theme color swatches are hidden (e.g. Global Styles → Colors). */
    showThemeSwatches?: boolean
  }>(),
  {
    value: undefined,
    showAlpha: true,
    size: undefined,
    actions: undefined,
    commitAsCssVars: true,
    showThemeSwatches: true,
  },
)

const emit = defineEmits<{
  'update:value': [value: string]
  'confirm': [value: string]
  'clear': []
}>()

const { theme } = useThemeConfig()
const swatchesForPicker = computed(() => {
  if (props.showThemeSwatches === false) return undefined
  return theme.value.colors.map((c) => c.value)
})

function themeVarTokenId(value: string): string | null {
  const m = value.trim().match(/^var\(\s*--color-([a-zA-Z0-9_-]+)\s*\)$/)
  return m?.[1] ?? null
}

function resolvePickerDisplay(raw: string | undefined): string {
  if (raw === undefined || raw === '') return '#000000'
  const id = themeVarTokenId(raw)
  if (id) {
    const t = theme.value.colors.find((c) => c.id === id)
    if (t) return t.value
    return '#000000'
  }
  return raw
}

/** Compare two CSS colors as resolved `rgb(...)` in the document. */
function normalizeCssColor(input: string): string {
  const el = document.createElement('div')
  el.style.color = ''
  el.style.color = input
  if (!el.style.color) return input.trim().toLowerCase()
  document.body.appendChild(el)
  const rgb = window.getComputedStyle(el).color
  document.body.removeChild(el)
  return rgb
}

function colorsEqual(a: string, b: string): boolean {
  const ta = a.trim()
  const tb = b.trim()
  if (ta === tb) return true
  try {
    return normalizeCssColor(a) === normalizeCssColor(b)
  } catch {
    return false
  }
}

function commitValue(picked: string): string {
  if (props.commitAsCssVars === false) return picked
  const match = theme.value.colors.find((tok) => colorsEqual(tok.value, picked))
  if (match) return `var(--color-${match.id})`
  return picked
}

const internalValue = ref(resolvePickerDisplay(props.value))

watch(
  () => [props.value, ...theme.value.colors.map((c) => `${c.id}:${c.value}`)] as const,
  () => {
    internalValue.value = resolvePickerDisplay(props.value)
  },
  { immediate: true },
)

function onConfirm(v: string) {
  const out = commitValue(v)
  emit('confirm', out)
  emit('update:value', out)
}

function onClear() {
  internalValue.value = resolvePickerDisplay(props.value)
  emit('clear')
}
</script>

<template>
  <NColorPicker
    v-model:value="internalValue"
    :show-alpha="showAlpha"
    :size="size ?? 'small'"
    :actions="actions ?? ['confirm', 'clear']"
    :swatches="swatchesForPicker"
    @confirm="onConfirm"
    @clear="onClear"
  />
</template>
