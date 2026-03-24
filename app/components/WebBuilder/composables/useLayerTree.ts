/**
 * useLayerTree — GrapesJS component tree as reactive LayerNode[]
 *
 * Manages:
 *  - Tree building from GrapesJS wrapper (rebuilds on layer events)
 *  - Selection sync: canvas ↔ layer panel
 *  - Visibility toggle, expand/collapse (collapsedIds Set)
 *  - Component move with undo-manager-compatible collection ops
 */
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useEditor } from './useEditor'
import type { Component } from 'grapesjs'

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

function buildNode(cmp: Component, layerApi: any, visited = new Set<string>()): LayerNode {
  const id = cmp.getId()
  if (visited.has(id)) {
    return {
      id,
      label: (cmp as any).getName?.() || (cmp as any).get?.('tagName') || 'div',
      type: (cmp as any).getType?.() ?? 'default',
      tagName: ((cmp as any).get?.('tagName') as string | undefined ?? '').toLowerCase(),
      visible: true,
      hasChildren: false,
      children: [],
    }
  }

  const nextVisited = new Set(visited)
  nextVisited.add(id)
  const data      = layerApi?.getLayerData(cmp)
  const childCmps = (data?.components as Component[]) ?? cmp.components().models as Component[]
  return {
    id,
    label:       (data?.name as string) || (cmp as any).getName?.() || (cmp as any).get?.('tagName') || 'div',
    type:        (cmp as any).getType?.() ?? 'default',
    tagName:     ((cmp as any).get?.('tagName') as string | undefined ?? '').toLowerCase(),
    visible:     (data?.visible as boolean) ?? true,
    hasChildren: childCmps.length > 0,
    children:    childCmps.map(c => buildNode(c, layerApi, nextVisited)),
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

// ── Composable ────────────────────────────────────────────────────────────────

export function useLayerTree() {
  const { editor, ready } = useEditor()

  const layers      = ref<LayerNode[]>([])
  const selectedId  = ref<string | null>(null)
  const collapsedIds = ref<Set<string>>(new Set())

  // Debounced rebuild — coalesces rapid layer:component events into one repaint
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleRebuild() {
    if (rebuildTimer) clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => {
      rebuildTimer = null
      const wrapper   = editor.value?.getWrapper()
      const layerApi  = editor.value?.Layers
      layers.value    = wrapper ? [buildNode(wrapper, layerApi)] : []
    }, 16)
  }

  function bindEvents() {
    const ed = editor.value
    if (!ed) return

    ed.on('layer:root',      scheduleRebuild)
    ed.on('layer:component', scheduleRebuild)

    ed.on('component:selected', (cmp: Component) => {
      selectedId.value = cmp.getId()

      // Expand all ancestor nodes so the selected row becomes visible in the tree
      const newCollapsed = new Set(collapsedIds.value)
      let changed = false
      let parent = cmp.parent()
      while (parent) {
        const pid = parent.getId()
        if (newCollapsed.has(pid)) { newCollapsed.delete(pid); changed = true }
        parent = parent.parent()
      }
      if (changed) collapsedIds.value = newCollapsed
    })
    ed.on('component:deselected', () => { selectedId.value = null })

    // Bootstrap
    scheduleRebuild()
    const sel = ed.getSelected()
    if (sel) selectedId.value = sel.getId()
  }

  watch(ready, r => { if (r) bindEvents() }, { immediate: true })

  // ── Actions ───────────────────────────────────────────────────────────────

  function selectLayer(id: string) {
    selectedId.value = id
    const cmp = (editor.value?.DomComponents as any)?.getById?.(id)
    if (!cmp) return
    editor.value?.select(cmp)
    // Scroll the canvas to center the selected component
    editor.value?.Canvas.scrollTo(cmp, { behavior: 'smooth', block: 'center', inline: 'center' })
  }

  function toggleVisible(id: string) {
    const cmp = (editor.value?.DomComponents as any)?.getById?.(id) as Component | undefined
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
    const src = (ed.DomComponents as any).getById?.(srcId) as Component | undefined
    const dst = (ed.DomComponents as any).getById?.(dstId) as Component | undefined
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
  }

  return { layers, selectedId, collapsedIds, selectLayer, toggleVisible, toggleExpand, moveLayer }
}
