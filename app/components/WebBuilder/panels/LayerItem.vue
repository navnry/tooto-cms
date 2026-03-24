<script setup lang="ts">
/**
 * LayerItem.vue — recursive layer row with drag-and-drop reordering
 *
 * Drag-and-drop:
 *   - HTML5 drag API, draggable on every row
 *   - Drop zones: before / after / inside (reparent)
 *   - Any-level, any-parent moves — mirroring official GrapesJS behaviour
 *   - `dragSrc` shared via LAYER_CTX so all items know what is in flight
 *
 * Theme:
 *   - Uses CSS vars (--editor-*) exclusively — no hardcoded dark colours
 *
 * Performance:
 *   - Single `layer:component` listener in LayerPanel → LAYER_CTX.tick
 */
import { ref, computed, inject, watch, nextTick, onMounted } from 'vue'
import { NDropdown } from 'naive-ui'
import { useEditor } from '../composables/useEditor'
import type { Component } from 'grapesjs'
import AppIcon from '../ui/AppIcon.vue'
import { LAYER_CTX } from './layerContext'
import {
  duplicateLayer,
  getLayerSnapshot,
  isAncestorOf,
  moveLayerComponent,
  setLayerHovered,
  setLayerLocked,
  setLayerOpen,
  setLayerSelected,
  setLayerVisible,
} from '../services/editor/layers'

const props = defineProps<{
  component: unknown
  level: number
  search?: string
}>()

const { editor } = useEditor()
const layerCtx = inject(LAYER_CTX)!
const contextMenuTrigger = 'contextmenu' as unknown as 'hover'
const component = computed(() => props.component as Component)

// ── Layer state ───────────────────────────────────────────────────────────────
const name     = ref('')
const children = ref<unknown[]>([])
const visible  = ref(true)
const open     = ref(false)
const selected = ref(false)
const hovered  = ref(false)
const locked   = ref(false)

function loadData() {
  if (!editor.value) return
  const snapshot = getLayerSnapshot(editor.value, component.value)
  if (!snapshot) return
  name.value = snapshot.name
  children.value = snapshot.children
  visible.value = snapshot.visible
  open.value = snapshot.open
  selected.value = snapshot.selected
  hovered.value = snapshot.hovered
  locked.value = snapshot.locked
}

onMounted(loadData)

watch(() => layerCtx.tick.value, () => {
  if (layerCtx.updatedCmp.value === component.value) loadData()
})

// ── Type icon ─────────────────────────────────────────────────────────────────
const TYPE_ICON: Record<string, string> = {
  text:  'lucide:type',
  image: 'lucide:image',
  video: 'lucide:video',
  link:  'lucide:external-link',
  svg:   'lucide:pentagon',
  table: 'lucide:table-2',
  cell:  'lucide:table-2',
  row:   'lucide:rows-3',
}
const TAG_ICON: Record<string, string> = {
  div:      'lucide:square',
  section:  'lucide:layout-template',
  article:  'lucide:newspaper',
  header:   'lucide:panel-top',
  footer:   'lucide:panel-bottom',
  nav:      'lucide:navigation-2',
  main:     'lucide:monitor',
  aside:    'lucide:sidebar',
  ul:       'lucide:list',
  ol:       'lucide:list-ordered',
  li:       'lucide:minus',
  button:   'lucide:mouse-pointer-click',
  a:        'lucide:link',
  img:      'lucide:image',
  input:    'lucide:text-cursor-input',
  textarea: 'lucide:align-left',
  form:     'lucide:clipboard-list',
  p:        'lucide:pilcrow',
  h1:       'lucide:heading-1',
  h2:       'lucide:heading-2',
  h3:       'lucide:heading-3',
  h4:       'lucide:heading-4',
  h5:       'lucide:heading-5',
  h6:       'lucide:heading-6',
  span:     'lucide:baseline',
  table:    'lucide:table-2',
  iframe:   'lucide:frame',
}

const typeIcon = computed((): string => {
  const cmp = component.value
  const type = cmp.getType()
  const tag = cmp.tagName.toLowerCase()
  return TYPE_ICON[type] ?? TAG_ICON[tag] ?? 'lucide:box'
})

// ── Search ────────────────────────────────────────────────────────────────────
function descendantMatches(cmp: Component, q: string, visited = new Set<string>()): boolean {
  const id = cmp.getId()
  if (visited.has(id)) return false
  const nextVisited = new Set(visited)
  nextVisited.add(id)
  const data = editor.value?.Layers.getLayerData(cmp)
  if (!data) return false
  if ((data.name || '').toLowerCase().includes(q)) return true
  return data.components.some(c => descendantMatches(c, q, nextVisited))
}

const selfMatches = computed(() => {
  const q = props.search?.toLowerCase() ?? ''
  return !q || name.value.toLowerCase().includes(q)
})

const isVisible = computed(() => {
  const q = props.search?.toLowerCase() ?? ''
  if (!q) return true
  if (selfMatches.value) return true
  return children.value.some((c) => descendantMatches(c as Component, q))
})

const showChildren = computed(() => {
  if (!children.value.length) return false
  if (open.value) return true
  const q = props.search?.toLowerCase() ?? ''
  return !!q && children.value.some((c) => descendantMatches(c as Component, q))
})

// ── Actions ───────────────────────────────────────────────────────────────────
function select(e: MouseEvent) {
  if (!editor.value) return
  setLayerSelected(editor.value, component.value, e)
}
function setHovered(val: boolean) {
  if (!editor.value) return
  setLayerHovered(editor.value, component.value, val)
}
function toggleVisibility(e: MouseEvent) {
  e.stopPropagation()
  if (!editor.value) return
  setLayerVisible(editor.value, component.value, !visible.value)
}
function toggleOpen(e: MouseEvent) {
  e.stopPropagation()
  if (!editor.value) return
  setLayerOpen(editor.value, component.value, !open.value)
}
function toggleLock() {
  if (!editor.value) return
  setLayerLocked(editor.value, component.value, !locked.value)
}
function duplicate() {
  duplicateLayer(component.value)
}
function deleteComponent() {
  component.value.remove()
}

// ── Inline rename ─────────────────────────────────────────────────────────────
const editing     = ref(false)
const editValue   = ref('')
const renameInput = ref<HTMLInputElement | null>(null)

function startRename() {
  editValue.value = name.value
  editing.value   = true
  void nextTick(() => {
    renameInput.value?.focus()
    renameInput.value?.select()
  })
}
function commitRename() {
  const v = editValue.value.trim()
  if (v && v !== name.value) component.value.setName(v)
  editing.value = false
}
function cancelRename() { editing.value = false }

// ── Context menu ──────────────────────────────────────────────────────────────
const contextOptions = computed(() => [
  { label: 'Rename',    key: 'rename'    },
  { label: 'Duplicate', key: 'duplicate' },
  { type: 'divider', key: 'd1' },
  { label: locked.value  ? 'Unlock' : 'Lock', key: 'toggle-lock'       },
  { label: visible.value ? 'Hide'   : 'Show', key: 'toggle-visibility' },
  { type: 'divider', key: 'd2' },
  { label: 'Delete', key: 'delete', props: { style: 'color:#f87171' } },
])

function onContextSelect(key: string) {
  if      (key === 'rename')            startRename()
  else if (key === 'duplicate')         duplicate()
  else if (key === 'toggle-lock')       toggleLock()
  else if (key === 'toggle-visibility') toggleVisibility(new MouseEvent('click'))
  else if (key === 'delete')            deleteComponent()
}

// ── Drag-and-drop ─────────────────────────────────────────────────────────────
type DropPos = 'before' | 'after' | 'inside'
const dropPos = ref<DropPos | null>(null)

function onDragStart(e: DragEvent) {
  e.stopPropagation()
  layerCtx.dragSrc.value = component.value
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', component.value.getId())
  }
}
function onDragEnd() {
  layerCtx.dragSrc.value = null
  dropPos.value = null
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  const src = layerCtx.dragSrc.value
  if (!src || src === component.value || isAncestorOf(src, component.value)) return
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'

  const el   = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const relY = (e.clientY - rect.top) / rect.height

  // Allow 'inside' only for containers (components that have or can have children)
  const isContainer = children.value.length > 0 ||
    component.value.get('droppable') !== false

  if (relY < 0.3)      dropPos.value = 'before'
  else if (relY > 0.7) dropPos.value = 'after'
  else                 dropPos.value = isContainer ? 'inside' : (relY < 0.5 ? 'before' : 'after')
}

function onDragLeave(e: DragEvent) {
  // Only clear when truly exiting the row (not entering a child element)
  const related = e.relatedTarget as Node | null
  if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
    dropPos.value = null
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  const src = layerCtx.dragSrc.value
  if (!src || !dropPos.value) return
  moveComponent(src, component.value, dropPos.value)
  dropPos.value = null
  layerCtx.dragSrc.value = null
}

function moveComponent(src: Component, dst: Component, pos: DropPos) {
  moveLayerComponent(src, dst, pos)
}

const isDragging = computed(() => layerCtx.dragSrc.value === component.value)

function getChildId(child: unknown): string {
  return (child as Component).getId()
}
</script>

<template>
  <div v-if="isVisible">
    <n-dropdown :trigger="contextMenuTrigger" :options="contextOptions" @select="onContextSelect">
      <div
        draggable="true"
        :style="{ paddingLeft: `${6 + level * 14}px` }"
        :class="[
          'layer-row',
          selected  ? 'layer-row--selected'  : '',
          hovered   ? 'layer-row--hovered'   : '',
          isDragging? 'layer-row--dragging'  : '',
          dropPos === 'before' ? 'layer-row--drop-before' : '',
          dropPos === 'after'  ? 'layer-row--drop-after'  : '',
          dropPos === 'inside' ? 'layer-row--drop-inside' : '',
          locked ? 'opacity-50' : '',
        ]"
        @click="select($event)"
        @dblclick.stop="startRename"
        @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <!-- Expand toggle -->
        <span
          :class="[
            'w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center',
            children.length ? 'cursor-pointer hover:opacity-100 opacity-50' : 'pointer-events-none',
          ]"
          @click.stop="children.length ? toggleOpen($event) : undefined"
        >
          <AppIcon
            v-if="children.length"
            :icon="showChildren ? 'lucide:chevron-down' : 'lucide:chevron-right'"
            :size="11"
          />
        </span>

        <!-- Type icon -->
        <span class="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center opacity-35">
          <AppIcon :icon="typeIcon" :size="11" />
        </span>

        <!-- Name / rename input -->
        <span v-if="!editing" class="flex-1 truncate min-w-0">
          <mark
            v-if="search && selfMatches"
            class="layer-search-mark"
          >{{ name }}</mark>
          <template v-else>{{ name }}</template>
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

        <!-- Lock badge -->
        <span v-if="locked" class="flex-shrink-0 flex items-center opacity-60 text-amber-400">
          <AppIcon icon="lucide:lock" :size="10" />
        </span>

        <!-- Hover actions -->
        <span
          v-if="!editing"
          :class="[
            'layer-row-actions flex-shrink-0 flex items-center gap-0.5',
            selected ? 'opacity-100' : '',
          ]"
        >
          <button
            type="button"
            :title="visible ? 'Hide' : 'Show'"
            class="layer-action-btn"
            @click.stop="toggleVisibility($event)"
          >
            <AppIcon :icon="visible ? 'lucide:eye' : 'lucide:eye-off'" :size="11" />
          </button>
        </span>
      </div>
    </n-dropdown>

    <!-- Children -->
    <template v-if="showChildren">
      <LayerItem
        v-for="child in children"
        :key="getChildId(child)"
        :component="child"
        :level="level + 1"
        :search="search"
      />
    </template>
  </div>
</template>
