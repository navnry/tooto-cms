<script setup lang="ts">
import { useThemeConfig } from '../../composables/useThemeConfig'

const { theme, setEffects } = useThemeConfig()
</script>

<template>
  <div class="px-3 py-2 space-y-3">
    <div class="space-y-1">
      <span class="prop-label">Shadow Small</span>
      <input
        :value="theme.effects.shadowSm"
        class="css-text-input"
        @blur="(e) => setEffects({ shadowSm: (e.target as HTMLInputElement).value })"
      >
    </div>

    <div class="space-y-1">
      <span class="prop-label">Shadow Medium</span>
      <input
        :value="theme.effects.shadowMd"
        class="css-text-input"
        @blur="(e) => setEffects({ shadowMd: (e.target as HTMLInputElement).value })"
      >
    </div>

    <div class="space-y-1">
      <span class="prop-label">Shadow Large</span>
      <input
        :value="theme.effects.shadowLg"
        class="css-text-input"
        @blur="(e) => setEffects({ shadowLg: (e.target as HTMLInputElement).value })"
      >
    </div>
  </div>
</template>
