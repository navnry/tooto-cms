<script setup lang="ts">
/**
 * Editor page — GrapesJS full editor with all panels
 *
 * Verifies project exists via API, then renders the full editor layout.
 * Applies the editor theme (dark/light) via data-theme on <html>.
 */
import { ref, onMounted, watchEffect, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { NConfigProvider } from 'naive-ui'
import { usePreview } from '~/components/WebBuilder/composables/usePreview'
import { useTheme } from '~/components/WebBuilder/composables/useTheme'
import { useEditor } from '~/components/WebBuilder/composables/useEditor'
import { useEditorBridge } from '~/components/WebBuilder/bridge/useEditorBridge'
import Toolbar from '~/components/WebBuilder/toolbar/Toolbar.vue'
import LeftSidebar from '~/components/WebBuilder/panels/LeftSidebar.vue'
import EditorCanvas from '~/components/WebBuilder/canvas/EditorCanvas.vue'
import PreviewControls from '~/components/WebBuilder/preview/PreviewControls.vue'
import FloatingLayerPanel from '~/components/WebBuilder/panels/FloatingLayerPanel.vue'
import AssetsModal from '~/components/WebBuilder/panels/AssetsModal.vue'

definePageMeta({ layout: false })

const route  = useRoute()
const router = useRouter()
const projectId = route.params.projectId as string

// ── Verify project exists ──────────────────────────────────────────────────────
const verified = ref(false)

onMounted(async () => {
  try {
    await $fetch(`/api/projects/${projectId}`)
    verified.value = true
  } catch {
    router.replace('/')
  }
})

// ── Apply editor theme to <html> ───────────────────────────────────────────────
const { isDark, naiveTheme, naiveThemeOverrides } = useTheme()

watchEffect(() => {
  if (process.client) {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }
})

onBeforeUnmount(() => {
  exitPreview()
  if (process.client) {
    document.documentElement.removeAttribute('data-theme')
  }
})

const { isPreview, exitPreview } = usePreview()
const { ready, loading, editor, error: editorError } = useEditor()
useEditorBridge()

// ── Unsaved-changes guards ─────────────────────────────────────────────────────

function hasDirty() {
  return (editor.value?.getDirtyCount() ?? 0) > 0
}

// 1. Page refresh / tab close
function onBeforeUnload(e: BeforeUnloadEvent) {
  if (hasDirty()) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

// 2. Vue Router navigation (back button, router.push, NuxtLink, etc.)
// Cancel the SPA navigation and fall back to a real browser navigation,
// which fires beforeunload → same native browser "Leave site?" dialog.
onBeforeRouteLeave((to, _from, next) => {
  if (!hasDirty()) { next(); return }
  next(false)
  window.location.href = to.fullPath
})

function reloadEditorPage() {
  window.location.reload()
}

function goToProjects() {
  router.push('/t-admin')
}
</script>

<template>
  <NConfigProvider :theme="naiveTheme" :theme-overrides="naiveThemeOverrides">
    <div v-if="verified" class="h-screen flex flex-col overflow-hidden">
      <Toolbar class="h-12 flex-shrink-0" />
      <div class="flex flex-1 overflow-hidden">
        <LeftSidebar v-show="!isPreview" class="flex-shrink-0" />
        <EditorCanvas :project-id="projectId" class="flex-1 min-w-0" />
      </div>
      <PreviewControls />
      <FloatingLayerPanel />
      <AssetsModal />

      <!-- Editor init loading overlay -->
      <Transition name="editor-loading">
        <div
          v-if="loading && !editorError"
          class="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090d1a]"
        >
          <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 rounded-[10px] bg-indigo-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                <path d="M4 6h16M4 10h12M4 14h14" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex flex-col items-center gap-1.5">
              <div class="flex gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
              </div>
              <p class="text-[12px] text-white/40 font-medium tracking-wide">Loading…</p>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="editor-loading">
        <div
          v-if="editorError"
          class="absolute inset-0 z-[10000] flex items-center justify-center bg-[#090d1a]/95 px-6"
        >
          <div class="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#0f1528] p-6 text-white shadow-2xl">
            <div class="mb-3 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 9v4" stroke-linecap="round" />
                  <path d="M12 17h.01" stroke-linecap="round" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke-linejoin="round" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-semibold">编辑器加载失败</h2>
                <p class="text-xs text-white/55">项目数据没有成功载入，当前会话已被阻断以避免误覆盖原数据。</p>
              </div>
            </div>

            <div class="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/80">
              {{ editorError }}
            </div>

            <div class="mt-5 flex items-center justify-end gap-3">
              <button
                class="rounded-lg border border-white/12 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                @click="goToProjects"
              >
                返回项目列表
              </button>
              <button
                class="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                @click="reloadEditorPage"
              >
                刷新重试
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </NConfigProvider>
</template>

<style scoped>
.editor-loading-leave-active { transition: opacity 0.4s ease; }
.editor-loading-leave-to { opacity: 0; }
</style>
