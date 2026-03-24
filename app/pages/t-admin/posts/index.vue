<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1 min-w-0">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">文章管理</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">{{ total }} 篇文章</p>
      </div>
      <NButton type="primary" size="small" @click="navigateTo('/t-admin/posts/new')">
        <template #icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </template>
        新建文章
      </NButton>
    </header>

    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3">
      <div class="flex gap-1">
        <button
          v-for="f in statusFilters"
          :key="f.key"
          class="px-3 h-7 rounded-md text-[12px] font-medium transition-colors"
          :class="activeStatus === f.key
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          @click="activeStatus = f.key"
        >{{ f.label }}</button>
      </div>
      <div class="flex-1" />
      <NInput v-model:value="search" placeholder="搜索文章…" size="small" clearable class="!w-52">
        <template #prefix>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
          </svg>
        </template>
      </NInput>
    </div>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <!-- Empty -->
      <div
        v-if="!pending && !filteredPosts.length"
        class="border-2 border-dashed border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3"
      >
        <div class="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700 text-sm">{{ search ? '未找到匹配文章' : '还没有文章' }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ search ? '试试其他关键词' : '点击右上角新建文章' }}</p>
        </div>
      </div>

      <!-- Table -->
      <NSpin :show="pending">
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table v-if="filteredPosts.length" class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">标题</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-24">分类</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-20">状态</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-36">更新时间</th>
                <th class="w-20" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="post in filteredPosts"
                :key="post.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900 leading-tight truncate max-w-xs">{{ post.title }}</p>
                  <p v-if="post.excerpt" class="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{{ post.excerpt }}</p>
                </td>
                <td class="px-4 py-3">
                  <span v-if="post.category_name" class="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                    {{ post.category_name }}
                  </span>
                  <span v-else class="text-gray-300 text-[11px]">—</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="text-[11px] font-medium px-2 py-0.5 rounded-md"
                    :class="post.status === 'published'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'"
                  >{{ post.status === 'published' ? '已发布' : '草稿' }}</span>
                </td>
                <td class="px-4 py-3 text-[11px] text-gray-400">{{ formatDate(post.updated_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <button
                      class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      @click="navigateTo(`/t-admin/posts/${post.id}`)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      @click="deletePost(post)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </NSpin>
    </main>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NSpin, useMessage } from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  category_name: string | null
  updated_at: string
}

const message = useMessage()
const search = ref('')
const activeStatus = ref('all')

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'published', label: '已发布' },
]

const { data: posts, pending, refresh } = useFetch<Post[]>('/api/posts', {
  default: () => [] as Post[],
})

const filteredPosts = computed(() => {
  let list = posts.value ?? []
  if (activeStatus.value !== 'all') list = list.filter(p => p.status === activeStatus.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(q))
  }
  return list
})

const total = computed(() => posts.value?.length ?? 0)

async function deletePost(post: Post) {
  if (!window.confirm(`确定要删除 "${post.title}" 吗？`)) return
  try {
    await $fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    message.success('已删除')
    refresh()
  } catch {
    message.error('删除失败')
  }
}

function formatDate(str: string) {
  return new Date(str).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>
