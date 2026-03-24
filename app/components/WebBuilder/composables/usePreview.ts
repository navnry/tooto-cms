/**
 * usePreview — Singleton composable for preview mode state
 *
 * Uses GrapesJS built-in stateful command `core:preview`:
 *   runCommand  → hides selection handles, outline, canvas UI overlays
 *   stopCommand → restores editor UI
 *
 * Shared ref so App.vue (sidebars) and Toolbar.vue (button state) stay in sync.
 *
 * Preview mode patches:
 *   - Blocks dblclick in capture phase → prevents GrapesJS RTE from activating
 *   - Intercepts clicks on <a> tags   → enables link/navigation in preview
 */
import { ref, readonly } from 'vue'
import type { Editor } from 'grapesjs'
import { useEditor } from './useEditor'

const _isPreview = ref(false)

// ── Capture-phase handlers injected into the canvas iframe ───────────────────
let _dblclickHandler: ((e: Event) => void)      | null = null
let _clickHandler:    ((e: MouseEvent) => void) | null = null

function _setupPreviewInteractions(editor: Editor) {
  const doc = editor.Canvas.getDocument()
  if (!doc) return

  // Block dblclick so GrapesJS never enters rich-text / component-edit mode
  _dblclickHandler = (e: Event) => { e.stopImmediatePropagation() }
  doc.addEventListener('dblclick', _dblclickHandler, true)

  // Allow <a> clicks — GrapesJS normally swallows them inside the canvas
  _clickHandler = (e: MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href')
    if (!href || href === '#') return
    e.stopImmediatePropagation()
    e.preventDefault()
    window.open(href, '_blank', 'noopener,noreferrer')
  }
  doc.addEventListener('click', _clickHandler, true)
}

function _teardownPreviewInteractions(editor: Editor) {
  const doc = editor.Canvas.getDocument()
  if (!doc) return
  if (_dblclickHandler) {
    doc.removeEventListener('dblclick', _dblclickHandler, true)
    _dblclickHandler = null
  }
  if (_clickHandler) {
    doc.removeEventListener('click', _clickHandler, true)
    _clickHandler = null
  }
}

export function usePreview() {
  const { editor } = useEditor()

  function enterPreview() {
    if (!editor.value) return
    editor.value.runCommand('core:preview')
    _isPreview.value = true
    _setupPreviewInteractions(editor.value)
  }

  function exitPreview() {
    if (!editor.value) return
    editor.value.stopCommand('core:preview')
    _isPreview.value = false
    _teardownPreviewInteractions(editor.value)
  }

  function togglePreview() {
    if (_isPreview.value) exitPreview()
    else enterPreview()
  }

  return {
    isPreview: readonly(_isPreview),
    enterPreview,
    exitPreview,
    togglePreview,
  }
}
