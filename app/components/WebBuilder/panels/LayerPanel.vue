<script setup lang="ts">
/**
 * LayerPanel.vue — Layers tree container
 *
 * Owns all drag state; distributes it to LayerNode children via provide('layerCtx').
 * Tree data + selection + actions come from useLayerTree().
 */
import { reactive, ref, provide } from 'vue'
import { NInput } from 'naive-ui'
import { useLayerTree } from '../composables/useLayerTree'
import LayerNode from './LayerNode.vue'
import AppIcon from '../ui/AppIcon.vue'
import type { LayerDragContext, DropTarget, LayerNode as LayerNodeType } from '../composables/useLayerTree'

const panelEl = ref<HTMLElement | null>(null)
const search  = ref('')

const { layers, selectedId, collapsedIds, selectLayer, toggleVisible, toggleExpand, moveLayer } =
  useLayerTree()

// ── Drag state ────────────────────────────────────────────────────────────────

const dragState = reactive<{ draggingId: string | null; dropTarget: DropTarget | null }>({
  draggingId: null,
  dropTarget: null,
})

function onDragStart(e: DragEvent, id: string) {
  if (!e.dataTransfer) return
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', id)
  dragState.draggingId = id
}

function onDragOver(e: DragEvent, node: LayerNodeType) {
  if (!e.dataTransfer) return
  e.dataTransfer.dropEffect = 'move'

  const el    = e.currentTarget as HTMLElement
  const rect  = el.getBoundingClientRect()
  const ratio = (e.clientY - rect.top) / rect.height

  let position: 'before' | 'after' | 'inside'
  if (node.hasChildren && ratio > 0.25 && ratio < 0.75) position = 'inside'
  else if (ratio < 0.5)                                  position = 'before'
  else                                                   position = 'after'

  dragState.dropTarget = { id: node.id, position }
}

function onDrop(targetId: string) {
  if (!dragState.draggingId || !dragState.dropTarget) return
  if (dragState.dropTarget.id !== targetId) return
  moveLayer(dragState.draggingId, targetId, dragState.dropTarget.position)
  onDragEnd()
}

function onDragEnd() {
  dragState.draggingId = null
  dragState.dropTarget = null
}

function onPanelDragLeave(e: DragEvent) {
  const el = panelEl.value
  if (!el || !e.relatedTarget || !el.contains(e.relatedTarget as Node)) {
    dragState.dropTarget = null
  }
}

// ── Provide context ───────────────────────────────────────────────────────────

const ctx: LayerDragContext = {
  selectedId,
  collapsedIds,
  dragState,
  selectLayer,
  toggleVisible,
  toggleExpand,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}
provide('layerCtx', ctx)
</script>

<template>
  <div
    ref="panelEl"
    class="flex flex-col h-full overflow-hidden"
    @dragleave="onPanelDragLeave"
  >
    <!-- Search -->
    <div class="px-2 pt-2 pb-1.5 border-b border-[var(--editor-surface-border)] flex-shrink-0">
      <n-input v-model:value="search" size="small" placeholder="Search layers…" clearable>
        <template #prefix>
          <AppIcon icon="lucide:search" :size="12" class="text-[var(--editor-text-subtle)]" />
        </template>
      </n-input>
    </div>

    <!-- Empty state -->
    <div
      v-if="layers.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--editor-text-subtle)]"
    >
      <AppIcon icon="lucide:layers" :size="32" class="opacity-40" />
      <span class="text-[11px]">No components yet</span>
    </div>

    <!-- Tree -->
    <div v-else class="flex-1 overflow-y-auto overflow-x-hidden py-1">
      <LayerNode
        v-for="node in layers"
        :key="node.id"
        :node="node"
        :depth="0"
        :search="search"
      />
    </div>
  </div>
</template>
