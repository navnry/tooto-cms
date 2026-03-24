<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">标签管理</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">{{ tags.length }} 个标签</p>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl space-y-4">

        <!-- Add form -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <p class="text-[12px] font-semibold text-gray-700 mb-3">新建标签</p>
          <div class="flex gap-2">
            <NInput v-model:value="newName" placeholder="标签名称" size="small" @keyup.enter="addTag" />
            <NInput v-model:value="newSlug" placeholder="slug（可选）" size="small" class="!w-36" />
            <NButton type="primary" size="small" :loading="adding" @click="addTag">添加</NButton>
          </div>
        </div>

        <!-- Tag chips + inline list -->
        <NSpin :show="pending">
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div v-if="!tags.length" class="py-10 text-center text-gray-400 text-sm">暂无标签</div>
            <div v-for="tag in tags" :key="tag.id" class="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 group">
              <div v-if="editingId !== tag.id" class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-gray-800">{{ tag.name }}</p>
                <p class="text-[11px] text-gray-400">{{ tag.slug }}</p>
              </div>
              <div v-else class="flex-1 flex gap-2">
                <NInput v-model:value="editName" size="small" @keyup.enter="saveEdit(tag)" />
                <NInput v-model:value="editSlug" size="small" class="!w-32" placeholder="slug" />
              </div>
              <div class="flex gap-1">
                <template v-if="editingId !== tag.id">
                  <button
                    class="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                    @click="startEdit(tag)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    class="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    @click="deleteTag(tag)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <NButton size="tiny" type="primary" :loading="saving" @click="saveEdit(tag)">保存</NButton>
                  <NButton size="tiny" @click="editingId = null">取消</NButton>
                </template>
              </div>
            </div>
          </div>
        </NSpin>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NSpin, useMessage } from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface Tag { id: string; name: string; slug: string }

const message = useMessage()
const newName = ref('')
const newSlug = ref('')
const adding = ref(false)
const editingId = ref<string | null>(null)
const editName = ref('')
const editSlug = ref('')
const saving = ref(false)

const { data: tagsData, pending, refresh } = useFetch<Tag[]>('/api/tags', { default: () => [] })
const tags = computed(() => tagsData.value ?? [])

async function addTag() {
  const name = newName.value.trim()
  if (!name) return
  adding.value = true
  try {
    await $fetch('/api/tags', { method: 'POST', body: { name, slug: newSlug.value.trim() || undefined } })
    message.success('已添加')
    newName.value = ''
    newSlug.value = ''
    refresh()
  } catch (e: any) {
    message.error(e?.data?.message ?? '添加失败')
  } finally {
    adding.value = false
  }
}

function startEdit(tag: Tag) {
  editingId.value = tag.id
  editName.value = tag.name
  editSlug.value = tag.slug
}

async function saveEdit(tag: Tag) {
  saving.value = true
  try {
    await $fetch(`/api/tags/${tag.id}`, { method: 'PUT', body: { name: editName.value, slug: editSlug.value } })
    message.success('已保存')
    editingId.value = null
    refresh()
  } catch (e: any) {
    message.error(e?.data?.message ?? '保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteTag(tag: Tag) {
  if (!window.confirm(`确定要删除标签 "${tag.name}" 吗？`)) return
  try {
    await $fetch(`/api/tags/${tag.id}`, { method: 'DELETE' })
    message.success('已删除')
    refresh()
  } catch {
    message.error('删除失败')
  }
}
</script>
