<script setup lang="ts">
/**
 * LayoutSection — display, position, overflow, z-index
 * Shows Flex or Grid sub-section conditionally based on display value.
 */
import { computed, inject } from 'vue'
import { NSelect, NInputNumber } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import CssValueInput from '../CssValueInput.vue'
import FlexSection from './FlexSection.vue'
import GridSection from './GridSection.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const DISPLAY_OPTIONS = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'inline', label: 'Inline' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'inline-flex', label: 'Inline Flex' },
  { value: 'inline-grid', label: 'Inline Grid' },
  { value: 'none', label: 'None (hidden)' },
]

const POSITION_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
]

const OVERFLOW_OPTIONS = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'auto', label: 'Auto' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'clip', label: 'Clip' },
]

const FLOAT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

const OFFSET_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'auto']

const display  = computed(() => ctx.get('display') || 'block')
const position = computed(() => ctx.get('position') || 'static')
const isFlex   = computed(() => display.value === 'flex' || display.value === 'inline-flex')
const isGrid   = computed(() => display.value === 'grid' || display.value === 'inline-grid')
const hasOffset = computed(() => ['relative', 'absolute', 'fixed', 'sticky'].includes(position.value))

const zIndex = computed(() => {
  const v = ctx.get('z-index')
  return v ? parseInt(v) : null
})
</script>

<template>
  <div class="space-y-2">
    <!-- Display -->
    <div class="grid grid-cols-2 gap-2">
      <PropLabel label="Display" prop="display" />
      <n-select
        :value="display"
        :options="DISPLAY_OPTIONS"
        size="small"
        @update:value="v => ctx.set('display', v)"
      />
    </div>

    <!-- Flex sub-section -->
    <FlexSection v-if="isFlex" />

    <!-- Grid sub-section -->
    <GridSection v-if="isGrid" />

    <!-- Position -->
    <div class="grid grid-cols-2 gap-2">
      <PropLabel label="Position" prop="position" />
      <n-select
        :value="position"
        :options="POSITION_OPTIONS"
        size="small"
        @update:value="v => ctx.set('position', v)"
      />
    </div>

    <!-- Position offsets (T/R/B/L) -->
    <div v-if="hasOffset" class="grid grid-cols-2 gap-x-2 gap-y-1">
      <div v-for="side in (['top','right','bottom','left'] as const)" :key="side">
        <PropLabel :label="side" :prop="side" />
        <CssValueInput
          :value="ctx.get(side)"
          :inherited="ctx.getPlaceholder(side)"
          :units="OFFSET_UNITS"
          @change="v => ctx.set(side, v)"
          @preview="v => ctx.set(side, v)"
        />
      </div>
    </div>

    <!-- Z-index -->
    <div v-if="position !== 'static'" class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Z-Index" prop="z-index" />
        <n-input-number
          :value="zIndex"
          size="small"
          placeholder="auto"
          @update:value="v => ctx.set('z-index', v !== null ? String(v) : '')"
        />
      </div>
    </div>

    <!-- Overflow -->
    <div class="grid grid-cols-2 gap-2">
      <PropLabel label="Overflow" prop="overflow" />
      <n-select
        :value="ctx.get('overflow') || 'visible'"
        :options="OVERFLOW_OPTIONS"
        size="small"
        @update:value="v => ctx.set('overflow', v)"
      />
    </div>

    <!-- Float (legacy, only for block/inline-block) -->
    <div v-if="display === 'block' || display === 'inline-block'" class="grid grid-cols-2 gap-2">
      <PropLabel label="Float" prop="float" />
      <n-select
        :value="ctx.get('float') || 'none'"
        :options="FLOAT_OPTIONS"
        size="small"
        @update:value="v => ctx.set('float', v)"
      />
    </div>
  </div>
</template>
