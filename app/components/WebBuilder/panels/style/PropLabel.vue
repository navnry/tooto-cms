<script setup lang="ts">
/**
 * PropLabel — Property label with "has value" indicator + clear button
 *
 * When any of the watched CSS properties has an explicitly set value:
 *   - label text turns blue
 *   - a small ✕ clear button appears on the right
 *
 * Usage:
 *   <PropLabel label="Width" prop="width" />
 *   <PropLabel label="Margin" :props="['margin-top','margin-right','margin-bottom','margin-left']" />
 */
import { computed, inject } from 'vue'
import { STYLE_CTX } from './styleContext'

const props = defineProps<{
  label: string
  /** Single CSS property name */
  prop?: string
  /** Multiple CSS property names (for composite rows) */
  props?: string[]
}>()

const ctx = inject(STYLE_CTX)!

const watchedProps = computed(() =>
  props.props ?? (props.prop ? [props.prop] : [])
)

const hasValue = computed(() =>
  watchedProps.value.some(p => ctx.hasValue(p))
)

function clearAll() {
  watchedProps.value.forEach(p => ctx.clear(p))
}
</script>

<template>
  <div class="flex items-center mb-1 gap-2">
    <span
      :class="hasValue
        ? 'text-xs text-blue-600 leading-[1.3]'
        : 'prop-label'"
    >{{ label }}</span>
    <button
      v-if="hasValue"
      type="button"
      class="text-[10px] text-blue-600 hover:text-blue-400 leading-none px-[3px] py-[1px] rounded hover:bg-blue-400/10 transition-colors flex-shrink-0"
      title="Clear value"
      @click.stop="clearAll"
    >✕</button>
  </div>
</template>
