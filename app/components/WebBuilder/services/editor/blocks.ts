import type { Component, Editor } from 'grapesjs'

export interface EditorBlockModel {
  getId: () => string
  getLabel: () => string
  getMedia: () => string | undefined
  get: (key: string) => unknown
}

export interface EditorBlockListItem {
  block: EditorBlockModel
  id: string
  label: string
  media?: string
  category: string
}

function resolveCategory(block: EditorBlockModel): string {
  const category = block.get('category')
  if (!category) return 'Basic'
  if (typeof category === 'string') return category || 'Basic'
  if (typeof category === 'object') {
    const model = category as { get?: (key: string) => unknown; label?: string; id?: string }
    if (typeof model.get === 'function') {
      return String(model.get('label') || model.get('id') || 'Basic')
    }
    return String(model.label ?? model.id ?? 'Basic')
  }
  return 'Basic'
}

export function listEditorBlocks(editor: Editor): EditorBlockListItem[] {
  return editor.Blocks.getAll().map((item: unknown) => {
    const block = item as EditorBlockModel
    return {
      block,
      id: block.getId(),
      label: block.getLabel(),
      media: block.getMedia(),
      category: resolveCategory(block),
    }
  })
}

export function toEditorBlockListItem(block: EditorBlockModel): EditorBlockListItem {
  return {
    block,
    id: block.getId(),
    label: block.getLabel(),
    media: block.getMedia(),
    category: resolveCategory(block),
  }
}

export function addBlockToSelection(editor: Editor, block: EditorBlockModel): void {
  const content = block.get('content')
  const selected = editor.getSelected()

  if (!selected) {
    const wrapper = editor.getWrapper()
    if (!wrapper) return
    const added = wrapper.append(content as string)
    if (added?.length) editor.select(added[0])
    return
  }

  if (canAcceptChild(selected, content)) {
    const added = selected.append(content as string)
    if (added?.length) editor.select(added[0])
    return
  }

  const parent = selected.parent()
  if (!parent) return
  const collection = parent.components() as unknown as {
    indexOf: (component: Component) => number
    add: (value: unknown, options?: { at?: number }) => Component | Component[]
  }
  const idx = collection.indexOf(selected)
  const added = collection.add(content, { at: idx + 1 })
  if (added) editor.select(Array.isArray(added) ? added[0] : added)
}

function canAcceptChild(target: Component, blockContent: unknown): boolean {
  const droppable = target.get('droppable')
  if (droppable === false) return false
  if (droppable === true || droppable == null) return true

  if (typeof droppable === 'string') {
    let type = ''
    if (typeof blockContent === 'object' && blockContent !== null && 'type' in blockContent) {
      type = (blockContent as { type: string }).type
    } else if (typeof blockContent === 'string') {
      const match = blockContent.match(/data-gjs-type="([^"]+)"/)
        || blockContent.match(/data-component-type="([^"]+)"/)
      type = match ? match[1] : ''
    }
    return type ? droppable.includes(type) : false
  }

  return true
}
