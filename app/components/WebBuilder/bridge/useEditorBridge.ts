import { computed, effectScope, onScopeDispose, readonly, ref, watch, type EffectScope } from 'vue'
import type { Editor } from 'grapesjs'
import { useEditor } from '../composables/useEditor'
import type { Device } from '../composables/useDevice'

export interface EditorBridgePageItem {
  id: string
  name: string
}

const _currentDevice = ref<Device>('Desktop')
const _isDirty = ref(false)
const _selectedComponentId = ref<string | null>(null)
const _selectionRevision = ref(0)
const _layersRevision = ref(0)
const _themeRevision = ref(0)
const _pages = ref<EditorBridgePageItem[]>([])
const _selectedPageId = ref('')

let _consumerCount = 0
let _bridgeScope: EffectScope | null = null
let _boundEditor: Editor | null = null
  let _boundHandlers: {
    update: () => void
    storageLoad: () => void
    storageStore: () => void
    storageEndLoad: () => void
    storageEndStore: () => void
    deviceChange: () => void
    selectionChange: () => void
    layersChange: () => void
    pagesChange: () => void
  } | null = null

function _resetState() {
  _currentDevice.value = 'Desktop'
  _isDirty.value = false
  _selectedComponentId.value = null
  _selectionRevision.value = 0
  _layersRevision.value = 0
  _themeRevision.value = 0
  _pages.value = []
  _selectedPageId.value = ''
}

function _syncDirty(editor: Editor) {
  _isDirty.value = (editor.getDirtyCount?.() ?? 0) > 0
}

function _syncDevice(editor: Editor) {
  const device = editor.getDevice?.() as Device | undefined
  if (device) {
    _currentDevice.value = device
  }
}

function _syncSelection(editor: Editor) {
  _selectedComponentId.value = editor.getSelected()?.getId() ?? null
  _selectionRevision.value += 1
}

function _syncLayers(editor: Editor) {
  const root = editor.getWrapper()
  if (!root) return
  _layersRevision.value += 1
}

function _syncPages(editor: Editor) {
  _pages.value = editor.Pages.getAll().map((page) => ({
    id: page.getId(),
    name: page.getName() || 'Untitled',
  }))
  _selectedPageId.value = editor.Pages.getSelected()?.getId() ?? ''
}

function _syncAll(editor: Editor) {
  _syncDirty(editor)
  _syncDevice(editor)
  _syncSelection(editor)
  _syncPages(editor)
  _syncLayers(editor)
}

function _syncTheme() {
  _themeRevision.value += 1
}

function _unbindEditor() {
  if (!_boundEditor || !_boundHandlers) return
  const editor = _boundEditor
  editor.off('update', _boundHandlers.update)
  editor.off('storage:load', _boundHandlers.storageLoad)
  editor.off('storage:store', _boundHandlers.storageStore)
  editor.off('storage:end:load', _boundHandlers.storageEndLoad)
  editor.off('storage:end:store', _boundHandlers.storageEndStore)
  editor.off('device:change', _boundHandlers.deviceChange)
  editor.off('component:selected', _boundHandlers.selectionChange)
  editor.off('component:deselected', _boundHandlers.selectionChange)
  editor.off('component:add', _boundHandlers.layersChange)
  editor.off('component:remove', _boundHandlers.layersChange)
  editor.off('layer:root', _boundHandlers.layersChange)
  editor.off('layer:component', _boundHandlers.layersChange)
  editor.off('page:add', _boundHandlers.pagesChange)
  editor.off('page:remove', _boundHandlers.pagesChange)
  editor.off('page:select', _boundHandlers.pagesChange)
  editor.off('page:update', _boundHandlers.pagesChange)
  _boundEditor = null
  _boundHandlers = null
}

function _bindEditor(editor: Editor) {
  if (_boundEditor === editor) return
  _unbindEditor()
  _boundEditor = editor
  _boundHandlers = {
    update: () => _syncDirty(editor),
    storageLoad: () => _syncAll(editor),
    storageStore: () => _syncAll(editor),
    storageEndLoad: () => {
      _syncAll(editor)
      _syncTheme()
    },
    storageEndStore: () => _syncAll(editor),
    deviceChange: () => _syncDevice(editor),
    selectionChange: () => _syncSelection(editor),
    layersChange: () => _syncLayers(editor),
    pagesChange: () => {
      _syncPages(editor)
      _syncLayers(editor)
    },
  }

  editor.on('update', _boundHandlers.update)
  editor.on('storage:load', _boundHandlers.storageLoad)
  editor.on('storage:store', _boundHandlers.storageStore)
  editor.on('storage:end:load', _boundHandlers.storageEndLoad)
  editor.on('storage:end:store', _boundHandlers.storageEndStore)
  editor.on('device:change', _boundHandlers.deviceChange)
  editor.on('component:selected', _boundHandlers.selectionChange)
  editor.on('component:deselected', _boundHandlers.selectionChange)
  editor.on('component:add', _boundHandlers.layersChange)
  editor.on('component:remove', _boundHandlers.layersChange)
  editor.on('layer:root', _boundHandlers.layersChange)
  editor.on('layer:component', _boundHandlers.layersChange)
  editor.on('page:add', _boundHandlers.pagesChange)
  editor.on('page:remove', _boundHandlers.pagesChange)
  editor.on('page:select', _boundHandlers.pagesChange)
  editor.on('page:update', _boundHandlers.pagesChange)

  _syncAll(editor)
  _syncTheme()
}

function _stopBridgeScope() {
  if (!_bridgeScope) return
  _bridgeScope.stop()
  _bridgeScope = null
}

function _ensureBridgeWatch() {
  if (_bridgeScope) return

  _bridgeScope = effectScope(true)
  _bridgeScope.run(() => {
    const { editor, ready } = useEditor()

    watch([ready, editor], ([isReady, currentEditor], _prev, onCleanup) => {
      if (!isReady || !currentEditor) {
        _unbindEditor()
        _resetState()
        return
      }

      _bindEditor(currentEditor)

      onCleanup(() => {
        if (_boundEditor === currentEditor) {
          _unbindEditor()
        }
      })
    }, { immediate: true })

    onScopeDispose(() => {
      _unbindEditor()
      _resetState()
      _bridgeScope = null
    })
  })
}

export function useEditorBridge() {
  _ensureBridgeWatch()
  _consumerCount += 1

  onScopeDispose(() => {
    _consumerCount = Math.max(0, _consumerCount - 1)
    if (_consumerCount === 0) {
      _stopBridgeScope()
    }
  })

  function setCurrentDevice(device: Device) {
    const editor = _boundEditor
    if (!editor) return
    editor.setDevice(device)
    _currentDevice.value = device
  }

  function selectPage(pageId: string) {
    const editor = _boundEditor
    if (!editor || pageId === _selectedPageId.value) return
    editor.Pages.select(pageId)
    _selectedPageId.value = pageId
  }

  return {
    currentDevice: readonly(_currentDevice),
    isDirty: readonly(_isDirty),
    selectedComponentId: readonly(_selectedComponentId),
    selectionRevision: readonly(_selectionRevision),
    layersRevision: readonly(_layersRevision),
    themeRevision: readonly(_themeRevision),
    hasSelection: computed(() => _selectedComponentId.value !== null),
    pages: readonly(_pages),
    selectedPageId: readonly(_selectedPageId),
    setCurrentDevice,
    selectPage,
  }
}
