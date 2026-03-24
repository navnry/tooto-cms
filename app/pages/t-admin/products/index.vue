<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1 min-w-0">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">产品管理</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">{{ total }} 个产品</p>
      </div>
      <NButton type="primary" size="small" @click="navigateTo('/t-admin/products/new')">
        <template #icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </template>
        新建产品
      </NButton>
    </header>

    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3 flex-wrap">
      <!-- Status filter -->
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
      <!-- Category filter -->
      <NSelect
        v-model:value="activeCategoryId"
        :options="[{ label: '全部分类', value: '' }, ...categoryOptions]"
        size="small"
        class="!w-36"
        :consistent-menu-width="false"
      />
      <div class="flex-1" />
      <NInput v-model:value="search" placeholder="搜索产品名称/SKU…" size="small" clearable class="!w-56">
        <template #prefix>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
          </svg>
        </template>
      </NInput>
    </div>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="!pending && !filteredProducts.length" class="border-2 border-dashed border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3">
        <div class="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700 text-sm">{{ search ? '未找到匹配产品' : '还没有产品' }}</p>
          <p class="text-xs text-gray-400 mt-1">点击右上角新建产品</p>
        </div>
      </div>

      <NSpin :show="pending">
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table v-if="filteredProducts.length" class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-10" />
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">产品名称</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-28">SKU</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-24">分类</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-24">价格</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-20">状态</th>
                <th class="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-32">更新时间</th>
                <th class="w-16" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in filteredProducts"
                :key="p.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <!-- Cover thumbnail -->
                <td class="px-3 py-2">
                  <div class="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <img v-if="p.cover" :src="p.cover" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-2">
                  <p class="font-medium text-gray-900 leading-tight truncate max-w-[200px]">{{ p.name }}</p>
                  <p v-if="p.short_desc" class="text-[11px] text-gray-400 mt-0.5 truncate max-w-[200px]">{{ p.short_desc }}</p>
                </td>
                <td class="px-4 py-2 text-[12px] text-gray-500 font-mono">{{ p.sku || '—' }}</td>
                <td class="px-4 py-2">
                  <span v-if="p.category_name" class="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{{ p.category_name }}</span>
                  <span v-else class="text-gray-300 text-[11px]">—</span>
                </td>
                <td class="px-4 py-2 text-[12px] text-gray-700">
                  <span v-if="p.price != null">¥{{ Number(p.price).toFixed(2) }} / {{ p.unit }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
                <td class="px-4 py-2">
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded-md" :class="statusClass(p.status)">
                    {{ statusLabel(p.status) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-[11px] text-gray-400">{{ formatDate(p.updated_at) }}</td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-1 justify-end">
                    <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" @click="navigateTo(`/t-admin/products/${p.id}`)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" @click="deleteProduct(p)">
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
import { NButton, NInput, NSpin, NSelect, useMessage } from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface Product {
  id: string; name: string; sku: string | null; short_desc: string
  status: 'draft' | 'active' | 'discontinued'
  category_name: string | null; category_id: string | null
  price: number | null; unit: string; cover: string | null
  updated_at: string
}

const message = useMessage()
const search = ref('')
const activeStatus = ref('all')
const activeCategoryId = ref('')

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '上架' },
  { key: 'draft', label: '草稿' },
  { key: 'discontinued', label: '停产' },
]

const { data: products, pending, refresh } = useFetch<Product[]>('/api/products', { default: () => [] })
const { data: categories } = useFetch<{ id: string; name: string }[]>('/api/product-categories', { default: () => [] })

const categoryOptions = computed(() => (categories.value ?? []).map(c => ({ label: c.name, value: c.id })))

const filteredProducts = computed(() => {
  let list = products.value ?? []
  if (activeStatus.value !== 'all') list = list.filter(p => p.status === activeStatus.value)
  if (activeCategoryId.value) list = list.filter(p => p.category_id === activeCategoryId.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q))
  }
  return list
})

const total = computed(() => products.value?.length ?? 0)

function statusLabel(s: string) {
  return { draft: '草稿', active: '上架', discontinued: '停产' }[s] ?? s
}
function statusClass(s: string) {
  return {
    active: 'bg-green-50 text-green-600',
    draft: 'bg-gray-100 text-gray-500',
    discontinued: 'bg-red-50 text-red-400',
  }[s] ?? 'bg-gray-100 text-gray-500'
}

async function deleteProduct(p: Product) {
  if (!window.confirm(`确定要删除产品 "${p.name}" 吗？`)) return
  try {
    await $fetch(`/api/products/${p.id}`, { method: 'DELETE' })
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
