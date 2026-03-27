/**
 * useEditor — GrapesJS editor singleton composable
 *
 * Adapted for Nuxt: uses nuxt-api storage (server-side persistence via MySQL)
 * instead of IndexedDB.
 */

import {ref, shallowRef, shallowReadonly, markRaw} from 'vue'
import grapesjs, {type Editor} from 'grapesjs'
import grapesjsAosTraits from '~/components/WebBuilder/lib/grapesjs-aos-traits'
import {createWebBuilderCorePlugin} from '~/components/WebBuilder/core/createWebBuilderCorePlugin'

// ── Singleton ────────────────────────────────────────────────────────────────

const _editor = shallowRef<Editor | null>(null)
const _ready = ref(false)
const _loading = ref(false)
const _error = ref<string | null>(null)
const _loadSucceeded = ref(false)

// ── Public API ────────────────────────────────────────────────────────────────

export function useEditor() {
    return {
        editor: shallowReadonly(_editor),
        ready: shallowReadonly(_ready),
        loading: shallowReadonly(_loading),
        error: shallowReadonly(_error),
        loadSucceeded: shallowReadonly(_loadSucceeded),
        initEditor,
        destroyEditor,
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initEditor(container: string | HTMLElement, projectId: string): Editor | null {
    if (_editor.value) return _editor.value

    _ready.value = false
    _loading.value = true
    _error.value = null
    _loadSucceeded.value = false

    try {
        const editor = grapesjs.init({
            container,
            height: '100%',
            width: '100%',
            storageManager: {
                type: 'nuxt-api',
                autosave: false,
                autoload: true,
            },
            plugins: [
                createWebBuilderCorePlugin(projectId, {
                    onStorageStartLoad() {
                        _loading.value = true
                        _error.value = null
                        _loadSucceeded.value = false
                    },
                    onStorageLoad() {
                        _loadSucceeded.value = true
                    },
                    onStorageErrorLoad(err: unknown) {
                        _error.value = _formatEditorError(err, 'Editor project load failed')
                        _loadSucceeded.value = false
                        _loading.value = false
                    },
                    onStorageEndLoad() {
                        _loading.value = false
                    },
                }),
                grapesjsAosTraits,
            ],

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
                // WebBuilder does not use GrapesJS built-in hover/spacing overlays.
                // Disabling them avoids the native hover-spot pipeline, which can
                // hard-freeze the browser after some custom text/tag mutations.
                customSpots: {
                    hover: true,
                    spacing: true,
                },
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

        editor.onReady(() => {
            _ready.value = true
        })

        _editor.value = markRaw(editor)
        return editor
    } catch (err) {
        _loading.value = false
        _error.value = _formatEditorError(err, 'Failed to initialize editor')
        _loadSucceeded.value = false
        return null
    }
}

function destroyEditor(): void {
    if (_editor.value) {
        _editor.value.destroy()
        _editor.value = null
        _ready.value = false
        _loading.value = false
        _error.value = null
        _loadSucceeded.value = false
    }
}

function _formatEditorError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message.trim()) return err.message
    if (typeof err === 'string' && err.trim()) return err
    if (err && typeof err === 'object') {
        const candidate = err as { message?: unknown; statusMessage?: unknown; data?: unknown }
        if (typeof candidate.statusMessage === 'string' && candidate.statusMessage.trim()) {
            return candidate.statusMessage
        }
        if (typeof candidate.message === 'string' && candidate.message.trim()) {
            return candidate.message
        }
        if (typeof candidate.data === 'string' && candidate.data.trim()) {
            return candidate.data
        }
    }
    return fallback
}
