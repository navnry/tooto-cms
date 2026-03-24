/**
 * useEditor — GrapesJS editor singleton composable
 *
 * Adapted for Nuxt: uses nuxt-api storage (server-side persistence via MySQL)
 * instead of IndexedDB.
 */

import {ref, shallowRef, shallowReadonly, markRaw} from 'vue'
import grapesjs, {type Editor} from 'grapesjs'
import {registerBlocks} from '~/components/WebBuilder/blocks'
import {applyThemeCss} from '~/components/WebBuilder/services/theme/theme-css'
import {ensureThemeDataSources, getThemeSnapshot} from '~/components/WebBuilder/services/theme/theme-datasource'
import {injectThemeFontsIntoCanvas} from '~/components/WebBuilder/services/theme/theme-fonts'
import grapesjsAosTraits from '~/components/WebBuilder/lib/grapesjs-aos-traits'
import {useAssets} from './useAssets'

// ── Singleton ────────────────────────────────────────────────────────────────

const _editor = shallowRef<Editor | null>(null)
const _ready = ref(false)

// ── Public API ────────────────────────────────────────────────────────────────

export function useEditor() {
    return {
        editor: shallowReadonly(_editor),
        ready: shallowReadonly(_ready),
        initEditor,
        destroyEditor,
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initEditor(container: string | HTMLElement, projectId: string): Editor {
    if (_editor.value) return _editor.value

    const editor = grapesjs.init({
        container,
        height: '100%',
        width: '100%',
        plugins: [grapesjsAosTraits],
        storageManager: {
            type: 'nuxt-api',
            autosave: false,
            autoload: true,
        },


        panels: {defaults: []},

        assetManager: {custom: true},
        blockManager: {custom: true},
        layerManager: {custom: true},
        styleManager: {custom: true},
        traitManager: {custom: true},
        selectorManager: {custom: true, componentFirst: false},

        deviceManager: {
            devices: [
                {name: 'Desktop', width: ''},
                {name: 'Tablet', width: '768px', widthMedia: '1023px'},
                {name: 'Mobile', width: '375px', widthMedia: '767px'},
            ],
        },

        pageManager: {
            pages: [{id: 'initial-page', name: 'Home'}],
        },

        canvas: {
            styles: [
                'https://unpkg.com/reset-css@5.0.2/reset.css'
            ],
            scripts: [],
            frameStyle: `
            * ::-webkit-scrollbar { width: 10 }
            body{background:#ffffff;}
            body .tooto-selected{
                outline: 2px solid #2251ff !important;
            }
         `,
        },
    })

    // Register keymaps
    _registerKeymaps(editor)

    // Register nuxt-api storage adapter
    editor.Storage.add('nuxt-api', {
        async load() {
            try {
                const res = await $fetch<{ data: unknown }>(`/api/projects/${projectId}`)
                return (res as any)?.data ?? {}
            } catch {
                return {}
            }
        },
        async store(data: Record<string, unknown>) {
            await $fetch(`/api/projects/${projectId}`, {method: 'PUT', body: {data}})
        },
    })

    // Register all default blocks
    registerBlocks(editor)

    // Override GrapesJS open-assets command to prevent the default modal
    // and open our custom AssetsModal instead.
    // NOTE: No stop() defined — without it GrapesJS treats this as a plain
    // (non-toggle) command and always calls run(), so re-opening after close works.
    editor.Commands.add('open-assets', {
        run(ed, _sender, opts: {
            types?: string[]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            target?: any
        } = {}) {
            const {openModal} = useAssets()
            openModal((url: string) => {
                // Directly set src on target — bypasses opts.select which expects
                // a GrapesJS Asset model with .getSrc(), causing "getSrc is not a function".
                const target = opts.target ?? ed.getSelected()
                if (target) target.set('src', url)
            })
        },
    })
    const initialTheme = ensureThemeDataSources(editor)
    applyThemeCss(editor, initialTheme)

    editor.onReady(() => {
        const doc = editor.Canvas.getDocument()
        if (doc) {
            const style = doc.createElement('style')
            style.dataset.tooto = 'canvas-base'
            style.textContent = `
        div[data-component-type="container"]:empty{
          min-height: 80px;
        }
      `
            doc.head.appendChild(style)
        }
        injectThemeFontsIntoCanvas(editor, getThemeSnapshot(editor))
        _ready.value = true
    })

    editor.on('storage:end:load', () => {
        const theme = ensureThemeDataSources(editor)
        applyThemeCss(editor, theme)
        injectThemeFontsIntoCanvas(editor, theme)
        _reinjectGoogleFontsIntoCanvas(editor)
    })

    _editor.value = markRaw(editor)
    return editor
}

function destroyEditor(): void {
    if (_editor.value) {
        _editor.value.destroy()
        _editor.value = null
        _ready.value = false
    }
}

// ── Google Fonts re-injection ─────────────────────────────────────────────────

const _SYSTEM_FONTS = new Set([
    'Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Verdana',
    'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
    'Georgia', 'Palatino', 'Book Antiqua', 'Garamond',
    'Times New Roman', 'Courier New', 'Lucida Console', 'Monaco',
    'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
])

const _GENERIC_FAMILIES = new Set([
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
    'inherit', 'initial', 'unset', 'none', '',
])

function _reinjectGoogleFontsIntoCanvas(editor: Editor): void {
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
            if (name && !_GENERIC_FAMILIES.has(name.toLowerCase()) && !_SYSTEM_FONTS.has(name)) {
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

// ── Keymaps ───────────────────────────────────────────────────────────────────
function _registerKeymaps(editor: Editor): void {
    const km = editor.Keymaps

    km.add('ns:undo', 'ctrl+z, cmd+z', () => {
        editor.UndoManager.undo()
    })

    km.add('ns:redo', 'ctrl+shift+z, cmd+shift+z', () => {
        editor.UndoManager.redo()
    })

    km.add('ns:delete', 'backspace, delete', () => {
        const selected = editor.getSelected()
        if (selected && selected.get('removable')) {
            editor.runCommand('core:component-delete')
        }
    })

    km.add('ns:escape', 'escape', () => {
        editor.runCommand('core:component-exit')
    })
}
