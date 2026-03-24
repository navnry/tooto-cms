<script setup lang="ts">
/**
 * SpacingSection — Margin + Padding using BoxSideInput
 */
import { inject, computed } from 'vue'
import { STYLE_CTX } from '../styleContext'
import BoxSideInput from '../BoxSideInput.vue'
import PropLabel from '../PropLabel.vue'

const ctx = inject(STYLE_CTX)!

// Parse shorthand (e.g. "10px 20px") or individual values
function getSide(shorthand: string, propName: string): string {
  const individual = ctx.get(propName)
  if (individual) return individual
  const short = ctx.get(shorthand)
  if (!short) return ''
  const parts = short.trim().split(/\s+/)
  const map: Record<string, number> = { top: 0, right: 1, bottom: 2, left: 3 }
  const side = propName.replace(`${shorthand}-`, '') as keyof typeof map
  const i = map[side] ?? 0
  if (parts.length === 1) return parts[0]!
  if (parts.length === 2) return i === 0 || i === 2 ? parts[0]! : parts[1]!
  if (parts.length === 3) return i === 0 ? parts[0]! : i === 1 || i === 3 ? parts[1]! : parts[2]!
  return parts[i] ?? ''
}

// Margin
const mt = computed(() => getSide('margin', 'margin-top'))
const mr = computed(() => getSide('margin', 'margin-right'))
const mb = computed(() => getSide('margin', 'margin-bottom'))
const ml = computed(() => getSide('margin', 'margin-left'))

// Padding
const pt = computed(() => getSide('padding', 'padding-top'))
const pr = computed(() => getSide('padding', 'padding-right'))
const pb = computed(() => getSide('padding', 'padding-bottom'))
const pl = computed(() => getSide('padding', 'padding-left'))

function applyMargin(top: string, right: string, bottom: string, left: string) {
  ctx.setMany({ 'margin-top': top, 'margin-right': right, 'margin-bottom': bottom, 'margin-left': left })
  ctx.clear('margin')
}

function applyPadding(top: string, right: string, bottom: string, left: string) {
  ctx.setMany({ 'padding-top': top, 'padding-right': right, 'padding-bottom': bottom, 'padding-left': left })
  ctx.clear('padding')
}
</script>

<template>
  <div class="space-y-3">
    <!-- Margin -->
    <div>
      <PropLabel label="Margin" :props="['margin-top','margin-right','margin-bottom','margin-left','margin']" />
      <BoxSideInput
        :top="mt"  :right="mr"  :bottom="mb"  :left="ml"
        :header-inherited="ctx.getPlaceholder('margin')"
        :inherited="[
          ctx.getPlaceholder('margin-top'),
          ctx.getPlaceholder('margin-right'),
          ctx.getPlaceholder('margin-bottom'),
          ctx.getPlaceholder('margin-left'),
        ]"
        @change="(t,r,b,l) => applyMargin(t,r,b,l)"
        @preview="(t,r,b,l) => applyMargin(t,r,b,l)"
      />
    </div>

    <!-- Padding -->
    <div>
      <PropLabel label="Padding" :props="['padding-top','padding-right','padding-bottom','padding-left','padding']" />
      <BoxSideInput
        :top="pt"  :right="pr"  :bottom="pb"  :left="pl"
        :header-inherited="ctx.getPlaceholder('padding')"
        :inherited="[
          ctx.getPlaceholder('padding-top'),
          ctx.getPlaceholder('padding-right'),
          ctx.getPlaceholder('padding-bottom'),
          ctx.getPlaceholder('padding-left'),
        ]"
        @change="(t,r,b,l) => applyPadding(t,r,b,l)"
        @preview="(t,r,b,l) => applyPadding(t,r,b,l)"
      />
    </div>
  </div>
</template>
