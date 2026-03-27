import type { Editor } from 'grapesjs'
import { createBlockSuite, defineBlock } from '../registry'

const base = 'box-sizing:border-box;font-family:var(--font-body,system-ui,sans-serif);'

const basicUiSuite = createBlockSuite({
  blocks: [
    defineBlock('divider', {
      label: 'Divider',
      category: 'UI',
      media: 'lucide:separator-horizontal',
      content: `<hr style="${base}border:none;border-top:1px solid var(--color-border,#e5e7eb);margin:24px 0;" />`,
    }),

    defineBlock('spacer', {
      label: 'Spacer',
      category: 'UI',
      media: 'lucide:arrow-up-down',
      content: `<div style="${base}height:64px;"></div>`,
    }),
  ],
})

export function registerBasicUI(editor: Editor): void {
  basicUiSuite(editor)
}
