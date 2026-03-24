import type { Editor } from 'grapesjs'
import { ICON_CLOSE, ICON_SEARCH, SEARCH_BLOCK_ICON, TYPE_SEARCH } from './constants'
import { searchScript as script } from './script'
import { SEARCH_STYLES } from './styles'

export function registerSearch(editor: Editor): void {
  const { DomComponents, BlockManager } = editor

  DomComponents.addType(TYPE_SEARCH, {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('gjs-search') ? { type: TYPE_SEARCH } : undefined,

    model: {
      defaults: {
        name: 'Search',
        tagName: 'div',
        draggable: true,
        droppable: false,
        script,
        'script-export': script,
        styles: SEARCH_STYLES,
        components: [
          {
            tagName: 'button',
            classes: ['gjs-search__btn'],
            attributes: { 'aria-label': 'Search', type: 'button' },
            selectable: false,
            hoverable: false,
            draggable: false,
            droppable: false,
            layerable: false,
            highlightable: false,
            content: ICON_SEARCH,
          },
          {
            tagName: 'div',
            classes: ['gjs-search__modal'],
            selectable: false,
            hoverable: false,
            draggable: false,
            droppable: false,
            layerable: false,
            highlightable: false,
            components: [
              {
                tagName: 'div',
                classes: ['gjs-search__inner'],
                selectable: false,
                hoverable: false,
                draggable: false,
                droppable: false,
                layerable: false,
                highlightable: false,
                components: [
                  {
                    tagName: 'input',
                    classes: ['gjs-search__input'],
                    selectable: false,
                    hoverable: false,
                    draggable: false,
                    droppable: false,
                    layerable: false,
                    highlightable: false,
                    attributes: { type: 'text', placeholder: 'Search…', autocomplete: 'off' },
                  },
                  {
                    tagName: 'button',
                    classes: ['gjs-search__close'],
                    attributes: { 'aria-label': 'Close search', type: 'button' },
                    selectable: false,
                    hoverable: false,
                    draggable: false,
                    droppable: false,
                    layerable: false,
                    highlightable: false,
                    content: ICON_CLOSE,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })

  BlockManager.add('search-spotlight', {
    label: 'Search',
    category: 'UI',
    media: SEARCH_BLOCK_ICON,
    content: { type: TYPE_SEARCH },
  })
}
