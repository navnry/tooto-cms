import type { Editor } from 'grapesjs'
import { registerBlocks } from '~/components/WebBuilder/blocks'
import { useAssets } from '~/components/WebBuilder/composables/useAssets'
import { applyThemeCss } from '~/components/WebBuilder/services/theme/theme-css'
import { ensureThemeDataSources } from '~/components/WebBuilder/services/theme/theme-datasource'
import { injectThemeFontsIntoCanvas } from '~/components/WebBuilder/services/theme/theme-fonts'

const SYSTEM_FONTS = new Set([
  'Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Verdana',
  'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
  'Georgia', 'Palatino', 'Book Antiqua', 'Garamond',
  'Times New Roman', 'Courier New', 'Lucida Console', 'Monaco',
  'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
])

const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
  'inherit', 'initial', 'unset', 'none', '',
])

export interface WebBuilderCorePluginHooks {
  onStorageStartLoad?: () => void
  onStorageLoad?: () => void
  onStorageErrorLoad?: (error: unknown) => void
  onStorageEndLoad?: () => void
}

function registerKeymaps(editor: Editor): void {
  const km = editor.Keymaps

  km.add('wb:undo', 'ctrl+z, cmd+z', () => {
    editor.UndoManager.undo()
  })

  km.add('wb:redo', 'ctrl+shift+z, cmd+shift+z', () => {
    editor.UndoManager.redo()
  })

  km.add('wb:delete', 'backspace, delete', () => {
    const selected = editor.getSelected()
    if (selected && selected.get('removable')) {
      editor.runCommand('core:component-delete')
    }
  })

  km.add('wb:escape', 'escape', () => {
    editor.runCommand('core:component-exit')
  })
}

function injectCanvasBaseStyle(editor: Editor): void {
  const doc = editor.Canvas.getDocument()
  if (!doc) return
  if (doc.querySelector('style[data-tooto="canvas-base"]')) return

  const style = doc.createElement('style')
  style.dataset.tooto = 'canvas-base'
  style.textContent = `
    div[data-component-type="container"]:empty{
      min-height: 80px;
    }
  `
  doc.head.appendChild(style)
}

function reinjectGoogleFontsIntoCanvas(editor: Editor): void {
  const canvasDoc = editor.Canvas.getDocument()
  if (!canvasDoc) return

  const css = editor.getCss() ?? ''
  const fonts = new Set<string>()
  const re = /font-family:\s*([^;{}]+)/g
  let match: RegExpExecArray | null

  while ((match = re.exec(css)) !== null) {
    const fontFamilyValue = match[1] ?? ''
    fontFamilyValue.split(',').forEach((part) => {
      const name = part.trim().replace(/['"]/g, '').trim()
      if (name && !GENERIC_FAMILIES.has(name.toLowerCase()) && !SYSTEM_FONTS.has(name)) {
        fonts.add(name)
      }
    })
  }

  fonts.forEach((family) => {
    const id = `gf-${family.replace(/\s+/g, '-').toLowerCase()}`
    if (!canvasDoc.getElementById(id)) {
      const link = canvasDoc.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`
      canvasDoc.head.appendChild(link)
    }
  })
}

export function createWebBuilderCorePlugin(
  projectId: string,
  hooks: WebBuilderCorePluginHooks = {},
) {
  return (editor: Editor) => {
    let loadFailed = false

    registerKeymaps(editor)
    registerBlocks(editor)

    editor.on('storage:start:load', () => {
      loadFailed = false
      hooks.onStorageStartLoad?.()
    })

    editor.on('storage:load', () => {
      hooks.onStorageLoad?.()
    })

    editor.on('storage:error:load', (error: unknown) => {
      loadFailed = true
      hooks.onStorageErrorLoad?.(error)
    })

    editor.on('storage:end:load', () => {
      hooks.onStorageEndLoad?.()
      if (loadFailed) return
      editor.UndoManager.skip(() => {
        const theme = ensureThemeDataSources(editor)
        applyThemeCss(editor, theme)
        injectThemeFontsIntoCanvas(editor, theme)
        reinjectGoogleFontsIntoCanvas(editor)
      })
    })

    editor.Storage.add('nuxt-api', {
      async load() {
        const res = await $fetch<{ data?: unknown }>(`/api/projects/${projectId}`)
        return res?.data ?? {}
      },
      async store(data: Record<string, unknown>) {
        await $fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          body: { data },
        })
      },
    })

    editor.Commands.add('open-assets', {
      run(ed, _sender, opts: {
        types?: string[]
        target?: unknown
      } = {}) {
        const { openModal } = useAssets()
        openModal((url: string) => {
          const target = opts.target ?? ed.getSelected()
          if (target && typeof (target as { set?: (key: string, value: string) => void }).set === 'function') {
            ;(target as { set: (key: string, value: string) => void }).set('src', url)
          }
        })
      },
    })

    editor.onReady(() => {
      injectCanvasBaseStyle(editor)
    })
  }
}
