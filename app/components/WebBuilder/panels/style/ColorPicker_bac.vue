<script setup lang="ts">
/**
 * ColorPicker — NColorPicker wrapper with confirm / clear actions.
 *
 * Uses an internal ref so NColorPicker can track intermediate picking state
 * while the parent only commits on @confirm / @clear.
 *
 * - @confirm(value)  — user explicitly clicked Confirm
 * - @clear()         — user clicked Clear
 * - @update:value    — live intermediate value (for v-model support)
 */
import { ref, watch } from 'vue'
import { NColorPicker } from 'naive-ui'

const props = defineProps<{
  value?: string
  showAlpha?: boolean
  size?: 'small' | 'medium' | 'large'
  actions?: ('confirm' | 'clear')[]
}>()

const emit = defineEmits<{
  'update:value': [value: string]
  'confirm': [value: string]
  'clear': []
}>()

// Internal state drives NColorPicker via v-model so the picker UI
// can update freely while the user is dragging / selecting.
const internalValue = ref(props.value ?? '#000000')

// Sync when the parent prop changes externally (e.g. element selection change)
watch(() => props.value, (v) => {
  if (v !== undefined) internalValue.value = v
})

function onConfirm(v: string) {
  emit('confirm', v)
  emit('update:value', v)
}

function onClear() {
  internalValue.value = props.value ?? '#000000'
  emit('clear')
}
</script>

<template>
  <NColorPicker
    v-model:value="internalValue"
    :show-alpha="showAlpha ?? true"
    :size="size ?? 'small'"
    :actions="actions ?? ['confirm', 'clear']"
    @confirm="onConfirm"
    @clear="onClear"
  />
</template>
