import {
  TYPE_DROPDOWN,
  TYPE_DROPDOWN_ITEM,
  TYPE_MEGA,
  TYPE_MEGA_COL,
  TYPE_MEGA_INNER,
  TYPE_MEGA_LEFT,
  TYPE_MEGA_RIGHT,
  TYPE_NAV_GROUP,
  TYPE_NAVBAR_CENTER,
  TYPE_NAVBAR_LEFT,
  TYPE_NAVBAR_LINK,
  TYPE_NAVBAR_MENU,
  TYPE_NAVBAR_RIGHT,
} from './constants'

export function uiEl(tagName: string, classes: string[], extra: Record<string, unknown> = {}) {
  return {
    tagName, classes,
    selectable: false, hoverable: false,
    draggable: false, droppable: false,
    layerable: false, highlightable: false,
    ...extra,
  }
}

export function makeLink(text: string, href = '#', cta = false) {
  return {
    type: TYPE_NAVBAR_LINK,
    tagName: 'a',
    attributes: { href, ...(cta ? { 'data-cta': '' } : {}) },
    classes: cta ? ['gjs-navbar__link', 'gjs-navbar__link--cta'] : ['gjs-navbar__link'],
    components: [{ type: 'textnode', content: text }],
  }
}

export function makeBurger() {
  return {
    ...uiEl('button', ['gjs-navbar__burger'], { attributes: { 'aria-label': 'Open menu', type: 'button' } }),
    components: [uiEl('span', []), uiEl('span', []), uiEl('span', [])],
  }
}

export function makeDropdownItem(text: string, href = '#') {
  return {
    type: TYPE_DROPDOWN_ITEM,
    tagName: 'a',
    classes: ['gjs-nav-group__dropdown-item'],
    attributes: { href },
    components: [{ type: 'textnode', content: text }],
  }
}

export function makeDropdown() {
  return {
    type: TYPE_DROPDOWN,
    tagName: 'div',
    classes: ['gjs-nav-group__dropdown'],
    components: [
      makeDropdownItem('Item 1'),
      makeDropdownItem('Item 2'),
      makeDropdownItem('Item 3'),
    ],
  }
}

function makeMegaItem(text: string, href = '#') {
  return {
    tagName: 'a',
    classes: ['gjs-nav-group__mega-item'],
    attributes: { href },
    components: [
      {
        tagName: 'span',
        classes: ['gjs-nav-group__mega-item-label'],
        draggable: false, droppable: false, copyable: false, removable: false,
        selectable: false, hoverable: false, layerable: false,
        components: [{ type: 'textnode', content: text }],
      },
      {
        tagName: 'span',
        classes: ['gjs-nav-group__mega-item-icon'],
        draggable: false, droppable: false, copyable: false, removable: false,
        selectable: false, hoverable: false, layerable: false,
        components: [{ type: 'textnode', content: '+' }],
      },
    ],
  }
}

export function makeMegaCol(title: string) {
  return {
    type: TYPE_MEGA_COL,
    tagName: 'div',
    classes: ['gjs-nav-group__mega-col'],
    components: [
      {
        tagName: 'div',
        classes: ['gjs-nav-group__mega-col-title'],
        draggable: false, droppable: false, copyable: false, removable: false,
        selectable: false, hoverable: false, layerable: false,
        components: [{ type: 'textnode', content: title }],
      },
      makeMegaItem('Item 1'),
      makeMegaItem('Item 2'),
      makeMegaItem('Item 3'),
      makeMegaItem('Item 4'),
      makeMegaItem('Item 5'),
    ],
  }
}

function makeMegaRightImage() {
  return {
    tagName: 'img',
    classes: ['gjs-nav-group__mega-img'],
    attributes: {
      src: 'https://placehold.co/630x420/e2e8f0/94a3b8?text=Feature+Image',
      alt: 'Feature Image',
      width: '630',
      height: '420',
    },
    draggable: false, copyable: false, removable: false,
  }
}

export function makeMega() {
  return {
    type: TYPE_MEGA,
    tagName: 'div',
    classes: ['gjs-nav-group__mega'],
    components: [
      {
        type: TYPE_MEGA_INNER,
        tagName: 'div',
        classes: ['gjs-nav-group__mega-inner'],
        components: [
          {
            type: TYPE_MEGA_LEFT,
            tagName: 'div',
            classes: ['gjs-nav-group__mega-left'],
            components: [makeMegaCol('Category')],
          },
          {
            type: TYPE_MEGA_RIGHT,
            tagName: 'div',
            classes: ['gjs-nav-group__mega-right'],
            components: [makeMegaRightImage()],
          },
        ],
      },
    ],
  }
}

const NAV_GROUP_CHEVRON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
  width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>`

export function makeNavGroup(label: string, menuType: 'dropdown' | 'mega' = 'dropdown') {
  return {
    type: TYPE_NAV_GROUP,
    tagName: 'div',
    classes: menuType === 'mega' ? ['gjs-nav-group', 'gjs-nav-group--mega'] : ['gjs-nav-group'],
    ngLabel: label,
    ngType: menuType,
    components: [
      {
        tagName: 'button',
        classes: ['gjs-nav-group__btn'],
        attributes: { type: 'button' },
        selectable: false, hoverable: false, draggable: false,
        droppable: false, layerable: false, highlightable: false,
        components: [
          { type: 'textnode', content: label },
          uiEl('span', ['gjs-nav-group__btn-chevron'], { content: NAV_GROUP_CHEVRON }),
        ],
      },
      menuType === 'mega' ? makeMega() : makeDropdown(),
    ],
  }
}

export function createNavbarStructure() {
  return [
    {
      tagName: 'div',
      classes: ['gjs-navbar__inner'],
      selectable: false, hoverable: false,
      draggable: false, droppable: false,
      copyable: false, removable: false,
      highlightable: false,
      components: [
        {
          type: TYPE_NAVBAR_LEFT,
          tagName: 'div',
          classes: ['gjs-navbar__left'],
          components: [
            {
              type: 'logo-brand',
              tagName: 'a',
              classes: ['gjs-logo'],
              attributes: { href: '/' },
              components: [
                {
                  type: 'image',
                  tagName: 'img',
                  classes: ['gjs-logo__img'],
                  attributes: { src: '', alt: 'Logo' },
                  selectable: false, hoverable: false,
                  draggable: false, droppable: false,
                  layerable: false, highlightable: false,
                },
              ],
            },
          ],
        },
        {
          type: TYPE_NAVBAR_CENTER,
          tagName: 'div',
          classes: ['gjs-navbar__center'],
          components: [
            {
              type: TYPE_NAVBAR_MENU,
              tagName: 'nav',
              classes: ['gjs-navbar__menu'],
              components: [
                uiEl('button', ['gjs-navbar__close'], {
                  attributes: { 'aria-label': 'Close menu', type: 'button' },
                  content: '✕',
                }),
                makeNavGroup('Products', 'mega'),
                makeNavGroup('Solutions', 'mega'),
                makeLink('Cases'),
                makeNavGroup('Why FOCA', 'dropdown'),
                makeNavGroup('Resources', 'dropdown'),
                makeLink('Contact'),
              ],
            },
          ],
        },
        {
          type: TYPE_NAVBAR_RIGHT,
          tagName: 'div',
          classes: ['gjs-navbar__right'],
          components: [
            { type: 'search-spotlight' },
            makeLink('Request a Quote', '#', true),
            makeBurger(),
          ],
        },
      ],
    },
    uiEl('div', ['gjs-navbar__overlay']),
  ]
}
