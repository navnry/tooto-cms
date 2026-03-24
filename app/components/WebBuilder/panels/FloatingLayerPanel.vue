<script setup lang="ts">
/**
 * FloatingLayerPanel.vue — Draggable floating window that hosts the Layers tree.
 *
 * Rendered via <Teleport to="body"> so it sits above all editor layout layers.
 * Position is stored as { right, top } so it stays anchored to the right edge
 * regardless of window resize.
 */
import { onMounted } from 'vue'
import { useFloatingLayers } from '../composables/useFloatingLayers'
import LayerPanel from './LayerPanel.vue'
import AppIcon from '../ui/AppIcon.vue'

const PANEL_WIDTH = 288

const { isVisible, position, hide, initDefaultPosition, setPosition } = useFloatingLayers()

onMounted(() => {
  initDefaultPosition()
})

// ── Drag ─────────────────────────────────────────────────────────────────────
// We work in right-edge space: moving mouse right → right decreases.

let dragging     = false
let startMouseX  = 0
let startMouseY  = 0
let startRight   = 0
let startTop     = 0

function onDragStart(e: MouseEvent) {
  dragging    = true
  startMouseX = e.clientX
  startMouseY = e.clientY
  startRight  = position.right
  startTop    = position.top
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup',  onDragEnd)
  e.preventDefault()
}

function onDragMove(e: MouseEvent) {
  if (!dragging) return
  const dx = e.clientX - startMouseX
  const dy = e.clientY - startMouseY
  // Moving right (+dx) reduces the right offset; moving left increases it.
  const newRight = Math.max(0, Math.min(window.innerWidth - PANEL_WIDTH, startRight - dx))
  const newTop   = Math.max(0, Math.min(window.innerHeight - 60, startTop + dy))
  setPosition(newRight, newTop)
}

function onDragEnd() {
  dragging = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup',  onDragEnd)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-show="isVisible"
      class="floating-layer-panel"
      :style="{ right: position.right + 'px', top: position.top + 'px' }"
    >
      <!-- Header / drag handle -->
      <div class="floating-layer-panel__header" @mousedown="onDragStart">
        <AppIcon icon="lucide:layers" :size="13" class="floating-layer-panel__header-icon" />
        <span class="floating-layer-panel__title">Layers</span>
        <button
          class="floating-layer-panel__close"
          title="Close"
          @click="hide"
          @mousedown.stop
        >
          <AppIcon icon="lucide:x" :size="12" />
        </button>
      </div>

      <!-- Layer tree body -->
      <div class="floating-layer-panel__body">
        <LayerPanel />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.floating-layer-panel {
  position: fixed;
  z-index: 1000;
  width: 288px;
  height: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  /* Layered shadow for depth */
  box-shadow:
    0 2px 6px  rgba(0, 0, 0, 0.25),
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 0   0 1px rgba(255, 255, 255, 0.07);
  background: var(--editor-surface, #1a1a2e);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.floating-layer-panel__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.floating-layer-panel__header:active {
  cursor: grabbing;
}

.floating-layer-panel__header-icon {
  color: var(--editor-text-muted);
  flex-shrink: 0;
}

.floating-layer-panel__title {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--editor-text-muted);
}

.floating-layer-panel__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--editor-text-subtle, #888);
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.floating-layer-panel__close:hover {
  color: var(--editor-text);
  background: var(--editor-surface-overlay);
}

/* ── Body ─────────────────────────────────────────────────────────────────── */
.floating-layer-panel__body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>
