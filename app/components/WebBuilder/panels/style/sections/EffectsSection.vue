<script setup lang="ts">
/**
 * EffectsSection — Opacity, box-shadow, text-shadow, filter, transform, transition, cursor, mix-blend-mode
 */
import { computed, inject } from 'vue'
import { NSlider, NSelect, NInput } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import ShadowControl from '../ShadowControl.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const CURSOR_OPTIONS = [
  { value: 'default',     label: 'Default' },
  { value: 'pointer',     label: 'Pointer ☞' },
  { value: 'crosshair',   label: 'Crosshair +' },
  { value: 'text',        label: 'Text I' },
  { value: 'move',        label: 'Move ✥' },
  { value: 'grab',        label: 'Grab ✋' },
  { value: 'grabbing',    label: 'Grabbing ✊' },
  { value: 'not-allowed', label: 'Not Allowed 🚫' },
  { value: 'zoom-in',     label: 'Zoom In' },
  { value: 'zoom-out',    label: 'Zoom Out' },
  { value: 'none',        label: 'None (hidden)' },
]

const BLEND_OPTIONS = [
  { value: 'normal',      label: 'Normal' },
  { value: 'multiply',    label: 'Multiply' },
  { value: 'screen',      label: 'Screen' },
  { value: 'overlay',     label: 'Overlay' },
  { value: 'darken',      label: 'Darken' },
  { value: 'lighten',     label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn',  label: 'Color Burn' },
  { value: 'hard-light',  label: 'Hard Light' },
  { value: 'soft-light',  label: 'Soft Light' },
  { value: 'difference',  label: 'Difference' },
  { value: 'exclusion',   label: 'Exclusion' },
  { value: 'hue',         label: 'Hue' },
  { value: 'saturation',  label: 'Saturation' },
  { value: 'color',       label: 'Color' },
  { value: 'luminosity',  label: 'Luminosity' },
]

const opacity = computed(() => {
  const v = ctx.get('opacity')
  return v !== '' ? parseFloat(v) : 1
})
</script>

<template>
  <div class="space-y-3">
    <!-- Opacity -->
    <div>
      <div class="flex items-center mb-1">
        <PropLabel label="Opacity" prop="opacity" />
        <span class="text-[11px] text-[var(--editor-text-muted)]">{{ Math.round(opacity * 100) }}%</span>
      </div>
      <n-slider
        :value="opacity"
        :min="0" :max="1" :step="0.01"
        @update:value="v => ctx.set('opacity', String(v))"
      />
    </div>

    <!-- Box Shadow (multi-layer) -->
    <div>
      <PropLabel label="Box Shadow" prop="box-shadow" />
      <ShadowControl
        :value="ctx.get('box-shadow') || 'none'"
        type="box"
        @change="v => ctx.set('box-shadow', v)"
      />
    </div>

    <!-- Text Shadow (multi-layer) -->
    <div>
      <PropLabel label="Text Shadow" prop="text-shadow" />
      <ShadowControl
        :value="ctx.get('text-shadow') || 'none'"
        type="text"
        @change="v => ctx.set('text-shadow', v)"
      />
    </div>

    <!-- Filter -->
    <div>
      <PropLabel label="Filter" prop="filter" />
      <n-input
        :value="ctx.get('filter')"
        size="small"
        :placeholder="ctx.getPlaceholder('filter') || 'blur(4px) brightness(1.2)…'"
        @blur="e => ctx.set('filter', (e.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Backdrop filter -->
    <div>
      <PropLabel label="Backdrop Filter" prop="backdrop-filter" />
      <n-input
        :value="ctx.get('backdrop-filter')"
        size="small"
        :placeholder="ctx.getPlaceholder('backdrop-filter') || 'blur(8px)'"
        @blur="e => ctx.set('backdrop-filter', (e.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Transform -->
    <div>
      <PropLabel label="Transform" prop="transform" />
      <n-input
        :value="ctx.get('transform')"
        size="small"
        :placeholder="ctx.getPlaceholder('transform') || 'rotate(45deg) scale(1.2)…'"
        @blur="e => ctx.set('transform', (e.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Transition -->
    <div>
      <PropLabel label="Transition" prop="transition" />
      <n-input
        :value="ctx.get('transition')"
        size="small"
        :placeholder="ctx.getPlaceholder('transition') || 'all 0.3s ease'"
        @blur="e => ctx.set('transition', (e.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Cursor + Blend mode -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Cursor" prop="cursor" />
        <n-select :value="ctx.get('cursor') || 'default'" :options="CURSOR_OPTIONS" size="small"
          @update:value="v => ctx.set('cursor', v)" />
      </div>
      <div>
        <PropLabel label="Blend Mode" prop="mix-blend-mode" />
        <n-select :value="ctx.get('mix-blend-mode') || 'normal'" :options="BLEND_OPTIONS" size="small"
          @update:value="v => ctx.set('mix-blend-mode', v)" />
      </div>
    </div>

    <!-- Visibility -->
    <div>
      <PropLabel label="Visibility" prop="visibility" />
      <n-select
        :value="ctx.get('visibility') || 'visible'"
        :options="[{value:'visible',label:'Visible'},{value:'hidden',label:'Hidden'},{value:'collapse',label:'Collapse'}]"
        size="small"
        @update:value="v => ctx.set('visibility', v)"
      />
    </div>
  </div>
</template>
