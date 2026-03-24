<script setup lang="ts">
/**
 * BoxSideInput — 4-side CSS value editor with linked toggle
 *
 * Visual layout (linked):
 *   [ CssValueInput ]   [ □ ][ ⌐ ]
 *
 * Visual layout (unlinked):
 *   [         ]   [ □ ][ ⌐ ]
 *   Top          Right
 *   [ CssValueInput ]  [ CssValueInput ]
 *   Bottom       Left
 *   [ CssValueInput ]  [ CssValueInput ]
 */
import { ref, computed, watch } from 'vue'
import { NTabs, NTab } from 'naive-ui'
import CssValueInput from './CssValueInput.vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  top: string
  right: string
  bottom: string
  left: string
  /** Custom labels for T/R/B/L — useful for border-radius (TL/TR/BR/BL) */
  labels?: [string, string, string, string]
  units?: string[]
  inherited?: [string, string, string, string]
  headerInherited?: string
}>()

const emit = defineEmits<{
  change: [top: string, right: string, bottom: string, left: string]
  preview: [top: string, right: string, bottom: string, left: string]
}>()

const LABELS = computed(() => props.labels ?? ['Top', 'Right', 'Bottom', 'Left'])

const allEqual = computed(() =>
  props.top === props.right && props.top === props.bottom && props.top === props.left,
)

const linked = ref(allEqual.value)
const userToggled = ref(false)
const INHERITED = computed(() => props.inherited ?? ['', '', '', ''])
const effectiveSides = computed(() => [
  props.top || INHERITED.value[0],
  props.right || INHERITED.value[1],
  props.bottom || INHERITED.value[2],
  props.left || INHERITED.value[3],
])

const allEffectiveEqual = computed(() => {
  const [top, right, bottom, left] = effectiveSides.value
  return top === right && top === bottom && top === left
})

watch(allEqual, (value) => {
  if (userToggled.value) return
  linked.value = value || allEffectiveEqual.value
})

const headerValue = computed(() => (allEqual.value ? props.top : ''))

type Side = 'top' | 'right' | 'bottom' | 'left'

function emitPreview(side: Side, val: string) {
  if (linked.value) {
    emit('preview', val, val, val, val)
  } else {
    emit('preview',
      side === 'top'    ? val : props.top,
      side === 'right'  ? val : props.right,
      side === 'bottom' ? val : props.bottom,
      side === 'left'   ? val : props.left,
    )
  }
}

function emitChange(side: Side, val: string) {
  if (linked.value) {
    emit('change', val, val, val, val)
  } else {
    emit('change',
      side === 'top'    ? val : props.top,
      side === 'right'  ? val : props.right,
      side === 'bottom' ? val : props.bottom,
      side === 'left'   ? val : props.left,
    )
  }
}
</script>

<template>
  <div class="select-none space-y-2 py-1">
    <!-- Header row -->
    <div class="grid grid-cols-2 items-center gap-2">
      <!-- CssValueInput shown when linked; placeholder spacer when unlinked -->
      <div class="">
        <CssValueInput
          :value="headerValue"
          :inherited="headerInherited"
          :units="units"
          :disabled="!linked"
          @change="v => emitChange('top', v)"
          @preview="v => emitPreview('top', v)"
        />
      </div>

      <!-- Toggle: linked / unlinked -->
      <n-tabs
        :value="linked ? 'linked' : 'unlinked'"
        type="segment"
        size="small"
        @update:value="v => {
          userToggled = true
          if (v === 'linked') {
            linked = true
            const val = props.top || props.right || props.bottom || props.left || ''
            emit('change', val, val, val, val)
          } else {
            linked = false
          }
        }"
      >
        <n-tab name="linked">
          <Icon icon="carbon:square-outline"/>
        </n-tab>
        <n-tab name="unlinked">
          <Icon icon="iconoir:border-tl"/>
        </n-tab>
      </n-tabs>
    </div>

    <!-- Expanded 2×2 grid when unlinked -->
    <div v-if="!linked" class="grid grid-cols-2 gap-2">
      <div v-for="(side, i) in (['top', 'right', 'bottom', 'left'] as Side[])" :key="side" class="space-y-1">
        <span class="text-[10px] text-[var(--editor-text-subtle)] tracking-wide">{{ LABELS[i] }}</span>
        <CssValueInput
          :value="props[side]"
          :inherited="INHERITED[i]"
          :units="units"
          @change="v => emitChange(side, v)"
          @preview="v => emitPreview(side, v)"
        />
      </div>
    </div>
  </div>
</template>
