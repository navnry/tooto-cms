<script setup lang="ts">
/**
 * LayerNode.vue — recursive layer row
 *
 * Receives all state and actions via inject('layerCtx').
 * Pure presentational component — no GrapesJS dependency.
 *
 * Features:
 *  - Drag-and-drop (before / after / inside) via context handlers
 *  - Scroll into view when selected from canvas
 *  - Inline double-click rename
 *  - Visibility toggle (eye, shown on hover / when hidden)
 *  - Type icon derived from type + tagName
 *  - Search highlight + tree filtering
 */
import { computed, inject, ref, watch, nextTick } from 'vue'
import { NDropdown } from 'naive-ui'
import type { LayerNode as LayerNodeType, LayerDragContext } from '../composables/useLayerTree'
import { useEditor } from '../composables/useEditor'
import AppIcon from '../ui/AppIcon.vue'

const props = defineProps<{
  node: LayerNodeType
  depth: number
  search?: string
}>()

const ctx    = inject<LayerDragContext>('layerCtx')!
const { editor } = useEditor()
const rowEl  = ref<HTMLElement | null>(null)
const contextMenuTrigger = 'contextmenu' as unknown as 'hover'

// ── Scroll into view when selected from canvas ────────────────────────────────
// immediate: true handles the case where this node just mounted because an
// ancestor was expanded (collapsedIds updated) — selectedId is already set.
watch(
  () => ctx.selectedId.value === props.node.id,
  isSelected => {
    if (isSelected) {
      void nextTick(() => {
        rowEl.value?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
    }
  },
  { immediate: true },
)

// ── Type icon ─────────────────────────────────────────────────────────────────
const typeIcon = computed((): string => {
  const { type, tagName: tag } = props.node

  if (type === 'text' || tag === 'p' || tag === 'span' ||
      tag === 'h1' || tag === 'h2' || tag === 'h3' ||
      tag === 'h4' || tag === 'h5' || tag === 'h6')   return 'lucide:type'
  if (type === 'image' || tag === 'img')               return 'lucide:image'
  if (type === 'link'  || tag === 'a')                 return 'lucide:link'
  if (type === 'video' || tag === 'video')             return 'lucide:video'
  if (tag === 'button')                                return 'lucide:mouse-pointer-click'
  if (tag === 'input' || tag === 'textarea')           return 'lucide:text-cursor-input'
  if (tag === 'form')                                  return 'lucide:clipboard-list'
  if (tag === 'ul' || tag === 'ol')                    return 'lucide:list'
  if (tag === 'li')                                    return 'lucide:minus'
  if (tag === 'section' || tag === 'article' ||
      tag === 'main'    || tag === 'header'  ||
      tag === 'footer'  || tag === 'nav')              return 'lucide:layout-panel-top'
  if (tag === 'table')                                 return 'lucide:table-2'
  if (tag === 'iframe')                                return 'lucide:frame'
  return 'lucide:square-dashed'
})

// ── Search filter ─────────────────────────────────────────────────────────────
function nodeOrDescendantMatches(node: LayerNodeType, q: string): boolean {
  if (node.label.toLowerCase().includes(q)) return true
  return node.children.some(c => nodeOrDescendantMatches(c, q))
}

const q = computed(() => props.search?.trim().toLowerCase() ?? '')

const isVisible = computed(() => {
  if (!q.value) return true
  return nodeOrDescendantMatches(props.node, q.value)
})

const selfMatches = computed(() =>
  !q.value || props.node.label.toLowerCase().includes(q.value)
)

// Auto-expand ancestors when search is active
const isExpanded = computed(() => {
  if (ctx.collapsedIds.value.has(props.node.id)) {
    // If searching and has matching descendants, force expand
    if (q.value && props.node.children.some(c => nodeOrDescendantMatches(c, q.value)))
      return true
    return false
  }
  return true
})

// ── Inline rename ─────────────────────────────────────────────────────────────
const editing    = ref(false)
const editValue  = ref('')
const renameInput = ref<HTMLInputElement | null>(null)

function startRename() {
  editValue.value = props.node.label
  editing.value   = true
  void nextTick(() => {
    renameInput.value?.focus()
    renameInput.value?.select()
  })
}
function commitRename() {
  const v = editValue.value.trim()
  if (v && v !== props.node.label) {
    editor.value?.DomComponents.getById(props.node.id)?.setName(v)
  }
  editing.value = false
}
function cancelRename() { editing.value = false }

// ── Context menu ──────────────────────────────────────────────────────────────
const contextOptions = computed(() => [
  { label: 'Rename',    key: 'rename'    },
  { label: 'Duplicate', key: 'duplicate' },
  { type: 'divider', key: 'd1' },
  { label: props.node.visible ? 'Hide' : 'Show', key: 'toggle-visible' },
  { type: 'divider', key: 'd2' },
  { label: 'Delete', key: 'delete', props: { style: 'color:#f87171' } },
])

function onContextSelect(key: string) {
  const cmp = editor.value?.DomComponents.getById(props.node.id)
  if (!cmp) return
  if      (key === 'rename')         startRename()
  else if (key === 'duplicate') {
    const parent = cmp.parent()
    if (parent) {
      const idx   = parent.components().indexOf(cmp)
      const clone = cmp.clone()
      parent.components().add(clone, { at: idx + 1 })
    }
  }
  else if (key === 'toggle-visible') ctx.toggleVisible(props.node.id)
  else if (key === 'delete')         cmp.remove()
}
</script>

<template>
  <div v-if="isVisible" class="layer-node">
    <n-dropdown :trigger="contextMenuTrigger" :options="contextOptions" @select="onContextSelect">
      <div
        ref="rowEl"
        class="layer-row"
        :class="{
          'is-selected': ctx.selectedId.value === node.id,
          'is-hidden':   !node.visible,
          'is-dragging': ctx.dragState.draggingId === node.id,
          'drop-before': ctx.dragState.dropTarget?.id === node.id && ctx.dragState.dropTarget.position === 'before',
          'drop-inside': ctx.dragState.dropTarget?.id === node.id && ctx.dragState.dropTarget.position === 'inside',
          'drop-after':  ctx.dragState.dropTarget?.id === node.id && ctx.dragState.dropTarget.position === 'after',
        }"
        :style="{ paddingLeft: `${8 + depth * 14}px`, '--indent': `${8 + depth * 14}px` }"
        draggable="true"
        @click="ctx.selectLayer(node.id)"
        @dblclick.stop="startRename"
        @dragstart.stop="ctx.onDragStart($event, node.id)"
        @dragover.prevent.stop="ctx.onDragOver($event, node)"
        @drop.prevent.stop="ctx.onDrop(node.id)"
        @dragend.stop="ctx.onDragEnd()"
      >
        <!-- Expand toggle -->
        <button
          v-if="node.hasChildren"
          class="layer-btn layer-expand"
          :class="{ 'is-expanded': isExpanded }"
          title="Expand/collapse"
          @click.stop="ctx.toggleExpand(node.id)"
        >
          <AppIcon icon="lucide:chevron-right" :size="11" />
        </button>
        <span v-else class="layer-expand-spacer" />

        <!-- Type icon -->
        <span class="layer-icon">
          <AppIcon :icon="typeIcon" :size="12" />
        </span>

        <!-- Label / rename input -->
        <span v-if="!editing" class="layer-label">
          <mark v-if="q && selfMatches" class="layer-mark">{{ node.label }}</mark>
          <template v-else>{{ node.label }}</template>
        </span>
        <input
          v-else
          ref="renameInput"
          v-model="editValue"
          class="layer-rename-input"
          @blur="commitRename"
          @keydown.enter.stop="commitRename"
          @keydown.escape.stop="cancelRename"
          @click.stop
        />

        <!-- Visibility toggle -->
        <button
          class="layer-btn layer-eye"
          :class="{ 'is-always-visible': !node.visible }"
          :title="node.visible ? 'Hide' : 'Show'"
          @click.stop="ctx.toggleVisible(node.id)"
        >
          <AppIcon :icon="node.visible ? 'lucide:eye' : 'lucide:eye-off'" :size="11" />
        </button>
      </div>
    </n-dropdown>

    <!-- Children (recursive) -->
    <div v-if="node.hasChildren && isExpanded" class="layer-children">
      <LayerNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :search="search"
      />
    </div>
  </div>
</template>

<style scoped>
.layer-row {
  display: flex;
  align-items: center;
  height: 26px;
  gap: 3px;
  cursor: pointer;
  position: relative;
  user-select: none;
  border-radius: 4px;
  margin: 0 4px;
  padding-right: 4px;
  transition: background 0.08s;
  /* Reserve space for drop-line pseudo-elements */
  box-sizing: border-box;
}

.layer-row:hover                { background: var(--editor-surface-overlay); }
.layer-row.is-selected          { background: rgba(34, 81, 255, 0.18); }
.layer-row.is-selected:hover    { background: rgba(34, 81, 255, 0.22); }
.layer-row.is-dragging          { opacity: 0.35; cursor: grabbing; }

/* ── Drop indicators ── */
.layer-row.drop-before::before,
.layer-row.drop-after::after {
  content: '';
  position: absolute;
  left: var(--indent, 4px);
  right: 4px;
  height: 2px;
  background: var(--editor-accent);
  border-radius: 1px;
  z-index: 10;
  pointer-events: none;
}
.layer-row.drop-before::before { top: -1px; }
.layer-row.drop-after::after   { bottom: -1px; }
.layer-row.drop-inside {
  outline: 1.5px solid var(--editor-accent);
  outline-offset: -1px;
  background: rgba(34, 81, 255, 0.08) !important;
}

/* ── Expand button ── */
.layer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--editor-text-subtle);
  border-radius: 3px;
  flex-shrink: 0;
  padding: 0;
  transition: color 0.1s, background 0.1s;
}
.layer-btn:hover { color: var(--editor-text); background: var(--editor-surface-overlay); }

.layer-expand { transition: transform 0.15s, color 0.1s; }
.layer-expand.is-expanded { transform: rotate(90deg); }
.layer-expand-spacer { width: 18px; flex-shrink: 0; }

/* ── Type icon ── */
.layer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  flex-shrink: 0;
  color: var(--editor-text-subtle);
}
.is-selected .layer-icon { color: var(--editor-accent); }

/* ── Label ── */
.layer-label {
  flex: 1;
  font-size: 12px;
  color: var(--editor-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.is-selected .layer-label { color: var(--editor-text); font-weight: 500; }
.is-hidden   .layer-label { opacity: 0.4; }

/* ── Search highlight ── */
.layer-mark {
  background: rgba(251, 191, 36, 0.22);
  color: #fbbf24;
  border-radius: 2px;
  padding: 0 2px;
  font-style: normal;
}

/* ── Rename input ── */
.layer-rename-input {
  flex: 1;
  min-width: 0;
  height: 20px;
  padding: 0 4px;
  font-size: 12px;
  font-family: inherit;
  background: var(--editor-input-bg);
  color: var(--editor-text);
  border: 1px solid var(--editor-accent);
  border-radius: 3px;
  outline: none;
}

/* ── Eye button ── */
.layer-eye {
  opacity: 0;
  transition: opacity 0.1s, color 0.1s;
}
.layer-row:hover .layer-eye,
.layer-eye.is-always-visible { opacity: 1; }
.layer-eye.is-always-visible { color: var(--editor-text-subtle); }
</style>
