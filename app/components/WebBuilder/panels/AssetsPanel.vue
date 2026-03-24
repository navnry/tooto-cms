<script setup lang="ts">
/**
 * AssetsPanel.vue — Media library panel (left sidebar)
 *
 * Features:
 *   - Image grid (2 columns) with thumbnail preview
 *   - Upload button + drag-and-drop into the panel
 *   - Delete button on hover
 *   - Click to apply: if an <img> component is selected in canvas → sets its src
 *                     otherwise → copies the proxy URL to clipboard
 *   - Search / filter by filename
 */
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import AppIcon from '../ui/AppIcon.vue'
import { useAssets, type MediaItem } from '../composables/useAssets'
import { useEditor } from '../composables/useEditor'

const message = useMessage()
const { items, loading, uploading, getProxyUrl, formatSize, fetchAssets, uploadFiles, deleteAsset } = useAssets()
const { editor } = useEditor()

// ── State ─────────────────────────────────────────────────────────────────────

const search    = ref('')
const isDragOver = ref(false)
const fileInput  = ref<HTMLInputElement | null>(null)

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']

// ── Filtered list ─────────────────────────────────────────────────────────────

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return items.value
  return items.value.filter(item => item.name.toLowerCase().includes(q))
})

const imageItems = computed(() =>
  filtered.value.filter(i => i.mime_type.startsWith('image/')),
)

// ── Upload ────────────────────────────────────────────────────────────────────

function pickFiles() {
  fileInput.value?.click()
}

async function handleFiles(files: FileList | File[]) {
  const list = Array.from(files).filter(f => ACCEPTED_TYPES.includes(f.type))
  if (!list.length) {
    message.warning('Only image files are accepted')
    return
  }
  try {
    await uploadFiles(list)
    message.success(`${list.length} file${list.length > 1 ? 's' : ''} uploaded`)
  } catch {
    message.error('Upload failed')
  }
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) handleFiles(input.files)
  input.value = ''
}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}
function onDragLeave(e: DragEvent) {
  // Only leave if we exit the panel entirely
  const el = e.currentTarget as HTMLElement
  if (!el.contains(e.relatedTarget as Node)) isDragOver.value = false
}
function onDragOver(e: DragEvent) { e.preventDefault() }

async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
}

// ── Delete ────────────────────────────────────────────────────────────────────

const deletingId = ref<string | null>(null)

async function onDelete(item: MediaItem, e: MouseEvent) {
  e.stopPropagation()
  if (deletingId.value === item.id) return
  deletingId.value = item.id
  try {
    await deleteAsset(item.id)
    message.success('Deleted')
  } catch {
    message.error('Delete failed')
  } finally {
    deletingId.value = null
  }
}

// ── Click to apply ────────────────────────────────────────────────────────────

async function onClickAsset(item: MediaItem) {
  const url = getProxyUrl(item)

  const sel = editor.value?.getSelected()
  if (sel && sel.get('type') === 'image') {
    sel.set('src', url)
    message.success('Image applied')
    return
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url)
    message.success('URL copied to clipboard')
  } catch {
    message.error('Failed to copy URL')
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => { void fetchAssets() })
</script>

<template>
  <div
    class="flex flex-col h-full overflow-hidden"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onFileInput"
    />

    <!-- ── Search + Upload ─────────────────────────────────────────────── -->
    <div class="flex items-center gap-2 px-[10px] pt-[10px] pb-2 flex-shrink-0 border-b border-[var(--editor-surface-border)]">
      <div class="relative flex-1">
        <AppIcon
          icon="lucide:search"
          :size="13"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--editor-text-subtle)] pointer-events-none"
        />
        <input
          v-model="search"
          placeholder="Search assets…"
          class="
            w-full h-[30px] pl-7 pr-6 text-xs rounded-md box-border
            bg-[var(--editor-input-bg)] border border-[var(--editor-input-border)]
            text-[var(--editor-text)] outline-none transition-colors
            placeholder:text-[var(--editor-text-subtle)]
            focus:border-[var(--editor-accent)]
          "
        />
        <button
          v-if="search"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center
                 border-0 bg-transparent cursor-pointer text-[var(--editor-text-muted)] p-0
                 hover:text-[var(--editor-text)]"
          @click="search = ''"
        >
          <AppIcon icon="lucide:x" :size="11" />
        </button>
      </div>

      <button
        :disabled="uploading"
        class="
          flex items-center gap-1 flex-shrink-0
          px-2 h-[30px] rounded-md text-[11px] font-medium
          bg-[var(--editor-accent)] text-white
          hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
        "
        title="Upload images"
        @click="pickFiles"
      >
        <AppIcon icon="lucide:upload" :size="12" />
        Upload
      </button>
    </div>

    <!-- ── Asset grid ──────────────────────────────────────────────────── -->
    <div class="flex-1 overflow-y-auto p-2 relative">

      <!-- Drag overlay -->
      <Transition name="fade">
        <div
          v-if="isDragOver"
          class="
            absolute inset-0 z-20 flex flex-col items-center justify-center gap-2
            bg-[var(--editor-accent)]/10 border-2 border-dashed border-[var(--editor-accent)]
            rounded-lg m-1 pointer-events-none
          "
        >
          <AppIcon icon="lucide:upload-cloud" :size="28" class="text-[var(--editor-accent)]" />
          <span class="text-xs text-[var(--editor-accent)] font-medium">Drop to upload</span>
        </div>
      </Transition>

      <!-- Loading skeleton -->
      <template v-if="loading && !items.length">
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="n in 6"
            :key="n"
            class="aspect-square rounded-lg bg-[var(--editor-input-bg)] animate-pulse"
          />
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-else-if="!imageItems.length && !loading"
        class="flex flex-col items-center gap-2 mt-12 text-[var(--editor-text-subtle)]"
      >
        <AppIcon icon="lucide:image" :size="28" class="opacity-30" />
        <span class="text-xs text-center">
          {{ search ? 'No images match your search' : 'No images yet.\nDrop files or click Upload.' }}
        </span>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-2 gap-2">
        <div
          v-for="item in imageItems"
          :key="item.id"
          class="
            group relative rounded-lg overflow-hidden
            border border-[var(--editor-input-border)]
            bg-[var(--editor-input-bg)] cursor-pointer
            transition-all duration-150
            hover:border-[var(--editor-accent-muted-border)]
            hover:shadow-[0_2px_8px_rgba(91,142,255,0.12)]
          "
          :title="item.name"
          @click="onClickAsset(item)"
        >
          <!-- Thumbnail -->
          <div class="aspect-square overflow-hidden bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]">
            <img
              :src="getProxyUrl(item)"
              :alt="item.name"
              class="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <!-- Hover overlay -->
          <div class="
            absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
            transition-opacity pointer-events-none
          " />

          <!-- Delete button -->
          <button
            class="
              absolute top-1 right-1 z-10
              flex items-center justify-center w-6 h-6 rounded-md
              bg-[#1a1a2e]/80 text-red-400
              opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-red-500/20 hover:text-red-300
              border-0 cursor-pointer
            "
            :class="{ 'opacity-100': deletingId === item.id }"
            :disabled="deletingId === item.id"
            title="Delete"
            @click.stop="onDelete(item, $event)"
          >
            <AppIcon
              :icon="deletingId === item.id ? 'lucide:loader-2' : 'lucide:trash-2'"
              :size="12"
              :class="deletingId === item.id ? 'animate-spin' : ''"
            />
          </button>

          <!-- Name + size -->
          <div class="px-1.5 py-1.5 border-t border-[var(--editor-input-border)]">
            <p class="text-[10px] text-[var(--editor-text-muted)] truncate leading-tight">
              {{ item.name }}
            </p>
            <p class="text-[9px] text-[var(--editor-text-subtle)] mt-0.5">
              {{ formatSize(item.size) }}
            </p>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Footer ──────────────────────────────────────────────────────── -->
    <div class="px-3 py-2 border-t border-[var(--editor-surface-border)] flex-shrink-0 flex items-center gap-1.5">
      <AppIcon icon="lucide:info" :size="11" class="text-[var(--editor-text-subtle)]" />
      <span class="text-[10px] text-[var(--editor-text-subtle)]">
        {{ imageItems.length }} image{{ imageItems.length !== 1 ? 's' : '' }}
        · Click to apply or copy URL
      </span>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
