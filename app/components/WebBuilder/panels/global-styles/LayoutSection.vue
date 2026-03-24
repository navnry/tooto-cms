<script setup lang="ts">
import { useThemeConfig } from '../../composables/useThemeConfig'
import CssValueInput from '../style/CssValueInput.vue'

const { theme, setLayout } = useThemeConfig()
</script>

<template>
  <div class="px-3 py-2 space-y-3">
    <div class="space-y-1">
      <span class="prop-label">Container Width</span>
      <CssValueInput
        :value="theme.layout.containerWidth"
        :units="['px', 'rem', 'vw']"
        @preview="(value) => setLayout({ containerWidth: value })"
        @change="(value) => setLayout({ containerWidth: value })"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <span class="prop-label">Container Padding</span>
        <CssValueInput
          :value="theme.layout.containerPaddingX"
          :units="['px', 'rem', 'vw']"
          @preview="(value) => setLayout({ containerPaddingX: value })"
          @change="(value) => setLayout({ containerPaddingX: value })"
        />
      </div>

      <div class="space-y-1">
        <span class="prop-label">Section Gap</span>
        <CssValueInput
          :value="theme.layout.sectionGap"
          :units="['px', 'rem', 'vh']"
          @preview="(value) => setLayout({ sectionGap: value })"
          @change="(value) => setLayout({ sectionGap: value })"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <span class="prop-label">Grid Gap</span>
        <CssValueInput
          :value="theme.layout.gridGap"
          :units="['px', 'rem']"
          @preview="(value) => setLayout({ gridGap: value })"
          @change="(value) => setLayout({ gridGap: value })"
        />
      </div>

      <div class="space-y-1">
        <span class="prop-label">Base Radius</span>
        <CssValueInput
          :value="theme.layout.radiusBase"
          :units="['px', 'rem']"
          @preview="(value) => setLayout({ radiusBase: value })"
          @change="(value) => setLayout({ radiusBase: value })"
        />
      </div>
    </div>
  </div>
</template>
