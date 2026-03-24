import type { Component, Editor } from 'grapesjs'

export interface LayerSnapshot {
  name: string
  children: unknown[]
  visible: boolean
  open: boolean
  selected: boolean
  hovered: boolean
  locked: boolean
}

export function getLayerSnapshot(editor: Editor, component: Component): LayerSnapshot | null {
  const data = editor.Layers.getLayerData(component)
  if (!data) return null
  return {
    name: (data.name as string) || '',
    children: (data.components as unknown[]) ?? [],
    visible: (data.visible as boolean) ?? true,
    open: (data.open as boolean) ?? false,
    selected: (data.selected as boolean) ?? false,
    hovered: (data.hovered as boolean) ?? false,
    locked: (data.locked as boolean) ?? false,
  }
}

export function setLayerSelected(editor: Editor, component: Component, event: MouseEvent): void {
  editor.Layers.setLayerData(component, { selected: true }, { event })
}

export function setLayerHovered(editor: Editor, component: Component, hovered: boolean): void {
  editor.Layers.setLayerData(component, { hovered })
}

export function setLayerVisible(editor: Editor, component: Component, visible: boolean): void {
  editor.Layers.setVisible(component, visible)
}

export function setLayerOpen(editor: Editor, component: Component, open: boolean): void {
  editor.Layers.setOpen(component, open)
}

export function setLayerLocked(editor: Editor, component: Component, locked: boolean): void {
  editor.Layers.setLayerData(component, { locked })
}

export function duplicateLayer(component: Component): void {
  const parent = component.parent()
  if (!parent) return
  const idx = parent.components().indexOf(component)
  parent.components().add(component.clone(), { at: idx + 1 })
}

export function moveLayerComponent(src: Component, dst: Component, position: 'before' | 'after' | 'inside'): void {
  if (src === dst || isAncestorOf(src, dst)) return

  const newParent = position === 'inside' ? dst : dst.parent()
  if (!newParent) return
  const newComps = newParent.components()
  let newIdx =
    position === 'inside' ? newComps.length :
    newComps.indexOf(dst) + (position === 'after' ? 1 : 0)

  const oldParent = src.parent()
  if (oldParent === newParent) {
    const oldIdx = newComps.indexOf(src)
    if (oldIdx < newIdx) newIdx--
    if (oldIdx === newIdx) return
  }

  oldParent?.components().remove(src)
  newComps.add(src, { at: newIdx })
}

export function isAncestorOf(ancestor: Component, descendant: Component): boolean {
  let parent = descendant.parent()
  while (parent) {
    if (parent === ancestor) return true
    parent = parent.parent()
  }
  return false
}
