<template>
  <div class="flex h-screen overflow-hidden bg-[#f4f5f7]">

    <!-- ── Sidebar ── -->
    <aside class="w-[220px] bg-[#111827] flex flex-col shrink-0 select-none">

      <!-- Brand -->
      <div class="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.08] shrink-0">
        <div class="w-7 h-7 rounded-[7px] bg-indigo-500 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M4 6h16M4 10h12M4 14h14" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="text-white font-semibold text-[15px] tracking-tight">WebBuilder</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">

        <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2.5 mb-2.5">网站管理</p>
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" v-bind="linkProps(item.to)">
          <span class="shrink-0" v-html="item.icon" />
          {{ item.label }}
        </NuxtLink>

        <div class="mx-2 my-3 border-t border-white/[0.08]" />

        <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2.5 mb-2.5">文章</p>
        <NuxtLink v-for="item in contentItems" :key="item.to" :to="item.to" v-bind="linkProps(item.to)">
          <span class="shrink-0" v-html="item.icon" />
          {{ item.label }}
        </NuxtLink>

        <div class="mx-2 my-3 border-t border-white/[0.08]" />

        <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2.5 mb-2.5">资源</p>
        <NuxtLink to="/t-admin/media" v-bind="linkProps('/t-admin/media')">
          <span class="shrink-0" v-html="mediaIcon" />
          媒体库
        </NuxtLink>

        <div class="mx-2 my-3 border-t border-white/[0.08]" />

        <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2.5 mb-2.5">产品管理</p>
        <NuxtLink v-for="item in productItems" :key="item.to" :to="item.to" v-bind="linkProps(item.to)">
          <span class="shrink-0" v-html="item.icon" />
          {{ item.label }}
        </NuxtLink>

        <div class="mx-2 my-3 border-t border-white/[0.08]" />

        <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2.5 mb-2.5">系统</p>
        <NuxtLink v-for="item in systemItems" :key="item.to" :to="item.to" v-bind="linkProps(item.to)">
          <span class="shrink-0" v-html="item.icon" />
          {{ item.label }}
        </NuxtLink>

      </nav>

      <!-- User -->
      <div class="shrink-0 border-t border-white/[0.08] p-2">
        <NDropdown :options="userMenuOptions" placement="top-start" trigger="click" @select="handleUserMenu">
          <button class="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-colors hover:bg-white/[0.08] cursor-pointer">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {{ (user?.username ?? 'A')[0].toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-[13px] font-medium text-white/90 leading-none truncate">{{ user?.username ?? 'Admin' }}</p>
              <p class="text-[11px] text-white/35 mt-0.5 leading-none truncate capitalize">{{ user?.role ?? 'admin' }}</p>
            </div>
            <svg class="text-white/30 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6-6 6 6M6 15l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </NDropdown>
      </div>
    </aside>

    <!-- ── Page content ── -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { NDropdown } from 'naive-ui'

const route = useRoute()
const { user, logout } = useAuth()

const navLinkClass = 'flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] font-medium transition-all cursor-pointer no-underline'
const activeClass = 'bg-white/10 text-white'
const inactiveClass = 'text-white/55 hover:text-white hover:bg-white/[0.06]'

function isActive(to: string) {
  if (to === '/t-admin') return route.path === '/t-admin'
  return route.path.startsWith(to)
}

function linkProps(to: string) {
  return { class: `${navLinkClass} ${isActive(to) ? activeClass : inactiveClass}` }
}

const navItems = [
  {
    to: '/t-admin',
    label: '项目',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,
  },
]

const contentItems = [
  {
    to: '/t-admin/posts',
    label: '文章',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`,
  },
  {
    to: '/t-admin/categories',
    label: '分类',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>`,
  },
  {
    to: '/t-admin/tags',
    label: '标签',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>`,
  },
]

const mediaIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
  <polyline points="21 15 16 10 5 21"/>
</svg>`

const productItems = [
  {
    to: '/t-admin/products',
    label: '产品列表',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>`,
  },
  {
    to: '/t-admin/product-categories',
    label: '产品分类',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>`,
  },
]

const systemItems = [
  {
    to: '/t-admin/users',
    label: '用户管理',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
]

const userMenuOptions = [{ label: '退出登录', key: 'logout' }]

async function handleUserMenu(key: string) {
  if (key === 'logout') await logout()
}
</script>
