import type { Editor } from 'grapesjs'
import { FOOTER_BLOCK_ICON, TYPE_FOOTER } from './constants'
import { FOOTER_HTML } from './markup'
import { FOOTER_STYLES } from './styles'

export function registerFooter(editor: Editor): void {
  const { DomComponents, BlockManager } = editor

  DomComponents.addType(TYPE_FOOTER, {
    isComponent: (el: HTMLElement) =>
      el.tagName === 'FOOTER' && el.classList?.contains('gjs-footer')
        ? { type: TYPE_FOOTER }
        : undefined,

    model: {
      defaults: {
        name: 'Footer',
        tagName: 'footer',
        draggable: true,
        droppable: false,
        styles: FOOTER_STYLES,
        components: FOOTER_HTML,
      },
    },
  })

  BlockManager.add('footer-section', {
    label: 'Footer',
    category: 'Navigation',
    media: FOOTER_BLOCK_ICON,
    content: { type: TYPE_FOOTER },
  })
}
