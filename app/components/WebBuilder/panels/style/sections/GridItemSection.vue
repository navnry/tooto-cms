<script setup lang="ts">
/**
 * GridItemSection — Properties for a grid item (child of a grid container)
 * grid-column, grid-row, justify-self, align-self
 */
import { inject } from 'vue'
import { NSelect, NInput } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const ALIGN_SELF_OPTIONS = [
  { value: 'auto',     label: 'Auto' },
  { value: 'start',    label: 'Start' },
  { value: 'end',      label: 'End' },
  { value: 'center',   label: 'Center' },
  { value: 'stretch',  label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
]
</script>

<template>
  <div class="space-y-2">
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Column" prop="grid-column" />
        <n-input :value="ctx.get('grid-column')" size="small" placeholder="1 / 3"
          @blur="e => ctx.set('grid-column', (e.target as HTMLInputElement).value)" />
      </div>
      <div>
        <PropLabel label="Row" prop="grid-row" />
        <n-input :value="ctx.get('grid-row')" size="small" placeholder="1 / 2"
          @blur="e => ctx.set('grid-row', (e.target as HTMLInputElement).value)" />
      </div>
      <div>
        <PropLabel label="Justify Self" prop="justify-self" />
        <n-select :value="ctx.get('justify-self') || 'auto'" :options="ALIGN_SELF_OPTIONS" size="small"
          @update:value="v => ctx.set('justify-self', v)" />
      </div>
      <div>
        <PropLabel label="Align Self" prop="align-self" />
        <n-select :value="ctx.get('align-self') || 'auto'" :options="ALIGN_SELF_OPTIONS" size="small"
          @update:value="v => ctx.set('align-self', v)" />
      </div>
    </div>
  </div>
</template>
