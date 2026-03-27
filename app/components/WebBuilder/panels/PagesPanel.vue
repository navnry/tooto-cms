<script setup lang="ts">
/**
 * PagesPanel.vue — Multi-page manager
 *
 * GrapesJS API used:
 *   editor.Pages.getAll()     → list all pages
 *   editor.Pages.add(props)   → create page
 *   editor.Pages.remove(id)   → delete page
 *   editor.Pages.select(id)   → switch active page (re-renders canvas)
 *   editor.Pages.getSelected() → current page
 *   page.getId() / getName() / setName()
 * Page list and active page state are bridged via useEditorBridge().
 *
 * Fix notes:
 *   - ref inside v-for → use function ref to avoid array wrapping
 *   - NDropdown contextmenu → use trigger="manual" + @contextmenu.prevent
 *     (the reliable Naive UI pattern for programmatic context menus)
 */
import { ref, computed, nextTick } from 'vue'
import { NDropdown, useMessage } from 'naive-ui'
import { useEditor } from '../composables/useEditor'
import { useEditorBridge } from '../bridge/useEditorBridge'
import AppIcon from '../ui/AppIcon.vue'
import PageSettingsModal from './PageSettingsModal.vue'
import type { Page } from 'grapesjs'

const { editor } = useEditor()
const { pages, selectedPageId, selectPage: selectBridgePage } = useEditorBridge()
const message = useMessage()

// ── State ─────────────────────────────────────────────────────────────────────

// ── Page actions ──────────────────────────────────────────────────────────────

function selectPage(id: string) {
  if (!editor.value || id === selectedPageId.value) return
  selectBridgePage(id)
}

function addPage() {
  if (!editor.value) return
  const idx     = editor.value.Pages.getAll().length + 1
  const newPage = editor.value.Pages.add({ name: `Page ${idx}` }) as Page
  editor.value.Pages.select(newPage)
  void nextTick(() => {
    startRename(newPage.getId())
  })
}

function deletePage(id: string) {
  if (!editor.value) return
  if (editor.value.Pages.getAll().length <= 1) {
    message.warning('Cannot delete the last page')
    return
  }
  editor.value.Pages.remove(id)
}

/** Duplicate: serialise via getProjectData() so components + styles are copied. */
function duplicatePage(id: string) {
  if (!editor.value) return
  const data = editor.value.getProjectData() as { pages: Array<Record<string, unknown>> }
  const pageData = data.pages.find(p => p['id'] === id)
  if (!pageData) return
  const { id: _id, ...rest } = pageData
  const newPage = editor.value.Pages.add({
    ...rest,
    name: `${(rest['name'] as string) || 'Untitled'} Copy`,
  }) as Page
  editor.value.Pages.select(newPage)
}

// ── Inline rename ─────────────────────────────────────────────────────────────

const renamingId = ref<string | null>(null)
const renameValue = ref('')
// Function ref — avoids the v-for array-wrapping problem
let _renameEl: HTMLInputElement | null = null
function setRenameRef(el: Element | null) {
  _renameEl = el instanceof HTMLInputElement ? el : null
}

function startRename(id: string) {
  const p = pages.value.find(p => p.id === id)
  if (!p) return
  renamingId.value  = id
  renameValue.value = p.name
  void nextTick(() => {
    _renameEl?.focus()
    _renameEl?.select()
  })
}

function commitRename() {
  if (!renamingId.value || !editor.value) return
  const name = renameValue.value.trim() || 'Untitled'
  editor.value.Pages.get(renamingId.value)?.setName(name)
  renamingId.value = null
}

function cancelRename() { renamingId.value = null }

// ── Page settings modal ───────────────────────────────────────────────────────

const settingsShow   = ref(false)
const settingsPageId = ref('')

function openSettings(id: string) {
  ctxVisible.value   = false
  settingsPageId.value = id
  settingsShow.value   = true
}

// ── Context menu (manual trigger with x/y position) ───────────────────────────

const ctxVisible  = ref(false)
const ctxX        = ref(0)
const ctxY        = ref(0)
const ctxPageId   = ref('')

const ctxOptions = computed(() => {
  const canDelete = pages.value.length > 1
  return [
    { label: 'Settings',  key: 'settings' },
    { label: 'Rename',    key: 'rename' },
    { label: 'Duplicate', key: 'duplicate' },
    { type: 'divider',    key: 'd1' },
    {
      label:    'Delete',
      key:      'delete',
      disabled: !canDelete,
      props:    { style: canDelete ? 'color:#f87171' : '' },
    },
  ]
})

function openContext(e: MouseEvent, id: string) {
  e.preventDefault()
  ctxPageId.value = id
  ctxX.value      = e.clientX
  ctxY.value      = e.clientY
  ctxVisible.value = false
  void nextTick(() => {
    ctxVisible.value = true
  })
}

function onCtxSelect(key: string) {
  ctxVisible.value = false
  if      (key === 'settings')  openSettings(ctxPageId.value)
  else if (key === 'rename')    startRename(ctxPageId.value)
  else if (key === 'duplicate') duplicatePage(ctxPageId.value)
  else if (key === 'delete')    deletePage(ctxPageId.value)
}

</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">

    <!-- Single NDropdown for all context menus (manual trigger, positioned by x/y) -->
    <n-dropdown
      trigger="manual"
      :show="ctxVisible"
      :x="ctxX"
      :y="ctxY"
      :options="ctxOptions"
      placement="bottom-start"
      @select="onCtxSelect"
      @clickoutside="ctxVisible = false"
    />

    <!-- Page settings modal -->
    <PageSettingsModal
      v-model:show="settingsShow"
      :page-id="settingsPageId"
    />

    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b border-[var(--editor-surface-border)]">
      <span class="text-[11px] font-semibold text-[var(--editor-text-muted)] uppercase tracking-widest">
        Pages
      </span>
      <button
        type="button"
        class="
          flex items-center gap-1 text-[11px]
          text-[var(--editor-text-muted)] hover:text-[var(--editor-text)]
          transition-colors px-1.5 py-0.5 rounded
          hover:bg-[var(--editor-surface-overlay)]
        "
        title="New page"
        @click="addPage"
      >
        <AppIcon icon="lucide:plus" :size="13" />
        New page
      </button>
    </div>

    <!-- Page list -->
    <div class="flex-1 overflow-y-auto py-1">
      <div
        v-for="page in pages"
        :key="page.id"
        :class="[
          'flex items-center gap-2 px-3 py-[6px]',
          'cursor-pointer rounded-md mx-1 transition-colors',
          page.id === selectedPageId
            ? 'bg-[var(--editor-accent)]/15 text-[var(--editor-text)]'
            : 'hover:bg-[var(--editor-surface-overlay)] text-[var(--editor-text-muted)]',
        ]"
        @click="selectPage(page.id)"
        @dblclick.stop="startRename(page.id)"
        @contextmenu.prevent="openContext($event, page.id)"
      >
        <!-- Page icon -->
        <span
          class="flex-shrink-0 flex items-center"
          :class="page.id === selectedPageId ? 'text-[var(--editor-accent)]' : 'text-[var(--editor-text-subtle)]'"
        >
          <AppIcon icon="lucide:file" :size="14" />
        </span>

        <!-- Name / rename input -->
        <span v-if="renamingId !== page.id" class="flex-1 leading-[22px] px-[5px] truncate text-[12px]">
          {{ page.name }}
        </span>
        <input
          v-else
          :ref="setRenameRef"
          v-model="renameValue"
          class="page-rename-input"
          @blur="commitRename"
          @keydown.enter.stop="commitRename"
          @keydown.escape.stop="cancelRename"
          @click.stop
        />

        <!-- Active dot -->
        <span
          v-if="page.id === selectedPageId && renamingId !== page.id"
          class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--editor-accent)]"
        />

        <!-- Settings icon (shown on hover via group) -->
        <button
          v-if="renamingId !== page.id"
          type="button"
          class="
            page-settings-btn flex-shrink-0 flex items-center p-0.5 rounded
            text-[var(--editor-text-subtle)] hover:text-[var(--editor-text)]
            transition-colors hover:bg-[var(--editor-surface-border)]
          "
          title="Page settings"
          @click.stop="openSettings(page.id)"
        >
          <AppIcon icon="lucide:settings-2" :size="12" />
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-3 py-2 border-t border-[var(--editor-surface-border)] flex-shrink-0">
      <span class="text-[10px] text-[var(--editor-text-subtle)]">
        {{ pages.length }} page{{ pages.length !== 1 ? 's' : '' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.page-rename-input {
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

/* Hide settings icon by default; show on row hover */
.page-settings-btn { opacity: 0; }
div:hover > .page-settings-btn { opacity: 1; }
</style>
