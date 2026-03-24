<script setup lang="ts">
/**
 * SizeSection — width, height, min/max, box-sizing, aspect-ratio
 */
import { inject } from 'vue'
import { NSelect } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import CssValueInput from '../CssValueInput.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const SIZE_UNITS  = ['px', '%', 'rem', 'em', 'vw', 'vh', 'svh', 'dvh', 'auto', 'fit-content', 'max-content', 'min-content']
const LIMIT_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'none']

const BOX_SIZING_OPTIONS = [
  { value: 'border-box',  label: 'Border Box (include padding)' },
  { value: 'content-box', label: 'Content Box (exclude padding)' },
]
</script>

<template>
  <div class="space-y-2">
    <!-- Width / Height -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Width" prop="width" />
        <CssValueInput :value="ctx.get('width')" :units="SIZE_UNITS" :inherited="ctx.getPlaceholder('width')"
          @change="v => ctx.set('width', v)" @preview="v => ctx.set('width', v)" />
      </div>
      <div>
        <PropLabel label="Height" prop="height" />
        <CssValueInput :value="ctx.get('height')" :units="SIZE_UNITS" :inherited="ctx.getPlaceholder('height')"
          @change="v => ctx.set('height', v)" @preview="v => ctx.set('height', v)" />
      </div>
    </div>

    <!-- Min / Max width -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Min W" prop="min-width" />
        <CssValueInput :value="ctx.get('min-width')" :units="LIMIT_UNITS" :inherited="ctx.getPlaceholder('min-width')"
          @change="v => ctx.set('min-width', v)" @preview="v => ctx.set('min-width', v)" />
      </div>
      <div>
        <PropLabel label="Max W" prop="max-width" />
        <CssValueInput :value="ctx.get('max-width')" :units="LIMIT_UNITS" :inherited="ctx.getPlaceholder('max-width')"
          @change="v => ctx.set('max-width', v)" @preview="v => ctx.set('max-width', v)" />
      </div>
    </div>

    <!-- Min / Max height -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Min H" prop="min-height" />
        <CssValueInput :value="ctx.get('min-height')" :units="LIMIT_UNITS" :inherited="ctx.getPlaceholder('min-height')"
          @change="v => ctx.set('min-height', v)" @preview="v => ctx.set('min-height', v)" />
      </div>
      <div>
        <PropLabel label="Max H" prop="max-height" />
        <CssValueInput :value="ctx.get('max-height')" :units="LIMIT_UNITS" :inherited="ctx.getPlaceholder('max-height')"
          @change="v => ctx.set('max-height', v)" @preview="v => ctx.set('max-height', v)" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <!-- Box sizing -->
      <div class="">
        <PropLabel label="Box Sizing" prop="box-sizing" />
        <n-select
            :value="ctx.get('box-sizing') || 'content-box'"
            :options="BOX_SIZING_OPTIONS"
            size="small"
            @update:value="v => ctx.set('box-sizing', v)"
        />
      </div>

      <!-- Aspect ratio -->
      <div class="">
        <PropLabel label="Aspect Ratio" prop="aspect-ratio" />
        <input
            class="css-text-input"
            :value="ctx.get('aspect-ratio')"
            :placeholder="ctx.getPlaceholder('aspect-ratio') || '16 / 9'"
            @blur="e => ctx.set('aspect-ratio', (e.target as HTMLInputElement).value)"
        />
      </div>
    </div>

  </div>
</template>
