/**
 * useLayerTree — GrapesJS component tree as reactive LayerNode[]
 *
 * Manages:
 *  - Tree building from GrapesJS wrapper (rebuilds on bridge revisions)
 *  - Selection sync: canvas ↔ layer panel via bridge
 *  - Visibility toggle, expand/collapse (collapsedIds Set)
 *  - Component move with undo-manager-compatible collection ops
 */
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useEditorBridge } from '../bridge/useEditorBridge'
import { useEditor } from './useEditor'
import type { Component, Editor } from 'grapesjs'

// ── Public types ──────────────────────────────────────────────────────────────

export interface LayerNode {
  id: string
  label: string
  type: string
  tagName: string
  visible: boolean
  hasChildren: boolean
  children: LayerNode[]
}

export interface DropTarget {
  id: string
  position: 'before' | 'after' | 'inside'
}

export interface LayerDragContext {
  selectedId: Ref<string | null>
  collapsedIds: Ref<Set<string>>
  dragState: { draggingId: string | null; dropTarget: DropTarget | null }
  selectLayer: (id: string) => void
  toggleVisible: (id: string) => void
  toggleExpand: (id: string) => void
  onDragStart: (e: DragEvent, id: string) => void
  onDragOver: (e: DragEvent, node: LayerNode) => void
  onDrop: (targetId: string) => void
  onDragEnd: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type LayerApi = {
  getLayerData?: (cmp: Component) => {
    components?: Component[]
    name?: unknown
    visible?: unknown
    open?: unknown
    selected?: unknown
    hovered?: unknown
    locked?: unknown
  } | null
}

type ComponentWithMeta = Component & {
  getName?: () => string
  getType?: () => string
}

type DomComponentsApi = {
  getById?: (id: string) => Component | undefined
}

function getComponentMeta(cmp: Component): ComponentWithMeta {
  return cmp as ComponentWithMeta
}

function getComponentById(editor: Editor | null | undefined, id: string): Component | undefined {
  const domComponents = editor?.DomComponents as unknown as DomComponentsApi | undefined
  return domComponents?.getById?.(id)
}

function buildNode(cmp: Component, layerApi: LayerApi | undefined, visited = new Set<string>()): LayerNode {
  const id = cmp.getId()
  const meta = getComponentMeta(cmp)
  if (visited.has(id)) {
    return {
      id,
      label: meta.getName?.() || (cmp.get('tagName') as string | undefined) || 'div',
      type: meta.getType?.() ?? 'default',
      tagName: ((cmp.get('tagName') as string | undefined) ?? '').toLowerCase(),
      visible: true,
      hasChildren: false,
      children: [],
    }
  }

  const nextVisited = new Set(visited)
  nextVisited.add(id)
  const data = layerApi?.getLayerData?.(cmp)
  const childCmps = data?.components ?? (cmp.components().models as Component[])
  return {
    id,
    label: (data?.name as string) || meta.getName?.() || (cmp.get('tagName') as string | undefined) || 'div',
    type: meta.getType?.() ?? 'default',
    tagName: ((cmp.get('tagName') as string | undefined) ?? '').toLowerCase(),
    visible: (data?.visible as boolean) ?? true,
    hasChildren: childCmps.length > 0,
    children: childCmps.map(c => buildNode(c, layerApi, nextVisited)),
  }
}

function isAncestorOf(ancestor: Component, descendant: Component): boolean {
  let p = descendant.parent()
  while (p) {
    if (p === ancestor) return true
    p = p.parent()
  }
  return false
}

function expandSelectedAncestors(node: LayerNode, selectedId: string, collapsed: Set<string>): boolean {
  if (node.id === selectedId) return true

  let matchedDescendant = false
  for (const child of node.children) {
    if (expandSelectedAncestors(child, selectedId, collapsed)) {
      matchedDescendant = true
    }
  }

  if (matchedDescendant) {
    collapsed.delete(node.id)
  }

  return matchedDescendant
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useLayerTree() {
  const { editor } = useEditor()
  const bridge = useEditorBridge()

  const layers      = ref<LayerNode[]>([])
  const selectedId  = ref<string | null>(bridge.selectedComponentId.value)
  const collapsedIds = ref<Set<string>>(new Set())

  // Debounced rebuild — coalesces rapid layer refresh signals into one repaint
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null

  function syncSelectionState() {
    selectedId.value = bridge.selectedComponentId.value

    const currentSelectedId = selectedId.value
    if (!currentSelectedId || layers.value.length === 0) return

    const nextCollapsed = new Set(collapsedIds.value)
    let changed = false

    for (const node of layers.value) {
      if (expandSelectedAncestors(node, currentSelectedId, nextCollapsed)) {
        changed = true
      }
    }

    if (changed) {
      collapsedIds.value = nextCollapsed
    }
  }

  function scheduleRebuild() {
    if (rebuildTimer) clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => {
      rebuildTimer = null
      const wrapper = editor.value?.getWrapper()
      const layerApi = editor.value?.Layers as LayerApi | undefined
      layers.value = wrapper ? [buildNode(wrapper, layerApi)] : []
      syncSelectionState()
    }, 16)
  }

  watch(() => bridge.layersRevision.value, scheduleRebuild, { immediate: true })
  watch(() => bridge.selectionRevision.value, syncSelectionState, { immediate: true })

  // ── Actions ───────────────────────────────────────────────────────────────

  function selectLayer(id: string) {
    selectedId.value = id
    const cmp = getComponentById(editor.value, id)
    if (!cmp) return
    editor.value?.select(cmp)
    // Scroll the canvas to center the selected component
    editor.value?.Canvas.scrollTo(cmp, { behavior: 'smooth', block: 'center', inline: 'center' })
  }

  function toggleVisible(id: string) {
    const cmp = getComponentById(editor.value, id)
    if (!cmp) return
    const data = editor.value?.Layers.getLayerData(cmp)
    editor.value?.Layers.setVisible(cmp, !((data?.visible as boolean) ?? true))
  }

  function toggleExpand(id: string) {
    const next = new Set(collapsedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    collapsedIds.value = next
  }

  function moveLayer(srcId: string, dstId: string, position: 'before' | 'after' | 'inside') {
    const ed = editor.value
    if (!ed) return
    const src = getComponentById(ed, srcId)
    const dst = getComponentById(ed, dstId)
    if (!src || !dst || src === dst || isAncestorOf(src, dst)) return

    const newParent = position === 'inside' ? dst : dst.parent()
    if (!newParent) return
    const newComps = newParent.components()

    let newIdx =
      position === 'inside'  ? newComps.length :
      position === 'after'   ? newComps.indexOf(dst) + 1 :
      newComps.indexOf(dst)

    const oldParent = src.parent()
    if (oldParent === newParent) {
      const oldIdx = newComps.indexOf(src)
      if (oldIdx < newIdx) newIdx--
      if (oldIdx === newIdx) return
    }

    // Backbone collection ops are tracked by GrapesJS UndoManager
    oldParent?.components().remove(src)
    newComps.add(src, { at: newIdx })

    scheduleRebuild()
  }

  return { layers, selectedId, collapsedIds, selectLayer, toggleVisible, toggleExpand, moveLayer }
}
