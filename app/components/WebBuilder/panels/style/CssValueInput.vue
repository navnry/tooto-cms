<script setup lang="ts">
/**
 * CssValueInput — Number + unit selector for CSS length values
 *
 * Handles: "10px", "2.5rem", "50%", "auto", "none", "0", bare numbers,
 *          and arbitrary expressions like "clamp(36px, 5vw, 64px)" via "—" custom mode.
 *
 * Usage:
 *   <CssValueInput :value="ctx.get('width')"
 *     :units="['px','%','rem','em','vw','vh']"
 *     @change="v => ctx.set('width', v)"
 *     @preview="v => ctx.set('width', v)"
 *   />
 */
import { computed } from 'vue'
import { NInputNumber, NSelect, NInput, NInputGroup } from 'naive-ui'

const props = defineProps<{
  value: string
  inherited?: string
  units?: string[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [value: string]
  preview: [value: string]
}>()

const KEYWORDS = ['auto', 'none', '0', 'min-content', 'max-content', 'fit-content', 'initial', 'inherit', 'unset']
const DEFAULT_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh']
const CUSTOM_UNIT = 'custom'

const baseUnits = computed(() => props.units ?? DEFAULT_UNITS)

const unitOptions = computed(() => [
  ...baseUnits.value.map(u => ({ value: u, label: u })),
  ...['auto', 'none'].filter(k => !baseUnits.value.includes(k)).map(k => ({ value: k, label: k })),
  { value: CUSTOM_UNIT, label: '—' },
])

interface Parsed { num: number | null; unit: string }

function parse(v: string): Parsed {
  if (!v || v === '0') return { num: v === '0' ? 0 : null, unit: baseUnits.value[0] ?? 'px' }
  const t = v.trim()
  if (KEYWORDS.includes(t)) return { num: null, unit: t }
  const m = /^(-?[\d.]+)\s*([a-z%]*)$/i.exec(t)
  if (m && m[1]) return { num: parseFloat(m[1]), unit: m[2] || (baseUnits.value[0] ?? 'px') }
  return { num: null, unit: t }
}

const parsed = computed(() => parse(props.value))
const inheritedParsed = computed(() => parse(props.inherited ?? ''))
const hasExplicitValue = computed(() => Boolean(props.value?.trim()))
const hasInheritedValue = computed(() => Boolean(props.inherited?.trim()))

/** True when the value is a known keyword (auto, none, etc.) */
const isKeyword = computed(() => hasExplicitValue.value && props.value !== '0' && KEYWORDS.includes(parsed.value.unit))

/** True when the value is an arbitrary expression (clamp, calc, env, …) */
const isCustom = computed(() => {
  const t = (props.value ?? '').trim()
  if (!t || t === '0') return false
  if (KEYWORDS.includes(t)) return false
  return !/^(-?[\d.]+)\s*([a-z%]*)$/i.test(t)
})

const inheritedIsKeyword = computed(() => {
  const t = (props.inherited ?? '').trim()
  return Boolean(t) && t !== '0' && KEYWORDS.includes(inheritedParsed.value.unit)
})

const inheritedIsCustom = computed(() => {
  const t = (props.inherited ?? '').trim()
  if (!t || t === '0') return false
  if (KEYWORDS.includes(t)) return false
  return !/^(-?[\d.]+)\s*([a-z%]*)$/i.test(t)
})

const showInheritedTextInput = computed(() =>
  !hasExplicitValue.value && (inheritedIsKeyword.value || inheritedIsCustom.value),
)

const selectValue = computed(() => {
  if (isCustom.value) return CUSTOM_UNIT
  if (!hasExplicitValue.value) {
    if (inheritedIsCustom.value) return CUSTOM_UNIT
    return inheritedParsed.value.unit || (baseUnits.value[0] ?? 'px')
  }
  return parsed.value.unit || (baseUnits.value[0] ?? 'px')
})

const numericPlaceholder = computed(() => {
  if (hasExplicitValue.value) return props.placeholder ?? '—'
  if (hasInheritedValue.value && inheritedParsed.value.num !== null) return String(inheritedParsed.value.num)
  return props.placeholder ?? '—'
})

const textPlaceholder = computed(() => {
  if (hasExplicitValue.value) return props.placeholder ?? 'clamp(…)'
  if (hasInheritedValue.value) return props.inherited ?? ''
  return props.placeholder ?? 'clamp(…)'
})

function build(num: number, unit: string) {
  return unit === '0' || (num === 0 && unit === '') ? '0' : `${num}${unit}`
}

function onNum(v: number | null) {
  if (v === null) return
  emit('preview', build(v, parsed.value.unit))
}
function onNumBlur() {
  if (parsed.value.num !== null) {
    emit('change', build(parsed.value.num, parsed.value.unit))
  }
}
function onUnit(u: string) {
  if (u === CUSTOM_UNIT) return   // switching to custom — keep current raw value, UI will swap to text input
  if (KEYWORDS.includes(u)) {
    emit('change', u)
  } else {
    emit('change', build(parsed.value.num ?? 0, u))
  }
}
function onCustomInput(v: string) {
  emit('preview', v)
}
function onCustomBlur(e: FocusEvent) {
  emit('change', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex">
    <n-input-group>
      <!-- Keyword display (auto / none / …) -->
      <n-input
        v-if="isKeyword"
        :value="parsed.unit"
        size="small"
        class="flex-1 min-w-0"
        readonly
        :disabled="disabled"
      />

      <!-- Custom free-form expression (clamp / calc / …) -->
      <n-input
        v-else-if="isCustom || showInheritedTextInput"
        :value="props.value"
        size="small"
        class="flex-1 min-w-0"
        :placeholder="textPlaceholder"
        :disabled="disabled"
        @update:value="onCustomInput"
        @blur="onCustomBlur"
      />

      <!-- Normal number input -->
      <n-input-number
        v-else
        :value="parsed.num"
        size="small"
        :show-button="false"
        :placeholder="numericPlaceholder"
        class="min-w-0 flex-1"
        :disabled="disabled"
        @update:value="onNum"
        @blur="onNumBlur"
      />

      <n-select
        :value="selectValue"
        :options="unitOptions"
        size="small"
        :show-arrow="false"
        :show-checkmark="false"
        style="width: 48px; flex-shrink: 0"
        :consistent-menu-width="false"
        :disabled="disabled"
        @update:value="onUnit"
      />
    </n-input-group>
  </div>
</template>
