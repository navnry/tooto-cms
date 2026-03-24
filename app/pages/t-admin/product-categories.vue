<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">产品分类</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">{{ categories.length }} 个分类</p>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl space-y-4">

        <!-- Add form -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <p class="text-[12px] font-semibold text-gray-700 mb-3">新建分类</p>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <NInput v-model:value="newName" placeholder="分类名称" size="small" @keyup.enter="addCategory" />
            <NInput v-model:value="newSlug" placeholder="slug（可选）" size="small" />
          </div>
          <div class="flex gap-2">
            <NSelect
              v-model:value="newParentId"
              :options="[{ label: '无（顶级分类）', value: '' }, ...parentOptions]"
              placeholder="父级分类"
              size="small"
              class="flex-1"
              :consistent-menu-width="false"
            />
            <NInputNumber v-model:value="newSortOrder" placeholder="排序" size="small" class="!w-24" :min="0" />
            <NButton type="primary" size="small" :loading="adding" @click="addCategory">添加</NButton>
          </div>
        </div>

        <!-- List -->
        <NSpin :show="pending">
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div v-if="!categories.length" class="py-10 text-center text-gray-400 text-sm">暂无分类</div>

            <!-- Group by parent -->
            <template v-for="group in groupedCategories" :key="group.parent?.id ?? 'root'">
              <!-- Parent row or root label -->
              <div class="px-4 py-2 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="text-[12px] font-semibold text-gray-500">{{ group.parent ? group.parent.name : '顶级分类' }}</span>
              </div>

              <div
                v-for="cat in group.items"
                :key="cat.id"
                class="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 group pl-8"
              >
                <template v-if="editingId !== cat.id">
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-medium text-gray-800">{{ cat.name }}</p>
                    <p class="text-[11px] text-gray-400">{{ cat.slug }} · 排序 {{ cat.sort_order }}</p>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors" @click="startEdit(cat)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" @click="deleteCategory(cat)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </template>

                <!-- Edit inline -->
                <template v-else>
                  <div class="flex-1 grid grid-cols-2 gap-2">
                    <NInput v-model:value="editName" size="small" />
                    <NInput v-model:value="editSlug" size="small" placeholder="slug" />
                    <NSelect
                      v-model:value="editParentId"
                      :options="[{ label: '无（顶级）', value: '' }, ...parentOptions.filter(o => o.value !== cat.id)]"
                      size="small"
                      class="col-span-2"
                      :consistent-menu-width="false"
                    />
                  </div>
                  <div class="flex gap-1 shrink-0">
                    <NButton size="tiny" type="primary" :loading="saving" @click="saveEdit(cat)">保存</NButton>
                    <NButton size="tiny" @click="editingId = null">取消</NButton>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </NSpin>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NInputNumber, NSelect, NSpin, useMessage } from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface Category {
  id: string; name: string; slug: string
  parent_id: string | null; parent_name: string | null; sort_order: number
}

const message = useMessage()
const newName = ref('')
const newSlug = ref('')
const newParentId = ref('')
const newSortOrder = ref(0)
const adding = ref(false)
const editingId = ref<string | null>(null)
const editName = ref('')
const editSlug = ref('')
const editParentId = ref('')
const saving = ref(false)

const { data: categoriesData, pending, refresh } = useFetch<Category[]>('/api/product-categories', { default: () => [] })
const categories = computed(() => categoriesData.value ?? [])

// Group: top-level items + items under each parent
const groupedCategories = computed(() => {
  const list = categories.value
  const topLevel = list.filter(c => !c.parent_id)
  const groups: { parent: Category | null; items: Category[] }[] = []

  // Root group (top-level items that have no parent)
  const rootItems = topLevel
  if (rootItems.length) groups.push({ parent: null, items: rootItems })

  // Groups under each top-level category
  for (const parent of topLevel) {
    const children = list.filter(c => c.parent_id === parent.id)
    if (children.length) groups.push({ parent, items: children })
  }

  return groups
})

const parentOptions = computed(() =>
  categories.value
    .filter(c => !c.parent_id) // Only top-level as selectable parents (single-level hierarchy)
    .map(c => ({ label: c.name, value: c.id })),
)

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

async function addCategory() {
  const name = newName.value.trim()
  if (!name) return
  adding.value = true
  try {
    await $fetch('/api/product-categories', {
      method: 'POST',
      body: {
        name,
        slug: newSlug.value.trim() || undefined,
        parent_id: newParentId.value || null,
        sort_order: newSortOrder.value,
      },
    })
    message.success('已添加')
    newName.value = ''
    newSlug.value = ''
    newParentId.value = ''
    newSortOrder.value = 0
    refresh()
  } catch (e: any) {
    message.error(e?.data?.message ?? '添加失败')
  } finally {
    adding.value = false
  }
}

function startEdit(cat: Category) {
  editingId.value = cat.id
  editName.value = cat.name
  editSlug.value = cat.slug
  editParentId.value = cat.parent_id ?? ''
}

async function saveEdit(cat: Category) {
  saving.value = true
  try {
    await $fetch(`/api/product-categories/${cat.id}`, {
      method: 'PUT',
      body: { name: editName.value, slug: editSlug.value, parent_id: editParentId.value || null },
    })
    message.success('已保存')
    editingId.value = null
    refresh()
  } catch (e: any) {
    message.error(e?.data?.message ?? '保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat: Category) {
  if (!window.confirm(`确定要删除分类 "${cat.name}" 吗？子分类将移至顶级。`)) return
  try {
    await $fetch(`/api/product-categories/${cat.id}`, { method: 'DELETE' })
    message.success('已删除')
    refresh()
  } catch {
    message.error('删除失败')
  }
}
</script>
