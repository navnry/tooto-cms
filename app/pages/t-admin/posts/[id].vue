<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="navigateTo('/t-admin/posts')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none truncate">
          {{ isNew ? '新建文章' : (form.title || '编辑文章') }}
        </h1>
      </div>
      <span
        class="text-[11px] font-medium px-2 py-0.5 rounded-md"
        :class="form.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
      >{{ form.status === 'published' ? '已发布' : '草稿' }}</span>
      <NButton size="small" :loading="saving" @click="save('draft')">保存草稿</NButton>
      <NButton type="primary" size="small" :loading="saving" @click="save('published')">发布</NButton>
    </header>

    <!-- Editor layout -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Main content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Title -->
        <NInput
          v-model:value="form.title"
          placeholder="文章标题…"
          size="large"
        />
        <!-- Excerpt -->
        <NInput
          v-model:value="form.excerpt"
          placeholder="摘要（可选）"
          type="textarea"
          :rows="2"
          size="small"
        />
        <!-- Rich text editor -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <!-- Toolbar -->
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
          <!-- Editor content -->
          <EditorContent :editor="editor" class="min-h-[400px] p-4 prose prose-sm max-w-none" />
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="w-64 shrink-0 border-l border-gray-100 bg-white overflow-y-auto p-4 space-y-5">
        <!-- Category -->
        <div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">分类</p>
          <NSelect
            v-model:value="form.category_id"
            :options="categoryOptions"
            placeholder="选择分类"
            clearable
            size="small"
          />
        </div>
        <!-- Tags -->
        <div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">标签</p>
          <NSelect
            v-model:value="form.tag_ids"
            :options="tagOptions"
            placeholder="选择标签"
            multiple
            size="small"
          />
        </div>
        <!-- Cover -->
        <div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">封面图</p>
          <!-- Preview + actions -->
          <div v-if="form.cover" class="relative group rounded-lg overflow-hidden border border-gray-100">
            <img :src="form.cover" class="w-full object-cover aspect-video" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                class="px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                @click="showMediaPicker = true"
              >更换</button>
              <button
                class="px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-red-500 hover:bg-red-50"
                @click="form.cover = ''"
              >移除</button>
            </div>
          </div>
          <button
            v-else
            class="w-full border-2 border-dashed border-gray-200 rounded-lg py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-colors"
            @click="showMediaPicker = true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="text-[11px] font-medium">从媒体库选择</span>
          </button>
        </div>
        <!-- Slug -->
        <div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Slug</p>
          <NInput v-model:value="form.slug" placeholder="url-slug" size="small" />
        </div>
      </aside>
    </div>
  </div>

  <!-- Media picker modal -->
  <Transition name="fade">
    <div v-if="showMediaPicker" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showMediaPicker = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-5 h-13 border-b border-gray-100 shrink-0">
          <p class="text-[14px] font-semibold text-gray-800">选择封面图</p>
          <button class="text-gray-400 hover:text-gray-600" @click="showMediaPicker = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <!-- Search -->
        <div class="px-5 py-3 border-b border-gray-100 shrink-0">
          <NInput v-model:value="mediaSearch" placeholder="搜索图片…" size="small" clearable>
            <template #prefix>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
              </svg>
            </template>
          </NInput>
        </div>
        <!-- Grid -->
        <div class="flex-1 overflow-y-auto p-4">
          <NSpin :show="mediaPending">
            <div v-if="!filteredImages.length" class="py-12 text-center text-gray-400 text-sm">
              {{ mediaSearch ? '未找到匹配图片' : '媒体库暂无图片' }}
            </div>
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              <button
                v-for="img in filteredImages"
                :key="img.id"
                class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
                :class="pickerSelected?.id === img.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-transparent hover:border-indigo-200'"
                @click="pickerSelected = img"
              >
                <img :src="`/api/media/proxy/${img.key}`" :alt="img.name" class="w-full h-full object-cover" loading="lazy" />
                <div v-if="pickerSelected?.id === img.id" class="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </button>
            </div>
          </NSpin>
        </div>
        <!-- Footer -->
        <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p class="text-[12px] text-gray-400">
            {{ pickerSelected ? pickerSelected.name : '未选择' }}
          </p>
          <div class="flex gap-2">
            <NButton size="small" @click="showMediaPicker = false">取消</NButton>
            <NButton type="primary" size="small" :disabled="!pickerSelected" @click="confirmPickerSelection">确认选择</NButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { NButton, NInput, NSelect, NSpin, useMessage } from 'naive-ui'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const message = useMessage()
const postId = route.params.id as string
const isNew = postId === 'new'
const saving = ref(false)

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft' as 'draft' | 'published',
  category_id: null as string | null,
  tag_ids: [] as string[],
  cover: '',
})

// TipTap
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: '开始写作…' }),
    Link.configure({ openOnClick: false }),
  ],
  content: '',
  onUpdate({ editor: e }) {
    form.content = e.getHTML()
  },
})

const toolbarButtons = computed(() => [
  { label: '粗体', icon: 'B', active: () => editor.value?.isActive('bold'), action: () => editor.value?.chain().focus().toggleBold().run() },
  { label: '斜体', icon: 'I', active: () => editor.value?.isActive('italic'), action: () => editor.value?.chain().focus().toggleItalic().run() },
  { label: '删除线', icon: 'S', active: () => editor.value?.isActive('strike'), action: () => editor.value?.chain().focus().toggleStrike().run() },
  { label: '代码', icon: '<>', active: () => editor.value?.isActive('code'), action: () => editor.value?.chain().focus().toggleCode().run() },
  { label: 'H1', icon: 'H1', active: () => editor.value?.isActive('heading', { level: 1 }), action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'H2', icon: 'H2', active: () => editor.value?.isActive('heading', { level: 2 }), action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'H3', icon: 'H3', active: () => editor.value?.isActive('heading', { level: 3 }), action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: '无序列表', icon: '•—', active: () => editor.value?.isActive('bulletList'), action: () => editor.value?.chain().focus().toggleBulletList().run() },
  { label: '有序列表', icon: '1.', active: () => editor.value?.isActive('orderedList'), action: () => editor.value?.chain().focus().toggleOrderedList().run() },
  { label: '引用', icon: '"', active: () => editor.value?.isActive('blockquote'), action: () => editor.value?.chain().focus().toggleBlockquote().run() },
  { label: '代码块', icon: '{}', active: () => editor.value?.isActive('codeBlock'), action: () => editor.value?.chain().focus().toggleCodeBlock().run() },
  { label: '撤销', icon: '↩', active: () => false, action: () => editor.value?.chain().focus().undo().run() },
  { label: '重做', icon: '↪', active: () => false, action: () => editor.value?.chain().focus().redo().run() },
])

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Categories & tags
const { data: categories } = useFetch<{ id: string; name: string }[]>('/api/categories', { default: () => [] })
const { data: tags } = useFetch<{ id: string; name: string }[]>('/api/tags', { default: () => [] })

const categoryOptions = computed(() => (categories.value ?? []).map(c => ({ label: c.name, value: c.id })))
const tagOptions = computed(() => (tags.value ?? []).map(t => ({ label: t.name, value: t.id })))

// Media picker
interface MediaFile { id: string; key: string; name: string; mime_type: string }
const showMediaPicker = ref(false)
const mediaSearch = ref('')
const pickerSelected = ref<MediaFile | null>(null)
const { data: allMedia, pending: mediaPending } = useFetch<MediaFile[]>('/api/media', { default: () => [] })

const filteredImages = computed(() => {
  let list = (allMedia.value ?? []).filter(f => f.mime_type.startsWith('image/'))
  if (mediaSearch.value) {
    const q = mediaSearch.value.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(q))
  }
  return list
})

function confirmPickerSelection() {
  if (!pickerSelected.value) return
  form.cover = `/api/media/proxy/${pickerSelected.value.key}`
  showMediaPicker.value = false
  pickerSelected.value = null
}

// Load existing post
if (!isNew) {
  const { data: post } = await useFetch<any>(`/api/posts/${postId}`)
  if (post.value) {
    form.title = post.value.title
    form.slug = post.value.slug
    form.excerpt = post.value.excerpt ?? ''
    form.content = post.value.content ?? ''
    form.status = post.value.status
    form.category_id = post.value.category_id ?? null
    form.tag_ids = (post.value.tags ?? []).map((t: any) => t.id)
    form.cover = post.value.cover ?? ''
    nextTick(() => {
      editor.value?.commands.setContent(form.content)
    })
  }
}

async function save(status: 'draft' | 'published') {
  saving.value = true
  form.status = status
  try {
    if (isNew) {
      const res = await $fetch<{ id: string }>('/api/posts', {
        method: 'POST',
        body: { ...form },
      })
      message.success(status === 'published' ? '已发布' : '已保存草稿')
      await navigateTo(`/t-admin/posts/${res.id}`)
    } else {
      await $fetch(`/api/posts/${postId}`, { method: 'PUT', body: { ...form } })
      message.success(status === 'published' ? '已发布' : '已保存草稿')
    }
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style>
.ProseMirror {
  min-height: 400px;
  outline: none;
}
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
