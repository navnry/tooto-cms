import type { Editor } from 'grapesjs'
import { LOGO_BLOCK_ICON, LOGO_STYLES, TYPE_LOGO } from './styles'
import { createBlockSuite, defineComponentBlock } from '../registry'

export function registerLogo(editor: Editor): void {
  createBlockSuite({
    componentBlocks: [
      defineComponentBlock({
        type: TYPE_LOGO,
        component: {
          isComponent: (el: HTMLElement) =>
            el.classList?.contains('gjs-logo') ? { type: TYPE_LOGO } : undefined,
          extend: 'link',
          model: {
            defaults: {
              name: 'Logo',
              tagName: 'a',
              draggable: true,
              droppable: false,
              attributes: { href: '/' },
              traits: [
                {
                  type: 'text',
                  label: 'Link',
                  name: 'href',
                  placeholder: '/',
                },
                {
                  type: 'select',
                  label: 'Target',
                  name: 'target',
                  options: [
                    { id: '', name: 'Same tab' },
                    { id: '_blank', name: 'New tab' },
                  ],
                },
              ],
              styles: LOGO_STYLES,
              components: [
                {
                  type: 'image',
                  tagName: 'img',
                  classes: ['gjs-logo__img'],
                  attributes: { src: '', alt: 'Logo' },
                  selectable: false,
                  hoverable: false,
                  draggable: false,
                  droppable: false,
                  layerable: false,
                  highlightable: false,
                },
              ],
            },
            // Proxy style operations to the <img> child so editing the wrapper still
            // affects the visual logo asset.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getStyle(this: any, opts?: unknown) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              const img = this.components().find((c: any) => c.get('tagName') === 'img')
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              return img ? img.getStyle(opts) : {}
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addStyle(this: any, styles: Record<string, string>, opts?: unknown) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              const img = this.components().find((c: any) => c.get('tagName') === 'img')
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              if (img) img.addStyle(styles, opts)
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setStyle(this: any, styles: Record<string, string>, opts?: unknown) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              const img = this.components().find((c: any) => c.get('tagName') === 'img')
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              if (img) img.setStyle(styles, opts)
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return this
            },
          },
        },
        block: {
          id: 'logo-brand',
          definition: {
            label: 'Logo',
            category: 'Navigation',
            media: LOGO_BLOCK_ICON,
          },
        },
      }),
    ],
  })(editor)
}
