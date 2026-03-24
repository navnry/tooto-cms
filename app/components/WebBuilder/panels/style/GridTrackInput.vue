<script setup lang="ts">
/**
 * GridTrackInput — Smart input for grid-template-columns / grid-template-rows
 *
 * Modes (selected via unit-style dropdown):
 *   fr     — repeat(N, 1fr): number input for count + "fr" in select
 *   custom — free-form text input + "Custom" in select
 *
 * Auto-detects mode from current value.
 */
import { ref, watch, h } from 'vue'
import { NInputGroup, NInputNumber, NInput, NSelect } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { Icon } from '@iconify/vue'

const props = defineProps<{ value: string }>()
const emit = defineEmits<{
  change: [value: string]
  preview: [value: string]
}>()

const MODE_OPTIONS: SelectOption[] = [
  { value: 'fr',     label: 'fr' },
  { value: 'custom', label: 'Custom' },
]

function renderModeLabel(option: SelectOption) {
  if (option.value === 'fr') return 'fr'
  return h(Icon, {
    icon: 'lucide:pencil',
    width: 10,
    height: 10,
    style: 'display:block',
  })
}

const FR_RE = /^repeat\((\d+),\s*1fr\)$/

function detectMode(v: string): 'fr' | 'custom' {
  return FR_RE.test(v.trim()) ? 'fr' : 'custom'
}

function detectCount(v: string): number {
  const m = FR_RE.exec(v.trim())
  return m ? parseInt(m[1]!) : 3
}

const mode    = ref<'fr' | 'custom'>(detectMode(props.value))
const frCount = ref<number>(detectCount(props.value))

watch(() => props.value, (v) => {
  const m = detectMode(v)
  mode.value = m
  if (m === 'fr') frCount.value = detectCount(v)
})

function onModeChange(m: string) {
  mode.value = m as 'fr' | 'custom'
  if (m === 'fr') emit('change', `repeat(${frCount.value}, 1fr)`)
}

function onCountChange(n: number | null) {
  if (n === null) return
  frCount.value = n
  emit('preview', `repeat(${n}, 1fr)`)
}

function onCountBlur() {
  emit('change', `repeat(${frCount.value}, 1fr)`)
}

function onCustomInput(v: string) {
  emit('preview', v)
}

function onCustomBlur(e: FocusEvent) {
  emit('change', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <n-input-group>
    <!-- fr mode: number input for count -->
    <n-input-number
      v-if="mode === 'fr'"
      :value="frCount"
      size="small"
      :min="1"
      :max="12"
      :show-button="false"
      placeholder="3"
      class="min-w-0 flex-1"
      @update:value="onCountChange"
      @blur="onCountBlur"
    />

    <!-- custom mode: free text input -->
    <n-input
      v-else
      :value="value"
      size="small"
      placeholder="1fr 2fr auto"
      class="min-w-0 flex-1"
      @update:value="onCustomInput"
      @blur="onCustomBlur"
    />

    <n-select
      :value="mode"
      :options="MODE_OPTIONS"
      :render-label="renderModeLabel"
      size="small"
      style="width: 56px; flex-shrink: 0"
      :consistent-menu-width="false"
      @update:value="onModeChange"
    />
  </n-input-group>
</template>
