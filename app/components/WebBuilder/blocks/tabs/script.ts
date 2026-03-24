export const tabsScript = function (this: HTMLElement) {
  const el = this as HTMLElement & { __tabsInit?: boolean }
  if (el.__tabsInit) return
  el.__tabsInit = true

  function activate(id: string) {
    el.querySelectorAll('[data-tab]').forEach(function (tab) {
      tab.classList.toggle('gjs-tab--active', tab.getAttribute('data-tab') === id)
    })
    el.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
      ;(panel as HTMLElement).hidden = panel.getAttribute('data-tab-panel') !== id
    })
  }

  el.addEventListener('click', function (e) {
    const tab = (e.target as Element).closest('[data-tab]')
    if (!tab) return
    const id = tab.getAttribute('data-tab')
    if (id) activate(id)
  })

  const initial =
    el.querySelector('.gjs-tab--active[data-tab]') ||
    el.querySelector('[data-tab]')

  if (initial) {
    const id = initial.getAttribute('data-tab')
    if (id) activate(id)
  }
}
