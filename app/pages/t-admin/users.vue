<template>
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="h-14 bg-white border-b border-gray-200/80 flex items-center px-6 gap-3 shrink-0">
      <div class="flex-1">
        <h1 class="text-[15px] font-semibold text-gray-900 leading-none">用户管理</h1>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-none">{{ users.length }} 个账号</p>
      </div>
      <NButton type="primary" size="small" @click="openCreate">
        <template #icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </template>
        新建用户
      </NButton>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl">
        <NSpin :show="pending">
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div v-if="!users.length" class="py-12 text-center text-gray-400 text-sm">暂无用户</div>
            <div
              v-for="u in users"
              :key="u.id"
              class="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 group"
            >
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {{ u.username[0].toUpperCase() }}
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-[13px] font-medium text-gray-800 truncate">{{ u.username }}</p>
                  <span v-if="u.id === currentUser?.id" class="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded font-medium">当前账号</span>
                </div>
                <p class="text-[11px] text-gray-400 mt-0.5">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full" :class="u.role === 'admin' ? 'bg-indigo-400' : 'bg-gray-300'" />
                    {{ u.role === 'admin' ? '管理员' : u.role }}
                  </span>
                  <span class="mx-2 text-gray-200">·</span>
                  {{ formatDate(u.created_at) }} 创建
                </p>
              </div>
              <!-- Actions -->
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="编辑"
                  @click="openEdit(u)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="删除"
                  :disabled="u.id === currentUser?.id"
                  :class="u.id === currentUser?.id ? 'opacity-30 cursor-not-allowed' : ''"
                  @click="deleteUser(u)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </NSpin>
      </div>
    </main>
  </div>

  <!-- Create / Edit modal -->
  <Transition name="fade">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p class="text-[14px] font-semibold text-gray-800">{{ isEditing ? '编辑用户' : '新建用户' }}</p>
          <button class="text-gray-400 hover:text-gray-600" @click="showModal = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-[11px] font-medium text-gray-500 mb-1.5">用户名</label>
            <NInput v-model:value="form.username" placeholder="请输入用户名" />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-500 mb-1.5">
              密码{{ isEditing ? '（留空则不修改）' : '' }}
            </label>
            <NInput
              v-model:value="form.password"
              type="password"
              show-password-on="click"
              :placeholder="isEditing ? '留空则不修改密码' : '至少6位'"
            />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-500 mb-1.5">角色</label>
            <NSelect v-model:value="form.role" :options="roleOptions" />
          </div>
          <div v-if="modalError" class="text-[12px] text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ modalError }}</div>
        </div>
        <div class="px-5 pb-5 flex justify-end gap-2">
          <NButton size="small" @click="showModal = false">取消</NButton>
          <NButton type="primary" size="small" :loading="submitting" @click="submit">
            {{ isEditing ? '保存' : '创建' }}
          </NButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { NButton, NInput, NSelect, NSpin, useMessage } from 'naive-ui'

definePageMeta({ layout: 'admin' })

interface User { id: string; username: string; role: string; created_at: string }

const message = useMessage()
const { user: currentUser } = useAuth()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const submitting = ref(false)
const modalError = ref('')

const form = reactive({ username: '', password: '', role: 'admin' })

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
]

const { data: usersData, pending, refresh } = useFetch<User[]>('/api/users', { default: () => [] })
const users = computed(() => usersData.value ?? [])

function openCreate() {
  isEditing.value = false
  editingId.value = ''
  form.username = ''
  form.password = ''
  form.role = 'admin'
  modalError.value = ''
  showModal.value = true
}

function openEdit(u: User) {
  isEditing.value = true
  editingId.value = u.id
  form.username = u.username
  form.password = ''
  form.role = u.role
  modalError.value = ''
  showModal.value = true
}

async function submit() {
  modalError.value = ''
  submitting.value = true
  try {
    if (isEditing.value) {
      await $fetch(`/api/users/${editingId.value}`, { method: 'PUT', body: { ...form } })
      message.success('已保存')
    } else {
      await $fetch('/api/users', { method: 'POST', body: { ...form } })
      message.success('用户已创建')
    }
    showModal.value = false
    refresh()
  } catch (e: any) {
    modalError.value = e?.data?.message ?? '操作失败'
  } finally {
    submitting.value = false
  }
}

async function deleteUser(u: User) {
  if (!window.confirm(`确定要删除用户 "${u.username}" 吗？`)) return
  try {
    await $fetch(`/api/users/${u.id}`, { method: 'DELETE' })
    message.success('已删除')
    refresh()
  } catch (e: any) {
    message.error(e?.data?.message ?? '删除失败')
  }
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('zh-CN')
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
