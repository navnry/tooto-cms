<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="navigateTo('/t-admin/products')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none truncate">
          {{ isNew ? '新建产品' : (form.name || '编辑产品') }}
        </h1>
      </div>
      <span class="text-[11px] font-medium px-2 py-0.5 rounded-md" :class="statusClass(form.status)">
        {{ statusLabel(form.status) }}
      </span>
      <NButton size="small" :loading="saving" @click="save('draft')">保存草稿</NButton>
      <NButton type="primary" size="small" :loading="saving" @click="save('active')">上架</NButton>
    </header>

    <!-- Body -->
    <div class="flex-1 flex overflow-hidden">

      <!-- Main -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5">

        <!-- Basic info card -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">基本信息</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="field-label">产品名称 <span class="text-red-400">*</span></label>
              <NInput v-model:value="form.name" placeholder="请输入产品名称" />
            </div>
            <div>
              <label class="field-label">SKU 编码</label>
              <NInput v-model:value="form.sku" placeholder="例：ABC-001" />
            </div>
            <div>
              <label class="field-label">品牌</label>
              <NInput v-model:value="form.brand" placeholder="品牌名称" />
            </div>
            <div class="col-span-2">
              <label class="field-label">简短描述</label>
              <NInput v-model:value="form.short_desc" type="textarea" :rows="2" placeholder="一句话介绍产品…" />
            </div>
          </div>
        </div>

        <!-- Pricing & trade card -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">价格与交易</p>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="field-label">含税单价（¥）</label>
              <NInputNumber v-model:value="form.price" :precision="2" :min="0" placeholder="0.00" class="w-full" />
            </div>
            <div>
              <label class="field-label">计量单位</label>
              <NSelect v-model:value="form.unit" :options="unitOptions" />
            </div>
            <div>
              <label class="field-label">最小起订量</label>
              <NInputNumber v-model:value="form.min_order_qty" :min="1" :precision="0" class="w-full" />
            </div>
            <div>
              <label class="field-label">重量（kg）</label>
              <NInputNumber v-model:value="form.weight" :precision="3" :min="0" placeholder="0.000" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Specs card -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">规格参数</p>
            <button class="text-[12px] text-indigo-500 hover:text-indigo-700 font-medium" @click="addSpec">+ 添加参数</button>
          </div>
          <div v-if="!form.specs.length" class="py-4 text-center text-[12px] text-gray-400">暂无参数，点击上方添加</div>
          <div v-for="(spec, i) in form.specs" :key="i" class="flex gap-2 items-center">
            <NInput v-model:value="spec.key" placeholder="参数名（如：材质）" size="small" class="!w-40" />
            <NInput v-model:value="spec.value" placeholder="参数值（如：304不锈钢）" size="small" class="flex-1" />
            <button class="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors shrink-0" @click="removeSpec(i)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Description card -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
            <p class="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">详细描述</p>
          </div>
          <div class="border-b border-gray-100 px-3 py-2 flex flex-wrap gap-1">
            <button
              v-for="btn in toolbarButtons"
              :key="btn.label"
              class="px-2 h-7 rounded text-[12px] font-medium transition-colors"
              :class="btn.active?.() ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'"
              :title="btn.label"
              @click="btn.action()"
            >{{ btn.icon }}</button>
          </div>
          <EditorContent :editor="editor" class="min-h-[300px] p-4 prose prose-sm max-w-none" />
        </div>

      </div>

      <!-- Sidebar -->
      <aside class="w-72 shrink-0 border-l border-gray-100 bg-white overflow-y-auto">

        <!-- Cover -->
        <div class="p-4 border-b border-gray-100">
          <p class="field-label mb-2">封面图</p>
          <div v-if="form.cover" class="relative group rounded-lg overflow-hidden border border-gray-100">
            <img :src="form.cover" class="w-full object-cover aspect-video" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button class="px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-100" @click="openPicker('cover')">更换</button>
              <button class="px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-red-500 hover:bg-red-50" @click="form.cover = ''">移除</button>
            </div>
          </div>
          <button
            v-else
            class="w-full border-2 border-dashed border-gray-200 rounded-lg py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-colors"
            @click="openPicker('cover')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="text-[11px] font-medium">从媒体库选择</span>
          </button>
        </div>

        <!-- Gallery -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <p class="field-label">产品图册</p>
            <button class="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium" @click="openPicker('gallery')">+ 添加</button>
          </div>
          <div v-if="!form.images.length" class="text-[11px] text-gray-400 text-center py-3">暂无图册</div>
          <div class="grid grid-cols-4 gap-1.5">
            <div v-for="(img, i) in form.images" :key="i" class="relative group aspect-square rounded-md overflow-hidden border border-gray-100">
              <img :src="img" class="w-full h-full object-cover" />
              <button
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                @click="removeImage(i)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Classify -->
        <div class="p-4 border-b border-gray-100 space-y-3">
          <p class="field-label">分类与标签</p>
          <div>
            <label class="text-[11px] text-gray-400 mb-1 block">产品分类</label>
            <NSelect v-model:value="form.category_id" :options="categoryOptions" placeholder="选择分类" clearable size="small" />
          </div>
          <div>
            <label class="text-[11px] text-gray-400 mb-1 block">标签</label>
            <NSelect v-model:value="form.tag_ids" :options="tagOptions" placeholder="选择标签" multiple size="small" />
          </div>
        </div>

        <!-- Attachments -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <p class="field-label">附件（资料/手册）</p>
            <button class="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium" @click="openPicker('attachment')">+ 添加</button>
          </div>
          <div v-if="!form.attachments.length" class="text-[11px] text-gray-400 text-center py-2">暂无附件</div>
          <div v-for="(att, i) in form.attachments" :key="i" class="flex items-center gap-2 py-1.5 group">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" class="shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span class="flex-1 text-[11px] text-gray-600 truncate">{{ att.name }}</span>
            <button class="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors shrink-0" @click="removeAttachment(i)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Meta -->
        <div class="p-4 space-y-3">
          <p class="field-label">其他设置</p>
          <div>
            <label class="text-[11px] text-gray-400 mb-1 block">状态</label>
            <NSelect v-model:value="form.status" :options="statusOptions" size="small" />
          </div>
          <div>
            <label class="text-[11px] text-gray-400 mb-1 block">Slug</label>
            <NInput v-model:value="form.slug" placeholder="product-url-slug" size="small" />
          </div>
        </div>

      </aside>
    </div>
  </div>

  <!-- Media picker modal -->
  <Transition name="fade">
    <div v-if="showMediaPicker" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showMediaPicker = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
          <p class="text-[14px] font-semibold text-gray-800">
            {{ pickerMode === 'cover' ? '选择封面图' : pickerMode === 'gallery' ? '添加产品图片' : '选择附件' }}
          </p>
          <button class="text-gray-400 hover:text-gray-600" @click="showMediaPicker = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="px-5 py-3 border-b border-gray-100 shrink-0">
          <NInput v-model:value="mediaSearch" placeholder="搜索文件…" size="small" clearable>
            <template #prefix>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
              </svg>
            </template>
          </NInput>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <NSpin :show="mediaPending">
            <div v-if="!filteredMedia.length" class="py-12 text-center text-gray-400 text-sm">暂无文件</div>
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              <button
                v-for="item in filteredMedia"
                :key="item.id"
                class="relative rounded-lg overflow-hidden border-2 transition-all"
                :class="pickerSelected.some(s => s.id === item.id)
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-transparent hover:border-indigo-200'"
                @click="togglePickerItem(item)"
              >
                <div class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img v-if="item.mime_type.startsWith('image/')" :src="`/api/media/proxy/${item.key}`" class="w-full h-full object-cover" loading="lazy" />
                  <div v-else class="flex flex-col items-center gap-1 p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span class="text-[10px] font-bold uppercase text-gray-400">{{ item.name.split('.').pop()?.slice(0,4) }}</span>
                  </div>
                </div>
                <div v-if="pickerSelected.some(s => s.id === item.id)" class="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </button>
            </div>
          </NSpin>
        </div>
        <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p class="text-[12px] text-gray-400">已选 {{ pickerSelected.length }} 个</p>
          <div class="flex gap-2">
            <NButton size="small" @click="showMediaPicker = false">取消</NButton>
            <NButton type="primary" size="small" :disabled="!pickerSelected.length" @click="confirmPicker">确认</NButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { NButton, NInput, NInputNumber, NSelect, NSpin, useMessage } from 'naive-ui'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const message = useMessage()
const productId = route.params.id as string
const isNew = productId === 'new'
const saving = ref(false)

interface SpecItem { key: string; value: string }
interface AttachmentItem { name: string; url: string }
interface MediaFile { id: string; key: string; name: string; mime_type: string }

const form = reactive({
  name: '',
  sku: '',
  slug: '',
  short_desc: '',
  description: '',
  brand: '',
  status: 'draft' as 'draft' | 'active' | 'discontinued',
  unit: '件',
  price: null as number | null,
  min_order_qty: 1,
  weight: null as number | null,
  category_id: null as string | null,
  tag_ids: [] as string[],
  cover: '',
  images: [] as string[],
  specs: [] as SpecItem[],
  attachments: [] as AttachmentItem[],
})

// TipTap
const editor = useEditor({
  extensions: [StarterKit, Placeholder.configure({ placeholder: '填写详细产品描述…' })],
  content: '',
  onUpdate({ editor: e }) { form.description = e.getHTML() },
})

const toolbarButtons = computed(() => [
  { label: '粗体', icon: 'B', active: () => editor.value?.isActive('bold'), action: () => editor.value?.chain().focus().toggleBold().run() },
  { label: '斜体', icon: 'I', active: () => editor.value?.isActive('italic'), action: () => editor.value?.chain().focus().toggleItalic().run() },
  { label: 'H2', icon: 'H2', active: () => editor.value?.isActive('heading', { level: 2 }), action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'H3', icon: 'H3', active: () => editor.value?.isActive('heading', { level: 3 }), action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: '无序列表', icon: '•—', active: () => editor.value?.isActive('bulletList'), action: () => editor.value?.chain().focus().toggleBulletList().run() },
  { label: '有序列表', icon: '1.', active: () => editor.value?.isActive('orderedList'), action: () => editor.value?.chain().focus().toggleOrderedList().run() },
  { label: '撤销', icon: '↩', active: () => false, action: () => editor.value?.chain().focus().undo().run() },
  { label: '重做', icon: '↪', active: () => false, action: () => editor.value?.chain().focus().redo().run() },
])

onBeforeUnmount(() => editor.value?.destroy())

// Options
const unitOptions = ['件', '箱', '套', '个', '台', '张', 'kg', 'g', 'm', 'm²', 'm³', 'L'].map(v => ({ label: v, value: v }))
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '上架', value: 'active' },
  { label: '停产', value: 'discontinued' },
]

function statusLabel(s: string) {
  return { draft: '草稿', active: '上架', discontinued: '停产' }[s] ?? s
}
function statusClass(s: string) {
  return { active: 'bg-green-50 text-green-600', draft: 'bg-gray-100 text-gray-500', discontinued: 'bg-red-50 text-red-400' }[s] ?? 'bg-gray-100 text-gray-500'
}

// Categories & tags
const { data: categories } = useFetch<{ id: string; name: string; parent_name: string | null }[]>('/api/product-categories', { default: () => [] })
const { data: tags } = useFetch<{ id: string; name: string }[]>('/api/tags', { default: () => [] })
const categoryOptions = computed(() =>
  (categories.value ?? []).map(c => ({
    label: c.parent_name ? `${c.parent_name} / ${c.name}` : c.name,
    value: c.id,
  })),
)
const tagOptions = computed(() => (tags.value ?? []).map(t => ({ label: t.name, value: t.id })))

// Specs
function addSpec() { form.specs.push({ key: '', value: '' }) }
function removeSpec(i: number) { form.specs.splice(i, 1) }

// Images
function removeImage(i: number) { form.images.splice(i, 1) }
function removeAttachment(i: number) { form.attachments.splice(i, 1) }

// Media picker
const showMediaPicker = ref(false)
const pickerMode = ref<'cover' | 'gallery' | 'attachment'>('cover')
const mediaSearch = ref('')
const pickerSelected = ref<MediaFile[]>([])
const { data: allMedia, pending: mediaPending } = useFetch<MediaFile[]>('/api/media', { default: () => [] })

const filteredMedia = computed(() => {
  let list = allMedia.value ?? []
  // For cover/gallery, show only images; for attachment, show all
  if (pickerMode.value !== 'attachment') list = list.filter(f => f.mime_type.startsWith('image/'))
  if (mediaSearch.value) {
    const q = mediaSearch.value.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(q))
  }
  return list
})

function openPicker(mode: 'cover' | 'gallery' | 'attachment') {
  pickerMode.value = mode
  pickerSelected.value = []
  mediaSearch.value = ''
  showMediaPicker.value = true
}

function togglePickerItem(item: MediaFile) {
  if (pickerMode.value === 'cover') {
    // Single select
    pickerSelected.value = [item]
  } else {
    const idx = pickerSelected.value.findIndex(s => s.id === item.id)
    if (idx >= 0) pickerSelected.value.splice(idx, 1)
    else pickerSelected.value.push(item)
  }
}

function confirmPicker() {
  if (pickerMode.value === 'cover') {
    form.cover = pickerSelected.value[0] ? `/api/media/proxy/${pickerSelected.value[0].key}` : ''
  } else if (pickerMode.value === 'gallery') {
    for (const item of pickerSelected.value) {
      const url = `/api/media/proxy/${item.key}`
      if (!form.images.includes(url)) form.images.push(url)
    }
  } else {
    for (const item of pickerSelected.value) {
      const url = `/api/media/proxy/${item.key}`
      if (!form.attachments.find(a => a.url === url)) {
        form.attachments.push({ name: item.name, url })
      }
    }
  }
  showMediaPicker.value = false
}

// Load existing product
if (!isNew) {
  const { data: product } = await useFetch<any>(`/api/products/${productId}`)
  if (product.value) {
    const p = product.value
    form.name = p.name
    form.sku = p.sku ?? ''
    form.slug = p.slug
    form.short_desc = p.short_desc ?? ''
    form.description = p.description ?? ''
    form.brand = p.brand ?? ''
    form.status = p.status
    form.unit = p.unit
    form.price = p.price != null ? Number(p.price) : null
    form.min_order_qty = p.min_order_qty
    form.weight = p.weight != null ? Number(p.weight) : null
    form.category_id = p.category_id ?? null
    form.tag_ids = (p.tags ?? []).map((t: any) => t.id)
    form.cover = p.cover ?? ''
    form.images = Array.isArray(p.images) ? p.images : []
    form.specs = Array.isArray(p.specs) ? p.specs : []
    form.attachments = Array.isArray(p.attachments) ? p.attachments : []
    nextTick(() => editor.value?.commands.setContent(form.description))
  }
}

async function save(status: 'draft' | 'active' | 'discontinued') {
  if (!form.name.trim()) { message.warning('请填写产品名称'); return }
  saving.value = true
  form.status = status
  const body = {
    ...form,
    price: form.price,
    weight: form.weight,
    specs: form.specs.filter(s => s.key.trim()),
  }
  try {
    if (isNew) {
      const res = await $fetch<{ id: string }>('/api/products', { method: 'POST', body })
      message.success('已保存')
      await navigateTo(`/t-admin/products/${res.id}`)
    } else {
      await $fetch(`/api/products/${productId}`, { method: 'PUT', body })
      message.success('已保存')
    }
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style>
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}
.ProseMirror { min-height: 300px; outline: none; }
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left; color: #adb5bd; pointer-events: none; height: 0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
