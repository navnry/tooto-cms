import type { Editor } from 'grapesjs'
import { ATTR_EFFECT, BUTTON_BLOCK_ICON, BUTTON_STYLES, TYPE_BUTTON } from './styles'
import { createBlockSuite, defineComponentBlock } from '../registry'

export function registerButton(editor: Editor): void {
  createBlockSuite({
    componentBlocks: [
      defineComponentBlock({
        type: TYPE_BUTTON,
        component: {
          isComponent: (el: HTMLElement) =>
            el.classList?.contains('gjs-btn') ? { type: TYPE_BUTTON } : undefined,
          model: {
            defaults: {
              name: 'Button',
              tagName: 'a',
              draggable: true,
              droppable: false,
              editable: true,
              attributes: {
                href: '#',
                class: 'gjs-btn',
                [ATTR_EFFECT]: 'lift',
              },
              components: 'Get Started',
              traits: [
                {
                  type: 'text',
                  name: 'href',
                  label: 'Link',
                  placeholder: '#',
                },
                {
                  type: 'select',
                  name: 'target',
                  label: 'Target',
                  options: [
                    { id: '', name: 'Same tab' },
                    { id: '_blank', name: 'New tab' },
                  ],
                },
                {
                  type: 'select',
                  name: ATTR_EFFECT,
                  label: 'Hover Effect',
                  options: [
                    { id: 'none', name: 'None' },
                    { id: 'lift', name: 'Lift' },
                    { id: 'scale', name: 'Scale' },
                    { id: 'glow', name: 'Glow' },
                    { id: 'pulse', name: 'Pulse' },
                    { id: 'shine', name: 'Shine' },
                  ],
                },
              ],
              styles: BUTTON_STYLES,
            },
          },
        },
        block: {
          id: 'button',
          definition: {
            label: 'Button',
            category: 'UI',
            media: BUTTON_BLOCK_ICON,
          },
        },
      }),
    ],
  })(editor)
}
