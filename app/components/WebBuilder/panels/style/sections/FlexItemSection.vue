<script setup lang="ts">
/**
 * FlexItemSection — Properties for a flex item (child of a flex container)
 * grow, shrink, basis, align-self, order
 */
import { computed, inject } from 'vue'
import { NTabs, NTab, NInputNumber } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import CssValueInput from '../CssValueInput.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

const flexBasis  = computed(() => ctx.get('flex-basis') || 'auto')
const flexGrow   = computed(() => ctx.get('flex-grow')   ? Number(ctx.get('flex-grow'))   : null)
const flexShrink = computed(() => ctx.get('flex-shrink') ? Number(ctx.get('flex-shrink')) : null)
const order      = computed(() => ctx.get('order')       ? Number(ctx.get('order'))       : null)
</script>

<template>
  <div class="space-y-2">
    <!-- Grow / Shrink -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Grow" prop="flex-grow" />
        <n-input-number :value="flexGrow" size="small" :min="0" :step="1" placeholder="0"
          @update:value="v => ctx.set('flex-grow', v !== null ? String(v) : '')" />
      </div>
      <div>
        <PropLabel label="Shrink" prop="flex-shrink" />
        <n-input-number :value="flexShrink" size="small" :min="0" :step="1" placeholder="1"
          @update:value="v => ctx.set('flex-shrink', v !== null ? String(v) : '')" />
      </div>
    </div>

    <!-- Basis -->
    <div>
      <PropLabel label="Basis" prop="flex-basis" />
      <CssValueInput :value="flexBasis" :units="['px','%','rem','em','auto','content']"
        @change="v => ctx.set('flex-basis', v)" @preview="v => ctx.set('flex-basis', v)" />
    </div>

    <!-- Align Self -->
    <div>
      <PropLabel label="Align Self" prop="align-self" />
      <n-tabs
        :value="ctx.get('align-self') || 'auto'"
        type="segment" size="small"
        @update:value="v => ctx.set('align-self', v)"
      >
        <n-tab name="auto" title="Auto">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
            <rect x="5.75" y="2" width="2.5" height="10" rx="0.3" fill="currentColor"/>
            <rect x="10.5" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
          </svg>
        </n-tab>
        <n-tab name="stretch" title="Stretch">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
            <rect x="5.75" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" />
            <rect x="10.5" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
          </svg>
        </n-tab>
        <n-tab name="flex-start" title="Start">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
            <rect x="5.75" y="2" width="2.5" height="4.5" rx="0.3" fill="currentColor"/>
            <rect x="10.5" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
          </svg>
        </n-tab>
        <n-tab name="center" title="Center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
            <rect x="5.75" y="4.75" width="2.5" height="4.5" rx="0.3" fill="currentColor"/>
            <rect x="10.5" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
          </svg>
        </n-tab>
        <n-tab name="flex-end" title="End">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
            <rect x="5.75" y="7.5" width="2.5" height="4.5" rx="0.3" fill="currentColor"/>
            <rect x="10.5" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
          </svg>
        </n-tab>
        <n-tab name="baseline" title="Baseline">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
            <line x1="4.5" y1="6" x2="9.5" y2="6" stroke="currentColor" stroke-width="0.7" stroke-dasharray="1.5 1"/>
            <rect x="5.75" y="2" width="2.5" height="4" rx="0.3" fill="currentColor"/>
            <rect x="10.5" y="2" width="2.5" height="10" rx="0.3" fill="currentColor" opacity="0.3"/>
          </svg>
        </n-tab>
      </n-tabs>
    </div>

    <!-- Order -->
    <div>
      <PropLabel label="Order" prop="order" />
      <n-input-number :value="order" size="small" :step="1" placeholder="0"
        @update:value="v => ctx.set('order', v !== null ? String(v) : '')" />
    </div>
  </div>
</template>
