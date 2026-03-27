/**
 * navbar.ts — Responsive Navbar component (v2)
 *
 * Desktop  →  三区块水平布局:
 *   左(brand logo) | 中(nav menu，可配置对齐) | 右(搜索+CTA+可拓展区域)
 * Mobile   →  brand logo 左 + burger 右; 点击 → 侧边抽屉从右/左滑入
 *              遮罩层变暗; 关闭按钮或点击遮罩关闭抽屉
 *
 * Component hierarchy
 * ───────────────────
 *   navbar  [header.gjs-navbar]  ← script lives here
 *   ├── inner  [div.gjs-navbar__inner]
 *   │   ├── navbar-left  [div.gjs-navbar__left]   ← Logo 区块插槽
 *   │   │   └── logo-brand  [a.gjs-logo]
 *   │   ├── navbar-center  [div.gjs-navbar__center]  ← 导航菜单插槽（可配置对齐）
 *   │   │   └── navbar-menu  [nav.gjs-navbar__menu]  ← 移动端变为抽屉
 *   │   │       ├── close btn  (UI element, mobile only)
 *   │   │       ├── navbar-link  [a]  × N    ← 可编辑，有 href trait
 *   │   │       └── navbar-link--cta  [a]    ← 样式为按钮
 *   │   └── navbar-right  [div.gjs-navbar__right]  ← 操作区（可拖拽新增 block）
 *   │       ├── search-spotlight
 *   │       ├── navbar-link--cta  [a]
 *   │       └── burger  (UI element, mobile only)
 *   └── overlay  (UI element)
 *
 * No external library → safe to run script in canvas iframe.
 */
import type { Component, Components, CssRule, Editor } from 'grapesjs'
import {
  NAVBAR_ICON,
  TYPE_DROPDOWN,
  TYPE_DROPDOWN_ITEM,
  TYPE_MEGA,
  TYPE_MEGA_COL,
  TYPE_MEGA_INNER,
  TYPE_MEGA_LEFT,
  TYPE_MEGA_RIGHT,
  TYPE_NAV_GROUP,
  TYPE_NAVBAR,
  TYPE_NAVBAR_CENTER,
  TYPE_NAVBAR_LEFT,
  TYPE_NAVBAR_LINK,
  TYPE_NAVBAR_MENU,
  TYPE_NAVBAR_RIGHT,
} from './constants'
import {
  createNavbarStructure,
  makeBurger,
  makeDropdown,
  makeDropdownItem,
  makeLink,
  makeMega,
  makeMegaCol,
  makeNavGroup,
  uiEl,
} from './factories'
import { navbarScript as script } from './script'
import { NAVBAR_STYLES } from './styles'

type CssComposerModule = {
  getRule: (selectors: string) => CssRule | null | undefined
  setRule: (selectors: string, style: Record<string, string>) => CssRule
}

function findByType(collection: Components, type: string): Component | undefined {
  return collection.models.find(component => component.getType() === type)
}

function hasClass(component: Component, className: string): boolean {
  const classes = component.getClasses() as string[]
  return Array.isArray(classes) && classes.includes(className)
}

// ── Registration ──────────────────────────────────────────────────────────────
export function registerNavbar (editor: Editor): void {
  const { DomComponents, BlockManager } = editor

  // ── Navbar Link ─────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAVBAR_LINK, {
    isComponent: (el: HTMLElement) =>
      el.tagName === 'A' && el.classList.contains('gjs-navbar__link')
        ? { type: TYPE_NAVBAR_LINK }
        : undefined,

    extend: 'link',

    model: {
      defaults: {
        name: 'Nav Link',
        tagName: 'a',
        draggable: `[data-gjs-type="${TYPE_NAVBAR_MENU}"],[data-gjs-type="${TYPE_NAVBAR_RIGHT}"]`,
        droppable: false,
        traits: [
          { type: 'text',   label: 'Label', name: 'content', changeProp: true },
          { type: 'text',   label: 'Href',  name: 'href',    attributes: { placeholder: '#' } },
          {
            type: 'select', label: 'Target', name: 'target',
            options: [
              { id: '',       name: 'Same tab' },
              { id: '_blank', name: 'New tab'  },
            ],
          },
        ],
      },
    },
  })

  // ── Navbar Menu ─────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAVBAR_MENU, {
    model: {
      defaults: {
        name: 'Nav Menu',
        tagName: 'nav',
        draggable: false,
        copyable: false,
        removable: false,
        highlightable: false,
        droppable: `[data-gjs-type="${TYPE_NAVBAR_LINK}"],[data-gjs-type="${TYPE_NAV_GROUP}"]`,

        traits: [
          {
            type: 'button', name: 'add-link', label: false, text: '+ Add Link', full: true,
            command (ed: Editor) {
              const menu = ed.getSelected()
              if (!menu || menu.getType() !== TYPE_NAVBAR_MENU) return
              menu.components().add(makeLink('New Link'))
            },
          },
          {
            type: 'button', name: 'add-dropdown', label: false, text: '+ Add Dropdown', full: true,
            command (ed: Editor) {
              const menu = ed.getSelected()
              if (!menu || menu.getType() !== TYPE_NAVBAR_MENU) return
              menu.components().add(makeNavGroup('Menu'))
            },
          },
          {
            type: 'button', name: 'add-mega', label: false, text: '+ Add Mega Menu', full: true,
            command (ed: Editor) {
              const menu = ed.getSelected()
              if (!menu || menu.getType() !== TYPE_NAVBAR_MENU) return
              menu.components().add(makeNavGroup('Menu', 'mega'))
            },
          },
        ],
      },
    },
  })

  // ── Dropdown Item ────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_DROPDOWN_ITEM, {
    isComponent: (el: HTMLElement) =>
      el.tagName === 'A' && el.classList.contains('gjs-nav-group__dropdown-item')
        ? { type: TYPE_DROPDOWN_ITEM }
        : undefined,
    extend: 'link',
    model: {
      defaults: {
        name: 'Dropdown Item',
        tagName: 'a',
        draggable: `[data-gjs-type="${TYPE_DROPDOWN}"]`,
        droppable: false,
        traits: [
          { type: 'text',   label: 'Label',  name: 'content', changeProp: true },
          { type: 'text',   label: 'Href',   name: 'href',    attributes: { placeholder: '#' } },
          {
            type: 'select', label: 'Target', name: 'target',
            options: [
              { id: '',       name: 'Same tab' },
              { id: '_blank', name: 'New tab'  },
            ],
          },
        ],
      },
    },
  })

  // ── Dropdown Panel ───────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_DROPDOWN, {
    model: {
      defaults: {
        name: 'Dropdown',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        droppable: `[data-gjs-type="${TYPE_DROPDOWN_ITEM}"]`,
        traits: [
          {
            type: 'button', name: 'add-item', label: false, text: '+ Add Item', full: true,
            command (ed: Editor) {
              const dropdown = ed.getSelected()
              if (!dropdown || dropdown.getType() !== TYPE_DROPDOWN) return
              dropdown.components().add(makeDropdownItem('New Item'))
            },
          },
        ],
      },
    },
  })

  // ── Mega Inner Panel ─────────────────────────────────────────────────────────
  // Must be layerable (the default) so that GrapesJS Layers panel can traverse
  // into it and display TYPE_MEGA_LEFT / TYPE_MEGA_RIGHT as visible children.
  // We set selectable/hoverable/draggable false so the user can't accidentally
  // move or select this structural wrapper — but it DOES appear in the tree.
  DomComponents.addType(TYPE_MEGA_INNER, {
    model: {
      defaults: {
        name: 'Mega Panel',
        tagName: 'div',
        selectable: false,
        hoverable: false,
        highlightable: false,
        draggable: false,
        copyable: false,
        removable: false,
        droppable: false,
        // layerable defaults to true — intentionally NOT set to false so
        // child components (Left / Right panels) appear in Layers.
      },
    },
  })

  // ── Mega Column ──────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_MEGA_COL, {
    model: {
      defaults: {
        name: 'Mega Column',
        tagName: 'div',
        // Columns belong to the left panel of the mega menu.
        draggable: `[data-gjs-type="${TYPE_MEGA_LEFT}"]`,
        droppable: false,
        copyable: true,
        removable: true,
      },
    },
  })

  // ── Mega Left Panel ──────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_MEGA_LEFT, {
    model: {
      defaults: {
        name: 'Mega Left (Columns)',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        droppable: `[data-gjs-type="${TYPE_MEGA_COL}"]`,
      },
    },
  })

  // ── Mega Right Panel ─────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_MEGA_RIGHT, {
    model: {
      defaults: {
        name: 'Mega Right (Image)',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        // Accept any block / image so users can swap the feature image.
        droppable: true,
      },
    },
  })

  // ── Mega Panel ───────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_MEGA, {
    model: {
      defaults: {
        name: 'Mega Menu',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        droppable: false,
        traits: [
          {
            type: 'button', name: 'add-col', label: false, text: '+ Add Column', full: true,
            command (ed: Editor) {
              const mega = ed.getSelected()
              if (!mega || mega.getType() !== TYPE_MEGA) return
              // Drill into inner → left panel to add a new column.
              const inner = findByType(mega.components(), TYPE_MEGA_INNER)
              if (!inner) return
              const left = findByType(inner.components(), TYPE_MEGA_LEFT)
              if (!left) return
              const n = left.components().length + 1
              left.components().add(makeMegaCol(`Column ${n}`))
            },
          },
        ],
      },
    },
  })

  // ── Nav Group ────────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAV_GROUP, {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('gjs-nav-group') ? { type: TYPE_NAV_GROUP } : undefined,
    model: {
      defaults: {
        name: 'Nav Group',
        tagName: 'div',
        draggable: `[data-gjs-type="${TYPE_NAVBAR_MENU}"]`,
        droppable: false,
        copyable: true,
        removable: true,
        ngType: 'dropdown',
        ngLabel: '',
        ngOffset: 20,
        traits: [
          { type: 'text', label: 'Label', name: 'ngLabel', changeProp: true },
          {
            type: 'select', label: 'Menu Type', name: 'ngType', changeProp: true,
            options: [
              { id: 'dropdown', name: '普通下拉' },
              { id: 'mega',     name: '超级菜单' },
            ],
          },
          {
            // Only meaningful when ngType === 'mega'; controls the transparent
            // bridge height between the trigger button and the visual panel.
            type: 'number', label: 'Mega 间距 (px)', name: 'ngOffset',
            changeProp: true, placeholder: '8',
          },
        ],
      },

      init(this: Component) {
        this.listenTo(this, 'change:ngLabel', () => {
          const label = this.get('ngLabel') as string
          this.components().models.forEach((c) => {
            if (!hasClass(c, 'gjs-nav-group__btn')) return
            c.components().models.forEach((cc) => {
              if (cc.getType() === 'textnode') cc.set('content', label)
            })
          })
        })

        this.listenTo(this, 'change:ngType', () => {
          const type = this.get('ngType') as 'dropdown' | 'mega'
          const comps = this.components()
          const panelComp = comps.models.find((c) =>
            c.getType() === TYPE_DROPDOWN || c.getType() === TYPE_MEGA,
          )
          if (panelComp) panelComp.remove()
          comps.add(type === 'mega' ? makeMega() : makeDropdown())
          if (type === 'mega') this.addClass('gjs-nav-group--mega')
          else this.removeClass('gjs-nav-group--mega')
          // Apply the current offset to the freshly created mega wrapper.
          if (type === 'mega') applyOffset()
        })

        // ── ngOffset: control the transparent bridge gap above the mega panel ──
        const applyOffset = () => {
          if (this.get('ngType') !== 'mega') return
          const raw = this.get('ngOffset') as string | number
          const offset = Math.max(0, Number(raw) || 8)
          this.components().models.forEach((c) => {
            if (c.getType() !== TYPE_MEGA) return
            // addStyle merges into the component's inline style — won't erase
            // user-set properties managed via the Style Manager.
            c.addStyle({ 'padding-top': `${offset}px` })
          })
        }

        this.listenTo(this, 'change:ngOffset', applyOffset)

        // Apply on init so loaded projects restore the correct bridge height.
        applyOffset()
      },
    },
  })

  // ── Navbar Left Slot ─────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAVBAR_LEFT, {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('gjs-navbar__left') ? { type: TYPE_NAVBAR_LEFT } : undefined,
    model: {
      defaults: {
        name: '品牌 Logo',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        highlightable: false,
        // Only accept logo-brand blocks
        droppable: `[data-gjs-type="logo-brand"]`,
      },
    },
  })

  // ── Navbar Center Slot ───────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAVBAR_CENTER, {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('gjs-navbar__center') ? { type: TYPE_NAVBAR_CENTER } : undefined,
    model: {
      defaults: {
        name: '导航菜单区',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        highlightable: false,
        droppable: false,
      },
    },
  })

  // ── Navbar Right Slot ────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAVBAR_RIGHT, {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('gjs-navbar__right') ? { type: TYPE_NAVBAR_RIGHT } : undefined,
    model: {
      defaults: {
        name: '操作区',
        tagName: 'div',
        draggable: false,
        copyable: false,
        removable: false,
        // Allow any block to be dropped in the right slot
        droppable: true,
      },
    },
  })

  // ── Navbar Root ─────────────────────────────────────────────────────────────
  DomComponents.addType(TYPE_NAVBAR, {
    isComponent: (el: HTMLElement) =>
      el.tagName === 'HEADER' && el.classList.contains('gjs-navbar')
        ? { type: TYPE_NAVBAR }
        : undefined,

    model: {
      defaults: {
        name: 'Navbar',
        tagName: 'header',
        droppable: false,
        draggable: true,

        style: {
          "position":         "fixed",
          "top":              "32px",
          "left":             "32px",
          "right":            "32px",
          "z-index":          "100",
          'padding':          '0 24px',
          'height':           '64px',
          'max-width':        '100%',
          'box-sizing':       'border-box',
          'background-color':  '#ffffff',
          'background-color-scroll':  '#ffffff',
          'color':  '#041038',
          'color-scroll':  '#041038',
          'border-color':  '#e2e8f0',
          'border-color-scroll':  '#e2e8f0',
          'border-radius':  '100px',
          'border-radius-scroll':  '100px',
        },

        traits: [
          {
            type: 'select', label: 'Drawer Side', name: 'nbDrawerSide', changeProp: true,
            options: [
              { id: 'right', name: '右侧（默认）' },
              { id: 'left',  name: '左侧' },
            ],
          },
          {
            type: 'select', label: '菜单对齐', name: 'nbMenuAlign', changeProp: true,
            options: [
              { id: 'left',   name: '左对齐' },
              { id: 'center', name: '居中（默认）' },
              { id: 'right',  name: '右对齐' },
            ],
          },
          { type: 'color', label: '默认背景色',   name: 'nbBg',          changeProp: true },
          { type: 'color', label: '滚动后背景色', name: 'nbScrollBg',     changeProp: true },
          { type: 'color', label: '链接默认色',   name: 'nbColor',       changeProp: true },
          { type: 'color', label: '链接滚动色',   name: 'nbScrollColor', changeProp: true },
        ],

        // No script-props — the script runs ONCE on mount (interaction wiring only).
        // Color/bg traits are handled in init() via CssComposer to avoid any
        // MutationObserver feedback loop that would freeze the editor.
        script,
        'script-export': script,

        // ── Styles ─────────────────────────────────────────────────────────
        styles: NAVBAR_STYLES,

        // ── Initial structure ───────────────────────────────────────────
        components: createNavbarStructure(),
      },

      init(this: Component) {
        // ── Drawer side ──────────────────────────────────────────────────────
        this.listenTo(this, 'change:nbDrawerSide', () => {
          const side = this.get('nbDrawerSide') as string
          if (side === 'left') this.addClass('gjs-navbar--drawer-left')
          else this.removeClass('gjs-navbar--drawer-left')
        })

        // ── Menu alignment — CSS-class approach ───────────────────────────────
        const applyMenuAlign = (align: string) => {
          const a = align || 'center'
          this.removeClass('gjs-navbar--menu-left')
          this.removeClass('gjs-navbar--menu-right')
          if (a === 'left')  this.addClass('gjs-navbar--menu-left')
          if (a === 'right') this.addClass('gjs-navbar--menu-right')
        }
        this.listenTo(this, 'change:nbMenuAlign', () => {
          applyMenuAlign(this.get('nbMenuAlign') as string)
        })
        const _initAlign = this.get('nbMenuAlign') as string
        if (_initAlign) applyMenuAlign(_initAlign)

        // ── Color / background traits — via GrapesJS CssComposer ─────────────
        // CssComposer writes to GrapesJS's own CSS model (exported as a <style>
        // tag). It is completely safe: it never touches canvas element styles
        // directly, so GrapesJS's MutationObserver is never triggered.
        const applyColorTraits = () => {
          const id = this.getId() as string
          if (!id) return
          const cc = this.em?.get?.('CssComposer') as CssComposerModule | undefined
          if (!cc) return

          const bg          = ((this.get('nbBg')          as string) || '').trim()
          const scrollBg    = ((this.get('nbScrollBg')    as string) || '').trim()
          const color       = ((this.get('nbColor')       as string) || '').trim()
          const scrollColor = ((this.get('nbScrollColor') as string) || '').trim()

          const s = `#${id}`

          // Merge-write: read the existing rule styles first, then spread new trait
          // values on top. This preserves any properties the user set via the
          // Style Manager (background, border, padding, etc.) while only
          // overriding the specific property the trait controls.
          const setRule = (sel: string, newStyles: Record<string, string>) => {
            const existing = cc.getRule(sel)
            const base: Record<string, string> = existing ? { ...(existing.getStyle() as Record<string, string>) } : {}
            cc.setRule(sel, { ...base, ...newStyles })
          }

          if (bg)          setRule(s,                  { background: bg })
          if (scrollBg)    setRule(`${s}.is-scrolled`, { background: scrollBg })

          if (color) {
            setRule(`${s} .gjs-navbar__link`,        { color })
            setRule(`${s} .gjs-navbar__link:hover`,  { color })
            setRule(`${s} .gjs-nav-group__btn`,      { color })
            setRule(`${s} .gjs-navbar__burger span`, { background: color })
          }

          if (scrollColor) {
            setRule(`${s}.is-scrolled .gjs-navbar__link`,        { color: scrollColor })
            setRule(`${s}.is-scrolled .gjs-navbar__link:hover`,  { color: scrollColor })
            setRule(`${s}.is-scrolled .gjs-nav-group__btn`,      { color: scrollColor })
            setRule(`${s}.is-scrolled .gjs-navbar__burger span`, { background: scrollColor })
          }
        }

        this.listenTo(this, 'change:nbBg change:nbScrollBg change:nbColor change:nbScrollColor', applyColorTraits)

        // Apply saved values after the editor (and canvas) is fully ready.
        // Calling cc.setRule() too early (during project deserialization) would
        // throw because the canvas frames aren't initialised yet.
        if (this.em?.get?.('loaded')) {
          // Editor already loaded (e.g. block dropped at runtime)
          applyColorTraits()
        } else {
          this.listenToOnce(this.em, 'load', applyColorTraits)
        }
      },
    },
  })

  BlockManager.add('navbar-component', {
    label: 'Navbar', category: 'Navigation', media: NAVBAR_ICON,
    content: { type: TYPE_NAVBAR },
  })
}
