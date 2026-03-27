<script setup lang="ts">
/**
 * Toolbar.vue — Top bar
 *
 * Three-column grid layout:
 *   LEFT   — brand mark + project name + back-to-home button
 *   CENTER — device switcher (true center via grid-cols-[1fr_auto_1fr])
 *   RIGHT  — outline toggle + theme toggle + code editor + preview + unsaved indicator + save
 */
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEditor } from '../composables/useEditor'
import { useEditorBridge } from '../bridge/useEditorBridge'
import { useTheme, type ThemeMode } from '../composables/useTheme'
import { usePreview } from '../composables/usePreview'
import { useProjects } from '~/composables/useProjects'
import { useDevice, type Device } from '../composables/useDevice'
import {
  NButton,
  NDivider,
  NTabs,
  NTab,
  useMessage,
} from 'naive-ui'
import { useFloatingLayers } from '../composables/useFloatingLayers'
import AppIcon from '../ui/AppIcon.vue'
import CodeEditorModal from '../panels/CodeEditorModal.vue'

defineOptions({ inheritAttrs: false })

const router  = useRouter()
const { editor, ready, loadSucceeded, error: editorError } = useEditor()
const { currentDevice, isDirty, setCurrentDevice } = useEditorBridge()
const { mode, setMode } = useTheme()
const { isPreview, togglePreview } = usePreview()
const { deviceOptions } = useDevice()
const message = useMessage()

const { currentProject, refresh: refreshProjects } = useProjects()

// Load project meta (for the name display) once the editor is ready
watch(ready, (isReady) => { if (isReady) refreshProjects() }, { immediate: true })

// ── Theme (cycle: light → dark → system) ─────────────────────────────────────
const themeOptions: Array<{ key: ThemeMode; label: string; icon: string }> = [
  { key: 'light',  label: 'Light mode',  icon: 'lucide:sun' },
  { key: 'dark',   label: 'Dark mode',   icon: 'lucide:moon' },
  { key: 'system', label: 'System mode', icon: 'lucide:laptop' },
]
const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system']
const DEFAULT_THEME_OPTION = themeOptions[0] ?? { key: 'light', label: 'Light mode', icon: 'lucide:sun' }
const currentThemeOption = computed(() => themeOptions.find(t => t.key === mode.value) ?? DEFAULT_THEME_OPTION)
const canEdit = computed(() => ready.value && loadSucceeded.value && !editorError.value)

function cycleTheme() {
  const currentIndex = THEME_CYCLE.includes(mode.value) ? THEME_CYCLE.indexOf(mode.value) : 0
  const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length] ?? ('light' as ThemeMode)
  setMode(nextTheme)
}

// ── Back to home ──────────────────────────────────────────────────────────────
async function goHome() {
  if (canEdit.value && editor.value) {
    try { await editor.value.store() } catch { /* ignore */ }
  }
  router.push('/t-admin')
}

// ── Outline toggle ────────────────────────────────────────────────────────────
const showOutline = ref(false)

watch(ready, (isReady) => {
  if (!isReady || !editor.value) return
  editor.value.stopCommand('core:component-outline')
})

function toggleOutline() {
  if (!canEdit.value || !editor.value) return
  const cmd = 'core:component-outline'
  if (editor.value.Commands.isActive(cmd)) {
    editor.value.stopCommand(cmd)
    showOutline.value = false
  } else {
    editor.value.runCommand(cmd)
    showOutline.value = true
  }
}

const { isVisible: isLayersVisible, toggle: toggleLayers } = useFloatingLayers()

// ── Code editor ───────────────────────────────────────────────────────────────
const showCodeEditor = ref(false)

// ── Save ──────────────────────────────────────────────────────────────────────
const isSaving = ref(false)

async function save() {
  if (!canEdit.value || !editor.value || isSaving.value) return
  isSaving.value = true
  try {
    await editor.value.store()
    message.success('Saved')
  } catch (err) {
    console.error('[save] error:', err)
    message.error('Save failed — check console for details')
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <div
    v-show="!isPreview"
    v-bind="$attrs"
    class="
      glass-surface
      grid grid-cols-[1fr_auto_1fr] items-center
      h-12 pr-4
      select-none shrink-0
      text-[var(--editor-text)]
    "
  >
    <!-- ── LEFT: Brand + Project name + back ────────────────────────────── -->
    <div class="flex items-center gap-2 min-w-0">
      <!-- Back to home -->
      <button
        class="
          flex items-center justify-center
          size-10 rounded flex-shrink-0
          text-[var(--editor-text-muted)] hover:text-[var(--editor-text)]
          border-none bg-transparent cursor-pointer transition-colors duration-150
        "
        title="Back to projects"
        @click="goHome"
      >
        <AppIcon icon="lucide:arrow-left" :size="20" />
      </button>

      <!-- Brand mark -->
      <div class="
        w-6 h-6 rounded flex-shrink-0
        flex items-center justify-center
        bg-[#5B8EFF] text-white text-[11px] font-bold
      ">
        T
      </div>

      <!-- Project name -->
      <span class="text-sm font-medium truncate text-[var(--editor-text)] max-w-[160px]">
        {{ currentProject?.name ?? 'Untitled Project' }}
      </span>

      <n-divider vertical style="margin: 0; height: 16px;" />
    </div>

    <!-- ── CENTER: Device switcher ────────────────────────────────────────── -->
    <n-tabs
      :value="currentDevice"
      type="segment"
      size="small"
      :disabled="!canEdit"
      @update:value="(v: string) => setCurrentDevice(v as Device)"
    >
      <n-tab
        v-for="d in deviceOptions"
        :key="d.key"
        :name="d.key"
        :disabled="!canEdit"
      >
        <div class="flex items-center px-2 py-0.5">
          <AppIcon :icon="d.icon" :size="14" />
        </div>
      </n-tab>
    </n-tabs>

    <!-- ── RIGHT: Controls ────────────────────────────────────────────────── -->
    <div class="flex items-center gap-2 justify-end">
      <!-- Outline toggle -->
      <n-button
        text size="small" style="padding: 0 4px"
        :disabled="!canEdit"
        :style="showOutline ? '' : 'opacity: 0.4'"
        @click="toggleOutline"
      >
        <AppIcon icon="iconoir:style-border" :size="15" />
      </n-button>

      <!-- Theme -->
      <n-button text size="small" style="padding: 0 4px" :disabled="!canEdit" @click="cycleTheme">
        <AppIcon :icon="currentThemeOption.icon" :size="15" />
      </n-button>

      <!-- Code editor -->
      <n-button text size="small" style="padding: 0 4px" :disabled="!canEdit" @click="showCodeEditor = true">
        <AppIcon icon="lucide:code-2" :size="15" />
      </n-button>

      <!-- Layers toggle -->
      <n-button
        text size="small" style="padding: 0 4px"
        :disabled="!canEdit"
        :style="isLayersVisible ? '' : 'opacity: 0.4'"
        title="Toggle Layers panel"
        @click="toggleLayers"
      >
        <AppIcon icon="lucide:layers" :size="15" />
      </n-button>

      <!-- Preview -->
      <n-button text size="small" style="padding: 0 4px" :disabled="!canEdit" @click="togglePreview">
        <AppIcon icon="lucide:eye" :size="15" />
      </n-button>

      <n-divider vertical />

      <!-- Unsaved dot -->
      <span v-if="isDirty" class="w-[6px] h-[6px] rounded-full bg-amber-400 flex-shrink-0" />

      <!-- Save -->
      <n-button size="small" :loading="isSaving" :disabled="!canEdit || !isDirty" @click="save">
        Save
      </n-button>
    </div>
  </div>

  <!-- Code editor modal -->
  <CodeEditorModal v-model:show="showCodeEditor" />
</template>
