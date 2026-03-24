<script setup lang="ts">
/**
 * BlockPanel.vue — Elementor-style block library
 *
 * Layout:
 *   ┌─ Search ────────────────────────────────────┐
 *   ├─ ▼ Category ────────────────────────────────┤
 *   │  ┌──────────┐  ┌──────────┐                 │
 *   │  │   icon   │  │   icon   │                 │
 *   │  │  label   │  │  label   │                 │
 *   │  └──────────┘  └──────────┘                 │
 *   └─────────────────────────────────────────────┘
 */
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useEditor } from '../composables/useEditor'
import AppIcon from '../ui/AppIcon.vue'
import { NCollapse, NCollapseItem } from 'naive-ui'
import {
  addBlockToSelection,
  listEditorBlocks,
  toEditorBlockListItem,
  type EditorBlockListItem,
  type EditorBlockModel,
} from '../services/editor/blocks'

const { editor, ready } = useEditor()

// ── State ─────────────────────────────────────────────────────────────────────
const blocks      = ref<EditorBlockListItem[]>([])
const search      = ref('')
const dragStartFn = ref<((b: EditorBlockModel) => void) | null>(null)
const dragStopFn  = ref<((b: EditorBlockModel) => void) | null>(null)

// ── Grouped + filtered ────────────────────────────────────────────────────────
const filteredBlocks = computed(() => {
  const q = search.value.toLowerCase().trim()
  return blocks.value.filter(b =>
    !q || b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q),
  )
})

const groupedBlocks = computed(() => {
  const groups: Record<string, EditorBlockListItem[]> = {}
  for (const b of filteredBlocks.value) {
    const cat = b.category || 'Basic'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(b)
  }
  return groups
})

function _syncBlocks() {
  if (!editor.value) return
  const bm = editor.value.Blocks
  dragStartFn.value = (b: EditorBlockModel) => bm.startDrag(b as never)
  dragStopFn.value  = (_b: EditorBlockModel) => bm.endDrag()
  blocks.value = listEditorBlocks(editor.value)
}

function onBlockCustom(props: { blocks: EditorBlockModel[]; dragStart: (b: EditorBlockModel) => void; dragStop: (b: EditorBlockModel) => void }) {
  dragStartFn.value = props.dragStart
  dragStopFn.value  = props.dragStop
  blocks.value = props.blocks.map(toEditorBlockListItem)
}

onMounted(() => {
  if (ready.value && editor.value) {
    editor.value.on('block:custom', onBlockCustom)
    _syncBlocks()
  } else {
    const stop = watch(ready, (r) => {
      if (r && editor.value) {
        editor.value.on('block:custom', onBlockCustom)
        _syncBlocks()
        stop()
      }
    })
  }
})

onBeforeUnmount(() => { editor.value?.off('block:custom', onBlockCustom) })

// ── Accordion ─────────────────────────────────────────────────────────────────
const expandedCategories = ref<string[]>([])

watch(groupedBlocks, (g) => {
  const cats = Object.keys(g)
  if (!cats.length) return
  if (search.value.trim()) {
    expandedCategories.value = [...cats]
  } else if (expandedCategories.value.length === 0) {
    expandedCategories.value = [...cats]
  }
}, { immediate: true })

// ── Click vs Drag ────────────────────────────────────────────────────────────
const CLICK_THRESHOLD = 5 // px — movement below this is a click
let pointerStart: { x: number; y: number } | null = null
let isDragging = false

function onPointerDown(block: EditorBlockModel, e: PointerEvent) {
  pointerStart = { x: e.clientX, y: e.clientY }
  isDragging = false
  dragStartFn.value?.(block)
}

function onPointerMove(e: PointerEvent) {
  if (!pointerStart || isDragging) return
  const dx = e.clientX - pointerStart.x
  const dy = e.clientY - pointerStart.y
  if (Math.abs(dx) > CLICK_THRESHOLD || Math.abs(dy) > CLICK_THRESHOLD) {
    isDragging = true
  }
}

function onPointerUp(block: EditorBlockModel) {
  dragStopFn.value?.(block)
  if (!isDragging && pointerStart) {
    addBlockToCanvas(block)
  }
  pointerStart = null
  isDragging = false
}

function addBlockToCanvas(block: EditorBlockModel) {
  if (!editor.value) return
  addBlockToSelection(editor.value, block)
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- ── Search ──────────────────────────────────────────────────────────── -->
    <div class="relative flex items-center px-[10px] pt-[10px] pb-2 flex-shrink-0 border-b border-[var(--editor-surface-border)]">
      <AppIcon
        icon="lucide:search"
        :size="13"
        class="absolute left-5 text-[var(--editor-text-subtle)] pointer-events-none"
      />
      <input
        v-model="search"
        placeholder="Search blocks…"
        class="w-full h-[34px] px-7 text-xs rounded-md
               bg-[var(--editor-input-bg)] border border-[var(--editor-input-border)]
               text-[var(--editor-text)] outline-none transition-colors box-border
               placeholder:text-[var(--editor-text-subtle)]
               focus:border-[var(--editor-accent)]"
      />
      <button
        v-if="search"
        class="absolute right-[18px] flex items-center border-0 bg-transparent
               cursor-pointer text-[var(--editor-text-muted)] p-0
               hover:text-[var(--editor-text)]"
        @click="search = ''"
      >
        <AppIcon icon="lucide:x" :size="12" />
      </button>
    </div>

    <!-- ── Block list ──────────────────────────────────────────────────────── -->
    <div class="flex-1 p-3 overflow-y-auto">

      <!-- Empty -->
      <div
        v-if="Object.keys(groupedBlocks).length === 0"
        class="flex flex-col items-center gap-2 mt-12 text-[var(--editor-text-subtle)]"
      >
        <AppIcon icon="lucide:package-search" :size="28" class="opacity-40" />
        <span class="text-xs">No blocks found</span>
      </div>

      <!-- Category groups -->
      <n-collapse
        v-model:expanded-names="expandedCategories"
        arrow-placement="right"
        class="style-panel-collapse"
      >
        <n-collapse-item
          v-for="(items, category) in groupedBlocks"
          :key="category"
          :name="(category as string)"
          :title="(category as string)"
        >
          <!-- 2-col grid -->
          <div class="grid grid-cols-2 gap-2 block-grid">
            <div
              v-for="b in items"
              :key="b.id"
              class="group flex flex-col items-center justify-center gap-2
                     pt-4 px-2 pb-3 rounded-lg min-h-[80px]
                     border border-[var(--editor-input-border)] bg-[var(--editor-input-bg)]
                     cursor-pointer select-none transition-all duration-150
                     hover:border-[var(--editor-accent-muted-border)]
                     hover:bg-[var(--editor-accent-subtle-hover)]
                     hover:shadow-[0_2px_8px_rgba(91,142,255,0.08)]
                     active:cursor-grabbing"
              :title="b.label"
              @pointerdown="onPointerDown(b.block, $event)"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp(b.block)"
              @pointercancel="onPointerUp(b.block)"
            >
              <AppIcon
                v-if="b.media"
                :icon="b.media"
                :size="20"
                class="text-[var(--editor-text-muted)] flex-shrink-0
                       transition-colors group-hover:text-[var(--editor-accent)]"
              />
              <AppIcon
                v-else
                icon="lucide:box"
                :size="20"
                class="text-[var(--editor-text-muted)] flex-shrink-0
                       transition-colors group-hover:text-[var(--editor-accent)]"
              />
              <span
                class="text-[11px] font-medium text-[var(--editor-text-muted)] text-center
                       leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis max-w-full
                       transition-colors group-hover:text-[var(--editor-text)]"
              >
                {{ b.label }}
              </span>
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>

    </div>
  </div>
</template>

<style scoped>
/* Thin line style: override lucide's default stroke-width="2" presentation attribute.
   Author CSS has higher precedence than SVG presentation attributes per the CSS cascade. */
.block-grid :deep(svg path),
.block-grid :deep(svg line),
.block-grid :deep(svg circle),
.block-grid :deep(svg rect),
.block-grid :deep(svg polyline),
.block-grid :deep(svg polygon),
.block-grid :deep(svg ellipse) {
  stroke-width: 1.25;
}
</style>
