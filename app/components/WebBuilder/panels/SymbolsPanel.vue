<script setup lang="ts">
/**
 * SymbolsPanel.vue — Symbol library manager
 *
 * GrapesJS Symbols API (beta, v0.21.11+):
 *   editor.Components.addSymbol(component)   → create symbol OR new instance
 *   editor.Components.getSymbols()           → all Main Symbols
 *   editor.Components.getSymbolInfo(comp)    → { isSymbol, isMain, isInstance, main, instances }
 *   editor.Components.detachSymbol(comp)     → disconnect instance → standalone component
 *   symbolMain.remove()                      → remove main + detach all instances
 *
 * Events: 'symbol' (catch-all), 'component:toggled' (selection change)
 *
 * UI flow:
 *   - "Create Symbol" converts the selected canvas component into a Symbol
 *   - Symbol cards: name (double-click to rename) + instance count + Insert + Delete
 *   - When a symbol component is selected in the canvas, its card highlights
 *   - Footer shows "Detach" when a symbol instance is selected
 */
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { NTooltip, NTag, useMessage } from 'naive-ui'
import { useEditor } from '../composables/useEditor'
import AppIcon from '../ui/AppIcon.vue'

const { editor, ready } = useEditor()
const message = useMessage()

// ── Types ─────────────────────────────────────────────────────────────────────

interface SymbolItem {
  id:            string
  name:          string
  instanceCount: number
}

/** GrapesJS `Component.getName()` is typed as `any` — normalize for safe string assignment */
function displayNameFromUnknown(v: unknown): string {
  if (typeof v === 'string') {
    const t = v.trim()
    return t || 'Untitled Symbol'
  }
  if (v == null) return 'Untitled Symbol'
  if (typeof v === 'number' || typeof v === 'boolean') {
    const t = String(v).trim()
    return t || 'Untitled Symbol'
  }
  return 'Untitled Symbol'
}

// ── State ─────────────────────────────────────────────────────────────────────

const symbols     = ref<SymbolItem[]>([])
const selMainId   = ref<string | null>(null)  // main symbol id of the currently selected component
const selIsInst   = ref(false)                // selected component is an instance
const selIsMain   = ref(false)                // selected component is the main symbol

// ── Sync symbols list ─────────────────────────────────────────────────────────

function syncSymbols() {
  if (!editor.value) return
  symbols.value = editor.value.Components.getSymbols().map((s) => {
    const info = editor.value!.Components.getSymbolInfo(s)
    return {
      id:            s.getId(),
      name:          displayNameFromUnknown(s.getName() as unknown),
      instanceCount: info.instances?.length ?? 0,
    }
  })
}

// ── Sync selection ────────────────────────────────────────────────────────────

function syncSelection() {
  if (!editor.value) { selMainId.value = null; selIsInst.value = false; selIsMain.value = false; return }
  const selected = editor.value.getSelected()
  if (!selected) { selMainId.value = null; selIsInst.value = false; selIsMain.value = false; return }

  const info = editor.value.Components.getSymbolInfo(selected)
  if (!info.isSymbol || !info.isRoot) {
    selMainId.value = null; selIsInst.value = false; selIsMain.value = false; return
  }
  selIsMain.value  = !!info.isMain
  selIsInst.value  = !!info.isInstance
  selMainId.value  = info.isMain
    ? (selected.getId() ?? null)
    : (info.main?.getId() ?? null)
}

// ── Inline rename ─────────────────────────────────────────────────────────────

const renamingId  = ref<string | null>(null)
const renameValue = ref('')
let   _renameEl: HTMLInputElement | null = null

function setRenameRef(el: unknown) { _renameEl = (el as HTMLInputElement) || null }

function startRename(id: string) {
  const s = symbols.value.find(s => s.id === id)
  if (!s) return
  renamingId.value  = id
  renameValue.value = s.name
  void nextTick(() => {
    _renameEl?.focus()
    _renameEl?.select()
  })
}

function commitRename() {
  if (!renamingId.value || !editor.value) return
  const comp = editor.value.Components.getSymbols()
    .find(s => s.getId() === renamingId.value)
  comp?.setName(renameValue.value.trim() || 'Untitled Symbol')
  renamingId.value = null
}

function cancelRename() { renamingId.value = null }

// ── Actions ───────────────────────────────────────────────────────────────────

function createSymbol() {
  if (!editor.value) return
  const selected = editor.value.getSelected()
  if (!selected) {
    message.warning('Select a component on the canvas first')
    return
  }
  const info = editor.value.Components.getSymbolInfo(selected)
  if (info.isSymbol) {
    message.warning('Selected component is already a symbol')
    return
  }
  editor.value.Components.addSymbol(selected)
  message.success('Symbol created')
}

function insertInstance(symbolId: string) {
  if (!editor.value) return
  const main = editor.value.Components.getSymbols()
    .find(s => s.getId() === symbolId)
  if (!main) return

  const instance = editor.value.Components.addSymbol(main)
  if (!instance) return

  // Insert after selected component, or append to wrapper
  const selected = editor.value.getSelected()
  if (selected?.parent()) {
    selected.parent()!.append(instance, { at: selected.index() + 1 })
  } else {
    editor.value.getWrapper()?.append(instance)
  }
  editor.value.select(instance)
}

function deleteSymbol(symbolId: string) {
  if (!editor.value) return
  const main = editor.value.Components.getSymbols()
    .find(s => s.getId() === symbolId)
  if (!main) return
  main.remove()
  message.success('Symbol deleted')
}

function detachSelected() {
  if (!editor.value) return
  const selected = editor.value.getSelected()
  if (!selected) return
  editor.value.Components.detachSymbol(selected)
  syncSelection()
  message.success('Detached — component is now independent')
}

// ── Computed ──────────────────────────────────────────────────────────────────

const detachLabel = computed(() =>
  selIsMain.value ? 'Dissolve symbol (main)' : 'Detach from symbol'
)

// ── Lifecycle ─────────────────────────────────────────────────────────────────

let _symbolHandler:    (() => void) | null = null
let _selectionHandler: (() => void) | null = null

onMounted(() => {
  const bind = () => {
    syncSymbols()
    syncSelection()
    _symbolHandler    = () => { syncSymbols(); syncSelection() }
    _selectionHandler = () => syncSelection()
    editor.value?.on('symbol',             _symbolHandler)
    editor.value?.on('component:toggled',  _selectionHandler)
  }
  if (ready.value) bind()
  else {
    const stop = watch(ready, r => { if (r) { bind(); stop() } })
  }
})

onBeforeUnmount(() => {
  if (_symbolHandler)    editor.value?.off('symbol',            _symbolHandler)
  if (_selectionHandler) editor.value?.off('component:toggled', _selectionHandler)
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b border-[var(--editor-surface-border)]">
      <span class="text-[11px] font-semibold text-[var(--editor-text-muted)] uppercase tracking-widest">
        Symbols
      </span>
      <n-tooltip content="Create symbol from selected component" placement="bottom">
        <template #trigger>
          <button
            type="button"
            class="
              flex items-center gap-1 text-[11px]
              text-[var(--editor-text-muted)] hover:text-[var(--editor-text)]
              transition-colors px-1.5 py-0.5 rounded
              hover:bg-[var(--editor-surface-overlay)]
            "
            @click="createSymbol"
          >
            <AppIcon icon="lucide:plus" :size="13" />
            Create Symbol
          </button>
        </template>
      </n-tooltip>
    </div>

    <!-- Symbol list -->
    <div class="flex-1 overflow-y-auto py-1">

      <!-- Empty state -->
      <div
        v-if="!symbols.length"
        class="flex flex-col items-center justify-center h-full gap-2 px-4 text-center"
      >
        <AppIcon icon="lucide:component" :size="28" class="text-[var(--editor-text-subtle)] opacity-40" />
        <p class="text-[11px] text-[var(--editor-text-subtle)] leading-relaxed">
          No symbols yet.<br>
          Select a component and click<br>
          <span
            class="text-[var(--editor-accent)] cursor-pointer hover:underline"
            @click="createSymbol"
          >Create Symbol</span>.
        </p>
      </div>

      <!-- Symbol cards -->
      <div
        v-for="sym in symbols"
        :key="sym.id"
        :class="[
          'group mx-1 mb-1 rounded-md border transition-colors',
          selMainId === sym.id
            ? 'border-[var(--editor-accent)] bg-[var(--editor-accent)]/10'
            : 'border-[var(--editor-surface-border)] hover:border-[var(--editor-surface-overlay)] bg-[var(--editor-surface-raised)]',
        ]"
      >
        <!-- Card header: icon + name + instance badge -->
        <div class="flex items-center gap-2 px-2.5 pt-2 pb-1.5">
          <!-- Symbol icon -->
          <AppIcon
            icon="lucide:component"
            :size="13"
            :class="selMainId === sym.id ? 'text-[var(--editor-accent)]' : 'text-[var(--editor-text-subtle)]'"
          />

          <!-- Name / inline rename input -->
          <span
            v-if="renamingId !== sym.id"
            class="flex-1 truncate text-[12px] text-[var(--editor-text)] cursor-default"
            :title="'Double-click to rename'"
            @dblclick="startRename(sym.id)"
          >
            {{ sym.name }}
          </span>
          <input
            v-else
            :ref="setRenameRef"
            v-model="renameValue"
            class="symbol-rename-input flex-1"
            @blur="commitRename"
            @keydown.enter.stop="commitRename"
            @keydown.escape.stop="cancelRename"
            @click.stop
          />

          <!-- Instance count -->
          <n-tag
            size="small"
            :bordered="false"
            :type="selMainId === sym.id ? 'info' : 'default'"
            style="font-size: 10px; padding: 0 5px; height: 16px; line-height: 16px; flex-shrink: 0;"
          >
            {{ sym.instanceCount }} {{ sym.instanceCount === 1 ? 'use' : 'uses' }}
          </n-tag>
        </div>

        <!-- Card actions -->
        <div class="flex items-center gap-1 px-2 pb-2">
          <!-- Insert instance -->
          <button
            type="button"
            class="
              flex-1 flex items-center justify-center gap-1
              text-[11px] text-[var(--editor-text-muted)]
              hover:text-[var(--editor-text)] transition-colors
              border border-[var(--editor-surface-border)]
              hover:border-[var(--editor-accent)] hover:bg-[var(--editor-accent)]/10
              rounded py-0.5 px-2
            "
            title="Insert instance into canvas"
            @click="insertInstance(sym.id)"
          >
            <AppIcon icon="lucide:plus" :size="11" />
            Insert
          </button>

          <!-- Rename -->
          <n-tooltip content="Rename" placement="bottom">
            <template #trigger>
              <button
                type="button"
                class="
                  flex items-center p-1 rounded
                  text-[var(--editor-text-subtle)] hover:text-[var(--editor-text)]
                  hover:bg-[var(--editor-surface-overlay)] transition-colors
                "
                @click="startRename(sym.id)"
              >
                <AppIcon icon="lucide:pencil" :size="12" />
              </button>
            </template>
          </n-tooltip>

          <!-- Delete -->
          <n-tooltip content="Delete symbol (detaches all instances)" placement="bottom">
            <template #trigger>
              <button
                type="button"
                class="
                  flex items-center p-1 rounded
                  text-[var(--editor-text-subtle)] hover:text-red-400
                  hover:bg-red-400/10 transition-colors
                "
                @click="deleteSymbol(sym.id)"
              >
                <AppIcon icon="lucide:trash-2" :size="12" />
              </button>
            </template>
          </n-tooltip>
        </div>
      </div>
    </div>

    <!-- Footer: detach action when a symbol is selected on canvas -->
    <div
      v-if="selMainId"
      class="px-3 py-2 border-t border-[var(--editor-surface-border)] flex-shrink-0 space-y-1.5"
    >
      <p class="text-[10px] text-[var(--editor-text-subtle)]">
        Selected:
        <span :class="selIsMain ? 'text-amber-400' : 'text-[var(--editor-accent)]'">
          {{ selIsMain ? 'Main Symbol' : 'Instance' }}
        </span>
        &mdash; {{ symbols.find(s => s.id === selMainId)?.name }}
      </p>
      <button
        type="button"
        class="
          w-full flex items-center justify-center gap-1.5
          text-[11px] text-[var(--editor-text-muted)]
          hover:text-red-400 transition-colors
          border border-[var(--editor-surface-border)]
          hover:border-red-400/40 hover:bg-red-400/5
          rounded py-1
        "
        @click="detachSelected"
      >
        <AppIcon icon="lucide:unlink-2" :size="12" />
        {{ detachLabel }}
      </button>
    </div>

    <!-- Footer: symbol count -->
    <div
      v-else
      class="px-3 py-2 border-t border-[var(--editor-surface-border)] flex-shrink-0"
    >
      <span class="text-[10px] text-[var(--editor-text-subtle)]">
        {{ symbols.length }} symbol{{ symbols.length !== 1 ? 's' : '' }}
      </span>
    </div>

  </div>
</template>

<style scoped>
.symbol-rename-input {
  flex: 1;
  min-width: 0;
  background: var(--editor-input-bg);
  color: var(--editor-text);
  border: 1px solid var(--editor-accent);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}
</style>
