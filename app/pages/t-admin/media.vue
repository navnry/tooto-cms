<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1 min-w-0">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">媒体库</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">管理上传的图片和文件</p>
      </div>
      <!-- Upload trigger -->
      <label class="cursor-pointer">
        <input ref="fileInput" type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.zip" class="hidden" @change="handleFileSelect" />
        <NButton type="primary" size="small" @click="fileInput?.click()">
          <template #icon>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </template>
          上传文件
        </NButton>
      </label>
    </header>

    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3">
      <div class="flex gap-1">
        <button
          v-for="f in filters"
          :key="f.key"
          class="px-3 h-7 rounded-md text-[12px] font-medium transition-colors"
          :class="activeFilter === f.key
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          @click="activeFilter = f.key"
        >{{ f.label }}</button>
      </div>
      <div class="flex-1" />
      <NInput v-model:value="search" placeholder="搜索文件…" size="small" clearable class="!w-48">
        <template #prefix>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
          </svg>
        </template>
      </NInput>
    </div>

    <!-- Upload progress -->
    <div v-if="uploading" class="bg-indigo-50 border-b border-indigo-100 px-6 py-2 flex items-center gap-2">
      <NProgress type="line" :percentage="uploadProgress" :show-indicator="false" class="flex-1" />
      <span class="text-[12px] text-indigo-600 shrink-0">上传中… {{ uploadProgress }}%</span>
    </div>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-6">

      <!-- Drag-drop overlay -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm pointer-events-none transition-opacity"
        :class="isDragging ? 'opacity-100' : 'opacity-0'"
      >
        <div class="bg-white rounded-2xl border-2 border-dashed border-indigo-400 px-16 py-10 text-center shadow-xl">
          <svg class="mx-auto mb-3 text-indigo-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p class="font-semibold text-gray-700">松开以上传文件</p>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-if="!pending && !filteredMedia.length"
        class="border-2 border-dashed border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
        @click="fileInput?.click()"
      >
        <div class="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700 text-sm">{{ search ? '未找到匹配文件' : '还没有媒体文件' }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ search ? '试试其他关键词' : '点击或拖拽文件到此处上传' }}</p>
        </div>
      </div>

      <!-- Grid -->
      <NSpin :show="pending">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          <div
            v-for="item in filteredMedia"
            :key="item.id"
            class="group relative bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer
                   hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/8 transition-all"
            @click="selected = selected?.id === item.id ? null : item"
          >
            <!-- Thumbnail -->
            <div class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
              <img
                v-if="isImage(item.mime_type)"
                :src="`/api/media/proxy/${item.key}`"
                :alt="item.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex flex-col items-center gap-1 p-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" :stroke="fileIconColor(item.mime_type)" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="text-[10px] font-bold uppercase text-gray-400">{{ ext(item.name) }}</span>
              </div>
            </div>
            <!-- Info -->
            <div class="px-2 py-1.5">
              <p class="text-[11px] font-medium text-gray-700 truncate leading-tight">{{ item.name }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">{{ formatSize(item.size) }}</p>
            </div>
            <!-- Hover actions -->
            <div class="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
              <button
                class="w-6 h-6 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-white shadow-sm transition-colors"
                title="复制链接"
                @click.stop="copyUrl(item)"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <button
                class="w-6 h-6 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-colors"
                title="删除"
                @click.stop="deleteFile(item)"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
            <!-- Selected ring -->
            <div v-if="selected?.id === item.id" class="absolute inset-0 ring-2 ring-indigo-500 ring-inset rounded-xl pointer-events-none" />
          </div>
        </div>
      </NSpin>
    </main>
  </div>

  <!-- Detail drawer (right side panel) -->
  <Transition name="slide-right">
    <div v-if="selected" class="fixed right-0 top-0 h-screen w-72 bg-white border-l border-gray-200 flex flex-col shadow-xl z-40">
      <div class="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
        <span class="text-[13px] font-semibold text-gray-800 truncate pr-2">{{ selected.name }}</span>
        <button class="text-gray-400 hover:text-gray-600" @click="selected = null">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <!-- Preview -->
      <div class="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 shrink-0">
        <img
          v-if="isImage(selected.mime_type)"
          :src="`/api/media/proxy/${selected.key}`"
          :alt="selected.name"
          class="max-h-full max-w-full object-contain p-4"
        />
        <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" :stroke="fileIconColor(selected.mime_type)" stroke-width="1">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <!-- Meta -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">文件名</p>
          <p class="text-[13px] text-gray-700 break-all">{{ selected.name }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">大小</p>
            <p class="text-[13px] text-gray-700">{{ formatSize(selected.size) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">类型</p>
            <p class="text-[13px] text-gray-700 truncate">{{ selected.mime_type }}</p>
          </div>
        </div>
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">上传时间</p>
          <p class="text-[13px] text-gray-700">{{ new Date(selected.created_at).toLocaleString('zh-CN') }}</p>
        </div>
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">访问链接</p>
          <div class="flex gap-1.5 mt-1">
            <input
              :value="proxyUrl(selected)"
              readonly
              class="flex-1 text-[11px] bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 min-w-0"
            />
            <button
              class="shrink-0 px-2.5 py-1.5 text-[11px] font-medium bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              @click="copyUrl(selected!)"
            >复制</button>
          </div>
        </div>
      </div>
      <div class="px-4 pb-4 shrink-0">
        <NButton type="error" ghost block size="small" @click="deleteFile(selected!)">
          删除此文件
        </NButton>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { NInput, NButton, NSpin, NProgress, useMessage } from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface MediaFile {
  id: string
  key: string
  name: string
  size: number
  mime_type: string
  created_at: string
}

const message = useMessage()
const fileInput = ref<HTMLInputElement | null>(null)

// ── Data ──
const { data: media, pending, refresh } = useFetch<MediaFile[]>('/api/media', {
  default: () => [] as MediaFile[],
})

// ── State ──
const search = ref('')
const activeFilter = ref('all')
const selected = ref<MediaFile | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)

const filters = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'document', label: '文档' },
]

// ── Computed ──
const filteredMedia = computed(() => {
  let list = media.value ?? []
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(q))
  }
  if (activeFilter.value === 'image') list = list.filter(f => f.mime_type.startsWith('image/'))
  else if (activeFilter.value === 'video') list = list.filter(f => f.mime_type.startsWith('video/'))
  else if (activeFilter.value === 'document') list = list.filter(f => !f.mime_type.startsWith('image/') && !f.mime_type.startsWith('video/'))
  return list
})

// ── Drag & drop ──
function onDragover(e: DragEvent) { e.preventDefault(); isDragging.value = true }
function onDragleave() { isDragging.value = false }
function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) uploadFiles(files)
}

onMounted(() => {
  document.addEventListener('dragover', onDragover)
  document.addEventListener('dragleave', onDragleave)
  document.addEventListener('drop', onDrop)
})
onUnmounted(() => {
  document.removeEventListener('dragover', onDragover)
  document.removeEventListener('dragleave', onDragleave)
  document.removeEventListener('drop', onDrop)
})

// ── Upload ──
function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (files.length) uploadFiles(files)
  ;(e.target as HTMLInputElement).value = ''
}

async function uploadFiles(files: File[]) {
  uploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  files.forEach(f => formData.append('file', f, f.name))

  try {
    // Simulate progress (XHR isn't available in $fetch, use XMLHttpRequest for real progress)
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    await new Promise<void>((resolve, reject) => {
      xhr.open('POST', '/api/media')
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error(xhr.statusText))
      }
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(formData)
    })
    message.success(`已上传 ${files.length} 个文件`)
    refresh()
  } catch {
    message.error('上传失败，请重试')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// ── Delete ──
async function deleteFile(item: MediaFile) {
  if (!window.confirm(`确定要删除 "${item.name}" 吗？`)) return
  try {
    await $fetch(`/api/media/${item.id}`, { method: 'DELETE' })
    message.success('已删除')
    if (selected.value?.id === item.id) selected.value = null
    refresh()
  } catch {
    message.error('删除失败')
  }
}

// ── Helpers ──
function proxyUrl(item: MediaFile) {
  return `${window.location.origin}/api/media/proxy/${item.key}`
}

async function copyUrl(item: MediaFile) {
  await navigator.clipboard.writeText(proxyUrl(item))
  message.success('链接已复制')
}

function isImage(mime: string) { return mime.startsWith('image/') }

function fileIconColor(mime: string) {
  if (mime.startsWith('video/')) return '#8b5cf6'
  if (mime.includes('pdf')) return '#ef4444'
  if (mime.includes('zip') || mime.includes('rar')) return '#f59e0b'
  return '#6b7280'
}

function ext(name: string) {
  return name.split('.').pop()?.toUpperCase().slice(0, 4) ?? 'FILE'
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
