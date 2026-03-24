export const searchScript = function (this: HTMLElement) {
  const el = this as HTMLElement & { __searchInit?: boolean }
  if (el.__searchInit) return
  el.__searchInit = true

  const btn = el.querySelector('.gjs-search__btn') as HTMLElement | null
  const modal = el.querySelector('.gjs-search__modal') as HTMLElement | null
  const close = el.querySelector('.gjs-search__close') as HTMLElement | null
  const input = el.querySelector('.gjs-search__input') as HTMLInputElement | null

  if (!btn || !modal) return
  const modalEl = modal

  function openModal() {
    modalEl.classList.add('is-open')
    setTimeout(function () { input?.focus() }, 50)
  }

  function closeModal() {
    modalEl.classList.remove('is-open')
  }

  btn.addEventListener('click', openModal)
  close?.addEventListener('click', closeModal)
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal()
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal()
  })
}
