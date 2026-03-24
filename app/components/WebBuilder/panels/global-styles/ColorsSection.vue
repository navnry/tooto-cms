<script setup lang="ts">
import { useThemeConfig } from '../../composables/useThemeConfig'
import ColorPicker from '../style/ColorPicker.vue'
import AppIcon from '../../ui/AppIcon.vue'

const { theme, createColor, setColor, deleteColor } = useThemeConfig()
</script>

<template>
  <div class="px-3 py-2 space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-[10px] font-semibold uppercase tracking-widest text-[var(--editor-text-subtle)]">
        Theme Colors
      </span>
      <button
        type="button"
        class="flex items-center gap-1 px-2 py-0.5 text-[11px] text-[var(--editor-text-muted)] hover:text-[var(--editor-text)] transition-colors rounded hover:bg-[var(--editor-surface-overlay)]"
        @click="createColor"
      >
        <AppIcon icon="lucide:plus" :size="12" />
        Add
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="token in theme.colors"
        :key="token.id"
        class="grid grid-cols-[minmax(0,1fr)_120px_28px] gap-2 items-center"
      >
        <input
          :value="token.label"
          class="css-text-input"
          @blur="(e) => setColor(token.id, { label: (e.target as HTMLInputElement).value })"
        >
        <ColorPicker
          :value="token.value"
          size="small"
          :commit-as-css-vars="false"
          :show-theme-swatches="false"
          @confirm="(value) => setColor(token.id, { value })"
        />
        <button
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded text-[var(--editor-text-subtle)] hover:text-red-400 hover:bg-[var(--editor-surface-overlay)] transition-colors"
          :disabled="['primary', 'surface', 'text-primary'].includes(token.id)"
          @click="deleteColor(token.id)"
        >
          <AppIcon icon="lucide:x" :size="12" />
        </button>
      </div>
    </div>
  </div>
</template>
