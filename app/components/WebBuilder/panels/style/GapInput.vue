<script setup lang="ts">
/**
 * GapInput — 2-axis gap input with linked toggle
 *
 * Pure UI component — takes string values, emits change/preview events.
 * Used for: gap (row-gap + column-gap), or any 2-axis composite.
 */
import { ref } from 'vue'
import { NInput } from 'naive-ui'
import AppIcon from '../../ui/AppIcon.vue'

const props = defineProps<{
  row: string       // row-gap value
  col: string       // column-gap value
  units?: string[]
}>()

const emit = defineEmits<{
  change:  [row: string, col: string]
  preview: [row: string, col: string]
}>()

const linked = ref(true)

function onInput(axis: 'row' | 'col', val: string) {
  if (linked.value) {
    emit('preview', val, val)
  } else {
    emit('preview', axis === 'row' ? val : props.row, axis === 'col' ? val : props.col)
  }
}

function onCommit(axis: 'row' | 'col', val: string) {
  if (linked.value) {
    emit('change', val, val)
  } else {
    emit('change', axis === 'row' ? val : props.row, axis === 'col' ? val : props.col)
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Row gap (↕ vertical) -->
    <div class="flex items-center gap-1 flex-1">
      <span class="text-[var(--editor-text-subtle)] w-3 text-center flex-shrink-0 flex items-center justify-center">
        <AppIcon icon="lucide:arrow-up-down" :size="11" />
      </span>
      <n-input
        :value="row"
        size="small"
        placeholder="—"
        class="flex-1"
        @update:value="v => onInput('row', v)"
        @blur="e => onCommit('row', (e.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Link toggle -->
    <button
      type="button"
      :class="[
        'flex items-center justify-center',
        'w-6 h-6 rounded flex-shrink-0',
        'border transition-colors text-xs',
        linked
          ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
          : 'border-[var(--editor-surface-border)] bg-transparent text-[var(--editor-text-subtle)]',
      ]"
      :title="linked ? 'Unlink axes' : 'Link axes'"
      @click="linked = !linked"
    >
        <AppIcon :icon="linked ? 'lucide:link-2' : 'lucide:unlink-2'" :size="12" />
</button>

    <!-- Column gap (↔ horizontal) -->
    <div class="flex items-center gap-1 flex-1">
      <n-input
        :value="col"
        size="small"
        placeholder="—"
        class="flex-1"
        @update:value="v => onInput('col', v)"
        @blur="e => onCommit('col', (e.target as HTMLInputElement).value)"
      />
      <span class="text-[var(--editor-text-subtle)] w-3 text-center flex-shrink-0 flex items-center justify-center">
        <AppIcon icon="lucide:arrow-left-right" :size="11" />
      </span>
    </div>
  </div>
</template>
