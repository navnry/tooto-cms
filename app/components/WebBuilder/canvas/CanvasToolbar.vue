<script setup lang="ts">
/**
 * CanvasToolbar.vue — floating toolbar that appears above selected canvas elements
 *
 * Rendered via Teleport into Canvas.getSpotsEl() so coordinates map 1-to-1
 * with the canvas spot system (auto-updates on scroll / zoom / resize).
 *
 * Position:  prefers floating above the element; flips below if < 40 px from top.
 * Actions:   select parent · move up · move down · duplicate · delete
 */
import { ref, computed, shallowRef, watch, onBeforeUnmount } from 'vue'
import { useEditor } from '../composables/useEditor'
import type { CanvasSpot, Component as GjsComponent } from 'grapesjs'
import AppIcon from '~/components/WebBuilder/ui/AppIcon.vue'

const { editor, ready } = useEditor()

// ── Spot position ─────────────────────────────────────────────────────────────
const spotLeft   = ref(0)
const spotTop    = ref(0)
const spotHeight = ref(0)
const visible    = ref(false)

const TOOLBAR_H = 30   // px — must match CSS height
const MARGIN    = 6    // px — gap between toolbar and element

// Prefer above; flip below when not enough room
const toolbarStyle = computed(() => {
  const above = spotTop.value - TOOLBAR_H - MARGIN
  const top   = above >= 4 ? above : spotTop.value + spotHeight.value + MARGIN
  return {
    position: 'absolute' as const,
    left: `${spotLeft.value}px`,
    top:  `${top}px`,
    pointerEvents: 'auto' as const,
    zIndex: '9999',
  }
})

// ── Selected component ────────────────────────────────────────────────────────
const selectedComp = shallowRef<GjsComponent | null>(null)

const componentName = computed(() => {
  const c = selectedComp.value
  if (!c) return ''
  return (c.getName?.() || c.get('type') || c.get('tagName') || 'Element') as string
})

// Walk up one level; skip the invisible root wrapper
const parentComp = computed<GjsComponent | null>(() => {
  const c = selectedComp.value
  if (!c) return null
  const p = c.parent?.()
  // Root body-wrapper has no parent — skip it
  if (!p || !p.parent?.()) return null
  return p
})

const parentName = computed(() => {
  const p = parentComp.value
  if (!p) return ''
  return (p.getName?.() || p.get('type') || p.get('tagName') || 'Parent') as string
})

// ── Capability flags ──────────────────────────────────────────────────────────
const canSelectParent = computed(() => !!parentComp.value)

const canDelete = computed(() => {
  const c = selectedComp.value
  return c ? c.get('removable') !== false : false
})

const canCopy = computed(() => {
  const c = selectedComp.value
  return c ? c.get('copyable') !== false : false
})

const siblings = computed(() => {
  const c = selectedComp.value
  const p = c?.parent?.()
  return p ? p.components() : null
})

const canMoveUp = computed(() => {
  const s = siblings.value
  const c = selectedComp.value
  return !!(s && c && s.indexOf(c) > 0)
})

const canMoveDown = computed(() => {
  const s = siblings.value
  const c = selectedComp.value
  return !!(s && c && s.indexOf(c) < s.length - 1)
})

// ── Actions ───────────────────────────────────────────────────────────────────
function selectParent() {
  editor.value?.runCommand('core:component-exit')
}

function deleteComp() {
  if (canDelete.value) editor.value?.runCommand('core:component-delete')
}

function duplicateComp() {
  const ed = editor.value
  const c  = selectedComp.value
  if (!ed || !c || !canCopy.value) return
  ed.runCommand('core:copy')
  ed.runCommand('core:paste')
}

function moveUp() {
  const c = selectedComp.value
  const s = siblings.value
  if (!c || !s || !canMoveUp.value) return
  const idx = s.indexOf(c)
  const parent = c.parent()
  if (!parent) return
  c.move(parent, { at: idx - 1 })
  editor.value?.select(c)
}

function moveDown() {
  const c = selectedComp.value
  const s = siblings.value
  if (!c || !s || !canMoveDown.value) return
  const idx = s.indexOf(c)
  const parent = c.parent()
  if (!parent) return
  c.move(parent, { at: idx + 1 })
  editor.value?.select(c)
}

// ── GrapesJS event handlers ───────────────────────────────────────────────────
function onCanvasSpot() {
  const ed = editor.value
  if (!ed) return

  const s = ed.Canvas.getSpots().find((spot: CanvasSpot) => spot.type === 'select')

  if (!s) {
    visible.value = false
    return
  }

  // getStyle() returns { top: '12px', left: '34px', width: '200px', height: '80px', ... }
  const style = s.getStyle() as Record<string, string>
  spotLeft.value   = parseFloat(style.left)   || 0
  spotTop.value    = parseFloat(style.top)    || 0
  spotHeight.value = parseFloat(style.height) || 0

  selectedComp.value = ed.getSelected() ?? null
  visible.value      = !!selectedComp.value
}

function onDeselected() {
  selectedComp.value = null
  visible.value      = false
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
let _cleanup: (() => void) | null = null

watch(ready, (isReady) => {
  if (!isReady || !editor.value) return
  const ed = editor.value
  ed.on('canvas:spot',          onCanvasSpot)
  ed.on('component:deselected', onDeselected)
  _cleanup = () => {
    ed.off('canvas:spot',          onCanvasSpot)
    ed.off('component:deselected', onDeselected)
  }
}, { immediate: true })

onBeforeUnmount(() => { _cleanup?.() })
</script>

<template>
  <Transition name="ctb">
    <div
      v-if="visible"
      class="ctb"
      :style="toolbarStyle"
      @mousedown.stop
    >
      <!-- Select parent -->
      <button
        v-if="canSelectParent"
        class="ctb-btn ctb-parent"
        :title="`Select parent: ${parentName}`"
        @click.stop="selectParent"
      >
        <AppIcon icon="lucide:corner-left-up" :size="12" />
        <span class="ctb-parent-label">{{ parentName }}</span>
      </button>

      <div v-if="canSelectParent" class="ctb-sep" />

      <!-- Component name -->
      <span class="ctb-name">{{ componentName }}</span>

      <div class="ctb-sep" />

      <!-- Move up -->
      <button
        class="ctb-btn ctb-icon"
        :class="{ 'ctb-dim': !canMoveUp }"
        title="Move up"
        @click.stop="moveUp"
      >
        <AppIcon icon="lucide:chevron-up" :size="13" />
      </button>

      <!-- Move down -->
      <button
        class="ctb-btn ctb-icon"
        :class="{ 'ctb-dim': !canMoveDown }"
        title="Move down"
        @click.stop="moveDown"
      >
        <AppIcon icon="lucide:chevron-down" :size="13" />
      </button>

      <div class="ctb-sep" />

      <!-- Duplicate -->
      <button
        class="ctb-btn ctb-icon"
        :class="{ 'ctb-dim': !canCopy }"
        title="Duplicate"
        @click.stop="duplicateComp"
      >
        <AppIcon icon="lucide:copy" :size="13" />
      </button>

      <!-- Delete -->
      <button
        class="ctb-btn ctb-icon ctb-delete"
        :class="{ 'ctb-dim': !canDelete }"
        title="Delete"
        @click.stop="deleteComp"
      >
        <AppIcon icon="lucide:trash-2" :size="13" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Shell ───────────────────────────────────────────────────────────────── */
.ctb {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 4px;
  gap: 2px;
  background: var(--editor-surface-raised);
  border: 1px solid var(--editor-border-strong);
  border-radius: 7px;
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 6px 24px rgba(0, 0, 0, 0.45),
    0 2px 6px  rgba(0, 0, 0, 0.30);
  white-space: nowrap;
  user-select: none;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Component name label ────────────────────────────────────────────────── */
.ctb-name {
  padding: 0 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--editor-text);
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Separator ───────────────────────────────────────────────────────────── */
.ctb-sep {
  width: 1px;
  height: 14px;
  background: var(--editor-surface-border);
  margin: 0 2px;
  flex-shrink: 0;
}

/* ── Base button ─────────────────────────────────────────────────────────── */
.ctb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--editor-text-muted);
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  height: 22px;
  transition: background-color 0.12s, color 0.12s;
  flex-shrink: 0;
}
.ctb-btn:hover {
  background: var(--editor-surface-overlay);
  color: var(--editor-text);
}

/* ── Icon-only button (square) ───────────────────────────────────────────── */
.ctb-icon {
  width: 22px;
}

/* ── Parent breadcrumb button ────────────────────────────────────────────── */
.ctb-parent {
  gap: 4px;
  padding: 0 6px;
  max-width: 100px;
}
.ctb-parent-label {
  font-size: 11px;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--editor-text-muted);
}
.ctb-parent:hover .ctb-parent-label {
  color: var(--editor-text);
}

/* ── Delete button (danger hover) ────────────────────────────────────────── */
.ctb-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

/* ── Disabled state ──────────────────────────────────────────────────────── */
.ctb-dim {
  opacity: 0.28;
  pointer-events: none;
}

/* ── Enter / leave transition ────────────────────────────────────────────── */
.ctb-enter-active,
.ctb-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.ctb-enter-from,
.ctb-leave-to {
  opacity: 0;
  transform: translateY(3px) scale(0.97);
}
</style>
