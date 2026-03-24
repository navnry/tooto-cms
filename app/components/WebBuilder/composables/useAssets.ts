/**
 * useAssets — Singleton composable for media asset management
 *
 * Handles:
 *   - Fetching / caching the media list from GET /api/media
 *   - Uploading files via POST /api/media (multipart/form-data)
 *   - Deleting files via DELETE /api/media/:id
 *   - Modal open / select callback state for GrapesJS asset:open integration
 */

import { ref } from 'vue'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string
  key: string
  name: string
  size: number
  mime_type: string
  created_at: string
}

// ── Singleton state ───────────────────────────────────────────────────────────

const _items     = ref<MediaItem[]>([])
const _loading   = ref(false)
const _uploading = ref(false)

// Modal state — opened by GrapesJS asset:open event
const _modalOpen = ref(false)
let _selectCallback: ((url: string) => void) | null = null

// ── Composable ────────────────────────────────────────────────────────────────

export function useAssets() {

  /** Public URL to proxy-serve an R2 object */
  function getProxyUrl(item: Pick<MediaItem, 'key'>): string {
    return `/api/media/proxy/${item.key}`
  }

  /** Human-readable file size */
  function formatSize(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function fetchAssets(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    try {
      const rows = await $fetch<MediaItem[]>('/api/media')
      _items.value = rows
    } finally {
      _loading.value = false
    }
  }

  async function uploadFiles(files: File[]): Promise<MediaItem[]> {
    if (!files.length) return []
    _uploading.value = true
    try {
      const fd = new FormData()
      for (const f of files) fd.append('file', f)
      const inserted = await $fetch<MediaItem[]>('/api/media', {
        method: 'POST',
        body: fd,
      })
      _items.value = [...inserted, ..._items.value]
      return inserted
    } finally {
      _uploading.value = false
    }
  }

  async function deleteAsset(id: string): Promise<void> {
    await $fetch(`/api/media/${id}`, { method: 'DELETE' })
    _items.value = _items.value.filter(i => i.id !== id)
  }

  // ── Modal (GrapesJS integration) ──────────────────────────────────────────

  /** Called by useEditor when GrapesJS fires asset:open */
  function openModal(onSelect: (url: string) => void): void {
    _selectCallback = onSelect
    _modalOpen.value = true
    void fetchAssets()
  }

  function closeModal(): void {
    _modalOpen.value = false
    _selectCallback = null
  }

  /** Called by AssetsModal when the user clicks an image */
  function confirmSelect(url: string): void {
    _selectCallback?.(url)
    closeModal()
  }

  return {
    items:       _items,
    loading:     _loading,
    uploading:   _uploading,
    modalOpen:   _modalOpen,
    getProxyUrl,
    formatSize,
    fetchAssets,
    uploadFiles,
    deleteAsset,
    openModal,
    closeModal,
    confirmSelect,
  }
}
