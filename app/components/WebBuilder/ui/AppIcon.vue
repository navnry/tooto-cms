<script setup lang="ts">
/**
 * AppIcon.vue — thin wrapper around @iconify/vue <Icon>
 * Provides consistent sizing and color inheritance across the editor UI.
 *
 * Usage: <AppIcon icon="lucide:chevron-down" />
 */
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  icon: string
  size?: number | string
}>(), {
  size: 14,
})
</script>

<template>
  <Icon
    :icon="icon"
    :width="size"
    :height="size"
    style="display: inline-block; vertical-align: middle; flex-shrink: 0;"
  />
</template>
