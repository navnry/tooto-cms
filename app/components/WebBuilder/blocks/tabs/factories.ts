import {
  ATTR_PANEL,
  ATTR_TAB,
  TYPE_TAB,
  TYPE_TAB_PANEL,
  TYPE_TABS_NAV,
  TYPE_TABS_PANELS,
} from './constants'

export function uid(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function makeTab(id: string, label: string, active: boolean) {
  return {
    type: TYPE_TAB,
    tagName: 'div',
    attributes: { [ATTR_TAB]: id, role: 'tab' },
    classes: active ? ['gjs-tab', 'gjs-tab--active'] : ['gjs-tab'],
    components: [{ type: 'text', content: label }],
  }
}

export function makePanel(id: string, content: string, active: boolean) {
  return {
    type: TYPE_TAB_PANEL,
    tagName: 'div',
    attributes: active
      ? { [ATTR_PANEL]: id, role: 'tabpanel' }
      : { [ATTR_PANEL]: id, role: 'tabpanel', hidden: '' },
    classes: ['gjs-tab-panel'],
    components: [{ type: 'text', content }],
  }
}

export function makeInitialChildren() {
  const id1 = uid()
  const id2 = uid()
  const id3 = uid()

  return [
    {
      type: TYPE_TABS_NAV,
      tagName: 'div',
      attributes: { role: 'tablist' },
      classes: ['gjs-tabs-nav'],
      draggable: false,
      droppable: false,
      copyable: false,
      removable: false,
      highlightable: false,
      components: [
        makeTab(id1, 'Tab 1', true),
        makeTab(id2, 'Tab 2', false),
        makeTab(id3, 'Tab 3', false),
      ],
    },
    {
      type: TYPE_TABS_PANELS,
      tagName: 'div',
      classes: ['gjs-tabs-panels'],
      draggable: false,
      droppable: false,
      copyable: false,
      removable: false,
      highlightable: false,
      components: [
        makePanel(id1, 'Content for Tab 1', true),
        makePanel(id2, 'Content for Tab 2', false),
        makePanel(id3, 'Content for Tab 3', false),
      ],
    },
  ]
}
