<template>
  <div>
    <!-- Inject project CSS -->
    <component :is="'style'" v-if="project?.css">{{ project.css }}</component>

    <!-- Published content -->
    <div v-if="project" v-html="project.html" />

    <!-- No published project -->
    <div v-else-if="!pending" class="min-h-screen bg-white flex items-center justify-center">
      <p class="text-gray-400 text-sm">暂无已发布的内容</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

interface Published {
  id: string
  name: string
  html: string
  css: string
}

const { data: project, pending } = useFetch<Published | null>('/api/published', {
  default: () => null,
  onResponseError() { /* 404 = no published project, handled by v-else */ },
})
</script>
