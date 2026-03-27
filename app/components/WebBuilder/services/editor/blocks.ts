import type { Block, Component, ComponentAdd, Editor } from 'grapesjs'

export type EditorBlockModel = Block

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

function resolveMedia(block: EditorBlockModel): string | undefined {
  const media = block.getMedia()
  return typeof media === 'string' ? media : undefined
}

function resolveContent(block: EditorBlockModel): ComponentAdd | null {
  const content = block.getContent()
  const resolved = typeof content === 'function' ? content() : content
  return resolved ?? null
}

export function listEditorBlocks(editor: Editor): EditorBlockListItem[] {
  return editor.Blocks.getAll().map((item: unknown) => {
    const block = item as EditorBlockModel
    return {
      block,
      id: block.getId(),
      label: block.getLabel(),
      media: resolveMedia(block),
      category: resolveCategory(block),
    }
  })
}

export function toEditorBlockListItem(block: EditorBlockModel): EditorBlockListItem {
  return {
    block,
    id: block.getId(),
    label: block.getLabel(),
    media: resolveMedia(block),
    category: resolveCategory(block),
  }
}

export function addBlockToSelection(editor: Editor, block: EditorBlockModel): void {
  const content = resolveContent(block)
  if (!content) return

  const selected = editor.getSelected()

  if (!selected) {
    const wrapper = editor.getWrapper()
    if (!wrapper) return
    const added = wrapper.append(content)
    if (added?.length) editor.select(added[0])
    return
  }

  if (canAcceptChild(selected, content)) {
    const added = selected.append(content)
    if (added?.length) editor.select(added[0])
    return
  }

  const parent = selected.parent()
  if (!parent) return
  const idx = parent.components().indexOf(selected)
  const added = parent.append(content, { at: idx + 1 })
  if (added.length) editor.select(added[0])
}

function resolveBlockType(blockContent: ComponentAdd): string {
  const sample = Array.isArray(blockContent) ? blockContent[0] : blockContent
  if (!sample) return ''

  if (typeof sample === 'string') {
    const match = sample.match(/data-gjs-type="([^"]+)"/)
      || sample.match(/data-component-type="([^"]+)"/)
    return match ? match[1] : ''
  }

  if (typeof sample === 'object') {
    const candidate = sample as { type?: unknown; get?: (key: string) => unknown }
    if (typeof candidate.type === 'string') return candidate.type
    if (typeof candidate.get === 'function') {
      const type = candidate.get('type')
      if (typeof type === 'string') return type
    }
  }

  return ''
}

function canAcceptChild(target: Component, blockContent: ComponentAdd): boolean {
  const droppable = target.get('droppable')
  if (droppable === false) return false
  if (droppable === true || droppable == null) return true

  if (typeof droppable === 'string') {
    const type = resolveBlockType(blockContent)
    return type ? droppable.includes(type) : false
  }

  return true
}
