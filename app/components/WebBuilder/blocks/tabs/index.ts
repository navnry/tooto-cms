import type { Editor } from 'grapesjs'
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
  const { DomComponents, BlockManager } = editor

  DomComponents.addType(TYPE_TAB_PANEL, {
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

  DomComponents.addType(TYPE_TABS_PANELS, {
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

  DomComponents.addType(TYPE_TAB, {
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

  DomComponents.addType(TYPE_TABS_NAV, {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      init(this: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.listenTo(this.components(), 'remove', (removed: any) => {
          if (removed.get('type') !== TYPE_TAB) return
          const tabId = removed.getAttributes()[ATTR_TAB] as string
          if (!tabId) return
          const tabsComp = this.parent()
          if (!tabsComp) return
          let panelsComp: any = null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tabsComp.components().each((component: any) => {
            if (component.get('type') === TYPE_TABS_PANELS) panelsComp = component
          })
          if (!panelsComp) return
          let panelToRemove: any = null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          panelsComp.components().each((component: any) => {
            if (component.getAttributes()[ATTR_PANEL] === tabId) panelToRemove = component
          })
          panelToRemove?.remove()
        })
      },
    },
  })

  DomComponents.addType(TYPE_TABS, {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: 'button' as any, label: false, text: '+ Add Tab', full: true,
            command(ed: Editor) {
              const tabs = ed.getSelected()
              if (!tabs || tabs.get('type') !== TYPE_TABS) return
              let nav: any = null
              let panels: any = null
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tabs.components().each((component: any) => {
                if (component.get('type') === TYPE_TABS_NAV) nav = component
                if (component.get('type') === TYPE_TABS_PANELS) panels = component
              })
              if (!nav || !panels) return
              const id = uid()
              const n = (nav.components().length as number) + 1
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(nav.components() as any).add(makeTab(id, `Tab ${n}`, false))
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(panels.components() as any).add(makePanel(id, `Content for Tab ${n}`, false))
            },
          },
        ],
        styles: TABS_STYLES,
        components: [],
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      init(this: any) {
        if (this.components().length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(this.components() as any).reset(makeInitialChildren())
        }
      },
    },
  })

  BlockManager.add('tabs', {
    label: 'Tabs',
    category: 'UI',
    media: TABS_BLOCK_ICON,
    content: { type: TYPE_TABS },
  })
}
