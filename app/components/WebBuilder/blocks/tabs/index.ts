import type { Component, Components, Editor } from 'grapesjs'
import { createBlockRegistrar } from '../registry'
import {
  ATTR_PANEL,
  ATTR_TAB,
  TABS_BLOCK_ICON,
  TYPE_TAB,
  TYPE_TAB_PANEL,
  TYPE_TABS,
  TYPE_TABS_NAV,
  TYPE_TABS_PANELS,
} from './constants'
import { makeInitialChildren, makePanel, makeTab, uid } from './factories'
import { tabsScript as script } from './script'
import { TABS_STYLES } from './styles'

export function registerTabs(editor: Editor): void {
  const { addType, addBlock } = createBlockRegistrar(editor)

  function findByType(collection: Components, type: string): Component | undefined {
    return collection.models.find(component => component.getType() === type)
  }

  addType(TYPE_TAB_PANEL, {
    isComponent: (el: HTMLElement) =>
      el.hasAttribute?.(ATTR_PANEL) ? { type: TYPE_TAB_PANEL } : undefined,
    model: {
      defaults: {
        name: 'Tab Panel',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        highlightable: false,
      },
    },
  })

  addType(TYPE_TABS_PANELS, {
    model: {
      defaults: {
        name: 'Panels',
        tagName: 'div',
        draggable: false,
        droppable: false,
        copyable: false,
        removable: false,
        highlightable: false,
      },
    },
  })

  addType(TYPE_TAB, {
    isComponent: (el: HTMLElement) =>
      el.hasAttribute?.(ATTR_TAB) ? { type: TYPE_TAB } : undefined,
    model: {
      defaults: {
        name: 'Tab',
        tagName: 'div',
        draggable: `[data-gjs-type="${TYPE_TABS_NAV}"]`,
        droppable: false,
      },
    },
  })

  addType(TYPE_TABS_NAV, {
    model: {
      defaults: {
        name: 'Tab List',
        tagName: 'div',
        draggable: false,
        droppable: false,
        copyable: false,
        removable: false,
        highlightable: false,
      },
      init(this: Component) {
        this.listenTo(this.components(), 'remove', (removed: Component) => {
          if (removed.getType() !== TYPE_TAB) return
          const tabId = String(removed.getAttributes()[ATTR_TAB] ?? '')
          if (!tabId) return
          const tabsComp = this.parent()
          if (!tabsComp) return
          const panelsComp = findByType(tabsComp.components(), TYPE_TABS_PANELS)
          if (!panelsComp) return
          const panelToRemove = panelsComp.components().models.find(component =>
            String(component.getAttributes()[ATTR_PANEL] ?? '') === tabId,
          )
          panelToRemove?.remove()
        })
      },
    },
  })

  addType(TYPE_TABS, {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('gjs-tabs') ? { type: TYPE_TABS } : undefined,

    model: {
      defaults: {
        name: 'Tabs',
        tagName: 'div',
        droppable: false,
        draggable: true,
        script,
        'script-export': script,
        traits: [
          {
            type: 'button', label: false, text: '+ Add Tab', full: true,
            command(ed: Editor) {
              const tabs = ed.getSelected()
              if (!tabs || tabs.getType() !== TYPE_TABS) return
              const nav = findByType(tabs.components(), TYPE_TABS_NAV)
              const panels = findByType(tabs.components(), TYPE_TABS_PANELS)
              if (!nav || !panels) return
              const id = uid()
              const n = nav.components().length + 1
              nav.components().add(makeTab(id, `Tab ${n}`, false))
              panels.components().add(makePanel(id, `Content for Tab ${n}`, false))
            },
          },
        ],
        styles: TABS_STYLES,
        components: [],
      },

      init(this: Component) {
        if (this.components().length === 0) {
          this.components().reset(makeInitialChildren())
        }
      },
    },
  })

  addBlock('tabs', {
    label: 'Tabs',
    category: 'UI',
    media: TABS_BLOCK_ICON,
    content: { type: TYPE_TABS },
  })
}
