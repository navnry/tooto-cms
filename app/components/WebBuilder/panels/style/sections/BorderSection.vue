<script setup lang="ts">
/**
 * BorderSection — Border width (per-side), style, color, and radius (per-corner)
 */
import { computed, inject } from 'vue'
import { NSelect } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import BoxSideInput from '../BoxSideInput.vue'
import PropLabel from '../PropLabel.vue'
import ColorPicker from '../ColorPicker.vue'

const ctx = inject(STYLE_CTX)!

const BORDER_STYLE_OPTIONS = [
  { value: 'none',   label: 'None' },
  { value: 'solid',  label: 'Solid ———' },
  { value: 'dashed', label: 'Dashed - - -' },
  { value: 'dotted', label: 'Dotted .......' },
  { value: 'double', label: 'Double ═════' },
  { value: 'groove', label: 'Groove' },
  { value: 'ridge',  label: 'Ridge' },
  { value: 'inset',  label: 'Inset' },
  { value: 'outset', label: 'Outset' },
]

// Border width per side
const bwTop    = computed(() => ctx.get('border-top-width')    || ctx.get('border-width') || '')
const bwRight  = computed(() => ctx.get('border-right-width')  || ctx.get('border-width') || '')
const bwBottom = computed(() => ctx.get('border-bottom-width') || ctx.get('border-width') || '')
const bwLeft   = computed(() => ctx.get('border-left-width')   || ctx.get('border-width') || '')

function applyBorderWidth(t: string, r: string, b: string, l: string) {
  ctx.setMany({
    'border-top-width': t, 'border-right-width': r,
    'border-bottom-width': b, 'border-left-width': l,
  })
  ctx.clear('border-width')
}

// Border radius per corner (TL / TR / BR / BL)
const brTL = computed(() => ctx.get('border-top-left-radius')     || ctx.get('border-radius') || '')
const brTR = computed(() => ctx.get('border-top-right-radius')    || ctx.get('border-radius') || '')
const brBR = computed(() => ctx.get('border-bottom-right-radius') || ctx.get('border-radius') || '')
const brBL = computed(() => ctx.get('border-bottom-left-radius')  || ctx.get('border-radius') || '')

function applyRadius(tl: string, tr: string, br: string, bl: string) {
  ctx.setMany({
    'border-top-left-radius': tl, 'border-top-right-radius': tr,
    'border-bottom-right-radius': br, 'border-bottom-left-radius': bl,
  })
  ctx.clear('border-radius')
}

const borderColor = computed(() => ctx.get('border-color') || '#000000')
const borderStyle = computed(() => ctx.get('border-style') || 'solid')
</script>

<template>
  <div class="space-y-3">
    <!-- Style -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <PropLabel label="Style" prop="border-style" />
        <n-select
            :value="borderStyle"
            :options="BORDER_STYLE_OPTIONS"
            size="small"
            @update:value="v => ctx.set('border-style', v)"
        />
      </div>

      <!-- Color -->
      <div>
        <PropLabel label="Color" prop="border-color" />
        <ColorPicker
            :value="borderColor"
            @confirm="v => ctx.set('border-color', v)"
            @clear="() => ctx.clear('border-color')"
        />
      </div>
    </div>

    <!-- Width (4-side) -->
    <div>
      <PropLabel label="Width" :props="['border-top-width','border-right-width','border-bottom-width','border-left-width','border-width']" />
      <BoxSideInput
        :top="bwTop" :right="bwRight" :bottom="bwBottom" :left="bwLeft"
        @change="(t,r,b,l) => applyBorderWidth(t,r,b,l)"
        @preview="(t,r,b,l) => applyBorderWidth(t,r,b,l)"
      />
    </div>

    <!-- Radius (4-corner): labels are TL/TR/BR/BL -->
    <div>
      <PropLabel label="Radius" :props="['border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius','border-radius']" />
      <BoxSideInput
        :top="brTL" :right="brTR" :bottom="brBR" :left="brBL"
        :labels="['TL', 'TR', 'BR', 'BL']"
        @change="(tl,tr,br,bl) => applyRadius(tl,tr,br,bl)"
        @preview="(tl,tr,br,bl) => applyRadius(tl,tr,br,bl)"
      />
    </div>
  </div>
</template>
