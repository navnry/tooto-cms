<script setup lang="ts">
/**
 * AssetsModal.vue — Image picker modal for GrapesJS
 *
 * Interaction model:
 *   - Single click  → select (highlight border + enable Confirm button)
 *   - Double click  → immediately confirm & close
 *   - Confirm btn   → confirm selected image & close (only enabled when selection exists)
 *   - Cancel btn    → close without applying
 *
 * Also supports upload (button + drag-and-drop) and delete.
 */
import { ref, computed, watch } from 'vue'
import { NModal, useMessage } from 'naive-ui'
import AppIcon from '../ui/AppIcon.vue'
import { useAssets, type MediaItem } from '../composables/useAssets'

const message = useMessage()
const {
  items, loading, uploading, modalOpen,
  getProxyUrl, formatSize,
  uploadFiles, deleteAsset, closeModal, confirmSelect,
} = useAssets()

// ── State ─────────────────────────────────────────────────────────────────────

const search      = ref('')
const isDragOver  = ref(false)
const fileInput   = ref<HTMLInputElement | null>(null)
const deletingId  = ref<string | null>(null)
const selectedId  = ref<string | null>(null)   // single-click selection

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']

// Reset state when modal opens / closes
watch(modalOpen, (v) => {
  if (!v) {
    search.value     = ''
    selectedId.value = null
  }
})

// ── Filtering ─────────────────────────────────────────────────────────────────

const imageItems = computed(() => {
  const q = search.value.toLowerCase().trim()
  return items.value
    .filter(i => i.mime_type.startsWith('image/'))
    .filter(i => !q || i.name.toLowerCase().includes(q))
})

const selectedItem = computed(() =>
  imageItems.value.find(i => i.id === selectedId.value) ?? null,
)

// ── Upload ────────────────────────────────────────────────────────────────────

function pickFiles() { fileInput.value?.click() }

async function handleFiles(files: FileList | File[]) {
  const list = Array.from(files).filter(f => ACCEPTED.includes(f.type))
  if (!list.length) { message.warning('Only image files are accepted'); return }
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

function onDragEnter(e: DragEvent) { e.preventDefault(); isDragOver.value = true }
function onDragLeave(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el.contains(e.relatedTarget as Node)) isDragOver.value = false
}
function onDragOver(e: DragEvent) { e.preventDefault() }
async function onDrop(e: DragEvent) {
  e.preventDefault(); isDragOver.value = false
  if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function onDelete(item: MediaItem, e: MouseEvent) {
  e.stopPropagation()
  if (deletingId.value === item.id) return
  deletingId.value = item.id
  try {
    await deleteAsset(item.id)
    if (selectedId.value === item.id) selectedId.value = null
  } catch {
    message.error('Delete failed')
  } finally {
    deletingId.value = null
  }
}

// ── Selection & confirm ───────────────────────────────────────────────────────

function onClickItem(item: MediaItem) {
  selectedId.value = item.id
}

function onDblClickItem(item: MediaItem) {
  confirmSelect(getProxyUrl(item))
}

function onConfirm() {
  if (!selectedItem.value) return
  confirmSelect(getProxyUrl(selectedItem.value))
}
</script>

<template>
  <n-modal
    :show="modalOpen"
    :mask-closable="true"
    style="width: min(860px, 95vw)"
    @update:show="(v) => !v && closeModal()"
  >
    <div
      class="
        flex flex-col rounded-xl overflow-hidden
        bg-[var(--editor-surface,#111827)]
        border border-[var(--editor-surface-border)]
        shadow-2xl
      "
      style="max-height: min(80vh, 680px)"
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

      <!-- ── Header ────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--editor-surface-border)] flex-shrink-0">
        <div class="flex items-center gap-2">
          <AppIcon icon="lucide:image" :size="16" class="text-[var(--editor-accent)]" />
          <span class="text-sm font-semibold text-[var(--editor-text)]">Select Image</span>
        </div>
        <button
          class="
            flex items-center border-0 bg-transparent cursor-pointer p-1 rounded
            text-[var(--editor-text-muted)] hover:text-[var(--editor-text)]
            hover:bg-[var(--editor-surface-overlay)] transition-colors
          "
          @click="closeModal"
        >
          <AppIcon icon="lucide:x" :size="16" />
        </button>
      </div>

      <!-- ── Toolbar ───────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--editor-surface-border)] flex-shrink-0">
        <div class="relative flex-1">
          <AppIcon
            icon="lucide:search"
            :size="13"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--editor-text-subtle)] pointer-events-none"
          />
          <input
            v-model="search"
            placeholder="Search images…"
            class="
              w-full h-8 pl-7 pr-6 text-xs rounded-md box-border
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
            flex items-center gap-1.5 flex-shrink-0
            px-3 h-8 rounded-md text-xs font-medium
            bg-[var(--editor-accent)] text-white
            hover:opacity-90 transition-opacity
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          @click="pickFiles"
        >
          <AppIcon :icon="uploading ? 'lucide:loader-2' : 'lucide:upload'" :size="13" :class="uploading ? 'animate-spin' : ''" />
          {{ uploading ? 'Uploading…' : 'Upload' }}
        </button>
      </div>

      <!-- ── Image grid ─────────────────────────────────────────────────── -->
      <div class="flex-1 overflow-y-auto p-4 relative min-h-0">

        <!-- Drag overlay -->
        <Transition name="fade">
          <div
            v-if="isDragOver"
            class="
              absolute inset-0 z-20 flex flex-col items-center justify-center gap-2
              bg-[var(--editor-accent)]/10 border-2 border-dashed border-[var(--editor-accent)]
              rounded-xl m-2 pointer-events-none
            "
          >
            <AppIcon icon="lucide:upload-cloud" :size="32" class="text-[var(--editor-accent)]" />
            <span class="text-sm text-[var(--editor-accent)] font-medium">Drop to upload</span>
          </div>
        </Transition>

        <!-- Loading skeleton -->
        <template v-if="loading && !items.length">
          <div class="grid grid-cols-4 gap-3">
            <div v-for="n in 8" :key="n" class="aspect-square rounded-lg bg-[var(--editor-input-bg)] animate-pulse" />
          </div>
        </template>

        <!-- Empty state -->
        <div
          v-else-if="!imageItems.length"
          class="flex flex-col items-center gap-3 py-16 text-[var(--editor-text-subtle)]"
        >
          <AppIcon icon="lucide:image-off" :size="36" class="opacity-30" />
          <div class="text-center">
            <p class="text-sm">{{ search ? 'No images match your search' : 'No images uploaded yet' }}</p>
            <p v-if="!search" class="text-xs mt-1 opacity-70">Click Upload or drag &amp; drop images here</p>
          </div>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-4 gap-3">
          <div
            v-for="item in imageItems"
            :key="item.id"
            class="
              group relative rounded-lg overflow-hidden cursor-pointer
              border-2 transition-all duration-150
              bg-[var(--editor-input-bg)]
            "
            :class="
              selectedId === item.id
                ? 'border-[var(--editor-accent)] shadow-[0_0_0_1px_var(--editor-accent),0_4px_16px_rgba(91,142,255,0.25)]'
                : 'border-transparent hover:border-[var(--editor-accent)]/50'
            "
            :title="item.name"
            @click="onClickItem(item)"
            @dblclick="onDblClickItem(item)"
          >
            <!-- Checkerboard bg -->
            <div class="
              aspect-square overflow-hidden
              bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)]
              bg-[length:14px_14px]
            ">
              <img
                :src="getProxyUrl(item)"
                :alt="item.name"
                class="w-full h-full object-contain transition-transform duration-150 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <!-- Selected checkmark badge -->
            <div
              v-if="selectedId === item.id"
              class="
                absolute top-1.5 left-1.5 z-10
                w-5 h-5 rounded-full bg-[var(--editor-accent)]
                flex items-center justify-center shadow-md
              "
            >
              <AppIcon icon="lucide:check" :size="11" class="text-white" />
            </div>

            <!-- Delete button -->
            <button
              class="
                absolute top-1.5 right-1.5 z-10
                flex items-center justify-center w-6 h-6 rounded-md
                bg-[#111]/70 text-red-400
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

            <!-- Filename at bottom -->
            <div class="
              absolute bottom-0 left-0 right-0
              bg-gradient-to-t from-black/60 to-transparent
              px-1.5 py-1.5
              opacity-0 group-hover:opacity-100 transition-opacity
            ">
              <p class="text-[10px] text-white/90 truncate leading-tight">{{ item.name }}</p>
              <p class="text-[9px] text-white/60">{{ formatSize(item.size) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Footer ────────────────────────────────────────────────────── -->
      <div class="
        flex items-center justify-between
        px-4 py-2.5
        border-t border-[var(--editor-surface-border)]
        flex-shrink-0
      ">
        <!-- Selection hint -->
        <span class="text-[11px] text-[var(--editor-text-subtle)]">
          <template v-if="selectedItem">
            <span class="text-[var(--editor-accent)]">{{ selectedItem.name }}</span>
            · {{ formatSize(selectedItem.size) }}
          </template>
          <template v-else>
            {{ imageItems.length }} image{{ imageItems.length !== 1 ? 's' : '' }}
            · Click to select, double-click to insert
          </template>
        </span>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="
              px-4 h-8 rounded-md text-xs font-medium
              bg-[var(--editor-surface-overlay)] text-[var(--editor-text-muted)]
              hover:text-[var(--editor-text)] transition-colors
              border border-[var(--editor-input-border)]
            "
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedItem"
            class="
              flex items-center gap-1.5
              px-4 h-8 rounded-md text-xs font-semibold
              bg-[var(--editor-accent)] text-white
              hover:opacity-90 transition-opacity
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            @click="onConfirm"
          >
            <AppIcon icon="lucide:check" :size="13" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
