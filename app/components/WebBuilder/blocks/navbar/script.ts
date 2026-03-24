export const navbarScript = function (this: HTMLElement) {
  const el = this as HTMLElement & { __navInit?: boolean }

  if (el.__navInit) return
  el.__navInit = true

  const burger = el.querySelector<HTMLElement>('.gjs-navbar__burger')
  const menu = el.querySelector<HTMLElement>('.gjs-navbar__menu')
  const overlay = el.querySelector<HTMLElement>('.gjs-navbar__overlay')
  const closeBtn = el.querySelector<HTMLElement>('.gjs-navbar__close')

  if (!burger || !menu) return
  const menuEl = menu

  function open () {
    menuEl.classList.add('is-open')
    if (overlay) overlay.classList.add('is-open')
  }
  function close () {
    menuEl.classList.remove('is-open')
    if (overlay) overlay.classList.remove('is-open')
  }

  burger.addEventListener('click', open)
  if (overlay)  overlay.addEventListener('click', close)
  if (closeBtn) closeBtn.addEventListener('click', close)

  el.addEventListener('click', function (e) {
    const btn = (e.target as Element).closest('.gjs-nav-group__btn')
    if (!btn) return
    const group = btn.closest('.gjs-nav-group')
    if (!group) return
    const wasOpen = group.classList.contains('is-open')
    el.querySelectorAll('.gjs-nav-group.is-open').forEach(function (g) { g.classList.remove('is-open') })
    if (!wasOpen) group.classList.add('is-open')
  })

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close()
  })

  const onScroll = function () {
    if (window.scrollY > 20) el.classList.add('is-scrolled')
    else el.classList.remove('is-scrolled')
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
