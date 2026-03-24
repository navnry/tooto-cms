export const videoScript = function (this: HTMLElement) {
  const el = this as HTMLElement & { __videoInit?: boolean }

  const thumb = el.querySelector('.gjs-video__thumb') as HTMLImageElement | null
  const play = el.querySelector('.gjs-video__play') as HTMLElement | null
  const modal = el.querySelector('.gjs-video__modal') as HTMLElement | null
  const close = el.querySelector('.gjs-video__close') as HTMLElement | null
  const cover = el.querySelector('.gjs-video__cover') as HTMLElement | null
  const iframe = el.querySelector('.gjs-video__iframe') as HTMLIFrameElement | null

  if (!cover || !play || !modal || !iframe) return
  const playEl = play
  const modalEl = modal
  const iframeEl = iframe

  const ICONS: Record<string, string> = {
    'circle-outline': '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" stroke="white" stroke-width="3" fill="rgba(0,0,0,0.35)"/><polygon points="32,24 58,40 32,56" fill="white"/></svg>',
    'circle-filled': '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="white"/><polygon points="33,24 59,40 33,56" fill="#111827"/></svg>',
    minimal: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><filter id="ds"><feDropShadow dx="0" dy="1" stdDeviation="3" flood-opacity="0.5"/></filter><polygon points="20,10 70,40 20,70" fill="white" filter="url(#ds)"/></svg>',
  }

  function updateVisuals() {
    const coverUrl = el.getAttribute('data-cover') || ''
    const iconStyle = el.getAttribute('data-play-icon') || 'circle-outline'
    const iconSize = el.getAttribute('data-play-size') || '64'

    if (thumb) {
      if (coverUrl) {
        thumb.src = coverUrl
        thumb.style.display = 'block'
      } else {
        thumb.removeAttribute('src')
        thumb.style.display = 'none'
      }
    }

    playEl.innerHTML = ICONS[iconStyle] || ICONS['circle-outline']
    playEl.style.width = `${iconSize}px`
    playEl.style.height = `${iconSize}px`
  }

  updateVisuals()

  const observer = new MutationObserver(function (mutations) {
    for (let i = 0; i < mutations.length; i += 1) {
      const attr = mutations[i].attributeName
      if (attr === 'data-cover' || attr === 'data-play-icon' || attr === 'data-play-size') {
        updateVisuals()
        break
      }
    }
  })
  observer.observe(el, { attributes: true, attributeFilter: ['data-cover', 'data-play-icon', 'data-play-size'] })

  if (el.__videoInit) return
  el.__videoInit = true

  function openModal() {
    const url = el.getAttribute('data-video-url') || ''
    if (!url) return
    const sep = url.indexOf('?') >= 0 ? '&' : '?'
    iframeEl.src = `${url}${sep}autoplay=1`
    modalEl.classList.add('is-open')
  }

  function closeModal() {
    modalEl.classList.remove('is-open')
    iframeEl.src = ''
  }

  cover.addEventListener('click', openModal)
  close?.addEventListener('click', closeModal)
  modalEl.addEventListener('click', function (e) {
    if (e.target === modalEl) closeModal()
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal()
  })
}
