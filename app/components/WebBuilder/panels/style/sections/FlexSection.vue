<script setup lang="ts">
/**
 * FlexSection — Flexbox container + item properties
 * Injected inside LayoutSection when display is flex/inline-flex.
 */
import { computed, inject } from 'vue'
import { NTabs, NTab } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { STYLE_CTX } from '../styleContext'
import GapInput from '../GapInput.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const GAP_UNITS = ['px', 'rem', 'em', '%']
const rowGap = computed(() => ctx.get('row-gap') || ctx.get('gap')?.split(' ')[0] || '')
const colGap = computed(() => ctx.get('column-gap') || ctx.get('gap')?.split(' ')[1] || rowGap.value)

function setGap(rg: string, cg: string) {
  if (rg === cg) { ctx.set('gap', rg); ctx.clear('row-gap'); ctx.clear('column-gap') }
  else           { ctx.set('row-gap', rg); ctx.set('column-gap', cg); ctx.clear('gap') }
}
</script>

<template>
  <div class="space-y-2 pl-2 border-l-2 border-blue-500/20">
    <p class="text-xs text-blue-400/80 uppercase tracking-wider font-medium">Flexbox</p>

    <!-- Direction -->
    <div>
      <PropLabel label="Direction" prop="flex-direction" />
      <n-tabs
        :value="ctx.get('flex-direction') || 'row'"
        type="segment" size="small"
        @update:value="v => ctx.set('flex-direction', v)"
      >
        <n-tab name="row" title="Row →">
          <Icon icon="lucide:arrow-right" :width="14" :height="14" />
        </n-tab>
        <n-tab name="row-reverse" title="Row Reverse ←">
          <Icon icon="lucide:arrow-left" :width="14" :height="14" />
        </n-tab>
        <n-tab name="column" title="Column ↓">
          <Icon icon="lucide:arrow-down" :width="14" :height="14" />
        </n-tab>
        <n-tab name="column-reverse" title="Column Reverse ↑">
          <Icon icon="lucide:arrow-up" :width="14" :height="14" />
        </n-tab>
      </n-tabs>
    </div>

    <!-- Wrap -->
    <div>
      <PropLabel label="Wrap" prop="flex-wrap" />
      <n-tabs
        :value="ctx.get('flex-wrap') || 'nowrap'"
        type="segment" size="small"
        @update:value="v => ctx.set('flex-wrap', v)"
      >
        <n-tab name="nowrap" title="No Wrap">
          <Icon icon="lucide:minus" :width="14" :height="14" />
        </n-tab>
        <n-tab name="wrap" title="Wrap">
          <Icon icon="lucide:wrap-text" :width="14" :height="14" />
        </n-tab>
        <n-tab name="wrap-reverse" title="Wrap Reverse">
          <Icon icon="lucide:wrap-text" :width="14" :height="14" style="transform: scaleY(-1)" />
        </n-tab>
      </n-tabs>
    </div>

    <!-- Justify Content -->
    <div>
      <PropLabel label="Justify Content" prop="justify-content" />
      <n-tabs
        :value="ctx.get('justify-content') || 'flex-start'"
        type="segment" size="small"
        @update:value="v => ctx.set('justify-content', v)"
      >
        <n-tab name="flex-start" title="Start">
          <Icon icon="lucide:align-start-horizontal" :width="14" :height="14" />
        </n-tab>
        <n-tab name="center" title="Center">
          <Icon icon="lucide:align-center-horizontal" :width="14" :height="14" />
        </n-tab>
        <n-tab name="flex-end" title="End">
          <Icon icon="lucide:align-end-horizontal" :width="14" :height="14" />
        </n-tab>
        <n-tab name="space-between" title="Space Between">
          <Icon icon="lucide:align-horizontal-distribute-center" :width="14" :height="14" />
        </n-tab>
        <n-tab name="space-around" title="Space Around">
          <Icon icon="lucide:move-horizontal" :width="14" :height="14" />
        </n-tab>
        <n-tab name="space-evenly" title="Space Evenly">
          <Icon icon="lucide:grip-horizontal" :width="14" :height="14" />
        </n-tab>
      </n-tabs>
    </div>

    <!-- Align Items -->
    <div>
      <PropLabel label="Align Items" prop="align-items" />
      <n-tabs
        :value="ctx.get('align-items') || 'stretch'"
        type="segment" size="small"
        @update:value="v => ctx.set('align-items', v)"
      >
        <n-tab name="stretch" title="Stretch">
          <Icon icon="lucide:move-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="flex-start" title="Start">
          <Icon icon="lucide:align-start-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="center" title="Center">
          <Icon icon="lucide:align-center-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="flex-end" title="End">
          <Icon icon="lucide:align-end-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="baseline" title="Baseline">
          <Icon icon="lucide:baseline" :width="14" :height="14" />
        </n-tab>
      </n-tabs>
    </div>

    <!-- Align Content -->
    <div>
      <PropLabel label="Align Content" prop="align-content" />
      <n-tabs
        :value="ctx.get('align-content') || 'stretch'"
        type="segment" size="small"
        @update:value="v => ctx.set('align-content', v)"
      >
        <n-tab name="stretch" title="Stretch">
          <Icon icon="lucide:move-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="flex-start" title="Start">
          <Icon icon="lucide:align-start-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="center" title="Center">
          <Icon icon="lucide:align-center-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="flex-end" title="End">
          <Icon icon="lucide:align-end-vertical" :width="14" :height="14" />
        </n-tab>
        <n-tab name="space-between" title="Space Between">
          <Icon icon="lucide:align-vertical-distribute-center" :width="14" :height="14" />
        </n-tab>
        <n-tab name="space-around" title="Space Around">
          <Icon icon="lucide:move-vertical" :width="14" :height="14" style="opacity: 0.6" />
        </n-tab>
      </n-tabs>
    </div>

    <!-- Gap -->
    <div>
      <PropLabel label="Gap" :props="['gap','row-gap','column-gap']" />
      <GapInput
        :row="rowGap" :col="colGap" :units="GAP_UNITS"
        @change="(r, c) => setGap(r, c)"
        @preview="(r, c) => setGap(r, c)"
      />
    </div>
  </div>
</template>
