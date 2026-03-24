<template>
  <div class="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
    <div class="w-full max-w-[380px]">

      <!-- Logo -->
      <div class="flex items-center justify-center gap-2.5 mb-8">
        <div class="w-9 h-9 rounded-[10px] bg-indigo-500 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M4 6h16M4 10h12M4 14h14" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="text-gray-900 font-bold text-xl tracking-tight">WebBuilder</span>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 px-8 py-8">
        <h1 class="text-[18px] font-semibold text-gray-900 mb-1 text-center">后台登录</h1>
        <p class="text-[13px] text-gray-400 text-center mb-7">请使用管理员账号登录</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username -->
          <div>
            <label class="block text-[12px] font-medium text-gray-600 mb-1.5">用户名</label>
            <NInput
              v-model:value="form.username"
              placeholder="请输入用户名"
              size="large"
              :disabled="loading"
              :status="error ? 'error' : undefined"
              @keydown.enter="handleLogin"
            >
              <template #prefix>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </template>
            </NInput>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-[12px] font-medium text-gray-600 mb-1.5">密码</label>
            <NInput
              v-model:value="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password-on="click"
              :disabled="loading"
              :status="error ? 'error' : undefined"
              @keydown.enter="handleLogin"
            >
              <template #prefix>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </template>
            </NInput>
          </div>

          <!-- Error message -->
          <p v-if="error" class="text-[12px] text-red-500 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </p>

          <!-- Submit -->
          <NButton
            type="primary"
            size="large"
            block
            :loading="loading"
            attr-type="submit"
            class="!mt-6"
            @click="handleLogin"
          >
            登录
          </NButton>
        </form>
      </div>

      <p class="text-center text-[11px] text-gray-400 mt-6">
        默认账号：admin / admin123
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput, NButton } from 'naive-ui'

definePageMeta({ layout: false })

const { login } = useAuth()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.username || !form.password) {
    error.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await login(form.username, form.password)
    await navigateTo('/t-admin')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
