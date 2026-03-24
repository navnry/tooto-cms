<script setup lang="ts">
/**
 * StylePanel.vue — Style Manager orchestrator
 *
 * State-aware: styles can target neutral / :hover / :focus.
 * Mode-aware:  styles can be written to component inline style or CSS class rules.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, provide } from 'vue'
import type { Component } from 'vue'
import { NCollapse, NCollapseItem, NEmpty } from 'naive-ui'
import { useEditor } from '../composables/useEditor'
import { STYLE_CTX } from './style/styleContext'
import StyleHeader      from './style/StyleHeader.vue'
import LayoutSection    from './style/sections/LayoutSection.vue'
import SizeSection      from './style/sections/SizeSection.vue'
import SpacingSection   from './style/sections/SpacingSection.vue'
import BorderSection    from './style/sections/BorderSection.vue'
import TypographySection from './style/sections/TypographySection.vue'
import BackgroundSection from './style/sections/BackgroundSection.vue'
import EffectsSection   from './style/sections/EffectsSection.vue'
import FlexItemSection  from './style/sections/FlexItemSection.vue'
import GridItemSection  from './style/sections/GridItemSection.vue'
import { getComputedStyleValue, getStyleValue, setStyleValue } from '../services/editor/styles'

const { editor, ready } = useEditor()

/** GrapesJS `getClasses()` is typed as `any` — normalize for `string[]` */
function coerceClassList(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => (typeof x === 'string' ? x : String(x)))
}

// ── Reactive tick ──────────────────────────────────────────────────────────────
const _tick = ref(0)
let _handler: (() => void) | null = null

function bindEvents() {
  _handler = () => { _tick.value++ }
  editor.value?.on('style:custom', _handler)
  editor.value?.on('component:selected', _handler)
  editor.value?.on('component:deselected', _handler)
  editor.value?.on('device:change', _handler)
}

onMounted(() => {
  if (ready.value) bindEvents()
  else {
    const stop = watch(ready, (r) => { if (r) { bindEvents(); stop() } })
  }
})

onBeforeUnmount(() => {
  if (_handler) {
    editor.value?.off('style:custom', _handler)
    editor.value?.off('component:selected', _handler)
    editor.value?.off('component:deselected', _handler)
    editor.value?.off('device:change', _handler)
  }
})

// ── State & mode ───────────────────────────────────────────────────────────────
const currentState = ref('')   // '' | 'hover' | 'focus'
const applyMode    = ref<'component' | 'classes'>('component')

function setState(s: string) {
  currentState.value = s
  // Tell GrapesJS selector manager (no colon prefix)
  editor.value?.Selectors.setState(s)
  _tick.value++
}

function setApplyMode(m: 'component' | 'classes') {
  applyMode.value = m
  // Sync componentFirst so GrapesJS built-in panels stay consistent
  editor.value?.Selectors.setComponentFirst(m === 'component')
  _tick.value++
}

// ── Style context API ──────────────────────────────────────────────────────────

const hasSelection = computed(() => {
  void _tick.value
  return !!editor.value?.getSelected()
})

const classes = computed<string[]>(() => {
  void _tick.value
  return coerceClassList(editor.value?.getSelected()?.getClasses())
})

function get(prop: string): string {
  void _tick.value
  const cmp = editor.value?.getSelected()
  if (!cmp) return ''
  return getStyleValue(editor.value!, cmp, applyMode.value, currentState.value, prop)
}

function getPlaceholder(prop: string): string {
  void _tick.value
  const cmp = editor.value?.getSelected()
  if (!cmp || get(prop) !== '') return ''
  return getComputedStyleValue(cmp, prop)
}

function set(prop: string, value: string): void {
  const cmp = editor.value?.getSelected()
  if (!cmp) return
  setStyleValue(editor.value!, cmp, applyMode.value, currentState.value, prop, value)
  _tick.value++
}

function setMany(props: Record<string, string>): void {
  // Route through set() so state/mode logic is applied consistently
  for (const [prop, value] of Object.entries(props)) set(prop, value)
}

function clear(prop: string): void {
  set(prop, '')
}

function hasValue(prop: string): boolean {
  return get(prop) !== ''
}

// ── Class management ───────────────────────────────────────────────────────────

function addClass(name: string) {
  const cmp = editor.value?.getSelected()
  if (!cmp || !name.trim()) return
  cmp.addClass(name.trim())
  _tick.value++
}

function removeClass(name: string) {
  const cmp = editor.value?.getSelected()
  if (!cmp) return
  cmp.removeClass(name)
  _tick.value++
}

// ── CSS editor visibility (shared so sections can hide) ────────────────────────
const showCssEditor = ref(false)

provide(STYLE_CTX, {
  get, getPlaceholder, set, setMany, clear, hasValue,
  hasSelection,
  tick: computed(() => _tick.value),
  state: currentState,
  setState,
  applyMode,
  setApplyMode,
  classes,
  addClass,
  removeClass,
  showCssEditor,
})

// ── Sections config ────────────────────────────────────────────────────────────
interface StylePanelSection {
  id: string
  title: string
  component: Component
}

// SFC default exports can resolve to TS `error` under vue-eslint-parser — assert to Vue `Component`
const SECTIONS: StylePanelSection[] = [
  { id: 'layout',     title: 'Layout',     component: LayoutSection as Component },
  { id: 'size',       title: 'Size',       component: SizeSection as Component },
  { id: 'spacing',    title: 'Spacing',    component: SpacingSection as Component },
  { id: 'border',     title: 'Border',     component: BorderSection as Component },
  { id: 'flex-item',  title: 'Flex Item',  component: FlexItemSection as Component },
  { id: 'grid-item',  title: 'Grid Item',  component: GridItemSection as Component },
  { id: 'typography', title: 'Typography', component: TypographySection as Component },
  { id: 'background', title: 'Background', component: BackgroundSection as Component },
  { id: 'effects',    title: 'Effects',    component: EffectsSection as Component },
]

const defaultOpen = ['layout', 'size', 'spacing', 'typography']
</script>

<template>
  <div class="h-full overflow-y-auto">
    <!-- No selection -->
    <div v-if="!hasSelection" class="flex items-center justify-center h-32">
      <n-empty description="Select an element to style it" size="small" />
    </div>

    <template v-else>
      <!-- Header: state tabs + class manager + apply target -->
      <StyleHeader />

      <!-- Sections (hidden when CSS editor is open) -->
      <div v-if="!showCssEditor" class="p-3">
        <n-collapse
          :default-expanded-names="defaultOpen"
          arrow-placement="right"
          class="style-panel-collapse"
        >
          <n-collapse-item
            v-for="section in SECTIONS"
            :key="section.id"
            :name="section.id"
            :title="section.title"
          >
            <div class="px-2 pb-3">
              <component :is="section.component" />
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </template>
  </div>
</template>
