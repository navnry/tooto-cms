<script setup lang="ts">
/**
 * GridSection — CSS Grid container + item properties
 * Injected inside LayoutSection when display is grid/inline-grid.
 */
import { computed, inject } from 'vue'
import { NSelect, NInput } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import GapInput from '../GapInput.vue'
import GridTrackInput from '../GridTrackInput.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const AUTO_FLOW_OPTIONS = [
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' },
  { value: 'row dense', label: 'Row Dense' },
  { value: 'column dense', label: 'Column Dense' },
]

const JUSTIFY_ITEMS_OPTIONS = [
  { value: 'start', label: 'Start' },
  { value: 'end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'stretch', label: 'Stretch' },
]

const ALIGN_ITEMS_OPTIONS = JUSTIFY_ITEMS_OPTIONS

const rowGap = computed(() => ctx.get('row-gap') || ctx.get('gap')?.split(' ')[0] || '')
const colGap = computed(() => ctx.get('column-gap') || ctx.get('gap')?.split(' ')[1] || rowGap.value)

function setGap(rg: string, cg: string) {
  if (rg === cg) { ctx.set('gap', rg); ctx.clear('row-gap'); ctx.clear('column-gap') }
  else { ctx.set('row-gap', rg); ctx.set('column-gap', cg); ctx.clear('gap') }
}
</script>

<template>
  <div class="space-y-2 pl-2 border-l-2 border-purple-500/20">
    <!-- Template columns / rows -->
    <div>
      <PropLabel label="Template Columns" prop="grid-template-columns" />
      <GridTrackInput
        :value="ctx.get('grid-template-columns')"
        @change="v => ctx.set('grid-template-columns', v)"
        @preview="v => ctx.set('grid-template-columns', v)"
      />
    </div>
    <div>
      <PropLabel label="Template Rows" prop="grid-template-rows" />
      <GridTrackInput
        :value="ctx.get('grid-template-rows')"
        @change="v => ctx.set('grid-template-rows', v)"
        @preview="v => ctx.set('grid-template-rows', v)"
      />
    </div>
    <div>
      <PropLabel label="Template Areas" prop="grid-template-areas" />
      <n-input type="textarea" :value="ctx.get('grid-template-areas')" size="small"
        placeholder='"header header" "sidebar main"'
        :autosize="{ minRows: 2, maxRows: 4 }"
        @update:value="v => ctx.set('grid-template-areas', v)" />
    </div>

    <!-- Auto flow -->
    <div>
      <PropLabel label="Auto Flow" prop="grid-auto-flow" />
      <n-select :value="ctx.get('grid-auto-flow') || 'row'" :options="AUTO_FLOW_OPTIONS" size="small"
        @update:value="v => ctx.set('grid-auto-flow', v)" />
    </div>

    <!-- Auto columns/rows -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Auto Columns" prop="grid-auto-columns" />
        <n-input :value="ctx.get('grid-auto-columns')" size="small" placeholder="auto"
          @update:value="v => ctx.set('grid-auto-columns', v)"
          @blur="e => ctx.set('grid-auto-columns', (e.target as HTMLInputElement).value)" />
      </div>
      <div>
        <PropLabel label="Auto Rows" prop="grid-auto-rows" />
        <n-input :value="ctx.get('grid-auto-rows')" size="small" placeholder="auto"
          @update:value="v => ctx.set('grid-auto-rows', v)"
          @blur="e => ctx.set('grid-auto-rows', (e.target as HTMLInputElement).value)" />
      </div>
    </div>

    <!-- Justify/Align items -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Justify Items" prop="justify-items" />
        <n-select :value="ctx.get('justify-items') || 'stretch'" :options="JUSTIFY_ITEMS_OPTIONS" size="small"
          @update:value="v => ctx.set('justify-items', v)" />
      </div>
      <div>
        <PropLabel label="Align Items" prop="align-items" />
        <n-select :value="ctx.get('align-items') || 'stretch'" :options="ALIGN_ITEMS_OPTIONS" size="small"
          @update:value="v => ctx.set('align-items', v)" />
      </div>
    </div>

    <!-- Gap -->
    <div>
      <PropLabel label="Gap" :props="['gap','row-gap','column-gap']" />
      <GapInput :row="rowGap" :col="colGap" @change="(r,c) => setGap(r,c)" @preview="(r,c) => setGap(r,c)" />
    </div>
  </div>
</template>
