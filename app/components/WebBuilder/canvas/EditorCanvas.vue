<script setup lang="ts">
/**
 * EditorCanvas.vue
 *
 * The GrapesJS canvas mount point.
 * Initializes the editor singleton on mount, destroys on unmount.
 *
 * This is the ONLY component that touches GrapesJS directly.
 * All other components interact via useEditor() composable.
 *
 * CanvasToolbar is teleported into the GrapesJS canvas spots overlay
 * so its absolute coordinates map 1-to-1 with the canvas coordinate space.
 */
import { onMounted, onBeforeUnmount, useTemplateRef, ref, watch } from 'vue'
import { useEditor } from '../composables/useEditor'
import CanvasToolbar from './CanvasToolbar.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  projectId: string
}>()

const canvasRef = useTemplateRef<HTMLDivElement>('canvasRef')
const { initEditor, destroyEditor, ready, editor } = useEditor()

// The canvas spots overlay element — available after editor is ready.
// CanvasToolbar is teleported here so its position: absolute coordinates
// match the GrapesJS canvas spot coordinate space exactly.
const spotsEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (canvasRef.value) {
    initEditor(canvasRef.value, props.projectId)
  }
})

watch(ready, (isReady) => {
  if (isReady && editor.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spotsEl.value = (editor.value.Canvas as any).getSpotsEl?.() as HTMLElement ?? null
  }
})

onBeforeUnmount(() => {
  spotsEl.value = null
  destroyEditor()
})
</script>

<template>
  <!-- GrapesJS mounts itself into this div -->
  <div
    v-bind="$attrs"
    ref="canvasRef"
    class="relative h-full overflow-hidden bg-[#090d1a]"
  />

  <!-- Float the canvas toolbar inside the GrapesJS spots overlay -->
  <!-- <Teleport v-if="spotsEl" :to="spotsEl">
    <CanvasToolbar />
  </Teleport> -->
</template>
