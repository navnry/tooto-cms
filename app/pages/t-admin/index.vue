<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1 min-w-0">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">所有项目</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">管理你的所有网页项目</p>
      </div>
      <NInput
        v-model:value="search"
        placeholder="搜索项目…"
        size="small"
        clearable
        class="!w-52"
      >
        <template #prefix>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
          </svg>
        </template>
      </NInput>
      <NButton type="primary" size="small" @click="showCreateModal = true">
        <template #icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
        </template>
        新建项目
      </NButton>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-6">

        <!-- Projects toolbar -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h2 class="text-[13px] font-semibold text-gray-700">项目列表</h2>
            <span class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {{ filteredProjects.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <NSelect
              v-model:value="sortBy"
              size="small"
              class="!w-28"
              :options="sortOptions"
              :consistent-menu-width="false"
            />
            <div class="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                class="w-8 h-7 flex items-center justify-center transition-colors"
                :class="viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-400 hover:text-gray-600'"
                @click="viewMode = 'grid'"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button
                class="w-8 h-7 flex items-center justify-center transition-colors"
                :class="viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-400 hover:text-gray-600'"
                @click="viewMode = 'list'"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading / Empty / Content -->
        <NSpin :show="pending" description="加载中…">

          <!-- Empty State -->
          <div v-if="!pending && !filteredProjects.length" class="bg-white rounded-xl border border-gray-100 py-16 flex flex-col items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="text-center">
              <p class="font-semibold text-gray-700 text-sm">{{ search ? '未找到匹配项目' : '还没有项目' }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ search ? '试试其他关键词' : '点击新建项目开始创作' }}</p>
            </div>
            <NButton v-if="!search" type="primary" size="small" class="mt-1" @click="showCreateModal = true">
              新建项目
            </NButton>
          </div>

          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <div
              v-for="project in filteredProjects"
              :key="project.id"
              class="group bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer
                     hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/8 transition-all duration-200"
              @click="openProject(project.id)"
            >
              <!-- Preview -->
              <div class="h-[130px] bg-gradient-to-br from-gray-50 to-slate-100 relative overflow-hidden flex items-center justify-center">
                <div class="space-y-2 w-24 opacity-50">
                  <div class="h-2.5 bg-indigo-200 rounded-full w-full" />
                  <div class="h-1.5 bg-gray-200 rounded-full w-4/5" />
                  <div class="h-1.5 bg-gray-200 rounded-full w-3/5" />
                  <div class="h-3 bg-gray-100 rounded mt-2 w-full" />
                  <div class="h-1.5 bg-gray-200 rounded-full w-full" />
                  <div class="h-1.5 bg-gray-200 rounded-full w-2/3" />
                </div>
                <div class="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.04] transition-colors" />
                <!-- Published badge -->
                <div v-if="project.published" class="absolute top-2 left-2">
                  <span class="text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
                    已发布
                  </span>
                </div>
                <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-[10px] font-semibold bg-indigo-500 text-white px-2 py-0.5 rounded-md">编辑</span>
                </div>
              </div>
              <!-- Info -->
              <div class="px-3.5 py-3 flex items-center gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-semibold text-gray-900 truncate leading-none">{{ project.name }}</p>
                  <p class="text-[11px] text-gray-400 mt-1 leading-none">{{ formatDate(project.updated_at) }}</p>
                </div>
                <NDropdown
                  :options="projectMenuOptions(project)"
                  placement="bottom-end"
                  trigger="click"
                  @select="handleAction($event, project.id)"
                  @click.stop
                >
                  <button
                    class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100
                           hover:bg-gray-100 hover:text-gray-600 transition-all"
                    @click.stop
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                </NDropdown>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <div
              v-for="project in filteredProjects"
              :key="project.id"
              class="group flex items-center px-5 py-3.5 hover:bg-gray-50/60 cursor-pointer transition-colors"
              @click="openProject(project.id)"
            >
              <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mr-3.5 relative"
                :class="project.published ? 'bg-emerald-50 border border-emerald-100' : 'bg-indigo-50 border border-indigo-100'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="project.published ? '#10b981' : '#6366f1'" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-[13px] font-semibold text-gray-900 truncate">{{ project.name }}</p>
                  <span v-if="project.published" class="text-[10px] font-semibold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full shrink-0">已发布</span>
                </div>
                <p class="text-[11px] text-gray-400">更新于 {{ formatDate(project.updated_at) }}</p>
              </div>
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                <NButton size="tiny" type="primary" ghost @click.stop="openProject(project.id)">编辑</NButton>
                <NButton v-if="!project.published" size="tiny" type="success" ghost @click.stop="publishProject(project.id)">发布</NButton>
                <NButton v-else size="tiny" ghost @click.stop="unpublishProject(project.id)">取消发布</NButton>
                <NButton size="tiny" type="error" ghost @click.stop="deleteProject(project.id)">删除</NButton>
              </div>
            </div>
          </div>

        </NSpin>
      </div>
    </main>
  </div>

  <!-- Create Project Modal -->
  <NModal v-model:show="showCreateModal" preset="dialog" title="新建项目" positive-text="创建" negative-text="取消" :mask-closable="false"
    @positive-click="confirmCreate" @negative-click="() => { showCreateModal = false; newName = '' }">
    <div class="mt-3">
      <p class="text-xs text-gray-500 mb-2">项目名称</p>
      <NInput
        ref="nameInputRef"
        v-model:value="newName"
        placeholder="例如：公司官网、产品落地页…"
        @keydown.enter="confirmCreate"
      />
    </div>
  </NModal>
</template>

<script setup lang="ts">
import {
  NInput, NButton, NSelect, NDropdown,
  NModal, NSpin, useMessage,
} from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface Project {
  id: string
  name: string
  published: number
  created_at: string
  updated_at: string
}

// ── Data ──
const router = useRouter()
const message = useMessage()

const { data: projects, pending, refresh } = useFetch<Project[]>('/api/projects', {
  default: () => [] as Project[],
})

// ── UI State ──
const search = ref('')
const sortBy = ref('updated')
const viewMode = ref<'grid' | 'list'>('grid')
const showCreateModal = ref(false)
const newName = ref('')

// ── Sort + Filter ──
const sortOptions = [
  { label: '最近更新', value: 'updated' },
  { label: '最早创建', value: 'oldest' },
  { label: '名称 A-Z', value: 'name' },
]

const filteredProjects = computed(() => {
  let list = [...(projects.value ?? [])]
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }
  if (sortBy.value === 'updated') list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  else if (sortBy.value === 'oldest') list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  else if (sortBy.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  return list
})

// ── Dropdown menus ──
const projectMenuOptions = (project: Project) => [
  {
    label: '打开编辑器',
    key: 'open',
    icon: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
      [h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
        h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })]),
  },
  { type: 'divider', key: 'd0' },
  project.published
    ? {
        label: '取消发布',
        key: 'unpublish',
        icon: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
          [h('path', { d: 'M17 1l4 4-4 4' }), h('path', { d: 'M3 11V9a4 4 0 0 1 4-4h14' }),
            h('path', { d: 'M7 23l-4-4 4-4' }), h('path', { d: 'M21 13v2a4 4 0 0 1-4 4H3' })]),
      }
    : {
        label: '发布到前台',
        key: 'publish',
        icon: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#10b981', 'stroke-width': '2' },
          [h('path', { d: 'M5 12h14' }), h('path', { d: 'M12 5l7 7-7 7' })]),
        props: { style: 'color: #10b981' },
      },
  { type: 'divider', key: 'd1' },
  {
    label: '删除项目',
    key: 'delete',
    props: { style: 'color: #ef4444' },
    icon: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#ef4444', 'stroke-width': '2' },
      [h('polyline', { points: '3 6 5 6 21 6' }),
        h('path', { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' }),
        h('path', { d: 'M10 11v6M14 11v6' })]),
  },
]

async function handleAction(key: string, id: string) {
  if (key === 'open') openProject(id)
  else if (key === 'publish') await publishProject(id)
  else if (key === 'unpublish') await unpublishProject(id)
  else if (key === 'delete') await deleteProject(id)
}

// ── Actions ──
function openProject(id: string) {
  router.push(`/t-admin/editor/${id}`)
}

async function publishProject(id: string) {
  await $fetch(`/api/projects/${id}/publish`, { method: 'POST' })
  message.success('已发布到前台')
  refresh()
}

async function unpublishProject(id: string) {
  await $fetch(`/api/projects/${id}/publish`, { method: 'DELETE' })
  message.success('已取消发布')
  refresh()
}

async function confirmCreate() {
  const name = newName.value.trim() || 'Untitled Project'
  const project = await $fetch<{ id: string }>('/api/projects', {
    method: 'POST',
    body: { name },
  })
  showCreateModal.value = false
  newName.value = ''
  message.success('项目已创建')
  router.push(`/t-admin/editor/${project.id}`)
}

async function deleteProject(id: string) {
  if (!window.confirm('确定要删除这个项目吗？')) return
  await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
  message.success('项目已删除')
  refresh()
}

// ── Utils ──
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>
