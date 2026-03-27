import type { Editor } from 'grapesjs'
import type { Block } from 'grapesjs'

export type BlockTypeDefinition = Parameters<Editor['DomComponents']['addType']>[1]
export type BlockEntryDefinition = Parameters<Editor['BlockManager']['add']>[1]
export type RegisterOptions = { overwrite?: boolean }

export type BlockTypeRegistration = {
  type: string
  definition: BlockTypeDefinition
  options?: RegisterOptions
}

export type BlockRegistration = {
  id: string
  definition: BlockEntryDefinition
  options?: RegisterOptions
}

export type ComponentBlockRegistration = {
  type: string
  component: BlockTypeDefinition
  block?: Omit<BlockRegistration, 'definition'> & {
    definition: Omit<BlockEntryDefinition, 'content'> & { label: string }
  }
  options?: RegisterOptions
}

export type BlockSuiteDefinition = {
  types?: BlockTypeRegistration[]
  blocks?: BlockRegistration[]
  componentBlocks?: ComponentBlockRegistration[]
  setup?: (ctx: ReturnType<typeof createBlockRegistrar>) => void
}

function hasBlock(editor: Editor, id: string): boolean {
  return editor.Blocks.getAll().some((block: Block) => block.getId() === id)
}

export function createBlockRegistrar(editor: Editor) {
  function addType(type: string, definition: BlockTypeDefinition, opts?: { overwrite?: boolean }) {
    if (!opts?.overwrite && editor.DomComponents.getType(type)) return
    editor.DomComponents.addType(type, definition)
  }

  function addBlock(id: string, definition: BlockEntryDefinition, opts?: { overwrite?: boolean }) {
    if (!opts?.overwrite && hasBlock(editor, id)) return
    editor.Blocks.add(id, definition)
  }

  return {
    addType,
    addBlock,
  }
}

export function defineType(
  type: string,
  definition: BlockTypeDefinition,
  options?: RegisterOptions,
): BlockTypeRegistration {
  return { type, definition, options }
}

export function defineBlock(
  id: string,
  definition: BlockEntryDefinition,
  options?: RegisterOptions,
): BlockRegistration {
  return { id, definition, options }
}

export function defineComponentBlock(definition: ComponentBlockRegistration): ComponentBlockRegistration {
  return definition
}

export function createBlockSuite(definition: BlockSuiteDefinition) {
  return (editor: Editor) => {
    const registrar = createBlockRegistrar(editor)

    definition.types?.forEach(({ type, definition, options }) => {
      registrar.addType(type, definition, options)
    })

    definition.componentBlocks?.forEach(({ type, component, block, options }) => {
      registrar.addType(type, component, options)
      if (!block) return
      registrar.addBlock(
        block.id,
        {
          ...block.definition,
          content: { type },
        },
        block.options ?? options,
      )
    })

    definition.blocks?.forEach(({ id, definition, options }) => {
      registrar.addBlock(id, definition, options)
    })

    definition.setup?.(registrar)
  }
}
